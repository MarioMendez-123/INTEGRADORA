# Bitácora de hardware real — Jetson y Raspberry Pi 4

Una entrada por sesión. Cada entrada dice qué se hizo, los comandos, la salida
real, los errores y el estado final, separando lo **verificado con hardware**
de lo que **no**. Si algo no se pudo comprobar, se dice.

---

## Sesión 1 — 2026-10-21 — Preparar el código para Python 3.10 (solo laptop)

**Rama:** `jetson-setup`, creada desde `feature/hardening-cloudflare`.

**Por qué esa rama:** `feature/hardening-cloudflare` no está mergeada a `main`
(23 commits que `main` no tiene, 0 en el otro sentido) y `backend/cell_line.py`
solo existe en ella. Las ramas `feature/robot-lumina-camera-sharing` y
`feature/seguridad-y-alianzas` están por detrás de ella (13 y 8 commits). Salir
de `main` habría dejado fuera la celda, Lumina y el carrito 3D.

**Equipo usado en esta sesión:** la laptop Windows (Python 3.11.9, ruff 0.16.5,
pytest 9.1.1). No se tocó el Jetson ni la Raspberry.

### Qué se hizo

1. Se leyeron los documentos y el código listados en el encargo (ver las
   tensiones documentales que salieron, abajo).
2. Se cambió `from datetime import UTC` por `timezone.utc` en 7 archivos
   (15 líneas), porque `datetime.UTC` solo existe desde Python 3.11 y el Jetson
   trae 3.10. Archivos: `backend/main.py`, `backend/dataset_store.py`,
   `backend/inventory_refresh.py`, `backend/scripts/load_from_edge.py`,
   `edge/perception/capture_headless.py`, `edge/perception/test_combined.py`,
   `edge/perception/train_parts.py`.
3. Se bajó `target-version` de ruff de `py311` a `py310` en
   `backend/pyproject.toml` y `edge/pyproject.toml`, en un commit aparte.

### Comandos y salida real

Línea base (antes de tocar nada), con `backend/.venv` y `edge/.venv`:

```
ruff check <los 7 archivos>              -> Found 9 errors
pytest (en backend/)                     -> 2 failed, 95 passed
pytest (en edge/)                        -> 7 passed
```

Después del cambio de `UTC`, con la configuración vieja (`py311`):

```
ruff check <los 7 archivos>              -> Found 17 errors  (8 nuevos, todos UP017 "Use datetime.UTC alias")
pytest (en backend/)                     -> 2 failed, 95 passed  (idéntico)
pytest (en edge/)                        -> 7 passed
```

Después de bajar el objetivo de ruff a `py310`:

```
ruff en backend/ (4 archivos tocados)    -> Found 6 errors
ruff en edge/    (3 archivos tocados)    -> Found 3 errors      (6 + 3 = 9, igual que la línea base)
```

Sintaxis comprobada para Python 3.10 con `ast.parse(..., feature_version=(3, 10))`
en los 7 archivos: sin errores.

### Estado final

| | Estado |
|---|---|
| Cambio de `UTC` en laptop (Python 3.11) | **Verificado**: mismas pruebas que antes |
| Sintaxis válida para 3.10 | **Verificado** con `ast`, no ejecutando en 3.10 |
| El backend arranca en el Jetson con Python 3.10 | **NO verificado**: el Jetson no se tocó |
| Cualquier cosa de cámara, GPU, YOLO o red | **NO verificado**: sin hardware todavía |

### Deuda aparte (no se arregla en esta sesión)

**Dos pruebas de `/robot/ask` ya fallaban antes de cualquier cambio** de esta
sesión. Fallan igual con y sin el cambio de `UTC`:

- `tests/backend/test_main.py::test_robot_ask_conserva_varias_oraciones_reales_tras_filtrar`
  (línea 302)
- `tests/backend/test_main.py::test_robot_ask_lista_numerada_tambien_se_detecta`
  (línea 378)

Salida real: ambas pasan `status_code == 200` pero el cuerpo no es el esperado.
`response.json()` devuelve un `answer` que empieza con `P…` y termina en
`…e tu perfil.`, y la prueba esperaba otro texto. En el log de la primera aparece
la pregunta `¿Qué puedes hacer?`. Hipótesis **sin comprobar**: la pregunta cae en
una respuesta local de Lumina antes de llegar al modelo simulado de la prueba.
No se investigó más.

**Avisos previos de ruff** en los 7 archivos tocados (9, ya estaban): imports
sin ordenar en `main.py`, `capture_headless.py` y `test_combined.py`; `F811`
(`Response` redefinido) y un `BLE001` en `backend/main.py`; `RUF100` por dos
`noqa` innecesarios; `RUF059` en `capture_headless.py`. En todo `backend/` y
`edge/` hay más de cien hallazgos previos de ruff.

**Pendiente menor:** `tests/backend/test_cell_simulator.py` todavía importa
`UTC` de `datetime`. Solo afecta si esa prueba se corre con Python 3.10.

### Tensiones documentales detectadas (deuda de reconciliación)

No se editó ningún documento. Se listarán en la ADR 0011 (supersede lo
desactualizado) y en una tarea de reconciliación:

- La visión de línea aparece en una "PC fija" (ADR 0010 y
  `aether_context_docs.md` §5) y en la Raspberry Pi 4 (hoja de conexión de la
  celda, 2026-10-05).
- Referencias a Raspberry Pi 5 y AI HAT+ (`aether_context_docs.md` §3 y §5,
  `0004-hardware-computo.md`).
- La hoja de la celda describe un PLC por Modbus; `backend/cell_line.py` maneja
  relevadores por GPIO 8 y 9 hacia un LOGO. `contracts/rest_api.md` define
  `sources.plc` como "GPIO abiertos". **Pendiente:** confirmar con el equipo qué
  está físicamente cableado antes de tocar GPIO.
- `CELL_AGENT_URL` (:8080) está solo en documentos; `backend/main.py` no la
  consume.
- `URLS_Y_COMANDOS.md` sigue diciendo que la celda es "estado simulado".

### Pendiente de datos para la siguiente sesión

- Salida de `cat /etc/nv_tegra_release` en el Jetson (para elegir el PyTorch
  exacto de NVIDIA).
- Si la cámara del robot es USB o CSI (`ls /dev/video*`,
  `v4l2-ctl --list-devices`).
- Usuario del Jetson (`whoami`), solo para la parte de SSH.
- En la Raspberry: no instalar `gpiod` y comprobar `sources.plc: false` en
  `/line/cell/status` antes de cualquier prueba.
