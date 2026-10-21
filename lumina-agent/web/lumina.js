/**
 * Lumina — cara animada + voz + conversación con un LLM local.
 *
 * Todo el archivo es el frontend del agente. Flujo:
 *   pantalla negra ── oír "Lumina" (o botón invisible arriba a la izquierda)
 *   ──► animación de encendido ──► Modo Conversación: el micrófono escucha,
 *   cada frase va a POST /lumina/ask (ver ../lumina.py), la respuesta se dice
 *   en voz alta con speechSynthesis y la cara reacciona.
 *
 * CONFIGURACIÓN (opcional, antes de cargar este script):
 *   <script>window.LUMINA_ASK_URL = "https://mi-servidor/lumina/ask";</script>
 *
 * COMANDOS DE CONSOLA
 *   setFaceExpression('feliz')   // inactivo neutral feliz confundido sorprendido
 *                                // pensando triste error escuchando activando
 *   askLumina('¿qué hora es?')   // manda una pregunta sin hablar
 *   localStorage.setItem('lumina_voice_override', 'jorge')  // fuerza una voz
 *   localStorage.removeItem('lumina_voice_override')        // vuelve a automática
 *
 * COMANDOS DE VOZ ("Lumina, ..."): "feliz", "triste", "confundida",
 * "sorprendida", "pensando", "error", "neutral", "inactiva" cambian la
 * expresión; "presentación" mantiene la cara feliz (dilo otra vez para quitarlo).
 *
 * HONESTIDAD (no describir esto de otra forma frente a terceros):
 *  - Las expresiones son estados visuales predefinidos; no hay ningún modelo
 *    que "sienta" nada. setFaceExpression() es el único gancho si algún día
 *    otro modelo decide la expresión.
 *  - La boca NO es un analizador de audio: speechSynthesis no se puede
 *    conectar a un AnalyserNode. Es una animación procedural con un empujón
 *    real en cada evento onboundary del motor de voz.
 *  - No se puede clonar la voz de un personaje (Jarvis, etc.): solo se elige
 *    la mejor voz en español instalada en el navegador/sistema.
 *  - El reconocimiento de voz es la Web Speech API del navegador (Chrome/Edge).
 *  - Los sonidos se generan con osciladores Web Audio; no hay archivos de audio.
 */

const ASK_URL = window.LUMINA_ASK_URL || "/lumina/ask";
const VOICE_OVERRIDE_KEY = "lumina_voice_override";

// 'boot' (pantalla negra) | 'conversation'
let mode = "boot";
// 'listening' | 'thinking' | 'speaking' — solo se mandan preguntas nuevas al
// LLM cuando es 'listening', para no pisar una pregunta en curso.
let conversationSubState = "listening";
let presentationModeActive = false;

const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
// false si no hay Web Speech API o se denegó el micrófono: mostrar
// 'escuchando' sin eso mentiría (ver restingExpression).
let voiceAvailable = !!SpeechRecognitionImpl;

let recognition = null;
let shouldKeepListening = true;
// true mientras el reconocimiento está apagado A PROPÓSITO porque Lumina habla.
let recognitionPausedForSpeech = false;

/** Apaga el micrófono justo antes de hablar. Bug real: seguía activo mientras
 * sonaba la respuesta, se transcribía a sí misma como pregunta nueva ("eco") y
 * disparaba una segunda respuesta que cortaba la primera. Se reinicia SOLO en
 * resumeRecognitionAfterSpeech(). */
function pauseRecognitionForSpeech() {
  if (!recognition) return;
  recognitionPausedForSpeech = true;
  try {
    recognition.stop();
  } catch {
    // ya estaba detenido
  }
}

function resumeRecognitionAfterSpeech() {
  if (!recognition) return;
  recognitionPausedForSpeech = false;
  if (!shouldKeepListening) return; // permiso denegado u otro error fatal
  try {
    recognition.start();
  } catch {
    // ya estaba corriendo (carrera esperada con el "end" del stop())
  }
}

// ============================================================================
// Motor de expresiones de la cara
// ============================================================================

// Coordenadas dentro del viewBox 0 0 1000 600 de index.html.
const EYE_L = { x: 300, y: 260 };
const EYE_R = { x: 700, y: 260 };

/** `d` de un ojo según su forma — parametrizado para que una expresión nueva
 * sea una fila de EXPRESSIONS y no un path nuevo dibujado a mano. */
function eyePath(shape, cx, cy) {
  switch (shape) {
    case "closed":
      return `M ${cx - 62} ${cy} L ${cx + 62} ${cy}`;
    case "happy": // "^"
      return `M ${cx - 64} ${cy + 18} Q ${cx} ${cy - 62} ${cx + 64} ${cy + 18}`;
    case "sad":
      return `M ${cx - 64} ${cy - 26} Q ${cx} ${cy + 46} ${cx + 64} ${cy - 26}`;
    case "wide": // sorpresa
      return circlePath(cx, cy, 94);
    case "squint": // confundido
      return `M ${cx - 64} ${cy} Q ${cx} ${cy - 28} ${cx + 64} ${cy} Q ${cx} ${cy + 28} ${cx - 64} ${cy} Z`;
    case "arc": // "pensando": 270° con hueco de 90° para leerse como spinner
      return arcPath(cx, cy, 68, 270);
    case "x": // error
      return `M ${cx - 48} ${cy - 48} L ${cx + 48} ${cy + 48} M ${cx - 48} ${cy + 48} L ${cx + 48} ${cy - 48}`;
    case "open":
    default:
      // Cápsula/visor: se lee como visor sci-fi, no como ojo de muñeca.
      return capsulePath(cx, cy, 104, 46);
  }
}

