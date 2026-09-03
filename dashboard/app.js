/**
 * Aether Inventory — dashboard de Declared Inventory (Decisión 7, Opción B),
 * más la única acción de escritura que expone: retirar una entrada
 * (PATCH /inventory/{identifier}/retire, protegido por ADMIN_ACTION_PASSWORD
 * en el backend — ver comentario junto a esa constante en backend/main.py).
 *
 * Sin frameworks ni build tools: fetch() directo a /inventory,
 * /inventory/history y ese PATCH, mismo origen que este archivo (sin CORS).
 * Todos los campos que se muestran vienen tal cual de esas respuestas — no
 * se fabrica ningún dato aquí.
 */

const UNIDENTIFIED_PREFIX = "unidentified:";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatTimestamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dateFormatter.format(date);
}

function formatConfidence(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function isUnidentified(identifier) {
  return identifier.startsWith(UNIDENTIFIED_PREFIX);
}

/** Renderiza location_counts tal cual viene de la API — una etiqueta por
 * clave, sin inventar ordenamiento ni "ubicación más frecuente". La clave
 * "sin_ubicacion" se distingue visualmente (tono neutro) de un marcador
 * ArUco real (tono acero), pero nunca se oculta. Un objeto vacío es un
 * estado real (sin Observations con ubicación registrada), no un error. */
function renderLocationChips(locationCounts) {
  const keys = Object.keys(locationCounts);
  if (keys.length === 0) {
    return '<span class="location-empty">Sin datos de ubicación</span>';
  }
  const chips = keys
    .map((key) => {
      const count = locationCounts[key];
      if (key === "sin_ubicacion") {
        return `<span class="location-chip location-chip--none">Sin ubicación · ${count}</span>`;
      }
      return `<span class="location-chip location-chip--marker">Marcador ${key} · ${count}</span>`;
    })
    .join("");
  return `<div class="location-chips">${chips}</div>`;
}

async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`${path} respondió ${response.status}`);
  }
  return response.json();
}

// Única copia en memoria de lo que devolvió GET /inventory?include_retired=true
// (activos + retirados). El toggle "Mostrar retirados" solo filtra esta
// copia en el cliente — no dispara una llamada nueva por cada click, pero
// el dato sigue viniendo de esa única llamada real, nunca inventado. Se
// vuelve a pedir después de un retiro exitoso, para reflejar el estado real
// del backend en vez de asumir el resultado localmente.
let allEntries = [];

// ---------- resumen (franja de instrumentos) ----------

function renderSummary(entries) {
  const identified = entries.filter((e) => !isUnidentified(e.identifier));
  const unidentified = entries.filter((e) => isUnidentified(e.identifier));
  const totalObservations = entries.reduce((sum, e) => sum + e.total_observations, 0);

  const lastSeenTimestamps = entries.map((e) => new Date(e.last_seen).getTime());
  const lastUpdated = lastSeenTimestamps.length ? Math.max(...lastSeenTimestamps) : null;

  document.getElementById("stat-identified").textContent = identified.length;
  document.getElementById("stat-unidentified").textContent = unidentified.length;
  document.getElementById("stat-total-observations").textContent = totalObservations;
  document.getElementById("stat-last-updated").textContent = lastUpdated
    ? formatTimestamp(new Date(lastUpdated).toISOString())
    : "—";
}

// ---------- tabla de Declared Inventory ----------

/** Celda de acciones: un botón "Retirar" si la entrada sigue activa, o la
 * etiqueta "Retirado" si ya no lo está — nunca un botón para reactivar,
 * porque ese endpoint no existe todavía (no se fabrica una acción que el
 * backend no soporta). */
function renderActionsCell(entry) {
  if (entry.status === "retired") {
    return '<span class="retired-tag">Retirado</span>';
  }
  return `<button type="button" class="btn btn--sm btn--warn retire-btn" data-identifier="${entry.identifier}">Retirar</button>`;
}

