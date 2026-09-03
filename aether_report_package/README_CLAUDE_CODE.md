# Aether — proyecto fuente del informe (ACA-F-14)

Este es el código fuente que genera `AETHER_Informe_Integrador.docx`.
No edites el .docx directamente — edita estos archivos y vuelve a
correr `node assemble.js`. Así el documento sale con el mismo diseño
siempre, sin importar cuánto contenido nuevo se agregue.

## Cómo correrlo

```bash
npm install docx          # una sola vez
node assemble.js          # genera AETHER_Informe_Integrador.docx
```

Para verificar visualmente antes de dar por bueno un cambio (recomendado
siempre que se edite algo), usa el flujo del skill de docx: convierte a
PDF con LibreOffice y renderiza las páginas como imágenes para revisarlas.
No des un cambio por bueno sin verlo renderizado.

## Estructura

- `build.js` — sistema de diseño: colores, fuentes, y todos los
  componentes reutilizables (h1, h2, h3, párrafo, bullet, tabla,
  figura, callout de pendiente, etc.). **Este archivo define el estilo.
  No lo dupliques — si necesitas un componente nuevo (ej. un bloque de
  código), agrégalo aquí siguiendo el mismo patrón.**
- `main.js` — portada, header/footer, front matter (abstract, índice).
- `ch_intro_1.js`, `ch_2.js`, `ch_3.js`, `ch_4_end.js` — el contenido de
  cada capítulo.
- `assemble.js` — junta todo y escribe el .docx final.
- `assets/` — logo, diagramas (SVG + PNG ya renderizados).

## Sistema de diseño (para que cualquier cosa nueva combine)

Colores (hex, sin #):
- `C.ink` 14171F — texto de encabezados
- `C.body` 1F2328 — texto de cuerpo
- `C.violet` / `C.violetDark` 5B4FE8 / 3F35B0 — acento navegable/técnico
- `C.green` 1E8E52 (fill C.greenFill EAF7F0) — solo para lo verificado
  con hardware real, nunca para otra cosa
- `C.amber` 9C6512 (fill C.amberFill FDF3E4) — pendiente / atención
- `C.muted` / `C.steel` 5A5F6E — texto secundario, captions

Fuentes (deben estar instaladas en el sistema donde se corra el script,
si no Word las sustituye):
- `IBM Plex Sans` — texto de cuerpo y encabezados
- `IBM Plex Mono` — anotación técnica, cifras, código, captions de
  figura/tabla, nombres de archivo o función mencionados inline
- `Bebas Neue` — solo se usa en el logo/portada (ya está rasterizada
  en assets/, no hace falta la fuente instalada para eso)

En Ubuntu/Debian: `apt-get install fonts-ibm-plex fonts-bebas-neue`

## Cómo agregar contenido con evidencia real (screenshots, código)

### Screenshots del dashboard o de detecciones reales
1. Toma la captura y guárdala en `assets/` (PNG).
2. Usa el helper `figure(path, widthPx, heightPx, numero, caption)` de
   `build.js` — es el mismo que ya usa el reporte para los diagramas.
   Ejemplo, dentro de cualquier capítulo:
   ```js
   ...figure(A("dashboard_inventory_real.png"), 560, 340, "3",
     "Vista real del dashboard de inventario, corrida del 2026-09-01."),
   ```
3. Actualiza el número de figura siguiente disponible y agrégalo también
   al Índice de Figuras y Tablas en `main.js` (es una lista manual, no
   automática).
4. Si esa figura reemplaza un bloque `calloutPending(...)` de "pendiente",
   borra ese callout — no dejes el aviso de pendiente junto a la evidencia
   real que lo resuelve.

### Fragmentos de código real
Todavía no existe un componente de bloque de código en `build.js`.
Antes de improvisarlo con una tabla, agrégalo como componente reutilizable
(mismo patrón que `calloutPending`), por ejemplo:

```js
function codeBlock(code) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top:{style:BorderStyle.SINGLE,size:2,color:"2A2E37"},
               bottom:{style:BorderStyle.SINGLE,size:2,color:"2A2E37"},
               left:{style:BorderStyle.SINGLE,size:2,color:"2A2E37"},
               right:{style:BorderStyle.SINGLE,size:2,color:"2A2E37"} },
    rows: [new TableRow({ children: [new TableCell({
      shading: { type: ShadingType.CLEAR, fill: "14171F" },
      margins: { top:160, bottom:160, left:200, right:200 },
      children: code.split("\n").map(line => new Paragraph({
        children: [new TextRun({ text: line || " ", font: FONT_MONO,
          color: "E7E9EE", size: 18 })],
      })),
    })] })],
  });
}
```
Agrégalo a `module.exports` en `build.js` y úsalo igual que `figure()`.
No uses fondo blanco con texto negro para código — rompe el sistema de
color establecido (fondo oscuro = contenido técnico verificado, es la
misma lógica visual del dashboard real del proyecto).

### Actualizar un `[PENDIENTE]` a contenido real
Busca el texto exacto en `ch_2.js` / `ch_3.js` / `ch_4_end.js`
(`calloutPending(...)` o `pendingTag()`), reemplázalo por el contenido
real, y quita la marca de pendiente. No dejes ambos a la vez.

### Actualizar el índice de figuras/tablas y el índice general
Ambos son listas escritas a mano en `main.js` (`tocLine(...)` y las
líneas del índice de figuras). Si agregas una sección, tabla o figura,
agrégala ahí también y ajusta los números de página **verificando el PDF
renderizado**, no adivinando.

## Qué NO hacer

- No regeneres el documento completo desde cero con otro enfoque de
  diseño — usa los componentes existentes en `build.js`.
- No inventes datos, capturas o resultados que no vengan de una prueba
  real (Principio 4.5 del proyecto). Si no hay evidencia real todavía,
  se queda como `[PENDIENTE]`.
- No cambies la paleta de colores ni las fuentes sin decírselo a Mario
  primero — es la misma identidad visual del dashboard real de Aether.
