# Capítulo 23: Git, documentación y auditoría

*Cómo se guarda la historia del proyecto, cómo se registran las decisiones, por qué la documentación envejece más rápido que el código y qué hábitos permiten defender cada afirmación.*

## Cincuenta y nueve commits, una máquina del tiempo

Al 24 de octubre de 2026 el repositorio de Aether tiene **59 commits** (puntos de guardado) y varias **ramas**. **Git** es el programa que guarda **cada versión** de los archivos con quién, cuándo y por qué se cambió; un **repositorio** es la carpeta con su historia; un **commit** es un punto de guardado con un mensaje; una **rama** es una línea paralela de trabajo. **GitHub** es el servicio donde el equipo guarda una copia en línea; el repositorio es **público** a propósito (los comandos de Linux lo clonan sin contraseña).

Las ramas del proyecto, según el repositorio:

| Rama | Para qué |
|---|---|
| `main` | La rama principal |
| `feature/robot-lumina-camera-sharing` | Lumina y la cámara compartida |
| `feature/hardening-cloudflare` y `feature/seguridad-y-alianzas` | Endurecimiento del sitio público y sección Alianzas |
| `jetson-setup` | Preparación del Jetson |
| `jetson-agente` | Los agentes de campo y la voz (la rama actual de trabajo) |
| `jetson-agente-limpia` | Una versión de la anterior depurada de datos específicos del lugar |
| `gh-pages` | El sitio público estático |

## Mensajes de commit que cuentan una historia

Los mensajes del proyecto son **descriptivos y en español** y suelen explicar el motivo. Ejemplos reales: *"Corrige el video del agente bloqueado en index.html: el `<meta>` de CSP no llevaba los orígenes del agente"*; *"Observaciones: se juntan en lotes (`AETHER_OUTBOX_INTERVAL_S`) en vez de un POST por observación"*. El trabajo grande se partió en **bloques pequeños y reversibles** (R0 a R6 en la rama `jetson-agente`); el documento de trazabilidad da para cada bloque su commit y **cómo se revierte** (`git revert <commit>`): una práctica de ingeniería profesional, porque permite arrepentirse sin perder el resto.

## Antes de subir: la revisión de secretos

El repositorio es público, así que una clave subida **se considera filtrada para siempre**. Los hábitos del proyecto (capítulo 21): `.gitignore` con los archivos sensibles, **`git diff --stat` antes de cada `push`** para ver qué sube, ninguna clave en el chat ni en los documentos, y una rama de limpieza para sacar datos específicos del lugar. Dos comandos útiles, `[Laptop · PowerShell o Git Bash]`, desde la raíz:

```bash
git status --short       # qué cambió, sin subirlo
git diff --stat          # cuánto cambió en cada archivo
```

## La pirámide de documentos

El proyecto tiene mucha documentación y, por eso, **un orden de autoridad**. De más a menos confiable:

| Nivel | Qué es | Ejemplos |
|---|---|---|
| **Código y pruebas** | La verdad de lo que corre | `backend/*.py`, `tests/` |
| **Bitácora de hardware real** | Lo que se hizo y vio en el Jetson, con estados `[reportado]` y `NO verificado` | `docs/jetson/BITACORA_JETSON.md`, `SETUP_JETSON.md` |
| **Contexto maestro** | Decisiones de arquitectura, principios y reglas | `aether_context_docs.md`, `CLAUDE.md` |
| **ADR** (*Architecture Decision Records*) | Una decisión, sus alternativas y su estado | `docs/architecture/decisions/0001…0012` |
| **Contratos** | Qué datos intercambian los programas | `contracts/*.md` |
| **Guías operativas** | Cómo arrancar y operar | `docs/guia_arranque.md`, `COMANDOS_LINUX.md`, `URLS_Y_COMANDOS.md` |
| **Documentos viejos o superados** | Conservados como historia | `docs/academic/AI_CONTEXT.md` (marcado SUPERADO), ADR 0008 |

Regla de oro del libro (y de buena parte del equipo): **cuando dos niveles se contradicen, gana el de arriba.** Y un hallazgo que la auditoría del 22 de octubre documentó: *"ADR 0006 está 'Aceptada' y dice MQTT, pero `edge/comms/mqtt_client/` está vacío: decisión aceptada, sin una sola línea de código"*. Una ADR aceptada no es una función entregada.

## Las ADR: una decisión cabe en una página

