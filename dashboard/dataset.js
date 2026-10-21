/**
 * Página del dataset de piezas — GET /dataset y POST /dataset/classes.
 * Vuelve a consultar cada pocos segundos para que una foto nueva aparezca
 * sin recargar.
 */

const POLL_MS = 4000;

const piecesBody = document.getElementById("pieces-body");
const recentBody = document.getElementById("recent-body");
const addForm = document.getElementById("add-form");
const addError = document.getElementById("add-error");
const addSubmit = document.getElementById("add-submit");
const classNameInput = document.getElementById("class-name");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatWhen(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

function formatMap(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(value).toFixed(3);
}

function setStat(id, value) {
  const el = document.getElementById(id);
  el.classList.remove("skeleton");
  el.textContent = String(value);
}

function render(data) {
  const totals = data.totals;
  setStat("stat-pieces", totals.pieces);
  setStat("stat-images", totals.images);
  setStat("stat-labeled", totals.labeled);
  setStat("stat-unlabeled", totals.unlabeled);

  const navStat = document.getElementById("nav-stat-value");
  navStat.classList.remove("skeleton");
  navStat.textContent = totals.images === 1 ? "1 foto" : `${totals.images} fotos`;

  const model = data.model;
  const map50 = formatMap(model.map50);
  const trained = model.trained_at ? ` · entrenado ${formatWhen(model.trained_at)}` : "";
  document.getElementById("model-meta").textContent = map50
    ? `${model.active} · mAP50 ${map50}${trained}`
    : model.active;

  document.getElementById("pieces-meta").textContent =
    totals.pieces === 1 ? "1 pieza" : `${totals.pieces} piezas`;
  fillClassSelect(data.classes);

  if (!data.classes.length) {
    piecesBody.innerHTML =
      `<tr class="state-row"><td colspan="6">Todavía no hay piezas. Añade un nombre para empezar.</td></tr>`;
  } else {
    piecesBody.innerHTML = data.classes
      .map((row) => {
        const pct = Math.round(row.share * 100);
        const note = row.registered ? "" : " · sin registrar en classes.txt";
        return `<tr>
          <td class="identifier-cell">${escapeHtml(row.name)}${note}</td>
          <td class="num">${row.train}</td>
          <td class="num">${row.val}</td>
          <td class="num">${row.total}</td>
          <td class="share-cell">
            <div class="share-bar" style="--share: ${pct}%"><span></span></div>
            <span class="share-pct">${pct}%</span>
          </td>
          <td>${formatWhen(row.last_added)}</td>
        </tr>`;
      })
      .join("");
  }

  document.getElementById("recent-meta").textContent = data.recent.length
    ? `${data.recent.length} recientes`
    : "";

  if (!data.recent.length) {
    recentBody.innerHTML =
      `<tr class="state-row"><td colspan="4">Todavía no hay fotos en el dataset.</td></tr>`;
  } else {
    recentBody.innerHTML = data.recent
      .map(
        (row) => `<tr>
          <td>${formatWhen(row.added_at)}</td>
          <td class="identifier-cell">${escapeHtml(row.file)}</td>
          <td>${row.piece ? escapeHtml(row.piece) : "sin etiqueta"}</td>
          <td>${row.split}</td>
        </tr>`,
      )
      .join("");
  }
}

function showLoadError(message) {
  piecesBody.innerHTML = `<tr class="state-row"><td colspan="6">${message}</td></tr>`;
  recentBody.innerHTML = `<tr class="state-row"><td colspan="4">${message}</td></tr>`;
  document.getElementById("nav-stat-value").textContent = "no disponible";
  document.querySelectorAll(".skeleton").forEach((el) => el.classList.remove("skeleton"));
}

async function loadDataset() {
  const response = await fetch("/dataset", { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  render(await response.json());
}

async function refresh() {
  try {
    await loadDataset();
  } catch (error) {
    showLoadError(`No se pudo leer el dataset: ${error.message}`);
  }
}

addForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  addError.hidden = true;
  addSubmit.disabled = true;
  try {
    const response = await fetch("/dataset/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: classNameInput.value }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      addError.textContent = body.detail || `No se pudo añadir (${response.status})`;
      addError.hidden = false;
      return;
    }
    classNameInput.value = "";
    render(body);
  } catch (error) {
    addError.textContent = `No se pudo añadir la pieza: ${error.message}`;
    addError.hidden = false;
  } finally {
    addSubmit.disabled = false;
  }
});

const classSelect = document.getElementById("box-class");
const photoFile = document.getElementById("photo-file");
const cameraGrab = document.getElementById("camera-grab");
const saveSample = document.getElementById("save-sample");
const captureError = document.getElementById("capture-error");
const stage = document.getElementById("annotate-stage");
const annotateCanvas = document.getElementById("annotate-canvas");
const boxCount = document.getElementById("box-count");
const annotateCtx = annotateCanvas.getContext("2d");
const zoomBar = document.getElementById("annotate-zoom");
const zoomLabel = document.getElementById("zoom-label");
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;

let sourceImage = null;
let imageBase64 = "";
let boxes = [];
let drag = null;
let zoom = 1;

function fillClassSelect(classes) {
  const current = classSelect.value;
  const names = classes.filter((row) => row.registered).map((row) => row.name);
  classSelect.innerHTML = names
    .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join("");
  if (names.includes(current)) classSelect.value = current;
  saveSample.disabled = !sourceImage || !names.length || !boxes.length;
}

function showCaptureError(message) {
  captureError.hidden = !message;
  captureError.textContent = message || "";
}

function fitScale() {
  const available = stage.clientWidth || 720;
  if (!sourceImage || !sourceImage.naturalWidth) return 1;
  return Math.min(1, available / sourceImage.naturalWidth);
}

function applyZoom() {
  if (!sourceImage) return;
  const width = Math.max(80, Math.round(sourceImage.naturalWidth * fitScale() * zoom));
  annotateCanvas.style.width = `${width}px`;
  zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
}

function setZoom(next) {
  zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
  applyZoom();
}

function pointerNorm(event) {
  const rect = annotateCanvas.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  return { x, y };
}

function redraw() {
  if (!sourceImage) return;
  annotateCtx.clearRect(0, 0, annotateCanvas.width, annotateCanvas.height);
  annotateCtx.drawImage(sourceImage, 0, 0);
  annotateCtx.lineWidth = Math.max(2, annotateCanvas.width / 400);
  annotateCtx.strokeStyle = "#7cffb2";
  annotateCtx.fillStyle = "rgba(124, 255, 178, 0.15)";
  const paint = (box) => {
    const left = (box.x - box.w / 2) * annotateCanvas.width;
    const top = (box.y - box.h / 2) * annotateCanvas.height;
    annotateCtx.fillRect(left, top, box.w * annotateCanvas.width, box.h * annotateCanvas.height);
    annotateCtx.strokeRect(left, top, box.w * annotateCanvas.width, box.h * annotateCanvas.height);
  };
  boxes.forEach(paint);
  if (drag) paint(drag);
}

function loadImage(src, base64) {
  const image = new Image();
  image.onload = () => {
    sourceImage = image;
    imageBase64 = base64;
    boxes = [];
    drag = null;
    annotateCanvas.width = image.naturalWidth;
    annotateCanvas.height = image.naturalHeight;
    zoom = 1;
    stage.hidden = false;
    zoomBar.hidden = false;
    saveSample.disabled = true;
    requestAnimationFrame(applyZoom);
    boxCount.textContent = "Arrastra sobre la pieza para marcarla.";
    showCaptureError("");
    redraw();
  };
  image.onerror = () => showCaptureError("no se pudo abrir esa foto");
  image.src = src;
}

photoFile.addEventListener("change", () => {
  const file = photoFile.files && photoFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => loadImage(reader.result, String(reader.result).split(",")[1]);
  reader.readAsDataURL(file);
});

cameraGrab.addEventListener("click", async () => {
  showCaptureError("");
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement("video");
    video.srcObject = stream;
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });
    await video.play();
    const grab = document.createElement("canvas");
    grab.width = video.videoWidth;
    grab.height = video.videoHeight;
    grab.getContext("2d").drawImage(video, 0, 0);
    loadImage(grab.toDataURL("image/jpeg", 0.92), grab.toDataURL("image/jpeg", 0.92).split(",")[1]);
  } catch (error) {
    showCaptureError(`No se pudo usar la cámara: ${error.message}`);
  } finally {
    if (stream) stream.getTracks().forEach((track) => track.stop());
  }
});

