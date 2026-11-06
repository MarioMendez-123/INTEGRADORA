import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";
import { buildAscii, COLS, ROWS } from "./ascii";

const inter = loadInter("normal", { weights: ["300", "600", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;
const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] }).fontFamily;

// ── Ritmo de "The Grid (Remixed by The Crystal Method)" desde el segundo 0: 125 BPM, el golpe entra en 7.664 s ──
export const FPS = 30;
const T0 = 7.664, BEAT = 0.48, BF = BEAT * FPS;
export const beat = (k: number) => Math.round((T0 + BEAT * k) * FPS);
export const TOTAL = 1200;

const V1 = "#8B7FFF", V2 = "#5B4FE8", INK = "#f2f3f8", BG = "#05070a", GREEN = "#3ddc97", RED = "#ff5d6c";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const eo = Easing.out(Easing.exp), ec = Easing.out(Easing.cubic);
const sfx = (n: string) => staticFile(`sfx/${n}.wav`);
const POOL = "01#@%&*+=<>/\\|:;";

// Un efecto de sonido en un cuadro exacto. `cut` recorta el arranque (cuadros) y `len` corta el final.
const S: React.FC<{ at: number; n: string; v?: number; cut?: number; len?: number }> = ({ at, n, v = 0.5, cut = 0, len = 90 }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={len} layout="none"><Audio src={sfx(n)} volume={v} trimBefore={cut || undefined} /></Sequence>
);

