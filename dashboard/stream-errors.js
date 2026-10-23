/**
 * Explica por qué NO se ve un video: el navegador lo BLOQUEÓ (política de seguridad de la página, CSP) o la
 * cámara / el agente no responde.
 *
 * Un <img> que no carga dispara solo "error", igual en los dos casos, y por eso el mensaje viejo ("verifica que
 * backend/main.py esté corriendo y que la cámara esté disponible") confundía cuando el problema era la CSP. La
 * diferencia está en el evento "securitypolicyviolation", que el navegador manda ANTES del "error". Este archivo
 * lo escucha y deja dos funciones para camera-stream.js, line-vision.js y robot.js:
 *
 *   AetherStreamErrors.isBlocked(url)          true si el navegador bloqueó ESE origen hace poco
 *   AetherStreamErrors.message(url, textoLocal) el texto que se debe mostrar para ese video
 *
 * Se carga en index.html (por site-boot.js), celda.html y robot.html. Los otros scripts lo usan solo al fallar,
 * así que el orden de carga no importa; si falta, usan su texto de siempre.
 */
(() => {
  const VIGENCIA_MS = 15000; // un bloqueo viejo no debe explicar un fallo nuevo
  let bloqueado = null; // { origen, cuando }

  function origenDe(url) {
    try {
      return new URL(url, location.href).origin;
    } catch {
      return null;
    }
  }

  document.addEventListener("securitypolicyviolation", (event) => {
    if (!String(event.violatedDirective || "").startsWith("img-src")) return;
    bloqueado = { origen: origenDe(event.blockedURI), cuando: Date.now() };
  });

  function isBlocked(url) {
    const origen = origenDe(url);
    return !!bloqueado && !!origen && bloqueado.origen === origen && Date.now() - bloqueado.cuando < VIGENCIA_MS;
  }

  function message(url, textoLocal) {
    const origen = origenDe(url);
    if (isBlocked(url)) {
      return (
        `Bloqueado por la política de seguridad (CSP) de esta página, NO por la cámara: el navegador no permitió ` +
        `cargar el video de ${origen}. Reinicia el servidor de la laptop con AETHER_PERCEPTION_AGENT_URL ` +
        `(cámara de percepción) o AETHER_LINE_AGENT_URL (cámara de la línea) apuntando a ese agente, y recarga ` +
        `esta página.`
      );
    }
    if (origen && origen !== location.origin) {
      return (
        `No se pudo cargar el video de ${origen}: el agente no responde o su cámara no está disponible. ` +
        `Comprueba ${origen}/health (no es un bloqueo del navegador).`
      );
    }
    return textoLocal;
  }

  window.AetherStreamErrors = { isBlocked, message };
})();
