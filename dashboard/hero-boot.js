/**
 * El wordmark animado vive en web-scenes.js: un reproductor Remotion
 * de unos 500 KB que dibuja el título con un desenfoque SVG.
 * En el motor WebKit del iPhone (Safari, y también el navegador de
 * WhatsApp) ese filtro cierra el proceso. La página reintenta y muestra
 * "Ocurrió un problema varias veces".
 * Ahí no se carga el reproductor. El h1 "AETHER" ya está en el HTML
 * y es el título que se ve.
 */
(function () {
  var ua = navigator.userAgent || "";
  var ios =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) return;

  var script = document.createElement("script");
  script.src = "/web-scenes.js";
  script.defer = true;
  document.body.appendChild(script);
})();
