"""Acciones de escritorio de Lumina: Spotify, abrir apps, Edge, archivos.

Sin LLM: se reconocen por patrones. Lo delicado pide confirmación de voz
(sí/no) y se guarda en PENDING hasta que conteste. Tokens de Spotify en
backend/spotify_token.json (fuera de git), credenciales en backend/.env.
"""

from __future__ import annotations

import ast
import base64
import ctypes
import datetime
import json
import logging
import operator
import os
import re
import shutil
import subprocess
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

logger = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parent
TOKEN_PATH = ROOT / "spotify_token.json"
ALLOW_PATH = ROOT / "allowlist.json"
LOG_PATH = ROOT / "lumina_actions.jsonl"
_TIMERS: list[threading.Timer] = []
_BLOCKED_NAMES = {".env", "spotify_token.json", "contactos.json", "lumina_actions.jsonl"}
SCOPES = "user-read-playback-state user-modify-playback-state user-read-currently-playing"
REDIRECT = os.environ.get("SPOTIFY_REDIRECT_URI", "http://127.0.0.1:8888/callback")

_lock = threading.Lock()
PENDING: dict | None = None
_ESSAY_BUSY = False
_ESSAY_PHASE = ""
_ESSAY_TEXT = ""
_ESSAY_READY = False
_YES = re.compile(r"^\s*(?:lumina|ilumina|lumia)?\s*(s[ií]|claro|ok|okay|dale|adelante|confirmo|hazlo|yes)\s*[.!]?\s*$", re.I)
_NO = re.compile(r"^\s*(?:lumina|ilumina|lumia)?\s*(no|cancel(?:a|ar)?|mejor no|detente)\s*[.!]?\s*$", re.I)

_WAKE = re.compile(r"\b(lumina|ilumina|luminia|lumia|oye|por favor|puedes|quiero que|me puedes)\b", re.I)
_PHONE = re.compile(r"\b(tel[eé]fono|celular|m[oó]vil|iphone|android)\b", re.I)
_PC = re.compile(r"\b(computadora|ordenador|escritorio|esta pc|aqu[ií]|laptop|en el (?:pc|equipo))\b", re.I)
_PLAY = re.compile(
    r"\b(reproduce|reproducir|ponme|p[oó]nle|p[oó]n|play|escucha|escuchar|echate|echate|pon la canci[oó]n|pon el tema)\b",
    re.I,
)
_INSANO = re.compile(r"\b(?:un\s+)?t[eé][ck]h?no bien insano\b", re.I)
_PAUSE = re.compile(r"\b(pausa|p[aá]usala|pause|det[eé]n la m[uú]sica|para la m[uú]sica)\b", re.I)
_NEXT = re.compile(r"\b(siguiente|la que sigue|skip|otra canci[oó]n|adelanta)\b", re.I)
_PREV = re.compile(r"\b(anterior|la de antes|regresa(?: la canci[oó]n)?)\b", re.I)
_VOL_UP = re.compile(r"\b(sube|subir|m[aá]s)\b.*\b(volumen|audio)\b|\b(volumen|audio)\b.*\b(sube|arriba|m[aá]s)\b", re.I)
_VOL_DOWN = re.compile(r"\b(baja|bajar|menos)\b.*\b(volumen|audio)\b|\b(volumen|audio)\b.*\b(baja|abajo|menos)\b", re.I)
_AUTH = re.compile(r"\b(autoriza|conecta|vincula|enlaza)\b.*\bspotify\b|\bspotify\b.*\b(autoriza|conecta|vincula)\b", re.I)
_OPEN = re.compile(r"\b(abre|abrir|abreme|ábreme)\b", re.I)
_CLOSE = re.compile(r"\b(cierra|cerrar|ci[eé]rrame)\b", re.I)
_SEARCH = re.compile(r"\b(busca(?:me)?|googlea|navega(?: a)?)\b", re.I)
_MKDIR = re.compile(r"\b(crea(?:me)?|haz(?:me)?|nueva)\b.*\b(carpeta|directorio)\b", re.I)
_MKFILE = re.compile(r"\b(guarda|guardar|crea(?:me)?|escribe)\b.*\b(archivo|nota|txt)\b", re.I)
_OPEN_DIR = re.compile(r"\babre\b.*\b(carpeta|directorio|descargas|documentos|escritorio|repositorio|proyecto|repo)\b", re.I)
_TIMER = re.compile(r"\b(temporizador|alarma|timer|recu[eé]rdame)\b", re.I)
_MUTE = re.compile(r"\b(mute|silencio|silenciar|quita el sonido)\b", re.I)
_HELP = re.compile(r"\b(qu[eé] puedes hacer|qu[eé] sabes hacer)\b", re.I)
_CLOCK = re.compile(r"\b(qu[eé] hora|la hora|qu[eé] d[ií]a|la fecha|qu[eé] fecha)\b", re.I)
_NOW = re.compile(r"\b(qu[eé] (?:est[aá] sonando|suena)|qu[eé] canci[oó]n)\b", re.I)
_LOCK = re.compile(r"\b(bloquea|bloquear)\b.*\b(pantalla|pc|computadora|equipo)\b", re.I)
_POWER = re.compile(r"\b(apaga|apagar|reinicia|reiniciar)\b.*\b(pc|computadora|equipo|windows|ordenador)\b", re.I)
_ABORT = re.compile(r"\b(cancela el apagado|no apagues|aborta el apagado)\b", re.I)
_STOP = re.compile(r"^\s*(?:lumina[, ]+)?(detente|para todo|alto|stop)\s*[.!]?\s*$", re.I)
_READ = re.compile(r"\b(l[eé]e(?:me)?(?: el archivo)?|muestra el archivo)\b", re.I)
_DID = re.compile(r"\bqu[eé] hiciste\b", re.I)
_WIKI = re.compile(r"\binvestiga\b", re.I)
_MORNING = re.compile(r"\bbuenos d[ií]as\b", re.I)
_REST = re.compile(r"\bmodo descanso\b", re.I)
_WORK = re.compile(r"\bmodo trabajo\b", re.I)
_STATUS = re.compile(r"\b(bater[ií]a|espacio en disco|estado del equipo)\b", re.I)
_SHOT = re.compile(r"\b(captura de pantalla|screenshot)\b", re.I)
_CLIP_R = re.compile(r"\b(portapapeles|qu[eé] copi[eé])\b", re.I)
_CLIP_W = re.compile(r"\bcopia esto\b", re.I)
_REMEMBER = re.compile(r"\brecuerda que\b", re.I)
_RECALL = re.compile(r"\bqu[eé] recuerdas\b", re.I)
_FORGET = re.compile(r"\bolvida\b", re.I)
_GIT = re.compile(r"\b(estado del repo|qu[eé] cambi[oó] en el repo)\b", re.I)
_COMPARE = re.compile(r"\bcompara\b", re.I)
_MOVE = re.compile(r"\bmueve\b.+\ba\b", re.I)
_UNDO = re.compile(r"\bdeshaz lo [uú]ltimo\b", re.I)
_MEDIA = re.compile(r"\b(youtube|el video)\b", re.I)
_PULSE = re.compile(r"\b(pulso|reporte)\b", re.I)
_CALC = re.compile(r"\b(cu[aá]nto es|calcula)\b", re.I)
_CONV = re.compile(r"\bconvierte\b", re.I)
_AT = re.compile(r"\bav[ií]same a las\b", re.I)
_WATCH = re.compile(r"\bav[ií]same si la bater[ií]a baja de\s+(\d+)", re.I)
_ZONE = re.compile(r"\bqu[eé] hora es en\b", re.I)
MEMORY_PATH = ROOT / "lumina_memory.json"
_WHO = re.compile(
    r"\b(?:ens[eé][nñ]a(?:nos|me)?|muestra(?:nos|me)?)\b.*\bqui[eé]n eres\b",
    re.I,
)
_INTERIOR = re.compile(
    r"\b(?:muestra(?:nos|me)?|ense[nñ]a(?:nos|me)?|abre)\b.*\b(?:tu interior|el interior|por dentro|adentro)\b",
    re.I,
)
_HOLO = re.compile(
    r"\b(proyecta|descomp[oó]n)\b(?!.*\bimagen\b).*\b(aether|robot|mol[eé]cula|agua|metano|compuesto|placa|electr[oó]nica|circuito)\b"
    r"|\b(aether|mol[eé]cula|placa|agua|metano)\b.*\b3d\b",
    re.I,
)
_SHOW = re.compile(r"\b(proyecta|proyectar|muestra la imagen|pon la imagen|abre la imagen|pon en pantalla)\b", re.I)
_DOC = re.compile(r"\b(crea|nuevo|haz|abre)\b.*\b(documento|google docs)\b|\bgoogle docs\b", re.I)
_ESSAY = re.compile(r"\b(ensayo|reporte|paper)\b", re.I)
_TIPOS = r"argumentativo|expositivo|comparativo|descriptivo|cr[ií]tico|anal[ií]tico|persuasivo|narrativo|explicativo|reflexivo"
_HELP_TEXT = (
    "Pongo cualquier canción del catálogo de Spotify en esta PC o en el teléfono, "
    "abro apps de la lista, busco en Edge, YouTube, abro un Google Doc y escribo un ensayo en APA con la portada de la Utech, "
    "proyecto el robot pieza por pieza, Aether, una molécula o la placa en 3D, leo texto, Word y Excel, investigo en Wikipedia, "
    "recuerdo datos, comparo archivos, veo el repo, calculo, convierto unidades, "
    "digo la hora en otra ciudad, vigilo la batería, "
    "capturo pantalla, uso el portapapeles y las teclas de media. "
    "Pido permiso para cerrar, guardar, mover, olvidar, copiar, apagar y n8n. "
    "No mando correos, no compro y no borro fuera de tu perfil."
)

_APP_ALIAS = {
    "edge": "msedge",
    "microsoft edge": "msedge",
    "navegador": "msedge",
    "spotify": "spotify:",
    "bloc": "notepad",
    "bloc de notas": "notepad",
    "notas": "notepad",
    "calculadora": "calc",
    "explorador": "explorer",
    "archivos": "explorer",
    "cursor": "Cursor",
    "chrome": "chrome",
    "discord": "Discord",
    "word": "winword",
    "excel": "excel",
    "whatsapp": "whatsapp",
    "configuracion": "ms-settings:",
    "configuración": "ms-settings:",
}

_CLOSE_IMAGE = {
    "msedge": "msedge.exe",
    "edge": "msedge.exe",
    "chrome": "chrome.exe",
    "spotify": "Spotify.exe",
    "notepad": "notepad.exe",
    "discord": "Discord.exe",
    "cursor": "Cursor.exe",
}


def _split_track(q: str) -> tuple[str, str | None]:
    """Separa título y artista. Con comillas, el título es lo citado."""
    quoted = re.search(r"[\"“«'](.+?)[\"”»']", q)
    if quoted:
        title = quoted.group(1).strip()
        m = re.search(r"\b(?:de|del|por|by)\s+(.+)$", q[quoted.end():], re.I)
        artist = m.group(1).strip(" .,") if m else None
        return title, artist or None
    m = re.search(r"^(.+?)\s+(?:de|del|por|by)\s+(.+)$", q, re.I)
    if not m:
        return q, None
    title, artist = m.group(1).strip(" .,"), m.group(2).strip(" .,")
    if re.fullmatch(r"(?:la |el )?m[uú]sica|(?:la |el )?canci[oó]n|(?:el )?tema", title, re.I):
        return artist, None
    return title, artist


def _name_score(want: str, got: str) -> float:
    w = set(re.findall(r"[a-z0-9áéíóúñü]+", want.casefold()))
    g = set(re.findall(r"[a-z0-9áéíóúñü]+", got.casefold()))
    if not w or not g:
        return 0.0
    return len(w & g) / min(len(w), len(g))


def _strip(text: str) -> str:
    t = _WAKE.sub(" ", text)
    t = re.sub(r"\s+", " ", t).strip(" .,¿?¡!")
    return t


