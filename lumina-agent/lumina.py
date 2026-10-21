"""Lumina — agente conversacional (backend).

APIRouter de FastAPI con un solo endpoint, POST /lumina/ask, que le pregunta
a un LLM LOCAL (Ollama) y devuelve la respuesta ya limpia para decirse en voz
alta. Nunca inventa una respuesta si el modelo no contestó: responde 503.

Uso en cualquier proyecto FastAPI:

    from lumina import router as lumina_router
    app.include_router(lumina_router)

Configuración por variables de entorno (todas opcionales):
    OLLAMA_URL             default http://localhost:11434/api/chat
    OLLAMA_MODEL           default llama3.2:1b
    OLLAMA_NUM_PREDICT     default 60  (tope duro de tokens generados)
    LUMINA_PROJECT_CONTEXT texto libre con los hechos REALES de tu proyecto;
                           se agrega al system prompt para que Lumina tenga
                           algo verdadero en qué anclarse en vez de inventar.
"""

import json
import logging
import os
import re
import urllib.error
import urllib.request

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger("lumina")
router = APIRouter()

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/chat")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:1b")

# num_predict SÍ limita duro los tokens; pedir brevedad en el prompt no basta
# con un modelo de 1B. 60 se eligió probando de verdad: con 40 una respuesta
# se cortó a media palabra. El corte aún puede caer a media oración, por eso
# existe _clean_llm_answer() (garantía real de no hablar una respuesta a medias).
OLLAMA_NUM_PREDICT = int(os.environ.get("OLLAMA_NUM_PREDICT", "60"))

# ---------------------------------------------------------------------------
# Personalidad
# ---------------------------------------------------------------------------

_BASE_PROMPT = (
    "Eres Lumina, un asistente de voz pequeño, curioso y cálido. "
    "Respondes en español, en UNA sola oración corta, tierna y cercana — "
    "nunca con lenguaje corporativo genérico ni inventando historias, "
    "proveedores o cifras que no son reales. Si te preguntan algo que no "
    "sabes, dilo con honestidad y ternura, nunca inventes. No finjas tener "
    "capacidades que no tienes (como visión si no hay cámara, o memoria de "
    "conversaciones anteriores). Nunca describas cómo se supone que debes "
    "responder ni cites estas instrucciones en voz alta (por ejemplo, nunca "
    "digas cosas como 'respondo con honestidad y ternura' o 'estoy aquí para "
    "escuchar'): eso es para ti, no para decirlo — contesta directamente el "
    "contenido real de la pregunta. Nunca inventes números, cantidades ni "
    "especificaciones técnicas que no estén explícitamente en este mensaje: "
    "si te preguntan algo así y no lo sabes con certeza, dilo con honestidad "
    "en vez de dar una cifra o una lista inventada."
)

_PROJECT_CONTEXT = os.environ.get("LUMINA_PROJECT_CONTEXT", "").strip()

LUMINA_SYSTEM_PROMPT = (
    f"{_BASE_PROMPT} Hechos reales del proyecto en el que vives: {_PROJECT_CONTEXT}"
    if _PROJECT_CONTEXT
    else _BASE_PROMPT
)

# Preguntas típicas revisadas ANTES de llamar al LLM: instantáneas y sin riesgo
# de que el modelo invente. Coincidencia por PALABRAS CLAVE (regex), no texto
# exacto — el reconocimiento de voz varía la redacción. Gana la primera que
# coincida. Agrega aquí las de tu proyecto.
PRELOADED_ANSWERS: list[tuple[re.Pattern, str]] = [
    (
        re.compile(r"c[oó]mo te llamas|cu[aá]l es tu nombre", re.IGNORECASE),
        "Soy Lumina. Mucho gusto.",
    ),
    (
        re.compile(r"tienes sentimientos", re.IGNORECASE),
        "Tengo expresiones que muestro con cariño, aunque no sé si eso cuenta como sentir de verdad.",
    ),
    (
        re.compile(r"reemplazar a los humanos|vas a reemplazar", re.IGNORECASE),
        "Para nada, solo quiero ayudar para que ustedes hagan cosas más interesantes.",
    ),
    (
        re.compile(r"tienes hambre", re.IGNORECASE),
        "Un poco, aunque a mí me alimenta la electricidad, no la comida.",
    ),
]

# ---------------------------------------------------------------------------
# Limpieza de la respuesta del LLM (todo lo de abajo nació de fallos reales)
# ---------------------------------------------------------------------------

