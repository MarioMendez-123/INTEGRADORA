"""Celda real: la cámara decide y salen dos pulsos. No inventa piezas.

GPIO 8, relevador del pistón. Solo si el juicio es FAIL.
  Espera LINE_PISTON_ESPERA_S (3 s), lo enciende LINE_PISTON_ON_S (1 s),
  lo apaga y espera LINE_PISTON_REGRESO_S (2 s) a que el pistón vuelva.

GPIO 9, relevador hacia I4 del LOGO. Avanza la banda.
  En PASS sale al terminar el análisis.
  En FAIL sale después de que el pistón ya regresó.
  El LOGO, no este archivo, ignora el infrarrojo 5 s al ver I4.

Los números 8 y 9 son GPIO BCM. Se cambian con LINE_GPIO_PISTON y LINE_GPIO_BANDA.
LINE_RELES_ACTIVO_BAJO=1 para placas de relevadores que encienden con el pin en bajo: el "apagado" del
programa deja el pin en alto y el pulso lo baja. Por defecto (0) el relevador enciende con el pin en alto.
Sin /dev/gpiochip0 los pulsos no se fingen: la pieza queda como pulso no enviado.
"""

from __future__ import annotations

import os
import threading
import time
from datetime import datetime, timezone

ESTABLES = 5
RECIENTES = 8
VISION_VIVA_S = 2.0


def _numero(nombre, defecto):
    return type(defecto)(os.environ.get(nombre, str(defecto)) if not isinstance(defecto, int) else os.environ.get(nombre, str(defecto)))


class Salidas:
    """Dos salidas. abiertas es False cuando no hay chip GPIO."""

    def __init__(self, pin_piston, pin_banda, activo_bajo=False):
        self.pin_piston = pin_piston
        self.pin_banda = pin_banda
        self.activo_bajo = activo_bajo  # placa de relevadores que enciende con el pin en bajo
        self.abiertas = False
        self._req = None
        self._v1 = {}
        self._abrir()

    def _abrir(self):
        try:
            import gpiod
        except ImportError:
            return
        try:
            self._req = gpiod.request_lines(
                "/dev/gpiochip0",
                consumer="celda",
                config={
                    self.pin_piston: gpiod.LineSettings(
                        direction=gpiod.line.Direction.OUTPUT,
                        output_value=gpiod.line.Value.INACTIVE,
                        active_low=self.activo_bajo,
                    ),
                    self.pin_banda: gpiod.LineSettings(
                        direction=gpiod.line.Direction.OUTPUT,
                        output_value=gpiod.line.Value.INACTIVE,
                        active_low=self.activo_bajo,
                    ),
                },
            )
            self.abiertas = True
            return
        except Exception:
            self._req = None
        try:
            chip = gpiod.Chip("/dev/gpiochip0")
            for pin in (self.pin_piston, self.pin_banda):
                linea = chip.get_line(pin)
                flags = gpiod.LINE_REQ_FLAG_ACTIVE_LOW if self.activo_bajo else 0
                linea.request(consumer="celda", type=gpiod.LINE_REQ_DIR_OUT, flags=flags, default_vals=[0])
                self._v1[pin] = linea
            self.abiertas = True
        except Exception:
            self._v1.clear()
            self.abiertas = False

    def poner(self, pin, alto):
        if not self.abiertas:
            return False
        try:
            if self._req is not None:
                import gpiod
                valor = gpiod.line.Value.ACTIVE if alto else gpiod.line.Value.INACTIVE
                self._req.set_value(pin, valor)
            else:
                self._v1[pin].set_value(1 if alto else 0)
            return True
        except Exception:
            self.abiertas = False
            return False

    def apagar(self):
        self.poner(self.pin_piston, False)
        self.poner(self.pin_banda, False)