function circlePath(cx, cy, r) {
  return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`;
}

/** Cápsula horizontal; hw/hh = medio-ancho y medio-alto totales. */
function capsulePath(cx, cy, hw, hh) {
  const left = cx - hw + hh;
  const right = cx + hw - hh;
  const top = cy - hh;
  const bottom = cy + hh;
  return (
    `M ${left} ${top} L ${right} ${top} ` +
    `A ${hh} ${hh} 0 0 1 ${right} ${bottom} ` +
    `L ${left} ${bottom} ` +
    `A ${hh} ${hh} 0 0 1 ${left} ${top} Z`
  );
}

/** Arco parcial desde arriba (-90°) en sentido horario. */
function arcPath(cx, cy, r, sweepDeg) {
  const startDeg = -90;
  const endDeg = startDeg + sweepDeg;
  const toRad = (d) => (d * Math.PI) / 180;
  const sx = (cx + r * Math.cos(toRad(startDeg))).toFixed(1);
  const sy = (cy + r * Math.sin(toRad(startDeg))).toFixed(1);
  const ex = (cx + r * Math.cos(toRad(endDeg))).toFixed(1);
  const ey = (cy + r * Math.sin(toRad(endDeg))).toFixed(1);
  const largeArc = sweepDeg > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`;
}

/** Ceja: "raised" (sorpresa/confusión) o "sad" (caída hacia el centro). */
function browPath(shape, cx, cy) {
  const y = cy - 132;
  if (shape === "sad") return `M ${cx - 72} ${y + 28} L ${cx + 72} ${y - 18}`;
  return `M ${cx - 72} ${y} L ${cx + 72} ${y - 36}`;
}

/** Boca de reposo: ancho fijo, altura del arco según el tipo. */
function mouthPath(shape) {
  const cx = 500;
  const y = 430;
  const w = 190;
  switch (shape) {
    case "smile":
      return `M ${cx - w} ${y} Q ${cx} ${y + 145} ${cx + w} ${y}`;
    case "frown":
      return `M ${cx - w} ${y + 80} Q ${cx} ${y - 68} ${cx + w} ${y + 80}`;
    case "o":
      return circlePath(cx, y + 28, 62);
    case "zigzag": // confundido
      return `M ${cx - w} ${y} L ${cx - w / 2} ${y + 70} L ${cx} ${y} L ${cx + w / 2} ${y + 70} L ${cx + w} ${y}`;
    case "flat":
    default:
      return `M ${cx - w} ${y} L ${cx + w} ${y}`;
  }
}

/** Las 10 expresiones: 3 funcionales (inactivo, escuchando, activando) + 7
 * emocionales. Cada una es declarativa: forma de ojo/ceja/boca, pupila, color
 * de acento y animaciones especiales. Agregar una = agregar una fila aquí.
 *   idleBlink: parpadea solo de vez en cuando
 *   gazeDrift: la pupila deriva sola (solo en reposo prolongado; se omite en
 *              las que ya tienen un gesto propio)
 */
const EXPRESSIONS = {
  inactivo: { eye: "open", mouth: "flat", pupil: true, accent: "accent", idleBlink: true, gazeDrift: true },
  neutral: { eye: "open", mouth: "flat", pupil: true, accent: "accent", gazeDrift: true },
  feliz: { eye: "happy", mouth: "smile", pupil: false, accent: "positive" },
  confundido: {
    eye: "squint",
    eyeR: "open",
    mouth: "zigzag",
    pupil: true,
    browL: "raised",
    accent: "warn",
    tilt: true,
  },
  sorprendido: {
    eye: "wide",
    mouth: "o",
    pupil: true,
    browL: "raised",
    browR: "raised",
    accent: "accent",
  },
  pensando: { eye: "arc", eyeSpin: true, mouth: "flat", pupil: false, accent: "accent", dots: true },
  triste: { eye: "sad", mouth: "frown", pupil: false, browL: "sad", browR: "sad", accent: "muted" },
  error: { eye: "x", mouth: "flat", pupil: false, accent: "warn", pulse: true },
  // Estado de reposo real de Modo Conversación: necesita sentirse vivo.
  escuchando: {
    eye: "open",
    mouth: "flat",
    pupil: true,
    accent: "accent",
    ring: true,
    idleBlink: true,
    gazeDrift: true,
  },
  activando: { eye: "wide", mouth: "o", pupil: true, accent: "positive", pulse: true },
};

const ACCENT_VAR = {
  accent: "--accent",
  positive: "--positive",
  warn: "--warn",
  muted: "--text-muted",
};

const faceScreenEl = document.getElementById("face-screen");
const faceSvg = document.getElementById("face-svg");
const eyeLeftEl = document.getElementById("eye-left");
const eyeRightEl = document.getElementById("eye-right");
const browLeftEl = document.getElementById("brow-left");
const browRightEl = document.getElementById("brow-right");
const pupilLeftEl = document.getElementById("pupil-left");
const pupilRightEl = document.getElementById("pupil-right");
const mouthEl = document.getElementById("face-mouth");
const thinkingDotsEl = document.getElementById("thinking-dots");
const listeningGlowEls = ["listening-ring", "listening-ring-2", "listening-ring-3"].map((id) =>
  document.getElementById(id),
);
const faceStageEl = document.getElementById("face-stage");
const statusIndicatorEl = document.getElementById("status-indicator");

let currentExpression = null;
let idleBlinkTimer = null;

