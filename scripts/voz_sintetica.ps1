# Genera un juego de frases con la voz en espanol de Windows (Sabina) para probar comparar_motores.py SIN grabar tu voz.
#
#   PS C:\...> powershell -ExecutionPolicy Bypass -File scriptsoz_sintetica.ps1 -Carpeta pruebas_voz_sintetica
#
# OJO: es UNA voz sintetica y limpia. Sirve para probar el script y ver tendencias; NO representa tu voz ni el ruido de la
# universidad. Crea wake_NN_rR.wav (frases que empiezan con Lumina, a tres velocidades) y nowake_NN.wav (frases que no).
# Formato: 16 kHz, mono, 16 bits. No instala nada: usa System.Speech, que ya trae Windows.
param([string]$Carpeta = 'pruebas_voz_sintetica', [string]$Frases = '')
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $Carpeta | Out-Null
$Carpeta = (Resolve-Path $Carpeta).Path
if (-not $Frases) { $Frases = Join-Path $PSScriptRoot 'voz_sintetica_frases.json' }
$json = Get-Content -Raw -Encoding UTF8 $Frases | ConvertFrom-Json
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voz = $s.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like 'es-*' } | Select-Object -First 1
if (-not $voz) { throw 'No hay ninguna voz en espanol instalada en Windows (Configuracion > Hora e idioma > Voz).' }
$s.SelectVoice($voz.VoiceInfo.Name)
"Voz: " + $voz.VoiceInfo.Name
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
$i = 0
foreach ($t in $json.wake) { foreach ($r in -2, 0, 2) { $s.Rate = $r; $f = Join-Path $Carpeta ('wake_{0:D2}_r{1}.wav' -f $i, $r); $s.SetOutputToWaveFile($f, $fmt); $s.Speak($t); $s.SetOutputToNull() }; $i++ }
$i = 0
foreach ($t in $json.nowake) { $s.Rate = 0; $f = Join-Path $Carpeta ('nowake_{0:D2}.wav' -f $i); $s.SetOutputToWaveFile($f, $fmt); $s.Speak($t); $s.SetOutputToNull(); $i++ }
"Listo: " + (Get-ChildItem $Carpeta -Filter *.wav).Count + " archivos en " + $Carpeta