function renderInventoryTable(entries) {
  const body = document.getElementById("inventory-body");
  document.getElementById("inventory-count").textContent =
    entries.length === 1 ? "1 producto" : `${entries.length} productos`;

  if (entries.length === 0) {
    body.innerHTML =
      '<tr class="state-row"><td colspan="9">Sin datos cargados todavía — corre backend/scripts/load_from_edge.py.</td></tr>';
    return;
  }

  body.innerHTML = entries
    .map((entry) => {
      const unidentified = isUnidentified(entry.identifier);
      const retired = entry.status === "retired";
      const tag = unidentified ? '<span class="unidentified-tag">sin código</span>' : "";
      const rowClasses = [unidentified ? "is-unidentified" : "", retired ? "is-retired" : ""]
        .filter(Boolean)
        .join(" ");
      return `
        <tr class="${rowClasses}">
          <td class="identifier-cell">${entry.identifier}${tag}</td>
          <td>${entry.detected_class}</td>
          <td class="num">${entry.total_observations}</td>
          <td class="num">${entry.code_read_count}</td>
          <td class="num">${formatConfidence(entry.avg_confidence)}</td>
          <td>${formatTimestamp(entry.first_seen)}</td>
          <td>${formatTimestamp(entry.last_seen)}</td>
          <td class="location-cell">${renderLocationChips(entry.location_counts)}</td>
          <td class="actions-cell">${renderActionsCell(entry)}</td>
        </tr>
      `;
    })
    .join("");
}

// ---------- bitácora de inspecciones ----------

/** Agrupa filas de historial por recorded_at, conservando el orden en que
 * llegan (la API ya las entrega más recientes primero). */
function groupByRecordedAt(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.recorded_at)) groups.set(row.recorded_at, []);
    groups.get(row.recorded_at).push(row);
  }
  return groups;
}

/** Para cada corrida, el mapa identifier -> fila de la corrida anterior
 * (cronológicamente), o undefined si no hay corrida anterior. */
function buildPreviousRunLookup(groups) {
  const chronological = [...groups.keys()].reverse();
  const lookup = new Map();
  let previousMap = null;
  for (const recordedAt of chronological) {
    lookup.set(recordedAt, previousMap);
    previousMap = new Map(groups.get(recordedAt).map((row) => [row.identifier, row]));
  }
  return lookup;
}

function renderDelta(current, previousRun) {
  // previousRun: null si no hay corrida anterior (nada que comparar); Map
  // (identifier -> fila) de la corrida anterior en caso contrario — puede
  // no incluir este identifier si es nuevo en esta corrida.
  if (previousRun === null) return "";

  const previousRow = previousRun.get(current.identifier);
  if (!previousRow) return '<span class="delta delta--new">nuevo</span>';

  const diff = current.total_observations - previousRow.total_observations;
  if (diff === 0) return '<span class="delta delta--flat">sin cambio</span>';
  const sign = diff > 0 ? "+" : "";
  return `<span class="delta delta--changed">${sign}${diff}</span>`;
}

// Qué corridas quedaron expandidas — se necesita para no colapsar todo cada
// vez que el auto-refresh (Decisión 9) vuelve a pedir el historial: sin
// esto, cada poll regresaría siempre a "solo la primera corrida abierta",
// deshaciendo lo que la persona haya expandido a mano. Se llena la primera
// vez que hay datos (la corrida más reciente abierta por default) y luego
// solo la actualiza el propio evento "toggle" de abajo, nunca un re-render.
const expandedHistoryGroups = new Set();
let historyRenderedOnce = false;

document.getElementById("history-list").addEventListener("toggle", (event) => {
  const details = event.target.closest(".history-group");
  if (!details) return;
  const recordedAt = details.dataset.recordedAt;
  if (details.open) {
    expandedHistoryGroups.add(recordedAt);
  } else {
    expandedHistoryGroups.delete(recordedAt);
  }
});

function renderHistory(rows) {
  const container = document.getElementById("history-list");
  const groups = groupByRecordedAt(rows);
  document.getElementById("history-count").textContent =
    groups.size === 1 ? "1 corrida" : `${groups.size} corridas`;

  if (groups.size === 0) {
    container.innerHTML =
      '<p class="state-text">Sin corridas de carga todavía — corre backend/scripts/load_from_edge.py.</p>';
    return;
  }

  const previousRunLookup = buildPreviousRunLookup(groups);

  if (!historyRenderedOnce) {
    // Solo en el primer render real (con datos) se abre la corrida más
    // reciente por default — los renders posteriores respetan lo que la
    // persona haya expandido o cerrado a mano (expandedHistoryGroups).
    expandedHistoryGroups.add([...groups.keys()][0]);
    historyRenderedOnce = true;
  }

  container.innerHTML = [...groups.entries()]
    .map(([recordedAt, groupRows]) => {
      const previousRun = previousRunLookup.get(recordedAt);
      const rowsHtml = groupRows
        .map((row) => {
          const unidentified = isUnidentified(row.identifier);
          return `
            <tr class="${unidentified ? "is-unidentified" : ""}">
              <td class="identifier-cell">${row.identifier}</td>
              <td>${row.detected_class}</td>
              <td class="num">${row.total_observations}${renderDelta(row, previousRun)}</td>
              <td class="num">${row.code_read_count}</td>
              <td class="num">${formatConfidence(row.avg_confidence)}</td>
              <td class="location-cell">${renderLocationChips(row.location_counts)}</td>
            </tr>
          `;
        })
        .join("");

      const openAttr = expandedHistoryGroups.has(recordedAt) ? "open" : "";

      const html = `
        <details class="history-group" ${openAttr} data-recorded-at="${recordedAt}">
          <summary>
            <span class="history-caret" aria-hidden="true"></span>
            <span class="history-summary-time">${formatTimestamp(recordedAt)}</span>
            <span class="history-summary-count">${groupRows.length} registros</span>
          </summary>
          <div class="history-group-body">
            <table class="history-table">
              <thead>
                <tr>
                  <th scope="col">Identificador</th>
                  <th scope="col">Clase</th>
                  <th scope="col" class="num">Observaciones</th>
                  <th scope="col" class="num">Códigos leídos</th>
                  <th scope="col" class="num">Confianza prom.</th>
                  <th scope="col">Ubicaciones</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
        </details>
      `;
      return html;
    })
    .join("");
}