function applyExpression(cfg) {
  eyeLeftEl.setAttribute("d", eyePath(cfg.eyeL || cfg.eye, EYE_L.x, EYE_L.y));
  eyeRightEl.setAttribute("d", eyePath(cfg.eyeR || cfg.eye, EYE_R.x, EYE_R.y));

  // 'pensando' gira por CSS: se limpia el transform inline del parpadeo para
  // que no compitan por la misma propiedad.
  eyeLeftEl.classList.toggle("face-eye--spin", !!cfg.eyeSpin);
  eyeRightEl.classList.toggle("face-eye--spin", !!cfg.eyeSpin);
  if (cfg.eyeSpin) {
    eyeLeftEl.style.transform = "";
    eyeRightEl.style.transform = "";
  }

  browLeftEl.classList.toggle("face-brow--visible", !!cfg.browL);
  browRightEl.classList.toggle("face-brow--visible", !!cfg.browR);
  if (cfg.browL) browLeftEl.setAttribute("d", browPath(cfg.browL, EYE_L.x, EYE_L.y));
  if (cfg.browR) browRightEl.setAttribute("d", browPath(cfg.browR, EYE_R.x, EYE_R.y));

  mouthEl.setAttribute("d", mouthPath(cfg.mouth));

  // cx/cy y visibilidad de las pupilas las gobierna livelinessFrame; aquí solo
  // se fija el OBJETIVO y se limpia la deriva de la expresión anterior.
  gazeBaseOffset = cfg.pupilOffset || { dx: 0, dy: 0 };
  gazeDriftOffset = { dx: 0, dy: 0 };

  thinkingDotsEl.classList.toggle("face-dots--visible", !!cfg.dots);
  listeningGlowEls.forEach((el) => el.classList.toggle("face-glow--active", !!cfg.ring));
  faceSvg.classList.toggle("face--pulse", !!cfg.pulse);
  faceSvg.classList.toggle("face--tilt", !!cfg.tilt);

  // En #face-screen: lo heredan tanto el SVG como .face-ambient.
  const varName = ACCENT_VAR[cfg.accent] || ACCENT_VAR.accent;
  faceScreenEl.style.setProperty("--face-accent", `var(${varName})`);
}

/** Mueve eyeOpennessTarget entre 0 y 1; livelinessFrame anima scaleY hacia él
 * (cierre rápido, apertura más lenta). Parpadeo variado a propósito: cuánto
 * se queda cerrado cambia, y el 15% de las veces es doble. */
function triggerBlink() {
  const name = currentExpression;
  const cfg = EXPRESSIONS[name];
  if (!cfg || !cfg.idleBlink) return;

  const holdClosedMs = 90 + Math.random() * 70;
  const isDoubleBlink = Math.random() < 0.15;

  eyeOpennessTarget = 0;
  setTimeout(() => {
    if (currentExpression !== name) return;
    eyeOpennessTarget = 1;
    if (isDoubleBlink) {
      setTimeout(() => {
        if (currentExpression !== name) return;
        eyeOpennessTarget = 0;
        setTimeout(() => {
          if (currentExpression === name) eyeOpennessTarget = 1;
        }, holdClosedMs);
      }, 100);
    }
  }, holdClosedMs);
}

/** Siguiente parpadeo a intervalo aleatorio (recursivo, no setInterval fijo);
 * se detiene solo cuando la expresión activa ya no tiene idleBlink. */
function scheduleNextBlink() {
  clearTimeout(idleBlinkTimer);
  const cfg = EXPRESSIONS[currentExpression];
  if (!cfg || !cfg.idleBlink) return;
  idleBlinkTimer = setTimeout(
    () => {
      triggerBlink();
      scheduleNextBlink();
    },
    2500 + Math.random() * 3500,
  );
}

// ---- Deriva de mirada: vistazo ocasional, lento (1.5–3.5s) y de poca
// amplitud — uno constante o brusco marea si alguien lo ve fijo minutos.
let gazeDriftTimer = null;
let gazeBaseOffset = { dx: 0, dy: 0 };
let gazeDriftOffset = { dx: 0, dy: 0 };
let pupilCurrent = { dx: 0, dy: 0 };

function scheduleNextGazeDrift() {
  clearTimeout(gazeDriftTimer);
  gazeDriftTimer = setTimeout(
    () => {
      if (EXPRESSIONS[currentExpression]?.gazeDrift) {
        gazeDriftOffset = {
          dx: Math.round((Math.random() - 0.5) * 40),
          dy: Math.round((Math.random() - 0.5) * 28),
        };
      }
      scheduleNextGazeDrift();
    },
    1500 + Math.random() * 2000,
  );
}

// ============================================================================
// ANIMACIÓN CONTINUA (un solo requestAnimationFrame): boca reactiva a la voz,
// parpadeo asimétrico y glow dinámico, todo con easing
// (current += (target - current) * factor) en vez de saltos.
//
// La boca es una aproximación procedural (ver HONESTIDAD arriba): 3 "bandas"
// que se re-sortean solas mientras se habla, más un empujón real por cada
// onboundary de la síntesis.
// ============================================================================

const MOUTH_EASE = 0.35;
const PUPIL_EASE = 0.08;
const EYE_CLOSE_EASE = 0.55;
const EYE_OPEN_EASE = 0.16;
const GLOW_EASE = 0.12;
const GLOW_IDLE_TARGET = 0.12; // nunca 0 plano: presencia sutil incluso callada

let mouthBandTargets = [0, 0, 0]; // grave (apertura) / media (esquina izq.) / aguda (esquina der.)
let mouthBandCurrent = [0, 0, 0];
let mouthNeedsReset = false; // true tras hablar, hasta que las bandas se asienten en ~0
let talking = false;
let mouthBandTimer = null;

let eyeOpenness = 1; // 0 cerrado, 1 abierto
let eyeOpennessTarget = 1;

