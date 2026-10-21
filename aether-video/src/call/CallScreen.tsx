import React from "react";
import { AbsoluteFill } from "remotion";
import { Aperture, hexPoints, toPath } from "../components/Aperture";
import { Word } from "../components/primitives";
import { EASE_IN_OUT, breath, lerp, prog } from "../lib/anim";
import { C, F } from "../theme";

// Pantalla de llamada de Lumina (robot.html). Sustituye a la cara mientras
// Lumina llama por teléfono. Todo se ancla al cuadro en que ocurrió cada
// estado REAL de la llamada (Zavu): marcando → contestó / no contestó / falló.

export type CallState = "dialing" | "answered" | "no_answer" | "failed";
export type CallEvent = { state: CallState; at: number; detail?: string };
export type CallProps = {
  name: string;
  message?: string;
  events: CallEvent[];
  /** Cuadro en que se abrió la pantalla. */
  startAt: number;
  /** Cuadro en que empieza a cerrarse (o nunca). */
  endAt?: number;
};

const LUMINA = { x: 560, y: 450 };
const CONTACT = { x: 1360, y: 450 };
const LINK = { x1: LUMINA.x + 130, x2: CONTACT.x - 104, y: 450 };

const STATUS: Record<CallState, string> = {
  dialing: "LLAMANDO",
  answered: "CONTESTÓ · MENSAJE ENTREGADO",
  no_answer: "NO CONTESTÓ",
  failed: "NO PUDE LLAMAR",
};

