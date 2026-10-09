/**
 * Aether — portada. Único dato dinámico de esta página: el conteo de
 * Declared Inventory, tomado de una llamada real a GET /inventory (mismo
 * endpoint que consume dashboard/app.js). Si la llamada falla, se dice
 * explícitamente — nunca se deja un número fijo escrito en el HTML.
 *
 * La llamada cuenta como tarea del loader global (AetherLoader.track): el
 * anillo no se completa hasta que este dato llega o falla. Si tarda más que
 * el tope del loader, el valor se ve como skeleton hasta que llegue.
 */

async function loadInventoryStat() {
  const valueEl = document.getElementById("portada-stat-value");
  const format = (n) => (n === 1 ? "1 entrada activa" : `${n} entradas activas`);
  try {
    const response = await fetch("/inventory");
    if (!response.ok) {
      throw new Error(`/inventory respondió ${response.status}`);
    }
    const entries = await response.json();
    valueEl.classList.remove("skeleton", "live-stat-value--error");
    // Escrito directo, sin contador: este tile está varias pantallas abajo
    // y la animación terminaría antes de que alguien llegue a verla.
    valueEl.textContent = format(entries.length);
  } catch (error) {
    valueEl.classList.remove("skeleton");
    valueEl.textContent = "No disponible — backend no responde";
    valueEl.classList.add("live-stat-value--error");
  }
}

const statLoad = loadInventoryStat();
window.AetherLoader?.track(statLoad);
