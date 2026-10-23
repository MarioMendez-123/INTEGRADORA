/**
 * Carga cámara y visión de línea solo en laboratorio.
 * En el dominio público estos archivos no se piden.
 */
(function () {
  if (window.AETHER_PUBLIC) return;
  ["/stream-errors.js", "/camera-stream.js?v=2", "/line-vision.js?v=2"].forEach((src) => {
    const script = document.createElement("script");
    script.src = src;
    document.body.appendChild(script);
  });
})();