let glowIntensity = GLOW_IDLE_TARGET;
let glowTarget = GLOW_IDLE_TARGET;

/** Boca al hablar: forma CERRADA (labio superior + inferior). Una curva
 * abierta con fill:none no se lee como boca abriendo/cerrando (bug real:
 * "solo parecen líneas moviéndose"); con apertura 0 los labios colapsan en
 * una línea = boca cerrada de verdad. */
function mouthTalkPath(bands) {
  const cx = 500;
  const midY = 430;
  const w = 190;
  const [low, mid, high] = bands;
  const openAmount = low * 95;
  const leftY = midY - mid * 18;
  const rightY = midY - high * 18;
  const topY = midY - openAmount * 0.55;
  const bottomY = midY + openAmount * 0.85;
  return (
    `M ${cx - w} ${leftY} ` +
    `Q ${cx} ${topY} ${cx + w} ${rightY} ` +
    `Q ${cx} ${bottomY} ${cx - w} ${leftY} Z`
  );
}

/** Re-sortea las bandas a ritmo variable (70–140ms) mientras `talking`. La
 * banda grave usa el rango completo 0–1 (un piso >0 nunca dejaba cerrar). */
function randomizeMouthBandTargets() {
  mouthBandTargets = [Math.random(), Math.random() * 0.6, Math.random() * 0.6];
  if (!talking) return;
  mouthBandTimer = setTimeout(randomizeMouthBandTargets, 70 + Math.random() * 70);
}

function startTalkingAnimation() {
  talking = true;
  mouthNeedsReset = true;
  clearTimeout(mouthBandTimer);
  randomizeMouthBandTargets();
}

function stopTalkingAnimation() {
  talking = false;
  clearTimeout(mouthBandTimer);
  mouthBandTargets = [0, 0, 0]; // el loop las relaja solas hacia 0
}

/** onboundary real de SpeechSynthesisUtterance: el único timing de habla genuino. */
function mouthBoundaryBurst() {
  mouthBandTargets[0] = Math.min(1, mouthBandTargets[0] + 0.25);
}

function currentBaseMouthShape() {
  const cfg = EXPRESSIONS[currentExpression];
  return cfg ? cfg.mouth : "flat";
}

function livelinessFrame() {
  // --- Boca ---
  let bandsMoving = false;
  for (let i = 0; i < 3; i++) {
    const delta = mouthBandTargets[i] - mouthBandCurrent[i];
    mouthBandCurrent[i] += delta * MOUTH_EASE;
    if (Math.abs(delta) > 0.004) bandsMoving = true;
  }
  if (talking || bandsMoving) {
    mouthEl.setAttribute("d", mouthTalkPath(mouthBandCurrent));
    mouthNeedsReset = true;
  } else if (mouthNeedsReset) {
    mouthEl.setAttribute("d", mouthPath(currentBaseMouthShape()));
    mouthNeedsReset = false;
  }

  const avgBand = (mouthBandCurrent[0] + mouthBandCurrent[1] + mouthBandCurrent[2]) / 3;

  // --- Parpadeo (easing asimétrico) + pupilas ---
  const cfg = EXPRESSIONS[currentExpression];
  const blinkFactor = eyeOpennessTarget < eyeOpenness ? EYE_CLOSE_EASE : EYE_OPEN_EASE;
  eyeOpenness += (eyeOpennessTarget - eyeOpenness) * blinkFactor;
  const scaleY = Math.max(0.05, eyeOpenness).toFixed(3);
  // 'pensando' gira por CSS: su transform no se toca aquí.
  if (!cfg?.eyeSpin) {
    // Al hablar, un leve scaleX atado a la energía de la boca.
    const talkScaleX = talking ? (1 - avgBand * 0.05).toFixed(3) : 1;
    eyeLeftEl.style.transform = `scaleY(${scaleY}) scaleX(${talkScaleX})`;
    eyeRightEl.style.transform = `scaleY(${scaleY}) scaleX(${talkScaleX})`;
  }
  const pupilShouldShow = !!cfg?.pupil && eyeOpenness > 0.35;
  pupilLeftEl.classList.toggle("face-pupil--visible", pupilShouldShow);
  pupilRightEl.classList.toggle("face-pupil--visible", pupilShouldShow);

  pupilCurrent.dx += (gazeBaseOffset.dx + gazeDriftOffset.dx - pupilCurrent.dx) * PUPIL_EASE;
  pupilCurrent.dy += (gazeBaseOffset.dy + gazeDriftOffset.dy - pupilCurrent.dy) * PUPIL_EASE;
  pupilLeftEl.setAttribute("cx", EYE_L.x + pupilCurrent.dx);
  pupilLeftEl.setAttribute("cy", EYE_L.y + pupilCurrent.dy);
  pupilRightEl.setAttribute("cx", EYE_R.x + pupilCurrent.dx);
  pupilRightEl.setAttribute("cy", EYE_R.y + pupilCurrent.dy);

  // --- Glow dinámico (ver .face-eye/.face-mouth en lumina.css) ---
  glowTarget = talking ? Math.min(1, avgBand * 1.3) : GLOW_IDLE_TARGET;
  glowIntensity += (glowTarget - glowIntensity) * GLOW_EASE;
  faceScreenEl.style.setProperty("--talk-glow", glowIntensity.toFixed(3));

  updateStatusIndicator();
  requestAnimationFrame(livelinessFrame);
}
requestAnimationFrame(livelinessFrame);

