# Runbook manual: Cloudflare delante de GitHub Pages

Todo lo de este archivo lo haces tú en los paneles. No hay token de Cloudflare en el entorno, y no hace falta pegarlo en el chat. El plan es el gratuito.

No cambies el diseño del sitio. No abras el puerto del laboratorio. No pongas la IP de tu casa en un registro DNS.

## Qué hay hoy (16 oct 2026)

- Sitio: HTML estático en GitHub Pages, rama `gh-pages`, dominio `aethermx.online`.
- Apex: cuatro A hacia `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (IPs de GitHub Pages).
- `www`: CNAME a `mariomendez-123.github.io`.
- Nameservers: `athena.dns-parking.com` y `apollo.dns-parking.com` (Hostinger).
- Correo: MX `mx1.improvmx.com` (10) y `mx2.improvmx.com` (20). Proveedor: ImprovMX.
- SPF ya existe, un solo TXT: `v=spf1 include:spf.improvmx.com ~all`.
- No hay TXT en `_dmarc`. No hay CNAME DKIM en los selectores que consulté.
- El único iframe es el de la portada: `index.html` carga `/armado.html?embed=1&v=3`. Mismo origen (`https://aethermx.online`). Nadie de otro dominio embebe la página.
- Fuentes externas que el sitio sí pide:
  - `https://fonts.googleapis.com` y `https://fonts.gstatic.com` (CSS y archivos de fuente).
  - `https://cdn.jsdelivr.net` (Three.js, solo dentro de `armado.html`).
  - `https://mail.google.com` (el botón Agenda una demo abre esa URL; no es un script).
- `connect-src` real: la portada hace `fetch("/inventory")` al mismo origen. En GitHub Pages esa ruta responde 404. No hay API pública en otro host.
- `curl` de `/.env`, `/.git/config`, `/perception/stream`, `/line/cell/run`, `/robot/ask` y `/inventory` en el dominio: todos 404 de GitHub Pages. El backend no está en el dominio.

## Por qué la CSP del encabezado no es un copiar y pegar de la meta

La meta de `index.html` solo aplica a la portada. El encabezado HTTP aplica también a `armado.html`.

`armado.html` trae un `<script type="importmap">` y un módulo enorme en línea, y carga Three.js desde jsDelivr. Sin `'unsafe-inline'` y sin `https://cdn.jsdelivr.net` en `script-src`, el carrito 3D se queda en blanco. El import map no puede ir en un archivo externo.

`'unsafe-inline'` en `style-src` también hace falta: la portada usa `style="--i: 0"` (y 1, 2, 3, 4) para el escalonado de entrada, y `armado.html` tiene un bloque `<style>` y atributos `style` que el script inyecta. No hace falta `'unsafe-eval'`. No hay `eval` ni `new Function` en los scripts de la portada.

La meta de la portada se queda más estricta (`script-src 'self'`, sin `frame-ancestors`). El navegador aplica las dos a la vez en `index.html`: un script en línea en la portada sigue bloqueado. `frame-ancestors` se quitó de la meta porque ahí el navegador lo ignora.

## Límites del plan gratuito (docs de Cloudflare, agosto 2026)

- Reglas de rate limiting: 1. Periodo de conteo: solo 10 segundos. Bloqueo: solo 10 segundos. Cuenta por IP. El filtro solo puede usar ruta y "verified bot".
- Reglas WAF personalizadas: 5. Sin expresiones regulares.
- Una sola Transform Rule puede poner todos los encabezados. Con una basta.
- Bot Fight Mode y Browser Integrity Check están en el plan gratuito.

60 peticiones por minuto no se puede configurar. Lo más cercano que no tumba la portada está en la tarea 3: la portada pide unos 15 archivos propios de un golpe, así que 10 peticiones cada 10 segundos bloquearía a un visitante normal.

## Orden

Haz los pasos en este orden. El proxy naranja se enciende al final del alta, pero el modo SSL tiene que ser Full (strict) antes de dar por cerrada la zona. Flexible provoca un bucle: Cloudflare habla HTTP con GitHub y GitHub devuelve el visitante a HTTPS.

### 1. Copiar el DNS dentro de Cloudflare, sin cambiar nameservers todavía

1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com).
2. Pulsa **Add a domain** (o **Add site**).
3. Escribe `aethermx.online`. Pulsa **Continue**.
4. Elige el plan **Free**. Pulsa **Continue**.
5. En la lista de registros que Cloudflare encontró, deja estos y no borres ningún MX ni TXT:

