"""Servidor del simulador del carrito Aether.

Uso (laptop, PowerShell, en la carpeta del repo):
    backend\\.venv\\Scripts\\python.exe sim\\servidor.py
    backend\\.venv\\Scripts\\python.exe sim\\servidor.py --firmware firmware\\motor_control\\.pio\\build\\native\\program.exe

Abre http://localhost:8770 en Chrome.

Puertos (solo en esta computadora):
  8770  página del simulador (HTTP + WebSocket)
  7700  pines del ESP32 virtual: aquí se conecta tu firmware compilado para la PC (entorno native)
  7701  el cable USB del ESP32 hacia la Jetson: tu código de Python abre "socket://localhost:7701"

El simulador corre en tiempo real. Con --firmware, el programa arranca cuando el ESP32 recibe
energía y se detiene cuando la pierde (como en el carrito real: sin energía no corre nada).
"""
from __future__ import annotations

import argparse
import asyncio
import json
import math
import mimetypes
import os
import pathlib
import re
import subprocess
import sys
import time

from websockets.asyncio.server import serve
from websockets.datastructures import Headers
from websockets.http11 import Response

AQUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))

from firmware_ref import FirmwareRef  # noqa: E402
from nucleo import mundo  # noqa: E402
from nucleo.simulacion import Simulacion  # noqa: E402

RAIZ = AQUI.parent
PROGRAMAS = RAIZ / "edge" / "navigation" / "programas"
NOMBRE_PROGRAMA = re.compile(r"^[A-Za-z0-9_\-]{1,40}$")
LINEAS_SILENCIOSAS = ("ODO", "MOT", "RNG", "PWR")      # llegan muchas por segundo: se guardan, no se listan

CASOS = {
    "caja_fija": ("Caja que no se quita", "Una caja queda en la recta de ida.",
                  "El ESP32 frena a ~40 cm sin chocar. La Jetson espera y a los 20 s dice «Necesito ayuda»."),
    "persona_se_retira": ("Persona en el camino que se retira", "Una persona está parada en la recta y se va 8 s después de que el carrito se detiene.",
                          "Frena, espera, y cuando se quita (más de 50 cm libres) sigue solo."),
    "persona_cruza": ("Persona que cruza despacio", "Una persona cruza la recta caminando cuando el carrito ya va a 0.35 m/s.",
                      "Frena mientras está enfrente y reanuda en cuanto pasa."),
    "persona_acople": ("Persona en el acople de la descarga", "Una persona se para entre el carrito y la estación durante el acople lento.",
                       "El reflejo de 40 cm no aplica al acoplar; el ESP32 sabe a qué distancia debe ver la estación y frena si ve algo antes."),
    "caja_atras": ("Caja detrás al retroceder (sin sensor trasero)", "Una caja queda detrás del carrito en la reversa de salida de la banda.",
                   "No hay sensor atrás: choca despacio (0.10 m/s), las ruedas no avanzan y a los 1.5 s el ESP32 avisa «atascado»; la Jetson abandona la misión."),
}

ESTATICOS = {"/": AQUI / "web" / "index.html"}