// Se lee cada frame (en vez de engancharse a cada cambio de estado) para no
// poder "olvidar" un call site; solo toca el DOM cuando el texto cambia.
let lastStatusLabel = null;
function updateStatusIndicator() {
  let label = "";
  if (mode === "conversation") {
    if (talking) {
      label = "HABLANDO...";
    } else if (conversationSubState === "thinking") {
      label = "PENSANDO...";
    } else if (conversationSubState === "listening" && currentExpression === "escuchando") {
      // Solo si la expresión es realmente 'escuchando': restingExpression()
      // ya comprueba que el reconocimiento exista; sin eso mentiría.
      label = "ESCUCHANDO...";
    }
  }
  if (label === lastStatusLabel) return;
  lastStatusLabel = label;
  statusIndicatorEl.textContent = label;
  statusIndicatorEl.classList.toggle("status-indicator--visible", label !== "");
}

/** Cambia la expresión de la cara. Válidas: las llaves de EXPRESSIONS. */
function setFaceExpression(name) {
  const cfg = EXPRESSIONS[name];
  if (!cfg) {
    console.warn(`Lumina: expresión desconocida "${name}". Válidas: ${Object.keys(EXPRESSIONS).join(", ")}`);
    return;
  }
  const isChange = name !== currentExpression;
  currentExpression = name;
  applyExpression(cfg);
  if (cfg.idleBlink) {
    scheduleNextBlink();
  } else {
    clearTimeout(idleBlinkTimer);
  }
  if (isChange) playExpressionSound(name);
}
window.setFaceExpression = setFaceExpression;

/** 'feliz' sostenida en Modo Presentación; 'escuchando' si hay reconocimiento
 * real disponible; 'inactivo' si no (más honesto que mentir). */
function restingExpression() {
  if (presentationModeActive) return "feliz";
  return voiceAvailable ? "escuchando" : "inactivo";
}

// ============================================================================
// Efectos de sonido — Web Audio API, osciladores generados en vivo.
// ============================================================================

let audioCtx = null;

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  // Los navegadores crean el contexto "suspended" hasta el primer gesto real
  // del usuario: antes de eso no suena, es la política estándar de autoplay.
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

/** Tono simple de freqStart a freqEnd, con caída de volumen para no "tronar". */
function playTone({ freqStart, freqEnd = freqStart, duration = 0.15, gain = 0.06 }) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
    }
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gainNode).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn("Lumina: no se pudo reproducir sonido.", err);
  }
}

// Un tono por categoría, no uno por cada expresión.
const EXPRESSION_SOUND_CATEGORY = {
  inactivo: "neutral",
  neutral: "neutral",
  feliz: "positive",
  confundido: "neutral",
  sorprendido: "neutral",
  pensando: "neutral",
  triste: "negative",
  error: "negative",
  escuchando: "neutral",
  activando: "startup",
};

function playExpressionSound(name) {
  switch (EXPRESSION_SOUND_CATEGORY[name]) {
    case "positive":
      playTone({ freqStart: 480, freqEnd: 760, duration: 0.18 });
      break;
    case "negative":
      playTone({ freqStart: 480, freqEnd: 260, duration: 0.22 });
      break;
    case "startup": // dos notas ascendentes rápidas: "encendiendo"
      playTone({ freqStart: 392, freqEnd: 523, duration: 0.14, gain: 0.07 });
      setTimeout(() => playTone({ freqStart: 523, freqEnd: 784, duration: 0.18, gain: 0.07 }), 130);
      break;
    case "neutral":
    default:
      playTone({ freqStart: 420, duration: 0.08, gain: 0.04 });
      break;
  }
}

// ============================================================================
// Pantalla de espera (arranque) — negra hasta oír "Lumina" o usar el botón
// invisible de la esquina superior izquierda.
// ============================================================================

const bootScreenEl = document.getElementById("boot-screen");
const bootFlashEl = document.getElementById("boot-flash");
const bootHiddenBtn = document.getElementById("boot-hidden-btn");

let awakened = false; // evita encender dos veces

function enterConversationMode() {
  mode = "conversation";
  conversationSubState = "listening";
  setFaceExpression(restingExpression());
}

/** Destello + encendido progresivo; reutiliza 'activando' (que ya trae su
 * sonido de encendido). */
function wake() {
  if (awakened) return;
  awakened = true;
  bootFlashEl.classList.add("boot-flash--active");
  setTimeout(() => {
    setFaceExpression("activando");
    bootScreenEl.classList.add("boot-screen--hidden");
  }, 150);
  setTimeout(() => {
    bootFlashEl.classList.remove("boot-flash--active");
    enterConversationMode();
  }, 950);
}

bootHiddenBtn.addEventListener("click", wake);

// ============================================================================
// Modo Conversación — LLM (POST ASK_URL) + síntesis de voz
// ============================================================================

// Heurística simple por palabras clave (no análisis de sentimiento real) para
// elegir con qué expresión reacciona Lumina a su propia respuesta. "No sé" es
// honestidad, no un fallo: se lee 'confundido', distinto de una disculpa real
// ('triste').
const UNCERTAIN_PATTERN =
  /\b(no s[ée]|no tengo (esa|esta|la) informaci[oó]n|no tengo acceso|no estoy segur[oa]|no puedo (recordar|asegurar|confirmar)|no tengo certeza|no lo s[ée] (con exactitud|con certeza))\b/i;
const APOLOGETIC_PATTERN =
  /\b(lo siento|disculpa|perd[oó]n|desafortunadamente|lamentablemente|qu[eé] pena|me entristece|triste)\b/i;
const POSITIVE_PATTERN =
  /\b(genial|excelente|perfecto|claro que s[ií]|con gusto|encantad[oa]|me encant\w*|feliz|content[oa]|alegre|entusiasmad[oa]|emocionad[oa]|maravillos[oa]|fant[aá]stic[oa]|incre[ií]ble|qu[eé] alegr[ií]a|orgullos[oa])\b/i;

