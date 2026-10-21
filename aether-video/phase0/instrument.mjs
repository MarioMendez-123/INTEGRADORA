// Instrumentación externa de robot.js (addInitScript): fetch("/robot/tts"), el
// <audio> que reproduce la respuesta y speechSynthesis, con performance.now().
// La usan phase0/measure-lumina.mjs y scripts/e2e-real.mjs.
export function instrument() {
  const log = (type, data = {}) => window.__lm.push({ t: performance.now(), type, ...data });
  window.__lm = [];
  window.__lmMeta = { timeOrigin: performance.timeOrigin };
  let lastText = null;

  document.addEventListener("click", (e) => log("click", { id: e.target && e.target.id }), true);

  const ofetch = window.fetch;
  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : input.url;
    if (!url.includes("/robot/tts")) return ofetch.apply(this, arguments);
    const text = JSON.parse(init.body).text;
    lastText = text;
    log("tts_req", { text });
    let r;
    try {
      r = await ofetch.apply(this, arguments);
    } catch (err) {
      log("tts_err", { text, err: String(err) });
      throw err;
    }
    log("tts_resp", { text, status: r.status });
    // Copia del mp3 real para medir su silencio inicial y compararlo con la referencia (0.7).
    if (r.ok) r.clone().arrayBuffer().then((buf) => {
      let bin = "";
      const bytes = new Uint8Array(buf);
      for (let k = 0; k < bytes.length; k += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(k, k + 0x8000));
      (window.__mp3 ||= []).push({ text, b64: btoa(bin) });
    });
    const oblob = r.blob.bind(r);
    r.blob = async () => {
      const b = await oblob();
      log("tts_body", { text, bytes: b.size });
      return b;
    };
    return r;
  };

  const OAudio = window.Audio;
  window.Audio = function (src) {
    const a = new OAudio(src);
    const text = lastText;
    for (const ev of ["loadedmetadata", "play", "playing", "ended", "error", "pause"]) {
      a.addEventListener(ev, () => log(`audio_${ev}`, { text, dur: a.duration }));
    }
    return a;
  };
  window.Audio.prototype = OAudio.prototype;

  if ("speechSynthesis" in window) {
    const ospeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = (u) => {
      const voice = u.voice ? `${u.voice.name} (${u.voice.lang})${u.voice.localService ? "" : " · red"}` : null;
      log("synth_req", { text: u.text, voice });
      u.addEventListener("start", () => log("synth_start", { text: u.text }));
      u.addEventListener("end", () => log("synth_end", { text: u.text }));
      u.addEventListener("error", (e) => log("synth_error", { text: u.text, err: e.error }));
      return ospeak(u);
    };
  }
}
