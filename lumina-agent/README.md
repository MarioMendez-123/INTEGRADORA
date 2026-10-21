# Lumina — agente de voz con cara (estilo Jarvis)

Cara animada + reconocimiento de voz + LLM local (Ollama) + voz sintetizada.
Responde al nombre **"Lumina"**. Extraída de Aether y desacoplada de él.

```
lumina-agent/
├── lumina.py          Backend: APIRouter FastAPI, POST /lumina/ask (Ollama + limpieza)
├── server.py          Servidor mínimo para correrla sola
├── test_lumina.py     12 pruebas del backend (sin Ollama real)
├── requirements.txt
└── web/
    ├── index.html     La interfaz (cara SVG, pantalla de espera)
    ├── lumina.css     Diseño OLED sci-fi (cian + azul eléctrico)
    ├── lumina.js      Motor de expresiones, voz, conversación
    └── lumina-field.js  Fondo de nodos 3D (opcional)
```

## Correrla sola

```
pip install -r requirements.txt
ollama pull llama3.2:1b          # y deja `ollama serve` corriendo
python server.py                 # http://localhost:8000  (usa Chrome o Edge)
```

Pantalla negra al inicio: di **"Lumina"** (o haz clic en la esquina superior
izquierda, invisible) para encenderla. Después habla normal; cada frase va al LLM.

## Meterla en otro proyecto

- **Backend FastAPI:** copia `lumina.py` y haz `app.include_router(router)`
  (`from lumina import router`).
- **Frontend:** copia `web/` donde sirvas estáticos. Si tu API no está en
  `/lumina/ask`, define antes de cargar `lumina.js`:
  `<script>window.LUMINA_ASK_URL = "https://mi-api/lumina/ask";</script>`
- **Otro backend (Node, etc.):** solo replica el contrato:
  `POST {question}` → `{answer}`. Todo lo demás es frontend.

## Personalizarla

| Qué | Dónde |
|---|---|
| Hechos reales de tu proyecto (para que no invente) | env `LUMINA_PROJECT_CONTEXT` |
| Modelo / URL / tope de tokens | env `OLLAMA_MODEL`, `OLLAMA_URL`, `OLLAMA_NUM_PREDICT` |
| Respuestas instantáneas sin LLM | `PRELOADED_ANSWERS` en `lumina.py` |
| Personalidad base | `_BASE_PROMPT` en `lumina.py` |
| Colores | tokens de `:root` en `lumina.css` |
| Nueva expresión | una fila en `EXPRESSIONS` de `lumina.js` |
| Voz | `localStorage.setItem('lumina_voice_override', 'jorge')` y recargar |

## Comandos de voz

"Lumina" (enciende) · "Lumina, feliz / triste / confundida / sorprendida /
pensando / error / neutral / inactiva" (cambia la cara) · "Lumina,
presentación" (cara feliz sostenida; otra vez la quita). Cualquier otra frase
es una pregunta para el LLM. Consola del navegador: `setFaceExpression('feliz')`,
`askLumina('hola')`.

## Límites reales (no los prometas de más)

- Las expresiones son estados visuales predefinidos, no emociones de un modelo.
- La boca es una animación procedural, no análisis de audio (la Web Speech API
  no lo permite).
- No se puede clonar la voz de Jarvis: se elige la mejor voz en español que
  tenga instalada el navegador/sistema.
- Sin memoria: cada pregunta es independiente.
- El reconocimiento de voz es la Web Speech API del navegador (Chrome/Edge).

## Qué se quitó respecto a Aether

Modo Cámara (`/perception/stream`, YOLO), panel de detecciones, guion de la
presentación de Aether, y el system prompt / respuestas precargadas con datos
de Aether. Lo demás (cara, voz, limpieza del LLM) es idéntico en lógica.

## Diseño de Aether (referencia para el resto de tu proyecto)

`design/` trae el sistema de diseño completo de Aether, copiado tal cual:
`aether-design-system.md` (las reglas: tokens, tipografía, componentes) y
`aether-style.css` (su implementación). Lumina NO depende de ellos — `web/`
funciona sola — pero si el resto de tu app debe verse como Aether, úsalos.
Nota: Lumina retinta el acento a cian solo dentro de su página
(`lumina.css`); el acento global de Aether es azul-violeta `#6e8cff`.