def parse_intent(text: str) -> dict | None:
    """Convierte una frase en una acción, o None si es conversación normal."""
    raw = text.strip()
    if not raw:
        return None
    if _STOP.match(raw):
        return {"kind": "stop"}
    if PENDING and _YES.match(raw):
        return {"kind": "confirm_yes"}
    if PENDING and _NO.match(raw):
        return {"kind": "confirm_no"}
    if _HELP.search(raw):
        return {"kind": "help"}

    t = _strip(raw)
    if not t:
        return None

    device = "phone" if _PHONE.search(t) else "pc" if _PC.search(t) else None
    t_dev = _PHONE.sub(" ", t)
    t_dev = _PC.sub(" ", t_dev)
    t_dev = re.sub(r"\ben (el|la|los|las)?\s*$", "", t_dev, flags=re.I)
    t_dev = re.sub(r"\s+", " ", t_dev).strip(" .,")

    if _AUTH.search(raw):
        return {"kind": "spotify_login"}
    if _ABORT.search(t):
        return {"kind": "abort_power"}
    if _HELP.search(t):
        return {"kind": "help"}
    if _DID.search(t):
        return {"kind": "actions"}
    if _UNDO.search(t):
        return {"kind": "undo"}
    if _MORNING.search(t):
        return {"kind": "morning"}
    if _REST.search(t):
        return {"kind": "rest"}
    if _WORK.search(t):
        return {"kind": "work"}
    if _RECALL.search(t):
        return {"kind": "recall"}
    if _REMEMBER.search(t):
        fact = _REMEMBER.sub("", t).strip(" .,")
        return {"kind": "remember", "fact": fact} if fact else None
    if _FORGET.search(t):
        fact = _FORGET.sub("", t).strip(" .,")
        return {"kind": "forget", "fact": fact} if fact else None
    if _WIKI.search(t):
        query = _WIKI.sub(" ", t).strip(" .,")
        return {"kind": "wiki", "query": query} if query else None
    if _WATCH.search(t):
        return {"kind": "watch", "limit": int(_WATCH.search(t).group(1))}
    if _is_essay_status(t):
        return {"kind": "essay_status"}
    if _PULSE.search(t) and not re.search(r"\b(?:sobre|acerca de|del tema|haz(?:me|nos)?|escribe|redacta|genera|arma|prepara|quiero|necesito)\b", t, re.I):
        return {"kind": "pulse"}
    if _STATUS.search(t):
        return {"kind": "status"}
    if _AT.search(t):
        return {"kind": "at", "text": t}
    if _CALC.search(t):
        expr = _CALC.sub(" ", t).strip(" .,")
        return {"kind": "calc", "expr": expr} if expr else None
    if _CONV.search(t):
        return {"kind": "convert", "text": _CONV.sub(" ", t).strip(" .,")}
    if _ZONE.search(t):
        city = _ZONE.sub(" ", t).strip(" .,")
        return {"kind": "zone", "city": city} if city else None
    if _SHOT.search(t):
        return {"kind": "shot"}
    if _CLIP_R.search(t):
        return {"kind": "clip_read"}
    if _CLIP_W.search(t):
        copied = _CLIP_W.sub(" ", t).strip(" .,")
        return {"kind": "clip_write", "text": copied or t}
    if _GIT.search(t):
        return {"kind": "git"}
    if _COMPARE.search(t):
        pair = re.search(r"compara\s+(.+?)\s+con\s+(.+)$", t, re.I)
        if not pair:
            return None
        return {"kind": "compare", "a": pair.group(1).strip(), "b": pair.group(2).strip(" .,")}
    if _MOVE.search(t):
        moved = re.search(r"mueve\s+(.+?)\s+a\s+(escritorio|documentos|descargas)\b", t, re.I)
        if not moved:
            return None
        where = {"escritorio": "desktop", "documentos": "documents", "descargas": "downloads"}[moved.group(2).casefold()]
        return {"kind": "move", "name": moved.group(1).strip(), "where": where}
    if _MEDIA.search(t) and (_PAUSE.search(t) or _NEXT.search(t) or _PREV.search(t)):
        direction = "next" if _NEXT.search(t) else "prev" if _PREV.search(t) else "pause"
        return {"kind": "media", "direction": direction}
    if _READ.search(t):
        named = re.search(r"\barchivo\s+(.+)$", t, re.I)
        name = named.group(1).strip(" .,") if named else _READ.sub(" ", t)
        name = re.sub(r"\s+", " ", name).strip(" .,")
        return {"kind": "read_file", "name": name} if name else None
    if _CLOCK.search(t):
        what = "date" if re.search(r"fecha|d[ií]a", t, re.I) else "time"
        return {"kind": "clock", "what": what}
    if _NOW.search(t):
        return {"kind": "now_playing"}
    if _LOCK.search(t):
        return {"kind": "lock"}
    if _POWER.search(t):
        mode = "restart" if re.search(r"reinici", t, re.I) else "shutdown"
        return {"kind": "power", "mode": mode}
    if _PAUSE.search(t):
        return {"kind": "spotify_pause"}
    if _NEXT.search(t):
        return {"kind": "spotify_next"}
    if _PREV.search(t):
        return {"kind": "spotify_prev"}
    if _TIMER.search(t):
        m = re.search(r"(\d+)\s*(segundos?|minutos?|horas?)", t, re.I)
        if not m:
            return {"kind": "timer", "seconds": 0}
        n = int(m.group(1))
        unit = m.group(2).casefold()
        factor = 3600 if unit.startswith("hora") else 60 if unit.startswith("min") else 1
        return {"kind": "timer", "seconds": n * factor}
    if _MUTE.search(t) and not re.search(r"spotify", t, re.I):
        return {"kind": "win_vol", "direction": "mute"}
    if _VOL_UP.search(t) or _VOL_DOWN.search(t):
        if re.search(r"spotify", t, re.I):
            return {"kind": "spotify_vol", "delta": 15 if _VOL_UP.search(t) else -15}
        return {"kind": "win_vol", "direction": "up" if _VOL_UP.search(t) else "down"}
    if _WHO.search(t):
        return {"kind": "holo", "model": "robot", "apart": False, "pose": "armada"}
    if _INTERIOR.search(t):
        return {"kind": "holo", "model": "robot", "apart": False, "reveal": True}
    if _HOLO.search(t):
        if re.search(r"metano", t, re.I):
            model = "metano"
        elif re.search(r"agua|mol[eé]cula|compuesto", t, re.I):
            model = "agua"
        elif re.search(r"placa|electr|circuito", t, re.I):
            model = "placa"
        elif re.search(r"\brobot\b", t, re.I):
            model = "robot"
        else:
            model = "aether"
        return {"kind": "holo", "model": model, "apart": bool(re.search(r"descomp", t, re.I))}
    if _SHOW.search(t):
        name = _SHOW.sub(" ", t)
        name = re.sub(r"\b(la imagen|imagen|foto|el archivo)\b", " ", name, flags=re.I)
        name = re.sub(r"\s+", " ", name).strip(" .,")
        return {"kind": "show_image", "name": name} if name else None
    if re.search(r"\b(?:haz(?:me|nos)?|escribe|redacta|genera|arma|prepara|quiero|necesito)\b", t, re.I) and _ESSAY.search(t) or re.search(r"\b(?:ensayo|reporte)\b.*\b(?:sobre|acerca de|del tema)\b", t, re.I):
        topic = _essay_topic(t)
        if not topic:
            return None
        out = {"kind": "essay", "topic": topic}
        tipo = _essay_kind(t)
        if tipo:
            out["tipo"] = tipo
        return out
    if _INSANO.search(t):
        return {
            "kind": "spotify_play",
            "query": "Do You Wanna",
            "artist": "KRAZKA, Aether",
            "uri": "spotify:track:22RH8on5apN7wbv2lqtTXi",
            "device": device,
        }
    if _PLAY.search(t):
        q = _PLAY.sub(" ", t_dev)
        q = re.sub(r"\s+", " ", q).strip(" .,")
        if not q:
            return {"kind": "spotify_resume", "device": device}
        title, artist = _split_track(q)
        if not title:
            return {"kind": "spotify_resume", "device": device}
        out = {"kind": "spotify_play", "query": title, "device": device}
        if artist:
            out["artist"] = artist
        return out

    if _MKDIR.search(t):
        name = re.sub(r".*\b(?:carpeta|directorio)\b", "", t, flags=re.I).strip(" .," ) or "nueva carpeta"
        return {"kind": "mkdir", "name": name}
    if _MKFILE.search(t):
        body = ""
        head = t
        bm = re.search(r"\b(?:que diga|con (?:el )?texto)\s+(.+)$", t, re.I)
        if bm:
            body = bm.group(1).strip(" .,")
            head = t[: bm.start()]
        name = "nota.txt"
        m = re.search(r"\b(?:archivo|nota|txt)\b\s+(?:llamad[oa]\s+)?(.+)$", head, flags=re.I)
        if m and m.group(1).strip(" .,"):
            name = m.group(1).strip(" .,")
            if not re.search(r"\.[a-z0-9]{1,8}$", name, re.I):
                name = name + ".txt"
        return {"kind": "mkfile", "name": name, "body": body}
    if _DOC.search(t):
        return {"kind": "open_url", "url": "https://docs.new"}
    if _OPEN_DIR.search(t):
        if re.search(r"\b(repositorio|proyecto|repo)\b", t, re.I):
            where = "repo"
        elif re.search(r"descargas", t, re.I):
            where = "downloads"
        elif re.search(r"documentos", t, re.I):
            where = "documents"
        else:
            where = "desktop"
        return {"kind": "open_dir", "where": where}
    if _SEARCH.search(t):
        q = _SEARCH.sub(" ", t)
        q = re.sub(r"\b(en (?:internet|google|edge|el navegador)|por favor)\b", " ", q, flags=re.I)
        q = re.sub(r"\s+", " ", q).strip(" .,")
        return {"kind": "search", "query": q} if q else None
    if _CLOSE.search(t):
        app = _CLOSE.sub(" ", t)
        app = re.sub(r"\b(el|la|los|las|programa|aplicaci[oó]n|app)\b", " ", app, flags=re.I)
        app = re.sub(r"\s+", " ", app).strip(" .,")
        return {"kind": "close_app", "app": app} if app else None
    if _OPEN.search(t):
        rest = _OPEN.sub(" ", t, count=1)
        rest = re.sub(r"^\s*(el|la|los|las|programa|aplicaci[oó]n|app)\s+", "", rest, flags=re.I)
        rest = rest.strip(" .,")
        if re.search(r"\b(busca|googlea)\b", rest, re.I):
            q = re.sub(r".*\b(busca(?:me)?|googlea)\b", "", rest, flags=re.I).strip(" .,")
            return {"kind": "search", "query": q} if q else None
        if re.match(r"https?://", rest, re.I) or re.match(r"[\w-]+\.[\w.-]+(/\S*)?$", rest):
            url = rest if rest.startswith("http") else "https://" + rest
            return {"kind": "open_url", "url": url}
        site = _site(rest)
        if site:
            return {"kind": "open_url", "url": site}
        if re.match(r"[a-zA-Z]:\\", rest) or rest.startswith("\\\\"):
            return {"kind": "open_path", "path": rest}
        return {"kind": "open_app", "app": rest} if rest else None
    return None


def handle_desktop(text: str) -> dict | None:
    """Ejecuta un comando de escritorio. None = que siga Ollama."""
    global PENDING
    intent = parse_intent(text)
    if intent is None:
        return _n8n_try(text)
    if intent["kind"] == "confirm_yes":
        with _lock:
            job = PENDING
            PENDING = None
        if not job:
            return None
        return _noted(job["kind"], _run(job, confirmed=True))
    if intent["kind"] == "confirm_no":
        with _lock:
            PENDING = None
        return {"answer": "De acuerdo, no hago nada."}
    if intent["kind"] == "stop":
        return _stop_all()
    if intent["kind"] in {"close_app", "mkfile", "power", "move", "forget", "clip_write"}:
        return _ask(intent)
    return _noted(intent["kind"], _run(intent, confirmed=False))


def _ask(intent: dict) -> dict:
    global PENDING
    prompts = {
        "close_app": f"¿Cierro {intent.get('app', 'eso')}?",
        "mkfile": f"¿Guardo {intent.get('name', 'nota.txt')} en el escritorio? Texto: {(intent.get('body') or '(vacío)')[:120]}",
        "mkdir": f"¿Creo la carpeta {intent.get('name')} en el escritorio?",
        "power": "¿Reinicio la PC en 20 segundos?" if intent.get("mode") == "restart" else "¿Apago la PC en 20 segundos?",
        "n8n_call": f"¿Ejecuto {intent.get('tool', 'eso')} en n8n?",
        "move": f"¿Muevo {intent.get('name')} a {intent.get('where')}?",
        "forget": f"¿Olvido «{intent.get('fact', '')}»?",
        "clip_write": f"¿Copio esto al portapapeles: {(intent.get('text') or '')[:80]}?",
    }
    with _lock:
        PENDING = intent
    return {"answer": prompts.get(intent["kind"], "¿Lo hago?"), "pending": True}


def _run(intent: dict, confirmed: bool) -> dict:
    kind = intent["kind"]
    try:
        if kind == "spotify_login":
            return _spotify_login()
        if kind.startswith("spotify_"):
            return _spotify_act(intent)
        if kind == "open_app":
            return _open_app(intent["app"])
        if kind == "open_url":
            return _open_edge(intent["url"])
        if kind == "essay_status":
            return _essay_report()
        if kind == "essay":
            return _write_essay(intent["topic"], intent.get("tipo", ""))
        if kind == "show_image":
            return _show_image(intent["name"])
        if kind == "holo":
            return _holo(intent["model"], intent.get("apart"), intent.get("pose"), intent.get("reveal"))
        if kind == "search":
            q = urllib.parse.quote_plus(intent["query"])
            return _open_edge(f"https://www.bing.com/search?q={q}")
        if kind == "close_app":
            if not confirmed:
                return _ask(intent)
            return _close_app(intent["app"])
        if kind == "mkdir":
            return _mkdir(intent["name"])
        if kind == "mkfile":
            if not confirmed:
                return _ask(intent)
            return _mkfile(intent["name"], intent.get("body") or "")
        if kind == "open_dir":
            return _open_user_dir(intent["where"])
        if kind == "open_path":
            return _open_path(intent["path"])
        if kind == "timer":
            return _start_timer(int(intent["seconds"]))
        if kind == "win_vol":
            return _win_volume(intent["direction"])
        if kind == "help":
            return {"answer": _HELP_TEXT}
        if kind == "clock":
            return _clock(intent["what"])
        if kind == "now_playing":
            return _now_playing()
        if kind == "lock":
            return _lock_screen()
        if kind == "power":
            if not confirmed:
                return _ask(intent)
            return _power(intent["mode"])
        if kind == "abort_power":
            return _abort_power()
        if kind == "read_file":
            return _read_file(intent["name"])
        if kind == "actions":
            return _recent_actions()
        if kind == "wiki":
            return _wiki(intent["query"])
        if kind == "morning":
            return _morning()
        if kind == "rest":
            return _spotify_act({"kind": "spotify_pause"})
        if kind == "work":
            return _open_user_dir("repo")
        if kind == "remember":
            return _remember(intent["fact"])
        if kind == "recall":
            return _recall()
        if kind == "forget":
            if not confirmed:
                return _ask(intent)
            return _forget(intent["fact"])
        if kind == "status":
            return _machine()
        if kind == "pulse":
            return _pulse()
        if kind == "watch":
            return _watch_battery(int(intent["limit"]))
        if kind == "at":
            return _start_timer(_seconds_until(intent["text"]))
        if kind == "calc":
            return {"answer": _math_answer(intent["expr"])}
        if kind == "convert":
            return {"answer": _convert_answer(intent["text"])}
        if kind == "zone":
            return _zone_time(intent["city"])
        if kind == "shot":
            return _screenshot()
        if kind == "clip_read":
            return _clip_read()
        if kind == "clip_write":
            if not confirmed:
                return _ask(intent)
            return _clip_write(intent["text"])
        if kind == "git":
            return _git_status()
        if kind == "compare":
            return _compare_files(intent["a"], intent["b"])
        if kind == "move":
            if not confirmed:
                return _ask(intent)
            return _move_file(intent["name"], intent["where"])
        if kind == "media":
            return _media(intent["direction"])
        if kind == "undo":
            return _undo_last()
        if kind == "n8n_call":
            if not confirmed:
                return _ask(intent)
            return _n8n_call(intent["tool"], intent["arguments"])
    except RuntimeError as exc:
        return {"answer": str(exc)}
    except Exception:
        logger.exception("Lumina escritorio: falló %s", kind)
        return {"answer": "Intenté hacerlo y algo salió mal. Revisa la consola del backend."}
    return None


