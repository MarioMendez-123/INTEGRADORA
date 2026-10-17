/**
 * Modo público vs laboratorio.
 *
 * Público si el host es aethermx.online o www.aethermx.online.
 * Cualquier otro host (localhost, 127.0.0.1, IP de la red local, otro
 * nombre) es laboratorio: la cámara y la visión de línea se cargan igual
 * que antes.
 *
 * Forzar desde el servidor: AETHER_PUBLIC_MODE=public|local en el proceso
 * de FastAPI (backend/public_guard.py). Este archivo no puede leer esa
 * variable. Para previsualizar el modo público en local, abre ?public=1.
 * Esa query no puede apagar el modo público en el dominio real.
 *
 * Correo de contacto (mailto de Alianzas). Cámbialo aquí.
 * TODO: confirmar que el buzón contacto@aethermx.online existe y reenvía.
 */
(function () {
  const CONTACT = "contacto@aethermx.online";
  const PUBLIC_HOSTS = { "aethermx.online": 1, "www.aethermx.online": 1 };
  const host = (location.hostname || "").toLowerCase();
  let isPublic = !!PUBLIC_HOSTS[host];
  const preview = new URLSearchParams(location.search).get("public");
  if (preview === "1") isPublic = true;

  window.AETHER_PUBLIC = isPublic;
  window.AETHER_CONTACT = CONTACT;
  document.documentElement.classList.toggle("is-public", isPublic);

  function applyContact() {
    const mailto = "mailto:" + CONTACT;
    document.querySelectorAll("[data-contact]").forEach((el) => {
      el.href = mailto;
    });
  }

  function stripLive() {
    if (!isPublic) return;
    document.querySelectorAll(".live-only").forEach((el) => el.remove());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      applyContact();
      stripLive();
    });
  } else {
    applyContact();
    stripLive();
  }
})();
