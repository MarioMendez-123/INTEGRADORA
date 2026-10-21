"""Intenciones de Lumina escritorio — sin red ni Spotify real."""

import datetime
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

import lumina_desktop as desk  # noqa: E402


def setup_function():
    desk.PENDING = None


def test_reproduce_cancion():
    assert desk.parse_intent("Lumina reproduce despacito") == {
        "kind": "spotify_play",
        "query": "despacito",
        "device": None,
    }


def test_reproduce_de_artista():
    assert desk.parse_intent('Lumina reproduce "la muchacha interesada" de Jose Torres el rey de alto mando') == {
        "kind": "spotify_play",
        "query": "la muchacha interesada",
        "artist": "Jose Torres el rey de alto mando",
        "device": None,
    }
    assert desk.parse_intent("reproduce la muchacha interesada de Jose Torres")["artist"] == "Jose Torres"


def test_no_pone_otra_cancion():
    ajena = {"name": "I Was Made for Lovin' You", "uri": "spotify:track:kiss", "artists": [{"name": "Kiss"}]}
    pedida = {"name": "Back In Black", "uri": "spotify:track:acdc", "artists": [{"name": "AC/DC"}]}
    assert desk._best_title([ajena, pedida], "back in black")["uri"] == "spotify:track:acdc"
    corta = {"name": "De Ti", "uri": "spotify:track:corta", "artists": []}
    completa = {"name": "De Ti Exclusivo", "uri": "spotify:track:completa", "artists": []}
    assert desk._best_title([corta, completa], "de ti exclusivo")["uri"] == "spotify:track:completa"
    assert desk._best_title([ajena], "back in black") is None


def test_artista_parecido():
    assert desk._name_score("jose torres el rey de alto mando", "Jose Torres El Rey De Alto Mando") == 1
    assert desk._best_track(
        [{"name": "X", "artists": [{"name": "Luis Miguel"}]}, {"name": "Y", "artists": [{"name": "Jose Torres"}]}],
        "jose torres",
    )["name"] == "Y"


def test_tecno_bien_insano():
    esperado = {
        "kind": "spotify_play",
        "query": "Do You Wanna",
        "artist": "KRAZKA, Aether",
        "uri": "spotify:track:22RH8on5apN7wbv2lqtTXi",
        "device": None,
    }
    assert desk.parse_intent("Lumina, pon un tecno bien insano") == esperado
    assert desk.parse_intent("lumina pon, un tecno bien insano.") == esperado


def test_reproduce_en_el_telefono():
    assert desk.parse_intent("lumina pon bad bunny en el teléfono") == {
        "kind": "spotify_play",
        "query": "bad bunny",
        "device": "phone",
    }


def test_ensayo_apa(tmp_path):
    assert desk.parse_intent("haz un ensayo sobre la fotosíntesis en google docs") == {
        "kind": "essay",
        "topic": "la fotosíntesis",
    }
    assert desk.parse_intent("escribe un ensayo APA acerca de la mitosis")["topic"] == "la mitosis"
    assert desk.parse_intent("abre google docs")["url"] == "https://docs.new"
    when = datetime.date(2026, 10, 1)
    names = ["Camila Sanfuentes", "Ángela Sierra-Almeida", "Lohengrin A. Cavieres"]
    assert desk._in_text(names, 2012) == "(Sanfuentes et al., 2012)"
    ref = desk._apa_reference(names, 2012, "Efecto del calor", "Gayana. Botánica", "https://doi.org/10.1/abc", "69", "1", "10-20")
    assert ref.startswith("Sanfuentes, C., Sierra-Almeida, Á. y Cavieres, L. A. (2012).")
    assert ref.endswith("https://doi.org/10.1/abc")
    assert desk.parse_intent("cómo va el ensayo") == {"kind": "essay_status"}
    assert desk.parse_intent("terminó de escribir el ensayo y no pegó nada") is None
    assert desk.parse_intent("haz un reporte sobre la fotosíntesis")["topic"] == "la fotosíntesis"
    assert desk.parse_intent("cómo va el reporte") == {"kind": "essay_status"}
    assert desk.essay_status()["text"] == "No hay ningún ensayo en curso."
    assert desk.parse_intent("haz un ensayo argumentativo sobre la fotosíntesis") == {
        "kind": "essay",
        "topic": "la fotosíntesis",
        "tipo": "argumentativo",
    }
    blocks = desk._essay_blocks("Introducción\n\nLas plantas convierten luz.\n\nEl pigmento\n\nLa clorofila absorbe.")
    assert blocks == [("p", "Las plantas convierten luz."), ("h", "El pigmento"), ("p", "La clorofila absorbe.")]
    dest = tmp_path / "ensayo.docx"
    made = desk._utech_docx("la fotosíntesis", "El pigmento\n\nLas plantas convierten luz.", [{"ref": ref}], when, dest)
    with zipfile.ZipFile(made) as zf:
        xml = zf.read("word/document.xml").decode("utf-8")
        names = zf.namelist()
        cover = zf.read("word/media/cover.png")
    assert "word/media/cover.png" in names and "word/media/image2.png" in names
    assert ref in xml and "Times New Roman" in xml and "rId20" in xml
    assert "Ivonne" not in xml and "Yenny" not in xml and "CyDH" not in xml
    assert "nextPage" in xml and 'w:hanging="720"' in xml and 'cx="5943600"' in xml
    assert cover[:8] == b"\x89PNG\r\n\x1a\n" and len(cover) > 20000
    html = desk._essay_html("la fotosíntesis", "El pigmento\n\nLas plantas convierten luz.", [{"ref": ref}], when)
    assert "INTEGRANTES" in html and "MATERIA" in html and "MAESTRA" in html
    assert "Times New Roman" in html and "data:image/png;base64," in html
    assert "Introducción" not in html and "text-indent:-0.5in" in html
    packed = desk._cf_html("<p>Hola</p>")
    start = int(packed[packed.index("StartFragment:") + 14:][:8])
    end = int(packed[packed.index("EndFragment:") + 12:][:8])
    assert packed.encode("utf-8")[start:end] == b"<p>Hola</p>"