| Tipo | Nombre | Valor | Proxy |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | Proxied (nube naranja) |
| A | `@` | `185.199.109.153` | Proxied |
| A | `@` | `185.199.110.153` | Proxied |
| A | `@` | `185.199.111.153` | Proxied |
| CNAME | `www` | `mariomendez-123.github.io` | Proxied |
| MX | `@` | `mx1.improvmx.com` prioridad 10 | DNS only (nube gris; el MX no se proxifica) |
| MX | `@` | `mx2.improvmx.com` prioridad 20 | DNS only |
| TXT | `@` | `v=spf1 include:spf.improvmx.com ~all` | DNS only |

6. Si el escaneo no trajo los MX o el TXT, pulsa **Add record** y créalos a mano con esa tabla. Un segundo TXT que empiece por `v=spf1` rompe el correo: tiene que haber uno solo.
7. Pulsa **Continue**. Cloudflare te muestra dos nameservers nuevos. Cópiarlos. No los pongas en Hostinger todavía.

Para no quedarte a ciegas si hay que volver atrás: en Hostinger anota los registros actuales (esta tabla ya los tiene) antes de tocar nada.

### 2. Bajar el TTL y cambiar los nameservers

1. En hPanel de Hostinger: **Dominios** → `aethermx.online` → **DNS / Nameservers**.
2. Si puedes editar el TTL de los A, del CNAME `www`, de los MX y del TXT, ponlo en 300. Espera media hora. Si el panel no deja, sigue: mientras los nameservers viejos respondan, el sitio sigue en GitHub.
3. En la misma pantalla, cambia los nameservers. Quita `athena.dns-parking.com` y `apollo.dns-parking.com`. Pega los dos que te dio Cloudflare. Guarda.
4. Vuelve a Cloudflare y pulsa **Check nameservers** (a veces dice **Done, check nameservers**). La zona pasa a **Active** cuando el registro propaga. Puede tardar desde unos minutos hasta 24 horas. Durante ese rato unos resolvers usan Hostinger y otros Cloudflare; los dos tienen los mismos A, MX y SPF, así que la página y el correo siguen.
5. En cuanto la zona diga **Active**, entra a **SSL/TLS** → **Overview** y elige **Full (strict)**. No elijas **Flexible** ni **Full**.

### 3. HTTPS, HSTS y TLS 1.2

En Cloudflare, zona `aethermx.online`:

1. **SSL/TLS** → **Edge Certificates**.
2. **Always Use HTTPS**: On.
3. **Minimum TLS Version**: **TLS 1.2**.
4. **HSTS**: **Enable HSTS**.
   - Max age: **6 months** (`15552000`). Doce meses también vale; seis se olvida antes si hay que dar marcha atrás.
   - **Include subdomains**: On.
   - **Preload**: Off. No lo actives hasta que lo confirmes. Preload mete el dominio en una lista de los navegadores y quitarlo lleva meses.
   - **No-Sniff**: puedes dejarlo On aquí; la Transform Rule lo repite.
5. Guarda.

En GitHub:

1. Repositorio `MarioMendez-123/INTEGRADORA` → **Settings** → **Pages**.
2. Custom domain: `aethermx.online`. **Enforce HTTPS**: activado.

Conflicto real entre el certificado de GitHub y el proxy: GitHub solo renueva el certificado de Let's Encrypt si el DNS del dominio apunta a sus IPs. Con la nube naranja, el DNS apunta a Cloudflare. Full (strict) funciona mientras el certificado de GitHub siga vigente (unos 90 días desde la última emisión). Cuando GitHub no pueda renovarlo, Cloudflare deja de conectar con el origen y el sitio cae.

Qué hacer ese día, sin quitar Cloudflare:

1. **DNS** → **Records**. Pon los cuatro A y el CNAME `www` en **DNS only** (nube gris).
2. Espera a que en GitHub Pages el dominio vuelva a tener el check de HTTPS.
3. Vuelve a poner la nube naranja.
4. Revisa esa pantalla de GitHub cada 60 días para no enterarte cuando ya caducó.

No quites el dominio personalizado de GitHub para "arreglar" el aviso de DNS. Si lo quitas, GitHub suelta el certificado y Full (strict) se rompe en ese momento.

### 4. Encabezados HTTP

Primero en modo reporte. Así la consola avisa y no bloquea.

1. **Rules** → **Transform Rules** → **Modify Response Header** → **Create rule**.
2. Rule name: `aether-csp-reporte`.
3. Si el filtro dice **All incoming requests**, déjalo. Si pide una condición, **Custom filter expression** y pega: `(http.host eq "aethermx.online") or (http.host eq "www.aethermx.online")`.
4. **Modify response header** → **Set static**.
   - Header name: `Content-Security-Policy-Report-Only`
   - Value, una sola línea:

```
default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'none'
```

5. **Deploy**.
6. Abre `https://aethermx.online` en una ventana de incógnito. Recarga con Ctrl+F5. F12 → **Console**. Filtra por `CSP`. Baja hasta el carrito y espera a que cargue el iframe. Pulsa **Agenda una demo** y comprueba que abre Gmail.
7. Si la consola habla de un `blob:` de worker, edita el valor y añade `blob:` al `script-src`. Si habla de otra fuente, anótala antes de pasar a enforce. No añadas `'unsafe-eval'`.

