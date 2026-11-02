# Ejemplo 2: banda -> descarga -> banda (la descarga está a 4 m, a 90° a la izquierda).
retroceder(0.60)
girar_a(180)
ir_a(-3.82, 0.0)          # recta hasta la esquina
girar_a(90)               # mira hacia la estación de descarga
acoplar(2.0)              # entra recto y despacio hasta los topes
fijar_pose(-3.82, 2.0, 90)
decir("descargando (la torre todavía no está en el firmware: pausa de 2 s)")
esperar(2)

retroceder(0.60)
girar_a(-90)
ir_a(-3.82, 0.0)
girar_a(0)
ir_a(-2.0, 0.0)
acoplar(2.0)
fijar_pose(0, 0, 0)
decir("de vuelta en la banda")
