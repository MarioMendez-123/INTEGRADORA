"""Motor-rueda M0601 simulado: protocolo RS485 y comportamiento eléctrico-mecánico.

Protocolo (tramas de 10 bytes, 115200 8N1, CRC-8/MAXIM sobre los primeros 9 bytes).
El formato viene de la guía del Waveshare DDSM115 (tu guía dice que es el mismo motor);
falta compararlo byte por byte con la hoja del M0601:
  manejar   ID 64 vH vL 00 00 acc freno 00 CRC   -> responde ID 64 modo iH iL vH vL pH pL err CRC
  consultar ID 74 00 00 00 00 00 00 00 CRC       -> responde igual que manejar
  cambiar   ID A0 00 00 00 00 00 00 00 modo      (sin CRC, sin respuesta; modo 2 = velocidad)
  poner ID  AA 55 53 ID 00 00 00 00 00 00        (solo con un motor en el bus; sin respuesta)

Valores del modelo que NO salen de una medición (se ajustan cuando midan el motor real):
  TIEMPO_SIN_TRAMA_S, KT, I0, KP, KI, FRENO_KD, V_MIN.
De la hoja (DFRobot FIT1042/FIT1038): 18 V, 200 rpm en vacío, 0.96 N·m a 115 rpm, encoder 4096.
"""
from __future__ import annotations

import math

RPM = 2 * math.pi / 60

V_NOMINAL = 18.0
RPM_VACIO = 200.0
PAR_NOMINAL, RPM_NOMINAL = 0.96, 115.0
PAR_ARRANQUE = PAR_NOMINAL / (1 - RPM_NOMINAL / RPM_VACIO)   # 2.26 N·m si la curva es recta
V_MIN = 12.0                 # por debajo, el driver interno no arranca (supuesto)
KT = 0.40                    # N·m por A (supuesto)
I0 = 0.12                    # A en vacío (supuesto)
TIEMPO_SIN_TRAMA_S = 0.06    # sin tramas de manejo por más de esto, la rueda queda libre (supuesto)
KP, KI, FRENO_KD = 0.35, 2.5, 1.2

MODO_CORRIENTE, MODO_VELOCIDAD, MODO_POSICION = 1, 2, 3
ERR_SENSOR, ERR_SOBRECORRIENTE, ERR_FASE, ERR_BLOQUEO = 0x01, 0x02, 0x04, 0x08


def crc8_maxim(datos: bytes) -> int:
    crc = 0
    for b in datos:
        crc ^= b
        for _ in range(8):
            crc = (crc >> 1) ^ 0x8C if crc & 1 else crc >> 1
    return crc


def trama(*b: int) -> bytes:
    """Arma 9 bytes + CRC."""
    cuerpo = bytes(x & 0xFF for x in b)
    assert len(cuerpo) == 9
    return cuerpo + bytes([crc8_maxim(cuerpo)])


