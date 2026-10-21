// Reproductor modular en vivo (entregable B). Mismo Stage que el MP4, pero
// cada cue se ancla al frame en que llega el evento REAL de Lumina.
//
// URL: /player/?backend=192.168.1.10:8000[&ensayo=1][&clicker=1][&feed=0][&lead=0]
// Teclas: →/AvPág/Espacio/Enter = clicker (también arma) · H = hold/resume · E = panel de ensayo · F = pantalla completa
// ?clicker=1: diapositivas con el mando, sin Lumina. → avanza · ← vuelve
//             (si ya pasaste la demo, ← salta a la cámara). En la cámara no
//             deja seguir hasta confirmar EN VIVO o SIN CÁMARA.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, PlayerRef } from "@remotion/player";
import { useCurrentFrame } from "remotion";
import timeline from "../timeline.json";
import samples from "./samples.json";
import { createController, sequenceOf } from "./controller.mjs";
import { planLumina } from "./sim.mjs";
import { createLiveAudio } from "./audio-live.mjs";
import { SECTIONS, STINGERS, SFX } from "../audio/engine.js";
import { Stage } from "../src/Stage";
import { Rehearsal } from "../src/Rehearsal";
import type { Cues } from "../src/lib/anim";

const params = new URLSearchParams(location.search);
const BACKEND = params.get("backend") || `${location.hostname}:8000`;
const CLICKER_ONLY = params.get("clicker") === "1";
const CLICKER_NEXT = new Set(["ArrowRight", "PageDown", " ", "Enter", "."]);
const CLICKER_BACK = new Set(["ArrowLeft", "PageUp", "Backspace"]);
const FEED = params.get("feed") !== "0";
const CLICKER_SLIDES = [
  "wake",
  "L04",
  "L09",
  "L14",
  "L20",
  "L21",
  "L26",
  "L29",
  "await",
  "heard",
  "camera",
  "C1",
  "SEE",
  "UNDERSTAND",
  "DECIDE",
  "C3",
  "C4",
  "C5",
] as const;
const CAMERA_I = CLICKER_SLIDES.indexOf("camera");
const SEQ = sequenceOf(timeline) as string[];
const LEAD_FRAMES = Math.round((Number(params.get("lead") || 0) / 1000) * timeline.fps);
// Se dibuja a RENDER_FPS (60 por defecto, ?fps=30 si el equipo no da) pero las
// escenas trabajan en cuadros de timeline.fps (30), fraccionarios: el timing no
// cambia y el movimiento sale el doble de suave.
const RENDER_FPS = Number(params.get("fps") || 60);
const K = RENDER_FPS / timeline.fps;
const DEMO = { x: 240 / 1920, y: 135 / 1080, w: 1440 / 1920, h: 810 / 1080 };

const LiveStage: React.FC<{ q: Cues; rehearsal: boolean }> = ({ q, rehearsal }) => {
  const f = useCurrentFrame() / K;
  return (
    <>
      <Stage f={f} q={q} />
      {rehearsal && <Rehearsal f={f} q={q} />}
    </>
  );
};

type LogEntry = { t: number; wall: number; type: string; [k: string]: unknown };
declare global {
  interface Window {
    __aether: { log: LogEntry[]; shown: Record<string, number>; q: Cues; api: Api };
  }
}
type Api = { cue: (id: string) => void; hold: () => void; resume: () => void; clicker: () => void; lumina: (ev: Record<string, unknown>) => void };