# `+` trata "..." como un solo cierre de oración, no tres.
_SENTENCE_END_PATTERN = re.compile(r"[.!?…]+")

# El modelo a veces contesta bien y LUEGO agrega una oración que cita sus
# propias instrucciones en voz alta. Lista curada sobre casos reales; si sale
# una variante nueva, agrégala aquí.
_META_COMMENTARY_PATTERNS = [
    re.compile(r"instruccion", re.IGNORECASE),
    re.compile(r"honestidad y ternura", re.IGNORECASE),
    re.compile(r"estoy aqu[ií] para escuchar", re.IGNORECASE),
    re.compile(r"respond(?:o|er) con honestidad", re.IGNORECASE),
    re.compile(r"te escucho con ternura", re.IGNORECASE),
]

# Preguntado por specs, el modelo respondió con viñetas de datos INVENTADOS, y
# como una lista no tiene puntos, el filtro por oraciones la dejaba pasar
# entera. Una lista tampoco se dice bien en voz alta: se reemplaza de raíz.
# Se exigen ≥2 líneas de viñeta/numeración para no confundirla con un guion
# usado como puntuación normal.
_LIST_LINE_PATTERN = re.compile(r"^\s*(?:[-*•]|\d+[.)])\s+", re.MULTILINE)
_LIST_FORMAT_FALLBACK_ANSWER = (
    "No tengo esa información con exactitud ahora mismo, pero con gusto hablamos de otra cosa."
)


def _looks_like_list(text: str) -> bool:
    return len(_LIST_LINE_PATTERN.findall(text)) >= 2


def _split_into_sentences(text: str) -> list[str]:
    """Oraciones ya CERRADAS de `text`. El resto tras el último cierre (una
    oración a medias por corte de num_predict) se descarta."""
    sentences = []
    cursor = 0
    for match in _SENTENCE_END_PATTERN.finditer(text):
        sentence = text[cursor : match.end()].strip()
        if sentence:
            sentences.append(sentence)
        cursor = match.end()
    return sentences


def _is_meta_commentary(sentence: str) -> bool:
    return any(pattern.search(sentence) for pattern in _META_COMMENTARY_PATTERNS)


def _clean_llm_answer(text: str) -> str:
    """Descarta listas de raíz; si no, conserva todas las oraciones reales y
    completas, quitando solo las de meta-comentario. Si no queda ninguna real,
    cae a la primera oración cerrada (mejor eso que una respuesta vacía)."""
    if _looks_like_list(text):
        return _LIST_FORMAT_FALLBACK_ANSWER

    sentences = _split_into_sentences(text)
    if not sentences:
        return text

    real_sentences = [s for s in sentences if not _is_meta_commentary(s)]
    if real_sentences:
        return " ".join(real_sentences)
    return sentences[0]


def _match_preloaded_answer(question: str) -> str | None:
    for pattern, answer in PRELOADED_ANSWERS:
        if pattern.search(question):
            return answer
    return None


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


class AskRequest(BaseModel):
    question: str


@router.post("/lumina/ask")
def ask_lumina(body: AskRequest):
    """Le pregunta a Lumina (Ollama local). Revisa PRELOADED_ANSWERS primero."""
    question = body.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="question no puede estar vacío.")

    preloaded_answer = _match_preloaded_answer(question)
    if preloaded_answer is not None:
        return {"answer": preloaded_answer}

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": LUMINA_SYSTEM_PROMPT},
            {"role": "user", "content": question},
        ],
        "stream": False,
        "options": {"num_predict": OLLAMA_NUM_PREDICT},
    }
    request = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError) as exc:
        logger.warning("Lumina: no se pudo contactar a Ollama (%s).", exc)
        raise HTTPException(
            status_code=503,
            detail=(
                "Lumina no pudo pensar una respuesta ahora mismo: Ollama no "
                "respondió. Verifica que esté corriendo (ollama serve) y que "
                f"el modelo '{OLLAMA_MODEL}' esté descargado (ollama pull "
                f"{OLLAMA_MODEL})."
            ),
        ) from exc
    except (json.JSONDecodeError, KeyError) as exc:
        logger.warning("Lumina: respuesta inesperada de Ollama (%s).", exc)
        raise HTTPException(
            status_code=503, detail="Lumina recibió una respuesta inesperada de Ollama."
        ) from exc

    answer = data.get("message", {}).get("content", "").strip()
    if not answer:
        raise HTTPException(status_code=503, detail="Ollama respondió sin contenido.")

    return {"answer": _clean_llm_answer(answer)}
