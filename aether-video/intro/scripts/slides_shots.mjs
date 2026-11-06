// Captura todas las diapositivas. Uso: node intro/scripts/slides_shots.mjs <puerto> <carpeta> <es|en>
import { chromium } from "playwright-core";
const [PORT = "8000", OUT = ".", LANG = "en"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: false, args: ["--mute-audio", "--window-size=1920,1080"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("requestfailed", (r) => errs.push("FAIL " + r.url().slice(0, 80)));
await page.goto(`http://127.0.0.1:${PORT}/slides.html?lang=${LANG}`);
const total = Number((await page.locator(".foot span").last().innerText()).split("/")[1]);
for (let i = 0; i < total; i++) {
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${OUT}/sl_${LANG}_${String(i + 1).padStart(2, "0")}.png` });
  const over = await page.evaluate(() => { const s = document.querySelector(".slide"); const f = document.querySelector(".foot").getBoundingClientRect().top; return [...s.querySelectorAll(".body > *, .body table, .gantt")].filter((e) => e.getBoundingClientRect().bottom > f + 4).length; });
  if (over) console.log("SE ENCIMA con el pie: lámina", i + 1);
  await page.keyboard.press("ArrowRight");
}
console.log("láminas", total, "errores", [...new Set(errs)]);
await browser.close();
