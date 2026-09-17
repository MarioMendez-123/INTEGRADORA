/**
 * Aether Robot — dashboard/robot.html.
 *
 * ============================================================================
 * COMANDOS DE CONSOLA PARA PROBAR CADA EXPRESIÓN A MANO
 * (abre las herramientas de desarrollador del navegador, pestaña Consola,
 * en esta página, y pega cualquiera de estas líneas)
 *
 *   setFaceExpression('inactivo')     // idle — parpadeo ocasional automático
 *   setFaceExpression('neutral')      // calma, sin parpadeo automático
 *   setFaceExpression('feliz')        // contento
 *   setFaceExpression('confundido')   // confundido
 *   setFaceExpression('sorprendido')  // sorprendido
 *   setFaceExpression('pensando')     // procesando / pensando
 *   setFaceExpression('triste')       // triste
 *   setFaceExpression('error')        // error / alerta
 *   setFaceExpression('escuchando')   // esperando el comando de voz
 *   setFaceExpression('activando')    // transicionando a la vista de cámara
 *
 * setFaceExpression() queda expuesta en window a propósito (ver el final
 * de este archivo) — es el único gancho que un futuro modelo de IA (CNN)
 * necesitaría llamar para decidir la expresión; hoy nadie más que este
 * archivo la llama, y las 10 expresiones de arriba son estados visuales
 * predefinidos, sin ningún modelo detrás todavía (Principio 4.5,
 * aether_context_docs.md — no fabricar una capacidad que no existe).
 * ============================================================================
 *
 * ============================================================================
 * COMANDO DE CONSOLA PARA FORZAR UNA VOZ A MANO
 * ============================================================================
 * La Web Speech API no dice el género de una voz — pickBestSpanishVoice()
 * (ver más abajo) adivina por nombre propio con una lista curada a mano, no
 * exhaustiva. Si al revisar el log "Aether · voces en español disponibles"
 * hay una mejor opción (ej. una voz de niño, o un nombre masculino que no
 * está en la lista), fuérzala así y recarga la página:
 *
 *   localStorage.setItem('aether_voice_override', 'jorge')  // fragmento del nombre, sin mayúsculas
 *   localStorage.removeItem('aether_voice_override')        // vuelve a la selección automática
 * ============================================================================
 *
 * HONESTIDAD EXPLÍCITA — ver también el comentario grande en robot.html:
 * esta interfaz asume UNA sola cámara, la de Percepción del robot móvil
 * (/perception/stream). Nunca la de Visión de línea: en producción real
 * esa vive en una PC fija dentro de la celda de manufactura, un
 * dispositivo físicamente distinto al robot móvil (ADR 0008, 8c).
 *
 * DIAGNÓSTICO DE VOZ: vive en la consola del navegador (console.log/warn),
 * no en pantalla — la vista de reposo debe sentirse como presencia, no
 * como una interfaz con controles. Abre la consola para ver el permiso de
 * micrófono, cada transcripción escuchada, y cada error real de
 * SpeechRecognition. El único rastro visible es el puntito de estado en
 * la esquina superior derecha (gris=inactivo, verde parpadeante=escuchando
 * de verdad ahora mismo, ámbar=necesita atención).
 *
 * SONIDO: generado en vivo con la Web Audio API (osciladores simples) —
 * no hay archivos de audio (no se fabrica un asset que no existe,
 * Principio 4.5). Un sonido de "encendido" al activar el sistema, y un
 * tono corto por categoría emocional en cada cambio de expresión.
 *
 * ============================================================================
 * DOS MODOS MUTUAMENTE EXCLUYENTES — ARQUITECTURA, NO SOLO UX
 * ============================================================================
 * Modo Conversación (por defecto al cargar la página): SpeechRecognition
 * escucha preguntas completas, cada una se manda a POST /robot/ask
 * (backend + Ollama) y la respuesta se dice en voz alta con
 * speechSynthesis. Cámara y YOLO permanecen APAGADOS todo este tiempo.
 *
 * Modo Cámara (al oír "Lumina, inicia"): se muestra /perception/stream en
 * pantalla completa. Mientras este modo esté activo, NUNCA se manda nada a
 * /robot/ask — solo se escuchan comandos de control simples ("Lumina,
 * detente" para regresar), nunca preguntas abiertas.
 *
 * Esta exclusión mutua es una decisión de ARQUITECTURA, no de interfaz: en
 * el Jetson Orin Nano Super real (Decisión 4), correr un LLM y el
 * pipeline de Percepción (YOLO+ArUco+pyzbar) al mismo tiempo degradaría a
 * ambos — un solo cómputo de borde con presupuesto fijo, no dos GPUs
 * independientes. Por eso activateRobot() cancela explícitamente
 * cualquier pregunta pendiente a Ollama y cualquier síntesis de voz en
 * curso ANTES de mostrar la cámara — no es solo "cambiar de pantalla", es
 * liberar los recursos que Modo Cámara necesita.
 *
 * MODO PRESENTACIÓN: "Lumina, presentación" (dicho de nuevo lo apaga) deja
 * la cara en 'feliz' de forma sostenida, para cuando alguien (Mario) esté
 * mostrando el robot en vivo frente a otras personas. No hay forma de
 * detectar automáticamente "hay gente cerca" (necesitaría sensores que no
 * existen) — es un disparador manual a propósito, no se fabrica esa
 * detección (Principio 4.5).
 */

// Declarado aquí arriba (no junto al resto del reconocimiento de voz, más
// abajo) porque restingExpression() lo necesita para decidir la expresión
// de reposo, y ese helper se usa desde el módulo de modos/cámara — antes
// en el archivo que la sección de "Comando de voz".
const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;

// También hoisteados aquí arriba (no junto al resto de "Comando de voz",
// más abajo): speak() necesita pausar/reanudar el reconocimiento y vive
// mucho antes en el archivo que la sección de voz donde se crea la
// instancia real de `recognition`. `recognition` se asigna más abajo (si
// el navegador soporta la API); estas declaraciones solo reservan el
// nombre en el scope del módulo para que sean la MISMA variable.
let recognition = null;
let shouldKeepListening = true;
// true mientras el reconocimiento está apagado A PROPÓSITO porque Lumina
// está hablando (ver pauseRecognitionForSpeech/resumeRecognitionAfterSpeech
// más abajo) — distingue ese apagado intencional del "end" normal del
// navegador, que si debe reiniciar el reconocimiento solo.
let recognitionPausedForSpeech = false;

/** Apaga el reconocimiento de voz justo antes de que Lumina hable. Bug real
 * reportado (revisando logs de una conversación de prueba): el micrófono
 * seguía activo mientras speechSynthesis reproducía la respuesta, así que
 * captaba la propia voz de Lumina saliendo por las bocinas y la
 * transcribía como una pregunta nueva del usuario ("eco") — eso a su vez
 * disparaba una segunda respuesta que cortaba a la primera a medias
 * (errores "interrupted" de síntesis). Se reinicia SOLO en
 * resumeRecognitionAfterSpeech(), nunca antes de que termine de hablar. */
function pauseRecognitionForSpeech() {
  if (!recognition) return;
  recognitionPausedForSpeech = true;
  try {
    recognition.stop();
  } catch {
    // Ya estaba detenido — no hay nada que hacer.
  }
}

function resumeRecognitionAfterSpeech() {
  if (!recognition) return;
  recognitionPausedForSpeech = false;
  if (!shouldKeepListening) return; // permiso denegado u otro error fatal — no reintentar
  try {
    recognition.start();
  } catch {
    // Puede ya estar corriendo (ej. el propio "end" del stop() de arriba ya
    // lo reinició) — condición de carrera esperada, no un error real.
  }
}

// ============================================================================
// Motor de expresiones de la cara
// ============================================================================

// Coordenadas dentro del viewBox 0 0 1000 600 (robot.html) — mucho más
// ancho que una cara "de ícono": los ojos quedan bien separados para que
// la composición ocupe la mayoría del viewport en vez de un óvalo pequeño
// centrado en medio de espacio vacío.
const EYE_L = { x: 300, y: 260 };
const EYE_R = { x: 700, y: 260 };

/** Genera el `d` de un ojo según su forma — parametrizado en vez de tener
 * una cadena de path distinta escrita a mano por cada una de las 10
 * expresiones, para que agregar una expresión nueva más adelante sea
 * cambiar una fila de EXPRESSIONS, no dibujar un path nuevo. */
function eyePath(shape, cx, cy) {
  switch (shape) {
    case "closed":
      return `M ${cx - 62} ${cy} L ${cx + 62} ${cy}`;
    case "happy": // arco hacia arriba — "^" — ojo contento
      return `M ${cx - 64} ${cy + 18} Q ${cx} ${cy - 62} ${cx + 64} ${cy + 18}`;
    case "sad": // arco hacia abajo — ojo caído/triste
      return `M ${cx - 64} ${cy - 26} Q ${cx} ${cy + 46} ${cx + 64} ${cy - 26}`;
    case "wide": // círculo grande — sorpresa
      return circlePath(cx, cy, 94);
    case "squint": // óvalo achatado — entrecerrado (confundido)
      return `M ${cx - 64} ${cy} Q ${cx} ${cy - 28} ${cx + 64} ${cy} Q ${cx} ${cy + 28} ${cx - 64} ${cy} Z`;
    case "arc": // "pensando" — arco tipo indicador de carga, gira vía
      // .face-eye--spin (robot.css). 270° con un hueco de 90° para que el
      // giro se lea como spinner, no como un círculo cerrado que no
      // aparenta girar.
      return arcPath(cx, cy, 68, 270);
    case "x": // error
      return `M ${cx - 48} ${cy - 48} L ${cx + 48} ${cy + 48} M ${cx - 48} ${cy + 48} L ${cx + 48} ${cy - 48}`;
    case "open":
    default:
      // Cápsula/visor (antes un círculo perfecto) — reemplaza la mirada
      // fija tipo "ojo de muñeca": un óvalo alargado con extremos
      // redondeados se lee como visor sci-fi, no como un ojo estático.
      // Pedido explícito: eliminar los ojos circulares del reposo.
      return capsulePath(cx, cy, 104, 46);
  }
}

