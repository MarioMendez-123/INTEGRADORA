# Ejemplo 4: usa la cámara. Avanza por tramos y, si ve una persona, baja la velocidad y espera.
retroceder(0.60)
girar_a(180)
for tramo in range(8):                       # 8 tramos de 0.4 m = 3.2 m
    while hay_persona(area_min_pct=3.0):     # la cámara ve a alguien (más % = más cerca)
        v = vision()["obstaculos"]
        decir(f"veo {v['clases']} ocupando {v['area_max_pct']} % de la imagen: espero")
        esperar(1.0)
    avanzar(0.4, v=0.25)
decir("llegué")
