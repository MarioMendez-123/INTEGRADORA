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
 * Correo de contacto de Alianzas. Cámbialo aquí.
 * El botón abre Gmail en el navegador, con el mensaje ya dirigido a Mario.
 * No usa mailto: Windows muestra un cuadro para elegir app y no llega a Gmail.
 * No reserva un horario: Mario recibe el mensaje cuando la persona lo envía.
 */
(function () {
  const CONTACT = "mario@aethermx.online";
  const PUBLIC_HOSTS = { "aethermx.online": 1, "www.aethermx.online": 1 };
  const host = (location.hostname || "").toLowerCase();
  let isPublic = !!PUBLIC_HOSTS[host];
  const preview = new URLSearchParams(location.search).get("public");
  if (preview === "1") isPublic = true;

  window.AETHER_PUBLIC = isPublic;
  window.AETHER_CONTACT = CONTACT;
  document.documentElement.classList.toggle("is-public", isPublic);

  function gmailCompose() {
    return (
      "https://mail.google.com/mail/?view=cm&fs=1&to=" +
      encodeURIComponent(CONTACT) +
      "&su=" +
      encodeURIComponent("Demo de Aether")
    );
  }

  function applyContact() {
    document.querySelectorAll("[data-contact]").forEach((el) => {
      el.href = gmailCompose();
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    });
  }

  function stripLive() {
    if (!isPublic) return;
    document.querySelectorAll(".live-only").forEach((el) => el.remove());
    document.querySelectorAll('a[href="#percepcion"]').forEach((el) => {
      el.setAttribute("href", "#alianzas");
    });
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
