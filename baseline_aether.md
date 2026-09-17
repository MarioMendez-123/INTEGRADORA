# BASELINE VISUAL — AETHER

Guion audiovisual con timecodes aproximados, sincronizado con la voz de
Aether (speechSynthesis). Los tiempos pueden variar ligeramente según la
voz seleccionada; la estructura de eventos es la definitiva.

---

### 0:00–0:05 — Entrada

**AUDIO:** Aether:

> "Buenas tardes."

**PANTALLA:**

* Negro absoluto.
* Nada de texto.
* Nada de música.

**EVENTO:** La primera voz que escucha el público es Aether.

---

### 0:05–0:10

**AETHER:**

> "Mi nombre es Aether."

**PANTALLA:**

* Sigue negro.
* Al terminar la frase, aparece lentamente:

# AETHER

Pequeño, limpio, centrado.

---

### 0:10–0:16

**AETHER:**

> "Soy un sistema autónomo de inventario."

**PANTALLA:**
Debajo de AETHER aparece:

**AUTONOMOUS INVENTORY SYSTEM**

Sin animación exagerada.

---

# 0:16–0:23 — "Yo observo"

**AETHER:**

> "Yo observo."

> "Eso es lo primero que hago."

**PANTALLA:**

AETHER desaparece.

Negro → aparece lentamente una **imagen real de la cámara/entorno**.

No pongas todavía YOLO.

La idea es:

**Aether primero VE.**

---

# 0:23–0:31 — Primera detección

**AETHER:**

> "Una imagen aparece."

### EVENTO

Aparece la imagen de cámara.

---

**AETHER:**

> "Encuentro algo."

### EVENTO

Sobre uno de los objetos aparece:

```text
┌─────────────┐
│             │
│    OBJETO   │
│             │
└─────────────┘
```

Bounding box.

---

# 0:31–0:37 — Identificación

**AETHER:**

> "Intento identificarlo."

### EVENTO

El bounding box permanece.

Aparece una interfaz pequeña:

```text
OBJECT DETECTED
        ↓
IDENTIFYING...
```

Después:

```text
IDENTIFIED
```

Aquí puedes hacer una pequeña animación de escaneo.

---

# 0:37–0:45 — El problema

**AETHER:**

> "Pero encontrar algo no significa entenderlo."

**PANTALLA:**

La interfaz desaparece.

Queda solamente el objeto.

Después aparece:

# DETECTED ≠ UNDERSTOOD

Este es uno de los momentos visualmente importantes del opening.

---

# 0:45–0:52

**AETHER:**

> "Una cámara puede detectar un objeto."

**PANTALLA:**

Vuelve la cámara.

Bounding box.

Nada más.

---

# 0:52–0:59

**AETHER:**

> "Pero detectar no significa saber qué es."

### EVENTO

El bounding box permanece.

Pero el nombre del objeto aparece como:

```text
OBJECT
UNKNOWN
```

---

# 0:59–1:06

**AETHER:**

> "Y saber qué es no significa necesariamente saber dónde está."

### EVENTO

La pantalla se divide conceptualmente:

```text
IDENTITY ✓

LOCATION ?
```

Después aparece una referencia espacial.

Aquí puedes introducir visualmente **ArUco** por primera vez.

---

# 1:06–1:14

**AETHER:**

> "Mucho menos significa saber si esa información es confiable."

### EVENTO

Aparece:

```text
CONFIDENCE
    ?
```

La interfaz puede mostrar una barra que todavía no confirma nada.

Después:

# INFORMATION ≠ CERTAINTY

---

# 1:14–1:16

Silencio.

Aquí tienes un **microvacío visual**.

Todo desaparece.

Negro.

---

# 1:16 — INICIA LA MÚSICA

Este es el **primer gran cambio audiovisual**.

La música entra.

Y comienza la segunda parte.

---

# 1:16–1:22 — EL PROCESO

**AETHER:**

> "Por eso, mi proceso no termina cuando encuentro algo."

**PANTALLA:**

Aparece una línea horizontal.

Después:

```text
PERCIBIR
```

---

# 1:22–1:30

Aether:

> "Percibir."

> "Identificar."

> "Verificar."

> "Localizar."

> "Registrar."

### PANTALLA

Los cinco conceptos aparecen uno después de otro:

```text
PERCIBIR
     ↓
IDENTIFICAR
     ↓
VERIFICAR
     ↓
LOCALIZAR
     ↓
REGISTRAR
```

No los pongas todos desde el principio.

**Que aparezcan exactamente cuando Aether los pronuncia.**

---

# 1:30–1:36

**AETHER:**

> "Ese es el proceso que permite transformar una imagen en información."

### PANTALLA

La imagen de cámara se transforma visualmente:

```text
IMAGEN
   ↓
DATOS
   ↓
INFORMACIÓN
```

Este debería ser uno de los primeros momentos donde el público entiende
**qué está haciendo realmente Aether**.

---

# 1:36–1:43 — Arquitectura

**AETHER:**

> "Para hacerlo, necesito diferentes sistemas trabajando juntos."

### PANTALLA

Aparece AETHER en el centro.

Empiezan a aparecer conexiones.

```text
                 AETHER
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
   PERCEPCIÓN    CÓMPUTO     COMUNICACIÓN
                    │
                    ↓
                 MOVILIDAD
```

---

# 1:43–1:58 — TECNOLOGÍAS

Mientras Aether explica los sistemas:

### "Un sistema de percepción..."

Aparece:

**CAMERA**

**YOLO**

**QR / BARCODE**

**ARUCO**

---

### "Un sistema de computación..."

Aparece:

**JETSON ORIN NANO SUPER**

---

### "Un sistema de comunicación..."

Aparece:

**OBSERVATION**

↓

**INVENTORY**

---

### "Y un sistema de movilidad..."

Aparece:

**MOBILE PLATFORM**

Aquí **no necesitas fingir que la navegación autónoma completa ya está
implementada**.

Visualmente puedes poner:

```text
MOBILITY
NEXT DEVELOPMENT STAGE
```

---

# 1:58–2:08 — DECLARACIÓN

**AETHER:**

> "No soy solamente una cámara."

Pantalla:

# CAMERA ≠ AETHER

---

> "No soy solamente un robot."

Pantalla:

# ROBOT ≠ AETHER

---

> "Soy la integración de estos sistemas para resolver un problema."

Aquí aparece:

# AETHER

y debajo:

**PERCEPTION + COMPUTING + COMMUNICATION + MOBILITY**

Este es el **gran reveal conceptual**.

---

# 2:08–2:09

Aether:

> "¿Quieren ver cómo funciono?"

---

# 2:09–3:00 — TU PRIMERA INTERVENCIÓN

Aether queda en silencio.

**TÚ ENTRAS.**

Tu explicación:

> "Ahora sí."

> "Vamos a abrirlo."

### PANTALLA

Aquí comienza la transición de **"Aether hablando de sí mismo"** a
**"ingenieros explicando cómo está construido".**

Tu pantalla debería acompañar exactamente tus palabras.

---

## 2:10–2:20

Tú:

> "Cuando Aether dice que percibe..."

### PANTALLA

```text
PERCEPCIÓN
```

↓

**YOLO**

↓

Bounding boxes reales.

---

## 2:20–2:30

Tú:

> "Cuando dice que identifica..."

### PANTALLA

```text
DETECTION
       ↓
BARCODE / QR
       ↓
IDENTITY
```

Puedes mostrar una captura real del sistema leyendo un código.

---

## 2:30–2:40

Tú:

> "Después viene la localización."

### PANTALLA

```text
ARUCO
 ↓
POSITION
 ↓
OBJECT LOCATION
```

---

## 2:40–2:52

Tú:

> "Toda esa información..."

### PANTALLA

Entra el Jetson:

```text
CAMERA
   ↓
YOLO
   ↓
JETSON
   ↓
RESULT
```

Aquí es donde puedes mostrar **una foto/render real del hardware**, no
una animación genérica.

---

## 2:52–3:00

Tú:

> "Después, los resultados llegan a nuestro propio motor de inventario."

### PANTALLA

Una Observation entra:

```text
OBSERVATION
──────────────
Object: ...
Location: ...
Confidence: ...
Timestamp: ...
```

↓

```text
DECLARED INVENTORY
```

---

# 3:00 — SEGUNDO DIÁLOGO

Tú:

> "Pero todo esto se entiende mejor cuando deja de ser una explicación y
> comienza a funcionar."

Pantalla:

# LIVE SYSTEM

La música baja.

---

# 3:05

Tú:

> "Aether."

Pantalla:

**AETHER**

---

# 3:05–3:10

Aether:

> "Dígame, señor."

Pantalla:

**SYSTEM READY**

---

# 3:10–3:15

Tú:

> "Muéstrales qué puedes ver."

Pantalla:

**LIVE INPUT**

---

# 3:15–3:16

Aether:

> "En un momento."

Pantalla:

```text
INITIALIZING...
```

---

# 3:16–3:20

Aether:

> "Esto es lo que soy capaz de ver ahora mismo."

### BOOM:

**VIDEO REAL DE LA CÁMARA**

Aquí ya no necesitas hacer una animación.

**Muestra el sistema real.**

---

# 3:20–3:50 — DEMO REAL

Tú explicas:

> "Lo que están viendo es la percepción del sistema funcionando en tiempo
> real."

### PANTALLA

Stream real.

YOLO detectando.

Bounding boxes.

---

> "Cada recuadro representa una detección..."

### PANTALLA

Puedes hacer que una detección se resalte.

---

> "A partir de ahí..."

### PANTALLA

```text
DETECTION
   ↓
IDENTITY
   ↓
LOCATION
   ↓
OBSERVATION
```

---

# 3:50–4:00 — CIERRE

Aquí yo **simplificaría muchísimo la pantalla**.

Mientras dices:

> "Y esto no termina aquí."

La interfaz desaparece.

---

> "Aether comienza observando."

Pantalla:

# AETHER

---

> "Pero no queremos que termine ahí."

La palabra **OBSERVAR** aparece y se desplaza hacia atrás.

---

> "Queremos que vea, comprenda y decida."

Aparece:

# VER

↓

# COMPRENDER

↓

# DECIDIR

---

> "Porque el futuro de la automatización no es hacer más."

Todo desaparece.

---

> **"Es aprender a hacerlo mejor."**

Negro.

Silencio.

---

> "Esto es Aether."

### PANTALLA FINAL

# AETHER

**AUTONOMOUS INVENTORY SYSTEM**

Y nada más.

---

# Estructura visual completa (7 bloques)

| Tiempo aprox. | Bloque                    | Pantalla                               |
| ------------- | ------------------------- | --------------------------------------- |
| 0:00–0:16     | Presentación              | Negro → AETHER                          |
| 0:16–1:16     | Aether observa            | Cámara + detección                      |
| 1:16–2:08     | Aether explica su proceso | Percepción → información                |
| 2:08–3:00     | Tú explicas tecnología    | YOLO → QR → ArUco → Jetson → Inventory  |
| 3:00–3:15     | Preparación demo          | LIVE SYSTEM                             |
| 3:15–3:50     | Demo                      | Sistema real                            |
| 3:50–4:00     | Cierre                    | VER → COMPRENDER → DECIDIR → AETHER     |