/** Gana la categoría cuya ÚLTIMA coincidencia aparece más tarde en el texto: el
 * tono con que termina la respuesta es el más representativo. (Bug real: con
 * "la primera categoría gana", "Me encanta ayudar, aunque no estoy segura"
 * quedaba en 'confundido' por el orden de revisión y no por la idea principal.) */
function chooseExpressionForAnswer(text) {
  if (presentationModeActive) return "feliz";

  const categories = [
    { name: "confundido", pattern: UNCERTAIN_PATTERN },
    { name: "triste", pattern: APOLOGETIC_PATTERN },
    { name: "feliz", pattern: POSITIVE_PATTERN },
  ];

  let winnerName = null;
  let winnerLastIndex = -1;
  for (const { name, pattern } of categories) {
    const globalPattern = new RegExp(pattern.source, "gi");
    let match;
    let lastIndex = -1;
    while ((match = globalPattern.exec(text)) !== null) lastIndex = match.index;
    if (lastIndex > winnerLastIndex) {
      winnerLastIndex = lastIndex;
      winnerName = name;
    }
  }
  return winnerName || "neutral";
}

// ---- Selección de voz --------------------------------------------------------
// La Web Speech API no permite clonar la voz de un personaje ni dice el género
// de una voz: se infiere por el nombre propio con una lista CURADA A MANO (no
// exhaustiva) de nombres masculinos de las voces "Online (Natural)" de
// Microsoft en es-MX/es-ES/es-US/es-AR.
let selectedVoice = null;
let voicesLoggedOnce = false;

const MALE_VOICE_NAME_HINTS = ["jorge", "alvaro", "álvaro", "alonso", "tomas", "tomás"];
// Voz LOCAL (no de red) confirmada masculina: "Microsoft Raul - Spanish (Mexico)".
const MALE_VOICE_LOCAL_HINTS = ["raul", "raúl"];

/** Mejor voz en español disponible. Primero se decide el IDIOMA (es-MX si hay,
 * cualquier otro es-* de respaldo — bug real: sin distinguir país eligió una
 * es-AR teniendo una es-MX), y dentro del grupo esta cascada:
 *  1. override manual por localStorage (máxima prioridad, cualquier idioma)
 *  2. voz de red con nombre masculino conocido
 *  3. voz local con nombre masculino conocido
 *  4. cualquier voz de red
 *  5. cualquier voz que no sea "compact" (más robótica)
 *  6. la primera que haya */
function pickBestSpanishVoice(voices) {
  const spanishVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("es"));
  if (spanishVoices.length === 0) return null;

  const isCompact = (v) => /compact/i.test(v.name);
  const isNetwork = (v) => v.localService === false;
  const matchesAny = (v, hints) => hints.some((hint) => v.name.toLowerCase().includes(hint));

  let override = "";
  try {
    override = (localStorage.getItem(VOICE_OVERRIDE_KEY) || "").trim().toLowerCase();
  } catch {
    // localStorage no disponible (ej. modo privado estricto)
  }
  if (override) {
    const forced = spanishVoices.find((v) => v.name.toLowerCase().includes(override));
    if (forced) return forced;
    console.warn(`Lumina: ${VOICE_OVERRIDE_KEY}="${override}" no coincide con ninguna voz en español — se ignora.`);
  }

  const pickFromCandidates = (candidates) =>
    candidates.find((v) => isNetwork(v) && matchesAny(v, MALE_VOICE_NAME_HINTS) && !isCompact(v)) ||
    candidates.find((v) => matchesAny(v, MALE_VOICE_LOCAL_HINTS) && !isCompact(v)) ||
    candidates.find((v) => isNetwork(v) && !isCompact(v)) ||
    candidates.find((v) => !isCompact(v)) ||
    candidates[0];

  const mexicanVoices = spanishVoices.filter((v) => v.lang.toLowerCase() === "es-mx");
  return pickFromCandidates(mexicanVoices.length > 0 ? mexicanVoices : spanishVoices);
}

/** getVoices() puede devolver [] al principio: la lista real llega async vía
 * "voiceschanged", por eso se llama al cargar y en cada disparo del evento. */
function refreshSelectedVoice() {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;

  if (!voicesLoggedOnce) {
    voicesLoggedOnce = true;
    // Solo las de español: Edge/Chrome traen 500+ y la consola trunca ese array.
    const spanish = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("es"));
    console.log(
      `Lumina · voces en español disponibles (${spanish.length}):`,
      spanish.map((v) => `${v.name} (${v.lang})${v.localService === false ? " · red" : ""}`),
    );
  }

  const best = pickBestSpanishVoice(voices);
  if (best && best !== selectedVoice) {
    selectedVoice = best;
    const isMexican = best.lang.toLowerCase() === "es-mx";
    console.log(
      `Lumina · voz elegida: ${best.name} (${best.lang})` +
        (isMexican ? " · es-MX" : " · NO es es-MX, ningún es-MX disponible — respaldo de otro país"),
    );
  }
}

if ("speechSynthesis" in window) {
  refreshSelectedVoice();
  window.speechSynthesis.onvoiceschanged = refreshSelectedVoice;
}

