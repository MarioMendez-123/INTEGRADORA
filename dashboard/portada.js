/**
 * Aether — portada. Único dato dinámico de esta página: el conteo de
 * Declared Inventory, tomado de una llamada real a GET /inventory (mismo
 * endpoint que consume dashboard/app.js). Si la llamada falla, se dice
 * explícitamente — nunca se deja un número fijo escrito en el HTML.
 */

async function loadInventoryStat() {
  const valueEl = document.getElementById("portada-stat-value");
  try {
    const response = await fetch("/inventory");
    if (!response.ok) {
      throw new Error(`/inventory respondió ${response.status}`);
    }
    const entries = await response.json();
    const count = entries.length;
    valueEl.textContent = count === 1 ? "1 entrada activa" : `${count} entradas activas`;
    valueEl.classList.remove("live-stat-value--error");
  } catch (error) {
    valueEl.textContent = "No disponible — backend no responde";
    valueEl.classList.add("live-stat-value--error");
  }
}

loadInventoryStat();
