// Exporta las diapositivas a PDF (texto y diagramas vectoriales, una lámina por página 16:9).
// Uso, con el servidor arriba: node intro/scripts/slides_pdf.mjs <puerto> <carpeta salida> <es|en>
import { chromium } from "playwright-core";
import path from "path";
const [PORT = "8000", OUT = ".", LANG = "en"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`http://127.0.0.1:${PORT}/slides.html?lang=${LANG}`);
await page.evaluate(async () => {
  const parts = [];
  for (let i = 0; i < SLIDES.length; i++) {
    show(i);
    parts.push(`<section class="hoja">${stage.innerHTML}</section>`);
  }
  // En papel no hay video ni página en vivo: una imagen fija de cada uno. Tampoco doble clic.
  document.body.innerHTML = parts.join("")
    .replace(/<video[^>]*><\/video>/g, '<img src="/assets/slides/sim_frame.jpg" alt="">')
    .replace(/<iframe class="demo-frame"[^>]*><\/iframe>/g, '<img src="/assets/slides/fig29.png" alt="" style="object-fit:contain">')
    .replace(/<div class="hint">.*?<\/div>/g, "");
  const css = document.createElement("style");
  css.textContent = `
    @page { size: 1920px 1080px; margin: 0; }
    html, body { overflow: visible; height: auto; }
    .hoja { position: relative; width: 1920px; height: 1080px; overflow: hidden; break-after: page; font-family: "Inter", sans-serif; color: var(--ink); background: radial-gradient(ellipse at 50% 35%, #0d1020 0%, var(--bg) 70%); }
    .a { animation: none !important; opacity: 1 !important; transform: none !important; }
  `;
  document.head.appendChild(css);
  await Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
  await document.fonts.ready;
});
const salida = path.join(OUT, `Aether_Presentacion_${LANG.toUpperCase()}.pdf`);
await page.pdf({ path: salida, printBackground: true, preferCSSPageSize: true });
console.log("ok", salida);
await browser.close();
