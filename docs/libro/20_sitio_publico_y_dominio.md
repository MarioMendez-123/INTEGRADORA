# Capítulo 20: El sitio público, el dominio y Cloudflare

*Cómo se publica Aether en internet sin abrirle la puerta del laboratorio: un sitio estático, un dominio, un escudo intermedio y una lista de pasos manuales que sigue pendiente.*

## Un sitio que responde 404 a propósito

Al revisar el dominio público con `curl`, las rutas `/.env`, `/.git/config`, `/perception/stream`, `/line/cell/run`, `/robot/ask` y `/inventory` respondieron todas **404 de GitHub Pages**. No es una falla: **es la prueba de que el backend no está en ese dominio**. El sitio público de Aether es solo **HTML estático**; el servidor, las cámaras y la celda se quedan en la red del laboratorio. Este capítulo cuenta cómo se logra eso y qué falta para endurecerlo.

## Qué es el sitio público y dónde vive

Un **sitio estático** es un conjunto de archivos (HTML, CSS, JavaScript, imágenes) que se entregan tal cual, sin programa que "piense" en el servidor. Aether publica el suyo en **GitHub Pages** (el servicio gratuito de GitHub para sitios estáticos), desde la rama `gh-pages`, bajo el dominio **`aethermx.online`**. Un **dominio** es el nombre legible de la dirección; su configuración (los **registros DNS**) dice a qué IP apunta. Según el runbook de seguridad del 16 de octubre de 2026:

| Concepto | Valor |
|---|---|
| Sitio | HTML estático en GitHub Pages, rama `gh-pages` |
| Registros A del dominio raíz | Cuatro, hacia las direcciones públicas de GitHub Pages |
| `www` | Un CNAME (alias) hacia la cuenta de GitHub Pages |
| Servidores de nombres hoy | Los de Hostinger (el registrador) |
| Correo | **ImprovMX**, un servicio de reenvío de correo del dominio |
| Contacto de seguridad | Publicado en `/.well-known/security.txt` (un estándar para decir a quién reportar vulnerabilidades) |

El `robots.txt` pide a los buscadores **no indexar** las pantallas del laboratorio (`celda.html`, `dataset.html`, `inventory.html`, `robot.html`, `holo.html`): "en el dominio público no están publicadas".

## Lo que se hizo en el repositorio (16 y 17 de octubre)

La rama `feature/hardening-cloudflare` y los commits del 16 de octubre hicieron lo siguiente, **VERIFICADO** en el historial:

- Se **quitó la cámara en vivo** del dominio público y la solicitud de demo quedó como un **correo** (el botón abre Gmail, en lugar de un enlace `mailto`).
- Se **cerraron cámara, pistón y banda** a las peticiones que no vengan del laboratorio (el guardia `public_guard.py`, capítulo 11).
- Se **alineó la política de seguridad del servidor `nginx`** (`deploy/nginx-aether.conf`, un servidor web alternativo no desplegado) con el encabezado que irá en Cloudflare.
- Se limpió la `<meta>` de la política de contenido: se quitó `frame-ancestors` (el navegador lo **ignora** dentro de una `<meta>`) y `connect-src` hacia Google Fonts (las fuentes entran por otras directivas).
- Ajustes del sitio: en iPhone no se carga el título animado, la línea de manufactura queda en tarjetas, y una **simulación de funcionamiento a 2x** debajo de la portada.
- Se agregó la sección **Alianzas** y se escribieron `docs/security/runbook-cloudflare.md` y `docs/security/laboratorio.md`.

## Por qué la política del encabezado no es la de la `<meta>`

Un detalle fino del runbook: la `<meta>` de `index.html` solo aplica a la portada, pero **el encabezado HTTP aplica a todas las páginas**, incluida `armado.html`, que lleva un módulo 3D enorme **en línea** y un *import map* (un mapa de módulos de JavaScript que no puede ir en archivo externo) y carga Three.js desde jsDelivr. Para que el carrito 3D no se quede en blanco, el encabezado necesita `'unsafe-inline'` en `script-src` y `style-src` y permitir `https://cdn.jsdelivr.net`. **No** necesita `'unsafe-eval'`. Es un **riesgo declarado**: `'unsafe-inline'` es una directiva amplia, y una falla de inyección de scripts dentro de `armado.html` no la frenaría la política. La `<meta>` de la portada queda más estricta (`script-src 'self'`), y el navegador aplica **ambas** a la vez.

## Cloudflare: un escudo entre internet y el sitio