class CeldaReal:
    def __init__(self, salidas, esperar, espera_piston, piston_encendido, piston_regreso, pulso_banda, estables=ESTABLES):
        self.salidas = salidas
        self._esperar_fn = esperar
        self.espera_piston = espera_piston
        self.piston_encendido = piston_encendido
        self.piston_regreso = piston_regreso
        self.pulso_banda = pulso_banda
        self.estables = estables
        self._lock = threading.Lock()
        self._abort = threading.Event()
        self._running = True
        self._armed = True
        self._busy = False
        self._ultimo = None
        self._racha = 0
        self._fase = None
        self._visto = None
        self._n = 0
        self._pass = 0
        self._fail = 0
        self._recent = []
        self.en_hilo = True

    def set_running(self, on):
        with self._lock:
            self._running = on
            if not on:
                self._abort.set()
                self._fase = None
                self.salidas.apagar()

    def ver(self, juicio):
        """juicio: PASS, FAIL o SIN_PIEZA. Una pieza dispara una sola vez."""
        lanzar = None
        with self._lock:
            self._visto = time.monotonic()
            if juicio == self._ultimo:
                self._racha += 1
            else:
                self._ultimo = juicio
                self._racha = 1
            if self._busy or not self._running or self._racha < self.estables:
                return
            if juicio == "SIN_PIEZA":
                self._armed = True
                return
            if juicio in ("PASS", "FAIL") and self._armed:
                self._armed = False
                self._busy = True
                self._abort.clear()
                lanzar = juicio
        if lanzar:
            if self.en_hilo:
                threading.Thread(target=self._correr, args=(lanzar,), daemon=True).start()
            else:
                self._correr(lanzar)

    def correr_ya(self, juicio):
        """La misma secuencia, en este hilo. La usan las pruebas."""
        with self._lock:
            self._abort.clear()
            self._busy = True
        self._correr(juicio)

    def _esperar(self, segundos):
        return self._esperar_fn(segundos, self._abort)

    def _fase_a(self, texto):
        with self._lock:
            if not self._abort.is_set():
                self._fase = texto

    def _correr(self, juicio):
        accion = "pulso_no_enviado"
        try:
            if juicio == "FAIL":
                self._fase_a("Espera del pistón")
                if not self._esperar(self.espera_piston):
                    return
                self._fase_a("Pistón activo")
                if not self.salidas.poner(self.salidas.pin_piston, True):
                    accion = "fallo_actuacion"
                    return
                if not self._esperar(self.piston_encendido):
                    accion = "fallo_actuacion"
                    return
                self.salidas.poner(self.salidas.pin_piston, False)
                self._fase_a("Pistón regresando")
                if not self._esperar(self.piston_regreso):
                    accion = "fallo_actuacion"
                    return
            self._fase_a("Avance de banda")
            if not self.salidas.poner(self.salidas.pin_banda, True):
                accion = "fallo_actuacion" if juicio == "FAIL" else "pulso_no_enviado"
                return
            if not self._esperar(self.pulso_banda):
                accion = "fallo_actuacion" if juicio == "FAIL" else "pulso_no_enviado"
                return
            self.salidas.poner(self.salidas.pin_banda, False)
            accion = "scrap_expulsado" if juicio == "FAIL" else "pieza_aceptada"
        finally:
            self.salidas.apagar()
            with self._lock:
                self._fase = None
                self._busy = False
                cancelado = self._abort.is_set()
                if cancelado:
                    self._armed = True
                    self._abort.clear()
                else:
                    self._anotar(juicio, accion)

    def _anotar(self, juicio, accion):
        self._n += 1
        if accion == "pieza_aceptada":
            self._pass += 1
        elif juicio == "FAIL":
            self._fail += 1
        self._recent.insert(0, {
            "pieza": self._n,
            "resultado": juicio,
            "accion": accion,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        del self._recent[RECIENTES:]

    def snapshot(self):
        with self._lock:
            ahora = time.monotonic()
            vision = self._visto is not None and (ahora - self._visto) < VISION_VIVA_S
            if not self._running:
                state, reason = "DETENIDA", "Paro solicitado por el operador"
            elif not vision:
                state, reason = "DETENIDA", "Cámara apagada"
            else:
                state, reason = "OPERANDO", self._fase or "Esperando pieza"
            return {
                "source": "celda",
                "running": self._running,
                "state": state,
                "reason": reason,
                "sources": {"vision_linea": vision, "plc": self.salidas.abiertas},
                "counts": {"inspected": self._n, "pass": self._pass, "fail": self._fail},
                "recent": [dict(ev) for ev in self._recent],
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }


def _esperar_real(segundos, abort):
    fin = time.monotonic() + segundos
    while True:
        if abort.is_set():
            return False
        falta = fin - time.monotonic()
        if falta <= 0:
            return True
        time.sleep(min(0.05, falta))


def celda_desde_entorno():
    pin_piston = int(os.environ.get("LINE_GPIO_PISTON", "8"))
    pin_banda = int(os.environ.get("LINE_GPIO_BANDA", "9"))
    return CeldaReal(
        salidas=Salidas(pin_piston, pin_banda, os.environ.get("LINE_RELES_ACTIVO_BAJO", "0").strip().lower() in ("1", "true", "yes", "on")),
        esperar=_esperar_real,
        espera_piston=float(os.environ.get("LINE_PISTON_ESPERA_S", "3")),
        piston_encendido=float(os.environ.get("LINE_PISTON_ON_S", "1")),
        piston_regreso=float(os.environ.get("LINE_PISTON_REGRESO_S", "2")),
        pulso_banda=float(os.environ.get("LINE_BANDA_ON_S", "0.5")),
        estables=int(os.environ.get("LINE_ESTABLES", ESTABLES)),
    )


celda = celda_desde_entorno()