/** Dice `text` en voz alta con la mejor voz disponible y un timbre cálido. */
function speak(text, { onend } = {}) {
  if (!("speechSynthesis" in window)) {
    console.warn("Lumina: speechSynthesis no está disponible en este navegador.");
    if (onend) onend();
    return;
  }
  // Micrófono completamente apagado mientras habla (ver pauseRecognitionForSpeech).
  pauseRecognitionForSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-MX";
  utterance.pitch = 1.1; // cálido, no robótico
  utterance.rate = 1.0;
  if (selectedVoice) utterance.voice = selectedVoice;

  utterance.onstart = () => startTalkingAnimation();
  // Algunos navegadores/voces nunca disparan onboundary: la boca sigue viva.
  utterance.onboundary = () => mouthBoundaryBurst();

  const finish = () => {
    stopTalkingAnimation();
    resumeRecognitionAfterSpeech();
    if (onend) onend();
  };
  utterance.onend = finish;
  utterance.onerror = (event) => {
    console.warn("Lumina: error de síntesis de voz.", event);
    finish();
  };

  window.speechSynthesis.cancel(); // corta cualquier habla anterior
  window.speechSynthesis.speak(utterance);
}

/** Le manda `question` a Lumina y dice la respuesta. Solo debe llamarse con
 * conversationSubState === 'listening' (handleVoiceCommand ya lo garantiza). */
async function askLumina(question) {
  conversationSubState = "thinking";
  setFaceExpression("pensando");

  let answer;
  try {
    const response = await fetch(ASK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      throw new Error(detail?.detail || `Lumina no pudo responder (error ${response.status}).`);
    }
    answer = (await response.json()).answer;
  } catch (err) {
    console.warn("Lumina: no se pudo consultar a Lumina.", err);
    conversationSubState = "listening";
    setFaceExpression("error");
    setTimeout(() => {
      if (conversationSubState === "listening") setFaceExpression(restingExpression());
    }, 2000);
    return;
  }

  console.log(`Lumina · responde: "${answer}"`);
  setFaceExpression(chooseExpressionForAnswer(answer));
  conversationSubState = "speaking";
  speak(answer, {
    onend: () => {
      conversationSubState = "listening";
      setFaceExpression(restingExpression());
    },
  });
}

// ============================================================================
// Comandos de voz — Web Speech API nativa. Diagnóstico por consola + un punto
// de estado mínimo (la vista de reposo debe sentirse como presencia, no como
// una interfaz con indicadores).
// ============================================================================

const voiceStatusDotEl = document.getElementById("voice-status-dot");

// Tolerancia real: NO se busca una frase completa (ya falló una vez); se
// detecta "lumina" (o variantes que el motor podría transcribir) en cualquier
// parte, y por separado la palabra de comando, sin importar el orden.
const LUMINA_PATTERN = /\b(lumina|ilumina|luminia|lumia|lumnia)\b/i;
const PRESENTATION_PATTERN = /\b(presentaci[oó]n|present[aá]te)\b/i;
const EXPRESSION_VOICE_PATTERNS = [
  { name: "feliz", pattern: /\bfeliz\b/i },
  { name: "confundido", pattern: /\bconfundid[oa]\b/i },
  { name: "sorprendido", pattern: /\bsorprendid[oa]\b/i },
  { name: "pensando", pattern: /\bpensando\b/i },
  { name: "triste", pattern: /\btriste\b/i },
  { name: "error", pattern: /\berror\b/i },
  { name: "neutral", pattern: /\bneutral\b/i },
  // "inectivo" es una mistranscripción real observada de "inactivo".
  { name: "inactivo", pattern: /\b(inactiv[oa]|inectiv[oa])\b/i },
];

function togglePresentationMode() {
  presentationModeActive = !presentationModeActive;
  console.log(`Lumina · modo presentación: ${presentationModeActive ? "activado" : "desactivado"}`);
  if (conversationSubState === "listening") setFaceExpression(restingExpression());
}

// El navegador a veces parte un comando corto ("lumina inicio") en DOS
// resultados finales; evaluados por separado, el fragmento suelto terminaba
// mandándose al LLM como pregunta basura. Se acumulan en un buffer y se evalúa
// el texto combinado tras un breve silencio.
const VOICE_COMMAND_DEBOUNCE_MS = 600;
let pendingTranscriptBuffer = "";
let voiceCommandDebounceTimer = null;

function queueVoiceFragment(transcript) {
  pendingTranscriptBuffer = pendingTranscriptBuffer ? `${pendingTranscriptBuffer} ${transcript}` : transcript;
  clearTimeout(voiceCommandDebounceTimer);
  voiceCommandDebounceTimer = setTimeout(() => {
    const combined = pendingTranscriptBuffer;
    pendingTranscriptBuffer = "";
    console.log(`Lumina · escuchado (${mode}): "${combined}"`);
    handleVoiceCommand(combined);
  }, VOICE_COMMAND_DEBOUNCE_MS);
}

// "Iniciar presentación": corre el pitch de guion.json (voz + expresión por línea).
// 'expositor' y 'cue' no se sintetizan (los dice la persona / son notas).
const START_PRESENTATION_PATTERN = /iniciar.*presentaci[oó]n/i;
let scriptRunning = false;

async function runPresentationScript() {
  scriptRunning = true;
  try {
    const script = await (await fetch("guion.json")).json();
    for (const seg of script) {
      if (seg.speaker === "aether") {
        setFaceExpression(seg.mood || "neutral");
        await new Promise((done) => speak(seg.text, { onend: done }));
      } else if (seg.speaker === "cue") {
        console.log(`Lumina · guion: ${seg.text}`);
      }
      if (seg.pause) await new Promise((r) => setTimeout(r, seg.pause * 1000));
    }
  } catch (err) {
    console.warn("Lumina: no se pudo correr el guion.", err);
  } finally {
    scriptRunning = false;
    setFaceExpression(restingExpression());
  }
}

