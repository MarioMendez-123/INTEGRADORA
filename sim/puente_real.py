"""Puente del gemelo: el carrito real y el simulado corren a la par.

Corre en la Jetson (o en la laptop con el ESP32 conectado por USB):
    python3 sim/puente_real.py --serie /dev/ttyUSB0

Qué hace:
- Se queda con el USB del ESP32 real (115200 baud).
- Tu programa de navegación se conecta a socket://localhost:7701 (igual que con el simulador) y lo que
  escribe va al ESP32 real; lo que el ESP32 contesta le llega de vuelta.
- Sirve la página del simulador en http://IP-DE-LA-JETSON:8771 y le manda una COPIA de todas las líneas
  (las órdenes de la Jetson y lo que reporta el ESP32). La página solo mira: no puede mandarle nada al
  carrito real, así que el teléfono nunca mueve el carrito.

Necesita: pip install pyserial websockets   (dentro del venv de la Jetson)
Abre el puerto 8771 a la red local: úsalo solo en la red del laboratorio.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import mimetypes
import pathlib

import serial
from websockets.asyncio.server import serve
from websockets.datastructures import Headers
from websockets.http11 import Response

AQUI = pathlib.Path(__file__).resolve().parent
ESQUELETO = (b'<!doctype html><html lang="es"><head><meta charset="utf-8">'
             b'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>')


def estatico(conexion, peticion):
    ruta = peticion.path.split("?")[0]
    if ruta == "/gemelo":
        return None                                    # la conexión WebSocket
    if ruta in ("/", "/movil.html"):
        return Response(200, "OK", Headers({"Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store"}),
                        ESQUELETO + (AQUI / "web" / "movil.html").read_bytes())
    base = AQUI / "generado" if ruta.startswith("/generado/") else AQUI / "web"
    archivo = (base / ruta.removeprefix("/generado/").lstrip("/")).resolve()
    if not str(archivo).startswith(str(base)) or not archivo.is_file():
        return Response(404, "Not Found", Headers({"Content-Type": "text/plain"}), b"No existe")
    tipo = mimetypes.guess_type(archivo.name)[0] or "application/octet-stream"
    if tipo.startswith("text/") or tipo == "application/javascript":
        tipo += "; charset=utf-8"
    return Response(200, "OK", Headers({"Content-Type": tipo, "Cache-Control": "no-store"}), archivo.read_bytes())


class Puente:
    def __init__(self, puerto_serie: str, baud: int):
        self.esp = serial.serial_for_url(puerto_serie, baudrate=baud, timeout=0.05)
        self.paginas: set = set()
        self.nav: set[asyncio.StreamWriter] = set()
        self.resto = {"esp32": "", "jetson": ""}

    def copiar(self, de: str, datos: bytes):
        """Parte en líneas y le manda una copia a cada página abierta."""
        texto = self.resto[de] + datos.decode(errors="replace")
        *lineas, self.resto[de] = texto.split("\n")
        for ln in lineas:
            if ln.strip():
                msg = json.dumps({"de": de, "linea": ln.strip()})
                for ws in list(self.paginas):
                    asyncio.ensure_future(self._enviar(ws, msg))

    async def _enviar(self, ws, msg):
        try:
            await ws.send(msg)
        except Exception:
            self.paginas.discard(ws)

    async def leer_esp32(self):
        bucle = asyncio.get_running_loop()
        while True:
            datos = await bucle.run_in_executor(None, self.esp.read, 4096)
            if datos:
                for w in list(self.nav):
                    w.write(datos)
                self.copiar("esp32", datos)

    async def programa_nav(self, lector, escritor):
        self.nav.add(escritor)
        try:
            while datos := await lector.read(4096):
                self.esp.write(datos)
                self.copiar("jetson", datos)
        except ConnectionError:
            pass
        finally:
            self.nav.discard(escritor)

    async def pagina(self, ws):
        self.paginas.add(ws)
        try:
            async for _ in ws:             # la página no puede mandarle nada al carrito real
                pass
        finally:
            self.paginas.discard(ws)


async def main():
    ap = argparse.ArgumentParser(description="Puente entre el carrito real y el gemelo del simulador")
    ap.add_argument("--serie", required=True, help="puerto del ESP32: /dev/ttyUSB0 en la Jetson, COM3 en Windows")
    ap.add_argument("--baud", type=int, default=115200)
    ap.add_argument("--puerto-web", type=int, default=8771)
    ap.add_argument("--puerto-nav", type=int, default=7701)
    a = ap.parse_args()
    p = Puente(a.serie, a.baud)
    async with serve(p.pagina, "0.0.0.0", a.puerto_web, process_request=estatico):
        await asyncio.start_server(p.programa_nav, "127.0.0.1", a.puerto_nav)
        print(f"Puente listo. Tu programa: socket://localhost:{a.puerto_nav}. Teléfono: http://IP-DE-ESTE-EQUIPO:{a.puerto_web}")
        await p.leer_esp32()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