Cuando la consola esté limpia, crea la regla de enforce. Puedes borrar la de reporte o dejarla; no estorba.

1. **Create rule** otra vez.
2. Rule name: `aether-encabezados`.
3. Mismo filtro que arriba.
4. Añade una fila **Set static** por encabezado:

| Header name | Value |
| --- | --- |
| `Content-Security-Policy` | el mismo valor de arriba |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `X-Frame-Options` | `SAMEORIGIN` |

`X-Frame-Options` va en la misma regla (no gasta una regla extra) para navegadores que no miran `frame-ancestors`.

`Cross-Origin-Opener-Policy: same-origin` aísla la pestaña. El iframe de `armado.html` es el mismo origen, y el botón de Gmail ya lleva `target="_blank"` y `rel="noopener"`. Si el carrito se queda en blanco o Gmail no abre, entra a la regla, borra solo esa fila y **Deploy**. El resto se queda.

### 5. Bot Fight, integridad del navegador, rate limit y WAF

1. **Security** → **Settings**.
2. **Bot Fight Mode**: On.
3. **Browser Integrity Check**: On.

Rate limit. En el panel nuevo: **Security** → **Security rules** → **Create rule** → **Rate limiting rules**. Si ves el panel viejo: **Security** → **WAF** → **Rate limiting rules** → **Create rule**.

- Rule name: `aether-limite-por-ip`
- Match: **All incoming requests**. Si el plan gratuito obliga a poner una ruta, usa **URI Path** **contains** `/`.
- Characteristic: **IP**.
- Period: **10 seconds**. Es el único valor del plan gratuito.
- Requests: **50**.
- Action: **Block**.
- Duration: **10 seconds**.
- **Deploy**.

Diferencia contra "60 por minuto": el gratis no tiene ventana de 60 segundos ni un bloqueo largo. 50 cada 10 segundos deja pasar la portada (unos 15 archivos) y un par de recargas. Un script puede hacer hasta unos 300 por minuto si se queda justo debajo del tope, y el castigo dura 10 segundos, no un minuto. Para 60 por minuto haría falta el plan Pro, que sí permite periodo de 60 segundos.

WAF. **Security** → **WAF** → **Custom rules** → **Create rule** (en el panel nuevo está bajo **Security rules**).

- Rule name: `aether-rutas-sensibles`
- **Edit expression** y pega:

```
(http.request.uri.path contains "/.env") or (http.request.uri.path contains "/.git") or (http.request.uri.path contains "/.svn") or (http.request.uri.path contains "/.hg") or (http.request.uri.path contains "/backup") or (http.request.uri.path contains "/wp-admin") or (http.request.uri.path contains "/wp-login") or (ends_with(http.request.uri.path, ".sql")) or (ends_with(http.request.uri.path, ".bak")) or (ends_with(http.request.uri.path, ".sqlite")) or (ends_with(http.request.uri.path, ".db")) or (http.request.uri.path eq "/perception") or (starts_with(http.request.uri.path, "/perception/")) or (http.request.uri.path eq "/line") or (starts_with(http.request.uri.path, "/line/")) or (http.request.uri.path eq "/robot") or (starts_with(http.request.uri.path, "/robot/")) or (http.request.uri.path eq "/dataset") or (starts_with(http.request.uri.path, "/dataset/")) or (http.request.uri.path eq "/spotify") or (starts_with(http.request.uri.path, "/spotify/")) or (http.request.uri.path eq "/show") or (starts_with(http.request.uri.path, "/show/"))
```

No uses `contains "/robot"`: eso también bloquearía `/robot-model.js`, que es un script de la portada.

- Action: **Block**.
- **Deploy**.

La respuesta de Cloudflare es una página de bloqueo (403), no el 404 de GitHub.

El plan gratuito no tiene regex. Por eso la expresión va con `contains`, `eq`, `starts_with` y `ends_with`. Cabe en una de las 5 reglas.

### 6. Correo: SPF, DKIM, DMARC

Hazlo cuando la zona de Cloudflare ya esté **Active**, en **DNS** → **Records**. Nube gris en todos.

SPF. Ya está y está bien. No crees otro.

| Tipo | Nombre | Valor |
| --- | --- | --- |
| TXT | `@` | `v=spf1 include:spf.improvmx.com ~all` |

DKIM. No hay un valor publicado en el DNS hoy, y la guía de ImprovMX dice que los CNAME aparecen en el panel después de crear una credencial SMTP. Procedimiento, sin inventar una clave:

