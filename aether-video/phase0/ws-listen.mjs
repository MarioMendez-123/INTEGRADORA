// Escucha /show/ws como lo haría el reproductor y registra cada evento con su hora de llegada.
// Uso: node phase0/ws-listen.mjs <salida.jsonl> [ws://host:8000/show/ws]
import fs from "node:fs";
const [out, url = "ws://127.0.0.1:8000/show/ws"] = process.argv.slice(2);
const ws = new WebSocket(url);
ws.onopen = () => console.log("conectado", url);
ws.onmessage = (m) => fs.appendFileSync(out, JSON.stringify({ receivedAt: Date.now(), ...JSON.parse(m.data) }) + "\n");
ws.onclose = () => process.exit(0);
