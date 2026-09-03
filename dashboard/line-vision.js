/**
 * Aether — control de la sección "Línea de manufactura" (portada,
 * #linea-manufactura). Activa/detiene el stream de visión de línea
 * (GET /line/vision/stream, backend/main.py).
 *
 * Mismo patrón que camera-stream.js (Percepción), en un archivo aparte a
 * propósito, no por descuido: son dos demos independientes que comparten la
 * cámara física de esta máquina pero no el código — si esta sección se
 * convierte más adelante en su propia interfaz de celda de manufactura
 * (interfaz #3 del proyecto), este archivo se puede extraer tal cual sin
 * desenredarlo de la lógica de Percepción. Incluye el mismo reintento con
 * spinner antes de mostrar error real — ver el comentario grande en
 * camera-stream.js sobre por qué abrir la cámara puede tardar.
 *
 * Además de prender/apagar el <img>, refleja el estado real del stream en
 * la tarjeta de la estación "Visión" del flujo (id="line-vision-dot" /
 * "line-vision-status-text") — nunca toca las otras tres estaciones
 * (KUKA/UR5/Aether Inventory): esas siguen fijas en "Pendiente de
 * hardware" en el HTML, porque no hay nada real que animar ahí todavía.
 */

const START_URL = "/line/vision/stream";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

const startBtn = document.getElementById("line-vision-start");
const stopBtn = document.getElementById("line-vision-stop");
const fullscreenBtn = document.getElementById("line-vision-fullscreen");
const placeholderEl = document.getElementById("line-vision-placeholder");
const streamImg = document.getElementById("line-vision-stream");
const label = document.getElementById("line-vision-label");
const placeholderText = document.getElementById("line-vision-placeholder-text");
const loadingEl = document.getElementById("line-vision-loading");
const loadingText = document.getElementById("line-vision-loading-text");
const stationStatus = document.getElementById("line-vision-station-status");
const stationStatusText = document.getElementById("line-vision-status-text");

const DEFAULT_TEXT = 'Presiona "Iniciar visión de línea" para activar la transmisión.';
const ERROR_TEXT =
  "No se pudo conectar con la cámara después de varios intentos. Verifica que backend/main.py esté " +
  "corriendo, que la cámara esté disponible y que no esté en uso por la " +
  "sección Percepción de este mismo dashboard.";

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
  label.textContent = "VISIÓN · CONECTANDO";
  label.classList.remove("camera-label--live");
}

function attemptConnection() {
  showConnecting();
  streamImg.src = `${START_URL}?retry=${retryCount}`;
}

function startStream() {
  streaming = true;
  retryCount = 0;
  streamImg.hidden = true;
  attemptConnection();
  startBtn.hidden = true;
  stopBtn.hidden = false;
  fullscreenBtn.hidden = false;
}

function stopStream({ error = false } = {}) {
  if (!streaming) return; // ya detenido — evita bucles con el listener de error de abajo
  streaming = false;
  clearTimeout(retryTimer);
  if (document.fullscreenElement === placeholderEl) document.exitFullscreen();
  streamImg.removeAttribute("src"); // corta la conexión MJPEG; el backend libera la cámara
  streamImg.hidden = true;
  loadingEl.hidden = true;
  placeholderText.hidden = false;
  placeholderText.textContent = error ? ERROR_TEXT : DEFAULT_TEXT;
  label.textContent = "VISIÓN · SIN SEÑAL";
  label.classList.remove("camera-label--live");
  stationStatus.classList.remove("module-status--active");
  stationStatus.classList.add("module-status--idle");
  stationStatusText.textContent = "Inactiva";
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

streamImg.addEventListener("load", () => {
  if (!streaming) return;
  retryCount = 0;
  loadingEl.hidden = true;
  streamImg.hidden = false;
  label.textContent = "VISIÓN · EN VIVO";
  label.classList.add("camera-label--live");
  stationStatus.classList.remove("module-status--idle");
  stationStatus.classList.add("module-status--active");
  stationStatusText.textContent = "Activa";
});

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