// ───────────────────────── efectos ─────────────────────────
// Separación RGB + desenfoque direccional con un filtro SVG.
const FX: React.FC<{ id: string; dx: number; bx: number; children: React.ReactNode }> = ({ id, dx, bx, children }) => {
  if (dx < 0.4 && bx < 0.4) return <>{children}</>;
  return (
    <AbsoluteFill style={{ filter: `url(#${id})` }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
          <feOffset in="r" dx={dx} result="ro" />
          <feOffset in="gb" dx={-dx} result="gbo" />
          <feBlend in="ro" in2="gbo" mode="screen" result="m" />
          <feGaussianBlur in="m" stdDeviation={`${bx} 0`} />
        </filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};

type Enter = "flash" | "whip" | "punch" | "glitch" | "wipe" | "hex" | "ascii" | "shutter" | "zoom" | "none";
// Sonido de cada transición: [archivo, volumen, cuadros de anticipación para que el pico caiga en el golpe]
const SFX: Partial<Record<Enter, [string, number, number]>> = {
  whip: ["whoosh", 0.6, 7], punch: ["hit", 0.7, 0], flash: ["impact", 0.55, 0], glitch: ["glitch", 0.5, 0], wipe: ["whoosh_rev", 0.55, 6],
  hex: ["whoosh_rev", 0.6, 5], ascii: ["glitch", 0.4, 0], shutter: ["thunk", 0.55, 0], zoom: ["flyby", 0.6, 8],
};
// La escena anterior sigue viva unos cuadros debajo de la nueva: la transición la cubre en lugar de partir de negro.
const TAIL = 14;
const Seg: React.FC<{ from: number; to: number; enter: Enter; i: number; children: React.ReactNode }> = ({ from, to, enter, i, children }) => {
  const a = SFX[enter];
  return (
    <>
      {a && <S at={from - a[2]} n={a[0]} v={a[1]} />}
      <Sequence from={from} durationInFrames={to - from + TAIL}><SegInner enter={enter} i={i}>{children}</SegInner></Sequence>
    </>
  );
};
const HEX = (cx: number, cy: number, r: number) => Array.from({ length: 6 }).map((_, i) => { const a = (-90 + 60 * i) * (Math.PI / 180); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
const SegInner: React.FC<{ enter: Enter; i: number; children: React.ReactNode }> = ({ enter, i, children }) => {
  const f = useCurrentFrame();
  let style: React.CSSProperties = {}, dx = 0, bx = 0, extra: React.ReactNode = null;
  if (enter === "whip") {
    const k = interpolate(f, [0, 9], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
    style = { transform: `translateX(${(1 - k) * 1900}px)` }; bx = (1 - k) * 70; dx = (1 - k) * 16;
  } else if (enter === "punch") {
    const k = interpolate(f, [0, 11], [0, 1], { ...clamp, easing: eo });
    style = { transform: `scale(${1 + (1 - k) * 0.4})` }; dx = (1 - k) * 14; bx = (1 - k) * 10;
  } else if (enter === "flash") {
    extra = <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 1, 7], [0.95, 0.85, 0], clamp) }} />;
    const k = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: eo }); dx = (1 - k) * 10;
    style = { transform: `scale(${1 + (1 - k) * 0.12})` };
  } else if (enter === "wipe") {
    const k = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    style = { clipPath: `inset(0 ${(1 - k) * 100}% 0 0)` };
    extra = k < 1 ? <div style={{ position: "absolute", top: 0, bottom: 0, left: `${k * 100}%`, width: 14, background: V1, boxShadow: `0 0 60px 20px ${V2}` }} /> : null;
  } else if (enter === "hex") {
    // El hexágono del logo se abre y deja ver la escena nueva.
    const k = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }), r = k * 1320;
    const pts = HEX(960, 540, r);
    if (k < 1) {
      style = { clipPath: `polygon(${pts.map(p => `${p[0]}px ${p[1]}px`).join(",")})` };
      extra = <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 0 22px ${V1})` }}><polygon points={pts.map(p => p.join(",")).join(" ")} fill="none" stroke={INK} strokeWidth={7} /></svg>;
    }
  } else if (enter === "ascii" && f < 12) {
    // Barrido de caracteres: la pantalla se reescribe en código, como el logo del inicio.
    const k = interpolate(f, [0, 11], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
    style = { clipPath: `inset(0 ${(1 - k) * 100}% 0 0)` };
    extra = (
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `calc(${k * 100}% - 300px)`, width: 340, overflow: "hidden", fontFamily: mono, fontSize: 22, lineHeight: "24px", color: V1, whiteSpace: "pre", textShadow: `0 0 10px ${V2}`, background: "linear-gradient(90deg, transparent, #05070add 40%, #05070a)" }}>
        {Array.from({ length: 46 }).map((_, r) => <div key={r}>{Array.from({ length: 27 }).map((__, c) => POOL[Math.floor(random(`w${i}-${r}-${c}-${f}`) * POOL.length)]).join("")}</div>)}
      </div>
    );
  } else if (enter === "shutter" && f < 13) {
    // Persianas: franjas verticales que suben en cascada.
    const bands = 9;
    return (
      <AbsoluteFill>
        {Array.from({ length: bands }).map((_, b) => {
          const k = interpolate(f, [b * 0.7, b * 0.7 + 7], [0, 1], { ...clamp, easing: eo });
          return <AbsoluteFill key={b} style={{ clipPath: `inset(0 ${(1 - (b + 1) / bands) * 100}% 0 ${(b / bands) * 100}%)`, transform: `translateY(${(1 - k) * (b % 2 ? 1100 : -1100)}px)` }}>{children}</AbsoluteFill>;
        })}
      </AbsoluteFill>
    );
  } else if (enter === "zoom") {
    // Entra disparada desde el fondo con rastro de movimiento.
    const k = interpolate(f, [0, 9], [0, 1], { ...clamp, easing: eo });
    style = { transform: `scale(${0.35 + 0.65 * k})`, opacity: Math.min(1, k * 3) };
    dx = (1 - k) * 18;
  } else if (enter === "glitch" && f < 9) {
    const bands = 7;
    return (
      <AbsoluteFill>
        {Array.from({ length: bands }).map((_, b) => {
          const off = (random(`g${i}-${b}-${Math.floor(f / 2)}`) - 0.5) * 220 * (1 - f / 9);
          return <AbsoluteFill key={b} style={{ clipPath: `inset(${(b / bands) * 100}% 0 ${(1 - (b + 1) / bands) * 100}% 0)`, transform: `translateX(${off}px)` }}>{children}</AbsoluteFill>;
        })}
        <AbsoluteFill style={{ background: V1, opacity: random(`gf${i}${f}`) > 0.6 ? 0.12 : 0, mixBlendMode: "screen" }} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <FX id={`fx${i}`} dx={dx} bx={bx}><AbsoluteFill style={style}>{children}</AbsoluteFill></FX>
      {extra}
    </AbsoluteFill>
  );
};

// ───────────────────────── fondo y HUD ─────────────────────────
// Suelo/techo en perspectiva: líneas calculadas desde el punto de fuga (960, 540).
const Persp: React.FC<{ phase: number; ceil?: boolean; op?: number }> = ({ phase, ceil, op = 0.6 }) => {
  const s = ceil ? -1 : 1, frac = ((phase % 1) + 1) % 1, els: React.ReactNode[] = [];
  for (let k = 0; k < 22; k++) {
    const z = 1 + k - frac, y = 540 + (s * 540) / z;
    if (y < -5 || y > 1085) continue;
    els.push(<line key={`h${k}`} x1={0} x2={1920} y1={y} y2={y} stroke={V1} strokeWidth={1 + 2.5 / z} opacity={Math.min(1, 0.12 + (Math.abs(y - 540) / 540) * 1.1) * op} />);
  }
  for (let i = -16; i <= 16; i++) els.push(<line key={`r${i}`} x1={960} y1={540} x2={960 + i * 170} y2={ceil ? 0 : 1080} stroke={V2} strokeWidth={1.6} opacity={op * 0.8} />);
  return <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>{els}</svg>;
};
const Grid: React.FC<{ speed?: number; opacity?: number }> = ({ speed = 1, opacity = 0.35 }) => {
  const f = useCurrentFrame();
  const ph = ((f / FPS) / BEAT) % 1;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #0d1020 0%, ${BG} 70%)`, overflow: "hidden" }}>
      <Persp phase={f * 0.03 * speed} op={opacity * 0.75} /><Persp phase={f * 0.03 * speed} ceil op={opacity * 0.4} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${V2}${Math.round(46 * Math.exp(-ph * 4)).toString(16).padStart(2, "0")}, transparent 55%)` }} />
    </AbsoluteFill>
  );
};

const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS, b = Math.floor((t - T0) / BEAT), ph = (((t - T0) / BEAT) % 1 + 1) % 1, kick = t >= T0 ? Math.exp(-ph * 5) : 0;
  const tc = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}:${String(f % FPS).padStart(2, "0")}`;
  const bracket = (s: React.CSSProperties) => <div style={{ position: "absolute", width: 38, height: 38, borderColor: V1, borderStyle: "solid", opacity: 0.7, ...s }} />;
  return (
    <AbsoluteFill style={{ fontFamily: mono, fontSize: 17, color: V1, letterSpacing: 3, pointerEvents: "none" }}>
      {bracket({ left: 44, top: 44, borderWidth: "2px 0 0 2px" })}{bracket({ right: 44, top: 44, borderWidth: "2px 2px 0 0" })}
      {bracket({ left: 44, bottom: 44, borderWidth: "0 0 2px 2px" })}{bracket({ right: 44, bottom: 44, borderWidth: "0 2px 2px 0" })}
      <div style={{ position: "absolute", left: 100, top: 52, opacity: 0.8 }}>AETHER // INTRO</div>
      <div style={{ position: "absolute", right: 100, top: 52, opacity: 0.8 }}>{tc}</div>
      <div style={{ position: "absolute", left: 100, bottom: 52, opacity: 0.8 }}>125 BPM {b >= 0 ? `· BEAT ${String(b).padStart(3, "0")}` : "· EN ESPERA"}</div>
      <div style={{ position: "absolute", right: 100, bottom: 46, display: "flex", gap: 5, alignItems: "flex-end", height: 34 }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const h = t < 1 ? 2 : 4 + (6 + 22 * random(`eq${i}${Math.floor(f / 2)}`)) * (0.35 + 0.65 * (t >= T0 ? kick : 0.25));
          return <div key={i} style={{ width: 5, height: h, background: V1, opacity: 0.85 }} />;
        })}
      </div>
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0 1px, transparent 1px 3px)", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: "screen", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${f % 7}'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>")` }} />
    </AbsoluteFill>
  );
};

// Destello anamórfico horizontal en los golpes grandes.
const Flare: React.FC<{ hits: number[] }> = ({ hits }) => {
  const f = useCurrentFrame();
  let a = 0;
  for (const h of hits) if (f >= h) a = Math.max(a, Math.exp(-(f - h) / 5));
  if (a < 0.02) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", left: -200, right: -200, top: 534, height: 12, background: "linear-gradient(90deg, transparent, #b9b2ff 30%, #fff 50%, #b9b2ff 70%, transparent)", opacity: a, filter: "blur(3px)" }} />
      <div style={{ position: "absolute", left: 160, right: 160, top: 400, height: 280, background: `radial-gradient(ellipse at center, ${V1}aa, transparent 70%)`, opacity: a * 0.8 }} />
    </AbsoluteFill>
  );
};

// ───────────────────────── ASCII ─────────────────────────
const BOOT = ["> aether.boot --modo=inspeccion", "[ OK ] vision artificial", "[ OK ] navegacion autonoma", "[ OK ] linea de manufactura", "> sistema listo_"];
const bootShown = (t: number) => Math.floor(interpolate(t, [0.3, 5.5], [0, BOOT.length + 0.99], clamp));
const AsciiLogo: React.FC = () => {
  const f = useCurrentFrame();
  const cells = useMemo(buildAscii, []);
  const t = f / FPS;
  const prog = interpolate(t, [0.5, 5.6], [0, 1.28], clamp);
  const rush = interpolate(t, [6.3, T0], [0, 1], clamp);       // el riser: tiembla más y más
  const rows: Record<number, Record<number, React.ReactNode>> = {};
  for (const c of cells) {
    let ch = "", color = "";
    if (prog < c.key) continue;
    const fresh = prog < c.key + 0.1;
    if (fresh) { ch = POOL[Math.floor(random(`a${c.col}-${c.row}-${Math.floor(f / 2)}`) * POOL.length)]; color = "#fff"; }
    else {
      ch = c.ch;
      color = c.kind === "word" ? INK : c.kind === "sub" ? "#8b92a8" : c.kind === "node" ? "#c9c3ff" : c.kind === "spoke" ? "#4a41b8" : `hsl(${248 + c.shade * 8} 90% ${70 - c.shade * 14}%)`;
      if (rush > 0 && random(`z${c.col}-${c.row}-${f}`) < 0.012 * rush * 6) ch = POOL[Math.floor(random(`y${c.col}${c.row}${f}`) * POOL.length)];
    }
    (rows[c.row] ??= {})[c.col] = <span key={c.col} style={{ color, textShadow: fresh ? "0 0 10px #fff" : c.kind === "edge" || c.kind === "node" ? `0 0 8px ${V2}` : undefined }}>{ch}</span>;
  }
  const lines = [];
  for (let r = 0; r < ROWS; r++) {
    const row = rows[r] ?? {}, out: React.ReactNode[] = [];
    for (let c = 0; c < COLS; c++) out.push(row[c] ?? " ");
    const sh = rush > 0 ? (random(`s${r}-${Math.floor(f / 2)}`) - 0.5) * 70 * rush * rush * (random(`sr${r}${f}`) > 0.55 ? 1 : 0) : 0;
    lines.push(<div key={r} style={{ transform: `translateX(${sh}px)`, whiteSpace: "pre", height: 22 }}>{out}</div>);
  }
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: mono, fontSize: 20, lineHeight: "22px", transform: `scale(${1 + rush * 0.06})` }}>
      <div style={{ opacity: 0.8 + rush * 0.2 }}>{lines}</div>
      <div style={{ position: "absolute", left: 900, top: 720, fontSize: 22, color: "#8b92a8", lineHeight: "28px" }}>
        {BOOT.slice(0, bootShown(t)).map((l, i) => <div key={i} style={{ color: l.startsWith("[") ? GREEN : V1 }}>{l}</div>)}
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────── logo vectorial ─────────────────────────
const PTS: [number, number][] = [[150, 0], [280, 75], [280, 225], [150, 300], [20, 225], [20, 75]];
const Sparks: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 26) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 70 }).map((_, i) => {
        const a = random(`sa${i}`) * Math.PI * 2, sp = 16 + random(`sv${i}`) * 44, d = sp * (1 - Math.exp(-f / 7)) * 7, len = 10 + sp * 0.9 * Math.exp(-f / 9);
        return <div key={i} style={{ position: "absolute", left: 960 + Math.cos(a) * d, top: 370 + Math.sin(a) * d, width: len, height: 2.5, background: i % 3 ? V1 : "#fff", boxShadow: `0 0 8px ${V1}`, opacity: Math.max(0, 1 - f / 24), transform: `rotate(${a}rad)` }} />;
      })}
    </AbsoluteFill>
  );
};
const VectorLogo: React.FC<{ size?: number }> = ({ size = 330 }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const hexLen = 930;
  const draw = interpolate(t, [0, BEAT * 1.2], [0, 1], { ...clamp, easing: ec });
  const spokes = interpolate(t, [BEAT * 0.6, BEAT * 1.8], [0, 1], { ...clamp, easing: ec });
  const pop = (i: number) => interpolate(t, [BEAT * 0.3 + i * 0.05, BEAT * 0.3 + i * 0.05 + 0.3], [0, 1], { ...clamp, easing: Easing.out(Easing.back(3)) });
  const ring = (d: number) => interpolate(t, [d, d + 0.9], [0, 1], { ...clamp, easing: ec });
  const subTrack = interpolate(t, [BEAT * 2, BEAT * 5], [0.9, 0.42], { ...clamp, easing: ec });
  const sweep = interpolate(t, [BEAT * 3, BEAT * 3 + 0.6], [-10, 110], clamp);
  const breathe = 1 + 0.012 * Math.exp(-(((t / BEAT) % 1)) * 5);
  const orbit = interpolate(t, [BEAT * 1.4, BEAT * 2.4], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      {[0, 0.12, 0.26].map((d, i) => { const R = 560 * ring(d); return <div key={i} style={{ position: "absolute", top: 370 - R, left: 960 - R, width: R * 2, height: R * 2, borderRadius: "50%", border: `2px solid ${V1}`, opacity: (1 - ring(d)) * 0.75, display: ring(d) > 0 ? "block" : "none" }} />; })}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: orbit * 0.55 }}>
        <circle cx={960} cy={370} r={232} fill="none" stroke={V1} strokeWidth={1.5} strokeDasharray="3 14" transform={`rotate(${f * 0.7} 960 370)`} />
        <circle cx={960} cy={370} r={258} fill="none" stroke={V2} strokeWidth={2} strokeDasharray="60 90" transform={`rotate(${-f * 0.45} 960 370)`} />
      </svg>
      <svg viewBox="-10 -10 320 320" width={size} height={size} style={{ marginTop: 205, transform: `scale(${breathe})`, filter: `drop-shadow(0 0 22px ${V2}) drop-shadow(0 0 60px ${V2}99)` }}>
        <defs><linearGradient id="vg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={V1} /><stop offset="1" stopColor={V2} /></linearGradient></defs>
        <polygon points={PTS.map(p => p.join(",")).join(" ")} fill="none" stroke="url(#vg)" strokeWidth={7} strokeLinejoin="round" strokeDasharray={hexLen} strokeDashoffset={hexLen * (1 - draw)} />
        {PTS.map((p, i) => <line key={i} x1={150} y1={150} x2={150 + (p[0] - 150) * spokes} y2={150 + (p[1] - 150) * spokes} stroke={V2} strokeWidth={3} opacity={0.6} />)}
        {PTS.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={10 * pop(i)} fill={V1} />)}
        <circle cx={150} cy={150} r={20 * pop(6)} fill={INK} />
      </svg>
      <Sparks />
      <div style={{ position: "absolute", top: 600, width: "100%", textAlign: "center", fontFamily: inter, fontWeight: 300, fontSize: 168, color: INK, whiteSpace: "nowrap", textShadow: `0 0 40px ${V2}88` }}>
        {[..."AETHER"].map((ch, i) => {
          const s = BEAT * 0.9 + i * (BEAT / 2.2);
          const k = interpolate(t, [s, s + 0.28], [0, 1], { ...clamp, easing: eo });
          return <span key={i} style={{ display: "inline-block", opacity: k, transform: `translateY(${(1 - k) * 90}px) scaleY(${1 + (1 - k) * 0.8})`, filter: `blur(${(1 - k) * 14}px)`, marginRight: "0.16em" }}>{ch}</span>;
        })}
      </div>
      <div style={{ position: "absolute", top: 600, left: 0, right: 0, height: 190, overflow: "hidden", mixBlendMode: "overlay", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sweep}%`, width: 140, transform: "skewX(-20deg)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }} />
      </div>
      <div style={{ position: "absolute", top: 805, width: "100%", textAlign: "center", fontFamily: mono, fontSize: 30, color: "#8b92a8", letterSpacing: `${subTrack}em`, opacity: interpolate(t, [BEAT * 2, BEAT * 2.8], [0, 1], clamp), paddingLeft: `${subTrack}em` }}>INDUSTRIAL SYSTEMS</div>
    </AbsoluteFill>
  );
};

