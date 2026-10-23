"""Experimento (una sola vez, ya corrido): ¿otras palabras de activación se reconocen mejor que «Lumina» con Vosk?

    powershell -ExecutionPolicy Bypass -File scripts\voz_sintetica.ps1 -Carpeta pa -Frases scripts\experimentos\frases_palabras_alternativas.json
    powershell -ExecutionPolicy Bypass -File scripts\voz_sintetica.ps1 -Carpeta ruido
    backend\.venv\Scripts\python.exe scripts\experimentos\vosk_palabras_alternativas.py --palabras pa --murmullo ruido

Resultados y límites (UNA voz sintética, 3 velocidades por palabra, ruido simulado): docs/auditoria/PALABRA_CLAVE.md.
"""
import argparse
import glob, json, os, sys, wave, collections, unicodedata
import numpy as np, vosk
vosk.SetLogLevel(-1)
_a = argparse.ArgumentParser(); _a.add_argument("--palabras", required=True); _a.add_argument("--murmullo", required=True); _a.add_argument("--modelo", default=os.environ.get("AETHER_VOICE_MODEL", "")); _args = _a.parse_args()
D = os.path.abspath(_args.palabras); V = os.path.abspath(_args.murmullo)
rng = np.random.default_rng(11)
model = vosk.Model(r"C:\aether-voz\vosk-model-small-es-0.42")
def leer(p):
    with wave.open(p, "rb") as w: return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64)
def rms(x): return float(np.sqrt(np.mean(x**2)))
def sa(t): return "".join(c for c in unicodedata.normalize("NFD", t) if unicodedata.category(c) != "Mn").lower()
clips = {os.path.basename(p)[:-4]: leer(p) for p in sorted(glob.glob(os.path.join(D, "wake_*.wav")))}
pool = [leer(p) for p in sorted(glob.glob(os.path.join(V, "nowake_*.wav")))]
palabras = ["aurora","atenea","nebula","cosmos","orion","estrella","asistente","robot","helios","sirena"]
def babble(n):
    out = np.zeros(n)
    for i in rng.choice(len(pool), 3, replace=False):
        x = pool[i]; ini = int(rng.integers(0, len(x))); out += np.tile(x, int(np.ceil((n+len(x))/len(x)))+1)[ini:ini+n]
    return out
def mezcla(x, cond):
    s = np.concatenate([np.zeros(8000), x, np.zeros(12800)]); ref = rms(x); k, v = cond
    if k == "limpio": pass
    elif k == "nivel": s = s * (v/ref)
    else:
        r = babble(len(s)) if k == "babble" else rng.normal(0,1,len(s))
        s = s + r * (ref/10**(v/20)/max(rms(r),1e-9))
    return np.clip(s,-32768,32767).astype(np.int16)
def reconocer(a):
    rec = vosk.KaldiRecognizer(model,16000); out=[]; b=a.tobytes()
    for i in range(0,len(b),3200):
        if rec.AcceptWaveform(b[i:i+3200]): out.append(json.loads(rec.Result()).get("text",""))
    out.append(json.loads(rec.FinalResult()).get("text","")); return " ".join(t for t in out if t).strip()
conds=[("limpio",None),("nivel",300),("babble",10),("babble",0),("blanco",5)]
tabla=collections.defaultdict(lambda: collections.defaultdict(list)); ejemplos={}
for nombre,x in clips.items():
    idx=int(nombre.split("_")[1]); pal=palabras[idx]
    for c in conds:
        t=reconocer(mezcla(x,c)); toks=sa(t).split()
        ok = pal in toks[:1] or (pal=="nebula" and False)
        tabla[pal][f"{c[0]}{'' if c[1] is None else c[1]}"].append(ok); ejemplos.setdefault((pal,c[0]),t)
cols=["limpio","nivel300","babble10","babble0","blanco5"]
print(f"{'palabra':10}"+"".join(f"{c:>10}" for c in cols)+"   total")
for pal in palabras:
    fila=[tabla[pal][c] for c in cols]; tot=sum(sum(f) for f in fila); n=sum(len(f) for f in fila)
    print(f"{pal:10}"+"".join(f"{sum(f)}/{len(f)}".rjust(10) for f in fila)+f"   {tot}/{n}")
print("\nejemplo limpio:", {p: ejemplos[(p,'limpio')] for p in palabras})