// ---------- retirar producto (PATCH /inventory/{identifier}/retire) ----------

const retireDialog = document.getElementById("retire-dialog");
const retireForm = document.getElementById("retire-form");
const retirePasswordInput = document.getElementById("retire-password");
const retireErrorEl = document.getElementById("retire-error");
const retireIdentifierEl = document.getElementById("retire-dialog-identifier");
const retireConfirmBtn = document.getElementById("retire-confirm");
let pendingRetireIdentifier = null;

function openRetireDialog(identifier) {
  pendingRetireIdentifier = identifier;
  retireIdentifierEl.textContent = identifier;
  retirePasswordInput.value = "";
  retireErrorEl.hidden = true;
  retireErrorEl.textContent = "";
  retireDialog.showModal();
  retirePasswordInput.focus();
}

document.getElementById("inventory-body").addEventListener("click", (event) => {
  const button = event.target.closest(".retire-btn");
  if (!button) return;
  openRetireDialog(button.dataset.identifier);
});

document.getElementById("retire-cancel").addEventListener("click", () => {
  retireDialog.close();
});

retireForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  retireErrorEl.hidden = true;
  retireConfirmBtn.disabled = true;

  try {
    const response = await fetch(
      `/inventory/${encodeURIComponent(pendingRetireIdentifier)}/retire`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: retirePasswordInput.value }),
      },
    );

    if (response.ok) {
      retireDialog.close();
      await loadAll(); // recarga desde el backend — nunca se asume el resultado en el cliente
      return;
    }

    if (response.status === 403) {
      retireErrorEl.textContent = "Contraseña incorrecta. Intenta de nuevo.";
    } else {
      const detail = await response.json().catch(() => null);
      retireErrorEl.textContent = detail?.detail || `No se pudo retirar (error ${response.status}).`;
    }
    retireErrorEl.hidden = false;
    retirePasswordInput.focus();
    retirePasswordInput.select();
  } catch (error) {
    retireErrorEl.textContent = `No se pudo contactar al backend: ${error.message}`;
    retireErrorEl.hidden = false;
  } finally {
    retireConfirmBtn.disabled = false;
  }
});

// ---------- carga inicial ----------

/** Re-renderiza resumen + tabla a partir de allEntries ya cargado en
 * memoria. El resumen siempre se calcula solo con entradas activas —
 * "Mostrar retirados" cambia qué se ve en la tabla, nunca las cifras del
 * resumen, para no mezclar inventario activo con inventario retirado en
 * un mismo número. */
function renderFromCache() {
  const activeEntries = allEntries.filter((entry) => entry.status === "active");
  const showRetired = document.getElementById("show-retired-toggle").checked;
  renderSummary(activeEntries);
  renderInventoryTable(showRetired ? allEntries : activeEntries);

  // Mismo dato que el resumen (entradas activas), mostrado también en el
  // status-pill de la barra de navegación — reutiliza allEntries, no pide
  // nada nuevo a la API.
  const navStatEl = document.getElementById("nav-stat-value");
  if (navStatEl) {
    navStatEl.textContent =
      activeEntries.length === 1 ? "1 activa" : `${activeEntries.length} activas`;
  }
}

document.getElementById("show-retired-toggle").addEventListener("change", renderFromCache);

