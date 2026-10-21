"""Servidor mínimo para correr Lumina sola: python server.py  ->  http://localhost:8000"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from lumina import router

app = FastAPI()
app.include_router(router)
# Montado al final: las rutas de arriba se resuelven primero.
@app.middleware("http")
async def no_cache(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"  # el navegador servía JS viejo
    return response


app.mount("/", StaticFiles(directory=Path(__file__).parent / "web", html=True), name="web")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
