<!-- converted from Manana-montaje.docx -->

Montaje de mañana
Raspberry, sensores y sistema de visión. Solo lo que el programa abre de verdad.

En la Raspberry, antes de culpar al cable, confirma el número:
ls /dev/video*
Si sale video0, el programa ya apunta ahí. Si sale video1, ese día la variable vale 1.
cd backend
.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
Desde la laptop: http://IP-DE-ESA-RASPBERRY:8000/line/vision/stream

Sensores

IR1 se coloca antes de la cámara. IR2, después del pistón. Ninguno se atornilla al cabezal de la Raspberry: el código no tiene ese pin. Los números I0.0 de la hoja anterior eran un ejemplo, no están programados.