# edge/ — entorno de desarrollo

Entorno virtual en `.venv/` (Python 3.11). Para activarlo y trabajar:

```bash
# Git Bash / WSL
source edge/.venv/Scripts/activate
```

```powershell
# PowerShell
edge\.venv\Scripts\Activate.ps1
```

Instalar dependencias:

```bash
pip install -r edge/requirements.txt
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

`torch` se instala aparte, apuntando al índice CPU oficial de PyTorch, para no
descargar una build CUDA de varios GB en una máquina de desarrollo sin GPU
NVIDIA configurada para ello. En el Jetson Orin Nano Super (Decisión 4) se
instala una build distinta, provista por NVIDIA JetPack — no reutilizar este
mismo procedimiento ahí sin verificarlo primero.