function circlePath(cx, cy, r) {
  return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`;
}

/** Cápsula/estadio horizontal: rectángulo con extremos totalmente
 * redondeados (radio = mitad de la altura). hw/hh son medio-ancho y
 * medio-alto totales. */
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

/** Arco parcial (spinner) centrado en (cx,cy), radio r, que barre
 * sweepDeg grados desde arriba (-90°) en sentido horario — el hueco
 * restante es lo que hace que .face-eye--spin (rotate infinito en CSS) se
 * lea como "cargando/procesando" en vez de un círculo cerrado inmóvil. */
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

/** Ceja: solo dos formas necesarias — "raised" (una o ambas arriba, para
 * sorpresa/confusión) y "sad" (caídas hacia el centro, para tristeza). */
function browPath(shape, cx, cy) {
  const y = cy - 132;
  if (shape === "sad") {
    return `M ${cx - 72} ${y + 28} L ${cx + 72} ${y - 18}`;
  }
  // raised
  return `M ${cx - 72} ${y} L ${cx + 72} ${y - 36}`;
}

/** Boca: una sola forma central, ancho fijo, altura del arco variable
 * según el tipo. Dimensiones ampliadas (antes w=155, amplitudes menores)
 * para que ocupe una proporción más notoria del espacio disponible ahora
 * que toda la composición usa la pantalla completa — y para que cada forma
 * se lea claramente distinta de las demás a distancia (presentación). */
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

/** Las 10 expresiones reales de Aether — 3 funcionales (inactivo,
 * escuchando, activando) + 7 emocionales (neutral, feliz, confundido,
 * sorprendido, pensando, triste, error). Cada entrada es declarativa: qué
 * forma de ojo/ceja/boca usar, si hay pupila visible (y con qué offset),
 * qué color de acento, y qué animaciones especiales (resplandor de
 * escucha, pulso, ladeo, puntos de "pensando"). Agregar una expresión
 * nueva es agregar una fila aquí — setFaceExpression() no cambia. */
// gazeDrift: true — solo en los estados de reposo prolongado (inactivo,
// neutral, escuchando): la pupila deriva sola de vez en cuando (ver
// scheduleNextGazeDrift más abajo) para sentirse viva/observando, en vez
// de clavada en un punto fijo. Se omite a propósito en expresiones con
// pupilOffset propio (ej. 'pensando', que ya mira hacia arriba-derecha de
// forma intencional) o sin pupila visible (ej. 'feliz'), para no pisar un
// gesto que ya significa algo específico.
const EXPRESSIONS = {
  inactivo: {
    eye: "open",
    mouth: "flat",
    pupil: true,
    accent: "accent",
    idleBlink: true,
    gazeDrift: true,
  },
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
  pensando: {
    eye: "arc",
    eyeSpin: true,
    mouth: "flat",
    pupil: false,
    accent: "accent",
    dots: true,
  },
  triste: { eye: "sad", mouth: "frown", pupil: false, browL: "sad", browR: "sad", accent: "muted" },
  error: { eye: "x", mouth: "flat", pupil: false, accent: "warn", pulse: true },
  // idleBlink: true — es el estado de reposo real de Modo Conversación
  // (ver enterConversationMode), necesita sentirse vivo, no estático.
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

// #face-ambient no se referencia aquí: su color sigue a --face-accent por
// herencia de CSS custom property desde #face-screen, sin necesitar JS.
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
// Los 3 anillos de "escuchando" (el original + 2 ondas, ver robot.css
// .face-glow--ripple) se prenden/apagan juntos — un solo array, no tres
// variables sueltas repitiendo la misma línea.
const listeningGlowEls = [
  document.getElementById("listening-ring"),
  document.getElementById("listening-ring-2"),
  document.getElementById("listening-ring-3"),
];
const faceStageEl = document.getElementById("face-stage");
const statusIndicatorEl = document.getElementById("status-indicator");

let currentExpression = null;
let idleBlinkTimer = null;

function applyExpression(cfg) {
  eyeLeftEl.setAttribute("d", eyePath(cfg.eyeL || cfg.eye, EYE_L.x, EYE_L.y));
  eyeRightEl.setAttribute("d", eyePath(cfg.eyeR || cfg.eye, EYE_R.x, EYE_R.y));

  // "pensando": el arco gira por CSS (.face-eye--spin, ver robot.css) —
  // limpiamos el transform inline del parpadeo aquí mismo para que la
  // animación de giro no tenga que competir con él por la misma propiedad
  // (en la práctica 'pensando' nunca parpadea, pero así queda explícito
  // en vez de depender de esa coincidencia).
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

  // Ya no se fuerza aquí: mientras no se esté hablando, "Animación
  // continua" (más abajo) mantiene la boca en esta misma forma cuadro a
  // cuadro; esto solo la deja correcta para el primer frame antes de que
  // el loop arranque.
  mouthEl.setAttribute("d", mouthPath(cfg.mouth));

  // cx/cy de las pupilas y su visibilidad (ligada ahora también al
  // parpadeo, no solo a cfg.pupil) las gobierna por completo el loop de
  // "Animación continua" — aquí solo se fija el OBJETIVO hacia el que
  // deben acercarse con easing (gazeBaseOffset), y se limpia cualquier
  // deriva de mirada que venía de la expresión anterior.
  gazeBaseOffset = cfg.pupilOffset || { dx: 0, dy: 0 };
  gazeDriftOffset = { dx: 0, dy: 0 };

  thinkingDotsEl.classList.toggle("face-dots--visible", !!cfg.dots);
  listeningGlowEls.forEach((el) => el.classList.toggle("face-glow--active", !!cfg.ring));
  faceSvg.classList.toggle("face--pulse", !!cfg.pulse);
  faceSvg.classList.toggle("face--tilt", !!cfg.tilt);

  // En #face-screen, no en #face-svg: así lo hereda tanto el SVG como
  // #face-ambient (el resplandor de fondo), ambos descendientes suyos.
  const varName = ACCENT_VAR[cfg.accent] || ACCENT_VAR.accent;
  faceScreenEl.style.setProperty("--face-accent", `var(${varName})`);
}

/** Ya no intercambia el `d` del ojo por una forma "cerrada": solo mueve
 * eyeOpennessTarget entre 0 y 1 — "Animación continua" (más abajo) es
 * quien de verdad anima scaleY() hacia ese objetivo cada frame, con un
 * factor de cierre más alto que el de apertura (cierre rápido, apertura
 * más lenta, pedido explícito). Genérico: funciona para CUALQUIER
 * expresión con idleBlink (hoy 'inactivo' y 'escuchando'). */
function triggerBlink() {
  const name = currentExpression;
  const cfg = EXPRESSIONS[name];
  if (!cfg || !cfg.idleBlink) return;

  // Variado a propósito (pedido explícito: "no siempre el mismo patrón
  // exacto") — cuánto se queda cerrado antes de reabrir cambia cada vez,
  // y de vez en cuando (15%) un parpadeo doble rápido, como hace una
  // persona real de forma ocasional.
  const holdClosedMs = 90 + Math.random() * 70; // 90–160ms
  const isDoubleBlink = Math.random() < 0.15;

  eyeOpennessTarget = 0;
  setTimeout(() => {
    if (currentExpression !== name) return; // la expresión cambió mientras tanto
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

/** Reprograma el siguiente parpadeo con un intervalo aleatorio distinto
 * cada vez (recursivo, NO setInterval de paso fijo — pedido explícito:
 * "intervalo aleatorio entre parpadeos, no un loop fijo"). Se detiene
 * solo cuando la expresión activa ya no tiene idleBlink; setFaceExpression
 * la vuelve a llamar cada vez que cambia a una que sí lo tiene. */
function scheduleNextBlink() {
  clearTimeout(idleBlinkTimer);
  const cfg = EXPRESSIONS[currentExpression];
  if (!cfg || !cfg.idleBlink) return;
  const delay = 2500 + Math.random() * 3500; // ~2.5–6s, pedido explícito
  idleBlinkTimer = setTimeout(() => {
    triggerBlink();
    scheduleNextBlink();
  }, delay);
}

// ============================================================================
// Deriva de mirada — pupilas que se mueven solas de vez en cuando en los
// estados de reposo prolongado (gazeDrift: true, ver EXPRESSIONS), para
// que se sienta como que Lumina está observando, no clavada en un punto
// fijo. Este temporizador solo decide el OBJETIVO (gazeDriftOffset); quien
// de verdad mueve las pupilas hacia ahí con easing es "Animación continua"
// más abajo (antes se apoyaba en la transición CSS de cx/cy; ahora es
// JS con el factor pedido explícitamente para pupilas, ~0.08).
//
// Ritmo deliberadamente LENTO (1.5–3.5s entre movimientos, pedido
// explícito) y de amplitud pequeña: un vistazo ocasional se siente vivo,
// uno constante o brusco marea si alguien lo ve fijo varios minutos en
// una presentación.
// ============================================================================

let gazeDriftTimer = null;
// Ambos se combinan cada frame (ver livelinessFrame) para formar el
// objetivo real de las pupilas: gazeBaseOffset lo fija applyExpression()
// (ej. la mirada fija hacia arriba-derecha de 'pensando'); gazeDriftOffset
// es el vistazo ocasional de este temporizador, solo en expresiones con
// gazeDrift: true.
let gazeBaseOffset = { dx: 0, dy: 0 };
let gazeDriftOffset = { dx: 0, dy: 0 };
let pupilCurrent = { dx: 0, dy: 0 };

function randomGazeOffset() {
  const dx = Math.round((Math.random() - 0.5) * 40); // ±20
  const dy = Math.round((Math.random() - 0.5) * 28); // ±14
  return { dx, dy };
}

function scheduleNextGazeDrift() {
  clearTimeout(gazeDriftTimer);
  const delay = 1500 + Math.random() * 2000; // ~1.5–3.5s, pedido explícito
  gazeDriftTimer = setTimeout(() => {
    const cfg = EXPRESSIONS[currentExpression];
    if (cfg && cfg.gazeDrift) {
      gazeDriftOffset = randomGazeOffset();
    }
    scheduleNextGazeDrift();
  }, delay);
}

// ============================================================================
// ANIMACIÓN CONTINUA (requestAnimationFrame) — boca reactiva a la voz,
// parpadeo asimétrico y glow dinámico, todo con easing en vez de saltos
// directos a un valor objetivo (current += (target-current)*factor,
// pedido explícito). Es UN solo loop para los tres, no tres timers
// separados — más simple de mantener en sincronía.
//
// HONESTIDAD EXPLÍCITA sobre la boca (léase antes de tocar esto): la voz
// de Lumina sale de speechSynthesis (Web Speech API), no de un <audio> ni
// de un archivo — y el navegador NO expone esa señal a la Web Audio API
// (no existe forma estándar de conectar un AnalyserNode a la salida de
// SpeechSynthesisUtterance; a diferencia de <audio>/<video>, no hay
// createMediaElementSource posible para ella). Por eso esto NO es un
// analizador de espectro real: es una aproximación procedural con 3
// "bandas" que se re-sortean solas mientras se habla (ritmo variable,
// ~70–140ms) más un empujón extra genuino en cada evento onboundary real
// del motor de síntesis (el único timing real de habla que el navegador sí
// entrega). Se ve viva y reacciona al ritmo real de la voz, pero no debe
// describirse como "análisis de audio" en documentación ni frente al
// evaluador (Principio 4.1/4.5, aether_context_docs.md). Si en el futuro
// Lumina hablara a través de un <audio> real (ej. TTS del lado del
// servidor), ahí sí sería posible un AnalyserNode genuino — queda como
// nota, no se fabrica esa capacidad ahora.
// ============================================================================

const MOUTH_EASE = 0.35; // responsivo, pedido explícito
const PUPIL_EASE = 0.08; // "pensativo", pedido explícito
const EYE_CLOSE_EASE = 0.55; // cierre rápido
const EYE_OPEN_EASE = 0.16; // apertura más lenta — asimetría pedida
const GLOW_EASE = 0.12;
const GLOW_IDLE_TARGET = 0.12; // nunca en 0 plano — presencia sutil incluso callada

let mouthBandTargets = [0, 0, 0]; // grave / media / aguda (aproximadas, ver nota arriba)
let mouthBandCurrent = [0, 0, 0];
let mouthNeedsReset = false; // true tras hablar, hasta que las bandas se asienten en ~0
let talking = false;
let mouthBandTimer = null;

let eyeOpenness = 1; // 0 = cerrado, 1 = abierto — animado por transform: scaleY()
let eyeOpennessTarget = 1;

let glowIntensity = GLOW_IDLE_TARGET;
let glowTarget = GLOW_IDLE_TARGET;

/** Boca reactiva: una forma CERRADA (labio superior + labio inferior, como
 * el mismo trazo que ya usa la forma "o" para 'sorprendido') en vez de una
 * sola curva abierta de lado a lado — una curva abierta con fill:none no
 * se lee como una boca abriendo/cerrando, solo como una línea ondulando
 * (bug real reportado: "nunca cierra y solo parecen líneas moviéndose").
 * Con apertura 0 los dos labios coinciden y colapsan en una línea recta —
 * ESO sí se lee como boca cerrada de verdad. La banda grave controla la
 * apertura (el parámetro con más peso visual); media/aguda inclinan cada
 * esquina por separado — "cada segmento reacciona a una porción
 * distinta" (pedido explícito), aquí como esquina izquierda/derecha en
 * vez de un espectro de frecuencias real (ver honestidad explícita
 * arriba). */
function mouthTalkPath(bands) {
  const cx = 500;
  const midY = 430;
  const w = 190;
  const [low, mid, high] = bands;
  const openAmount = low * 95; // 0 = cerrada de verdad, alto = bien abierta
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

/** Re-sortea las 3 bandas mientras `talking` sea true, a un ritmo variable
 * (no fijo) — simula la apertura/cierre de mandíbula entre sílabas sin
 * depender de audio real (ver honestidad explícita). Rango completo
 * 0–1 en la banda grave (antes tenía un piso de 0.35 que nunca dejaba
 * llegar a "cerrada" — esa era la causa real de que nunca se viera
 * cerrar la boca). */
function randomizeMouthBandTargets() {
  mouthBandTargets = [
    Math.random(), // grave — apertura de mandíbula, incluye cierres reales
    Math.random() * 0.6, // media — esquina izquierda
    Math.random() * 0.6, // aguda — esquina derecha
  ];
  if (!talking) return;
  const delay = 70 + Math.random() * 70; // 70–140ms
  mouthBandTimer = setTimeout(randomizeMouthBandTargets, delay);
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
  mouthBandTargets = [0, 0, 0]; // el loop las relaja solas hacia 0 con easing
}

/** onboundary real de SpeechSynthesisUtterance (palabra/sílaba real según
 * el motor de voz) — el único empujón que SÍ está atado a timing de habla
 * genuino, en vez de puramente aleatorio. */
function mouthBoundaryBurst() {
  mouthBandTargets[0] = Math.min(1, mouthBandTargets[0] + 0.25);
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

  // Se calcula aquí (antes de usarse en ojos y glow) porque ambos lo
  // necesitan y las bandas de la boca ya están actualizadas en este frame.
  const avgBand = (mouthBandCurrent[0] + mouthBandCurrent[1] + mouthBandCurrent[2]) / 3;

  // --- Parpadeo (easing asimétrico) + pupilas (easing "pensativo") ---
  const cfg = EXPRESSIONS[currentExpression];
  const blinkFactor = eyeOpennessTarget < eyeOpenness ? EYE_CLOSE_EASE : EYE_OPEN_EASE;
  eyeOpenness += (eyeOpennessTarget - eyeOpenness) * blinkFactor;
  const scaleY = Math.max(0.05, eyeOpenness).toFixed(3);
  // 'pensando' gira el ojo por CSS (.face-eye--spin) — no le tocamos el
  // transform inline aquí, se lo dejamos por completo a esa animación (ver
  // applyExpression, que ya lo limpió al entrar a este estado).
  if (!cfg?.eyeSpin) {
    // Mientras se habla, un leve scaleX atado a avgBand ("los ojos se
    // entornan/escalan levemente al ritmo de la voz", pedido explícito) —
    // en reposo talkScaleX queda en 1 (sin efecto).
    const talkScaleX = talking ? (1 - avgBand * 0.05).toFixed(3) : 1;
    eyeLeftEl.style.transform = `scaleY(${scaleY}) scaleX(${talkScaleX})`;
    eyeRightEl.style.transform = `scaleY(${scaleY}) scaleX(${talkScaleX})`;
  }
  const pupilShouldShow = !!cfg?.pupil && eyeOpenness > 0.35;
  pupilLeftEl.classList.toggle("face-pupil--visible", pupilShouldShow);
  pupilRightEl.classList.toggle("face-pupil--visible", pupilShouldShow);

  const pupilTargetDx = gazeBaseOffset.dx + gazeDriftOffset.dx;
  const pupilTargetDy = gazeBaseOffset.dy + gazeDriftOffset.dy;
  pupilCurrent.dx += (pupilTargetDx - pupilCurrent.dx) * PUPIL_EASE;
  pupilCurrent.dy += (pupilTargetDy - pupilCurrent.dy) * PUPIL_EASE;
  pupilLeftEl.setAttribute("cx", EYE_L.x + pupilCurrent.dx);
  pupilLeftEl.setAttribute("cy", EYE_L.y + pupilCurrent.dy);
  pupilRightEl.setAttribute("cx", EYE_R.x + pupilCurrent.dx);
  pupilRightEl.setAttribute("cy", EYE_R.y + pupilCurrent.dy);

  // --- Glow dinámico (ver .face-eye/.face-mouth en robot.css) ---
  glowTarget = talking ? Math.min(1, avgBand * 1.3) : GLOW_IDLE_TARGET;
  glowIntensity += (glowTarget - glowIntensity) * GLOW_EASE;
  faceScreenEl.style.setProperty("--talk-glow", glowIntensity.toFixed(3));

  updateStatusIndicator();

  requestAnimationFrame(livelinessFrame);
}
requestAnimationFrame(livelinessFrame);

// Se lee cada frame en vez de engancharse a cada sitio que cambia
// conversationSubState/talking (son varios, ver enterConversationMode,
// startTalkingAnimation, etc.) — más simple y no se puede "olvidar" un
// call site nuevo más adelante. Solo toca el DOM cuando el texto
// realmente cambia, para no generar reflow en cada uno de los 60fps.
let lastStatusLabel = null;
function updateStatusIndicator() {
  let label = "";
  if (mode === "conversation") {
    if (talking) {
      label = "HABLANDO...";
    } else if (conversationSubState === "thinking") {
      label = "PENSANDO...";
    } else if (conversationSubState === "listening" && currentExpression === "escuchando") {
      // Solo si currentExpression es realmente 'escuchando' (no
      // 'inactivo') — restingExpression() ya decide eso según si el
      // reconocimiento de voz existe de verdad (ver honestidad explícita
      // ahí); mostrar "ESCUCHANDO..." sin esa comprobación mentiría en los
      // casos sin soporte de voz o con permiso denegado.
      label = "ESCUCHANDO...";
    }
  }
  if (label === lastStatusLabel) return;
  lastStatusLabel = label;
  statusIndicatorEl.textContent = label;
  statusIndicatorEl.classList.toggle("status-indicator--visible", label !== "");
}

/**
 * Cambia la expresión de la cara — la única función que necesitaría
 * llamar un futuro modelo de IA (CNN) para decidir qué mostrar; hoy solo
 * la llaman los estados predefinidos de este archivo (ver lista de
 * comandos de consola arriba). Nombres válidos: las 10 llaves de
 * EXPRESSIONS.
 */
function setFaceExpression(name) {
  const cfg = EXPRESSIONS[name];
  if (!cfg) {
    console.warn(
      `Aether: expresión desconocida "${name}". Válidas: ${Object.keys(EXPRESSIONS).join(", ")}`,
    );
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
  if (isChange) {
    playExpressionSound(name);
  }
}

// Expuesta a propósito para poder probarla a mano desde la consola (ver
// comandos arriba) y para que un futuro modelo de IA tenga un solo punto
// de entrada.
window.setFaceExpression = setFaceExpression;

// ============================================================================
// Efectos de sonido — Web Audio API, tonos generados en vivo con
// osciladores. Sin archivos de audio: no se fabrica un asset que no
// existe todavía (Principio 4.5). Un sonido de "encendido" para
// 'activando' (cubre "sonido al iniciar el sistema", ya que activateRobot
// llama a setFaceExpression('activando') antes de mostrar la cámara), y un
// tono corto por categoría para el resto de las expresiones — no un
// sonido único por cada una de las 10, agrupadas donde tiene sentido.
// ============================================================================

let audioCtx = null;

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  // Los navegadores crean el contexto "suspended" hasta el primer gesto
  // real del usuario (clic, tecla) — antes de eso resume() no suena, y
  // está bien: es la política estándar de autoplay, no un bug de aquí.
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

/** Un tono simple: sube o baja de freqStart a freqEnd (o se queda plano
 * si son iguales) en duration segundos, con una caída de volumen suave al
 * final para que nunca truene ("click" de corte abrupto). */
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
    console.warn("Aether: no se pudo reproducir sonido.", err);
  }
}

// Categoría de sonido por expresión — agrupadas, no una por cada una de
// las 10: positivo (ascendente), negativo (descendente), neutro (blip
// corto y discreto), y "startup" (encendido, solo 'activando').
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
    case "startup":
      // Dos notas ascendentes rápidas — más distintivo que un solo tono,
      // se lee como "encendiendo" sin ser una melodía larga.
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
// Modos — Conversación (default) vs. Cámara, mutuamente excluyentes.
// Ver el comentario grande de arriba sobre por qué (recursos del Jetson).
// ============================================================================

// 'boot' | 'boot-awaiting-command' | 'script' | 'conversation' | 'camera'.
// Vive aquí (no en cameraActive, que ya existía para el ciclo de vida del
// <img>) porque también gobierna qué hace el reconocimiento de voz con
// cada frase — ver más abajo. Arranca en 'boot' (pantalla de espera negra,
// ver la sección "PANTALLA DE ESPERA" más abajo) — 'conversation' ya no es
// el modo inicial, solo al que se regresa después de salir de Modo Cámara
// (deactivateRobot, sin cambios) una vez terminado el guion.
let mode = "boot";
let presentationModeActive = false;

// false si Web Speech API no existe en este navegador, o si el permiso de
// micrófono se denegó (ver el "error" de recognition más abajo) — en
// cualquiera de los dos casos, mostrar 'escuchando' sería mentir sobre
// que algo está escuchando de verdad.
let voiceAvailable = !!SpeechRecognitionImpl;

/** Expresión de reposo real: 'feliz' sostenida en Modo Presentación,
 * 'escuchando' si hay reconocimiento de voz real disponible, o 'inactivo'
 * si no (sin soporte, o permiso denegado) — más honesto que mostrar
 * 'escuchando' cuando en realidad nada está escuchando. */
function restingExpression() {
  if (presentationModeActive) return "feliz";
  return voiceAvailable ? "escuchando" : "inactivo";
}

function enterConversationMode() {
  mode = "conversation";
  conversationSubState = "listening";
  setFaceExpression(restingExpression());
}

const CAMERA_URL = "/perception/stream";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

const cameraScreen = document.getElementById("camera-screen");
const cameraStreamImg = document.getElementById("robot-camera-stream");
const cameraConnectingEl = document.getElementById("camera-screen-connecting");
const cameraConnectingText = document.getElementById("camera-screen-connecting-text");
const activateBtn = document.getElementById("activate-btn");
const deactivateBtn = document.getElementById("deactivate-btn");

let cameraActive = false;
let cameraRetryCount = 0;
let cameraRetryTimer = null;

function showCameraConnecting() {
  cameraConnectingEl.hidden = false;
  cameraConnectingText.textContent =
    cameraRetryCount === 0
      ? "Estableciendo conexión…"
      : `Estableciendo conexión… (reintento ${cameraRetryCount} de ${MAX_RETRIES})`;
}

function attemptCameraConnection() {
  showCameraConnecting();
  cameraStreamImg.src = `${CAMERA_URL}?retry=${cameraRetryCount}`;
}

/** Transiciona de la cara (Modo Conversación) a Modo Cámara — mismo
 * publicador compartido que usa index.html (CameraPublisher), así que
 * esta vista puede estar activa al mismo tiempo que la demo de la portada
 * sin pelear por la cámara física.
 *
 * Antes de mostrar la cámara, apaga Modo Conversación de raíz: cancela
 * cualquier pregunta pendiente a Ollama y cualquier síntesis de voz en
 * curso. Esto NO es limpieza cosmética — es la exclusión mutua real (ver
 * comentario grande de arriba): mientras esto no se haga, técnicamente
 * seguiría "corriendo" el LLM al mismo tiempo que YOLO. */
function activateRobot() {
  if (mode === "camera") return;
  cancelPendingConversation();
  mode = "camera";
  setFaceExpression("activando");
  setTimeout(() => {
    faceScreenEl.hidden = true;
    cameraScreen.hidden = false;
    cameraActive = true;
    cameraRetryCount = 0;
    cameraStreamImg.hidden = true;
    attemptCameraConnection();
    startDetectionsPolling();
  }, 650); // deja ver la animación de "activando" antes de cambiar de pantalla
}

function deactivateRobot() {
  if (mode !== "camera") return;
  cameraActive = false;
  clearTimeout(cameraRetryTimer);
  cameraStreamImg.removeAttribute("src");
  cameraStreamImg.hidden = true;
  cameraScreen.hidden = true;
  faceScreenEl.hidden = false;
  stopDetectionsPolling();
  enterConversationMode();
}

cameraStreamImg.addEventListener("load", () => {
  if (!cameraActive) return;
  cameraRetryCount = 0;
  cameraConnectingEl.hidden = true;
  cameraStreamImg.hidden = false;
});

cameraStreamImg.addEventListener("error", () => {
  if (!cameraActive) return;
  if (cameraRetryCount < MAX_RETRIES) {
    cameraRetryCount += 1;
    showCameraConnecting();
    cameraRetryTimer = setTimeout(attemptCameraConnection, RETRY_DELAY_MS);
    return;
  }
  cameraConnectingText.textContent =
    "No se pudo conectar con la cámara. Verifica que backend/main.py esté corriendo.";
});

activateBtn.addEventListener("click", activateRobot);
deactivateBtn.addEventListener("click", deactivateRobot);

// ============================================================================
// PANTALLA DE ESPERA (arranque) + GUION DE PRESENTACIÓN
// ============================================================================
// Pedido explícito: la interfaz debe permanecer completamente negra al
// iniciar el programa, y solo debe mostrarse (con una animación breve de
// encendido) cuando ocurre UNA de dos cosas: (A) alguien dice "Lumina" a
// secas y luego "Iniciar presentación", o (B) alguien usa el botón oculto
// de la esquina superior izquierda y espera 10 segundos. No es un sistema
// nuevo de voz ni de interfaz: reutiliza SpeechRecognition/speak() (ver
// abajo), setFaceExpression('activando') (ya usada para la transición a
// Modo Cámara, con su propio sonido de encendido — ver
// EXPRESSION_SOUND_CATEGORY) y activateRobot() (para el momento del guion
// en el que Aether muestra la cámara en vivo).
//
// mode pasa a tener dos valores nuevos, ADEMÁS de 'conversation'/'camera':
// 'boot' (pantalla negra, esperando "Lumina") y 'boot-awaiting-command'
// (ya saludó con "Dígame, señor.", esperando "Iniciar presentación").
// Mientras el guion corre, mode vale 'script' — deliberadamente DISTINTO
// de presentationModeActive/"Modo Presentación" (comando de voz ya
// existente "Lumina, presentación", que solo sostiene la cara en 'feliz';
// no tiene relación con este guion y sigue funcionando igual que antes).
// ============================================================================

const bootScreenEl = document.getElementById("boot-screen");
const bootFlashEl = document.getElementById("boot-flash");
const bootHiddenBtn = document.getElementById("boot-hidden-btn");

let awakened = false; // ya se encendió la interfaz (voz o botón) — evita reencender dos veces
let presentationStarted = false; // evita doble activación del guion

/** Destello + encendido progresivo hasta revelar la interfaz normal — ver
 * robot.css (.boot-screen, .boot-flash). Reutiliza setFaceExpression
 * ('activando'), que ya reproduce el sonido de encendido de dos notas —
 * no se agrega ningún sonido ni animación nueva por separado. */
function playPowerOnAnimation(onComplete) {
  bootFlashEl.classList.add("boot-flash--active");
  setTimeout(() => {
    setFaceExpression("activando");
    bootScreenEl.classList.add("boot-screen--hidden");
  }, 150);
  setTimeout(() => {
    bootFlashEl.classList.remove("boot-flash--active");
    if (onComplete) onComplete();
  }, 950);
}

/** "Lumina" a secas, dicho mientras la pantalla sigue negra — ENCIENDE la
 * interfaz de inmediato (animación de encendido) y la deja en su
 * expresión predeterminada, en silencio — SIN decir "Dígame, señor." aquí.
 * Esto aplica solo a este primer comando (el que arranca todo el
 * programa desde la pantalla negra); el "Dígame, señor." que sí se
 * pronuncia más adelante es el del propio guion (ver PRESENTATION_SCRIPT
 * — línea "Aether." → "Dígame, señor.", texto exacto sin tocar). Queda
 * esperando "Iniciar presentación" — si no se dice, el guion NUNCA
 * arranca solo. */
function greetBootWake() {
  if (mode !== "boot" || awakened) return;
  awakened = true;
  mode = "boot-awaiting-command";
  playPowerOnAnimation(() => setFaceExpression(restingExpression()));
}

/** "Iniciar presentación", dicho después del saludo — la interfaz ya está
 * encendida (ver greetBootWake), así que esto solo arranca el guion, sin
 * otra animación de encendido encima. */
function startPresentationFromVoice(transcript) {
  if (mode !== "boot-awaiting-command" || presentationStarted) return;
  if (!/\biniciar\b/i.test(transcript) || !/\bpresentaci[oó]n\b/i.test(transcript)) return;
  presentationStarted = true;
  runPresentationScript();
}

// Botón oculto — Opción B. Sin revelar nada en pantalla durante los 10
// segundos de espera (pedido explícito), y sin afectar ningún otro
// control (no toca activateBtn/deactivateBtn ni el reconocimiento de voz).
// A diferencia de la Opción A (voz), aquí el encendido y el guion van
// juntos — así lo pide el flujo del botón, que no tiene paso intermedio
// de "Dígame, señor.".
bootHiddenBtn.addEventListener("click", () => {
  if (presentationStarted) return;
  awakened = true;
  presentationStarted = true;
  setTimeout(() => {
    playPowerOnAnimation(runPresentationScript);
  }, 10000);
});

// ---------------------------------------------------------------------
// Guion de Aether — texto EXACTO provisto, sin modificar palabras. Las
// etiquetas [pausa:X] se convierten en segundos de espera real; ni las
// pausas ni las indicaciones de emoción se pronuncian nunca. Las líneas
// de EXPOSITOR no se sintetizan por voz (las dice la persona en vivo,
// nunca el sistema) — solo se respeta la misma pausa antes de continuar,
// para no inventar una voz que no existe (Principio 4.5, ver
// aether_context_docs.md). "mood" en cada línea de Aether reutiliza una
// de las 10 expresiones YA EXISTENTES (ver EXPRESSIONS arriba) según la
// correspondencia pedida — no se crea ninguna expresión nueva.
// ---------------------------------------------------------------------
const PRESENTATION_SCRIPT = [
  { speaker: "aether", text: "Buenas tardes.", pause: 0, mood: "neutral" },
  { speaker: "aether", text: "Mi nombre es Aether.", pause: 0, mood: "neutral" },
  { speaker: "aether", text: "Soy un sistema autónomo de inventario.", pause: 0, mood: "neutral" },
  { speaker: "aether", text: "Yo observo.", pause: 0, mood: "neutral" },
  { speaker: "aether", text: "Eso es lo primero que hago.", pause: 0, mood: "neutral" },
  { speaker: "aether", text: "Una imagen aparece.", pause: 0.8, mood: "pensando" },
  { speaker: "aether", text: "Encuentro algo.", pause: 0.8, mood: "pensando" },
  { speaker: "aether", text: "Intento identificarlo.", pause: 1.3, mood: "pensando" },
  { speaker: "aether", text: "Pero encontrar algo no significa entenderlo.", pause: 0, mood: "neutral" },
  { speaker: "aether", text: "Una cámara puede detectar un objeto.", pause: 0, mood: "neutral" },
  { speaker: "aether", text: "Pero detectar no significa saber qué es.", pause: 1.2, mood: "neutral" },
  {
    speaker: "aether",
    text: "Y saber qué es no significa necesariamente saber dónde está.",
    pause: 1.3,
    mood: "neutral",
  },
  {
    speaker: "aether",
    text: "Mucho menos significa saber si esa información es confiable.",
    pause: 2,
    mood: "neutral",
  },
  { speaker: "cue", text: "[INICIA LA MÚSICA]" },
  {
    speaker: "aether",
    text: "Por eso, mi proceso no termina cuando encuentro algo.",
    pause: 0,
    mood: "neutral",
  },
  { speaker: "aether", text: "Percibir.", pause: 0.5, mood: "pensando" },
  { speaker: "aether", text: "Identificar.", pause: 0.5, mood: "pensando" },
  { speaker: "aether", text: "Verificar.", pause: 0.5, mood: "pensando" },
  { speaker: "aether", text: "Localizar.", pause: 0.5, mood: "pensando" },
  { speaker: "aether", text: "Registrar.", pause: 1, mood: "pensando" },
  {
    speaker: "aether",
    text: "Ese es el proceso que permite transformar una imagen en información.",
    pause: 1.5,
    mood: "neutral",
  },
  {
    speaker: "aether",
    text: "Para hacerlo, necesito diferentes sistemas trabajando juntos.",
    pause: 1.2,
    mood: "neutral",
  },
  { speaker: "aether", text: "Un sistema de percepción, para observar mi entorno.", pause: 1, mood: "neutral" },
  {
    speaker: "aether",
    text: "Un sistema de computación, para procesar e interpretar lo que observo.",
    pause: 1,
    mood: "neutral",
  },
  {
    speaker: "aether",
    text: "Un sistema de comunicación, para convertir esa información en datos útiles.",
    pause: 1,
    mood: "neutral",
  },
  {
    speaker: "aether",
    text: "Y un sistema de movilidad, para llevar esa capacidad de percepción hasta donde sea necesaria.",
    pause: 1.5,
    mood: "neutral",
  },
  { speaker: "aether", text: "No soy solamente una cámara.", pause: 0.9, mood: "neutral" },
  { speaker: "aether", text: "No soy solamente un robot.", pause: 1.2, mood: "neutral" },
  {
    speaker: "aether",
    text: "Soy la integración de estos sistemas para resolver un problema.",
    pause: 1.5,
    mood: "neutral",
  },
  { speaker: "aether", text: "¿Quieren ver cómo funciono?", pause: 58, mood: "sorprendido" },

  { speaker: "expositor", text: "Ahora sí.", pause: 0 },
  { speaker: "expositor", text: "Vamos a abrirlo.", pause: 0.8 },
  {
    speaker: "expositor",
    text: "Cuando Aether dice que percibe, se refiere a algo concreto: un modelo de detección de objetos llamado YOLO.",
    pause: 1.3,
  },
  { speaker: "expositor", text: "Cuando dice que identifica, no está adivinando.", pause: 0.6 },
  {
    speaker: "expositor",
    text: "Lee códigos de barras y códigos QR directamente sobre cada objeto que detecta, para saber exactamente qué producto es.",
    pause: 1.3,
  },
  {
    speaker: "expositor",
    text: "Y cuando dice que verifica su ubicación, lo hace con unos marcadores especiales llamados ArUco.",
    pause: 0.7,
  },
  {
    speaker: "expositor",
    text: "Es importante ser precisos: esto no es navegación autónoma todavía.",
    pause: 0.6,
  },
  { speaker: "expositor", text: "Es una capa de verificación de posición.", pause: 0.6 },
  {
    speaker: "expositor",
    text: "Aether confirma dónde está, pero todavía no decide por sí solo cómo recorrer un almacén completo.",
    pause: 1.4,
  },
  {
    speaker: "expositor",
    text: "Toda esa información está diseñada para procesarse sobre un Jetson Orin Nano Super: un sistema de cómputo en el borde, pensado para ejecutar modelos de inteligencia artificial directamente en el robot.",
    pause: 1.3,
  },
  {
    speaker: "expositor",
    text: "Y una vez que Aether decide qué vio, esa información no se queda suelta.",
    pause: 0.7,
  },
  {
    speaker: "expositor",
    text: "Se organiza en un motor de inventario propio, que separa cuidadosamente lo que se observó de lo que se declara como inventario real.",
    pause: 1.5,
  },
  {
    speaker: "expositor",
    text: "Así evitamos confundir una observación parcial con una certeza de inventario.",
    pause: 1.5,
  },
  { speaker: "expositor", text: "Pero no queremos quedarnos en una explicación.", pause: 0 },
  { speaker: "expositor", text: "Queremos que lo vean funcionando.", pause: 0 },
  { speaker: "expositor", text: "Aether.", pause: 0 },

  { speaker: "aether", text: "Dígame, señor.", pause: 4, mood: "neutral" },

  { speaker: "expositor", text: "Muéstrales qué puedes ver.", pause: 0 },

  { speaker: "aether", text: "En un momento.", pause: 0.8, mood: "neutral" },
  {
    speaker: "aether",
    text: "Esto es lo que soy capaz de ver ahora mismo.",
    pause: 30,
    mood: "neutral",
    cueAfter: "activateCamera",
  },

  { speaker: "expositor", text: "Lo que están viendo no es una animación.", pause: 0.6 },
  {
    speaker: "expositor",
    text: "Es la percepción real del sistema, corriendo en este momento frente a ustedes.",
    pause: 1.2,
  },
  {
    speaker: "expositor",
    text: "Cada caja que aparece sobre la imagen corresponde a una detección real.",
    pause: 0.7,
  },
  { speaker: "expositor", text: "Y cada una de esas detecciones se guarda como un registro individual.", pause: 0 },
  { speaker: "expositor", text: "Nosotros le llamamos una Observation.", pause: 1.4 },
  { speaker: "expositor", text: "Después, esa información puede convertirse en inventario declarado.", pause: 1.2 },
  { speaker: "expositor", text: "Esa distinción importa.", pause: 0.6 },
  { speaker: "expositor", text: "Aether no solamente cuenta lo que ve.", pause: 0.6 },
  {
    speaker: "expositor",
    text: "Distingue entre lo que observó y lo que puede declarar con certeza.",
    pause: 1.5,
  },
  {
    speaker: "expositor",
    text: "Y Aether Inventory, lo que están viendo funcionar en este momento, es solamente una pieza del proyecto completo.",
    pause: 1.2,
  },
  {
    speaker: "expositor",
    text: "Nuestra visión es llevar esta arquitectura hasta una línea de manufactura completa.",
    pause: 0.8,
  },
  {
    speaker: "expositor",
    text: "A partir de ahí, la arquitectura puede crecer hacia una línea de manufactura donde la información obtenida por Aether pueda utilizarse para coordinar procesos automatizados.",
    pause: 1.5,
  },
  { speaker: "expositor", text: "Esa es la dirección que sigue nuestro desarrollo.", pause: 1 },
  { speaker: "expositor", text: "No estamos construyendo solamente una máquina que vea.", pause: 1 },
  {
    speaker: "expositor",
    text: "Estamos construyendo una plataforma que pueda convertir lo que ve en información útil para actuar sobre el mundo físico.",
    pause: 1.5,
  },
  { speaker: "expositor", text: "Aether comienza observando.", pause: 1.2 },
  { speaker: "expositor", text: "Pero no queremos que termine ahí.", pause: 1.5 },
  { speaker: "expositor", text: "Queremos que vea, comprenda y decida.", pause: 1.5 },
  { speaker: "expositor", text: "Porque el futuro de la automatización no es hacer más.", pause: 1.5 },
  { speaker: "expositor", text: "Es aprender a hacerlo mejor.", pause: 2 },
  { speaker: "expositor", text: "Esto es Aether.", pause: 0 },
];

function speakScripted(text) {
  return new Promise((resolve) => speak(text, { onend: resolve }));
}

function waitSeconds(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/** Corre el guion completo, en orden, de principio a fin. Mientras corre,
 * mode = 'script' (ver handleVoiceCommand más abajo: el reconocimiento de
 * voz no interfiere con el guion, para que no se corte a media frase por
 * ruido de fondo). Al llegar a la línea marcada cueAfter:'activateCamera'
 * reutiliza activateRobot() — el mismo Modo Cámara que ya existía — para
 * mostrar la percepción en vivo; de ahí en adelante el sistema vuelve a
 * comportarse exactamente como ya funcionaba (Modo Cámara con "Lumina,
 * detente" para salir, gobernado por el propio activateRobot()/mode). */
async function runPresentationScript() {
  mode = "script";
  for (const segment of PRESENTATION_SCRIPT) {
    if (segment.speaker === "cue") {
      // Sin archivo de música disponible en el proyecto — no se fabrica
      // ese asset (Principio 4.5); queda como nota para quien opere la
      // presentación en vivo.
      console.log(`Aether · guion: ${segment.text}`);
      continue;
    }
    if (segment.speaker === "aether") {
      setFaceExpression(segment.mood || "neutral");
      await speakScripted(segment.text);
      if (segment.cueAfter === "activateCamera") activateRobot();
      if (segment.pause) await waitSeconds(segment.pause);
      continue;
    }
    // 'expositor': nunca se sintetiza — lo dice la persona en vivo. Solo
    // se honra la misma pausa del guion antes de seguir.
    if (segment.pause) await waitSeconds(segment.pause);
  }
}

// ============================================================================
// Modo Conversación — LLM (Ollama vía backend/main.py) + síntesis de voz.
// Nunca corre al mismo tiempo que Modo Cámara — ver el comentario grande
// de arriba y cancelPendingConversation(), llamada desde activateRobot().
// ============================================================================

// 'listening' (esperando que alguien hable) | 'thinking' (esperando a
// Ollama) | 'speaking' (reproduciendo la respuesta con TTS). Solo se
// mandan preguntas nuevas al LLM cuando esto es 'listening' — evita
// pisar una pregunta en curso con otra.
let conversationSubState = "listening";
let pendingAskController = null;

/** Corta de raíz cualquier trabajo de Modo Conversación en curso — se
 * llama SIEMPRE antes de mostrar Modo Cámara (ver activateRobot). Sin
 * esto, una respuesta de Ollama que llega tarde, o una síntesis de voz a
 * medias, seguirían "vivas" mientras la cámara/YOLO ya están activos. */
function cancelPendingConversation() {
  if (pendingAskController) {
    pendingAskController.abort();
    pendingAskController = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  // Por si se cambia a Modo Cámara mientras Lumina está a media oración: el
  // cancel() de arriba debería disparar el onerror ("interrupted") de la
  // utterance y reanudar el reconocimiento por ese camino, pero no hay que
  // depender solo de eso — si por lo que sea no se disparó, esto lo
  // garantiza igual (Modo Cámara sí necesita el reconocimiento activo, para
  // "Lumina, detente").
  if (recognitionPausedForSpeech) resumeRecognitionAfterSpeech();
  conversationSubState = "listening";
}

// Heurística simple por palabras clave (no análisis de sentimiento real,
// no hacía falta) para elegir con qué expresión reacciona Lumina a su
// propia respuesta. "No sé"/"no tengo esa información" es HONESTIDAD del
// propio system prompt, no un fallo — se lee como 'confundido' (duda
// genuina), distinto de una disculpa real (que sí se lee como 'triste').
// Listas ampliadas — la versión anterior solo cubría un puñado de palabras
// y se quedaba corta contra el vocabulario real que Lumina usa con su tono
// tierno/entusiasta (ver LUMINA_SYSTEM_PROMPT en backend/main.py). Ajustadas
// de nuevo tras probar con 7 respuestas reales de Ollama: la frase de duda
// que el modelo usa en la práctica es "no tengo acceso a..." (no "no tengo
// [esa] información", que era lo único cubierto antes — se agrega
// "acceso" explícitamente), y "me encant\w*" (raíz, sin \b final fijo)
// para cubrir conjugaciones reales como "me encantaría"/"me encantó", que
// "me encanta" a secas no capturaba por el límite de palabra estricto.
const UNCERTAIN_PATTERN =
  /\b(no s[ée]|no tengo (esa|esta|la) informaci[oó]n|no tengo acceso|no estoy segur[oa]|no puedo (recordar|asegurar|confirmar)|no tengo certeza|no lo s[ée] (con exactitud|con certeza))\b/i;
const APOLOGETIC_PATTERN =
  /\b(lo siento|disculpa|perd[oó]n|desafortunadamente|lamentablemente|qu[eé] pena|me entristece|triste)\b/i;
const POSITIVE_PATTERN =
  /\b(genial|excelente|perfecto|claro que s[ií]|con gusto|encantad[oa]|me encant\w*|feliz|content[oa]|alegre|entusiasmad[oa]|emocionad[oa]|maravillos[oa]|fant[aá]stic[oa]|incre[ií]ble|qu[eé] alegr[ií]a|orgullos[oa])\b/i;

/** Bug real reportado: la respuesta decía "Estoy inmensamente feliz" pero
 * la cara se quedó neutral. Causa raíz encontrada revisando el código (no
 * era que "feliz" faltara en la lista, ni que setFaceExpression() dejara
 * de llamarse): la versión anterior devolvía la PRIMERA categoría que
 * encontrara en un orden fijo (duda → disculpa → positivo), sin importar
 * en qué parte del texto aparecía cada una. Desde que las respuestas
 * pueden traer varias oraciones reales (ver _clean_llm_answer en
 * backend/main.py), es común que Lumina combine una idea positiva con una
 * de duda en la misma respuesta (ej. "Me encanta ayudar, aunque no estoy
 * segura de esa cifra") — el "feliz" quedaba tapado por el "no estoy
 * segura" solo por el orden en que se revisaban las categorías, aunque lo
 * positivo fuera la idea principal.
 *
 * Corrección: en vez de "la primera categoría que aparece gana", gana la
 * categoría cuya ÚLTIMA coincidencia aparece más tarde en el texto — el
 * tono con el que termina la respuesta suele ser el más representativo de
 * ella completa. */
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
    while ((match = globalPattern.exec(text)) !== null) {
      lastIndex = match.index;
    }
    if (lastIndex > winnerLastIndex) {
      winnerLastIndex = lastIndex;
      winnerName = name;
    }
  }
  return winnerName || "neutral";
}

// ============================================================================
// Selección de voz — se abandonó el timbre deliberadamente robótico
// (pitch/rate bajos) que tenía antes esta función: sonaba a máquina fría,
// no a la compañera cálida y tierna que pide el system prompt de Lumina.
// Ahora se busca la mejor voz en español que el navegador tenga instalada
// de verdad, en vez de forzar un timbre sintético encima de cualquiera.
// ============================================================================

let selectedVoice = null;
let voicesLoggedOnce = false;

// HONESTIDAD EXPLÍCITA: la Web Speech API no permite clonar ni imitar la
// voz de un personaje específico (ej. Jarvis) — solo elegir entre las
// voces que el sistema/navegador ya tiene instaladas. "Lo más parecido a
// Jarvis posible" con esta API significa, en la práctica, "la mejor voz
// MASCULINA en es-MX disponible, con pitch/rate ajustados" (ver speak()
// más abajo) — nunca una réplica real de ninguna voz existente. No se
// fabrica esa capacidad (Principio 4.5, aether_context_docs.md).
//
// La API tampoco expone el género de una voz — hay que inferirlo por el
// nombre propio que trae ("Microsoft Jorge", "Microsoft Elena"...). Esta
// lista es CURADA A MANO, no exhaustiva para cada país hispanohablante:
// cubre los nombres masculinos que Microsoft documenta para sus voces de
// red "Online (Natural)" en los locales más relevantes aquí (es-MX, es-ES,
// es-US, es-AR). Si el navegador no ofrece ninguna de estas, se cae a
// MALE_VOICE_LOCAL_HINTS o, si tampoco, a cualquier voz en español
// disponible (ver el orden de prioridad en pickBestSpanishVoice).
const MALE_VOICE_NAME_HINTS = [
  "jorge", // es-MX
  "alvaro",
  "álvaro", // es-ES
  "alonso", // es-US
  "tomas",
  "tomás", // es-AR
];

// Voz LOCAL (no de red) confirmada masculina de verdad en este proyecto:
// "Microsoft Raul - Spanish (Mexico)" — vista en un log de consola real.
const MALE_VOICE_LOCAL_HINTS = ["raul", "raúl"];

/** Elige la mejor voz en español disponible entre las que reporta
 * getVoices(). Primero se decide el IDIOMA (es-MX si hay alguna
 * disponible, cualquier otro es-* como respaldo — bug real corregido: la
 * versión anterior no distinguía por país y eligió "Microsoft Elena"
 * (es-AR) por accidente, teniendo "Microsoft Raul" en es-MX disponible),
 * y dentro de ese grupo de idioma se aplica esta cascada de calidad:
 *
 * 1. Forzada a mano desde la consola (localStorage.setItem con la llave
 *    "aether_voice_override" y un fragmento del nombre de la voz — ver el
 *    comando en el bloque de comandos al inicio del archivo). Máxima
 *    prioridad de todas, sin importar idioma: si Mario encuentra una voz
 *    mejor revisando la lista que se loguea, puede forzarla sin tocar
 *    código.
 * 2. Una voz de red (ej. "Online (Natural)") con nombre masculino conocido
 *    (MALE_VOICE_NAME_HINTS) — pedido explícito: voz de hombre.
 * 3. Una voz LOCAL con nombre masculino conocido (MALE_VOICE_LOCAL_HINTS).
 * 4. Cualquier voz de red (puede ser femenina — mejor eso que "compact").
 * 5. Cualquier voz que no sea "compact" (compresión mínima del sistema
 *    operativo, notablemente más robótica).
 * 6. La primera voz que haya, aunque sea "compact".
 */
function pickBestSpanishVoice(voices) {
  const spanishVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("es"));
  if (spanishVoices.length === 0) return null;

  const isCompact = (v) => /compact/i.test(v.name);
  const isNetwork = (v) => v.localService === false;
  const matchesAny = (v, hints) => hints.some((hint) => v.name.toLowerCase().includes(hint));

  let override = "";
  try {
    override = (localStorage.getItem("aether_voice_override") || "").trim().toLowerCase();
  } catch {
    // localStorage puede no estar disponible (ej. modo privado estricto) —
    // se sigue sin override, no es un error real que reportar.
  }
  if (override) {
    const forced = spanishVoices.find((v) => v.name.toLowerCase().includes(override));
    if (forced) return forced;
    console.warn(
      `Aether: aether_voice_override="${override}" no coincide con ninguna voz en español disponible — se ignora.`,
    );
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

/** getVoices() puede devolver [] la primera vez que se llama en algunos
 * navegadores — la lista real se carga de forma asíncrona y avisa vía el
 * evento "voiceschanged" (ver el listener más abajo), por eso esto se
 * llama tanto al cargar la página como cada vez que ese evento dispara. */
function refreshSelectedVoice() {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;

  if (!voicesLoggedOnce) {
    voicesLoggedOnce = true;
    // Solo se loguean las voces en español, no las 500+ de otros idiomas
    // que Edge/Chrome traen por las voces de red "Online (Natural)" — un
    // log real de este proyecto mostró que la consola trunca un array de
    // ese tamaño (terminaba en "…" a media lista), y el resto de idiomas no
    // aporta nada para elegir la voz de Lumina.
    const spanish = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("es"));
    console.log(
      `Aether · voces en español disponibles (${spanish.length}):`,
      spanish.map((v) => `${v.name} (${v.lang})${v.localService === false ? " · red" : ""}`),
    );
  }

  const best = pickBestSpanishVoice(voices);
  if (best && best !== selectedVoice) {
    selectedVoice = best;
    const isMexican = best.lang.toLowerCase() === "es-mx";
    console.log(
      `Aether · voz elegida: ${best.name} (${best.lang})` +
        (isMexican ? " · es-MX" : " · NO es es-MX, ningún es-MX disponible — respaldo de otro país"),
    );
  }
}

if ("speechSynthesis" in window) {
  refreshSelectedVoice();
  window.speechSynthesis.onvoiceschanged = refreshSelectedVoice;
}

// ============================================================================
// Animación de boca mientras Lumina habla — el motor real vive en
// "ANIMACIÓN CONTINUA" más arriba (mouthTalkPath/randomizeMouthBandTargets/
// startTalkingAnimation/stopTalkingAnimation/mouthBoundaryBurst; ver ahí la
// honestidad explícita sobre por qué esto es una aproximación procedural y
// no un analizador de audio real). Esta sección solo conecta esos ganchos
// a los eventos reales de SpeechSynthesisUtterance.
// ============================================================================

function currentBaseMouthShape() {
  const cfg = EXPRESSIONS[currentExpression];
  return cfg ? cfg.mouth : "flat";
}

/** Dice `text` en voz alta con la mejor voz en español disponible (ver
 * selección arriba) y un timbre cálido, no robótico. */
function speak(text, { onend } = {}) {
  if (!("speechSynthesis" in window)) {
    console.warn("Aether: speechSynthesis no está disponible en este navegador.");
    if (onend) onend();
    return;
  }
  // Apaga el reconocimiento ANTES de hablar (ver pauseRecognitionForSpeech
  // arriba) — mientras Lumina habla, el micrófono debe estar completamente
  // apagado, no solo ignorando resultados, para no transcribirse a sí misma.
  pauseRecognitionForSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-MX";
  utterance.pitch = 1.1; // 1.05–1.15 pedido: cálido, ya no el 0.7–0.9 robótico de antes
  utterance.rate = 1.0; // ritmo natural, ya no el 0.92 mecánico de antes

  if (selectedVoice) utterance.voice = selectedVoice;

  utterance.onstart = () => startTalkingAnimation();
  // onboundary: único timing real de habla que el navegador entrega para
  // speechSynthesis — ver "ANIMACIÓN CONTINUA" arriba sobre por qué no hay
  // forma de ir más allá de esto (no existe AnalyserNode posible sobre
  // SpeechSynthesisUtterance). Algunos navegadores/voces nunca lo disparan
  // — la boca sigue viéndose viva igual, solo sin el empujón extra.
  utterance.onboundary = () => mouthBoundaryBurst();

  utterance.onend = () => {
    stopTalkingAnimation();
    resumeRecognitionAfterSpeech();
    if (onend) onend();
  };
  utterance.onerror = (event) => {
    console.warn("Aether: error de síntesis de voz.", event);
    stopTalkingAnimation();
    resumeRecognitionAfterSpeech();
    if (onend) onend();
  };

  window.speechSynthesis.cancel(); // corta cualquier habla anterior antes de empezar esta
  window.speechSynthesis.speak(utterance);
}

/** Le manda `question` a Lumina (POST /robot/ask, backend + Ollama) y dice
 * la respuesta en voz alta. Solo debe llamarse en Modo Conversación con
 * conversationSubState === 'listening' — el llamador (ver el manejo de
 * voz más abajo) ya lo garantiza. */
async function askLumina(question) {
  conversationSubState = "thinking";
  setFaceExpression("pensando");
  pendingAskController = new AbortController();

  let answer;
  try {
    const response = await fetch("/robot/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal: pendingAskController.signal,
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      throw new Error(detail?.detail || `Lumina no pudo responder (error ${response.status}).`);
    }
    const data = await response.json();
    answer = data.answer;
  } catch (err) {
    pendingAskController = null;
    if (err.name === "AbortError") return; // cancelado a propósito (ver cancelPendingConversation)
    console.warn("Aether: no se pudo consultar a Lumina.", err);
    if (mode !== "conversation") return; // cambiaron a Modo Cámara mientras tanto
    conversationSubState = "listening";
    setFaceExpression("error");
    setTimeout(() => {
      if (mode === "conversation" && conversationSubState === "listening") {
        setFaceExpression(restingExpression());
      }
    }, 2000);
    return;
  }
  pendingAskController = null;

  if (mode !== "conversation") return; // cambiaron a Modo Cámara mientras Ollama pensaba
  console.log(`Aether · Lumina responde: "${answer}"`);
  setFaceExpression(chooseExpressionForAnswer(answer));
  conversationSubState = "speaking";
  speak(answer, {
    onend: () => {
      if (mode !== "conversation") return; // cambiaron a Modo Cámara mientras hablaba
      conversationSubState = "listening";
      setFaceExpression(restingExpression());
    },
  });
}

// "Lumina, presentación" — activa/desactiva Modo Presentación (cara en
// 'feliz' sostenida). Disparador MANUAL a propósito: no hay forma de
// detectar "hay gente cerca" sin sensores que no existen (Principio 4.5).
const PRESENTATION_PATTERN = /\b(presentaci[oó]n|present[aá]te)\b/i;

function heardPresentationCommand(transcript) {
  return LUMINA_PATTERN.test(transcript) && PRESENTATION_PATTERN.test(transcript);
}

function togglePresentationMode() {
  presentationModeActive = !presentationModeActive;
  console.log(`Aether · modo presentación: ${presentationModeActive ? "activado" : "desactivado"}`);
  if (mode === "conversation" && conversationSubState === "listening") {
    setFaceExpression(restingExpression());
  }
}

// ============================================================================
// Panel de registro — últimas detecciones reales (GET /perception/recent-detections)
// ============================================================================

const detectionsLogLinesEl = document.getElementById("detections-log-lines");
const detectionsLogEmptyEl = document.getElementById("detections-log-empty");
const DETECTIONS_POLL_MS = 2000;
let detectionsPollTimer = null;

function formatDetectionLine(detection) {
  const pct = (detection.confidence * 100).toFixed(0);
  const code = detection.code_data
    ? ` <span class="detections-log-code">· ${detection.code_data}</span>`
    : "";
  return `<p class="detections-log-line"><span class="detections-log-class">${detection.detected_class}</span> · ${pct}%${code}</p>`;
}

async function pollDetections() {
  try {
    const response = await fetch("/perception/recent-detections?limit=8");
    if (!response.ok) return;
    const detections = await response.json();
    if (detections.length === 0) {
      detectionsLogEmptyEl.hidden = false;
      detectionsLogLinesEl.innerHTML = "";
      return;
    }
    detectionsLogEmptyEl.hidden = true;
    // column-reverse en CSS ya pone lo más reciente abajo — se manda en el
    // mismo orden (más reciente primero) en que ya llega de la API.
    detectionsLogLinesEl.innerHTML = detections.map(formatDetectionLine).join("");
  } catch {
    // Silencioso a propósito: un poll fallido no debe tapar el video con
    // un mensaje de error — el botón "Detener" siempre sigue funcionando.
  }
}

function startDetectionsPolling() {
  pollDetections();
  detectionsPollTimer = setInterval(pollDetections, DETECTIONS_POLL_MS);
}

function stopDetectionsPolling() {
  clearInterval(detectionsPollTimer);
}

// ============================================================================
// Comando de voz (Web Speech API nativa — sin modelo propio, ver honestidad
// explícita arriba). Diagnóstico por consola + punto de estado mínimo.
// ============================================================================

const voiceStatusDotEl = document.getElementById("voice-status-dot");

// Palabra clave: "Lumina", NO "Aether". Se cambió después de probar el
// diagnóstico real: el navegador transcribía "Aether, inicia" como
// "twitter inicio" de forma consistente (log real observado: "Escuchado:
// twitter inicio, inicio, twitter inicio") — "Aether" es fonéticamente
// demasiado cercano a "Twitter" en español para el reconocimiento de
// Chrome. "Lumina" no tiene ese choque con una palabra común.
//
// Tolerancia real: NO se busca la frase completa como una sola coincidencia
// (eso ya falló una vez) — se detecta "lumina" (o una variación cercana que
// el motor de voz podría transcribir, ej. "ilumina") en cualquier parte del
// texto, y por separado una palabra de inicio/paro en cualquier parte del
// mismo texto. No importa el orden ni qué tan lejos estén una de otra
// dentro de la frase escuchada.
const LUMINA_PATTERN = /\b(lumina|ilumina|luminia)\b/i;
const START_WORD_PATTERN =
  /\b(inicia|inicio|iniciar|enciende|encendido|arranca|arranque|empieza|comienza|activa|prende)\b/i;
// Bug real reportado ("no funcionan todas las preguntas"): "para" y "alto"
// estaban aquí como sinónimos de "detente", pero son palabras demasiado
// comunes en español — "Lumina, ¿PARA qué sirves?" (una de las preguntas
// precargadas de backend/main.py) se detectaba como comando de paro y la
// pregunta nunca llegaba a askLumina(). Se quitan ambas: "detente"/"apaga"/
// "termina" siguen siendo formas naturales de pedir que se detenga, sin el
// riesgo de coincidir con el uso normal de "para"/"alto" dentro de una
// pregunta cualquiera.
const STOP_WORD_PATTERN = /\b(det[eé]n|detente|apaga|termina)\b/i;

function heardStartCommand(transcript) {
  return LUMINA_PATTERN.test(transcript) && START_WORD_PATTERN.test(transcript);
}

function heardStopCommand(transcript) {
  return LUMINA_PATTERN.test(transcript) && STOP_WORD_PATTERN.test(transcript);
}

// "Lumina, <emoción>" — cambia la expresión por voz. No estaba en el
// pedido original (la voz solo controlaba activar/detener la cámara),
// pero quedó claro probando el diagnóstico que se esperaba esto también,
// así que se agrega aquí: mismo mecanismo, un patrón tolerante por
// expresión en vez de buscar el nombre exacto de EXPRESSIONS (que es en
// español sin acentos ni variaciones de género).
const EXPRESSION_VOICE_PATTERNS = [
  { name: "feliz", pattern: /\bfeliz\b/i },
  { name: "confundido", pattern: /\bconfundid[oa]\b/i },
  { name: "sorprendido", pattern: /\bsorprendid[oa]\b/i },
  { name: "pensando", pattern: /\bpensando\b/i },
  { name: "triste", pattern: /\btriste\b/i },
  { name: "error", pattern: /\berror\b/i },
  { name: "neutral", pattern: /\bneutral\b/i },
  // "inectivo" es una mistranscripción real observada para "inactivo" —
  // se tolera igual que las variaciones de "lumina".
  { name: "inactivo", pattern: /\b(inactiv[oa]|inectiv[oa])\b/i },
];

function heardExpressionCommand(transcript) {
  if (!LUMINA_PATTERN.test(transcript)) return null;
  const match = EXPRESSION_VOICE_PATTERNS.find(({ pattern }) => pattern.test(transcript));
  return match ? match.name : null;
}

// Bug real reportado (revisando logs de una conversación de prueba): el
// motor de reconocimiento del navegador a veces parte un comando corto
// como "lumina inicio" en DOS resultados finalizados separados ("lumina"
// por un lado, "inicio" por otro), cada uno evaluado solo — el fragmento
// aislado "lumina" no coincide con ningún comando y termina mandándose
// completo a Ollama como pregunta basura. Corrección: en vez de despachar
// cada fragmento isFinal de inmediato, se acumulan en un buffer y se espera
// un breve silencio (sin fragmentos nuevos) antes de evaluar el texto
// combinado como una sola frase — así sobrevive la fragmentación sin
// importar en cuántos pedazos la parta el navegador.
const VOICE_COMMAND_DEBOUNCE_MS = 600;
let pendingTranscriptBuffer = "";
let voiceCommandDebounceTimer = null;

function queueVoiceFragment(transcript) {
  pendingTranscriptBuffer = pendingTranscriptBuffer
    ? `${pendingTranscriptBuffer} ${transcript}`
    : transcript;
  clearTimeout(voiceCommandDebounceTimer);
  voiceCommandDebounceTimer = setTimeout(() => {
    const combined = pendingTranscriptBuffer;
    pendingTranscriptBuffer = "";
    console.log(`Aether · escuchado (${mode}): "${combined}"`);
    handleVoiceCommand(combined);
  }, VOICE_COMMAND_DEBOUNCE_MS);
}

/** Un solo lugar que decide qué hacer con una frase YA FINALIZADA (ver el
 * porqué de "ya finalizada" en el listener de "result" más abajo).
 *
 * "Lumina, inicia" cambia a Modo Cámara SIEMPRE, sin importar el modo
 * actual — es la única forma de entrar a ese modo. En Modo Cámara, a
 * partir de ahí, SOLO se reconocen comandos de control simples por
 * palabra clave (detente) — nunca preguntas abiertas al LLM, esa es
 * justo la exclusión mutua de recursos que motiva todo este archivo (ver
 * el comentario grande al inicio). En Modo Conversación, si la frase no
 * es ningún comando de control conocido, se trata como una pregunta real
 * para Lumina. */
function handleVoiceCommand(transcript) {
  // Pantalla de espera (ver sección "PANTALLA DE ESPERA" arriba) — se
  // revisa primero y siempre con "return": mientras no se haya activado
  // el guion, ningún otro comando de voz (ni preguntas a Ollama) debe
  // procesarse.
  if (mode === "boot") {
    if (LUMINA_PATTERN.test(transcript)) greetBootWake();
    return;
  }
  if (mode === "boot-awaiting-command") {
    startPresentationFromVoice(transcript);
    return;
  }
  if (mode === "script") return; // guion en curso — el micrófono no debe interrumpirlo

  if (heardStartCommand(transcript)) {
    activateRobot();
    return;
  }

  if (mode === "camera") {
    if (heardStopCommand(transcript)) deactivateRobot();
    return; // Modo Cámara: nada más se procesa aquí, nunca preguntas al LLM
  }

  // A partir de aquí, Modo Conversación.
  if (heardPresentationCommand(transcript)) {
    togglePresentationMode();
    return;
  }

  const expressionName = heardExpressionCommand(transcript);
  if (expressionName) {
    // Comando manual de prueba (ver la lista de comandos de consola) — no
    // cuenta como pregunta real, no se manda a Ollama.
    setFaceExpression(expressionName);
    return;
  }

  if (heardStopCommand(transcript)) return; // "detente" sin cámara activa no hace nada

  if (conversationSubState !== "listening") return; // ya está pensando/hablando, se ignora por ahora
  askLumina(transcript);
}

// Mensajes en español para los códigos reales de
// SpeechRecognitionErrorEvent.error — ver
// https://developer.mozilla.org/docs/Web/API/SpeechRecognitionErrorEvent/error
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
  console.log(active ? "Aether · reconocimiento: escuchando" : "Aether · reconocimiento: inactivo");
}

function setAttentionIndicator(message) {
  voiceStatusDotEl.classList.remove("voice-status-dot--listening");
  voiceStatusDotEl.classList.add("voice-status-dot--attention");
  voiceStatusDotEl.title = `Voz: ${message}`;
}

async function logMicPermission() {
  if (!navigator.permissions || !navigator.permissions.query) {
    console.log("Aether · micrófono: este navegador no permite verificar el permiso.");
    return;
  }
  try {
    const status = await navigator.permissions.query({ name: "microphone" });
    const labels = { granted: "permitido", denied: "denegado", prompt: "pendiente de confirmar" };
    const logState = (s) => console.log(`Aether · micrófono: ${labels[s] || s}`);
    logState(status.state);
    if (status.state === "denied") setAttentionIndicator("micrófono denegado");
    // Si la persona cambia el permiso desde la configuración del navegador
    // mientras esta pestaña sigue abierta, el log se actualiza solo.
    status.onchange = () => {
      logState(status.state);
      if (status.state === "denied") setAttentionIndicator("micrófono denegado");
    };
  } catch {
    console.log("Aether · micrófono: este navegador no permite verificar el permiso.");
  }
}

logMicPermission();

if (SpeechRecognitionImpl) {
  // Se asigna a la variable ya hoisteada al inicio del archivo (no
  // `const recognition = ...` local a este bloque) — speak() necesita
  // llamar recognition.stop() desde mucho antes en el archivo, y ambos
  // deben referirse a la MISMA instancia.
  recognition = new SpeechRecognitionImpl();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "es-MX";

  recognition.addEventListener("start", () => {
    setListeningIndicator(true);
  });

  // IMPORTANTE: event.results acumula TODO lo dicho desde que arrancó esta
  // sesión de reconocimiento (que puede durar minutos) — unir todo ese
  // historial en un solo texto (como hacía la versión anterior) mezclaba
  // frases de comandos distintos dichos en momentos distintos: bastaba con
  // que "inicia" y "detente" aparecieran juntos en algún punto de la
  // sesión para que el sistema pareciera prenderse y apagarse solo.
  // event.resultIndex marca dónde empieza lo NUEVO desde el último evento;
  // dentro de eso, solo se toman en cuenta resultados YA FINALIZADOS
  // (isFinal), nunca texto interino a medio decir. Cada fragmento
  // finalizado se encola en el buffer de debounce (ver queueVoiceFragment)
  // en vez de despacharse de inmediato — así un comando partido en varios
  // resultados (ej. "lumina" / "inicio" por separado) se evalúa junto.
  recognition.addEventListener("result", (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (!result.isFinal) continue;
      const transcript = result[0].transcript.toLowerCase().trim();
      if (!transcript) continue;
      queueVoiceFragment(transcript);
    }
  });

  recognition.addEventListener("error", (event) => {
    const message = VOICE_ERROR_MESSAGES[event.error] || event.error;
    console.warn(`Aether · error de voz: ${message}`);

    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      shouldKeepListening = false;
      voiceAvailable = false;
      setAttentionIndicator(message);
      if (mode === "conversation" && conversationSubState === "listening") {
        setFaceExpression(restingExpression());
      }
    }
    // otros errores (ej. "no-speech", "network") son transitorios — el
    // propio "end" de abajo reinicia el reconocimiento solo.
  });

  // El reconocimiento "continuo" del navegador igual se corta solo después
  // de un rato de silencio — hay que reiniciarlo a mano cuando eso pasa, o
  // "escuchando siempre" dejaría de escuchar tras el primer silencio. Si el
  // corte fue A PROPÓSITO porque Lumina está hablando
  // (recognitionPausedForSpeech), NO se reinicia aquí — eso lo hace
  // resumeRecognitionAfterSpeech() cuando la utterance termine, nunca antes.
  recognition.addEventListener("end", () => {
    setListeningIndicator(false);
    if (recognitionPausedForSpeech) return;
    if (shouldKeepListening) {
      try {
        recognition.start();
      } catch (err) {
        console.warn(`Aether · no se pudo reiniciar el reconocimiento: ${err.message}`);
      }
    }
  });

  try {
    recognition.start();
  } catch (err) {
    setAttentionIndicator("no se pudo iniciar el reconocimiento");
    console.warn("Aether · no se pudo iniciar el reconocimiento de voz.", err);
  }
} else {
  setAttentionIndicator("este navegador no soporta reconocimiento de voz");
  console.warn("Aether · este navegador no soporta Web Speech API. Usa el botón de respaldo.");
}

// ============================================================================
// Estado inicial — pantalla de espera (negra) hasta que se diga "Lumina" o
// se use el botón oculto (ver sección "PANTALLA DE ESPERA" arriba). Ya no
// arranca directo en Modo Conversación: ese modo normal solo se activa
// después de terminar el guion y salir de Modo Cámara (deactivateRobot,
// sin cambios), igual que ya funcionaba antes de este pedido.
// ============================================================================

setFaceExpression(restingExpression());
scheduleNextGazeDrift();

// ============================================================================
// Parallax de mouse sobre #face-stage (ver robot.css: transform estático vía
// calc() de --parallax-x/--parallax-y, no una animación) — se omite del
// todo si el usuario pidió menos movimiento, o si el dispositivo no tiene
// un puntero fino (pantallas táctiles no generan mousemove real, no tiene
// sentido escuchar el evento ahí). Reutiliza `prefersReducedMotion`, ya
// declarada como const global por node-field.js (se carga antes que este
// archivo en robot.html, mismo scope global al ser ambos scripts clásicos)
// — NO volver a declararla aquí: un segundo `const prefersReducedMotion`
// es un SyntaxError de redeclaración que revienta la carga de TODO este
// archivo (incluida la inicialización del micrófono más arriba), no solo
// un warning. Bug real ya cometido una vez, ver commit de este comentario.
// ============================================================================
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
if (!prefersReducedMotion && hasFinePointer) {
  window.addEventListener("mousemove", (event) => {
    const relX = (event.clientX / window.innerWidth - 0.5) * 2; // -1..1
    const relY = (event.clientY / window.innerHeight - 0.5) * 2;
    faceStageEl.style.setProperty("--parallax-x", relX.toFixed(3));
    faceStageEl.style.setProperty("--parallax-y", relY.toFixed(3));
  });
}