const App: React.FC = () => {
  const player = useRef<PlayerRef>(null);
  const [q, setQ] = useState<Cues>({});
  const qRef = useRef<Cues>({});
  const [armed, setArmed] = useState(false);
  const armedRef = useRef(false);
  const armingRef = useRef(false);
  const simTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const camTimer = useRef<ReturnType<typeof setTimeout>>();
  const closeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const slideRef = useRef(-1);
  const camRef = useRef<"off" | "probing" | "ok" | "fail">("off");
  const confirmedRef = useRef(false);
  const [slide, setSlide] = useState(-1);
  const [cam, setCam] = useState<"off" | "probing" | "ok" | "fail">("off");
  const [camConfirmed, setCamConfirmed] = useState(false);
  const [camNonce, setCamNonce] = useState(0);
  const [loading, setLoading] = useState(0);
  const [panel, setPanel] = useState(params.get("ensayo") === "1");
  const [feed, setFeed] = useState(false);
  const [wsState, setWsState] = useState("desconectado");
  const [held, setHeld] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const logRef = useRef<LogEntry[]>([]);
  const shown = useRef<Record<string, number>>({});
  const audio = useRef<Awaited<ReturnType<typeof createLiveAudio>> | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const push = useCallback((e: Omit<LogEntry, "t" | "wall">) => {
    const entry = { t: performance.now(), wall: performance.timeOrigin + performance.now(), ...e } as LogEntry;
    logRef.current.push(entry);
    setLog((l) => [...l.slice(-60), entry]);
    console.log(`[aether] ${entry.type}`, e);
  }, []);

  const controller = useMemo(
    () =>
      createController({
        timeline,
        now: () => performance.now(),
        setTimer: (fn: () => void, ms: number) => setTimeout(fn, ms),
        clearTimer: (h: ReturnType<typeof setTimeout>) => clearTimeout(h),
        onLog: (l: Record<string, unknown>) => push(l as LogEntry),
        onWake: () => ws.current?.readyState === WebSocket.OPEN && ws.current.send(JSON.stringify({ from: "video", type: "wake" })),
        onCue: (id: string, _source: string, backdateMs: number) => {
          // Retrofechado (piloto automático): el cue representa un instante ya pasado.
          const frame = (player.current?.getCurrentFrame() ?? 0) / K - LEAD_FRAMES - Math.round((backdateMs / 1000) * timeline.fps);
          qRef.current = { ...qRef.current, [id]: frame };
          setQ(qRef.current);
          audio.current?.cue(id);
          if (/^L\d\d$/.test(id)) audio.current?.duckOn();
          if (/^L\d\de$/.test(id)) audio.current?.duckOff();
          if (id === "camera") setTimeout(() => setFeed(true), 1100);
          if (id === "C1") setFeed(false);
        },
      }),
    [push],
  );

  // Registro del frame en que cada cue ya está en pantalla (medición de sincronía).
  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) => {
      for (const [id, fr] of Object.entries(qRef.current)) if (shown.current[id] == null && e.detail.frame / K >= fr) shown.current[id] = performance.timeOrigin + performance.now();
    };
    p.addEventListener("frameupdate", onFrame);
    return () => p.removeEventListener("frameupdate", onFrame);
  }, [armed]);

  // Canal con Lumina (robot.js → backend /show/ws → aquí). El modo clicker
  // no lo usa: las diapositivas las avanza el mando. La cámara sí pide :8000.
  useEffect(() => {
    if (CLICKER_ONLY) {
      setWsState("clicker");
      return;
    }
    let stop = false;
    let retry: ReturnType<typeof setTimeout>;
    const connect = () => {
      const s = new WebSocket(`ws://${BACKEND}/show/ws`);
      ws.current = s;
      s.onopen = () => setWsState("conectado");
      s.onclose = () => {
        setWsState("desconectado");
        if (!stop) retry = setTimeout(connect, 2000);
      };
      s.onmessage = (m) => {
        let ev: Record<string, unknown>;
        try {
          ev = JSON.parse(m.data);
        } catch {
          return;
        }
        if (ev.from !== "lumina") return;
        if (ev.type !== "alive") push({ type: "event", ev, relayMs: typeof ev.sentAt === "number" ? Date.now() - ev.sentAt : null });
        controller.luminaEvent(ev);
      };
    };
    connect();
    return () => {
      stop = true;
      clearTimeout(retry);
      ws.current?.close();
    };
  }, [controller, push]);

  const api: Api = useMemo(
    () => ({
      cue: (id) => controller.cue(id),
      hold: () => (controller.hold(), setHeld(true)),
      resume: () => (controller.resume(), setHeld(false)),
      clicker: () => controller.clicker(),
      lumina: (ev) => controller.luminaEvent(ev),
    }),
    [controller],
  );
  useEffect(() => {
    window.__aether = { log: logRef.current, shown: shown.current, get q() { return qRef.current; }, api } as Window["__aether"];
  }, [api]);

  const arm = useCallback(async () => {
    if (armedRef.current || armingRef.current) return;
    armingRef.current = true;
    try {
      audio.current = await createLiveAudio({
        base: "..",
        sections: SECTIONS as [string, string | null][],
        stingers: Object.keys(STINGERS),
        sfx: Object.keys(SFX),
        onProgress: setLoading,
      });
      await audio.current.ctx.resume();
      player.current?.play();
      armedRef.current = true;
      setArmed(true);
      push({ type: "armed", backend: BACKEND, clicker: CLICKER_ONLY });
    } finally {
      armingRef.current = false;
    }
  }, [push]);

  const applySlide = useCallback(
    (index: number) => {
      const i = Math.max(0, Math.min(index, CLICKER_SLIDES.length - 1));
      const id = CLICKER_SLIDES[i];
      const end = SEQ.indexOf(id);
      const frame = (player.current?.getCurrentFrame() ?? 0) / K - LEAD_FRAMES;
      const next: Cues = {};
      for (let k = 0; k <= end; k++) next[SEQ[k]] = frame - (end - k) * 8;
      qRef.current = next;
      setQ(next);
      slideRef.current = i;
      setSlide(i);
      audio.current?.cue(id);
      closeTimers.current.forEach(clearTimeout);
      closeTimers.current = [];
      clearTimeout(camTimer.current);
      if (id === "camera") {
        setCamNonce(Date.now());
        confirmedRef.current = false;
        setCamConfirmed(false);
        if (!FEED) {
          camRef.current = "fail";
          setCam("fail");
          setFeed(false);
        } else {
          camRef.current = "probing";
          setCam("probing");
          setFeed(true);
          camTimer.current = setTimeout(() => {
            if (camRef.current !== "probing") return;
            camRef.current = "fail";
            setCam("fail");
            setFeed(false);
          }, 5000);
        }
      } else {
        setFeed(false);
        if (i < CAMERA_I) {
          camRef.current = "off";
          setCam("off");
        }
      }
      if (id === "C5") {
        const stamp = () => (player.current?.getCurrentFrame() ?? 0) / K;
        closeTimers.current = [
          setTimeout(() => {
            qRef.current = { ...qRef.current, silence: stamp() };
            setQ(qRef.current);
            audio.current?.cue("silence");
          }, 2400),
          setTimeout(() => {
            qRef.current = { ...qRef.current, card: stamp() };
            setQ(qRef.current);
            audio.current?.cue("card");
          }, 3200),
        ];
      }
      push({ type: "slide", id, i });
    },
    [push],
  );

  const onClicker = useCallback(async () => {
    if (!armedRef.current) {
      await arm();
      if (!armedRef.current) return;
      document.documentElement.requestFullscreen?.().catch(() => {});
      if (CLICKER_ONLY) applySlide(0);
      return;
    }
    if (!CLICKER_ONLY) {
      api.clicker();
      return;
    }
    const id = slideRef.current >= 0 ? CLICKER_SLIDES[slideRef.current] : null;
    if (id === "camera" && !confirmedRef.current) {
      if (camRef.current === "probing") return;
      confirmedRef.current = true;
      setCamConfirmed(true);
      applySlide(slideRef.current + 1);
      return;
    }
    applySlide(slideRef.current + 1);
  }, [api, arm, applySlide]);

  const onBack = useCallback(() => {
    if (!CLICKER_ONLY || !armedRef.current) return;
    if (slideRef.current > CAMERA_I) applySlide(CAMERA_I);
    else applySlide(slideRef.current - 1);
  }, [applySlide]);

  useEffect(
    () => () => {
      simTimers.current.forEach(clearTimeout);
      closeTimers.current.forEach(clearTimeout);
      clearTimeout(camTimer.current);
    },
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (CLICKER_NEXT.has(e.key)) {
        e.preventDefault();
        void onClicker();
      } else if (CLICKER_BACK.has(e.key)) {
        e.preventDefault();
        onBack();
      } else if (e.key === "h" || e.key === "H") (controller.held ? api.resume : api.hold)();
      else if (e.key === "e" || e.key === "E") setPanel((p) => !p);
      else if (e.key === "f" || e.key === "F") document.documentElement.requestFullscreen?.();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [api, controller, onClicker, onBack]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", display: "grid", placeItems: "center" }}>
      <div style={{ position: "relative", width: "min(100vw, calc(100vh * 16 / 9))", aspectRatio: "16 / 9" }}>
        <Player
          ref={player}
          component={LiveStage}
          inputProps={{ q, rehearsal: panel }}
          durationInFrames={RENDER_FPS * 60 * 60 * 3}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={RENDER_FPS}
          style={{ width: "100%", height: "100%" }}
          controls={false}
          clickToPlay={false}
        />
        {FEED && feed && cam !== "fail" && (
          // Feed REAL de la cámara de Aether (mismo publicador que robot.html). Sin detecciones simuladas.
          <img
            src={`http://${BACKEND}/perception/stream?t=${camNonce}`}
            alt=""
            onLoad={() => {
              if (camRef.current === "fail") return;
              clearTimeout(camTimer.current);
              camRef.current = "ok";
              setCam("ok");
            }}
            onError={() => {
              clearTimeout(camTimer.current);
              camRef.current = "fail";
              setCam("fail");
              setFeed(false);
            }}
            style={{ position: "absolute", left: `${DEMO.x * 100}%`, top: `${DEMO.y * 100}%`, width: `${DEMO.w * 100}%`, height: `${DEMO.h * 100}%`, objectFit: "cover" }}
          />
        )}
        {CLICKER_ONLY && armed && (
          <ClickerHud slide={slide} cam={cam} confirmed={camConfirmed} />
        )}
      </div>
      {!armed && (
        <button onClick={() => void onClicker()} style={armStyle}>
          {loading > 0 && loading < 1
            ? `cargando audio ${Math.round(loading * 100)} %`
            : CLICKER_ONLY
              ? "Clicker o clic para armar · → avanza · ← cámara"
              : "Clicker o clic para armar el video (audio + reproducción)"}
          <span style={{ display: "block", opacity: 0.5, fontSize: 13, marginTop: 8 }}>
            {CLICKER_ONLY ? `modo clicker · sin Lumina · cámara ${BACKEND}` : `Lumina: ${BACKEND} · ${wsState}`}
          </span>
        </button>
      )}
      {panel && <Panel api={api} log={log} wsState={wsState} held={held} q={q} push={push} audio={audio} />}
    </div>
  );
};

const armStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "#03060f", color: "#2ee6ff", border: 0, font: "16px 'IBM Plex Mono', monospace", cursor: "pointer", textShadow: "0 0 18px rgba(46,230,255,0.65)" };

function ClickerHud({
  slide,
  cam,
  confirmed,
}: {
  slide: number;
  cam: "off" | "probing" | "ok" | "fail";
  confirmed: boolean;
}) {
  const id = slide >= 0 ? CLICKER_SLIDES[slide] : "—";
  const atCam = id === "camera";
  let status = "";
  let hint = "→ siguiente · ← atrás";
  if (atCam && cam === "probing") {
    status = "esperando cámara real…";
    hint = "no avanza hasta ver EN VIVO o SIN CÁMARA · ← atrás";
  } else if (atCam && cam === "ok" && !confirmed) {
    status = "cámara EN VIVO";
    hint = "→ confirmar y seguir · ← atrás";
  } else if (atCam && cam === "fail" && !confirmed) {
    status = "sin cámara";
    hint = "→ continuar sin feed · ← atrás";
  } else if (slide > CAMERA_I) {
    hint = "→ siguiente · ← volver a cámara";
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "10px 18px 14px",
        background: "linear-gradient(transparent, rgba(0,0,0,0.72))",
        color: "#d7fbff",
        font: "13px 'IBM Plex Mono', monospace",
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        pointerEvents: "none",
      }}
    >
      <span>
        {slide + 1}/{CLICKER_SLIDES.length} · {id}
        {status ? ` · ${status}` : ""}
      </span>
      <span style={{ opacity: 0.85 }}>{hint}</span>
    </div>
  );
}

