"""Música de fondo de las diapositivas: worship electrónico suave, generado por código (sin derechos de terceros).

Uso (desde la raíz): backend\\.venv\\Scripts\\python.exe aether-video\\intro\\scripts\\musica_fondo.py salida.wav
Va debajo de la voz: sin melodía protagonista y con la zona de 1-4 kHz rebajada para no competir con quien expone.
Dura lo que la presentación y más; empieza y termina en silencio, así que el bucle no se nota.
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 72
BEAT = 60 / BPM
BAR = BEAT * 4
BARS = 112  # 112 compases a 72 BPM = 6:13
N = int(BARS * BAR * SR)
rng = np.random.default_rng(7)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# Re mayor, progresión típica de worship con acordes abiertos: I, V, vi, IV (y una variante IV, I, V, vi).
D, A, Bm, G = [38, 57, 62, 64, 69, 74], [33, 57, 61, 64, 69, 76], [35, 54, 59, 62, 66, 74], [31, 55, 59, 62, 69, 74]
PROG_A = [D, A, Bm, G]
PROG_B = [G, D, A, Bm]


def pad_chord(notes, seconds):
    """Pad cálido: armónicos que decaen, con voces desafinadas distintas en cada canal."""
    t = np.arange(int(seconds * SR)) / SR
    out = np.zeros((len(t), 2))
    for midi in notes[1:]:
        f0 = hz(midi)
        for h, amp in ((1, 1.0), (2, 0.42), (3, 0.2), (4, 0.09), (6, 0.03)):
            for ch, cents in ((0, -7), (0, 4), (1, 7), (1, -4)):
                f = f0 * h * 2 ** (cents / 1200)
                out[:, ch] += amp * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28))
    return out / np.abs(out).max()


def render_pads():
    """Cada acorde dura 2 compases y se funde con el siguiente."""
    seg = 2 * BAR
    fade = int(1.8 * SR)
    cache = {id(c): pad_chord(c, seg + 1.8) for c in PROG_A}
    out = np.zeros((N, 2))
    env = np.ones(int((seg + 1.8) * SR))
    env[:fade] = np.sin(np.linspace(0, np.pi / 2, fade)) ** 2
    env[-fade:] = np.cos(np.linspace(0, np.pi / 2, fade)) ** 2
    for k in range(BARS // 2):
        bar = k * 2
        prog = PROG_B if 56 <= bar < 72 else PROG_A
        chord = prog[k % 4]
        i = int(bar * BAR * SR)
        y = cache[id(chord)] * env[:, None]
        j = min(N, i + len(y))
        out[i:j] += y[: j - i]
    return out, prog_at


def prog_at(bar):
    prog = PROG_B if 56 <= bar < 72 else PROG_A
    return prog[(bar // 2) % 4]


def pluck(f, seconds=1.6):
    """Nota de guitarra ambiental: ataque suave y cola corta."""
    t = np.arange(int(seconds * SR)) / SR
    y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t * 5) + 0.12 * np.sin(6 * np.pi * f * t) * np.exp(-t * 9)
    return y * np.minimum(1, t / 0.012) * np.exp(-t * 2.6)


def render_arp():
    """Arpegio en corcheas con eco de corchea con puntillo: el sello del worship."""
    dry = np.zeros(N)
    step = BEAT / 2
    pattern = [2, 3, 4, 3, 5, 3, 4, 3]
    for s in range(int(BARS * BAR / step)):
        bar = int(s * step / BAR)
        notes = prog_at(bar)
        midi = notes[pattern[s % 8]] + 12
        y = pluck(hz(midi)) * (0.75 + 0.25 * (s % 8 == 0))
        i = int(s * step * SR)
        j = min(N, i + len(y))
        dry[i:j] += y[: j - i]
    wet = np.zeros((N, 2))
    delay = int(BEAT * 0.75 * SR)
    wet[:, 0] += dry
    wet[:, 1] += dry
    gain = 0.5
    for rep in range(1, 7):
        d = delay * rep
        ch = rep % 2  # el eco rebota de un lado a otro
        wet[d:, ch] += gain * dry[:-d]
        gain *= 0.6
    return wet / np.abs(wet).max()


def render_pulse():
    """Bombo suave y sub en negras: la parte electrónica. Sin agudos, para no estorbar."""
    out = np.zeros(N)
    t = np.arange(int(0.42 * SR)) / SR
    kick = np.sin(2 * np.pi * (46 * t + 34 * (1 - np.exp(-t * 26)) / 26)) * np.exp(-t * 8)
    for b in range(int(BARS * 4)):
        i = int(b * BEAT * SR)
        j = min(N, i + len(kick))
        out[i:j] += kick[: j - i]
    return out


def render_sub():
    out = np.zeros(N)
    for bar in range(0, BARS, 2):
        i = int(bar * BAR * SR)
        n = int(2 * BAR * SR)
        j = min(N, i + n)
        t = np.arange(j - i) / SR
        env = np.minimum(1, t / 0.5) * np.minimum(1, (t[-1] - t) / 0.5)
        out[i:j] += np.sin(2 * np.pi * hz(prog_at(bar)[0]) * t) * env
    return out


def render_air():
    """Brillo: los mismos acordes dos octavas arriba, con trémolo lento, y un soplo de ruido agudo."""
    out = np.zeros((N, 2))
    t = np.arange(int((2 * BAR + 1.8) * SR)) / SR
    fade = int(1.8 * SR)
    env = np.ones(len(t))
    env[:fade] = np.sin(np.linspace(0, np.pi / 2, fade)) ** 2
    env[-fade:] = np.cos(np.linspace(0, np.pi / 2, fade)) ** 2
    for k in range(BARS // 2):
        bar = k * 2
        y = np.zeros((len(t), 2))
        for m in prog_at(bar)[2:]:
            for ch, cents in ((0, -5), (1, 5)):
                y[:, ch] += np.sin(2 * np.pi * hz(m + 24) * 2 ** (cents / 1200) * t + rng.uniform(0, 6.28)) * (0.75 + 0.25 * np.sin(2 * np.pi * (0.5 + ch * 0.13) * t))
        i = int(bar * BAR * SR)
        j = min(N, i + len(t))
        out[i:j] += (y * env[:, None])[: j - i] / 4
    noise = rng.standard_normal((N, 2))
    spec = np.fft.rfft(noise, axis=0)
    f = np.fft.rfftfreq(N, 1 / SR)
    spec *= np.exp(-((np.log2(np.maximum(f, 1) / 8000)) ** 2) / (2 * 0.6**2))[:, None]
    hiss = np.fft.irfft(spec, N, axis=0)
    return out + hiss / np.abs(hiss).max() * 0.12


def curve(points):
    """Automatización por tramos: [(compás, nivel), ...]."""
    x = np.array([p[0] for p in points]) * BAR * SR
    return np.interp(np.arange(N), x, [p[1] for p in points])


def reverb(x, seconds=3.2):
    """Convolución con ruido que decae: una sala grande. Rápido gracias a la FFT."""
    n_ir = int(seconds * SR)
    size = N + n_ir
    out = np.zeros_like(x)
    decay = np.exp(-np.arange(n_ir) / SR * 6.9 / seconds)
    for ch in (0, 1):
        ir = rng.standard_normal(n_ir) * decay
        ir = np.cumsum(ir) * 0.012 + ir * 0.1  # cola algo más oscura que el sonido directo
        wet = np.fft.irfft(np.fft.rfft(x[:, ch], size) * np.fft.rfft(ir, size), size)[:N]
        out[:, ch] = wet / np.abs(wet).max()
    return out


def eq_para_voz(x):
    """Rebaja 1-4 kHz (donde vive la voz) y corta el rumor bajo 30 Hz."""
    f = np.fft.rfftfreq(N, 1 / SR)
    g = 1 - 0.55 * np.exp(-((np.log2(np.maximum(f, 1) / 2000)) ** 2) / (2 * 0.7**2))
    g *= np.minimum(1, f / 30)
    for ch in (0, 1):
        x[:, ch] = np.fft.irfft(np.fft.rfft(x[:, ch]) * g, N)
    return x


def main():
    pads, _ = render_pads()
    pads /= np.abs(pads).max()
    arp = render_arp()
    kick = render_pulse()
    sub = render_sub()

    # Forma: entra el pad, luego el arpegio, luego el pulso; respira a la mitad y vuelve a subir.
    k_pad = curve([(0, 0), (6, 0.75), (40, 0.8), (56, 0.95), (72, 0.8), (104, 0.85), (112, 0)])
    k_arp = curve([(0, 0), (10, 0), (16, 0.2), (40, 0.26), (56, 0.08), (64, 0.08), (72, 0.3), (104, 0.26), (110, 0), (112, 0)])
    k_kick = curve([(0, 0), (24, 0), (32, 0.05), (56, 0.06), (58, 0), (72, 0), (74, 0.06), (102, 0.06), (106, 0), (112, 0)])
    k_sub = curve([(0, 0), (16, 0), (24, 0.06), (56, 0.07), (60, 0.03), (72, 0.07), (104, 0.07), (110, 0), (112, 0)])
    k_air = curve([(0, 0), (8, 0.1), (40, 0.14), (56, 0.2), (72, 0.14), (104, 0.16), (112, 0)])

    # El bombo "empuja" a los pads hacia abajo en cada golpe: el vaivén típico de la música electrónica.
    phase = (np.arange(N) / SR / BEAT) % 1
    duck = 1 - (k_kick / 0.06) * 0.22 * np.exp(-phase * 5)

    dry = pads * (k_pad * duck)[:, None] + arp * k_arp[:, None] + render_air() * k_air[:, None]
    wet = reverb(dry)
    mix = dry * 0.7 + wet * np.array([np.abs(dry).max() * 0.55])
    mix[:, 0] += kick * k_kick + sub * k_sub
    mix[:, 1] += kick * k_kick + sub * k_sub
    mix = eq_para_voz(mix)

    # Silencio exacto al principio y al final: el bucle no se nota.
    edge = int(3 * SR)
    fade = np.ones(N)
    fade[:edge] = np.linspace(0, 1, edge) ** 2
    fade[-edge:] = np.linspace(1, 0, edge) ** 2
    mix *= fade[:, None]
    mix *= 0.89 / np.abs(mix).max()

    with wave.open(sys.argv[1], "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix * 32767).astype("<i2").tobytes())
    print(f"ok {N / SR / 60:.2f} min, pico {np.abs(mix).max():.2f}")


if __name__ == "__main__":
    main()
