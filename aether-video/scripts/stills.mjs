// Fotogramas clave para revisar antes del render completo.
// Uso: node scripts/stills.mjs [composición] [cue+offset ...]   (ej. L07+20)
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const timeline = JSON.parse(fs.readFileSync("timeline.json", "utf8"));
const frameOf = (spec) => {
  // "L07+20" = 20 frames después del cue; "L19e" = fin de esa frase.
  const [name, off = "0"] = spec.split("+");
  let c = timeline.cues.find((x) => x.id === name);
  const end = !c && name.endsWith("e");
  if (end) c = timeline.cues.find((x) => x.id === name.slice(0, -1));
  if (!c) throw new Error(`cue desconocido: ${spec}`);
  return Math.round(((c.atMs + (end ? c.durMs : 0)) / 1000) * timeline.fps) + Number(off);
};

const [comp = "AetherEnsayo", ...specs] = process.argv.slice(2);
const DEFAULT = "wake+18 wake+75 L01+8 L02+45 L04+14 L05+50 L06+60 L07+22 L08+30 L10+30 L13+60 L15+14 L17+30 L19e+10 L20+110 L21+60 L22+60 L25+70 L26+24 L27+70 L28+70 L28e+25 L29+60 await+240 heard+12 L31+40 L32+30 camera+60 SEE+20 DECIDE+30 C3+45 C4+45 C4+80 C5+45 card+60".split(" ");
const list = specs.length ? specs : DEFAULT;

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("audio") });
const browser = await openBrowser("chrome");
const composition = await selectComposition({ serveUrl, id: comp, puppeteerInstance: browser });
fs.mkdirSync("render/stills", { recursive: true });
for (const spec of list) {
  const frame = frameOf(spec);
  const output = `render/stills/${comp}-${spec.replace("+", "_")}.png`;
  await renderStill({ serveUrl, composition, frame, output, puppeteerInstance: browser, overwrite: true });
  console.log(`${spec} → frame ${frame} → ${output}`);
}
await browser.close({ silent: true });
