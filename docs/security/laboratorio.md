# El laboratorio no sale a internet

El dominio `aethermx.online` sirve GitHub Pages. El API (uvicorn) y el MQTT del carrito se quedan en la PC del laboratorio. Esta lista no se ha ejecutado en el router: revísala tú.

No abras puertos para "probar". No pongas la IP de casa en el DNS de Cloudflare.

## Lista

1. Router. Entra al panel (casi siempre `192.168.0.1` o `192.168.1.1`). Busca **Port forwarding**, **Virtual server** o **NAT**. No debe haber una regla hacia el puerto del API (8000), ni hacia MQTT (1883 y 8883), ni hacia el puerto de la cámara. Si hay una, bórrala.
2. UPnP. En el mismo panel, **UPnP** apagado. UPnP deja que un programa de la PC abra un puerto sin que lo pidas.
3. Firewall de Windows. **Seguridad de Windows** → **Firewall** → **Configuración avanzada** → **Reglas de entrada**. El permiso de Python o de uvicorn, si existe, tiene que ser **solo red privada**, no pública. No crees una regla de entrada para el puerto 8000 en el perfil público.
4. Dónde escucha el API. Al arrancar uvicorn, la salida tiene que decir `127.0.0.1:8000` si solo lo usas en esa PC. Si el celular del laboratorio tiene que entrar, `0.0.0.0` vale únicamente mientras el router no reenvíe ese puerto. Compruébalo con `netstat -ano | findstr :8000`. La columna de dirección local no debe ser una IP pública.
5. MQTT. El broker, si está corriendo, escucha en `127.0.0.1`. `netstat -ano | findstr :1883` y `findstr :8883` no deben mostrar `0.0.0.0`.
6. Desde el celular, con los datos móviles (Wi-Fi apagado), abre `http://<IP-pública-de-casa>:8000/health`. Tiene que fallar la conexión. La IP pública sale en el router o en una búsqueda de "mi ip"; no la pegues en el repo ni en un issue.
7. `AETHER_PUBLIC_MODE=local` solo en esa PC. No uses `local` en una máquina que sí tenga un puerto abierto.
8. `AETHER_TRUST_PROXY` se queda sin definir, o en false, mientras no haya un proxy que pise `CF-Connecting-IP` o `X-Real-IP`. El guardia no cree el `X-Forwarded-For` que manda el cliente.

## Si algún día la celda se muestra en vivo

No se implementa hasta que lo pidas. Las dos opciones que no abren puertos:

- **Cloudflare Tunnel + Cloudflare Access.** En la PC corre `cloudflared`. El túnel sale hacia Cloudflare; el router no tiene reenvío. Access pide un login (correo de Google o un código de un solo uso) antes de enseñar `/line` o la cámara. El resto del dominio sigue siendo la portada pública.
- **Tailscale.** La PC y quien mira la celda entran a la misma red privada. El API se abre en la IP de Tailscale, no en la IP de casa. Nadie fuera de esa red lo alcanza.

Cualquiera de las dos deja la portada en GitHub Pages. El túnel no sustituye al dominio público y no se enciende "para todos".