def test_ensayo_espera_el_aviso():
    import threading
    import time

    desk._ESSAY_READY = False

    def poke():
        time.sleep(0.25)
        desk.essay_mark_ready()

    threading.Thread(target=poke, daemon=True).start()
    started = time.time()
    desk._essay_finishing()
    assert time.time() - started < 5
    assert desk._ESSAY_PHASE == "finishing"
    desk._ESSAY_PHASE = ""
    desk._ESSAY_READY = False


def test_spotify_limit_1_devuelve_otra_cancion():
    seen = {}

    def fake(method, path, body=None, query=""):
        seen["q"] = query
        return {"tracks": {"items": []}}

    old = desk._api
    desk._api = fake
    try:
        desk._track_items("back in black", 1)
    finally:
        desk._api = old
    assert "limit=5" in seen["q"]


def test_cuerpo_vacio_de_spotify():
    assert desk._json_or_empty(b"") == {}
    assert desk._json_or_empty(b"\r\n") == {}
    assert desk._json_or_empty(b'{"ok":1}') == {"ok": 1}
    assert desk._json_or_empty(b"0om4RSDoGliKcvxlzWVO-tsAlQU") == {}


def test_pausa_y_siguiente():
    assert desk.parse_intent("pausa la música")["kind"] == "spotify_pause"
    assert desk.parse_intent("lumina siguiente")["kind"] == "spotify_next"


def test_comandos_utiles():
    assert desk.parse_intent("investiga fotosintesis")["query"] == "fotosintesis"
    assert desk.parse_intent("buenos días")["kind"] == "morning"
    assert desk.parse_intent("modo descanso")["kind"] == "rest"
    assert desk.parse_intent("captura de pantalla")["kind"] == "shot"
    assert desk.parse_intent("recuerda que me gusta el café")["fact"] == "me gusta el café"
    assert desk.parse_intent("qué recuerdas")["kind"] == "recall"
    assert desk.parse_intent("compara a.txt con b.txt")["b"] == "b.txt"
    assert desk.parse_intent("mueve notas.txt a documentos") == {"kind": "move", "name": "notas.txt", "where": "documents"}
    assert desk.parse_intent("pausa el video") == {"kind": "media", "direction": "pause"}
    assert desk.parse_intent("deshaz lo último")["kind"] == "undo"
    assert desk.parse_intent("estado del repo")["kind"] == "git"
    assert desk.parse_intent("qué es Aether") is None
    assert desk.parse_intent("que puedes hacer")["kind"] == "help"
    assert desk.parse_intent("proyecta aether") == {"kind": "holo", "model": "aether", "apart": False}
    assert desk.parse_intent("proyecta robot") == {"kind": "holo", "model": "robot", "apart": False}
    assert desk.parse_intent("Lumina, enséñanos quién eres") == {
        "kind": "holo", "model": "robot", "apart": False, "pose": "armada",
    }
    assert desk.parse_intent("Lumina, muestra tu interior") == {
        "kind": "holo", "model": "robot", "apart": False, "reveal": True,
    }
    assert desk.parse_intent("descompón el robot") == {"kind": "holo", "model": "robot", "apart": True}
    assert desk.parse_intent("descompón la molécula de agua") == {"kind": "holo", "model": "agua", "apart": True}
    assert desk.parse_intent("proyecta la placa") == {"kind": "holo", "model": "placa", "apart": False}
    assert desk.parse_intent("proyecta metano en 3d") == {"kind": "holo", "model": "metano", "apart": False}
    assert desk.parse_intent("pulso")["kind"] == "pulse"
    assert desk.parse_intent("cuánto es 12 por 8")["expr"] == "12 por 8"
    assert desk._math_answer("12 por 8") == "96"
    assert desk._convert_answer("5 kilometros a millas").endswith("millas.")
    assert desk._convert_answer("100 celsius a fahrenheit").startswith("212")
    assert desk.parse_intent("qué hora es en tokio")["city"] == "tokio"
    assert desk.parse_intent("avísame a las 20:30")["kind"] == "at"
    assert desk.parse_intent("avísame si la batería baja de 30") == {"kind": "watch", "limit": 30}
    pending = desk.handle_desktop("olvida el café")
    assert pending["pending"] is True


