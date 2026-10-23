# Arranque de Aether en la laptop: comprobaciones claras + servidor (+ servicio de voz).
#
#   PS C:\...\INTEGRADORAAHORASI> .\iniciar_aether.ps1
#
# Opciones:
#   -SoloComprobar   hace las comprobaciones y sale: no arranca nada. Util para ver si todo esta listo.
#   -SinVoz          no arranca el servicio de voz (el microfono de la laptop).
#   -Jetson          ademas, arranca el agente del Jetson por SSH (host "jetson-uni" de ~/.ssh/config).
#   -JetsonHost X    otro nombre de host SSH para -Jetson.
#   -Puerto N        puerto del servidor (por defecto 8000).
#
# No instala nada, no abre puertos ni cambia el firewall: lo que falte lo dice con el comando exacto.
# El procedimiento anterior sigue valiendo (URLS_Y_COMANDOS.md, seccion 1): este script solo lo junta.
# Archivo ASCII a proposito (PowerShell 5.1 lee mal los acentos sin BOM).

param(
    [switch]$SoloComprobar,
    [switch]$SinVoz,
    [switch]$Jetson,
    [string]$JetsonHost = 'jetson-uni',
    [int]$Puerto = 8000
)

$Raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Raiz 'backend'
$Py = Join-Path $Backend '.venv\Scripts\python.exe'
$EnvFile = Join-Path $Backend '.env'
$Errores = New-Object System.Collections.ArrayList
$Avisos = New-Object System.Collections.ArrayList

function Ok([string]$t) { Write-Host ("  [ OK ] " + $t) -ForegroundColor Green }
function Falta([string]$t, [string]$como) {
    Write-Host ("  [FALTA] " + $t) -ForegroundColor Red
    Write-Host ("          -> " + $como) -ForegroundColor Yellow
    [void]$Errores.Add($t)
}
function Aviso([string]$t, [string]$como) {
    Write-Host ("  [AVISO] " + $t) -ForegroundColor Yellow
    if ($como) { Write-Host ("          -> " + $como) -ForegroundColor Yellow }
    [void]$Avisos.Add($t)
}

# Lee UNA variable de backend\.env sin mostrar su valor. Devuelve $true si existe y no esta vacia.
function Tiene-Variable([string]$nombre) {
    if (-not (Test-Path $EnvFile)) { return $false }
    foreach ($linea in Get-Content -Encoding UTF8 $EnvFile) {
        if ($linea -match ('^\s*' + [regex]::Escape($nombre) + '\s*=\s*(.+?)\s*$')) { return $true }
    }
    return $false
}

Write-Host ""
Write-Host "=== Comprobaciones de Aether ===" -ForegroundColor Cyan

# 1) Python del backend
if (Test-Path $Py) { Ok "Python del backend: backend\.venv" }
else { Falta "No existe backend\.venv" "python -m venv backend\.venv ; backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt" }

# 2) Clave de la celda (sin mostrarla)
if (Tiene-Variable 'CELDA_HMI_CLAVE') { Ok "CELDA_HMI_CLAVE definida en backend\.env (no se muestra)" }
else { Falta "Falta CELDA_HMI_CLAVE en backend\.env" "notepad backend\.env  y agrega una linea: CELDA_HMI_CLAVE=<tu clave>   (sin ella Arranque/Paro de la celda no responden)" }

# 3) Puerto libre
$ocupado = $null
try { $ocupado = Get-NetTCPConnection -LocalPort $Puerto -State Listen -ErrorAction Stop | Select-Object -First 1 } catch { }
if ($ocupado) {
    $nombre = (Get-Process -Id $ocupado.OwningProcess -ErrorAction SilentlyContinue).ProcessName
    Falta ("El puerto " + $Puerto + " ya esta en uso por: " + $nombre + " (PID " + $ocupado.OwningProcess + ")") "cierra ese programa (por ejemplo otro uvicorn o lumina-agent) o usa -Puerto 8010"
} else { Ok ("Puerto " + $Puerto + " libre") }

