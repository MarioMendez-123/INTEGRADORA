"""Notificación de Windows al arrancar y al detenerse el micrófono. Sin dependencias.

Abre un PowerShell corto que muestra un "toast". El texto viaja por variables de entorno del proceso hijo, nunca
dentro del script, para que ninguna cadena pueda inyectar comandos. Si algo falla, solo se registra: la
notificación es un aviso, no una condición para que el servicio funcione.
"""

import logging
import os
import subprocess
import sys

logger = logging.getLogger(__name__)

_SCRIPT = r"""
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
$t = [System.Security.SecurityElement]::Escape($env:AETHER_NOTIFY_TITLE)
$x = [System.Security.SecurityElement]::Escape($env:AETHER_NOTIFY_TEXT)
$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml('<toast><visual><binding template="ToastText02"><text id="1">' + $t + '</text><text id="2">' + $x + '</text></binding></visual></toast>')
$toast = New-Object Windows.UI.Notifications.ToastNotification $xml
$app = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($app).Show($toast)
"""


def notify_windows(title: str, text: str, enabled: bool = True) -> bool:
    """True si se lanzó el aviso (no garantiza que Windows lo mostrara: Concentración o permisos pueden ocultarlo)."""
    if not enabled or sys.platform != "win32":
        return False
    env = dict(os.environ, AETHER_NOTIFY_TITLE=title[:100], AETHER_NOTIFY_TEXT=text[:200])
    try:
        subprocess.Popen(
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", _SCRIPT],
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        return True
    except OSError as exc:
        logger.warning("No se pudo lanzar la notificación de Windows: %s", exc)
        return False
