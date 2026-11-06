// Prueba de punta a punta de la presentación local, sin internet en el navegador:
// pantalla negra -> video -> Lumina -> comandos (por voz o con la flecha) -> diapositivas -> regreso a Lumina.
// Uso: node intro/scripts/e2e_show.mjs <puerto> <carpeta capturas> <es|en> <voz|flecha>
// OJO: el modo "voz" simula el servicio de voz por /voice/ws y desconecta al real mientras corre.
import { chromium } from "playwright-core";
const [PORT = "8000", OUT = ".", LANG = "es", MODO = "voz"] = process.argv.slice(2);
const base = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FRASES = {
  es: ["hola a todos gracias por venir", "hola lumina cómo estás", "lumina enséñanos quién eres", "lumina muéstranos tu interior"],
  en: ["hello everybody thanks for coming", "hello lumina how are you", "lumina show us who you are", "lumina show us your interior"],
}[LANG];
const external = [], errs = [];
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: false, args: ["--mute-audio", "--window-size=1920,1080"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.route("**/*", (r) => { const u = r.request().url(); if (u.startsWith(base) || u.startsWith("blob:") || u.startsWith("data:")) return r.continue(); external.push(u); return r.abort(); });
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 140)); });
page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
let voz = null;
if (MODO === "voz") {
  voz = new WebSocket(`ws://127.0.0.1:${PORT}/voice/ws?role=service`);
  await new Promise((r) => (voz.onopen = r));
  voz.send(JSON.stringify({ v: 1, type: "status", state: "active", t: new Date().toISOString() }));
}
const decir = (t) => voz.send(JSON.stringify({ v: 1, type: "transcript", text: t, t: new Date().toISOString() }));
const st = () => page.evaluate(() => ({ oye: voiceAvailable, voz: selectedVoice?.name, mode, sub: conversationSubState, intro: introRunning, paso: introStep, holo: document.getElementById("holo-frame").classList.contains("holo-frame--on"), slides: document.getElementById("slides-frame").classList.contains("holo-frame--on"), cap: document.querySelector("[id*=caption]")?.textContent?.trim().slice(0, 60) }));
const shot = (n) => page.screenshot({ path: `${OUT}/e2e_${LANG}_${n}.png` });
const musica = () => page.frames().find((x) => x.url().includes("slides.html")).evaluate(() => ({ paused: music.paused, t: +music.currentTime.toFixed(1), vol: +music.volume.toFixed(2) }));
const hasta = async (fn, ms, name) => { const t = Date.now(); while (Date.now() - t < ms) { if (await fn()) return true; await sleep(150); } console.log("TIMEOUT", name); return false; };
const libre = () => hasta(async () => (await st()).sub === "listening", 15000, "listening");

await page.goto(`${base}/robot.html?intro=1&voz=servicio&lang=${LANG}`);
await sleep(1500);
await shot("1_negro");
await page.keyboard.press("ArrowRight");
await sleep(2000);
console.log("video", await page.evaluate(() => { const v = document.getElementById("intro-video"); return { paused: v.paused, controls: v.controls, fs: !!document.fullscreenElement }; }));
await page.evaluate(() => { const v = document.getElementById("intro-video"); v.currentTime = v.duration - 1; });
await hasta(() => page.evaluate(() => document.getElementById("intro-video").ended), 6000, "ended");
await sleep(1600); await shot("2_saludo");
console.log("saludo", await st());
await hasta(async () => !(await st()).intro, 15000, "fin saludo");

const paso = async (i, nombre) => {
  if (MODO === "voz") decir(FRASES[i]); else await page.keyboard.press("ArrowRight");
  await sleep(1200);
  console.log(nombre, await st());
  await sleep(2500); await shot(nombre);
  await libre();
};
if (MODO === "voz") { decir(FRASES[0]); await sleep(1200); console.log("ruido del público: paso", (await st()).paso); }
await paso(1, "3_comoestas");
await paso(2, "4_armada");
await paso(3, "5_interior");
await page.keyboard.press("ArrowRight");
await sleep(1500);
console.log("flecha a diapositivas", await st());
await shot("6_slides");
await sleep(3000);
console.log("música al entrar a las diapositivas", await musica());
const frame = page.frameLocator("#slides-frame");
const total = Number((await frame.locator(".foot span").last().innerText()).split("/")[1]);
for (let i = 1; i < total; i++) await page.keyboard.press("ArrowRight");
await sleep(600);
console.log("última lámina:", await frame.locator(".foot span").last().innerText());
await shot("7_fin");
await frame.locator("#stage").dblclick();
await sleep(800);
await sleep(1200);
const fin = await st();
console.log(fin.slides || fin.holo || fin.intro ? "FALLO: el doble clic no volvió a Lumina" : "OK: el doble clic volvió a Lumina", fin);
const mf = await musica();
console.log(mf.paused ? "OK: la música se detuvo" : "FALLO: la música sigue sonando", mf);
console.log("EXTERNAS:", [...new Set(external)].map((u) => u.slice(8, 40)));
console.log("ERRORES:", [...new Set(errs)]);
voz?.close();
await browser.close();
