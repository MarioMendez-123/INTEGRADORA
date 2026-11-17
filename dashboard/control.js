// Control remoto de la presentación desde el teléfono: manda teclas por /show/ws (backend/main.py las reenvía)
// y robot.js las aplica como si fueran la flecha del clicker. Solo teclas fijas: no ejecuta nada del teléfono.
const dot = document.getElementById("dot");
const st = document.getElementById("st");
const msg = document.getElementById("msg");
let ws = null;

function connect() {
  ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/show/ws`);
  ws.onopen = () => { dot.classList.add("on"); st.textContent = "conectado a la laptop"; };
  ws.onclose = () => { dot.classList.remove("on"); st.textContent = "reconectando…"; setTimeout(connect, 1500); };
}
connect();

function send(payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) { msg.textContent = "sin conexión con la laptop"; return; }
  ws.send(JSON.stringify({ from: "remote", sentAt: Date.now(), ...payload }));
  msg.textContent = payload.type === "wake" ? "Lumina: despertar" : `enviado: ${payload.key}`;
  navigator.vibrate?.(25);
}

document.querySelectorAll("[data-key]").forEach((b) => b.addEventListener("click", () => send({ type: "key", key: b.dataset.key })));
document.querySelector("[data-wake]").addEventListener("click", () => send({ type: "wake" }));