N8N_URL = "https://maario.app.n8n.cloud/mcp-server/http"
_N8N = {"sid": None, "tools": None, "at": 0.0}


def _mcp_body(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("{"):
        return json.loads(raw)
    for line in raw.splitlines():
        if line.startswith("data:"):
            return json.loads(line[5:].strip())
    raise RuntimeError("n8n contestó algo que no entiendo.")


def _n8n_post(method: str, params: dict | None) -> dict | None:
    token = os.environ.get("N8N_MCP_TOKEN", "").strip()
    if not token:
        return None
    payload = {"jsonrpc": "2.0", "method": method}
    if params is not None:
        payload["id"] = 1
        payload["params"] = params
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Authorization": "Bearer " + token,
    }
    if _N8N["sid"]:
        headers["Mcp-Session-Id"] = _N8N["sid"]
    req = urllib.request.Request(
        os.environ.get("N8N_MCP_URL", N8N_URL),
        data=json.dumps(payload).encode(),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            sid = resp.headers.get("Mcp-Session-Id")
            if sid:
                _N8N["sid"] = sid
            if method.startswith("notifications/"):
                return {}
            return _mcp_body(resp.read().decode())
    except urllib.error.HTTPError as exc:
        if exc.code == 401:
            raise RuntimeError("n8n rechazó el token. Revisa N8N_MCP_TOKEN en backend/.env.") from exc
        raise RuntimeError("n8n no respondió.") from exc


def _n8n_tools() -> list:
    if os.environ.get("N8N_MCP_TOKEN", "").strip() == "":
        return []
    if _N8N["tools"] is not None and time.time() - _N8N["at"] < 300:
        return _N8N["tools"]
    _n8n_post(
        "initialize",
        {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "lumina", "version": "1"}},
    )
    try:
        _n8n_post("notifications/initialized", None)
    except RuntimeError:
        pass
    data = _n8n_post("tools/list", {}) or {}
    tools = ((data.get("result") or {}).get("tools") or [])
    _N8N["tools"] = tools
    _N8N["at"] = time.time()
    return tools


def _pick_n8n_tool(text: str, tools: list) -> dict | None:
    words = set(re.findall(r"[a-z0-9áéíóúñü]{3,}", text.casefold()))
    scored = []
    for tool in tools:
        blob = f"{tool.get('name', '').replace('_', ' ')} {tool.get('description', '')}"
        have = set(re.findall(r"[a-z0-9áéíóúñü]{3,}", blob.casefold()))
        score = len(words & have)
        if score:
            scored.append((score, tool))
    if not scored:
        return None
    scored.sort(key=lambda item: item[0], reverse=True)
    if len(scored) > 1 and scored[0][0] == scored[1][0]:
        return None
    return scored[0][1]


def _n8n_args(tool: dict, text: str) -> dict | None:
    schema = tool.get("inputSchema") or {}
    props = schema.get("properties") or {}
    required = list(schema.get("required") or [])
    strings = [key for key, spec in props.items() if (spec or {}).get("type") == "string"]
    if len(required) > 1:
        return None
    if not strings:
        return {} if not required else None
    field = required[0] if required and required[0] in strings else strings[0]
    return {field: text}


def _n8n_call(name: str, arguments: dict) -> dict:
    data = _n8n_post("tools/call", {"name": name, "arguments": arguments}) or {}
    result = data.get("result") or {}
    if data.get("error") or result.get("isError"):
        raise RuntimeError("n8n no pudo hacerlo.")
    texts = [c.get("text", "") for c in result.get("content") or [] if isinstance(c, dict)]
    answer = " ".join(t for t in texts if t).strip() or "Listo en n8n."
    return {"answer": answer[:500]}


def _n8n_try(text: str) -> dict | None:
    try:
        tools = _n8n_tools()
    except RuntimeError as exc:
        return {"answer": str(exc)}
    tool = _pick_n8n_tool(text, tools)
    if not tool:
        return None
    args = _n8n_args(tool, text)
    if args is None:
        return {"answer": f"{tool.get('name')} pide más datos de los que entendí."}
    blob = f"{tool.get('name', '')} {tool.get('description', '')}"
    return _ask({"kind": "n8n_call", "tool": tool["name"], "arguments": args})


_RISK = {
    "read_file": 0, "actions": 0, "clock": 0, "help": 0, "now_playing": 0, "stop": 0,
    "wiki": 0, "status": 0, "git": 0, "recall": 0, "morning": 0, "compare": 0, "clip_read": 0,
    "pulse": 0, "calc": 0, "convert": 0, "zone": 0,
    "mkfile": 2, "forget": 2, "move": 2, "clip_write": 2, "undo": 2,
    "power": 3, "n8n_call": 3,
}


def _risk(kind: str) -> int:
    return _RISK.get(kind, 1)


def _blocked_name(name: str) -> bool:
    base = Path(name).name.casefold()
    return base in _BLOCKED_NAMES or base.startswith(".env")


def _log(kind: str, answer: str, undo: str = "") -> None:
    rec = {"t": time.strftime("%Y-%m-%dT%H:%M:%S"), "kind": kind, "risk": _risk(kind), "result": answer[:180], "undo": undo}
    try:
        with LOG_PATH.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
    except OSError:
        return


def _noted(kind: str, out: dict | None) -> dict | None:
    if isinstance(out, dict) and out.get("answer") and not out.get("pending"):
        _log(kind, out["answer"], out.get("undo") or "")
    return out


def _stop_all() -> dict:
    global PENDING
    with _lock:
        PENDING = None
    for timer in list(_TIMERS):
        timer.cancel()
    _TIMERS.clear()
    subprocess.run(["shutdown", "/a"], check=False)
    return {"answer": "Paré. Cancelé lo pendiente y los temporizadores."}


def _read_file(name: str) -> dict:
    if _blocked_name(name) or ".." in name:
        raise RuntimeError("Ese archivo está bloqueado.")
    safe = _safe_name(name)
    suffix = Path(safe).suffix.casefold()
    if suffix == ".pdf":
        raise RuntimeError("No leo PDF.")
    if suffix not in {".txt", ".md", ".py", ".json", ".csv", ".log", ".html", ".js", ".css", ".docx", ".xlsx"}:
        raise RuntimeError("Solo leo texto, Word o Excel.")
    roots = [_user_dir("desktop"), _user_dir("documents"), _user_dir("downloads"), ROOT.parent]
    hits = []
    for root in roots:
        candidate = root / safe
        if candidate.is_file() and _is_under(candidate, root) and not _blocked_name(candidate.name):
            hits.append(candidate)
    if not hits:
        raise RuntimeError("No veo ese archivo en el escritorio, documentos, descargas o la raíz del proyecto.")
    suffix = hits[0].suffix.casefold()
    if suffix == ".docx":
        text = _docx_text(hits[0])
    elif suffix == ".xlsx":
        text = _xlsx_text(hits[0])
    else:
        text = hits[0].read_text(encoding="utf-8", errors="replace").strip()
    if not text:
        return {"answer": "El archivo está vacío."}
    return {"answer": text[:1500]}


def _recent_actions() -> dict:
    if not LOG_PATH.exists():
        return {"answer": "Hoy no he hecho nada."}
    today = time.strftime("%Y-%m-%d")
    hits = []
    for line in LOG_PATH.read_text(encoding="utf-8").splitlines()[-40:]:
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        if str(rec.get("t", "")).startswith(today):
            hits.append(f"{rec['t'][11:16]} {rec.get('kind')}")
    if not hits:
        return {"answer": "Hoy no he hecho nada."}
    return {"answer": "Hoy hice: " + ", ".join(hits[-6:]) + "."}


def _office_text(path: Path, inner: str, tag: str) -> str:
    import zipfile
    from xml.etree import ElementTree
    with zipfile.ZipFile(path) as zf:
        root = ElementTree.fromstring(zf.read(inner))
    return " ".join(node.text or "" for node in root.iter(tag)).strip()


def _docx_text(path: Path) -> str:
    return _office_text(path, "word/document.xml", "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t")


def _xlsx_text(path: Path) -> str:
    import zipfile
    from xml.etree import ElementTree
    ns = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
    with zipfile.ZipFile(path) as zf:
        names = zf.namelist()
        shared: list[str] = []
        if "xl/sharedStrings.xml" in names:
            sroot = ElementTree.fromstring(zf.read("xl/sharedStrings.xml"))
            shared = ["".join(si.itertext()) for si in sroot]
        sheet = next(name for name in names if name.startswith("xl/worksheets/sheet"))
        root = ElementTree.fromstring(zf.read(sheet))
    lines = []
    for row in root.iter(ns + "row"):
        cells = []
        for cell in row.findall(ns + "c"):
            value = cell.find(ns + "v")
            if value is None or value.text is None:
                cells.append("")
            elif cell.get("t") == "s":
                cells.append(shared[int(value.text)])
            else:
                cells.append(value.text)
        if any(cells):
            lines.append(" | ".join(cells))
        if len(lines) >= 30:
            break
    return "\n".join(lines)


def _mem() -> list:
    if not MEMORY_PATH.exists():
        return []
    try:
        data = json.loads(MEMORY_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    return data if isinstance(data, list) else []


def _remember(fact: str) -> dict:
    items = _mem()
    items.append(fact)
    MEMORY_PATH.write_text(json.dumps(items[-50:], ensure_ascii=False, indent=2), encoding="utf-8")
    return {"answer": "Lo recordé."}


def _recall() -> dict:
    items = _mem()
    if not items:
        return {"answer": "No recuerdo nada todavía."}
    return {"answer": "Recuerdo: " + "; ".join(items[-8:])}


def _forget(fact: str) -> dict:
    items = [item for item in _mem() if fact.casefold() not in item.casefold()]
    MEMORY_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"answer": "Listo, lo olvidé."}


def _machine() -> dict:
    class Power(ctypes.Structure):
        _fields_ = [
            ("ac", ctypes.c_byte), ("flag", ctypes.c_byte), ("percent", ctypes.c_byte),
            ("reserved", ctypes.c_byte), ("life", ctypes.c_ulong), ("full", ctypes.c_ulong),
        ]
    status = Power()
    ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(status))
    battery = "sin dato de batería" if status.percent == 255 else f"batería {status.percent}%"
    usage = shutil.disk_usage("C:/")
    free = usage.free // (1024 ** 3)
    return {"answer": f"{battery}. Libres {free} GB en C."}


def _weather() -> str:
    try:
        with urllib.request.urlopen("https://wttr.in/?format=3", timeout=8) as resp:
            return resp.read().decode().strip()
    except (urllib.error.URLError, TimeoutError):
        return ""


def _morning() -> dict:
    parts = [_clock("time")["answer"], _clock("date")["answer"], _machine()["answer"]]
    weather = _weather()
    if weather:
        parts.append(weather)
    remembered = _mem()
    if remembered:
        parts.append("Recuerdo: " + remembered[-1])
    return {"answer": " ".join(parts)}


def _wiki(query: str) -> dict:
    search = "https://es.wikipedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "opensearch", "search": query, "limit": "1", "namespace": "0", "format": "json",
    })
    try:
        with urllib.request.urlopen(search, timeout=12) as resp:
            found = json.loads(resp.read().decode())
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError("No pude consultar Wikipedia.") from exc
    titles = found[1] if len(found) > 1 else []
    if not titles:
        raise RuntimeError(f"No encontré {query} en Wikipedia.")
    summary = "https://es.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(titles[0].replace(" ", "_"))
    with urllib.request.urlopen(summary, timeout=12) as resp:
        data = json.loads(resp.read().decode())
    extract = (data.get("extract") or "").strip()
    link = ((data.get("content_urls") or {}).get("desktop") or {}).get("page") or ""
    if not extract:
        raise RuntimeError(f"Wikipedia no tiene un resumen de {titles[0]}.")
    return {"answer": f"{titles[0]}. {extract[:700]} {link}".strip()}


def _essay_kind(text: str) -> str:
    found = re.search(rf"\b(?:ensayo|reporte)\s+({_TIPOS})\b", text, re.I)
    return found.group(1).casefold() if found else ""


def _is_essay_status(text: str) -> bool:
    if re.search(r"\b(?:sobre|acerca de|del tema)\b", text, re.I):
        return False
    return bool(re.search(r"\b(?:c[oó]mo va|en qu[eé] va|estado|qu[eé] pas[oó]|ya termin|sigue el (?:ensayo|reporte))\b", text, re.I) and re.search(r"\b(?:ensayo|reporte)\b", text, re.I))


