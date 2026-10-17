"""Cierra el dominio público y la internet abierta.

AETHER_PUBLIC_MODE:
  auto (default) — restringe si el Host es aethermx.online / www, o si la IP
    del cliente no es loopback, privada o de enlace local.
  public — restringe siempre (aunque entres por localhost).
  local — no restringe. Solo para el laboratorio. No lo uses en un servidor
    alcanzable desde internet.

En modo restringido se permiten GET /health, GET /inventory y
GET /inventory/history. Streams de cámara, la celda, el robot, el dataset
y cualquier método que modifica estado responden 403.

AETHER_TRUST_PROXY=true hace caso a CF-Connecting-IP o X-Real-IP. Nginx
tiene que pisar ese encabezado. No se lee X-Forwarded-For del cliente:
cualquiera puede mandar 127.0.0.1 y saltarse el cierre.
"""

import ipaddress
import os
import time
from collections import deque

PUBLIC_HOSTS = {"aethermx.online", "www.aethermx.online"}
LOCAL_NAMES = {"localhost", "testclient", ""}
SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
CORS_ORIGINS = {
    "https://aethermx.online",
    "https://www.aethermx.online",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
}
BLOCKED_PREFIXES = (
    "/perception",
    "/line/",
    "/robot",
    "/dataset",
    "/spotify",
    "/show",
    "/inventory/auto-refresh",
)
RATE_LIMIT = 120
RATE_WINDOW_S = 60

CSP = (
    "default-src 'self'; "
    "script-src 'self' https://cdn.jsdelivr.net; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: blob:; "
    "media-src 'self'; "
    "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; "
    "frame-src 'self'; "
    "frame-ancestors 'self'; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "form-action 'none'"
)

_hits: dict[str, deque] = {}


def _mode() -> str:
    raw = os.environ.get("AETHER_PUBLIC_MODE", "auto").strip().lower()
    if raw in {"1", "true", "public", "yes"}:
        return "public"
    if raw in {"0", "false", "local", "no"}:
        return "local"
    return "auto"


def _header_map(scope) -> dict[str, str]:
    out = {}
    for key, value in scope.get("headers") or []:
        out[key.decode("latin1").lower()] = value.decode("latin1")
    return out


def _is_local_ip(host: str) -> bool:
    host = (host or "").strip().strip("[]")
    if host in LOCAL_NAMES:
        return True
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        return False
    return bool(ip.is_loopback or ip.is_private or ip.is_link_local)


def client_ip(scope, headers: dict[str, str]) -> str:
    trust = os.environ.get("AETHER_TRUST_PROXY", "").strip().lower() in {"1", "true", "yes"}
    if trust:
        forwarded = headers.get("cf-connecting-ip") or headers.get("x-real-ip") or ""
        if forwarded:
            return forwarded.split(",")[0].strip()
    client = scope.get("client")
    return client[0] if client else ""


def is_restricted(scope, headers: dict[str, str] | None = None) -> bool:
    mode = _mode()
    if mode == "public":
        return True
    if mode == "local":
        return False
    headers = headers if headers is not None else _header_map(scope)
    host = headers.get("host", "").split(":")[0].strip().lower()
    if host in PUBLIC_HOSTS:
        return True
    return not _is_local_ip(client_ip(scope, headers))


def _hidden_path(path: str) -> bool:
    name = path.lower()
    return (
        name == "/.env"
        or name.endswith(".env")
        or "/.env" in name
        or "/.git" in name
        or name.endswith(".bak")
        or name.endswith(".sqlite")
        or name.endswith(".db")
    )


def _blocked(method: str, path: str) -> bool:
    if _hidden_path(path):
        return False
    base = path.split("?", 1)[0].rstrip("/") or "/"
    if any(base == prefix.rstrip("/") or base.startswith(prefix) for prefix in BLOCKED_PREFIXES):
        return True
    if method not in SAFE_METHODS:
        return True
    return False


def _too_many(ip: str) -> bool:
    now = time.monotonic()
    bucket = _hits.setdefault(ip or "?", deque())
    while bucket and now - bucket[0] > RATE_WINDOW_S:
        bucket.popleft()
    if len(bucket) >= RATE_LIMIT:
        return True
    bucket.append(now)
    return False


def security_headers(restricted: bool, https: bool) -> list[tuple[bytes, bytes]]:
    camera = b"camera=(), microphone=(), geolocation=()" if restricted else b"camera=(self), microphone=(), geolocation=()"
    rows = [
        (b"x-content-type-options", b"nosniff"),
        (b"referrer-policy", b"strict-origin-when-cross-origin"),
        (b"x-frame-options", b"SAMEORIGIN"),
        (b"permissions-policy", camera),
        (b"content-security-policy", CSP.encode()),
        (b"cross-origin-opener-policy", b"same-origin"),
    ]
    if https:
        rows.append((b"strict-transport-security", b"max-age=31536000; includeSubDomains"))
    return rows


def _json_response(send, status: int, body: bytes):
    async def _go():
        await send({
            "type": "http.response.start",
            "status": status,
            "headers": [
                (b"content-type", b"application/json"),
                (b"content-length", str(len(body)).encode()),
                (b"cache-control", b"no-store"),
                (b"x-content-type-options", b"nosniff"),
            ],
        })
        await send({"type": "http.response.body", "body": body})

    return _go()


class PublicGuard:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] not in {"http", "websocket"}:
            await self.app(scope, receive, send)
            return

        headers = _header_map(scope)
        restricted = is_restricted(scope, headers)
        path = scope.get("path") or "/"
        method = scope.get("method", "GET").upper()

        if scope["type"] == "websocket":
            if restricted and _blocked("GET", path):
                await send({"type": "websocket.close", "code": 1008})
                return
            await self.app(scope, receive, send)
            return

        if _hidden_path(path):
            await _json_response(send, 404, b'{"detail":"Not Found"}')
            return

        if restricted and _blocked(method, path):
            await _json_response(send, 403, b'{"detail":"No disponible"}')
            return

        if restricted and _too_many(client_ip(scope, headers)):
            await _json_response(send, 429, b'{"detail":"Demasiadas solicitudes"}')
            return

        https = scope.get("scheme") == "https" or headers.get("x-forwarded-proto", "").split(",")[0].strip() == "https"
        extra = security_headers(restricted, https)
        origin = headers.get("origin", "")
        if origin in CORS_ORIGINS:
            extra.append((b"access-control-allow-origin", origin.encode("latin1")))
            extra.append((b"vary", b"Origin"))
            extra.append((b"access-control-allow-methods", b"GET, HEAD, OPTIONS"))

        async def send_guarded(message):
            if message["type"] == "http.response.start":
                merged = list(message.get("headers") or [])
                have = {key.lower() for key, _ in merged}
                for key, value in extra:
                    if key not in have:
                        merged.append((key, value))
                message = {**message, "headers": merged}
            await send(message)

        await self.app(scope, receive, send_guarded)
