# Aether — Contexto del proyecto

El contexto maestro de este proyecto vive en [`aether_context_docs.md`](./aether_context_docs.md).
Cárgalo al inicio de cualquier sesión de trabajo sobre este repo — contiene las
decisiones arquitectónicas de Fase 0 (secciones 3 y 5), los principios no
negociables de terminología y honestidad de producto (sección 4), la estructura
de carpetas (sección 6) y las reglas de comportamiento para Claude Code en este
proyecto (sección 7).

No reinventar arquitectura ya decidida ahí sin pasar por el proceso de cambio
de la sección 9 de ese documento.

## Si esta sesión corre en la Jetson del carrito

Si la máquina es aarch64 (`mario@mario-desktop`, Jetson Orin Nano), tu encargo está en
[`jetson_implementacion/CLAUDE.md`](./jetson_implementacion/CLAUDE.md): léelo y síguelo desde tu primera respuesta, sin esperar
otro prompt. En cualquier otra máquina, ignora esa carpeta.
