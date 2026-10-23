"""Lectura y validación de variables de entorno de los agentes y del servicio de voz.

Una variable mal escrita debe fallar al ARRANCAR con un mensaje que diga cuál es y
qué se esperaba, no unos minutos después con un error críptico. Solo se usa la
biblioteca estándar. La tabla de variables, con valores por defecto y quién las usa,
está en docs/variables_entorno.md.
"""

import ipaddress
import os
from urllib.parse import urlparse


class ConfigError(ValueError):
    """Una variable de entorno tiene un valor que no se puede usar."""


def env_str(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def env_bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name, "").strip().lower()
    if not raw:
        return default
    if raw in {"1", "true", "yes", "on", "si", "sí"}:
        return True
    if raw in {"0", "false", "no", "off"}:
        return False
    raise ConfigError(f"{name} debe ser 1/0, true/false u on/off, no '{raw}'.")


def env_int(name: str, default: int, minimo: int | None = None, maximo: int | None = None) -> int:
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    try:
        value = int(raw)
    except ValueError:
        raise ConfigError(f"{name} debe ser un número entero, no '{raw}'.") from None
    return _dentro_de_rango(name, value, minimo, maximo)


def env_float(name: str, default: float, minimo: float | None = None, maximo: float | None = None) -> float:
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    try:
        value = float(raw)
    except ValueError:
        raise ConfigError(f"{name} debe ser un número, no '{raw}'.") from None
    return _dentro_de_rango(name, value, minimo, maximo)


def _dentro_de_rango(name, value, minimo, maximo):
    if minimo is not None and value < minimo:
        raise ConfigError(f"{name} debe ser al menos {minimo}, no {value}.")
    if maximo is not None and value > maximo:
        raise ConfigError(f"{name} debe ser a lo más {maximo}, no {value}.")
    return value


def env_choice(name: str, default: str, opciones: tuple[str, ...]) -> str:
    raw = os.environ.get(name, "").strip().lower()
    if not raw:
        return default
    if raw not in opciones:
        raise ConfigError(f"{name} debe ser uno de {', '.join(opciones)}, no '{raw}'.")
    return raw


def parse_base_url(name: str, raw: str) -> str:
    """http(s)://host[:puerto] sin ruta, sin usuario ni contraseña. Regresa la forma normalizada."""
    parsed = urlparse(raw)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise ConfigError(f"{name} debe ser una dirección como http://10.4.5.103:8001, no '{raw}'.")
    if parsed.username or parsed.password:
        raise ConfigError(f"{name} no debe llevar usuario ni contraseña.")
    if parsed.path not in {"", "/"} or parsed.query or parsed.fragment:
        raise ConfigError(f"{name} debe ser solo servidor y puerto (sin ruta), no '{raw}'.")
    try:
        port = parsed.port
    except ValueError:
        raise ConfigError(f"{name} trae un puerto inválido: '{raw}'.") from None
    host = parsed.hostname
    if ":" in host:  # IPv6
        host = f"[{host}]"
    return f"{parsed.scheme}://{host}" + (f":{port}" if port else "")


def env_url(name: str, default: str = "") -> str:
    """Cadena vacía = no configurada."""
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    return parse_base_url(name, raw)


# Rangos que cuentan como "red local" si no se configura otra cosa.
DEFAULT_LAN_CIDRS = (
    "127.0.0.0/8,::1/128,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,169.254.0.0/16,fe80::/10,fc00::/7"
)


def env_cidrs(name: str, default: str = DEFAULT_LAN_CIDRS):
    raw = os.environ.get(name, "").strip() or default
    redes = []
    for parte in raw.split(","):
        parte = parte.strip()
        if not parte:
            continue
        try:
            redes.append(ipaddress.ip_network(parte, strict=False))
        except ValueError:
            raise ConfigError(f"{name} trae una red inválida: '{parte}' (ejemplo: 10.4.5.0/24).") from None
    if not redes:
        raise ConfigError(f"{name} no puede quedar vacía.")
    return tuple(redes)
