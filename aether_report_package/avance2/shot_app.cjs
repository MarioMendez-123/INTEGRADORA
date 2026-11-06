const { chromium } = require("../../aether-video/node_modules/playwright-core");
const fs = require("fs");
const OUT = __dirname + "/capturas/";
const clave = fs.readFileSync(process.argv[2], "utf8").trim();
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true,
    args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: 1360, height: 860 }, deviceScaleFactor: 1.5 });
  // celda: inicio de sesión con la cuenta de prueba local
  await p.goto("http://127.0.0.1:8000/celda.html", { waitUntil: "load" });
  await p.waitForTimeout(1500);
  const inputs = p.locator("input");
  await inputs.nth(0).fill("admin");
  await inputs.nth(1).fill(clave);
  await p.getByRole("button", { name: /entrar/i }).click();
  await p.waitForTimeout(3000);
  await p.screenshot({ path: OUT + "app_celda_1.png" });
  console.log("celda 1");
  // esperar un ciclo FAIL en curso
  for (let i = 0; i < 40; i++) {
    const t = await p.evaluate(() => document.body.innerText);
    if (/Pistón activo|Pistón regresando|Espera del pistón/i.test(t)) break;
    await p.waitForTimeout(700);
  }
  await p.waitForTimeout(1200);
  await p.screenshot({ path: OUT + "app_celda_2.png" });
  await p.screenshot({ path: OUT + "app_celda_full.png", fullPage: true });
  console.log("celda 2");
  await p.goto("http://127.0.0.1:8000/robot.html", { waitUntil: "load" });
  await p.waitForTimeout(5000);
  await p.screenshot({ path: OUT + "app_lumina_1.png" });
  console.log("lumina");
  await p.goto("http://127.0.0.1:8000/dataset.html", { waitUntil: "load" });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: OUT + "app_dataset.png" });
  await b.close();
})().catch((e) => { console.log("ERR", e.message); process.exit(1); });
