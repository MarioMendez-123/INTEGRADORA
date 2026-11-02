# Ejemplo 1: sale de la banda en reversa, da media vuelta y avanza 1 metro.
# El carrito empieza acoplado en la banda (x=0, y=0, mirando a la banda).
retroceder(0.60)          # avisa por Lumina, espera 2 s y retrocede despacio
girar_a(180)              # ahora mira hacia el lado contrario de la banda
avanzar(1.0)              # una recta de 1 m (frena solo si ve algo a menos de 40 cm)
x, y, grados = carrito.pose()
decir(f"estoy en x={x:.2f} m, y={y:.2f} m, mirando a {grados:.0f} grados; batería {carrito.bateria()} V")