def test_n8n_elige_un_flujo():
    assert desk._risk("read_file") == 0
    assert desk._risk("open_url") == 1
    assert desk._risk("mkfile") == 2
    assert desk._risk("power") == 3
    assert desk._blocked_name(".env")
    assert desk._blocked_name("spotify_token.json")
    desk.PENDING = {"kind": "power", "mode": "shutdown"}
    assert desk.parse_intent("detente") == {"kind": "stop"}
    assert desk.parse_intent("lee el archivo notas.txt") == {"kind": "read_file", "name": "notas.txt"}
    assert desk.parse_intent("qué hiciste hoy")["kind"] == "actions"
    tools = [
        {"name": "crear_doc", "description": "Crea un documento de google docs", "inputSchema": {"type": "object", "properties": {"texto": {"type": "string"}}, "required": ["texto"]}},
        {"name": "otra", "description": "clima del dia", "inputSchema": {"properties": {"q": {"type": "string"}}, "required": ["q"]}},
    ]
    tool = desk._pick_n8n_tool("crea un documento de google", tools)
    assert tool["name"] == "crear_doc"
    assert desk._n8n_args(tool, "crea un documento de google") == {"texto": "crea un documento de google"}
    ambiguo = {"name": "x", "description": "documento", "inputSchema": {"properties": {"a": {"type": "string"}, "b": {"type": "string"}}, "required": ["a", "b"]}}
    assert desk._n8n_args(ambiguo, "hola") is None
    assert desk._mcp_body('data: {"ok": 1}\n') == {"ok": 1}
    assert desk.parse_intent("crea un documento en google docs")["url"] == "https://docs.new"
    assert desk.parse_intent("abre youtube bad bunny")["url"].startswith("https://www.youtube.com/results?search_query=")
    assert desk.parse_intent("proyecta la imagen logo") == {"kind": "show_image", "name": "logo"}
    assert desk.parse_intent("abre edge") == {"kind": "open_app", "app": "edge"}
    assert desk.parse_intent("busca recetas de tacos") == {"kind": "search", "query": "recetas de tacos"}


def test_cierra_pide_confirmacion():
    out = desk.handle_desktop("cierra edge")
    assert out["pending"] is True
    assert desk.PENDING["kind"] == "close_app"


def test_si_cancela():
    desk.handle_desktop("cierra edge")
    assert desk.handle_desktop("no") == {"answer": "De acuerdo, no hago nada."}
    assert desk.PENDING is None


def test_asistente():
    assert desk.parse_intent("qué hora es")["kind"] == "clock"
    assert desk.parse_intent("qué fecha es")["what"] == "date"
    assert desk.parse_intent("qué está sonando")["kind"] == "now_playing"
    assert desk.parse_intent("bloquea la pantalla")["kind"] == "lock"
    power = desk.handle_desktop("apaga la computadora")
    assert power["pending"] is True and desk.PENDING["mode"] == "shutdown"
    assert desk.handle_desktop("no")["answer"].startswith("De acuerdo")
    assert desk.parse_intent("Lumina, iniciar presentación") is None
    assert desk.parse_intent("qué es Aether") is None


def test_temporizador_volumen_y_nota():
    assert desk.parse_intent("pon un temporizador de 5 minutos") == {"kind": "timer", "seconds": 300}
    assert desk.parse_intent("sube el volumen") == {"kind": "win_vol", "direction": "up"}
    assert desk.parse_intent("sube el volumen de spotify") == {"kind": "spotify_vol", "delta": 15}
    assert desk.parse_intent("silencio") == {"kind": "win_vol", "direction": "mute"}
    note = desk.parse_intent("guarda un archivo llamado compra que diga leche y pan")
    assert note["kind"] == "mkfile" and note["name"] == "compra.txt" and note["body"] == "leche y pan"
    assert desk.parse_intent("abre la carpeta del repo") == {"kind": "open_dir", "where": "repo"}


def test_elige_telefono():
    pc = {"type": "Computer", "name": "PC"}
    cel = {"type": "Smartphone", "name": "Mi Cel"}
    assert desk._pick_device("phone", [pc, cel])["name"] == "Mi Cel"
    assert desk._pick_device("phone", [pc, {"type": "Speaker", "name": "Sala"}])["name"] == "Sala"
    assert desk._pick_device("phone", [pc]) is None


def test_lista_y_camino():
    assert desk._allowed_app("edge")
    assert not desk._allowed_app("cmd")
    assert desk._is_under(Path("C:/Users/x/Desktop/a"), Path("C:/Users/x/Desktop"))
    assert not desk._is_under(Path("C:/Windows"), Path("C:/Users/x/Desktop"))

