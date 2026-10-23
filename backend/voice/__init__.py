"""Servicio de voz de la laptop: micrófono -> detección de voz -> reconocedor local -> solo texto.

Se ejecuta como proceso aparte (python -m voice.service, desde backend/) para no bloquear a uvicorn.
Nunca guarda audio en disco ni lo manda a ningún lado: solo viaja texto por el WebSocket /voice/ws.
"""