**Cloudflare** es un servicio que se coloca **entre los visitantes y el sitio**: recibe cada petición, la filtra y la reenvía. Con su plan gratuito se puede añadir **cifrado HTTPS estricto**, **encabezados de seguridad**, **filtros de bots** y **límites de peticiones**. Para usarlo hay que **cambiar los servidores de nombres** del dominio (de los de Hostinger a los de Cloudflare). El runbook, escrito para el plan gratuito, ordena los pasos así:

1. **Copiar el DNS dentro de Cloudflare** sin cambiar nada todavía.
2. **Bajar el TTL** (el tiempo que los DNS recuerdan una respuesta) y **cambiar los servidores de nombres** en Hostinger.
3. **HTTPS:** modo **Full (strict)** (nunca Flexible, que provoca un bucle de redirecciones), "Always Use HTTPS", TLS mínimo 1.2 y **HSTS** a 6 meses con subdominios y **sin preload**.
4. **Encabezados HTTP**, primero en **modo reporte** (la consola avisa, no bloquea) y después en modo **forzado**: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin` y `X-Frame-Options: SAMEORIGIN`.
5. **Bot Fight Mode**, **Browser Integrity Check**, la regla de límite de peticiones (en el plan gratuito, **un solo conteo de 10 segundos**) y una regla de WAF para rutas sensibles.
6. **Correo:** SPF (ya existía), DKIM (copiado del panel de ImprovMX, "no de memoria") y **DMARC** en vigilancia.

HSTS (*HTTP Strict Transport Security*) le dice al navegador que **solo use HTTPS** con ese dominio durante el tiempo indicado; una vez enviado, **no se puede deshacer** en navegadores que ya lo guardaron, por eso se eligen seis meses y no se activa el *preload*.

## Estado: manual y pendiente

El reporte del 16 de octubre es explícito: **no hay token de Cloudflare en el entorno y no se pidió por el chat.** Los pasos del panel **no están ejecutados**: **PENDIENTE (P-29)** (alta del dominio, cambio de servidores de nombres, SSL Full strict, HSTS, reglas de encabezados, Bot Fight, límite de peticiones, DMARC y DKIM). Hoy, `curl -I https://aethermx.online` responde `Server: GitHub.com` **sin** HSTS, CSP, `nosniff`, `Referrer-Policy` ni `Permissions-Policy` (**VERIFICADO** antes del cambio). Hasta que se cambien los servidores de nombres, el dominio sigue sin esos encabezados. Las comprobaciones finales (securityheaders.com, SSL Labs, un `iframe` desde otro origen, mail-tester) **no pueden cerrarse hasta entonces**.

### Riesgos que se quedan, con nombre

- El certificado de GitHub podría no renovarse con la "nube naranja" (el proxy de Cloudflare) activa: cada ~90 días hay que poner la nube en gris un rato.
- **Bot Fight Mode** puede mostrar un reto a un visitante legítimo; el runbook sugiere apagarlo si un inversionista ve la página de Cloudflare en vez de la portada.
- El límite de peticiones gratuito es una ráfaga de 10 segundos, no "60 por minuto"; un atacante paciente podría quedarse por debajo.
- SPF con `~all` marca falsificaciones como sospechosas, no las rechaza; el rechazo llega al pasar DMARC a `p=reject` con DKIM firmando.
- **Quien tenga el puerto 8000 reenviado en el router salta todo esto**: por eso existe la lista de `docs/security/laboratorio.md` (capítulo 21).

## Cómo se hace en una empresa

Una empresa pondría un **CDN** (red de distribución de contenido) con WAF, certificados administrados y monitoreo, y separaría el sitio público de las herramientas internas con **acceso por identidad** (como un VPN o Cloudflare Access) en lugar de "ocultar" páginas con `robots.txt`. Aether adopta el mismo principio de **mínimo expuesto**: lo público es estático y lo operativo solo vive en la red local; si algún día la celda se mostrara en vivo, el documento del laboratorio propone **Cloudflare Tunnel con Access** o **Tailscale**, ambas sin abrir puertos del router.

## Preguntas de repaso: lo público

1. ¿Por qué un 404 de GitHub Pages en `/inventory` es una buena señal?
2. ¿Qué diferencia hay entre una política de contenido en `<meta>` y en el encabezado?
3. ¿Por qué el encabezado necesita `'unsafe-inline'` y cuál es el riesgo?
4. ¿Qué es HSTS y por qué se evita el *preload*?
5. ¿Qué pasos del runbook siguen sin ejecutarse y por qué no se pueden cerrar las pruebas?
6. ¿Qué dos formas de mostrar la celda en vivo propone el equipo sin abrir puertos?
