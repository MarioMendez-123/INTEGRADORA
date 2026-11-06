# Convenciones del libro (archivo de trabajo, no va al PDF)

## Etiquetas de certeza
- **VERIFICADO**: lo vimos en código, en una prueba automática o en una salida real pegada.
- **MEDIDO**: una cifra obtenida con una prueba o un instrumento (se dice dónde y con qué).
- **NO VERIFICADO**: se supone o viene de un documento, pero nadie lo comprobó.
- **PENDIENTE**: falta un dato que solo el equipo puede dar. Lleva un código (P-01, P-02...) que remite a la lista final.
- Lo que es regla general de ingeniería (no medida en Aether) se dice en la frase: "regla general".

## Pendientes
- Dentro de los capítulos solo aparece la etiqueta corta `PENDIENTE (P-xx)`.
- La lista completa vive UNICAMENTE al final del libro, después del glosario.
- El borrador acumulado está en `_trabajo/pendientes_acumulados.md`.

## Máquinas y ventanas en cada comando
`[Laptop · PowerShell]`, `[Laptop · Git Bash]`, `[Jetson · SSH]`, `[Pi 4 · SSH]`, `[Jetson · VNC]`.

## Responsables (dicho por Mario, 24 oct 2026)
Mario: software del robot y visión. Isaac: diseño mecánico, CAD e impresión 3D. Pedro: pistón de scrap.
Uriel: comunicación de la Raspberry con el PLC y la visión. David: ensamble mecánico y electrónica.
Emmanuel: HMI/GUI aparte.

## Regla de contradicciones
Código > bitácora del Jetson (21 oct) > documentos viejos. Cada contradicción va a NOTAS_CORRECCIONES.md.