# 4) Red: perfil y firewall (solo avisos: dependen de la red a la que estes conectado)
try {
    $perfiles = Get-NetConnectionProfile -ErrorAction Stop
    foreach ($p in $perfiles) {
        if ($p.NetworkCategory -eq 'Public') {
            Aviso ("La red '" + $p.Name + "' esta como Publica: Windows bloquea que el Jetson llegue a la laptop") ("Set-NetConnectionProfile -InterfaceAlias '" + $p.InterfaceAlias + "' -NetworkCategory Private   (PowerShell de administrador)")
        } else { Ok ("Red '" + $p.Name + "': " + $p.NetworkCategory) }
    }
} catch { Aviso "No pude leer los perfiles de red" "" }
try {
    $regla = Get-NetFirewallRule -DisplayName ("Aether " + $Puerto + "*") -ErrorAction Stop | Where-Object { $_.Enabled -eq 'True' -and $_.Direction -eq 'Inbound' }
    if ($regla) { Ok ("Regla de firewall para el puerto " + $Puerto + " encontrada") } else { throw 'sin regla' }
} catch {
    Aviso ("No hay regla de firewall 'Aether " + $Puerto + "'") ("New-NetFirewallRule -DisplayName 'Aether " + $Puerto + " (red local)' -Direction Inbound -Protocol TCP -LocalPort " + $Puerto + " -Action Allow -Profile Private -RemoteAddress LocalSubnet   (PowerShell de administrador; solo perfil Privado)")
}

# 5) Voz
$VozLista = $false
if ($SinVoz) { Write-Host "  [ -- ] Voz omitida (-SinVoz)" }
elseif (Test-Path $Py) {
    & $Py -c "import vosk, sounddevice" 2>$null
    $paquetes = ($LASTEXITCODE -eq 0)
    $modelo = Tiene-Variable 'AETHER_VOICE_MODEL'
    if ($paquetes -and $modelo) { Ok "Servicio de voz listo (vosk, sounddevice y AETHER_VOICE_MODEL)"; $VozLista = $true }
    else {
        if (-not $paquetes) { Aviso "Voz desactivada: faltan los paquetes vosk y sounddevice" "backend\.venv\Scripts\python.exe -m pip install -r backend\requirements-voice.txt" }
        if (-not $modelo) { Aviso "Voz desactivada: falta AETHER_VOICE_MODEL en backend\.env" "descarga vosk-model-small-es (alphacephei.com/vosk/models), descomprimelo y agrega AETHER_VOICE_MODEL=<carpeta>" }
    }
}

# 6) Direcciones para el Jetson
Write-Host ""
Write-Host "=== Direcciones de esta laptop (para el Jetson) ===" -ForegroundColor Cyan
try {
    $ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.InterfaceAlias -notlike 'vEthernet*' }
    foreach ($ip in $ips) { Write-Host ("  http://" + $ip.IPAddress + ":" + $Puerto + "/   (" + $ip.InterfaceAlias + ")") }
} catch { Write-Host "  (usa ipconfig)" }

Write-Host ""
if ($Errores.Count -gt 0) {
    Write-Host ("No arranco: " + $Errores.Count + " cosa(s) por resolver arriba.") -ForegroundColor Red
    exit 1
}
if ($SoloComprobar) {
    Write-Host ("Todo en orden (" + $Avisos.Count + " aviso(s)). -SoloComprobar: no arranque nada.") -ForegroundColor Green
    exit 0
}

# 7) Arranque
if ($Jetson) {
    Write-Host ("Arrancando el agente del Jetson por SSH (" + $JetsonHost + ") ...") -ForegroundColor Cyan
    ssh $JetsonHost "bash ~/aether/scripts/jetson/iniciar-agente.sh"
    if ($LASTEXITCODE -ne 0) { Write-Host "El agente del Jetson no arranco (ver el mensaje de arriba). Sigo con la laptop." -ForegroundColor Yellow }
}
if ($VozLista) {
    Write-Host "Abriendo el servicio de voz en su propia ventana (ahi se ve el estado del microfono) ..." -ForegroundColor Cyan
    $cmd = "Set-Location '" + $Backend + "'; & '" + $Py + "' -m voice.service"
    Start-Process powershell -ArgumentList '-NoExit', '-NoProfile', '-Command', $cmd
}
Write-Host ("Arrancando el servidor en el puerto " + $Puerto + " (Ctrl+C para detenerlo) ...") -ForegroundColor Cyan
Set-Location $Backend
& $Py -m uvicorn main:app --host 0.0.0.0 --port $Puerto