Una **ADR** tiene: contexto, decisión, alternativas evaluadas, consecuencias y **estado** (borrador, aceptada, superada). En el proyecto hay **12**; algunas, como la 0004 (hardware de cómputo) y la 0006 (comunicaciones), llevan una nota honesta: *"Opciones evaluadas, ventajas/desventajas e impacto en tiempo/costo no están documentados en el contexto fuente"*. Las **superadas** no se borran: la ADR 0008 (brazos robóticos) sigue en el repositorio, marcada como histórica y reemplazada por la 0010. El **proceso de cambio** (sección 9 del contexto maestro) obliga a registrar cada cambio de alcance con fecha y motivo, reflejarlo en la ADR y propagarlo a las carpetas y documentos afectados.

## El registro de cambios y la bitácora

Dos documentos cuentan la evolución día a día:

- **`docs/CHANGELOG.md`**: solo decisiones que afectan a más de una persona (el cambio de la línea del 16 de septiembre; el cargador y la vista por capas del 30 de septiembre), con "qué cambió", "por qué", "qué deben tener en cuenta" y "qué NO cambió".
- **`docs/jetson/BITACORA_JETSON.md`**: **diez sesiones** entre el 21 y el 23 de octubre, cada una con *quién ejecutó qué* (Mario corría los comandos en el Jetson y pegaba la salida; el asistente de programación analizaba), lo comprobado, lo no verificado y el siguiente paso. Es el modelo de cómo se documenta hardware real: **con las salidas pegadas y las etiquetas honestas**.

## Auditoría y trazabilidad

Una **auditoría** revisa qué hay, qué se afirma y si coinciden. El equipo hizo la del **22 de octubre** (`docs/auditoria/`) en fases: A (qué hay: procesos, quién inicia a quién, cómo viaja cada dato, redes, ADR vivas y muertas, contradicciones entre documentos, código y mensajes) y B (qué se sabe de fuera, con **fuentes externas citadas como referencia, no como evidencia**). De ahí salió la decisión final de agentes (`DECISION_FINAL_AGENTES.md`) y la **matriz de trazabilidad** (`TRAZABILIDAD.md`): cada requisito (RF-01 a RF-09, RNF-01 a RNF-08) enlazado a sus archivos, a su prueba o verificación y a su estado (**COMPROBADO** o **NO COMPROBADO**). Es una herramienta poderosa para un jurado: *"¿cómo se sabe que el audio no se guarda?" → RF-06 → `test_voice_core.py` (revisión estática)*.

Para comparar alternativas de arquitectura, el equipo también guardó el material de un procedimiento de **torneo de soluciones** (carpeta `.arena/` y `docs/auditoria/TAREA_BASE_ARENAS.md`), con una tarea base, una rúbrica de puntuación y rondas, para decidir con criterios explícitos en lugar de intuición.

## El libro mismo es un producto de este método

Este libro respeta la pirámide: lo que no está en el código ni en la bitácora se marca **PENDIENTE**, las correcciones entre documentos están en `docs/libro/NOTAS_CORRECCIONES.md` y cada afirmación lleva su etiqueta de certeza.

## Una red de conocimiento sobre el proyecto

El repositorio incluye un **grafo de conocimiento** generado con la herramienta **Graphify** (`graphify-out/`): una red de **2 336 nodos y 4 062 conexiones** agrupados en **182 comunidades** (por ejemplo "Motor de audio", "Robot Lumina (UI)", "Celda real (PLC/Modbus)", "Publicador de cámara"), con un archivo `graph.html` interactivo y un informe (`GRAPH_REPORT.md`). Sirve para ubicar rápido qué partes del proyecto se relacionan. El 94 % de sus conexiones son **extraídas directamente** del código y el 6 % **inferidas**.

## Cómo lo hacen las empresas

El flujo profesional añade **revisión de código** (otra persona aprueba cada cambio, con *pull requests*), **integración continua**, **versionado de lanzamientos** y documentación **generada** a partir del código para que no envejezca. Aether tiene el germen: ADR, bitácora, trazabilidad y un paquete que **genera el informe integrador desde código** (`aether_report_package/`, con los capítulos como archivos fuente y un generador que produce el documento de Word). Lo que falta es automatizar: ninguna de esas piezas se ejecuta sola.

## Preguntas de repaso: historia y documentos

1. ¿Qué diferencia hay entre un commit y una rama?
2. ¿Por qué un secreto subido a un repositorio público se considera filtrado "para siempre"?
3. Ordenar de más a menos confiable: guía de construcción, código, bitácora del Jetson, ADR.
4. ¿Qué dice la ADR 0006 y por qué "aceptada" no significa "implementada"?
5. ¿Qué hace la matriz de trazabilidad y cómo ayuda en una defensa?
6. ¿Cómo se revierte un bloque de trabajo sin perder los demás?
