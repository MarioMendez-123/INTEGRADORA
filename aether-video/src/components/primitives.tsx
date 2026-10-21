import React from "react";
import { C, F } from "../theme";

/** Esquinas de mira alrededor de un rectángulo. */
export const Brackets: React.FC<{ x: number; y: number; w: number; h: number; len?: number; color?: string; width?: number; opacity?: number }> = ({
  x,
  y,
  w,
  h,
  len = 40,
  color = C.ink,
  width = 2,
  opacity = 1,
}) => {
  const l = Math.min(len, w / 2, h / 2);
  const d = [
    `M${x},${y + l}V${y}H${x + l}`,
    `M${x + w - l},${y}H${x + w}V${y + l}`,
    `M${x + w},${y + h - l}V${y + h}H${x + w - l}`,
    `M${x + l},${y + h}H${x}V${y + h - l}`,
  ].join("");
  return <path d={d} fill="none" stroke={color} strokeWidth={width} opacity={opacity} strokeLinecap="square" />;
};

/** Palabra técnica con revelado letra por letra (reveal 0..1). */
export const Word: React.FC<{
  x: number;
  y: number;
  text: string;
  size: number;
  reveal?: number;
  weight?: number;
  tracking?: number;
  color?: string;
  opacity?: number;
  outline?: boolean;
  anchor?: "start" | "middle" | "end";
  mono?: boolean;
}> = ({ x, y, text, size, reveal = 1, weight = 400, tracking = 0.2, color = C.ink, opacity = 1, outline = false, anchor = "middle", mono = false }) => {
  const letters = [...text];
  return (
    <text
      x={x}
      y={y}
      fontFamily={mono ? F.mono : F.sans}
      fontSize={size}
      fontWeight={weight}
      letterSpacing={`${tracking}em`}
      textAnchor={anchor}
      opacity={opacity}
      fill={outline ? "none" : color}
      stroke={outline ? color : "none"}
      strokeWidth={outline ? 1.2 : 0}
    >
      {letters.map((ch, i) => (
        <tspan key={i} opacity={Math.min(1, Math.max(0, reveal * letters.length * 1.4 - i * 1.4 + 1))}>
          {ch}
        </tspan>
      ))}
    </text>
  );
};

/** Marca de honestidad: lo conceptual se ve como conceptual. */
export const HonestLabel: React.FC<{ text: string; opacity: number; x?: number; y?: number }> = ({ text, opacity, x = 96, y = 1020 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <rect x={x} y={y - 11} width={8} height={8} fill="none" stroke={C.inkDim} strokeWidth={1} />
      <text x={x + 18} y={y - 2} fontFamily={F.mono} fontSize={17} fill={C.inkDim} letterSpacing="0.06em">
        {text}
      </text>
    </g>
  );

// ---- glifos (24×24 aprox., centrados en 0,0; se escalan con `s`) ----
type G = { x: number; y: number; s?: number; color?: string; opacity?: number; width?: number };
const Glyph: React.FC<G & { children: React.ReactNode }> = ({ x, y, s = 1, color = C.ink, opacity = 1, width = 1.6, children }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={width / s} opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </g>
);

export const LensGlyph: React.FC<G> = (p) => (
  <Glyph {...p}>
    <circle r={12} />
    <circle r={6} />
    <circle r={1.5} fill={p.color ?? C.ink} />
  </Glyph>
);
export const BarcodeGlyph: React.FC<G> = (p) => (
  <Glyph {...p}>
    {[-11, -7, -4, 0, 3, 7, 11].map((x, i) => (
      <line key={i} x1={x} x2={x} y1={-10} y2={10} strokeWidth={(i % 3 === 0 ? 2.4 : 1.2) / (p.s ?? 1)} />
    ))}
  </Glyph>
);
export const VerifyGlyph: React.FC<G> = (p) => (
  <Glyph {...p}>
    <rect x={-12} y={-12} width={20} height={20} />
    <rect x={-8} y={-8} width={20} height={20} strokeDasharray="3 3" />
    <path d="M-4,1 L0,5 L7,-4" />
  </Glyph>
);
export const LocateGlyph: React.FC<G> = (p) => (
  <Glyph {...p}>
    <rect x={-12} y={-12} width={24} height={24} />
    <path d="M-12,0H-5M5,0H12M0,-12V-5M0,5V12" />
    <circle r={2.2} />
  </Glyph>
);
export const RecordGlyph: React.FC<G> = (p) => (
  <Glyph {...p}>
    <path d="M-12,-9H12M-12,0H12M-12,9H12" />
    <path d="M-5,-12V12" />
  </Glyph>
);
export const ChipGlyph: React.FC<G> = (p) => (
  <Glyph {...p}>
    <rect x={-9} y={-9} width={18} height={18} />
    <rect x={-4} y={-4} width={8} height={8} />
    <path d="M-5,-9V-13M0,-9V-13M5,-9V-13M-5,9V13M0,9V13M5,9V13M-9,-5H-13M-9,0H-13M-9,5H-13M9,-5H13M9,0H13M9,5H13" />
  </Glyph>
);
export const SignalGlyph: React.FC<G> = (p) => (
  <Glyph {...p}>
    <circle cx={0} cy={6} r={1.8} />
    <path d="M-6,0 A8.5,8.5 0 0 1 6,0" />
    <path d="M-11,-5 A15.5,15.5 0 0 1 11,-5" />
  </Glyph>
);
export const WheelGlyph: React.FC<G> = (p) => (
  <Glyph {...p}>
    <circle r={12} />
    <circle r={3.5} />
    <path d="M0,-3.5V-12M0,3.5V12M-3.5,0H-12M3.5,0H12" />
  </Glyph>
);