/** Un solo lugar decide qué hacer con una frase YA FINALIZADA. */
function handleVoiceCommand(transcript) {
  // Pantalla negra: lo único que se procesa es la palabra de encendido.
  if (mode === "boot") {
    if (LUMINA_PATTERN.test(transcript)) wake();
    return;
  }

  if (scriptRunning) return;
  if (START_PRESENTATION_PATTERN.test(transcript)) {
    runPresentationScript();
    return;
  }

  const heardLumina = LUMINA_PATTERN.test(transcript);

  if (heardLumina && PRESENTATION_PATTERN.test(transcript)) {
    togglePresentationMode();
    return;
  }

  if (heardLumina) {
    const expression = EXPRESSION_VOICE_PATTERNS.find(({ pattern }) => pattern.test(transcript));
    if (expression) {
      setFaceExpression(expression.name); // comando manual de prueba: no va al LLM
      return;
    }
  }

  if (conversationSubState !== "listening") return; // ya está pensando/hablando
  askLumina(transcript);
}

// Mensajes en español para SpeechRecognitionErrorEvent.error.
const VOICE_ERROR_MESSAGES = {
  "no-speech": "no se detectó voz (normal en reconocimiento continuo; reintenta solo)",
  "audio-capture": "no se encontró ningún micrófono disponible",
  "not-allowed": "permiso de micrófono denegado",
  "service-not-allowed": "el navegador bloqueó el servicio de reconocimiento de voz",
  network: "error de red con el servicio de reconocimiento de voz",
  aborted: "reconocimiento cancelado",
  "language-not-supported": "el idioma configurado (es-MX) no está soportado",
  "bad-grammar": "error de gramática de reconocimiento",
};

function setListeningIndicator(active) {
  voiceStatusDotEl.classList.toggle("voice-status-dot--listening", active);
  voiceStatusDotEl.title = active
    ? "Reconocimiento de voz: escuchando activamente"
    : "Reconocimiento de voz: inactivo";
  console.log(active ? "Lumina · reconocimiento: escuchando" : "Lumina · reconocimiento: inactivo");
}

function setAttentionIndicator(message) {
  voiceStatusDotEl.classList.remove("voice-status-dot--listening");
  voiceStatusDotEl.classList.add("voice-status-dot--attention");
  voiceStatusDotEl.title = `Voz: ${message}`;
}

async function logMicPermission() {
  if (!navigator.permissions || !navigator.permissions.query) {
    console.log("Lumina · micrófono: este navegador no permite verificar el permiso.");
    return;
  }
  try {
    const status = await navigator.permissions.query({ name: "microphone" });
    const labels = { granted: "permitido", denied: "denegado", prompt: "pendiente de confirmar" };
    const logState = (s) => {
      console.log(`Lumina · micrófono: ${labels[s] || s}`);
      if (s === "denied") setAttentionIndicator("micrófono denegado");
    };
    logState(status.state);
    status.onchange = () => logState(status.state); // si lo cambian con la pestaña abierta
  } catch {
    console.log("Lumina · micrófono: este navegador no permite verificar el permiso.");
  }
}

logMicPermission();

if (SpeechRecognitionImpl) {
  recognition = new SpeechRecognitionImpl();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "es-MX";

  recognition.addEventListener("start", () => setListeningIndicator(true));

  // event.results acumula TODO lo dicho desde que arrancó la sesión (minutos):
  // unirlo mezclaba comandos dichos en momentos distintos. resultIndex marca
  // lo NUEVO, y solo se toman resultados YA FINALIZADOS (isFinal).
  recognition.addEventListener("result", (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (!result.isFinal) continue;
      const transcript = result[0].transcript.toLowerCase().trim();
      if (transcript) queueVoiceFragment(transcript);
    }
  });

  recognition.addEventListener("error", (event) => {
    const message = VOICE_ERROR_MESSAGES[event.error] || event.error;
    console.warn(`Lumina · error de voz: ${message}`);

    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      shouldKeepListening = false;
      voiceAvailable = false;
      setAttentionIndicator(message);
      if (mode === "conversation" && conversationSubState === "listening") {
        setFaceExpression(restingExpression());
      }
    }
    // los demás ("no-speech", "network") son transitorios: "end" reinicia solo.
  });

  // El reconocimiento "continuo" igual se corta tras un silencio: hay que
  // reiniciarlo a mano. Si el corte fue A PROPÓSITO (Lumina hablando), lo
  // reinicia resumeRecognitionAfterSpeech(), nunca antes.
  recognition.addEventListener("end", () => {
    setListeningIndicator(false);
    if (recognitionPausedForSpeech || !shouldKeepListening) return;
    try {
      recognition.start();
    } catch (err) {
      console.warn(`Lumina · no se pudo reiniciar el reconocimiento: ${err.message}`);
    }
  });

  try {
    recognition.start();
  } catch (err) {
    setAttentionIndicator("no se pudo iniciar el reconocimiento");
    console.warn("Lumina · no se pudo iniciar el reconocimiento de voz.", err);
  }
} else {
  setAttentionIndicator("este navegador no soporta reconocimiento de voz");
  console.warn("Lumina · este navegador no soporta Web Speech API. Usa el botón invisible (arriba a la izquierda).");
}

// ============================================================================
// Estado inicial y parallax
// ============================================================================

setFaceExpression(restingExpression());
scheduleNextGazeDrift();

// Parallax de mouse sobre #face-stage (ver lumina.css); se omite con
// "menos movimiento" o sin puntero fino (las pantallas táctiles no generan
// mousemove real).
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (event) => {
    const relX = (event.clientX / window.innerWidth - 0.5) * 2; // -1..1
    const relY = (event.clientY / window.innerHeight - 0.5) * 2;
    faceStageEl.style.setProperty("--parallax-x", relX.toFixed(3));
    faceStageEl.style.setProperty("--parallax-y", relY.toFixed(3));
  });
}