def _essay_topic(text: str) -> str:
    found = re.search(r"\b(?:sobre|acerca de|del tema)\s+(.+)$", text, re.I)
    if not found:
        found = re.search(r"\b(?:ensayo|reporte)\s+(?:de\s+)?(.+)$", text, re.I)
    if not found:
        return ""
    topic = found.group(1)
    topic = re.sub(r"\b(en google docs?|google docs?|en formato apa|formato apa|apa|en un documento|documento)\b", " ", topic, flags=re.I)
    topic = re.sub(rf"^(?:{_TIPOS})\s+(?:de|del|sobre\s+)?", "", topic.strip(), flags=re.I)
    topic = re.sub(r"^(de|del)\s+", "", topic.strip(), flags=re.I)
    return re.sub(r"\s+", " ", topic).strip(" .,")


def _apa_person(name: str) -> str:
    # ponytail: el apellido es la última palabra. Se parte si la persona tiene dos apellidos sin guion.
    parts = [p for p in name.replace("‐", "-").split() if p]
    if not parts:
        return name
    surname = parts[-1].rstrip(".")
    initials = [p[0].upper() + "." for p in parts[:-1]]
    return f"{surname}, {' '.join(initials)}" if initials else surname


def _apa_authors(names: list[str]) -> str:
    people = [_apa_person(n) for n in names[:7]]
    if len(names) > 7:
        people.append("et al.")
    if not people:
        return "Autor"
    if len(people) == 1:
        return people[0]
    return ", ".join(people[:-1]) + " y " + people[-1]


def _surname(name: str) -> str:
    parts = name.split()
    return parts[-1].rstrip(".") if parts else "Autor"


def _in_text(names: list[str], year: int) -> str:
    if len(names) >= 3:
        return f"({_surname(names[0])} et al., {year})"
    if len(names) == 2:
        return f"({_surname(names[0])} y {_surname(names[1])}, {year})"
    if names:
        return f"({_surname(names[0])}, {year})"
    return f"(Autor, {year})"


def _apa_reference(names: list[str], year: int, title: str, venue: str, doi: str, volume: str, issue: str, pages: str) -> str:
    head = f"{_apa_authors(names)} ({year}). {title.rstrip('.')}."
    place = venue
    if volume:
        place += f", {volume}" + (f"({issue})" if issue else "")
    if pages:
        place += f", {pages}"
    if place:
        head += f" {place}."
    if doi:
        head += " " + (doi if doi.startswith("http") else "https://doi.org/" + doi)
    return head


def _plain_abstract(index: dict | None) -> str:
    if not index:
        return ""
    slots: dict[int, str] = {}
    for word, positions in index.items():
        for pos in positions:
            slots[int(pos)] = word
    if not slots:
        return ""
    return " ".join(slots[i] for i in range(max(slots) + 1) if i in slots)


_BANNED = {"introducción", "introduccion", "desarrollo", "conclusión", "conclusion", "referencias"}
_PLANTILLA = ROOT / "plantilla_utech.docx"


def _xml_text(text: str) -> str:
    clean = "".join(ch for ch in text if ch in "\t\n" or ord(ch) >= 32)
    return clean.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _is_banned(line: str) -> bool:
    norm = re.sub(r"^\d+[\).\s]+", "", line).casefold().strip(" .:#")
    return norm in _BANNED


def _essay_blocks(text: str) -> list[tuple[str, str]]:
    out = []
    for chunk in re.split(r"\n\s*\n", text.strip()):
        lines = []
        for raw in chunk.splitlines():
            line = re.sub(r"^#+\s*", "", raw.strip())
            line = line.replace("**", "").replace("__", "")
            line = " ".join(line.split())
            if line and not _is_banned(line):
                lines.append(line)
        if not lines:
            continue
        buf: list[str] = []
        for line in lines:
            head = len(line) < 80 and line[-1:] not in ".!?" and not line.startswith("(")
            if head and not buf:
                out.append(("h", line))
            else:
                buf.append(line)
        if buf:
            out.append(("p", " ".join(buf)))
    return out


def _set_para_text(paragraph: str, text: str) -> str:
    safe = _xml_text(text)
    seen = {"n": 0}

    def repl(match):
        seen["n"] += 1
        return match.group(1) + (safe if seen["n"] == 1 else "") + match.group(3)

    out = re.sub(r"(<w:t(?:\s[^>]*)?>)(.*?)(</w:t>)", repl, paragraph, flags=re.S)
    if seen["n"] == 0 and text:
        out = paragraph.replace("</w:p>", f'<w:r><w:t xml:space="preserve">{safe}</w:t></w:r></w:p>', 1)
    return out


def _apa_p(text: str, kind: str) -> str:
    fonts = '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
    size = '<w:sz w:val="24"/><w:szCs w:val="24"/>'
    if kind == "h":
        ppr = '<w:pPr><w:spacing w:before="240" w:after="0" w:line="480" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>'
        rpr = f"<w:rPr>{fonts}<w:b/>{size}</w:rPr>"
    elif kind == "ref":
        ppr = '<w:pPr><w:spacing w:after="0" w:line="480" w:lineRule="auto"/><w:ind w:left="720" w:hanging="720"/><w:jc w:val="left"/></w:pPr>'
        rpr = f"<w:rPr>{fonts}{size}</w:rPr>"
    else:
        ppr = '<w:pPr><w:spacing w:after="0" w:line="480" w:lineRule="auto"/><w:ind w:firstLine="720"/><w:jc w:val="both"/></w:pPr>'
        rpr = f"<w:rPr>{fonts}{size}</w:rPr>"
    return f'<w:p>{ppr}<w:r>{rpr}<w:t xml:space="preserve">{_xml_text(text)}</w:t></w:r></w:p>'


