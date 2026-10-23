"""Palabra de activación («Lumina») tolerante a lo que el reconocedor local escribe en su lugar.

POR QUÉ EXISTE. El modelo de Vosk que usa el servicio (vosk-model-small-es-0.42) NO tiene «lumina» en su vocabulario
(se comprobó con `Model.vosk_model_find_word`): un reconocedor solo puede escribir palabras de su vocabulario, así que
cuando alguien dice «Lumina» escribe la palabra de su vocabulario que más suena parecida («nómina», «mina», «luz mina»,
«lumínica», «luminoso»…). `robot.js` activa con una expresión regular exacta (`LUMINA_PATTERN`), por eso nunca detectaba
la palabra. Chrome no tiene este problema porque su reconocedor sí sabe escribir «Lumina».

QUÉ HACE. Antes de mandar el texto a las páginas, si la FRASE EMPIEZA con algo que suena a «Lumina», se reescribe esa
primera palabra como «lumina». Así `robot.js` no cambia y la corrección vive junto al motor al que corrige.

QUÉ NO HACE (a propósito, para no activar de más):
  - solo mira el INICIO de la frase (las dos primeras palabras, o las dos siguientes a un «hola»/«oye»), nunca el medio
    ni el final;
  - solo acepta una lista corta de formas observadas, un parecido muy cercano que empiece con «lu» («lubina») y dos
    palabras sueltas del tipo «luz mina» / «lo mina»;
  - no toca las palabras que ya contienen «lumina» exacta (ya las entiende robot.js).
El costo es un riesgo conocido de falsos positivos: una frase real que empiece con «nómina…» o «mina…» se tomará por
«Lumina…». Se mide en `scripts/probar_palabra_clave.py` y se apaga con AETHER_VOICE_WAKE_FUZZY=off.
"""

import re
import unicodedata

OBJETIVO = "lumina"

# Formas que un reconocedor sin «lumina» escribe en su lugar y que NO caen en el parecido automático de abajo. Vienen de
# lo OBSERVADO: la prueba real de Mario con Vosk («nómina», «mina», «lumínica», «luminoso») y la voz sintética en
# silencio (docs/auditoria/PALABRA_CLAVE.md). Cada una es también una palabra real del español: ese es el riesgo.
ALIAS_UNA_PALABRA = frozenset({"nomina", "mina", "luminica", "luminoso", "luminosa"})
# «luz mina», «lo mina», «lu mina»: dos palabras que suenan a una. Solo si la PRIMERA es una de estas (no «la mina»,
# «una mina»…, que son frases normales) y las dos pegadas están a ≤ 2 letras de «lumina».
PRIMERAS_DE_DOS_PALABRAS = frozenset({"lu", "luz", "lo", "lus"})

_PALABRA = re.compile(r"[a-záéíóúüñ]+", re.IGNORECASE)


def sin_acentos(texto: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn")


def normalizar(palabra: str) -> str:
    return sin_acentos(palabra).lower()


def distancia(a: str, b: str) -> int:
    """Levenshtein: cuántas letras hay que cambiar, quitar o poner para pasar de a a b."""
    previa = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        actual = [i]
        for j, cb in enumerate(b, 1):
            actual.append(min(previa[j] + 1, actual[-1] + 1, previa[j - 1] + (ca != cb)))
        previa = actual
    return previa[-1]


def suena_a_lumina(palabra: str) -> bool:
    """Una palabra que es una forma observada, o que empieza con «lu», tiene 5 letras o más y está a UNA letra de
    «lumina» («lubina», «lumia», «lumna»…). «lucía» (2 letras de diferencia) y «luna» (corta) NO cuentan."""
    n = normalizar(palabra)
    if n in ALIAS_UNA_PALABRA:
        return True
    return len(n) >= 5 and n.startswith("lu") and distancia(n, OBJETIVO) <= 1


# «Hola Lumina…» / «Oye Lumina…»: un saludo delante no cambia que se esté llamando a Lumina.
SALUDOS = frozenset({"hola", "oye", "hey", "ey", "ok", "okay", "buenas"})


def _palabras(texto: str):
    return [(m.start(), m.end(), m.group(0)) for m in _PALABRA.finditer(texto)]


def normalizar_activacion(texto: str) -> str:
    """Si la frase EMPIEZA como «Lumina» (opcionalmente tras un saludo), reescribe ese comienzo como «lumina»; si no, la
    devuelve igual. Nunca mira más allá de las dos primeras palabras después del saludo."""
    palabras = _palabras(texto)
    if not palabras or palabras[0][0] > 3:  # a lo más un par de signos («¿», «- ») antes de la primera palabra
        return texto
    base = 1 if normalizar(palabras[0][2]) in SALUDOS and len(palabras) > 1 else 0
    inicio, fin, primera = palabras[base]
    if normalizar(primera) == OBJETIVO:
        return texto  # ya está bien escrita
    if base + 1 < len(palabras) and normalizar(primera) in PRIMERAS_DE_DOS_PALABRAS and palabras[base + 1][0] - fin <= 2:
        pegadas = normalizar(primera) + normalizar(palabras[base + 1][2])
        if len(pegadas) >= 5 and distancia(pegadas, OBJETIVO) <= 2:
            return texto[:inicio] + OBJETIVO + texto[palabras[base + 1][1]:]
    if suena_a_lumina(primera):
        return texto[:inicio] + OBJETIVO + texto[fin:]
    return texto
