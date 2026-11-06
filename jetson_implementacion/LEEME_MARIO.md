# Cómo usar este paquete

En la Jetson, una vez:

```bash
cd ~/aether
git fetch origin +refs/heads/jetson-agente:refs/remotes/origin/jetson-agente
git switch jetson-agente 2>/dev/null || git switch -c jetson-agente --track origin/jetson-agente
git pull --ff-only origin jetson-agente
```

Si Git se queja de cambios locales, no los borres: abre Claude en `~/aether` y pídele que los revise.

Para empezar o seguir, cada vez:

```bash
bash ~/aether/jetson_implementacion/empezar.sh
```

No hace falta escribirle nada: el script abre Claude y él sigue solo con `CLAUDE.md`. Si abres `claude` a mano en `~/aether`, basta
con que le escribas "empieza", porque Claude Code siempre espera un primer mensaje.

Claude **se va a detener en cada PUERTA** y te va a pedir algo físico (levantar el carrito, tener el paro en la mano). Eso es a
propósito: él no ve el carrito y no puede confirmar que sea seguro.

## Qué hay aquí

- `CLAUDE.md`: su encargo y sus reglas.
- `PLAN.md`: las 11 etapas, con lo que existe y lo que falta.
- `ESTADO.md`: por dónde van. Se actualiza solo.
- `referencia/`: conexiones y armado de la guía 3.21, en texto.
- `modelo/parts.pt`: modelo con la clase `pieza_scrap`.
- `herramientas/`: diagnóstico, instalar el modelo y escuchar al ESP32 sin moverlo.