document.getElementById("zoom-out").addEventListener("click", () => setZoom(zoom / 1.25));
document.getElementById("zoom-in").addEventListener("click", () => setZoom(zoom * 1.25));
document.getElementById("zoom-fit").addEventListener("click", () => setZoom(1));

stage.addEventListener(
  "wheel",
  (event) => {
    if (!sourceImage) return;
    event.preventDefault();
    setZoom(zoom * (event.deltaY < 0 ? 1.15 : 1 / 1.15));
  },
  { passive: false },
);

annotateCanvas.addEventListener("pointerdown", (event) => {
  if (!sourceImage || !classSelect.value) return;
  try {
    annotateCanvas.setPointerCapture(event.pointerId);
  } catch {
    /* el arrastre sigue aunque el navegador no entregue el puntero */
  }
  const start = pointerNorm(event);
  drag = { name: classSelect.value, x: start.x, y: start.y, w: 0, h: 0, x1: start.x, y1: start.y };
});

annotateCanvas.addEventListener("pointermove", (event) => {
  if (!drag) return;
  const point = pointerNorm(event);
  const x1 = Math.min(drag.x1, point.x);
  const y1 = Math.min(drag.y1, point.y);
  const w = Math.abs(point.x - drag.x1);
  const h = Math.abs(point.y - drag.y1);
  drag.x = x1 + w / 2;
  drag.y = y1 + h / 2;
  drag.w = w;
  drag.h = h;
  redraw();
});

annotateCanvas.addEventListener("pointerup", () => {
  if (!drag) return;
  if (drag.w > 0.01 && drag.h > 0.01) {
    boxes.push({ name: drag.name, x: drag.x, y: drag.y, w: drag.w, h: drag.h });
  }
  drag = null;
  boxCount.textContent = boxes.length === 1 ? "1 caja" : `${boxes.length} cajas`;
  saveSample.disabled = boxes.length === 0 || !classSelect.value;
  redraw();
});

saveSample.addEventListener("click", async () => {
  showCaptureError("");
  saveSample.disabled = true;
  try {
    const response = await fetch("/dataset/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: imageBase64, boxes }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      showCaptureError(body.detail || `No se pudo guardar (${response.status})`);
      saveSample.disabled = false;
      return;
    }
    sourceImage = null;
    imageBase64 = "";
    boxes = [];
    zoom = 1;
    stage.hidden = true;
    zoomBar.hidden = true;
    photoFile.value = "";
    boxCount.textContent = body.saved
      ? `Guardada en ${body.saved.split}.`
      : "Guardada.";
    render(body);
  } catch (error) {
    showCaptureError(`No se pudo guardar: ${error.message}`);
    saveSample.disabled = false;
  }
});

const firstLoad = refresh();
window.AetherLoader?.track(firstLoad);
setInterval(refresh, POLL_MS);
