// Demostración estática (Netlify): no hay servidor, así que este archivo simula lo que el backend hacía.
//  1) /robot/tts   -> audio ya sintetizado de las frases del guion (si falta, Lumina usa la voz del navegador).
//  2) /voice/ws    -> un "servicio de voz" falso: una voz sintetizada dice los comandos de activación en voz alta
//                     y la página los recibe como si el micrófono los hubiera oído.
//  3) El resto de rutas del servidor (cámara, inventario, llamadas) responden 404 y la página lo tolera.
// Ninguna llave ni dato privado vive aquí: el mapa de audios lo inyecta scripts/build_netlify.py.
(() => {
  const LANG = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "es";
  const TTS = __TTS_MAP__;
  const COMMANDS = {
    es: ["Hola Lumina, ¿cómo estás?", "Lumina, enséñanos quién eres", "Lumina, muéstranos tu interior"],
    en: ["Hello Lumina, how are you?", "Lumina, show us who you are", "Lumina, show us your interior"],
  }[LANG];
  const GAP_MS = 2500; // pausa tras terminar Lumina, antes de que "hable" la voz de los comandos

  const realFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    const path = new URL(url, location.href).pathname;
    if (path === "/robot/tts") {
      try {
        const file = TTS[JSON.parse(init.body).text.trim()];
        if (file) return realFetch(file);
      } catch (e) { /* cae a la voz del navegador */ }
      return Promise.resolve(new Response("", { status: 503 }));
    }
    if (/^\/(config|perception|line|robot)\//.test(path)) return Promise.resolve(new Response("{}", { status: 404 }));
    return realFetch(input, init);
  };

  // Voz de quien da los comandos: distinta a la de Lumina (más grave), solo en el navegador.
  function sayCommand(text, done) {
    const synth = window.speechSynthesis;
    if (!synth) return setTimeout(done, 1200);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG === "en" ? "en-US" : "es-MX";
    const voices = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith(LANG));
    if (voices.length) u.voice = voices.find((v) => /male|raul|raúl|jorge|pablo|david|mark|guy/i.test(v.name)) || voices[0];
    u.pitch = 0.75;
    u.rate = 1;
    let finished = false;
    const end = () => { if (!finished) { finished = true; done(); } };
    let started = false;
    u.onstart = () => { started = true; };
    u.onend = end;
    u.onerror = end;
    setTimeout(() => { if (!started) end(); }, 2500); // el teléfono no la dejó sonar: el guion sigue igual
    setTimeout(end, 9000); // por si el navegador nunca avisa el final
    synth.speak(u);
  }

  class FakeVoiceService {
    constructor() {
      this.readyState = 1;
      this.next = 0;
      this.heardLumina = false;
      setTimeout(() => {
        if (this.onopen) this.onopen({});
        this.emit({ v: 1, type: "status", state: "active", t: new Date().toISOString() });
      }, 0);
    }
    emit(data) { if (this.onmessage) this.onmessage({ data: JSON.stringify(data) }); }
    // La página avisa cuándo Lumina empieza y deja de hablar (anti-eco): aprovechamos para turnar los comandos.
    send(raw) {
      let msg;
      try { msg = JSON.parse(raw); } catch (e) { return; }
      if (msg.type !== "speaking") return;
      if (msg.value) { this.heardLumina = true; return; }
      if (!this.heardLumina || this.next >= COMMANDS.length) return;
      const text = COMMANDS[this.next++];
      if (typeof introStep === "number" && introStep > this.next - 1) return this.send(raw); // ya se hizo: pasa al siguiente
      setTimeout(() => sayCommand(text, () => this.emit({ v: 1, type: "transcript", text: text.toLowerCase(), t: new Date().toISOString() })), GAP_MS);
    }
    close() { this.readyState = 3; }
    addEventListener() {}
    removeEventListener() {}
  }
  class FakeShow {
    constructor() { this.readyState = 1; setTimeout(() => this.onopen && this.onopen({}), 0); }
    send() {}
    close() { this.readyState = 3; }
    addEventListener() {}
    removeEventListener() {}
  }

  // ── Teléfonos: el audio y la voz solo se permiten tras un toque. Se desbloquean con el primer toque y el
  //    audio de Lumina suena por Web Audio (queda abierto para toda la sesión). Si no suena, el guion sigue.
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  const getCtx = () => (ctx || (ctx = new AC()));
  function unlock() {
    try {
      const c = getCtx();
      if (c.state !== "running") c.resume();
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch (e) { /* sin Web Audio */ }
    try { const u = new SpeechSynthesisUtterance(""); u.volume = 0; window.speechSynthesis.speak(u); } catch (e) { /* sin voz */ }
  }
  ["pointerdown", "touchend", "click", "keydown"].forEach((ev) => addEventListener(ev, unlock, { capture: true, passive: true }));

  const RealAudio = window.Audio;
  class AudioWeb {
    constructor(src) { this.src = src; this.volume = 1; this.stopped = false; this.onplaying = this.onended = this.onerror = null; }
    async play() {
      try {
        const c = getCtx();
        if (c.state !== "running") await c.resume().catch(() => {});
        const data = await (await fetch(this.src)).arrayBuffer();
        const buffer = await new Promise((ok, fail) => c.decodeAudioData(data, ok, fail));
        if (this.stopped) return;
        const node = c.createBufferSource();
        const gain = c.createGain();
        node.buffer = buffer;
        gain.gain.value = this.volume;
        node.connect(gain); gain.connect(c.destination);
        this.node = node;
        let over = false;
        const end = () => { if (!over && !this.stopped) { over = true; if (this.onended) this.onended(); } };
        node.onended = end;
        setTimeout(end, (buffer.duration + 0.8) * 1000); // si el teléfono no reproduce, el guion igual avanza
        node.start(0);
        if (this.onplaying) this.onplaying();
      } catch (e) { if (this.onerror) this.onerror(e); }
    }
    pause() { this.stopped = true; try { if (this.node) this.node.stop(); } catch (e) { /* ya paró */ } }
  }
  window.Audio = function (src) { return typeof src === "string" && src.startsWith("blob:") ? new AudioWeb(src) : new RealAudio(src); };
  window.Audio.prototype = RealAudio.prototype;

  // Sin teclado: un toque hace de flecha del clicker (siguiente paso y luego las diapositivas).
  // WebKit (iPhone) manda los toques al marco que esté encima aunque tenga pointer-events:none, así que una capa
  // transparente propia los recibe; se quita en cuanto se abren las diapositivas para que ellas reciban los toques.
  let lastTap = 0;
  const catcher = document.createElement("div");
  catcher.id = "tap-catcher";
  catcher.style.cssText = "position:fixed;inset:0;z-index:25;background:transparent;touch-action:manipulation;-webkit-tap-highlight-color:transparent";
  catcher.addEventListener("pointerup", () => {
    if (Date.now() - lastTap < 700) return;
    lastTap = Date.now();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    setTimeout(() => {
      const slides = document.getElementById("slides-frame");
      if (slides && slides.classList.contains("holo-frame--on")) {
        catcher.remove();
        // El modelo 3D seguía dibujándose detrás de las diapositivas y frenaba el teléfono: se detiene y vuelve con Lumina.
        const holo = document.getElementById("holo-frame");
        const holoSrc = holo && holo.getAttribute("src");
        if (holoSrc) {
          holo.src = "about:blank";
          addEventListener("message", (e) => { if (e.data && e.data.type === "aether-slides-end") holo.src = holoSrc; });
        }
      }
    }, 250);
  });
  const addCatcher = () => document.body.appendChild(catcher);
  if (document.body) addCatcher(); else document.addEventListener("DOMContentLoaded", addCatcher);

  const RealWS = window.WebSocket;
  function PatchedWS(url, protocols) {
    const p = new URL(url, location.href).pathname;
    if (p === "/voice/ws") return new FakeVoiceService();
    if (p === "/show/ws") return new FakeShow();
    return new RealWS(url, protocols);
  }
  PatchedWS.CONNECTING = 0; PatchedWS.OPEN = 1; PatchedWS.CLOSING = 2; PatchedWS.CLOSED = 3;
  PatchedWS.prototype = RealWS.prototype;
  window.WebSocket = PatchedWS;
  window.__aetherDemoEstatica = true;
})();