/** Panel de ensayo: simula a Lumina con los tiempos medidos + retraso añadido. */
const Panel: React.FC<{
  api: Api;
  log: LogEntry[];
  wsState: string;
  held: boolean;
  q: Cues;
  push: (e: Omit<LogEntry, "t" | "wall">) => void;
  audio: React.MutableRefObject<Awaited<ReturnType<typeof createLiveAudio>> | null>;
}> = ({ api, log, wsState, held, q, push, audio }) => {
  const [profile, setProfile] = useState("none");
  const [delay, setDelay] = useState(0);
  const [drop, setDrop] = useState(0);
  const [expo, setExpo] = useState(20);
  const [vol, setVol] = useState({ music: 1, sfx: 1 });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const run = () => {
    timers.current.forEach(clearTimeout);
    const plan = planLumina({ timeline, samples, profile, extraDelayMs: delay, dropProb: drop, expositorMs: expo * 1000, seed: Date.now() % 100000 });
    push({ type: "sim", profile, delay, drop, expo });
    timers.current = plan.map((e) => setTimeout(() => api.lumina({ from: "lumina", sim: true, ...e }), e.at));
  };
  const fired = Object.keys(q).length;
  return (
    <div style={panelStyle}>
      <div style={{ color: "#2ee6ff", textShadow: "0 0 12px rgba(46,230,255,0.6)", marginBottom: 6 }}>ENSAYO · relevo {wsState} · cues {fired} {held ? "· HOLD" : ""}</div>
      <label>
        perfil medido{" "}
        <select value={profile} onChange={(e) => setProfile(e.target.value)}>
          {Object.keys(samples.profiles).map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label>
        retraso añadido {delay} ms
        <input type="range" min={0} max={5000} step={100} value={delay} onChange={(e) => setDelay(Number(e.target.value))} />
      </label>
      <label>
        eventos perdidos {Math.round(drop * 100)} %
        <input type="range" min={0} max={0.3} step={0.01} value={drop} onChange={(e) => setDrop(Number(e.target.value))} />
      </label>
      <label>
        expositor {expo} s
        <input type="range" min={5} max={180} step={5} value={expo} onChange={(e) => setExpo(Number(e.target.value))} />
      </label>
      <label>
        música {Math.round(vol.music * 100)} % · efectos {Math.round(vol.sfx * 100)} %
        <input type="range" min={0} max={1.5} step={0.05} value={vol.music} onChange={(e) => { const v = { ...vol, music: Number(e.target.value) }; setVol(v); audio.current?.setVolumes(v); }} />
        <input type="range" min={0} max={1.5} step={0.05} value={vol.sfx} onChange={(e) => { const v = { ...vol, sfx: Number(e.target.value) }; setVol(v); audio.current?.setVolumes(v); }} />
      </label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "6px 0" }}>
        <button onClick={run}>simular Lumina</button>
        <button onClick={() => api.clicker()}>clicker</button>
        <button onClick={() => (held ? api.resume() : api.hold())}>{held ? "resume" : "hold"}</button>
        <button onClick={() => download(window.__aether)}>descargar registro</button>
      </div>
      <div style={{ maxHeight: 220, overflow: "auto", fontSize: 11, opacity: 0.85 }}>
        {log.slice(-40).reverse().map((l, i) => (
          <div key={i}>
            {(l.t / 1000).toFixed(2)} {l.type} {String(l.id ?? (l.ev as { type?: string })?.type ?? "")} {String(l.source ?? "")} {l.lateByMs != null ? `+${l.lateByMs}ms` : ""}
          </div>
        ))}
      </div>
    </div>
  );
};
const panelStyle: React.CSSProperties = { position: "fixed", right: 12, top: 12, width: 340, background: "rgba(4,10,20,0.92)", color: "#d7fbff", font: "12px 'IBM Plex Mono', monospace", padding: 12, border: "1px solid rgba(46,230,255,0.45)", boxShadow: "0 0 24px rgba(46,230,255,0.25)", display: "grid", gap: 4 };
function download(data: unknown) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: "application/json" }));
  a.download = `aether-registro-${Date.now()}.json`;
  a.click();
}

createRoot(document.getElementById("root")!).render(<App />);