class M0601:
    def __init__(self, ident: int, nombre: str):
        self.id = ident
        self.nombre = nombre
        self.modo = MODO_VELOCIDAD
        self.alimentado = False
        self.voltaje = 0.0
        self.objetivo_rpm = 0.0      # lo último que pidió el ESP32
        self.rampa_rpm = 0.0         # objetivo después de la rampa de aceleración
        self.acc = 0                 # 0 = sin rampa; n = n·0.1 ms por rpm
        self.freno = False
        self.ultima_trama = -1e9
        self.integral = 0.0
        self.par = 0.0               # N·m que el motor aplica a la rueda
        self.omega = 0.0             # rad/s de la rueda (lo pone la física)
        self.angulo = 0.0            # rad acumulados de la rueda
        self.error = 0
        self.t_bloqueo = 0.0
        self.tramas_ok = 0
        self.tramas_malas = 0
        self.invertido = False       # True si se compró del mismo lado que el otro

    # ---------------------------------------------------------------- bus
    def recibir(self, datos: bytes, t: float) -> bytes | None:
        """Una trama completa que llegó por el bus. Devuelve la respuesta o None."""
        if not self.alimentado or len(datos) != 10:
            return None
        if datos[0] == 0xAA and datos[1] == 0x55 and datos[2] == 0x53:
            self.id = datos[3]
            return None
        if datos[0] != self.id:
            return None
        if datos[1] == 0xA0:
            self.modo = datos[9]
            return None
        if crc8_maxim(datos[:9]) != datos[9]:
            self.tramas_malas += 1
            return None
        self.tramas_ok += 1
        if datos[1] == 0x64:
            v = int.from_bytes(datos[2:4], "big", signed=True)
            self.objetivo_rpm = max(-RPM_VACIO, min(RPM_VACIO, float(v)))
            self.acc = datos[6]
            self.freno = datos[7] == 0xFF
            self.ultima_trama = t
            if self.modo != MODO_VELOCIDAD:
                self.objetivo_rpm = 0.0   # este modelo solo simula el modo velocidad
            return self.respuesta(0x64)
        if datos[1] == 0x74:
            return self.respuesta(0x74)
        return None

    def respuesta(self, cmd: int) -> bytes:
        """ID modo iH iL vH vL pH pL err CRC (formato del DDSM115; la respuesta no repite el comando)."""
        signo = -1 if self.invertido else 1
        rpm = int(round(signo * self.omega / RPM)) & 0xFFFF
        corriente = int(round(self.corriente() * 1000 / 8)) & 0xFFFF     # escala del modelo
        pos = int((self.angulo % (2 * math.pi)) / (2 * math.pi) * 32767)
        return trama(self.id, self.modo, corriente >> 8, corriente, rpm >> 8, rpm, pos >> 8, pos, self.error)

    # ---------------------------------------------------------------- física
    def corriente(self) -> float:
        if not self.alimentado:
            return 0.0
        return I0 + abs(self.par) / KT

    def actualizar(self, t: float, dt: float, omega_rueda: float) -> float:
        """Calcula el par que aplica a la rueda. omega_rueda en rad/s (+ = hacia adelante)."""
        signo = -1 if self.invertido else 1
        self.omega = omega_rueda * signo           # el motor ve su propio sentido
        self.angulo += self.omega * dt
        self.alimentado = self.voltaje >= V_MIN
        if not self.alimentado:
            self.par, self.integral, self.error = 0.0, 0.0, 0
            return 0.0
        escala = self.voltaje / V_NOMINAL
        w0 = RPM_VACIO * RPM * escala
        par_max = PAR_ARRANQUE * escala
        sin_tramas = t - self.ultima_trama > TIEMPO_SIN_TRAMA_S
        if sin_tramas:
            self.par, self.integral, self.rampa_rpm = 0.0, 0.0, 0.0     # rueda libre
            self.t_bloqueo = 0.0
            return 0.0
        if self.freno and self.objetivo_rpm == 0:
            par = -FRENO_KD * self.omega
        else:
            if self.acc == 0:
                self.rampa_rpm = self.objetivo_rpm
            else:
                paso = dt / (self.acc * 1e-4)                         # rpm que puede cambiar en dt
                d = self.objetivo_rpm - self.rampa_rpm
                self.rampa_rpm += max(-paso, min(paso, d))
            e = self.rampa_rpm * RPM - self.omega
            self.integral = max(-3.0, min(3.0, self.integral + e * dt))
            par = KP * e + KI * self.integral
        # límite de la curva par-velocidad (al motorizar); al frenar se permite el par de arranque
        if par * self.omega > 0:
            lim = max(0.0, par_max * (1 - abs(self.omega) / w0))
        else:
            lim = par_max
        par = max(-lim, min(lim, par))
        # bloqueo: mucho par y la rueda casi quieta durante 1 s
        if abs(par) > 0.8 * par_max and abs(self.omega) < 0.5:
            self.t_bloqueo += dt
        else:
            self.t_bloqueo = 0.0
        self.error = ERR_BLOQUEO if self.t_bloqueo > 1.0 else 0
        self.par = par
        return par * signo
