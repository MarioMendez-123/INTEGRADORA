# Reporte: endurecer aethermx.online sin cambiar de hosting

Fecha: 16 de octubre de 2026. Rama: `feature/hardening-cloudflare`.

## Aplicado en el repo

- `dashboard/index.html`: la meta CSP ya no lleva `frame-ancestors` ni `connect-src` hacia Google Fonts. Esas dos cosas no protegían. `frame-ancestors` dentro de una meta el navegador lo ignora. Las fuentes entran por `style-src` y `font-src`, no por `connect-src`. La meta sigue como respaldo de la portada, con `script-src 'self'`.
- `dashboard/.well-known/security.txt`: el contacto sigue siendo `mario@aethermx.online`.
- `deploy/nginx-aether.conf`: la CSP de respaldo coincide con el encabezado de Cloudflare, incluido `'unsafe-inline'` en scripts porque `armado.html` lo necesita. HSTS de ese archivo queda en 6 meses, sin preload. Este nginx no está puesto delante del dominio.
- `docs/security/runbook-cloudflare.md`: pasos de panel, textos para pegar y la reversa.
- `docs/security/laboratorio.md`: lista del router, el firewall y las dos formas de mostrar la celda sin abrir puertos.

## Pendiente (manual, en ese orden)

1. Alta de `aethermx.online` en Cloudflare Free, copiar A, CNAME, MX y el SPF, y cambiar los nameservers en Hostinger.
2. SSL **Full (strict)**, Always Use HTTPS, TLS 1.2, HSTS 6 meses con subdominios, preload apagado.
3. GitHub Pages: Enforce HTTPS sigue activado. No quitar el dominio personalizado.
4. Transform Rule de reporte, mirar la consola, luego la regla de enforce con los encabezados del runbook.
5. Bot Fight Mode, Browser Integrity Check, la regla de 50 peticiones / 10 segundos, y la regla WAF de rutas sensibles.
6. TXT `_dmarc` en vigilancia. DKIM: copiar del panel de ImprovMX, no de memoria. `contacto@` solo si vas a leer ese alias.
7. La lista de `docs/security/laboratorio.md` en el router y en la PC.

No hay token de Cloudflare en el entorno. No se pidió por el chat.

## Pruebas hechas antes de Cloudflare

`curl -I https://aethermx.online` responde `Server: GitHub.com` y no manda HSTS, CSP, `nosniff`, `Referrer-Policy` ni `Permissions-Policy`. Eso es lo esperado hasta que la Transform Rule exista.

Estas rutas responden 404 de GitHub, no del API: `/.env`, `/.git/config`, `/perception/stream`, `/line/cell/run`, `/robot/ask`, `/inventory`.

securityheaders.com, SSL Labs, el iframe desde otro origen, mail-tester y la consola con la CSP nueva no se pueden cerrar hasta que pulses Deploy en Cloudflare.

## Riesgos que se quedan

- Hasta que cambies los nameservers, el dominio sigue sin esos encabezados. La meta de la portada no sustituye a `frame-ancestors`.
- El certificado de GitHub puede no renovarse con la nube naranja. Hay que grisá la nube un rato cada vez que Pages avise, más o menos cada 90 días. Está en el runbook.
- HSTS, una vez enviado, no se puede "deshacer" en los navegadores que ya lo guardaron. Seis meses, sin preload.
- El rate limit gratuito es un tope de ráfaga de 10 segundos, no 60 por minuto. Un atacante paciente puede quedarse debajo de 50 cada 10 segundos.
- Bot Fight Mode a veces frena a un visitante con un reto. Si un inversionista ve la página de Cloudflare en vez de la portada, apaga Bot Fight y deja el resto.
- `'unsafe-inline'` en el encabezado es amplio para `armado.html`. En la portada la meta lo recorta para scripts. Un fallo de XSS dentro de `armado.html` no quedaría frenado por `script-src`.
- SPF con `~all` marca las falsificaciones como sospechosas, no las rechaza. El rechazo llega cuando pases DMARC a `p=reject` y DKIM ya esté firmando.
- El reenvío de ImprovMX no demuestra, por sí solo, que el alias `mario@` entregue. Eso se prueba enviando un correo y leyendo el buzón de destino.
- Quien tenga el puerto 8000 o el 1883 reenviado en el router salta todo esto. La lista del laboratorio es la comprobación.
