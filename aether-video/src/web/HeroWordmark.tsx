import React from "react";
import { breath, loopNoise } from "../lib/anim";
import { hexPoints, toPath } from "../components/Aperture";

// Wordmark de la portada del dashboard (dashboard/hero-scene.js). Bucle de
// LOOP cuadros a 30 fps; `pointer` lo mueve el puntero real (-0.5..0.5).
export const LOOP = 360;
export const pointer = { x: 0, y: 0 };

const CYAN = "#2ee6ff";
const VIOLET = "#c084fc";
const DEPTH = 16;
const FONT = "'Big Shoulders Display', sans-serif";

const Word: React.FC<React.SVGProps<SVGTextElement>> = (p) => (
  <text x={960} y={498} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={330} letterSpacing={6} {...p}>
    AETHER
  </text>
);

export const HeroWordmark: React.FC<{ f: number }> = ({ f }) => {
  const t = f % LOOP;
  const px = pointer.x + loopNoise("hx", t, LOOP, 0.4) * 0.08;
  const py = pointer.y + loopNoise("hy", t, LOOP, 0.4) * 0.06;
  // extrusión hacia atrás, en sentido contrario al puntero
  const dx = -px * 5;
  const dy = 2 - py * 4;
  const sweep = ((t % 180) / 180) * 2600 - 700;
  const scanY = 250 + ((t * 2.2) % 300);
  const glitch = t > 296 && t < 302;
  const hum = breath(t, 120);
  const hex = toPath(hexPoints(960, 360, 330 + hum * 8, 30 + t * 0.12));
  const hexInner = toPath(hexPoints(960, 360, 300, -30 - t * 0.2));

  return (
    <svg viewBox="0 0 1920 720" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="hw-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.42" stopColor="#c9fbff" />
          <stop offset="0.7" stopColor={CYAN} />
          <stop offset="1" stopColor={VIOLET} />
        </linearGradient>
        <linearGradient id="hw-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d4c63" />
          <stop offset="1" stopColor="#1d0d3a" />
        </linearGradient>
        <linearGradient id="hw-sweep" gradientUnits="userSpaceOnUse" x1={sweep} y1="0" x2={sweep + 260} y2="140">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="hw-glow" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <clipPath id="hw-clip">
          <Word />
        </clipPath>
      </defs>

      {/* marca hexagonal del sistema, girando detrás del nombre */}
      <path d={hex} fill="none" stroke={CYAN} strokeOpacity={0.22 + hum * 0.12} strokeWidth={1.4} strokeDasharray="6 10" />
      <path d={hexInner} fill="none" stroke={VIOLET} strokeOpacity={0.18} strokeWidth={1} />

      {/* halo */}
      <Word fill={CYAN} opacity={0.42 + hum * 0.18} filter="url(#hw-glow)" />

      {/* cuerpo extruido */}
      {Array.from({ length: DEPTH }, (_, i) => {
        const k = DEPTH - i;
        return (
          <Word
            key={k}
            transform={`translate(${(dx * k).toFixed(2)} ${(dy * k).toFixed(2)})`}
            fill="url(#hw-side)"
            stroke={CYAN}
            strokeOpacity={k === DEPTH ? 0.5 : 0.05}
            strokeWidth={1}
          />
        );
      })}

      {/* separación cromática: solo en el pulso del final del bucle */}
      {glitch && (
        <g style={{ mixBlendMode: "screen" }}>
          <Word transform="translate(-7 0)" fill="#ff3df0" opacity={0.7} />
          <Word transform="translate(7 0)" fill={CYAN} opacity={0.7} />
        </g>
      )}

      {/* cara frontal */}
      <Word fill="url(#hw-face)" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={1.2} />
      <Word fill="url(#hw-sweep)" style={{ mixBlendMode: "overlay" }} />

      {/* línea de escaneo dentro de las letras */}
      <g clipPath="url(#hw-clip)">
        <rect x={0} y={scanY} width={1920} height={3} fill="#fff" opacity={0.9} />
        <rect x={0} y={scanY - 40} width={1920} height={40} fill={CYAN} opacity={0.18} />
        {Array.from({ length: 36 }, (_, i) => (
          <rect key={i} x={0} y={180 + i * 9} width={1920} height={1} fill="#000" opacity={0.12} />
        ))}
      </g>
    </svg>
  );
};
