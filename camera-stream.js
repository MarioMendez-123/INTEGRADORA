/**
 * Aether — control de la sección "Vista en vivo" (portada, #percepcion).
 * Modo demo de escritorio: activa/detiene un <img> apuntando a
 * GET /perception/stream (backend/main.py) — nunca carga automáticamente,
 * requiere un clic explícito, para no abrir la cámara de la máquina sin
 * que la persona lo pida.
 *
 * Abrir la cámara del lado del backend (cv2.VideoCapture) puede tardar
 * varios segundos — sobre todo justo después de conectar el dispositivo
 * físico, mientras Windows todavía le asigna el driver — y un solo intento
 * fallido no distingue "no hay cámara" de "todavía está inicializando".
 * Por eso, antes de mostrar el error real, se reintenta MAX_RETRIES veces
 * con una pausa corta entre cada uno, mostrando siempre un estado de
 * "Estableciendo conexión…" (spinner) en vez de saltar directo al mensaje
 * de error en el primer fallo.
 */

const START_URL = "/perception/stream";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

const startBtn = document.getElementById("camera-start");
const stopBtn = document.getElementById("camera-stop");
const fullscreenBtn = document.getElementById("camera-fullscreen");
const placeholderEl = document.getElementById("camera-placeholder");
const streamImg = document.getElementById("camera-stream");
const label = document.getElementById("camera-label");
const placeholderText = document.getElementById("camera-placeholder-text");
const loadingEl = document.getElementById("camera-loading");
const loadingText = document.getElementById("camera-loading-text");

const DEFAULT_TEXT = 'Presiona "Iniciar cámara" para activar la transmisión en vivo.';
const ERROR_TEXT =
  "No se pudo conectar con la cámara después de varios intentos. Verifica que backend/main.py esté corriendo y que la cámara esté disponible (no en uso por otra aplicación).";

let streaming = false;
let retryCount = 0;
let retryTimer = null;

function showConnecting() {
  placeholderText.hidden = true;
  loadingEl.hidden = false;
  loadingText.textContent =
    retryCount === 0
      ? "Estableciendo conexión…"
      : `Estableciendo conexión… (reintento ${retryCount} de ${MAX_RETRIES})`;
  label.textContent = "CAM_01 · CONECTANDO";
  label.classList.remove("camera-label--live");
}

function attemptConnection() {
  showConnecting();
  // Cache-bust: sin esto el navegador podría reusar la petición ya
  // fallida en vez de abrir una conexión nueva en cada reintento.
  streamImg.src = `${START_URL}?retry=${retryCount}`;
}

function startStream() {
  streaming = true;
  retryCount = 0;
  streamImg.hidden = true; // se revela hasta que llegue el primer frame real ("load")
  attemptConnection();
  startBtn.hidden = true;
  stopBtn.hidden = false;
  fullscreenBtn.hidden = false;
}

function stopStream({ error = false } = {}) {
  if (!streaming) return; // ya detenido — evita bucles con el listener de error de abajo
  streaming = false;
  clearTimeout(retryTimer);
  // Salir de pantalla completa si seguía activa: al detener el stream no
  // queda video real que mostrar, dejar el fullscreen encendido solo
  // congelaría el último frame o dejaría la pantalla en negro.
  if (document.fullscreenElement === placeholderEl) document.exitFullscreen();
  // removeAttribute, no src = "": corta la conexión del stream MJPEG desde
  // el navegador (el generador en backend/main.py libera la cámara al
  // detectar el corte) sin volver a disparar un evento "error" espurio.
  streamImg.removeAttribute("src");
  streamImg.hidden = true;
  loadingEl.hidden = true;
  placeholderText.hidden = false;
  placeholderText.textContent = error ? ERROR_TEXT : DEFAULT_TEXT;
  label.textContent = "CAM_01 · SIN SEÑAL";
  label.classList.remove("camera-label--live");
  startBtn.hidden = false;
  stopBtn.hidden = true;
  fullscreenBtn.hidden = true;
}

function toggleFullscreen() {
  if (document.fullscreenElement === placeholderEl) {
    document.exitFullscreen();
  } else {
    placeholderEl.requestFullscreen();
  }
}

document.addEventListener("fullscreenchange", () => {
  fullscreenBtn.textContent =
    document.fullscreenElement === placeholderEl ? "Salir de pantalla completa" : "Pantalla completa";
});

// Primer frame real recibido: la transmisión sí quedó viva. Reinicia el
// contador de reintentos para que un corte posterior a mitad de stream
// (no solo el arranque) también tenga su propia ventana de reintento.
streamImg.addEventListener("load", () => {
  if (!streaming) return;
  retryCount = 0;
  loadingEl.hidden = true;
  streamImg.hidden = false;
  label.textContent = "CAM_01 · EN VIVO";
  label.classList.add("camera-label--live");
});

// El navegador dispara "error" en el <img> tanto si el backend respondió
// 503 (cámara no disponible todavía) como si el stream se corta a medias.
// En vez de darlo por fallido de inmediato, reintenta hasta MAX_RETRIES
// veces — abrir la cámara del lado del backend puede tardar.
streamImg.addEventListener("error", () => {
  if (!streaming) return;
  if (retryCount < MAX_RETRIES) {
    retryCount += 1;
    showConnecting();
    retryTimer = setTimeout(attemptConnection, RETRY_DELAY_MS);
    return;
  }
  stopStream({ error: true });
});

startBtn.addEventListener("click", startStream);
stopBtn.addEventListener("click", () => stopStream());
fullscreenBtn.addEventListener("click", toggleFullscreen);
