/**
 * HMI de la celda. Lee GET /line/cell/status cada segundo.
 * Las piezas salen de la cámara. SIN PIEZA no cuenta.
 * La cámara (line-vision.js) sigue siendo solo el video.
 *
 * ISA-101: color solo en condición anormal; si el PLC no responde, los
 * conteos se pintan como no válidos. Arranque y Paro piden confirmación.
 * ISA-18.2: las alarmas vienen del servidor (sobreviven a recargar).
 * IEC 62443, solo esta pantalla: el mando exige sesión. Ingeniería es
 * quien puede borrar el histórico.
 */
(() => {
  const $ = (id) => document.getElementById(id);
  const readout = $("readout");
  const resultBox = $("result-box");
  const errEl = $("cell-error");
  const ACTION = {
    pieza_aceptada: "Sigue en la banda",
    scrap_expulsado: "Expulsada por el pistón",
    fallo_actuacion: "El pistón no disparó",
    pulso_no_enviado: "El pulso no salió",
  };
  const samples = [];
  let lastState = null;
  let stateSince = Date.now();
  let camSince = 0;
  let timer = 0;
  let role = null;
  let pendingOn = null;

  const mmss = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  const now = () => new Date().toLocaleTimeString("es-MX", { hour12: false });

  function paintAlarms(alarms) {
    const list = alarms || [];
    $("alarm-count").textContent = `${list.filter((a) => a.active).length} activas`;
    $("alarm-list").innerHTML = list.length
      ? list
          .map((a) => {
            const cls = a.sev.toLowerCase();
            const flags = `${a.acked ? "" : " is-unacked"}${a.active || (a.event && !a.acked) ? "" : " is-cleared"}`;
            return `<li class="hmi-alarm hmi-alarm--${cls}${flags}"><time>${a.t}</time><b>P${a.priority}</b><span title="${a.cause}">${a.text}</span></li>`;
          })
          .join("")
      : '<li class="hmi-alarm-empty">Sin alarmas en este arranque del servidor.</li>';
    const top = list.find((a) => !a.acked);
    $("alarm-banner").hidden = !top;
    if (top) {
      $("alarm-banner").dataset.sev = top.sev.toLowerCase();
      $("alarm-banner-sev").textContent = `P${top.priority}`;
      const back = top.active || top.event ? "" : " Ya volvió. Falta reconocer.";
      $("alarm-banner-text").textContent = `${top.t} · ${top.text}. ${top.action}${back}`;
    }
  }

  function paint(data) {
    errEl.hidden = true;
    if (lastState !== data.state) stateSince = Date.now();
    lastState = data.state;

    const running = data.running !== false;
    $("proc-start").classList.toggle("is-on", running);
    $("proc-stop").classList.toggle("is-on", !running);
    $("proc-start").setAttribute("aria-pressed", String(running));
    $("proc-stop").setAttribute("aria-pressed", String(!running));
    $("proc-status").dataset.on = String(running);
    $("proc-status-text").textContent = running ? "Iniciada" : "Detenida";

    readout.dataset.state = data.state;
    $("cell-state").textContent = data.state.replace("_", " ");
    $("cell-reason").textContent = data.reason || "";

    const enVivo = data.source !== "simulado";
    const marca = enVivo ? "EN VIVO" : "SIM";
    const stale = enVivo ? !data.sources.vision_linea : !data.sources.plc;
    $("proc-source").textContent = marca;
    $("tag-juicio").textContent = stale && enVivo ? "SIN CÁMARA" : marca;
    $("tag-log").textContent = marca;
    $("kpi-box").classList.toggle("is-stale", stale);
    resultBox.classList.toggle("is-stale", stale);
    $("kpi-validity").textContent = stale ? (enVivo ? "SIN CÁMARA" : "NO VÁLIDO") : marca;

    const { inspected, pass, fail } = data.counts;
    const last = data.recent[0];
    if (stale) {
      $("n-inspected").textContent = "no válido";
      $("n-pass").textContent = "no válido";
      $("n-fail").textContent = "no válido";
      $("n-yield").textContent = "no válido";
      $("n-rate").textContent = "no válido";
      $("last-result").textContent = "no válido";
      $("last-piece").textContent = "Dato sin enlace PLC";
      $("last-action").textContent = "";
      resultBox.dataset.result = "";
    } else {
      $("n-inspected").textContent = `${inspected} pzas`;
      $("n-pass").textContent = `${pass} pzas`;
      $("n-fail").textContent = `${fail} pzas`;
      $("n-yield").textContent = inspected ? `${((pass / inspected) * 100).toFixed(1)} %` : "—";
      const t = Date.now();
      samples.push({ t, inspected });
      while (samples.length && t - samples[0].t > 600000) samples.shift();
      const ref = samples.find((s) => t - s.t <= 60000) || samples[0];
      $("n-rate").textContent = t - ref.t >= 20000 ? `${(((inspected - ref.inspected) / (t - ref.t)) * 60000).toFixed(1)} /min` : "—";
      resultBox.dataset.result = last ? last.resultado : "";
      $("last-result").textContent = last ? last.resultado : "—";
      $("last-piece").textContent = last ? `Pieza #${last.pieza}` : "Sin piezas";
      $("last-action").textContent = last ? ACTION[last.accion] || last.accion : "";
    }
    $("n-plc").textContent = data.sources.plc ? (enVivo ? "Listas" : "OK") : (enVivo ? "Sin pines" : "Perdido");
    $("n-plc").classList.toggle("is-fault", !data.sources.plc);

    $("cell-log").innerHTML = data.recent
      .map((ev) => `<li class="hmi-log-${ev.resultado.toLowerCase()}" title="${ACTION[ev.accion] || ev.accion}"><b>${ev.resultado}</b><span>#${ev.pieza}</span></li>`)
      .join("");

    $("cell-updated").textContent = `Dato de celda: ${data.updated_at.slice(11, 19)} UTC`;
    paintAlarms(data.alarms);
  }

  async function pull() {
    const res = await fetch("/line/cell/status");
    if (!res.ok) throw new Error(String(res.status));
    paint(await res.json());
  }

  function fail(err) {
    errEl.hidden = false;
    errEl.textContent = ` · Sin datos de la celda (${err.message})`;
    readout.dataset.state = "SIN_DATOS";
    $("cell-state").textContent = "SIN DATOS";
  }

  function ask(on) {
    pendingOn = on;
    $("confirm-text").textContent = on
      ? "¿Arrancar el ciclo de la celda?"
      : "¿Parar el ciclo? Esto no es el paro de emergencia.";
    $("confirm").showModal();
  }

  async function setRun(on) {
    const res = await fetch("/line/cell/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ on }),
    });
    if (res.status === 401) {
      role = null;
      $("hmi-lock").hidden = false;
      throw new Error("sesión cerrada");
    }
    if (!res.ok) throw new Error(String(res.status));
    paint(await res.json());
  }

  $("proc-start").addEventListener("click", () => ask(true));
  $("proc-stop").addEventListener("click", () => ask(false));
  $("confirm-no").addEventListener("click", () => $("confirm").close());
  $("confirm-yes").addEventListener("click", () => {
    const on = pendingOn;
    $("confirm").close();
    if (on === null) return;
    setRun(on).catch(fail);
  });

  $("alarm-ack").addEventListener("click", () => {
    fetch("/line/cell/alarms/ack", { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((body) => paintAlarms(body.alarms))
      .catch(fail);
  });

  $("alarm-clear").addEventListener("click", () => {
    fetch("/line/cell/alarms/clear", { method: "POST" })
      .then((res) => {
        if (res.status === 403) throw new Error("solo ingeniería");
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((body) => paintAlarms(body.alarms))
      .catch(fail);
  });

  $("hmi-login").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    fetch("/line/cell/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: data.get("user"), password: data.get("password") }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("cuenta rechazada");
        return res.json();
      })
      .then((who) => enter(who))
      .catch((err) => {
        $("hmi-login-error").textContent = err.message;
      });
  });

  $("hmi-logout").addEventListener("click", () => {
    fetch("/line/cell/session", { method: "DELETE" }).finally(() => {
      role = null;
      $("hmi-who").textContent = "";
      $("hmi-logout").hidden = true;
      $("alarm-clear").hidden = true;
      $("hmi-lock").hidden = false;
    });
  });

  function enter(who) {
    role = who.role;
    $("hmi-who").textContent = `${who.user} · ${who.role}`;
    $("hmi-logout").hidden = false;
    $("alarm-clear").hidden = who.role !== "admin";
    $("hmi-lock").hidden = true;
    $("hmi-login-error").textContent = "";
  }

  fetch("/line/cell/session")
    .then((res) => (res.ok ? res.json() : null))
    .then((who) => {
      if (who) enter(who);
    })
    .catch(() => {});

  const img = $("line-vision-stream");
  const camLive = () => $("line-vision-station-status").classList.contains("module-status--active");

  $("cam-grid").addEventListener("click", (e) => {
    const on = e.currentTarget.getAttribute("aria-pressed") !== "true";
    e.currentTarget.setAttribute("aria-pressed", String(on));
    $("grid-overlay").hidden = !on;
  });

  $("cam-snap").addEventListener("click", () => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    const stamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "_");
    c.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `celda01_cam01_${stamp}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
      $("cam-last-snap").textContent = now();
    }, "image/png");
  });

  function tick() {
    $("hmi-clock").textContent = now();
    $("state-time").textContent = lastState ? mmss(Date.now() - stateSince) : "";
    const live = camLive();
    if (live && !camSince) camSince = Date.now();
    if (!live) camSince = 0;
    $("cam-snap").disabled = !live;
    $("cam-res").textContent = live && img.naturalWidth ? `${img.naturalWidth} × ${img.naturalHeight}` : "—";
    $("cam-uptime").textContent = live ? mmss(Date.now() - camSince) : "—";
  }

  tick();
  pull().catch(fail);
  timer = window.setInterval(() => {
    tick();
    pull().catch(fail);
  }, 1000);
  window.addEventListener("pagehide", () => clearInterval(timer));
})();