// ───────────────────────── tarjetas de texto (estilo keynote) ─────────────────────────
// Cada letra gira desde abajo en cascada y la frase sigue empujando hacia cámara.
type W = string | { t: string; c?: string };
const Card: React.FC<{ lines: W[][]; size?: number }> = ({ lines, size = 170 }) => {
  const f = useCurrentFrame();
  const push = 1 + f * 0.0016;
  let idx = 0;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: inter, fontWeight: 800, color: INK, textAlign: "center" }}>
      <div style={{ transform: `scale(${push})`, letterSpacing: "-0.03em", lineHeight: 1.04, fontSize: size }}>
        {lines.map((ln, i) => (
          <div key={i} style={{ whiteSpace: "pre" }}>
            {ln.map((w, j) => {
              const o = typeof w === "string" ? { t: w } : w;
              return [...o.t].map((ch, n) => {
                const s = idx++ * 0.55, k = interpolate(f, [s, s + 7], [0, 1], { ...clamp, easing: eo });
                return <span key={`${j}-${n}`} style={{ display: "inline-block", whiteSpace: "pre", color: o.c, textShadow: o.c ? `0 0 50px ${o.c}66` : undefined, opacity: Math.min(1, k * 2.5), transform: `perspective(900px) translateY(${(1 - k) * 0.6}em) rotateX(${(1 - k) * -78}deg)` }}>{ch}</span>;
              });
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
const v = (t: string) => ({ t, c: V1 });

// ───────────────────────── tomas 3D ─────────────────────────
// Las letras viven dentro de la escena (cart3/): aquí solo se reproducen cuadro a cuadro.
const N3 = { orbita: 117, defecto: 60, anillo: 117, cenital: 60, tunelA: 45, verbos: 60, final: 31 } as const;
const Shot3D: React.FC<{ shot: keyof typeof N3; tag?: string }> = ({ shot, tag }) => {
  const f = useCurrentFrame();
  const n = String(Math.min(N3[shot] - 1, f)).padStart(4, "0");
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Img src={staticFile(`cart3/${shot}/${n}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.06) saturate(1.05)" }} />
      {tag && <Tag text={tag} />}
    </AbsoluteFill>
  );
};
const Tag: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f, [3, 16], [0, text.length], clamp));
  return <div style={{ position: "absolute", left: 100, top: 100, fontFamily: mono, fontSize: 24, letterSpacing: "0.26em", color: "#cfcaff", textShadow: `0 0 14px ${V2}`, background: "rgba(5,7,10,0.55)", padding: "7px 14px" }}>{text.slice(0, n)}<span style={{ opacity: Math.floor(f / 6) % 2, color: V1 }}>_</span></div>;
};

// Montaje rápido: un corte cada medio tiempo con el modelo limpio.
const MONT: [string, number, number][] = [["orbita", 0.15, 150], ["explode", 0.85, 120], ["cenital", 0.55, 90], ["macro", 0.8, 90]];
const Montage: React.FC = () => {
  const f = useCurrentFrame();
  const half = BF / 2, i = Math.min(MONT.length - 1, Math.floor(f / half)), lf = f - i * half;
  const [shot, p, cnt] = MONT[i];
  const k = interpolate(lf, [0, 5], [0, 1], { ...clamp, easing: eo });
  const n = String(Math.min(cnt - 1, Math.round(p * cnt) + Math.round(lf))).padStart(4, "0");
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ transform: `scale(${1.5 - 0.2 * k}) rotate(${(i % 2 ? 1 : -1) * (1 - k) * 3}deg)` }}>
        <FX id="mfx" dx={(1 - k) * 18} bx={(1 - k) * 22}><Img src={staticFile(`cart/${shot}/${n}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.15) saturate(1.1) brightness(0.85)" }} /></FX>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(lf, [0, 3], [0.7, 0], clamp) }} />
    </AbsoluteFill>
  );
};

// ───────────────────────── mezcla de efectos de sonido ─────────────────────────
const Mix: React.FC = () => {
  const b = beat, bb = (k: number) => beat(0) + k * BF;
  const letters = (start: number, n: number, stag: number, land: number, name = "thunk", vol = 0.22) => Array.from({ length: n }).map((_, i) => <S key={`${start}-${i}`} at={start + (i * stag + land) * BF} n={name} v={vol} len={12} />);
  return (
    <>
      {/* arranque: datos cayendo, zumbido que crece, tensión antes del golpe */}
      <S at={0} n="drone" v={0.42} len={235} />
      {Array.from({ length: 34 }).map((_, i) => <S key={`t${i}`} at={15 + i * 4.5} n="tick" v={0.13 + (i % 3) * 0.04} len={3} />)}
      {BOOT.map((_, i) => <S key={`bl${i}`} at={((0.3 + ((i + 1) / (BOOT.length + 0.99)) * 5.2)) * FPS} n="blip" v={0.28} len={5} />)}
      <S at={6.5 * FPS} n="glitch" v={0.22} len={10} /><S at={7.05 * FPS} n="glitch" v={0.32} len={10} />
      <S at={b(0) - 66} n="riser" v={0.55} len={66} />
      {/* golpe del logo */}
      <S at={b(0)} n="impact" v={0.95} len={50} /><S at={b(0)} n="shimmer" v={0.42} len={45} />
      {letters(b(0), 6, 1 / 2.2, 0.9, "hit", 0.32)}
      <S at={bb(3)} n="whoosh_rev" v={0.25} len={27} />
      {/* muros de letras en la órbita */}
      {letters(b(16), 9, 0.09, 0.42)}{letters(b(16) + 0.5 * BF, 5, 0.09, 0.42, "thunk", 0.3)}
      <S at={b(16) + 3.45 * BF} n="whoosh_rev" v={0.35} len={20} /><S at={b(16) + 3.6 * BF} n="flyby" v={0.5} len={27} />
      {letters(b(20), 10, 0.09, 0.42)}{letters(b(20) + 0.5 * BF, 6, 0.09, 0.42, "thunk", 0.3)}
      {/* el pistón expulsa DEFECTUOSO y cae FUERA */}
      <S at={b(28)} n="servo" v={0.3} len={22} />
      <S at={b(28) + 1.95 * BF} n="piston" v={0.85} len={25} /><S at={b(28) + 2.0 * BF} n="whoosh" v={0.6} len={27} />
      {letters(b(28), 6, 0.045, 2.84, "thunk", 0.5)}
      <S at={b(28) + 2.84 * BF} n="impact" v={0.6} len={35} />
      {/* despiece y anillo */}
      <S at={b(32)} n="servo" v={0.5} len={45} /><S at={b(32) + 3.55 * BF} n="whoosh" v={0.65} len={27} />
      {/* compuertas del túnel */}
      <S at={b(13) + 2.45 * BF - 6} n="flyby" v={0.6} len={27} />
      {[0, 1, 2, 3].map(k => <React.Fragment key={k}><S at={b(40 + k)} n="hit" v={0.65} len={15} /><S at={b(41 + k) - 10} n="flyby" v={0.55} len={27} /></React.Fragment>)}
      {/* escáner que registra */}
      <S at={b(44)} n="scan" v={0.45} len={44} />
      {/* subida final y cierre */}
      <S at={b(54)} n="riser" v={0.7} cut={37} len={29} /><S at={b(54)} n="flyby" v={0.5} len={27} />
      <S at={b(56)} n="impact" v={0.95} len={48} /><S at={b(56)} n="shimmer" v={0.42} len={42} />
      <S at={b(64)} n="impact" v={0.85} len={48} />
    </>
  );
};

// ───────────────────────── composición ─────────────────────────
export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS, ph = (((t - T0) / BEAT) % 1 + 1) % 1;
  const kick = t >= T0 ? Math.exp(-ph * 6) : 0;
  const b = beat;
  const vol = 0.8 * interpolate(f, [b(64), TOTAL - 2], [1, 0], clamp);   // 0.8: deja aire para los efectos sin saturar
  const fade = interpolate(f, [b(64) + 2, b(64) + 18], [0, 1], clamp);
  const drop = interpolate(f, [b(0) - 1, b(0), b(0) + 1, b(0) + 8], [0, 1, 0.9, 0], clamp);
  const hits = [b(0), b(16), b(28) + Math.round(2.84 * BF), b(32), b(44), b(56), b(64)];
  let sk = 0;
  for (const h of hits) if (f >= h) sk = Math.max(sk, Math.exp(-(f - h) / 4));
  const shX = sk * 14 * (random(`kx${f}`) - 0.5), shY = sk * 14 * (random(`ky${f}`) - 0.5);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Audio src={staticFile("grid.mp3")} volume={vol} />
      <Mix />
      <AbsoluteFill style={{ transform: `translate(${shX}px, ${shY}px) scale(${1 + 0.014 * kick + 0.02 * sk})` }}>
        {/* 0 → golpe: el logo se dibuja en ASCII */}
        <Seg from={0} to={b(0)} enter="none" i={0}><Grid speed={0.25} opacity={0.14} /><AsciiLogo /></Seg>
        {/* golpe: nace el logo vectorial */}
        <Seg from={b(0)} to={b(8)} enter="punch" i={1}><Grid /><VectorLogo /></Seg>
        {/* texto estilo keynote */}
        <Seg from={b(8)} to={b(10)} enter="shutter" i={2}><Grid speed={1.5} opacity={0.2} /><Card size={150} lines={[["Hoy, inspeccionar"], ["es ", v("manual.")]]} /></Seg>
        <Seg from={b(10)} to={b(11)} enter="punch" i={3}><Grid opacity={0.2} /><Card size={300} lines={[["Lento."]]} /></Seg>
        <Seg from={b(11)} to={b(12)} enter="punch" i={4}><Grid opacity={0.2} /><Card size={300} lines={[["Caro."]]} /></Seg>
        <Seg from={b(12)} to={b(13)} enter="glitch" i={5}><Grid opacity={0.2} /><Card size={300} lines={[[{ t: "Falible.", c: RED }]]} /></Seg>
        {/* túnel: Aether lo cambia */}
        <Seg from={b(13)} to={b(16)} enter="zoom" i={6}><Shot3D shot="tunelA" /></Seg>
        {/* 3D: órbita con muros de letras */}
        <Seg from={b(16)} to={b(24)} enter="hex" i={7}><Shot3D shot="orbita" tag="01 / AETHER INVENTORY · ROBOT MÓVIL" /></Seg>
        <Seg from={b(24)} to={b(26)} enter="flash" i={8}><Grid speed={2} opacity={0.2} /><Card size={190} lines={[["Visión artificial"]]} /></Seg>
        <Seg from={b(26)} to={b(28)} enter="punch" i={9}><Grid opacity={0.2} /><Card size={190} lines={[["decide ", { t: "PASS", c: GREEN }], ["o ", { t: "FAIL.", c: RED }]]} /></Seg>
        {/* 3D: banda y pistón */}
        <Seg from={b(28)} to={b(32)} enter="ascii" i={10}><Shot3D shot="defecto" tag="03 / LÍNEA DE MANUFACTURA · PISTÓN" /></Seg>
        {/* 3D: despiece con anillo de letras */}
        <Seg from={b(32)} to={b(40)} enter="whip" i={11}><Shot3D shot="anillo" tag="04 / INGENIERÍA" /></Seg>
        {/* túnel de verbos */}
        <Seg from={b(40)} to={b(44)} enter="zoom" i={12}><Shot3D shot="verbos" /></Seg>
        {/* 3D: cenital, el registro se escribe en el piso */}
        <Seg from={b(44)} to={b(48)} enter="hex" i={16}><Shot3D shot="cenital" tag="05 / TRAZABILIDAD" /></Seg>
        {/* números */}
        <Seg from={b(48)} to={b(49)} enter="shutter" i={17}><Grid speed={2} opacity={0.2} /><Card size={240} lines={[[v("6"), " personas."]]} /></Seg>
        <Seg from={b(49)} to={b(50)} enter="punch" i={18}><Grid opacity={0.2} /><Card size={240} lines={[[v("4"), " meses."]]} /></Seg>
        <Seg from={b(50)} to={b(52)} enter="punch" i={19}><Grid speed={2} opacity={0.25} /><Card size={280} lines={[[v("1"), " sistema."]]} /></Seg>
        {/* montaje y túnel final hacia la luz */}
        <Seg from={b(52)} to={b(54)} enter="flash" i={20}><Montage /></Seg>
        <Seg from={b(54)} to={b(56)} enter="zoom" i={21}><Shot3D shot="final" /></Seg>
        {/* cierre */}
        <Seg from={b(56)} to={TOTAL} enter="flash" i={22}>
          <Grid speed={1.2} />
          <VectorLogo />
          <Sequence from={Math.round(BEAT * 3.2 * FPS)} layout="none"><div style={{ position: "absolute", top: 905, width: "100%", textAlign: "center", fontFamily: mono, fontSize: 22, letterSpacing: "0.3em", color: V1 }}>CHIHUAHUA, MÉXICO · PROYECTO INTEGRADOR</div></Sequence>
        </Seg>
      </AbsoluteFill>
      <Flare hits={hits} />
      <Hud />
      <Grain />
      <AbsoluteFill style={{ background: "#fff", opacity: drop, pointerEvents: "none", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#000", opacity: fade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