class Servidor:
    def __init__(self, firmware: str | None, ref: bool = False):
        self.sim = Simulacion()
        self.sim.colocar(0.0, 0.0, 0.0)          # empieza acoplado en la banda
        self.t0 = time.monotonic()
        self.navegadores = set()
        self.usb_clientes: set[asyncio.StreamWriter] = set()
        self.firmware = firmware
        self.proceso: subprocess.Popen | None = None
        self.hal_conectado = False
        self.monitor: list[str] = []
        self._cambio_mundo = True
        self.ref = FirmwareRef(self.sim, self._salida_usb) if ref else None
        if self.ref:
            self.sim.gancho = self.ref.paso
        self.mision: asyncio.subprocess.Process | None = None
        self.caso = None
        self.caso_id = None
        self._espera = None
        self.prog: asyncio.subprocess.Process | None = None
        self.salida_prog: list[str] = []

    # ------------------------------------------------------------ tiempo real
    def ahora(self) -> float:
        return time.monotonic() - self.t0

    def avanzar(self):
        dt = self.ahora() - self.sim.t
        if dt > 0.25:                              # la PC se trabó: no intentes recuperar más de 0.25 s
            self.t0 += dt - 0.25
            dt = 0.25
        if dt >= 0.001:
            self.sim.paso(dt)
        for ev in self.sim.eventos:
            self._evento(ev)
        self.sim.eventos.clear()
        self._agenda()

    def _evento(self, ev: str):
        self._monitor(f"[simulador] {'ESP32 encendido' if ev == 'esp32_encendido' else 'ESP32 sin energía'}")
        if ev == "esp32_encendido":
            self.arrancar_firmware()
        else:
            self.detener_firmware()

    def _salida_usb(self, datos: bytes):
        """Lo que el ESP32 manda por USB: al monitor de la página y al programa conectado al puerto 7701."""
        self._monitor_usb(datos)
        for w in list(self.usb_clientes):
            w.write(datos)

    def _monitor(self, texto: str):
        self.monitor.append(texto)
        del self.monitor[:-300]

    # ------------------------------------------------------------ firmware nativo
    def arrancar_firmware(self):
        if not self.firmware or self.proceso:
            return
        ruta = pathlib.Path(self.firmware)
        if not ruta.exists():
            self._monitor(f"[simulador] No encuentro el firmware {ruta}. ¿Ya compilaste con: pio run -e native?")
            return
        self.proceso = subprocess.Popen([str(ruta)], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        self._monitor(f"[simulador] Arranqué tu firmware: {ruta.name}")

    def detener_firmware(self):
        if self.proceso:
            self.proceso.kill()
            self.proceso = None
        self.sim.esp32.reiniciar()

    # ------------------------------------------------------------ misión de la Jetson (edge/navigation/mision.py)
    async def _lanzar_mision(self, ruta: str):
        self.detener_mision()
        self.detener_programa()
        script = RAIZ / "edge" / "navigation" / "mision.py"
        self.mision = await asyncio.create_subprocess_exec(
            sys.executable, str(script), "--puerto", "socket://127.0.0.1:7701", "--ruta", ruta, "--pausa-carga", "2", "--pausa-descarga", "2",
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT, env={**os.environ, "PYTHONIOENCODING": "utf-8"})
        self._monitor(f"[simulador] Arranqué el programa de la Jetson (mision.py, ruta {ruta})")
        proc = self.mision
        while linea := await proc.stdout.readline():
            self._monitor(linea.decode(errors="replace").rstrip())
        await proc.wait()
        if self.mision is proc:
            self.mision = None

    def detener_mision(self):
        if self.mision and self.mision.returncode is None:
            self.mision.kill()
            self._monitor("[simulador] Detuve el programa de la Jetson")
        self.mision = None
        if self.sim.esp32.vivo:
            self.sim.esp32.usb_rx += b"STOP\n"

    # ------------------------------------------------------------ programas del usuario (edge/navigation/programas)
    def lista_programas(self) -> list[str]:
        PROGRAMAS.mkdir(parents=True, exist_ok=True)
        return sorted(p.stem for p in PROGRAMAS.glob("*.py"))

    def _ruta_programa(self, nombre: str) -> pathlib.Path:
        if not NOMBRE_PROGRAMA.match(nombre or ""):
            raise ValueError("Nombre inválido: usa letras, números, guion y guion bajo (máximo 40)")
        return PROGRAMAS / f"{nombre}.py"

    def guardar_programa(self, nombre: str, codigo: str):
        ruta = self._ruta_programa(nombre)
        if len(codigo) > 200_000:
            raise ValueError("El programa es demasiado grande")
        PROGRAMAS.mkdir(parents=True, exist_ok=True)
        ruta.write_text(codigo.replace(chr(13) + chr(10), chr(10)), encoding="utf-8")

    def leer_programa(self, nombre: str) -> str:
        return self._ruta_programa(nombre).read_text(encoding="utf-8")

    async def _correr_programa(self, nombre: str):
        ruta = self._ruta_programa(nombre)
        self.detener_programa()
        self.detener_mision()
        self.salida_prog = [f"▶ {nombre}.py"]
        script = RAIZ / "edge" / "navigation" / "correr_programa.py"
        proc = self.prog = await asyncio.create_subprocess_exec(
            sys.executable, str(script), str(ruta), "--puerto", "socket://127.0.0.1:7701",
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT,
            env={**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUNBUFFERED": "1"})
        while linea := await proc.stdout.readline():
            self.salida_prog.append(linea.decode(errors="replace").rstrip())
            del self.salida_prog[:-300]
        codigo = await proc.wait()
        self.salida_prog.append(f"■ terminó con código {codigo}" + ("" if codigo == 0 else " (algo falló: mira arriba)"))
        if self.prog is proc:
            self.prog = None

    def detener_programa(self):
        if self.prog and self.prog.returncode is None:
            self.prog.kill()
            self.salida_prog.append("■ detenido por ti")
            if self.sim.esp32.vivo:
                self.sim.esp32.usb_rx += b"STOP" + chr(10).encode()
        self.prog = None

    # ------------------------------------------------------------ casos de obstáculos
    def _poner(self, clase: str, x: float, y: float):
        o = (mundo.obstaculo_persona if clase == "persona" else mundo.obstaculo_caja)(x, y)
        self.sim.extra.append(o)
        self._cambio_mundo = True
        return o

    def _quitar(self, o):
        if o in self.sim.extra:
            self.sim.extra.remove(o)
            self._cambio_mundo = True

    def _caso_caja_fija(self):
        self._poner("caja", -2.4, 0.0)
        return
        yield

    def _caso_persona_se_retira(self):
        p = self._poner("persona", -2.4, 0.0)
        yield ("hasta", lambda: self.sim.carrito.x < -1.0 and self.sim.sensores.distancia_mm("VL0") < 400 and abs(self.sim.carrito.v) < 0.02)
        yield ("seg", 8)
        self._quitar(p)

    def _caso_persona_cruza(self):
        p = self._poner("persona", -2.7, -1.0)
        yield ("hasta", lambda: self.sim.carrito.x < -1.5 and self.sim.carrito.v > 0.2)
        while p.cy < 1.0:
            p.cy += 0.5 * 0.05
            self._cambio_mundo = True
            yield ("seg", 0.05)
        self._quitar(p)

    def _caso_persona_acople(self):
        yield ("hasta", lambda: self.sim.carrito.y > 0.6 and math.sin(self.sim.carrito.th) > 0.98)
        p = self._poner("persona", -3.82, 1.75)
        yield ("seg", 10)
        self._quitar(p)

    def _caso_caja_atras(self):
        self._poner("caja", -0.95, 0.0)
        return
        yield

    def iniciar_caso(self, nombre: str):
        if nombre not in CASOS:
            raise KeyError(f"caso desconocido: {nombre}")
        self.detener_mision()
        c = self.sim.circuito
        c.kcd1, c.paro_presionado = True, False
        self.sim.extra.clear()
        self.sim.colocar(0.0, 0.0, 0.0)
        self.caso_id, self._espera = nombre, None
        self.caso = getattr(self, f"_caso_{nombre}")()
        self._monitor(f"[simulador] Caso: {CASOS[nombre][0]}")
        self._cambio_mundo = True
        asyncio.ensure_future(self._lanzar_mision("ida"))

    def _agenda(self):
        if not self.caso:
            return
        if self._espera:
            tipo, v = self._espera
            if (tipo == "seg" and self.sim.t < v) or (tipo == "hasta" and not v()):
                return
        try:
            y = next(self.caso)
        except StopIteration:
            self.caso = self._espera = None
            return
        self._espera = ("seg", self.sim.t + y[1]) if y[0] == "seg" else y

    # ------------------------------------------------------------ pines (puerto 7700)
    async def hal(self, lector: asyncio.StreamReader, escritor: asyncio.StreamWriter):
        self.hal_conectado = True
        self._monitor("[simulador] Tu firmware se conectó a los pines del ESP32")
        try:
            while linea := await lector.readline():
                self.avanzar()
                resp = self.atender_hal(linea.decode(errors="replace").split())
                if resp is not None:
                    escritor.write((resp + "\n").encode())
                    await escritor.drain()
        except ConnectionError:
            pass
        finally:
            self.hal_conectado = False
            self._monitor("[simulador] Tu firmware se desconectó")

    def atender_hal(self, p: list[str]) -> str | None:
        if not p:
            return None
        e, t, cmd = self.sim.esp32, self.sim.t, p[0]
        try:
            if cmd == "HOLA":
                return "OK"
            if cmd == "PM":
                e.pin_mode(int(p[1]), p[2], t)
            elif cmd == "DW":
                e.digital_write(int(p[1]), int(p[2]), t)
            elif cmd == "DR?":
                return str(e.digital_read(int(p[1])))
            elif cmd == "AR?":
                return str(e.analog_mv(int(p[1])))
            elif cmd == "U2":
                e.uart2_begin(int(p[1]), int(p[2]), int(p[3]))
            elif cmd == "U2W":
                e.uart2_write(bytes.fromhex(p[1]), t)
            elif cmd == "U2R?":
                d = e.uart2_read(t)
                return d.hex() if d else "-"
            elif cmd == "U0W":
                datos = bytes.fromhex(p[1])
                self._salida_usb(datos)
            elif cmd == "U0R?":
                d = e.usb_read()
                return d.hex() if d else "-"
            elif cmd == "IB":
                e.i2c_begin(int(p[1]), int(p[2]))
            elif cmd == "VI?":
                return "1" if e.vl_init(int(p[1])) else "0"
            elif cmd == "VA?":
                return "1" if e.vl_set_address(int(p[1]), int(p[2])) else "0"
            elif cmd == "VR?":
                return str(e.vl_read(int(p[1])))
            elif cmd == "BI?":
                return "1" if e.bno_ok() else "0"
            elif cmd == "BE?":
                v = e.bno_euler()
                return "-" if v is None else " ".join(f"{x:.3f}" for x in v)
            else:
                return "ERR comando desconocido" if cmd.endswith("?") else None
        except (IndexError, ValueError) as ex:
            return f"ERR {ex}" if cmd.endswith("?") else None
        return None

    _linea_usb = ""

    def _monitor_usb(self, datos: bytes):
        self._linea_usb += datos.decode(errors="replace")
        *lineas, self._linea_usb = self._linea_usb.split("\n")
        for ln in lineas:
            self._monitor(ln.rstrip("\r"))

    # ------------------------------------------------------------ USB hacia la Jetson (puerto 7701)
    async def usb(self, lector: asyncio.StreamReader, escritor: asyncio.StreamWriter):
        self.usb_clientes.add(escritor)
        self._monitor("[simulador] Algo se conectó al USB del ESP32 (puerto 7701)")
        try:
            while datos := await lector.read(4096):
                if self.sim.esp32.vivo:
                    self.sim.esp32.usb_rx += datos
        except ConnectionError:
            pass
        finally:
            self.usb_clientes.discard(escritor)

    # ------------------------------------------------------------ navegador
    def mundo_json(self) -> dict:
        c = self.sim.circuito
        return {"tipo": "mundo",
                "cajas": [vars(k) for k in self.sim.obstaculos()],
                "arucos": mundo.ARUCOS,
                "pines": c.nombres,
                "cables": c.cables, "cables_guia": [x["id"] for x in c.cables_guia],
                "casos": [{"id": k, "nombre": v[0], "descripcion": v[1], "esperado": v[2]} for k, v in CASOS.items()]}

    def estado_json(self) -> dict:
        e = self.sim.estado()
        e["tipo"] = "estado"
        e["firmware"] = {"configurado": bool(self.firmware), "corriendo": bool(self.proceso and self.proceso.poll() is None),
                         "conectado": self.hal_conectado}
        e["monitor"] = self.monitor[-60:]
        e["mision"] = bool(self.mision and self.mision.returncode is None)
        e["caso"] = self.caso_id
        e["prog"] = {"corriendo": bool(self.prog and self.prog.returncode is None), "salida": self.salida_prog[-120:]}
        e["firmware"]["referencia"] = bool(self.ref)
        return e

    def accion(self, m: dict):
        a, c, sim = m.get("accion"), self.sim.circuito, self.sim
        if a == "kcd1":
            c.kcd1 = bool(m["valor"])
        elif a == "paro":
            c.paro_presionado = bool(m["valor"])
        elif a == "final":
            (c.finales_presionados.add if m["valor"] else c.finales_presionados.discard)(m["cual"])
        elif a == "cortar":
            c.cortar(m["id"])
            self._cambio_mundo = True
        elif a == "conectar":
            c.conectar(m["de"], m["a"])
            self._cambio_mundo = True
        elif a == "reiniciar_cableado":
            c.reiniciar_cableado()
            self._cambio_mundo = True
        elif a == "reparar":
            c.reparar()
        elif a == "colocar":
            sim.colocar(float(m["x"]), float(m["y"]), float(m["th"]))
        elif a == "obstaculo":
            f = mundo.obstaculo_persona if m.get("clase") == "persona" else mundo.obstaculo_caja
            sim.extra.append(f(float(m["x"]), float(m["y"])))
            self._cambio_mundo = True
        elif a == "quitar_obstaculos":
            sim.extra.clear()
            self._cambio_mundo = True
        elif a == "masa":
            sim.carrito.masa = float(m["valor"])
        elif a == "motor_invertido":
            sim.motor_der.invertido = bool(m["valor"])
        elif a == "reset_esp32":
            self.detener_firmware()
            if c.esp_vivo:
                self._monitor("[simulador] Botón EN: reinicio del ESP32")
                self.arrancar_firmware()
        elif a == "mision":
            asyncio.ensure_future(self._lanzar_mision(m["ruta"]))
        elif a == "detener_mision":
            self.detener_mision()
        elif a == "prog_guardar":
            self.guardar_programa(m["nombre"], m["codigo"])
        elif a == "prog_ejecutar":
            asyncio.ensure_future(self._correr_programa(m["nombre"]))
        elif a == "prog_detener":
            self.detener_programa()
        elif a == "caso":
            self.iniciar_caso(m["nombre"])
        elif a == "usb_enviar":
            if sim.esp32.vivo:
                sim.esp32.usb_rx += (m["texto"] + "\n").encode()
        c.evaluar()

    async def navegador(self, ws):
        self.navegadores.add(ws)
        try:
            await ws.send(json.dumps(self.mundo_json()))
            await ws.send(json.dumps({"tipo": "programas", "lista": self.lista_programas()}))
            async for texto in ws:
                try:
                    m = json.loads(texto)
                    if m.get("accion") == "prog_leer":
                        await ws.send(json.dumps({"tipo": "programa", "nombre": m["nombre"], "codigo": self.leer_programa(m["nombre"])}))
                        continue
                    if m.get("accion") == "prog_listar":
                        await ws.send(json.dumps({"tipo": "programas", "lista": self.lista_programas()}))
                        continue
                    self.accion(m)
                    if m.get("accion") == "prog_guardar":
                        await ws.send(json.dumps({"tipo": "programas", "lista": self.lista_programas(), "guardado": m["nombre"]}))
                except (KeyError, ValueError, TypeError, OSError) as ex:
                    await ws.send(json.dumps({"tipo": "error", "texto": str(ex)}))
        finally:
            self.navegadores.discard(ws)

    async def ciclo(self):
        n = 0
        while True:
            self.avanzar()
            n += 1
            if n % 6 == 0 and self.navegadores:            # ~30 veces por segundo
                if self._cambio_mundo:
                    msg = json.dumps(self.mundo_json())
                    for ws in list(self.navegadores):
                        await ws.send(msg)
                    self._cambio_mundo = False
                msg = json.dumps(self.estado_json())
                for ws in list(self.navegadores):
                    try:
                        await ws.send(msg)
                    except Exception:
                        self.navegadores.discard(ws)
            await asyncio.sleep(0.005)


def archivo_estatico(conexion, peticion):
    ruta = peticion.path.split("?")[0]
    if peticion.headers.get("Upgrade", "").lower() == "websocket":
        return None
    archivo = ESTATICOS.get(ruta) or (AQUI / ruta.lstrip("/")).resolve()
    if not str(archivo).startswith(str(AQUI)) or not archivo.is_file() or not (
            str(archivo).startswith(str(AQUI / "web")) or str(archivo).startswith(str(AQUI / "generado"))):
        return Response(404, "Not Found", Headers({"Content-Type": "text/plain"}), b"No existe")
    tipo = mimetypes.guess_type(archivo.name)[0] or "application/octet-stream"
    if tipo.startswith("text/") or tipo in ("application/javascript",):
        tipo += "; charset=utf-8"
    return Response(200, "OK", Headers({"Content-Type": tipo, "Cache-Control": "no-store"}), archivo.read_bytes())


async def main():
    ap = argparse.ArgumentParser(description="Simulador del carrito Aether")
    ap.add_argument("--firmware", help="ruta al programa compilado con el entorno native")
    ap.add_argument("--puerto", type=int, default=8770)
    ap.add_argument("--sin-firmware", action="store_true", help="no correr ningún firmware (solo el circuito y la física)")
    args = ap.parse_args()
    s = Servidor(args.firmware, ref=not args.firmware and not args.sin_firmware)
    async with serve(s.navegador, "127.0.0.1", args.puerto, process_request=archivo_estatico, max_size=2 ** 22):
        await asyncio.start_server(s.hal, "127.0.0.1", 7700)
        await asyncio.start_server(s.usb, "127.0.0.1", 7701)
        print(f"Simulador listo: abre http://localhost:{args.puerto} en Chrome  (pines: 7700, USB: 7701)")
        print("Firmware:", args.firmware or ("ninguno" if args.sin_firmware else "de referencia en Python (sin compilador de C++)"))
        await s.ciclo()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