1. Entra a [app.improvmx.com](https://app.improvmx.com) → dominio `aethermx.online`.
2. Si vas a enviar (no solo reenviar), crea la credencial SMTP que pide su guía [Adding DKIM Records](https://improvmx.com/guides/adding-dkim-records/).
3. **Domain Settings** → **DNS Settings**. Baja hasta los dos CNAME de DKIM.
4. Cópialos tal cual al DNS de Cloudflare, tipo CNAME, proxy **DNS only**.
5. La misma guía pone este ejemplo. Úsalo solo si el panel muestra exactamente eso. Si muestra otro target, manda el del panel:

| Tipo | Nombre | Target |
| --- | --- | --- |
| CNAME | `dkimprovmx1._domainkey` | `dkimprovmx1.improvmx.com` |
| CNAME | `dkimprovmx2._domainkey` | `dkimprovmx2.improvmx.com` |

En Cloudflare el nombre se escribe sin el dominio al final. No actives la nube naranja: un CNAME proxificado no valida DKIM.

DMARC. Hoy no existe. Créalo así, en vigilancia:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:mario@aethermx.online; fo=1; adkim=r; aspf=r` |

`p=none` no frena a nadie. Solo pide reportes al buzón de Mario. Siguiente paso, lo haces tú cuando los reportes salgan limpios (solo ImprovMX, sin fallos de SPF o DKIM):

| Cuándo | Cambio |
| --- | --- |
| Día 0 | `p=none`, como arriba |
| Semana 2 a 4, reportes limpios | `p=quarantine; pct=25` y el mismo `rua` |
| Dos semanas después, siguen limpios | quita `pct` (`p=quarantine`) |
| Dos semanas después | `p=reject` |

No pases a `reject` si DKIM todavía no está en el DNS: el rechazo tiraría el correo legítimo.

`contacto@aethermx.online`: en ImprovMX, **Aliases** → **Add alias** → `contacto`, y reenvíalo al mismo destino que ya usa `mario@`. No hace falta otro SPF, DKIM ni DMARC. Esos registros son del dominio, no de cada alias. No crees el alias si no lo vas a leer.

Comprobación, manual:

1. [mxtoolbox.com/SuperTool.aspx](https://mxtoolbox.com/SuperTool.aspx): `mx:aethermx.online`, `spf:aethermx.online`, `dmarc:aethermx.online`. DKIM cuando exista: `dkim:aethermx.online:dkimprovmx1`.
2. [mail-tester.com](https://www.mail-tester.com): envía un correo desde `mario@aethermx.online` a la dirección que te muestran. DKIM solo puede salir en verde si ya envías por el SMTP de ImprovMX y los CNAME están puestos. El reenvío de entrada no firma DKIM de salida.

## Reversa

| Cambio | Cómo volver atrás |
| --- | --- |
| Nameservers | En Hostinger vuelve a poner `athena.dns-parking.com` y `apollo.dns-parking.com`. Antes, recrea ahí los A, el CNAME `www`, los MX y el TXT de SPF de la tabla del paso 1. |
| HSTS | En **Edge Certificates** desactiva HSTS. Quien ya recibió el encabezado sigue forzando HTTPS hasta 6 meses. Por eso el preload se queda apagado. |
| Encabezados | **Rules** → la regla → **Delete**. La meta del HTML sigue como red de respaldo en la portada. |
| Rate limit o WAF | **Delete** en esa regla. El sitio vuelve a responder 404 de GitHub en esas rutas. |
| Bot Fight / Browser Integrity | **Security** → **Settings** → Off. |
| DMARC | Borra el TXT `_dmarc`, o déjalo en `p=none`. |
| DKIM | Borra los dos CNAME si ImprovMX deja de usarlos. No borres el SPF. |

## Pruebas después de pulsar Deploy

```
curl -I https://aethermx.online
```

Tiene que listar `strict-transport-security`, `content-security-policy`, `x-content-type-options: nosniff`, `referrer-policy` y `permissions-policy`. Hoy, antes de Cloudflare, `curl -I` no trae ninguno de esos.

- [securityheaders.com](https://securityheaders.com/?q=https%3A%2F%2Faethermx.online) y [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/analyze.html?d=aethermx.online) después de HSTS y de los encabezados. La nota A depende de que HSTS ya se esté enviando.
- Iframe ajeno: guarda un HTML en tu PC con `<iframe src="https://aethermx.online/"></iframe>`, ábrelo, y la consola debe decir que `frame-ancestors` lo rechazó. El iframe de la propia portada (`/armado.html?embed=1&v=3`) tiene que seguir viéndose.
- `curl -I https://aethermx.online/.env` y `curl -I https://aethermx.online/.git/config` deben decir bloqueo de Cloudflare (403), no el 404 de GitHub.
- Portada en el teléfono y en el escritorio, consola sin errores de CSP, carrito completo, botón de Gmail abre el borrador.
