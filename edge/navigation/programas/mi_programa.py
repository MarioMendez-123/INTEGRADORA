# Programa del carrito. Empieza acoplado en la banda, mirando a la banda.
retroceder(0.60)          # avisa por Lumina y retrocede despacio
girar_a(180)
avanzar(1.0)
decir(f"batería {carrito.bateria()} V")
avanzar(3.0)
retroceder(1.0)