async function loadAll() {
  try {
    const [inventory, history] = await Promise.all([
      fetchJSON("/inventory?include_retired=true"),
      fetchJSON("/inventory/history"),
    ]);
    allEntries = inventory;
    renderFromCache();
    renderHistory(history);
  } catch (error) {
    const message = `No se pudo cargar el inventario: ${error.message}`;
    document.getElementById("inventory-body").innerHTML =
      `<tr class="state-row"><td colspan="9">${message}</td></tr>`;
    document.getElementById("history-list").innerHTML = `<p class="state-text">${message}</p>`;
    const navStatEl = document.getElementById("nav-stat-value");
    if (navStatEl) navStatEl.textContent = "no disponible";
  }
}

loadAll();

// Polling simple, sin WebSockets (Decisión 9 / ADR 0009 — auto-refresh es
// una versión reducida de la Opción C de la Decisión 7, WebSockets sigue
// fuera de alcance): el propio navegador vuelve a pedir /inventory e
// /inventory/history cada DATA_POLL_MS, reusando loadAll() tal cual. Sigue
// corriendo aunque la captura continua esté apagada — así también se ve un
// refresco manual (backend/scripts/load_from_edge.py corrido a mano) sin
// que la persona tenga que recargar la página.
const DATA_POLL_MS = 8000;
setInterval(loadAll, DATA_POLL_MS);

// ---------- captura continua (auto-refresh de Declared Inventory) ----------

const autoRefreshStartBtn = document.getElementById("auto-refresh-start");
const autoRefreshStopBtn = document.getElementById("auto-refresh-stop");
const autoRefreshStatusEl = document.getElementById("auto-refresh-status");
const autoRefreshStatusText = document.getElementById("auto-refresh-status-text");
const autoRefreshMeta = document.getElementById("auto-refresh-meta");
const STATUS_POLL_MS = 5000;

/** Texto honesto del estado — nunca "tiempo real del piso completo" (ADR
 * 0009): solo dice si esta cámara fija se está recapturando sola o no, y
 * cuándo fue la última corrida real. */
function renderAutoRefreshStatus(status) {
  autoRefreshStatusEl.classList.toggle("module-status--active", status.active);
  autoRefreshStatusEl.classList.toggle("module-status--idle", !status.active);
  autoRefreshStatusText.textContent = status.active
    ? `Activa — cada ${status.interval_seconds}s`
    : "Inactiva";
  autoRefreshStartBtn.hidden = status.active;
  autoRefreshStopBtn.hidden = !status.active;

  const parts = [];
  if (status.last_run_at) {
    const count = status.last_run_observation_count ?? 0;
    parts.push(
      `Última corrida: ${formatTimestamp(status.last_run_at)} · ${count} observaciones`,
    );
  }
  if (status.last_error) {
    parts.push(`Último error: ${status.last_error}`);
  }
  autoRefreshMeta.textContent = parts.join(" — ");
}

async function refreshAutoRefreshStatus() {
  try {
    const status = await fetchJSON("/inventory/auto-refresh/status");
    renderAutoRefreshStatus(status);
  } catch (error) {
    autoRefreshStatusText.textContent = "No disponible";
    autoRefreshMeta.textContent = error.message;
  }
}

autoRefreshStartBtn.addEventListener("click", async () => {
  autoRefreshStartBtn.disabled = true;
  try {
    const response = await fetch("/inventory/auto-refresh/start", { method: "POST" });
    if (response.ok) {
      renderAutoRefreshStatus(await response.json());
      loadAll(); // no espera al próximo poll para reflejar el cambio de estado
    } else {
      const detail = await response.json().catch(() => null);
      autoRefreshMeta.textContent = detail?.detail || `No se pudo iniciar (error ${response.status}).`;
    }
  } catch (error) {
    autoRefreshMeta.textContent = `No se pudo contactar al backend: ${error.message}`;
  } finally {
    autoRefreshStartBtn.disabled = false;
  }
});

autoRefreshStopBtn.addEventListener("click", async () => {
  autoRefreshStopBtn.disabled = true;
  try {
    const response = await fetch("/inventory/auto-refresh/stop", { method: "POST" });
    if (response.ok) {
      renderAutoRefreshStatus(await response.json());
    } else {
      autoRefreshMeta.textContent = `No se pudo detener (error ${response.status}).`;
    }
  } catch (error) {
    autoRefreshMeta.textContent = `No se pudo contactar al backend: ${error.message}`;
  } finally {
    autoRefreshStopBtn.disabled = false;
  }
});

refreshAutoRefreshStatus();
setInterval(refreshAutoRefreshStatus, STATUS_POLL_MS);