const mmss = (frames: number) => {
  const s = Math.max(0, Math.floor(frames / 30));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/** `f` en cuadros de 30 fps (puede ser fraccionario: el reproductor dibuja a 60). */
export const CallScreen: React.FC<CallProps & { f: number }> = ({ f, name, message, events, startAt, endAt }) => {
  const current = [...events].reverse().find((e) => e.at <= f) ?? events[0];
  const dialing = events.find((e) => e.state === "dialing");
  const final = events.find((e) => e.state !== "dialing");
  const finalAt = final ? final.at : Infinity;
  const answered = final?.state === "answered" ? final.at : Infinity;
  const broken = final && final.state !== "answered" ? final.at : Infinity;

  const enter = prog(f, startAt, 16);
  const exit = endAt != null ? prog(f, endAt, 18, Infinity, EASE_IN_OUT) : 0;
  const draw = prog(f, startAt + 6, 26, Infinity, EASE_IN_OUT);
  const link = prog(f, startAt + 18, 22, Infinity, EASE_IN_OUT);
  const b = breath(f, 90);

  // Marcando: pulsos de señal por la línea y ondas desde el contacto.
  const ringing = dialing && f >= dialing.at && f < finalAt;
  const pulses = ringing ? [0, 1, 2].map((k) => ((f - dialing.at + k * 12) % 36) / 36) : [];
  const waves = ringing ? [0, 1].map((k) => ((f - dialing.at + k * 22) % 45) / 45) : [];

  // Contestó: línea ámbar sólida + onda de voz.
  const on = prog(f, answered, 14);
  const ripple = prog(f, answered, 40);
  // No contestó / falló: la línea se rompe y se apaga.
  const off = prog(f, broken, 20);

  const timer = dialing ? mmss(Math.min(f, finalAt) - dialing.at) : "00:00";
  const statusText = current ? STATUS[current.state] : STATUS.dialing;
  const statusReveal = prog(f, current?.at ?? startAt, 18);
  const initial = (name.trim()[0] || "·").toUpperCase();
  const accent = final?.state === "answered" ? C.amber : final ? C.inkDim : C.amber;

  const wave = (() => {
    if (on <= 0) return "";
    const pts: string[] = [];
    for (let x = LINK.x1; x <= LINK.x2; x += 6) {
      const u = (x - LINK.x1) / (LINK.x2 - LINK.x1);
      const env = Math.sin(Math.PI * u) * on;
      const y = LINK.y + env * 26 * Math.sin(u * 22 - (f / 30) * 9) * (0.55 + 0.45 * Math.sin(u * 5 + (f / 30) * 3));
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M${pts.join("L")}`;
  })();

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: enter * (1 - exit) }}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080">
        <defs>
          <pattern id="callGrid" width={60} height={60} patternUnits="userSpaceOnUse">
            <path d="M60,0H0V60" fill="none" stroke={C.ink} strokeWidth={1} />
          </pattern>
          <radialGradient id="callVignette" cx="50%" cy="50%" r="75%">
            <stop offset="55%" stopColor={C.bgDeep} stopOpacity={0} />
            <stop offset="100%" stopColor={C.bgDeep} stopOpacity={0.85} />
          </radialGradient>
          <radialGradient id="callGlow">
            <stop offset="0%" stopColor={C.amber} stopOpacity={0.45} />
            <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#callGrid)" opacity={0.04} />

        {/* encabezado */}
        <g opacity={enter}>
          <circle cx={120} cy={96} r={6} fill={accent} opacity={ringing ? 0.4 + 0.6 * breath(f, 30) : 1} />
          <text x={140} y={104} fontFamily={F.mono} fontSize={22} letterSpacing="0.2em" fill={C.inkDim}>
            LUMINA · LLAMADA DE VOZ
          </text>
          <text x={1800} y={104} textAnchor="end" fontFamily={F.mono} fontSize={28} letterSpacing="0.1em" fill={C.ink} opacity={0.85}>
            {timer}
          </text>
        </g>

        {/* enlace Lumina → contacto */}
        <g opacity={link}>
          {off > 0 ? (
            <g stroke={C.ink} strokeWidth={2} strokeOpacity={lerp(0.45, 0.15, off)}>
              <line x1={LINK.x1} x2={lerp((LINK.x1 + LINK.x2) / 2, LINK.x1 + 150, off)} y1={LINK.y} y2={LINK.y} />
              <line x1={lerp((LINK.x1 + LINK.x2) / 2, LINK.x2 - 150, off)} x2={LINK.x2} y1={LINK.y} y2={LINK.y + 10 * off} />
            </g>
          ) : (
            <line
              x1={LINK.x1}
              x2={LINK.x1 + (LINK.x2 - LINK.x1) * link}
              y1={LINK.y}
              y2={LINK.y}
              stroke={on > 0 ? C.amber : C.ink}
              strokeOpacity={lerp(0.4, 0.9, on)}
              strokeWidth={2}
              strokeDasharray={on > 0 ? undefined : "10 12"}
              strokeDashoffset={-((f * 2) % 22)}
            />
          )}
          {pulses.map((u, k) => (
            <circle key={k} cx={LINK.x1 + (LINK.x2 - LINK.x1) * u} cy={LINK.y} r={6} fill={C.amber} opacity={Math.sin(Math.PI * u)} />
          ))}
          {wave && <path d={wave} fill="none" stroke={C.amber} strokeWidth={2.4} strokeLinejoin="round" opacity={0.9} />}
        </g>

        {/* Lumina */}
        <g opacity={enter * lerp(1, 0.55, off)}>
          <circle cx={LUMINA.x} cy={LUMINA.y} r={220} fill="url(#callGlow)" opacity={0.25 + 0.2 * b} />
          <Aperture cx={LUMINA.x} cy={LUMINA.y} R={120 + 2 * b} open={lerp(0.05, 0.3, on)} frameDraw={draw} bladesAlpha={draw} glow={0.6 + 0.4 * b} />
          <text x={LUMINA.x} y={LUMINA.y + 190} textAnchor="middle" fontFamily={F.mono} fontSize={22} letterSpacing="0.3em" fill={C.inkDim}>
            LUMINA
          </text>
        </g>

        {/* contacto */}
        <g opacity={enter * lerp(1, 0.4, off)}>
          {waves.map((u, k) => (
            <path key={k} d={toPath(hexPoints(CONTACT.x, CONTACT.y, 100 + u * 170))} fill="none" stroke={C.amber} strokeWidth={1.6} opacity={0.55 * (1 - u)} />
          ))}
          {ripple > 0 && ripple < 1 && <path d={toPath(hexPoints(CONTACT.x, CONTACT.y, 100 + ripple * 260))} fill="none" stroke={C.amber} strokeWidth={2} opacity={0.8 * (1 - ripple)} />}
          <path
            d={toPath(hexPoints(CONTACT.x, CONTACT.y, 100))}
            pathLength={1}
            strokeDasharray={`${draw} 1`}
            fill={on > 0 ? C.amberGhost : C.blade}
            stroke={final?.state === "answered" ? C.amber : ringing ? C.ink : C.inkDim}
            strokeOpacity={ringing ? 0.6 + 0.4 * breath(f, 45) : 1}
            strokeWidth={2}
          />
          <text x={CONTACT.x} y={CONTACT.y + 30} textAnchor="middle" fontFamily={F.sans} fontWeight={300} fontSize={86} fill={on > 0 ? C.amber : C.ink} opacity={draw}>
            {initial}
          </text>
        </g>

        {/* nombre, estado y mensaje */}
        <g opacity={enter}>
          <Word x={960} y={760} text={name} size={80} weight={300} tracking={0.06} reveal={prog(f, startAt + 10, 24)} />
          <Word x={960} y={830} text={statusText} size={26} weight={500} tracking={0.3} reveal={statusReveal} color={accent} mono />
          {final?.detail && (
            <text x={960} y={885} textAnchor="middle" fontFamily={F.sans} fontSize={30} fill={C.inkDim} opacity={statusReveal}>
              {final.detail}
            </text>
          )}
          {message && !final?.detail && (
            <text x={960} y={895} textAnchor="middle" fontFamily={F.sans} fontSize={32} fill={C.inkDim} opacity={prog(f, startAt + 20, 20)}>
              «{message}»
            </text>
          )}
        </g>
        <rect width={1920} height={1080} fill="url(#callVignette)" pointerEvents="none" />
      </svg>
    </AbsoluteFill>
  );
};