def _cover_png(title: str, fecha: str) -> bytes:
    import io
    import zipfile
    from PIL import Image, ImageDraw, ImageFont

    with zipfile.ZipFile(_PLANTILLA) as zf:
        bg = Image.open(io.BytesIO(zf.read("word/media/image2.png"))).convert("RGBA")
        logo = Image.open(io.BytesIO(zf.read("word/media/image3.png"))).convert("RGBA")
        stripe = Image.open(io.BytesIO(zf.read("word/media/image1.png"))).convert("RGBA")
    w, _h = bg.size
    ppi = w / 8.5

    def tw(n: int) -> int:
        return round(n / 1440 * ppi)

    def pt(n: int) -> int:
        return max(1, round(n * ppi / 72))

    def wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
        lines: list[str] = []
        cur = ""
        for word in text.split():
            trial = f"{cur} {word}".strip()
            if draw.textlength(trial, font=font) <= max_w:
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                cur = word
        if cur:
            lines.append(cur)
        return lines or [text]

    canvas = bg.copy()
    draw = ImageDraw.Draw(canvas)
    y = tw(1440 + 1240)
    lw, lh = round(3.94 * ppi), round(0.80 * ppi)
    logo = logo.resize((lw, lh), Image.Resampling.LANCZOS)
    canvas.alpha_composite(logo, ((w - lw) // 2, y))
    y += lh + tw(1680)
    max_w = w - tw(2880)
    size = 36
    font = ImageFont.truetype(r"C:\Windows\Fonts\calibrib.ttf", pt(size))
    lines = wrap(draw, title, font, max_w)
    while len(lines) > 3 and size > 20:
        size -= 2
        font = ImageFont.truetype(r"C:\Windows\Fonts\calibrib.ttf", pt(size))
        lines = wrap(draw, title, font, max_w)
    for line in lines:
        box = draw.textbbox((0, 0), line, font=font)
        draw.text(((w - (box[2] - box[0])) / 2, y), line, font=font, fill=(0x1E, 0x3A, 0x35))
        y += pt(size) + 8
    y += tw(280)
    sw, sh = round(1.26 * ppi), round(0.14 * ppi)
    stripe = stripe.resize((sw, sh), Image.Resampling.LANCZOS)
    canvas.alpha_composite(stripe, ((w - sw) // 2, y))
    y += sh + tw(1440)
    label = ImageFont.truetype(r"C:\Windows\Fonts\calibrib.ttf", pt(11))
    datef = ImageFont.truetype(r"C:\Windows\Fonts\calibrib.ttf", pt(12))

    def center(text: str, font: ImageFont.FreeTypeFont, fill: tuple[int, int, int]) -> None:
        nonlocal y
        box = draw.textbbox((0, 0), text, font=font)
        draw.text(((w - (box[2] - box[0])) / 2, y), text, font=font, fill=fill)
        y += (box[3] - box[1]) + 8

    center("INTEGRANTES", label, (0x00, 0xAA, 0x8A))
    y += pt(14) * 2
    y += tw(440)
    center("MATERIA", label, (0x00, 0xAA, 0x8A))
    y += pt(14)
    y += tw(440)
    center("MAESTRA", label, (0x00, 0xAA, 0x8A))
    y += pt(14) + tw(920)
    center(fecha, datef, (0x5F, 0x6B, 0x69))
    out = io.BytesIO()
    canvas.convert("RGB").save(out, format="PNG", optimize=True)
    return out.getvalue()


def _cover_drawing() -> str:
    # ponytail: 6.5 x 8.41 in cabe en el margen de 1 in de Google Docs. Sangrado a la orilla pide márgenes 0.
    cx, cy = 5943600, 7691718
    return (
        '<w:p><w:pPr><w:jc w:val="center"/>'
        '<w:spacing w:before="400" w:after="0" w:line="20" w:lineRule="exact"/>'
        '<w:rPr><w:sz w:val="2"/></w:rPr></w:pPr>'
        '<w:r><w:rPr><w:sz w:val="2"/><w:szCs w:val="2"/></w:rPr><w:drawing>'
        '<wp:inline distT="0" distB="0" distL="0" distR="0">'
        f'<wp:extent cx="{cx}" cy="{cy}"/>'
        '<wp:effectExtent l="0" t="0" r="0" b="0"/>'
        '<wp:docPr id="20" name="portada.png"/>'
        '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>'
        '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
        '<pic:pic><pic:nvPicPr><pic:cNvPr id="20" name="portada.png"/><pic:cNvPicPr/></pic:nvPicPr>'
        '<pic:blipFill><a:blip r:embed="rId20"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
        f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
        '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic>'
        '</a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>'
        '<w:p><w:pPr><w:sectPr><w:type w:val="nextPage"/>'
        '<w:pgSz w:w="12240" w:h="15840" w:orient="portrait"/>'
        '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="0" w:footer="0" w:gutter="0"/>'
        '</w:sectPr></w:pPr></w:p>'
    )


def _utech_docx(topic: str, body: str, sources: list[dict], when: datetime.date, dest: Path | None = None) -> Path:
    import zipfile
    if not _PLANTILLA.exists():
        raise RuntimeError("No está la plantilla de la Utech.")
    title = topic[:1].upper() + topic[1:] if topic else "Ensayo"
    fecha = f"{when.day} de {_MESES[when.month - 1]} de {when.year}"
    png = _cover_png(title, fecha)
    with zipfile.ZipFile(_PLANTILLA) as zin:
        xml = zin.read("word/document.xml").decode("utf-8")
        mark = re.search(r"(<w:body>)(.*?)(<w:sectPr)", xml, flags=re.S)
        if not mark:
            raise RuntimeError("La plantilla no tiene cuerpo.")
        parts = [_cover_drawing()]
        parts.extend(_apa_p(text, kind) for kind, text in _essay_blocks(body))
        parts.append(_apa_p("Referencias", "h"))
        parts.extend(_apa_p(s["ref"], "ref") for s in sources)
        xml = xml[:mark.start(2)] + "".join(parts) + xml[mark.end(2):]
        folder = dest.parent if dest else _user_dir("desktop")
        folder.mkdir(parents=True, exist_ok=True)
        path = dest or (folder / f"ensayo-{_essay_slug(topic)}.docx")
        if dest is None and path.exists():
            path = folder / f"ensayo-{_essay_slug(topic)}-{time.strftime('%H%M%S')}.docx"
        rels = "word/_rels/document.xml.rels"
        with zipfile.ZipFile(path, "w") as zout:
            for item in zin.infolist():
                if item.filename == "word/document.xml":
                    data = xml.encode("utf-8")
                elif item.filename == rels:
                    data = zin.read(item.filename).decode("utf-8").replace(
                        "</Relationships>",
                        '<Relationship Id="rId20" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/cover.png"/></Relationships>',
                    ).encode("utf-8")
                else:
                    data = zin.read(item.filename)
                zout.writestr(item, data)
            zout.writestr("word/media/cover.png", png)
    return path


def _essay_slug(topic: str) -> str:
    text = topic.casefold().translate(str.maketrans("áéíóúüñ", "aeiouun"))
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return (text or "ensayo")[:40]


def _paper_sources(topic: str) -> list[dict]:
    query = re.sub(r"^(?:el|la|los|las|un|una)\s+", "", topic.strip(), flags=re.I)
    url = "https://api.openalex.org/works?" + urllib.parse.urlencode({
        "search": query,
        "per-page": "5",
        "filter": "type:article,has_doi:true,has_abstract:true",
        "sort": "relevance_score:desc",
    })
    req = urllib.request.Request(url, headers={"User-Agent": "Lumina/1.0 (ensayo local)"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode())
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError("No pude consultar artículos académicos.") from exc
    sources = []
    for work in data.get("results") or []:
        names = [a.get("author", {}).get("display_name", "") for a in work.get("authorships") or []]
        names = [n for n in names if n]
        year = work.get("publication_year")
        title = (work.get("display_name") or "").strip()
        if not names or not year or not title:
            continue
        venue = (((work.get("primary_location") or {}).get("source") or {}).get("display_name") or "").strip()
        biblio = work.get("biblio") or {}
        pages = ""
        if biblio.get("first_page") and biblio.get("last_page"):
            pages = f"{biblio['first_page']}-{biblio['last_page']}"
        elif biblio.get("first_page"):
            pages = str(biblio["first_page"])
        sources.append({
            "title": title,
            "extract": _plain_abstract(work.get("abstract_inverted_index"))[:900],
            "cite": _in_text(names, int(year)),
            "ref": _apa_reference(
                names, int(year), title, venue, work.get("doi") or "",
                str(biblio.get("volume") or ""), str(biblio.get("issue") or ""), pages,
            ),
        })
    if not sources:
        raise RuntimeError(f"No encontré artículos académicos sobre {query}.")
    return sources


def _ollama(system: str, prompt: str, predict: int) -> str:
    url = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/chat")
    model = os.environ.get("OLLAMA_MODEL", "llama3.2:1b")
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "stream": False,
        "options": {"num_ctx": 8192, "num_predict": predict},
    }
    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=300) as resp:
            data = json.loads(resp.read().decode())
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return ""
    return ((data.get("message") or {}).get("content") or "").strip()


def _draft_essay(topic: str, sources: list[dict], kind: str = "") -> tuple[str, bool]:
    facts = "\n".join(f"{s['cite']} {s['title']}. {s['extract']}" for s in sources)
    cites = " ".join(s["cite"] for s in sources)
    tipo = f" El enfoque es {kind}." if kind else ""
    prompt = (
        f"Escribe en español un reporte académico largo sobre {topic}.{tipo} "
        "Cinco apartados. Cada apartado: el título solo en su línea y luego dos o tres párrafos de varias oraciones. "
        "No uses los títulos Introducción, Desarrollo ni Conclusión. "
        f"Cita en el texto solo con estas formas: {cites}. "
        "No inventes autores, libros, fechas ni cifras. No escribas portada ni referencias.\n\n"
        + facts
    )
    system = "Redactas reportes de estudiante en español, extensos y claros. No inventas fuentes."
    text = re.split(r"\n\s*referencias\s*\n", _ollama(system, prompt, 3500), maxsplit=1, flags=re.I)[0].strip()
    if len(text) < 2500:
        more = _ollama(
            system,
            "Amplía este reporte. Conserva cada título en su propia línea. "
            "En cada apartado agrega un párrafo nuevo de varias oraciones. "
            f"Usa solo estas citas: {cites}. No inventes datos. No escribas portada ni referencias.\n\n" + text,
            2500,
        )
        more = re.split(r"\n\s*referencias\s*\n", more, maxsplit=1, flags=re.I)[0].strip()
        if len(more) > len(text):
            text = more
    if len(text) >= 1000:
        return text, True
    parts = []
    for source in sources:
        parts.append(source["title"])
        parts.append(f"{source['cite']} {source['extract']}")
    return "\n\n".join(parts), False


def _logo_b64() -> str:
    import zipfile
    with zipfile.ZipFile(_PLANTILLA) as zin:
        return base64.b64encode(zin.read("word/media/image3.png")).decode()


def _essay_html(topic: str, body: str, sources: list[dict], when: datetime.date) -> str:
    title = _xml_text(topic[:1].upper() + topic[1:] if topic else "Ensayo")
    fecha = _xml_text(f"{when.day} de {_MESES[when.month - 1]} de {when.year}")
    apa = "font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:2"
    cover = "font-family:Calibri,sans-serif;text-align:center;color:#1e3a35"
    bars = (
        '<table style="width:100%;border-collapse:collapse">'
        '<tr><td style="background:#1a6b66;height:18px">&nbsp;</td></tr>'
        '<tr><td style="background:#c6a15b;height:8px">&nbsp;</td></tr>'
        '<tr><td style="background:#9e2a2b;height:6px">&nbsp;</td></tr>'
        "</table>"
    )
    parts = [
        bars,
        f'<p style="text-align:center"><img src="data:image/png;base64,{_logo_b64()}" width="240"></p>',
        f'<p style="{cover};font-size:28pt"><b>{title}</b></p>',
        f'<p style="{cover}"><b>INTEGRANTES</b></p><p style="{cover}">&nbsp;</p><p style="{cover}">&nbsp;</p>',
        f'<p style="{cover}"><b>MATERIA</b></p><p style="{cover}">&nbsp;</p>',
        f'<p style="{cover}"><b>MAESTRA</b></p><p style="{cover}">&nbsp;</p>',
        f'<p style="{cover}"><b>{fecha}</b></p>',
        '<p style="page-break-before:always">&nbsp;</p>',
    ]
    for kind, text in _essay_blocks(body):
        safe = _xml_text(text)
        if kind == "h":
            parts.append(f'<p style="{apa};text-align:center"><b>{safe}</b></p>')
        else:
            parts.append(f'<p style="{apa};text-align:justify;text-indent:0.5in">{safe}</p>')
    parts.append(f'<p style="{apa};text-align:center"><b>Referencias</b></p>')
    for source in sources:
        parts.append(f'<p style="{apa};margin-left:0.5in;text-indent:-0.5in">{_xml_text(source["ref"])}</p>')
    parts.append(bars)
    return "".join(parts)


def _essay_plain(topic: str, body: str, sources: list[dict], when: datetime.date) -> str:
    title = topic[:1].upper() + topic[1:] if topic else "Ensayo"
    fecha = f"{when.day} de {_MESES[when.month - 1]} de {when.year}"
    lines = [title, "", "INTEGRANTES", "", "", "MATERIA", "", "MAESTRA", "", fecha, ""]
    lines.extend(text for _kind, text in _essay_blocks(body))
    lines.extend(["", "Referencias", ""])
    lines.extend(s["ref"] for s in sources)
    return "\n".join(lines).strip() + "\n"


def _cf_html(fragment: str) -> str:
    head = "Version:0.9\r\nStartHTML:{:08d}\r\nEndHTML:{:08d}\r\nStartFragment:{:08d}\r\nEndFragment:{:08d}\r\n"
    html = "<html>\r\n<body>\r\n<!--StartFragment-->" + fragment + "<!--EndFragment-->\r\n</body>\r\n</html>"
    dummy = head.format(0, 0, 0, 0)
    start_html = len(dummy.encode("utf-8"))
    raw = html.encode("utf-8")
    start_frag = start_html + raw.find(b"<!--StartFragment-->") + len(b"<!--StartFragment-->")
    end_frag = start_html + raw.find(b"<!--EndFragment-->")
    return head.format(start_html, start_html + len(raw), start_frag, end_frag) + html


_DOCS_PS = r"""
param([Parameter(Mandatory=$true)][ValidateSet('open','paste')][string]$Mode)
$ErrorActionPreference = 'Stop'
$edge = ${env:ProgramFiles(x86)} + '\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path $edge)) { $edge = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe" }
function Get-Edges {
  @(Get-Process msedge -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | ForEach-Object {
    [pscustomobject]@{ H = [int64]$_.MainWindowHandle; T = [string]$_.MainWindowTitle; P = $_.Id }
  })
}
if ($Mode -eq 'open') {
  $prior = @{}
  foreach ($w in (Get-Edges)) { $prior[$w.H] = $w.T }
  Start-Process $edge -ArgumentList '--app=https://docs.new'
  $hit = $null
  $deadline = (Get-Date).AddSeconds(20)
  while ((Get-Date) -lt $deadline) {
    $fresh = $null
    $changed = $null
    foreach ($w in (Get-Edges)) {
      if (-not $prior.ContainsKey($w.H)) { $fresh = $w; break }
      if ($prior[$w.H] -ne $w.T -and $w.T -match 'Google Docs|Documentos de Google') { $changed = $w }
    }
    if ($fresh) { $hit = $fresh; break }
    if ($changed) { $hit = $changed; break }
    Start-Sleep -Milliseconds 300
  }
  if (-not $hit) { exit 2 }
  Set-Content -Encoding ascii (Join-Path $env:TEMP 'lumina-docs-hwnd.txt') ([string]$hit.H)
  exit 0
}
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class LuminaDoc {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, uint d, int e);
  [DllImport("user32.dll")] public static extern void keybd_event(byte k, byte s, uint f, int e);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint a, uint b, bool attach);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
  [DllImport("user32.dll")] public static extern void SwitchToThisWindow(IntPtr h, bool alt);
  [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
  [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SystemParametersInfo(uint a, uint p, IntPtr v, uint f);
  [DllImport("user32.dll")] public static extern bool GetCursorPos(out POINT p);
  [DllImport("user32.dll")] public static extern IntPtr MonitorFromPoint(POINT p, uint flags);
  [DllImport("user32.dll", CharSet=CharSet.Auto)] public static extern bool GetMonitorInfo(IntPtr m, ref MONITORINFO i);
  [DllImport("user32.dll")] public static extern int GetSystemMetrics(int i);
  public struct RECT { public int Left, Top, Right, Bottom; }
  public struct POINT { public int X, Y; }
  public struct MONITORINFO { public int cbSize; public RECT rcMonitor, rcWork; public uint dwFlags; }
  public static int X, Y, W, H;
  public static void Awake() { SetProcessDPIAware(); }
  public static uint Pid(IntPtr h) { uint pid; GetWindowThreadProcessId(h, out pid); return pid; }
  public static readonly IntPtr Top = new IntPtr(-1);
  public static readonly IntPtr NoTop = new IntPtr(-2);
  public static void Cover(IntPtr hwnd) {
    SystemParametersInfo(0x2001, 0, IntPtr.Zero, 2);
    POINT pt; GetCursorPos(out pt);
    MONITORINFO mi = new MONITORINFO();
    mi.cbSize = System.Runtime.InteropServices.Marshal.SizeOf(typeof(MONITORINFO));
    if (GetMonitorInfo(MonitorFromPoint(pt, 2), ref mi)) {
      X = mi.rcMonitor.Left; Y = mi.rcMonitor.Top;
      W = mi.rcMonitor.Right - X; H = mi.rcMonitor.Bottom - Y;
    } else { X = 0; Y = 0; W = GetSystemMetrics(0); H = GetSystemMetrics(1); }
    ShowWindow(hwnd, 9);
    SetWindowPos(hwnd, Top, X, Y, W, H, 0x0040);
    Force(hwnd);
  }
  public static void Uncover(IntPtr hwnd) {
    SetWindowPos(hwnd, NoTop, 0, 0, 0, 0, 0x0001 | 0x0002 | 0x0040);
  }
  public static void Force(IntPtr hwnd) {
    uint pid;
    IntPtr fg = GetForegroundWindow();
    uint fgThread = GetWindowThreadProcessId(fg, out pid);
    uint tgThread = GetWindowThreadProcessId(hwnd, out pid);
    uint me = GetCurrentThreadId();
    AttachThreadInput(me, fgThread, true);
    AttachThreadInput(me, tgThread, true);
    keybd_event(0x12, 0, 0, 0);
    SetWindowPos(hwnd, Top, X, Y, W, H, 0x0040);
    BringWindowToTop(hwnd);
    SwitchToThisWindow(hwnd, true);
    SetForegroundWindow(hwnd);
    keybd_event(0x12, 0, 2, 0);
    SetWindowPos(hwnd, Top, X, Y, W, H, 0x0040);
    AttachThreadInput(me, tgThread, false);
    AttachThreadInput(me, fgThread, false);
  }
}
'@
$want = 0L
if ($env:LUMINA_DOC_HWND) { $want = [int64]$env:LUMINA_DOC_HWND }
$hit = $null
$deadline = (Get-Date).AddSeconds(25)
while ((Get-Date) -lt $deadline) {
  $saved = $null
  $named = $null
  foreach ($w in (Get-Edges)) {
    if ($want -and $w.H -eq $want) {
      if ($w.T -match 'Cuentas de Google|Iniciar sesi|Sign in') { exit 3 }
      $saved = $w
    }
    if ($w.T -match 'Google Docs|Documentos de Google') { $named = $w }
  }
  if ($named) { $hit = $named; break }
  if ($saved) { $hit = $saved; break }
  Start-Sleep -Milliseconds 400
}
if (-not $hit) { exit 2 }
$word = $null
$doc = $null
$startedWord = -not (Get-Process WINWORD -ErrorAction SilentlyContinue)
if ($env:LUMINA_ESSAY_DOCX) {
  $word = New-Object -ComObject Word.Application
  if ($startedWord) { $word.Visible = $false }
  $word.DisplayAlerts = 0
  $doc = $word.Documents.Open($env:LUMINA_ESSAY_DOCX)
  $doc.Content.Copy()
  Start-Sleep -Milliseconds 400
} else {
  $text = Get-Content -Raw -Encoding UTF8 $env:LUMINA_ESSAY
  $html = Get-Content -Raw -Encoding UTF8 $env:LUMINA_ESSAY_HTML
  $clip = New-Object System.Windows.Forms.DataObject
  $clip.SetData([System.Windows.Forms.DataFormats]::UnicodeText, $text)
  $clip.SetData([System.Windows.Forms.DataFormats]::Html, $html)
  [System.Windows.Forms.Clipboard]::SetDataObject($clip, $true)
}
[LuminaDoc]::Awake()
$hwnd = [IntPtr]$hit.H
$ws = New-Object -ComObject WScript.Shell
$focused = $false
for ($i = 0; $i -lt 12; $i++) {
  [LuminaDoc]::Cover($hwnd)
  $ws.AppActivate($hit.P) | Out-Null
  Start-Sleep -Milliseconds 180
  $rect = New-Object LuminaDoc+RECT
  [LuminaDoc]::GetWindowRect($hwnd, [ref]$rect) | Out-Null
  $x = [int](($rect.Left + $rect.Right) / 2)
  $y = [int]($rect.Top + ($rect.Bottom - $rect.Top) * 0.62)
  [LuminaDoc]::SetCursorPos($x, $y) | Out-Null
  Start-Sleep -Milliseconds 60
  [LuminaDoc]::mouse_event(2, 0, 0, 0, 0)
  [LuminaDoc]::mouse_event(4, 0, 0, 0, 0)
  Start-Sleep -Milliseconds 180
  $fg = [LuminaDoc]::GetForegroundWindow()
  $proc = Get-Process -Id ([LuminaDoc]::Pid($fg)) -ErrorAction SilentlyContinue
  if ($proc -and $proc.ProcessName -eq 'msedge') { $focused = $true; break }
}
if ($focused) {
  for ($n = 0; $n -lt 8; $n++) {
    $title = ''
    try { $title = (Get-Process -Id $hit.P -ErrorAction Stop).MainWindowTitle } catch {}
    if ($title -match 'Google Docs|Documentos de Google') { break }
    [LuminaDoc]::keybd_event(0x11, 0, 0, 0)
    [LuminaDoc]::keybd_event(0x09, 0, 0, 0)
    [LuminaDoc]::keybd_event(0x09, 0, 2, 0)
    [LuminaDoc]::keybd_event(0x11, 0, 2, 0)
    Start-Sleep -Milliseconds 160
  }
  $rect = New-Object LuminaDoc+RECT
  [LuminaDoc]::GetWindowRect($hwnd, [ref]$rect) | Out-Null
  [LuminaDoc]::SetCursorPos([int](($rect.Left + $rect.Right) / 2), [int]($rect.Top + ($rect.Bottom - $rect.Top) * 0.62)) | Out-Null
  Start-Sleep -Milliseconds 80
  [LuminaDoc]::mouse_event(2, 0, 0, 0, 0)
  [LuminaDoc]::mouse_event(4, 0, 0, 0, 0)
  Start-Sleep -Milliseconds 200
  [LuminaDoc]::keybd_event(0x11, 0, 0, 0)
  [LuminaDoc]::keybd_event(0x41, 0, 0, 0)
  [LuminaDoc]::keybd_event(0x41, 0, 2, 0)
  [LuminaDoc]::keybd_event(0x11, 0, 2, 0)
  Start-Sleep -Milliseconds 150
  [LuminaDoc]::keybd_event(0x11, 0, 0, 0)
  [LuminaDoc]::keybd_event(0x56, 0, 0, 0)
  [LuminaDoc]::keybd_event(0x56, 0, 2, 0)
  [LuminaDoc]::keybd_event(0x11, 0, 2, 0)
  Start-Sleep -Milliseconds 300
  [LuminaDoc]::Uncover($hwnd)
  if ($doc) { $doc.Close($false) | Out-Null }
  if ($word -and $startedWord) { $word.Quit() }
  exit 0
}
if ($doc) { $doc.Close($false) | Out-Null }
if ($word -and $startedWord) { $word.Quit() }
exit 4
"""


def _docs_ps(mode: str, text: str = "", html: str = "", docx: str = "") -> int:
    folder = Path(tempfile.gettempdir())
    script = folder / "lumina-docs.ps1"
    script.write_text(_DOCS_PS, encoding="utf-8-sig")
    env = os.environ.copy()
    if text:
        essay = folder / "lumina-essay.txt"
        essay.write_text(text, encoding="utf-8-sig")
        env["LUMINA_ESSAY"] = str(essay)
    if html:
        styled = folder / "lumina-essay.html"
        styled.write_text(html, encoding="utf-8-sig")
        env["LUMINA_ESSAY_HTML"] = str(styled)
    if docx:
        env["LUMINA_ESSAY_DOCX"] = docx
    if mode == "paste":
        hwnd = folder / "lumina-docs-hwnd.txt"
        if not hwnd.exists():
            return 2
        env["LUMINA_DOC_HWND"] = hwnd.read_text(encoding="ascii").strip()
    done = subprocess.run(
        ["powershell", "-NoProfile", "-STA", "-File", str(script), mode],
        check=False,
        env=env,
    )
    return done.returncode


def _essay_job(topic: str, kind: str = "") -> None:
    global _ESSAY_BUSY
    try:
        _essay_mark("writing", "Estoy abriendo Google Docs.")
        if _docs_ps("open") != 0:
            _essay_mark("failed", "No pude abrir Google Docs.")
            return
        _essay_mark("writing", "Estoy buscando fuentes.")
        sources = _paper_sources(topic)
        _essay_mark("writing", "Estoy redactando el reporte.")
        body, _drafted = _draft_essay(topic, sources, kind)
        when = datetime.date.today()
        dest = Path(tempfile.gettempdir()) / "lumina-ensayo.docx"
        _utech_docx(topic, body, sources, when, dest)
        _essay_finishing()
        code = _docs_ps("paste", docx=str(dest))
        logger.info("ensayo paste %s", code)
        if code != 0:
            _essay_mark("failed", "No pude pegar el reporte en el documento.")
        else:
            _essay_mark("done", "Ya pegué el reporte en Google Docs.")
    except Exception:
        logger.exception("ensayo")
        _essay_mark("failed", "El reporte se cortó antes de terminar.")
    finally:
        stuck = False
        with _lock:
            _ESSAY_BUSY = False
            stuck = _ESSAY_PHASE in ("writing", "finishing")
        if stuck:
            _essay_mark("failed", "El reporte se cortó antes de terminar.")


def _essay_mark(phase: str, text: str) -> None:
    global _ESSAY_PHASE, _ESSAY_TEXT
    with _lock:
        _ESSAY_PHASE = phase
        _ESSAY_TEXT = text


def _essay_finishing() -> None:
    global _ESSAY_PHASE, _ESSAY_READY, _ESSAY_TEXT
    with _lock:
        _ESSAY_PHASE = "finishing"
        _ESSAY_TEXT = "Ya terminé el texto. Voy a pegarlo en el documento."
        _ESSAY_READY = False
    deadline = time.time() + 18
    while time.time() < deadline:
        with _lock:
            if _ESSAY_READY:
                return
        time.sleep(0.2)


def _write_essay(topic: str, kind: str = "") -> dict:
    global _ESSAY_BUSY, _ESSAY_PHASE, _ESSAY_TEXT
    with _lock:
        if _ESSAY_BUSY:
            return {"answer": "Sigo con el reporte. Mientras, pídeme una canción.", "working": "essay"}
        _ESSAY_BUSY = True
        _ESSAY_PHASE = "writing"
        _ESSAY_TEXT = "Estoy escribiendo el reporte."
    threading.Thread(target=_essay_job, args=(topic, kind), daemon=True).start()
    return {"answer": f"Empiezo el reporte sobre {topic} en Google Docs. Mientras lo escribo, puedes pedirme música.", "working": "essay"}


def essay_busy() -> bool:
    with _lock:
        return _ESSAY_BUSY


def essay_status() -> dict:
    with _lock:
        text = _ESSAY_TEXT or "No hay ningún ensayo en curso."
        return {"busy": _ESSAY_BUSY, "phase": _ESSAY_PHASE, "text": text}


def _essay_report() -> dict:
    state = essay_status()
    out = {"answer": state["text"]}
    if state["busy"]:
        out["working"] = "essay"
    return out


def essay_mark_ready() -> None:
    global _ESSAY_READY
    with _lock:
        _ESSAY_READY = True


def _screenshot() -> dict:
    dest = _user_dir("desktop") / f"lumina-{time.strftime('%H%M%S')}.png"
    encoded = base64.b64encode(str(dest).encode()).decode()
    command = (
        "$p=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('" + encoded + "'));"
        "Add-Type -AssemblyName System.Windows.Forms;"
        "Add-Type -AssemblyName System.Drawing;"
        "$b=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds;"
        "$bmp=New-Object System.Drawing.Bitmap $b.Width,$b.Height;"
        "$g=[System.Drawing.Graphics]::FromImage($bmp);"
        "$g.CopyFromScreen($b.Location,[System.Drawing.Point]::Empty,$b.Size);"
        "$bmp.Save($p)"
    )
    subprocess.run(["powershell", "-NoProfile", "-Command", command], check=False)
    if not dest.exists():
        raise RuntimeError("No pude guardar la captura.")
    return {"answer": f"Guardé la captura {dest.name} en el escritorio.", "undo": str(dest)}


def _clip_read() -> dict:
    result = subprocess.run(["powershell", "-NoProfile", "-Command", "Get-Clipboard -Raw"], capture_output=True, text=True)
    text = (result.stdout or "").strip()
    return {"answer": text[:500] or "El portapapeles está vacío."}


def _clip_write(text: str) -> dict:
    encoded = base64.b64encode(text.encode()).decode()
    command = "$t=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('" + encoded + "')); Set-Clipboard -Value $t"
    subprocess.run(["powershell", "-NoProfile", "-Command", command], check=False)
    return {"answer": "Copiado al portapapeles."}


def _git_status() -> dict:
    status = subprocess.run(["git", "status", "-sb"], cwd=ROOT.parent, capture_output=True, text=True)
    diff = subprocess.run(["git", "diff", "--stat"], cwd=ROOT.parent, capture_output=True, text=True)
    text = ((status.stdout or "").strip() + "\n" + (diff.stdout or "").strip()).strip()
    return {"answer": text[:800] or "El repo está limpio."}


def _compare_files(left: str, right: str) -> dict:
    a = _find_user_file(left)
    b = _find_user_file(right)
    ta = a.read_text(encoding="utf-8", errors="replace").splitlines()
    tb = b.read_text(encoding="utf-8", errors="replace").splitlines()
    if ta == tb:
        return {"answer": "Son iguales."}
    limit = max(len(ta), len(tb))
    for index in range(limit):
        la = ta[index] if index < len(ta) else ""
        lb = tb[index] if index < len(tb) else ""
        if la != lb:
            return {"answer": f"Difieren en la línea {index + 1}."}
    return {"answer": "Difieren en el tamaño."}


def _find_user_file(name: str) -> Path:
    if _blocked_name(name) or ".." in name:
        raise RuntimeError("Ese archivo está bloqueado.")
    safe = _safe_name(name)
    for root in (_user_dir("desktop"), _user_dir("documents"), _user_dir("downloads"), ROOT.parent):
        candidate = root / safe
        if candidate.is_file() and _is_under(candidate, root):
            return candidate
    raise RuntimeError("No veo ese archivo en el escritorio, documentos, descargas o la raíz del proyecto.")


def _move_file(name: str, where: str) -> dict:
    source = _find_user_file(name)
    dest_root = _user_dir(where)
    dest = dest_root / source.name
    if not _is_under(dest, dest_root):
        raise RuntimeError("Ese destino no está permitido.")
    shutil.move(source, dest)
    return {"answer": f"Moví {source.name}."}


def _media(direction: str) -> dict:
    vk = {"pause": 0xB3, "next": 0xB0, "prev": 0xB1}[direction]
    _win_key(vk)
    labels = {"pause": "Pausé lo que suena en el sistema.", "next": "Siguiente.", "prev": "Anterior."}
    return {"answer": labels[direction]}


def _undo_last() -> dict:
    if not LOG_PATH.exists():
        return {"answer": "No hay nada que deshacer."}
    rec = None
    for line in reversed(LOG_PATH.read_text(encoding="utf-8").splitlines()):
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            continue
        if item.get("undo"):
            rec = item
            break
    if not rec:
        return {"answer": "Lo último no se puede deshacer."}
    path = Path(rec["undo"])
    roots = [_user_dir("desktop"), _user_dir("documents"), _user_dir("downloads")]
    if not any(_is_under(path, root) for root in roots):
        return {"answer": "Eso está fuera de las carpetas permitidas. No lo borro."}
    if path.is_dir():
        try:
            path.rmdir()
        except OSError as exc:
            raise RuntimeError("La carpeta no está vacía. No la borro.") from exc
    elif path.is_file():
        path.unlink()
    else:
        return {"answer": "Ese archivo ya no está."}
    return {"answer": f"Deshice {path.name}."}


def _user_dir(kind: str) -> Path:
    home = Path.home()
    options = {
        "desktop": [home / "Desktop", home / "Escritorio", home / "OneDrive" / "Desktop", home / "OneDrive" / "Escritorio"],
        "documents": [home / "Documents", home / "Documentos", home / "OneDrive" / "Documents", home / "OneDrive" / "Documentos"],
        "downloads": [home / "Downloads", home / "Descargas", home / "OneDrive" / "Downloads"],
    }[kind]
    for p in options:
        if p.exists():
            return p
    options[0].mkdir(parents=True, exist_ok=True)
    return options[0]


def _safe_name(name: str) -> str:
    cleaned = re.sub(r'[<>:"/\\|?*]', "", name).strip() or "nuevo"
    if ".." in cleaned or Path(cleaned).is_absolute():
        raise RuntimeError("Ese nombre de archivo no es seguro.")
    return cleaned


def _mkdir(name: str) -> dict:
    path = _user_dir("desktop") / _safe_name(name)
    path.mkdir(exist_ok=True)
    return {"answer": f"Listo, carpeta {path.name} en el escritorio.", "undo": str(path)}


def _mkfile(name: str, body: str) -> dict:
    path = _user_dir("desktop") / _safe_name(name)
    path.write_text(body or "", encoding="utf-8")
    os.startfile(path)  # noqa: S606 — el usuario lo pidió
    return {"answer": f"Guardé {path.name} en el escritorio.", "undo": str(path)}


def _allow() -> dict:
    if not ALLOW_PATH.exists():
        return {"apps": [], "folders": []}
    try:
        data = json.loads(ALLOW_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"apps": [], "folders": []}
    return data if isinstance(data, dict) else {"apps": [], "folders": []}


def _allowed_app(app: str) -> bool:
    apps = [str(a).casefold() for a in (_allow().get("apps") or [])]
    if not apps:
        return True
    return app.casefold() in apps


def _is_under(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def _open_user_dir(where: str) -> dict:
    if where == "repo":
        path = ROOT.parent
        os.startfile(path)  # noqa: S606
        return {"answer": "Abrí la carpeta del proyecto."}
    path = _user_dir(where)
    os.startfile(path)  # noqa: S606
    return {"answer": f"Abrí {path.name}."}


def _allowed_roots() -> list[Path]:
    roots = [_user_dir("desktop"), _user_dir("documents"), _user_dir("downloads"), ROOT.parent]
    for item in _allow().get("folders") or []:
        if str(item).casefold() in {"repo", "repositorio", "proyecto"}:
            continue
        p = Path(str(item))
        if ".." in p.parts or not p.is_dir():
            continue
        roots.append(p)
    return roots


def _open_path(raw: str) -> dict:
    if ".." in raw:
        raise RuntimeError("Ese camino no está permitido.")
    candidate = Path(raw.strip().strip('"'))
    roots = _allowed_roots()
    if not candidate.is_absolute():
        for root in roots:
            hit = root / candidate
            if hit.is_dir() and _is_under(hit, root):
                os.startfile(hit)  # noqa: S606
                return {"answer": f"Abrí {hit.name}."}
        raise RuntimeError("Esa carpeta no está en la lista.")
    if not candidate.is_dir() or not any(_is_under(candidate, root) for root in roots):
        raise RuntimeError("Esa carpeta no está en la lista.")
    os.startfile(candidate)  # noqa: S606
    return {"answer": f"Abrí {candidate.name}."}


def _span(seconds: int) -> str:
    if seconds % 3600 == 0:
        n = seconds // 3600
        return "1 hora" if n == 1 else f"{n} horas"
    if seconds % 60 == 0:
        n = seconds // 60
        return "1 minuto" if n == 1 else f"{n} minutos"
    return f"{seconds} segundos"


def _start_timer(seconds: int) -> dict:
    if seconds < 1 or seconds > 12 * 3600:
        raise RuntimeError("Dime un tiempo entre 1 segundo y 12 horas.")

    def fire() -> None:
        ctypes.windll.user32.MessageBoxW(0, "Se acabó el tiempo.", "Lumina", 0x00040040)

    timer = threading.Timer(seconds, fire)
    timer.daemon = True
    _TIMERS.append(timer)
    timer.start()
    return {"answer": f"Te aviso en {_span(seconds)}."}


def _win_key(vk: int) -> None:
    # ponytail: tecla de volumen de Windows (~2% cada una). pycaw si hace falta el porcentaje exacto.
    ctypes.windll.user32.keybd_event(vk, 0, 0, 0)
    ctypes.windll.user32.keybd_event(vk, 0, 2, 0)


def _win_volume(direction: str) -> dict:
    if direction == "mute":
        _win_key(0xAD)
        return {"answer": "Silencio."}
    vk = 0xAF if direction == "up" else 0xAE
    for _ in range(4):
        _win_key(vk)
    return {"answer": "Subí el volumen." if direction == "up" else "Bajé el volumen."}


_DIAS = ("lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo")
_MESES = ("enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre")


def _clock(what: str) -> dict:
    now = datetime.datetime.now()
    if what == "date":
        return {"answer": f"Hoy es {_DIAS[now.weekday()]} {now.day} de {_MESES[now.month - 1]}."}
    return {"answer": now.strftime("Son las %H:%M.")}


_MATH_OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv}


def _math_answer(text: str) -> str:
    expr = text.casefold().replace("por", "*").replace("entre", "/").replace("más", "+").replace("mas", "+").replace("menos", "-").replace(",", ".")
    expr = re.sub(r"[^0-9+\-*/().\s]", "", expr)
    try:
        tree = ast.parse(expr, mode="eval")
    except SyntaxError as exc:
        raise RuntimeError("Esa cuenta no la entendí.") from exc

    def ev(node: ast.AST) -> float:
        if isinstance(node, ast.Expression):
            return ev(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.UAdd, ast.USub)):
            value = ev(node.operand)
            return value if isinstance(node.op, ast.UAdd) else -value
        if isinstance(node, ast.BinOp) and type(node.op) in _MATH_OPS:
            return _MATH_OPS[type(node.op)](ev(node.left), ev(node.right))
        raise RuntimeError("Solo sumas, restas, multiplicaciones y divisiones.")

    try:
        value = ev(tree)
    except ZeroDivisionError as exc:
        raise RuntimeError("No divido entre cero.") from exc
    shown = str(int(value)) if isinstance(value, float) and value.is_integer() else f"{value:.4g}"
    return shown


_UNITS = {
    "km": ("m", 1000), "kilometro": ("m", 1000), "kilometros": ("m", 1000),
    "metro": ("m", 1), "metros": ("m", 1),
    "milla": ("m", 1609.344), "millas": ("m", 1609.344),
    "pie": ("m", 0.3048), "pies": ("m", 0.3048),
    "kg": ("g", 1000), "kilo": ("g", 1000), "kilos": ("g", 1000), "kilogramo": ("g", 1000), "kilogramos": ("g", 1000),
    "gramo": ("g", 1), "gramos": ("g", 1),
    "libra": ("g", 453.592), "libras": ("g", 453.592),
    "celsius": ("t", "c"), "grado": ("t", "c"), "grados": ("t", "c"),
    "fahrenheit": ("t", "f"),
}


def _unit_key(name: str) -> str:
    return name.casefold().replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")


def _convert_answer(text: str) -> str:
    found = re.search(r"([\d.,]+)\s+([a-zA-Záéíóúñ]+)\s+a\s+([a-zA-Záéíóúñ]+)", text, re.I)
    if not found:
        raise RuntimeError("Dime algo como: convierte 5 kilómetros a millas.")
    value = float(found.group(1).replace(",", "."))
    src, dst = _UNITS.get(_unit_key(found.group(2))), _UNITS.get(_unit_key(found.group(3)))
    if not src or not dst or src[0] != dst[0]:
        raise RuntimeError("Esas unidades no las convierto entre sí.")
    if src[0] == "t":
        celsius = value if src[1] == "c" else (value - 32) * 5 / 9
        out = celsius if dst[1] == "c" else celsius * 9 / 5 + 32
    else:
        out = value * src[1] / dst[1]
    shown = f"{out:.4g}"
    return f"{shown} {found.group(3)}."


_CITIES = {
    "tokio": "Asia/Tokyo", "tokyo": "Asia/Tokyo",
    "nueva york": "America/New_York", "londres": "Europe/London",
    "madrid": "Europe/Madrid", "mexico": "America/Mexico_City", "méxico": "America/Mexico_City",
    "paris": "Europe/Paris", "parís": "Europe/Paris",
    "berlin": "Europe/Berlin", "berlín": "Europe/Berlin",
    "sidney": "Australia/Sydney", "sídney": "Australia/Sydney",
}


def _zone_time(city: str) -> dict:
    from zoneinfo import ZoneInfo
    key = city.casefold().strip()
    name = _CITIES.get(key)
    if not name:
        raise RuntimeError("Sé Tokio, Nueva York, Londres, Madrid, México, París, Berlín y Sídney.")
    now = datetime.datetime.now(ZoneInfo(name))
    return {"answer": f"En {city} son las {now.strftime('%H:%M')}."}


def _seconds_until(text: str) -> int:
    found = re.search(r"(\d{1,2})(?::(\d{2}))?", text)
    if not found:
        raise RuntimeError("Dime la hora, por ejemplo 20:30.")
    hour, minute = int(found.group(1)), int(found.group(2) or 0)
    if re.search(r"tarde|noche", text, re.I) and hour < 12:
        hour += 12
    if hour > 23 or minute > 59:
        raise RuntimeError("Esa hora no existe.")
    now = datetime.datetime.now()
    target = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if target <= now:
        target += datetime.timedelta(days=1)
    seconds = int((target - now).total_seconds())
    if seconds > 12 * 3600:
        raise RuntimeError("Solo aviso dentro de las próximas 12 horas.")
    return seconds


def _battery_percent() -> int:
    class Power(ctypes.Structure):
        _fields_ = [
            ("ac", ctypes.c_byte), ("flag", ctypes.c_byte), ("percent", ctypes.c_byte),
            ("reserved", ctypes.c_byte), ("life", ctypes.c_ulong), ("full", ctypes.c_ulong),
        ]
    status = Power()
    ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(status))
    return int(status.percent)


def _pulse() -> dict:
    remembered = _mem()
    extra = f" Recuerdo: {remembered[-1]}." if remembered else ""
    return {"answer": _clock("time")["answer"] + " " + _machine()["answer"] + extra}


def _watch_battery(limit: int) -> dict:
    if not 1 <= limit <= 100:
        raise RuntimeError("Dime un porcentaje entre 1 y 100.")
    if _battery_percent() == 255:
        raise RuntimeError("Esta PC no reporta batería.")

    def check() -> None:
        percent = _battery_percent()
        if percent != 255 and percent <= limit:
            ctypes.windll.user32.MessageBoxW(0, f"La batería está en {percent}%.", "Lumina", 0x00040040)
            return
        timer = threading.Timer(60, check)
        timer.daemon = True
        _TIMERS.append(timer)
        timer.start()

    check()
    return {"answer": f"Vigilo la batería. Te aviso si baja de {limit}%."}


def _now_playing() -> dict:
    player = _api("GET", "/me/player") or {}
    item = player.get("item") or {}
    if not item.get("name"):
        return {"answer": "No hay nada sonando."}
    who = ", ".join(a["name"] for a in item.get("artists") or [] if a.get("name"))
    where = (player.get("device") or {}).get("name") or ""
    estado = "Suena" if player.get("is_playing") else "En pausa"
    sitio = f" en {where}" if where else ""
    de = f" de {who}" if who else ""
    return {"answer": f"{estado} {item['name']}{de}{sitio}."}


def _lock_screen() -> dict:
    subprocess.Popen(["rundll32.exe", "user32.dll,LockWorkStation"], close_fds=True)
    return {"answer": "Bloqueo la pantalla."}


def _power(mode: str) -> dict:
    flag = "/r" if mode == "restart" else "/s"
    subprocess.run(["shutdown", flag, "/t", "20"], check=False)
    verbo = "Reinicio" if mode == "restart" else "Apago"
    return {"answer": f"{verbo} la PC en 20 segundos. Di cancela el apagado si te arrepientes."}


def _abort_power() -> dict:
    subprocess.run(["shutdown", "/a"], check=False)
    return {"answer": "Cancelé el apagado."}


def _find_lnk(app: str) -> Path | None:
    needle = app.casefold()
    roots = [
        Path(os.environ.get("APPDATA", "")) / "Microsoft/Windows/Start Menu/Programs",
        Path(os.environ.get("PROGRAMDATA", r"C:\ProgramData")) / "Microsoft/Windows/Start Menu/Programs",
    ]
    hits: list[Path] = []
    for root in roots:
        if not root.exists():
            continue
        for p in root.rglob("*.lnk"):
            if needle in p.stem.casefold():
                hits.append(p)
    if not hits:
        return None
    hits.sort(key=lambda p: (len(p.stem), str(p)))
    return hits[0]


def _open_app(app: str) -> dict:
    if not _allowed_app(app):
        raise RuntimeError(f"{app} no está en la lista.")
    target = _APP_ALIAS.get(app.casefold(), app)
    lnk = None if target.endswith(":") else _find_lnk(app)
    try:
        if lnk:
            os.startfile(lnk)  # noqa: S606
        elif target.endswith(":"):
            os.startfile(target)  # noqa: S606
        else:
            subprocess.Popen(["cmd", "/c", "start", "", target], close_fds=True)
    except OSError as exc:
        raise RuntimeError(f"No pude abrir {app}.") from exc
    return {"answer": f"Abrí {app}."}


def _site(rest: str) -> str | None:
    low = rest.casefold()
    if low.startswith("youtube"):
        q = rest[7:].strip(" .,")
        return "https://www.youtube.com/results?search_query=" + urllib.parse.quote(q) if q else "https://www.youtube.com"
    if "google docs" in low or low == "docs" or "documento" in low:
        return "https://docs.new"
    if low.startswith("gmail"):
        return "https://mail.google.com"
    if low.startswith("mapas") or low.startswith("google maps"):
        q = re.sub(r"^(google maps|mapas)\s*", "", rest, flags=re.I).strip(" .,")
        return "https://www.google.com/maps/search/" + urllib.parse.quote(q) if q else "https://maps.google.com"
    return None


def _show_image(name: str) -> dict:
    needle = _safe_name(name).casefold()
    exts = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"}
    hits: list[Path] = []
    for root in (_user_dir("desktop"), _user_dir("downloads"), _user_dir("documents")):
        if not root.is_dir():
            continue
        for p in root.iterdir():
            if p.suffix.casefold() in exts and needle in p.stem.casefold():
                hits.append(p)
    if not hits:
        raise RuntimeError("No veo esa imagen en el escritorio, documentos o descargas.")
    hits.sort(key=lambda p: len(p.stem))
    os.startfile(hits[0])  # noqa: S606
    return {"answer": f"Proyecto {hits[0].name}."}


def _holo(model: str, apart: bool = False, pose: str | None = None, reveal: bool = False) -> dict:
    if model == "robot":
        bits = []
        if apart:
            bits.append("e=1")
        if pose:
            bits.append("pose=" + pose)
        if reveal:
            bits.append("reveal=1")
        query = ("?" + "&".join(bits)) if bits else ""
        _open_edge(f"http://127.0.0.1:8000/armado.html{query}")
        if reveal:
            return {"answer": "Te muestro el interior, capa por capa."}
        if pose == "armada":
            return {"answer": "Soy el carrito. Así estoy armada."}
        return {"answer": "Proyecto el robot, pieza por pieza. Arrastra para girar."}
    names = {"aether": "Aether", "agua": "el agua", "metano": "el metano", "placa": "la placa"}
    _open_edge(f"http://127.0.0.1:8000/holo.html{query}#{model}")
    return {"answer": f"Proyecto {names.get(model, model)}. Arrastra a los lados para girar y arriba o abajo para desarmar."}


def _open_edge(url: str) -> dict:
    subprocess.Popen(["cmd", "/c", "start", "", "msedge", url], close_fds=True)
    return {"answer": "Lo abrí en Edge."}


def _close_app(app: str) -> dict:
    if not _allowed_app(app):
        raise RuntimeError(f"{app} no está en la lista.")
    image = _CLOSE_IMAGE.get(app.casefold())
    if not image:
        image = app if app.lower().endswith(".exe") else f"{app}.exe"
    r = subprocess.run(["taskkill", "/IM", image, "/T"], capture_output=True, text=True, check=False)
    if r.returncode != 0:
        raise RuntimeError(f"No encontré {app} abierto.")
    return {"answer": f"Cerré {app}."}


# --- Spotify -----------------------------------------------------------------

def _creds() -> tuple[str, str]:
    cid = os.environ.get("SPOTIFY_CLIENT_ID", "").strip()
    secret = os.environ.get("SPOTIFY_CLIENT_SECRET", "").strip()
    if not cid or not secret:
        raise RuntimeError("Faltan SPOTIFY_CLIENT_ID o SPOTIFY_CLIENT_SECRET en backend/.env.")
    return cid, secret


def _b64_auth() -> str:
    cid, secret = _creds()
    return base64.b64encode(f"{cid}:{secret}".encode()).decode()


def _save_token(data: dict) -> None:
    data = dict(data)
    data["saved_at"] = time.time()
    TOKEN_PATH.write_text(json.dumps(data), encoding="utf-8")


def _load_token() -> dict | None:
    if not TOKEN_PATH.exists():
        return None
    try:
        return json.loads(TOKEN_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def _refresh(token: dict) -> dict:
    body = urllib.parse.urlencode({"grant_type": "refresh_token", "refresh_token": token["refresh_token"]}).encode()
    req = urllib.request.Request(
        "https://accounts.spotify.com/api/token",
        data=body,
        headers={"Authorization": f"Basic {_b64_auth()}", "Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        fresh = json.loads(resp.read().decode())
    if "refresh_token" not in fresh:
        fresh["refresh_token"] = token["refresh_token"]
    _save_token(fresh)
    return fresh


def _access_token() -> str:
    token = _load_token()
    if not token:
        raise RuntimeError("Spotify no está autorizado. Dime lumina autoriza Spotify y entra con tu cuenta Premium.")
    age = time.time() - float(token.get("saved_at", 0))
    if age > float(token.get("expires_in", 3600)) - 60:
        token = _refresh(token)
    return token["access_token"]


def auth_url() -> str:
    cid, _secret = _creds()
    params = urllib.parse.urlencode(
        {
            "client_id": cid,
            "response_type": "code",
            "redirect_uri": REDIRECT,
            "scope": SCOPES,
        }
    )
    return f"https://accounts.spotify.com/authorize?{params}"


def exchange_code(code: str) -> None:
    body = urllib.parse.urlencode(
        {"grant_type": "authorization_code", "code": code, "redirect_uri": REDIRECT}
    ).encode()
    req = urllib.request.Request(
        "https://accounts.spotify.com/api/token",
        data=body,
        headers={"Authorization": f"Basic {_b64_auth()}", "Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        _save_token(json.loads(resp.read().decode()))


_callback_server: HTTPServer | None = None


def start_callback_server() -> None:
    """Escucha siempre el redirect de Spotify (8888) para no depender de un GET que bloquee."""
    global _callback_server
    if _callback_server is not None:
        return
    parsed = urllib.parse.urlparse(REDIRECT)
    host, port = parsed.hostname or "127.0.0.1", parsed.port or 8888

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):  # noqa: N802
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            code = (q.get("code") or [None])[0]
            err = (q.get("error") or [None])[0]
            ok = False
            if code and not err:
                try:
                    exchange_code(code)
                    ok = True
                except Exception:
                    logger.exception("Spotify: no pude canjear el código")
            body = (
                b"<html><body style='font:20px sans-serif;padding:40px'>"
                + (b"<p>Spotify ya esta conectado. Vuelve con Lumina y dile reproduce.</p>" if ok else b"<p>No se autorizo Spotify. Intenta de nuevo.</p>")
                + b"</body></html>"
            )
            self.send_response(200 if ok else 400)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *_args):
            return

    try:
        _callback_server = HTTPServer((host, port), Handler)
    except OSError:
        logger.warning("Spotify: el puerto %s ya esta ocupado; el callback puede fallar.", port)
        return
    threading.Thread(target=_callback_server.serve_forever, daemon=True).start()
    logger.info("Spotify: esperando autorizacion en %s", REDIRECT)


def _spotify_login() -> dict:
    start_callback_server()
    webbrowser.open(auth_url())
    return {"answer": "Te abrí Spotify en el navegador. Acepta el permiso y vuelve."}


spotify_login = _spotify_login


def _json_or_empty(raw: bytes) -> dict:
    # Pause/next a veces responden 204 vacío, o 200 con un id suelto, no JSON.
    text = raw.decode(errors="replace").strip()
    if not text:
        return {}
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def _api(method: str, path: str, body: dict | None = None, query: str = "") -> dict | None:
    url = f"https://api.spotify.com/v1{path}{query}"
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Authorization": f"Bearer {_access_token()}", "Content-Type": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return _json_or_empty(resp.read())
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace")
        if exc.code == 401:
            token = _load_token()
            if token:
                _refresh(token)
                return _api(method, path, body, query)
        if exc.code == 403 and "PREMIUM_REQUIRED" in detail:
            raise RuntimeError("Spotify rechazó el control. La cuenta tiene que ser Premium.") from exc
        if exc.code == 404:
            raise RuntimeError("No hay un Spotify abierto. Abre la app en la PC o en el teléfono.") from exc
        logger.warning("Spotify %s %s → %s %s", method, path, exc.code, detail[:200])
        raise RuntimeError("Spotify no pudo hacer eso ahora.") from exc


def _launch_spotify_app() -> None:
    try:
        os.startfile("spotify:")  # noqa: S606
        return
    except OSError:
        pass
    exe = Path(os.environ.get("APPDATA", "")) / "Spotify" / "Spotify.exe"
    if exe.exists():
        os.startfile(exe)  # noqa: S606


def _devices() -> list[dict]:
    data = _api("GET", "/me/player/devices") or {}
    return list(data.get("devices") or [])


def _is_phone(device: dict) -> bool:
    tip = f"{device.get('type', '')} {device.get('name', '')}".casefold()
    if device.get("type") == "Smartphone":
        return True
    return any(w in tip for w in ("phone", "iphone", "android", "galaxy", "pixel", "celular"))


def _pick_device(want: str | None, devices: list | None = None) -> dict | None:
    if devices is None:
        devices = _devices()
    if want == "phone":
        phones = [d for d in devices if _is_phone(d)]
        if phones:
            return phones[0]
        others = [d for d in devices if str(d.get("type", "")).casefold() != "computer"]
        return others[0] if len(others) == 1 else None
    if want == "pc":
        for d in devices:
            if d.get("type") == "Computer":
                return d
    if devices:
        return next((d for d in devices if d.get("is_active")), devices[0])
    return None


def _ensure_device(want: str | None) -> dict:
    chosen = _pick_device(want)
    if chosen:
        return chosen
    if want == "phone":
        for _ in range(4):
            time.sleep(2)
            chosen = _pick_device("phone")
            if chosen:
                return chosen
        raise RuntimeError("No veo tu teléfono. Abre Spotify en el celular, en primer plano, con la misma cuenta y sin sesión privada.")
    _launch_spotify_app()
    for _ in range(2):
        time.sleep(3)
        chosen = _pick_device(want)
        if chosen:
            return chosen
    raise RuntimeError("Abrí Spotify en esta PC, pero aún no aparece. Espera un segundo y repite.")


def _track_items(q: str, limit: int = 5) -> list:
    # ponytail: /search?limit=1 ignora la frase y devuelve un hit random (KISS por Back in Black).
    limit = max(limit, 5)
    found = _api("GET", "/search", query="?" + urllib.parse.urlencode({"q": q, "type": "track", "limit": str(limit)}))
    return [t for t in (((found or {}).get("tracks") or {}).get("items") or []) if t]


def _best_track(tracks: list, artist: str) -> dict | None:
    ranked = sorted(tracks, key=lambda tr: _name_score(artist, " ".join(a.get("name", "") for a in tr.get("artists") or [])), reverse=True)
    if not ranked:
        return None
    who = " ".join(a.get("name", "") for a in ranked[0].get("artists") or [])
    return ranked[0] if _name_score(artist, who) >= 0.5 else None


_TITLE_SKIP = {"de", "del", "la", "el", "los", "las", "the", "a", "of"}


def _title_score(want: str, got: str) -> float:
    w = [t for t in re.findall(r"[a-z0-9áéíóúñü]+", want.casefold()) if t not in _TITLE_SKIP]
    g = set(re.findall(r"[a-z0-9áéíóúñü]+", got.casefold()))
    if not w or not g:
        return 0.0
    return sum(t in g for t in w) / len(w)


def _best_title(tracks: list, title: str) -> dict | None:
    ranked = sorted(tracks, key=lambda tr: (_title_score(title, tr.get("name") or ""), -len(tr.get("name") or "")), reverse=True)
    if not ranked or _title_score(title, ranked[0].get("name") or "") < 1:
        return None
    return ranked[0]


def _resolve_track(title: str, artist: str | None) -> tuple[dict, str]:
    def label(track: dict) -> str:
        who = ", ".join(a["name"] for a in track.get("artists") or [] if a.get("name"))
        return f"{track['name']} de {who}" if who else track["name"]

    if not artist:
        tracks = _track_items(f'track:"{title}"')
        chosen = _best_title(tracks, title) or _best_title(_track_items(title), title)
        if chosen:
            return {"uris": [chosen["uri"]]}, label(chosen)
        found = _api("GET", "/search", query="?" + urllib.parse.urlencode({"q": title, "type": "playlist", "limit": "1"}))
        playlists = [p for p in (((found or {}).get("playlists") or {}).get("items") or []) if p]
        if playlists:
            return {"context_uri": playlists[0]["uri"]}, playlists[0]["name"]
        raise RuntimeError(f"No encontré {title} en Spotify.")

    tracks = _track_items(f'track:"{title}" artist:"{artist}"') or _track_items(f"{title} {artist}")
    chosen = _best_track(tracks, artist)
    if chosen:
        return {"uris": [chosen["uri"]]}, label(chosen)
    found = _api("GET", "/search", query="?" + urllib.parse.urlencode({"q": artist, "type": "artist", "limit": "4"}))
    names = [a["name"] for a in (((found or {}).get("artists") or {}).get("items") or []) if a and a.get("name")]
    close = [n for n in names if _name_score(artist, n) >= 0.5]
    if len(close) == 1:
        tracks = _track_items(f'track:"{title}" artist:"{close[0]}"') or _track_items(f"{title} {close[0]}")
        chosen = _best_title(tracks, title)
        if chosen:
            return {"uris": [chosen["uri"]]}, label(chosen)
    if names:
        raise RuntimeError("No la encontré con ese artista. Parecidos: " + ", ".join(names) + ".")
    raise RuntimeError(f"No encontré {title} de {artist}.")


def _play_on(device: dict, body: dict) -> None:
    # ponytail: un reintento. Spotify aplica el play en segundo plano y el contexto viejo gana la primera.
    query = "?device_id=" + urllib.parse.quote(device["id"])
    want = (body.get("uris") or [None])[0]

    def once() -> str | None:
        _api("PUT", "/me/player/play", body, query=query)
        if not want:
            return None
        time.sleep(0.7)
        player = _api("GET", "/me/player/currently-playing") or {}
        return ((player.get("item") or {}).get("uri"))

    try:
        got = once()
    except RuntimeError as exc:
        if "Premium" in str(exc):
            raise
        _api("PUT", "/me/player", {"device_ids": [device["id"]], "play": False})
        time.sleep(0.8)
        got = once()
    if want and got != want:
        got = once()
    if want and got != want:
        raise RuntimeError("Spotify dejó la canción que ya tenía. Dila otra vez.")


def _spotify_act(intent: dict) -> dict:
    kind = intent["kind"]
    if kind == "spotify_play":
        device = _ensure_device(intent.get("device"))
        if intent.get("uri"):
            body = {"uris": [intent["uri"]]}
            label = f"{intent['query']} de {intent['artist']}" if intent.get("artist") else intent["query"]
        else:
            body, label = _resolve_track(intent["query"], intent.get("artist"))
        _play_on(device, body)
        if intent.get("device") == "phone":
            where = f"en {device.get('name') or 'el teléfono'}"
        else:
            where = "aquí"
        return {"answer": f"Pongo {label} {where}."}
    if kind == "spotify_resume":
        device = _ensure_device(intent.get("device"))
        _api("PUT", "/me/player", {"device_ids": [device["id"]], "play": True})
        return {"answer": "Sigo la música."}
    if kind == "spotify_pause":
        # El player tarda un instante tras play/next; el primer pause a veces es 403.
        for attempt in range(2):
            player = _api("GET", "/me/player") or {}
            if not player.get("is_playing"):
                return {"answer": "Ya está en pausa."}
            try:
                _api("PUT", "/me/player/pause")
                return {"answer": "Pauso la música."}
            except RuntimeError:
                if attempt:
                    raise
                time.sleep(1)
    if kind == "spotify_next":
        _api("POST", "/me/player/next")
        return {"answer": "Siguiente."}
    if kind == "spotify_prev":
        _api("POST", "/me/player/previous")
        return {"answer": "La de antes."}
    if kind == "spotify_vol":
        player = _api("GET", "/me/player") or {}
        current = int(((player.get("device") or {}).get("volume_percent")) or 50)
        vol = max(0, min(100, current + int(intent["delta"])))
        _api("PUT", "/me/player/volume", query=f"?volume_percent={vol}")
        return {"answer": f"Volumen {vol}."}
    raise RuntimeError("No reconocí ese control de Spotify.")


def spotify_status() -> dict:
    token = _load_token()
    if not token:
        return {"authorized": False, "devices": []}
    try:
        devices = [{"name": d.get("name"), "type": d.get("type"), "active": d.get("is_active")} for d in _devices()]
        return {"authorized": True, "devices": devices}
    except RuntimeError as exc:
        return {"authorized": True, "devices": [], "error": str(exc)}
