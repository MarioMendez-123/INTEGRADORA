"""Publicador compartido de un stream de cámara — infraestructura genérica,
sin acoplarse a YOLO, pyzbar ni a ninguna lógica de detección: solo resuelve
"una cámara física, muchos clientes HTTP, sin volver a abrir el dispositivo
por cada uno".

Ver backend/main.py (GET /perception/stream, GET /line/vision/stream) para
el porqué existe: antes, cada conexión HTTP a un stream de demo abría su
propio cv2.VideoCapture — si dos clientes se conectaban al mismo stream a
la vez (dos pestañas, o el dashboard más una futura interfaz del robot
móvil), competían por el mismo dispositivo físico.

Vive en su propio módulo, separado de main.py, a propósito: main.py importa
db.database al cargarse (conexión real a backend/aether.db), y cualquier
prueba que necesite importar algo de main.py arrastra esa conexión con él.
tests/backend/test_main.py depende de parchar esa base ANTES de que algo
más importe main.py por primera vez (ver su propio docstring) — si
CameraPublisher viviera ahí también, tests/backend/test_camera_publisher.py
solo necesitaría un doble de prueba para cv2, pero importar `main` de todos
modos arriesgaría ganarle la carrera al parche de test_main.py y contaminar
sus pruebas con la base de datos real. Separarlo evita el problema de raíz
en vez de depender del orden en que pytest recolecte los archivos.
"""

import logging
import threading

logger = logging.getLogger(__name__)


class CameraPublisher:
    """Publicador compartido de un stream de cámara — una cámara física,
    muchos clientes HTTP, sin volver a abrir el dispositivo por cada uno.

    subscribe() suma un cliente y arranca la cámara si es el primero (lanza
    RuntimeError si no abre, con un mensaje listo para el 503 del
    endpoint). unsubscribe() resta un cliente y apaga la cámara si era el
    último — nunca se queda corriendo sin que nadie esté viendo nada.

    make_processor se llama UNA vez, perezosamente, al arrancar (no en cada
    frame ni al construir el publicador): ahí es donde cada uso concreto
    (Percepción, Visión de línea) hace sus imports pesados propios (cv2,
    ultralytics, pyzbar) y arma su lógica de dibujo, sin que este módulo
    genérico tenga que conocerlos.
    """

    def __init__(self, camera_index: int, make_processor, label: str):
        self._camera_index = camera_index
        self._make_processor = make_processor
        self._label = label

        self._lock = threading.Lock()
        self._condition = threading.Condition(self._lock)
        self._subscriber_count = 0
        self._latest_jpeg: bytes | None = None
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None

    def subscribe(self) -> None:
        with self._lock:
            if self._subscriber_count == 0:
                self._start_locked()
            self._subscriber_count += 1

    def unsubscribe(self) -> None:
        # thread.join() NUNCA debe llamarse mientras se sostiene self._lock:
        # el hilo en segundo plano necesita ese mismo lock (vía
        # self._condition, dentro de _run) para notar self._stop_event y
        # salir de su bucle — sostenerlo durante el join() era un deadlock
        # real (el hilo nunca podía avanzar, el join nunca regresaba hasta
        # su propio timeout). Por eso el lock se suelta ANTES de esperar.
        thread_to_join = None
        with self._lock:
            self._subscriber_count = max(0, self._subscriber_count - 1)
            if self._subscriber_count == 0:
                self._stop_event.set()
                thread_to_join = self._thread
                self._thread = None
                self._latest_jpeg = None

        if thread_to_join is None:
            return

        # Starlette puede cerrar el generador de un cliente desconectado
        # durante recolección de basura en vez de en el hilo que atendía la
        # petición — y CPython permite que un ciclo de GC corra en
        # CUALQUIER hilo que tenga el GIL en ese momento, incluido el
        # propio hilo del publicador. Si ocurre justo ahí, unsubscribe()
        # terminaría pidiéndole a ese hilo que se una a sí mismo
        # (RuntimeError: cannot join current thread) — visto de verdad
        # probando esto con la cámara real. join() solo tiene sentido
        # llamado desde OTRO hilo; si ya estamos en el hilo del
        # publicador, ese hilo va a salir solo en cuanto note
        # self._stop_event, no hace falta ni se puede esperarlo aquí.
        if thread_to_join is threading.current_thread():
            logger.info(
                "Publicador '%s': deteniéndose desde su propio hilo (sin join).", self._label
            )
            return

        thread_to_join.join(timeout=5)
        logger.info("Publicador '%s' detenido — cámara liberada.", self._label)

    def stream_frames(self):
        """Generador MJPEG para UN cliente ya suscrito — solo lee el frame
        más reciente desde memoria, nunca vuelve a tocar la cámara física."""
        last_sent = None
        while True:
            with self._condition:
                self._condition.wait(timeout=1.0)
                jpeg = self._latest_jpeg
                thread_alive = self._thread is not None and self._thread.is_alive()
            if not thread_alive:
                logger.warning("Publicador '%s': se detuvo; cerrando este stream.", self._label)
                break
            if jpeg is None or jpeg is last_sent:
                continue
            last_sent = jpeg
            yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg + b"\r\n")

    def _start_locked(self) -> None:
        import cv2

        cap = cv2.VideoCapture(self._camera_index)
        if not cap.isOpened():
            cap.release()
            raise RuntimeError(
                f"No se pudo abrir la cámara (índice {self._camera_index}). "
                "Verifica que esté conectada y no esté en uso por otra aplicación."
            )

        processor = self._make_processor()  # imports pesados propios, una sola vez
        self._stop_event.clear()
        self._latest_jpeg = None
        self._thread = threading.Thread(
            target=self._run,
            args=(cap, processor),
            name=f"camera-publisher-{self._label}",
            daemon=True,
        )
        self._thread.start()
        logger.info("Publicador '%s' iniciado (índice %d).", self._label, self._camera_index)

    def _run(self, cap, processor) -> None:
        import cv2

        try:
            while not self._stop_event.is_set():
                ret, frame = cap.read()
                if not ret:
                    logger.warning(
                        "Publicador '%s': no se pudo leer un frame; cerrando.", self._label
                    )
                    break

                processor(frame)  # anota el frame in-place (cajas, texto, etc.)

                ok, buffer = cv2.imencode(".jpg", frame)
                if not ok:
                    continue

                with self._condition:
                    self._latest_jpeg = buffer.tobytes()
                    self._condition.notify_all()
        finally:
            cap.release()
