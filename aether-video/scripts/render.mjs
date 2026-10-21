// Render final: MP4 de ensayo y de escenario (entregable A) + overlay PNG de la demo.
// Uso: node scripts/render.mjs [AetherEnsayo|Aether|DemoOverlay ...]
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const OUT = { AetherEnsayo: "video/aether_ensayo.mp4", Aether: "video/aether_escenario.mp4", DemoOverlay: "assets/demo_overlay.png" };
const list = process.argv.slice(2).length ? process.argv.slice(2) : ["DemoOverlay", "AetherEnsayo", "Aether"];
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// publicDir = audio/: solo las mezclas se copian al bundle.
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("audio") });
const browser = await openBrowser("chrome");
for (const id of list) {
  const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
  fs.mkdirSync(path.dirname(OUT[id]), { recursive: true });
  if (composition.durationInFrames === 1) {
    await renderStill({ serveUrl, composition, output: OUT[id], imageFormat: "png", puppeteerInstance: browser, overwrite: true });
    log(`${id} → ${OUT[id]}`);
    continue;
  }
  let last = -1;
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    crf: 18,
    audioCodec: "aac",
    audioBitrate: "320k",
    outputLocation: OUT[id],
    puppeteerInstance: browser,
    concurrency: 2, // 4 GB de RAM
    overwrite: true,
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 20);
      if (p !== last) log(`${id} ${(progress * 100).toFixed(0)} %`), (last = p);
    },
  });
  log(`${id} → ${OUT[id]}`);
}
await browser.close({ silent: true });
