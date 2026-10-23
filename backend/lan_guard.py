"""¿Quien pregunta está en la red local configurada?

Los endpoints de los agentes y del canal de voz no llevan autenticación; solo se aceptan desde la red
local (AETHER_LAN_CIDRS; por defecto los rangos privados). Complementa a PublicGuard, que cierra estas
rutas al dominio público.
"""

import ipaddress

from public_guard import LOCAL_NAMES, client_ip
from settings import env_cidrs


def lan_networks():
    return env_cidrs("AETHER_LAN_CIDRS")


def host_is_lan(host: str, networks=None) -> bool:
    host = (host or "").strip().strip("[]")
    if host in LOCAL_NAMES - {""}:
        return True  # "localhost" y el cliente de pruebas
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        return False
    if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped is not None:
        ip = ip.ipv4_mapped
    return any(ip in net for net in (networks or lan_networks()) if net.version == ip.version)


def request_is_lan(scope, headers: dict[str, str], networks=None) -> bool:
    return host_is_lan(client_ip(scope, headers), networks)


def origin_matches_host(origin: str | None, host: str | None) -> bool:
    """Para WebSocket de navegadores: el Origin debe apuntar al mismo servidor al que se conectan.
    Sin Origin (cliente que no es navegador) se acepta."""
    if not origin:
        return True
    from urllib.parse import urlparse

    return bool(host) and urlparse(origin).netloc.lower() == host.strip().lower()
