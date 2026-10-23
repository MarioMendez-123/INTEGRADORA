"""Direcciones de los agentes que leen las páginas (GET /config/agents) y orígenes para la CSP.

Sin agente configurado todo queda en None y las páginas usan la cámara local, como siempre.
"""

import ipaddress
from urllib.parse import urlparse

from agent_contracts import AgentsConfig, StreamConfig
from settings import env_url

PERCEPTION_VAR = "AETHER_PERCEPTION_AGENT_URL"
LINE_VAR = "AETHER_LINE_AGENT_URL"


def perception_agent_url() -> str:
    return env_url(PERCEPTION_VAR)


def line_agent_url() -> str:
    return env_url(LINE_VAR)


def agent_origins() -> list[str]:
    """Orígenes que la CSP debe permitir para <img>: cada agente configurado y su equivalente en loopback
    (la sustitución por equipo de más abajo)."""
    origins: list[str] = []
    for base in (perception_agent_url(), line_agent_url()):
        if not base:
            continue
        parsed = urlparse(base)
        port = f":{parsed.port}" if parsed.port else ""
        for host in (parsed.hostname, "127.0.0.1", "localhost"):
            host = f"[{host}]" if host and ":" in host else host
            origin = f"{parsed.scheme}://{host}{port}"
            if origin not in origins:
                origins.append(origin)
    return origins


def _same_machine(client_host: str, agent_host: str) -> bool:
    client_host = (client_host or "").strip("[]")
    try:
        return ipaddress.ip_address(client_host) == ipaddress.ip_address(agent_host)
    except ValueError:
        return client_host.lower() == (agent_host or "").lower()


def stream_url_for(base: str, client_host: str) -> str | None:
    """URL del /stream de un agente vista desde client_host. Si el que pregunta ES el equipo del agente,
    se devuelve loopback: el video no sale de ese equipo."""
    if not base:
        return None
    parsed = urlparse(base)
    if _same_machine(client_host, parsed.hostname or ""):
        port = f":{parsed.port}" if parsed.port else ""
        return f"{parsed.scheme}://127.0.0.1{port}/stream"
    return f"{base}/stream"


def agents_config(client_host: str) -> AgentsConfig:
    return AgentsConfig(
        perception=StreamConfig(stream_url=stream_url_for(perception_agent_url(), client_host)),
        line_vision=StreamConfig(stream_url=stream_url_for(line_agent_url(), client_host)),
    )
