# Ejemplo 3: avanza hasta la esquina; si hay algo enfrente espera, y si tarda mucho cambia de plan.
retroceder(0.60)
girar_a(180)
try:
    avanzar(3.22)         # el ESP32 frena solo a 40 cm; la Jetson espera y pide ayuda a los 20 s
except ErrorCarrito as falla:
    decir(f"no pude llegar: {falla}")
else:
    decir(f"llegué; el frente mide {distancia('frente')} mm")
