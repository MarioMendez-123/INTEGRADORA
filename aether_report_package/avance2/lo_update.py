import subprocess, sys, time, os
import uno
from com.sun.star.beans import PropertyValue
src, pdf = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
p = subprocess.Popen([r"C:\Program Files\LibreOffice\program\soffice.exe", "--headless", "--norestore", '--accept=socket,host=localhost,port=2002;urp;'])
ctx = None
for _ in range(60):
    try:
        local = uno.getComponentContext()
        res = local.ServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver", local)
        ctx = res.resolve("uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext"); break
    except Exception: time.sleep(1)
desk = ctx.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
def pv(n, v): x = PropertyValue(); x.Name = n; x.Value = v; return x
d = desk.loadComponentFromURL(uno.systemPathToFileUrl(src), "_blank", 0, (pv("Hidden", True),))
idx = d.getDocumentIndexes()
print("indices", idx.getCount())
for i in range(idx.getCount()): idx.getByIndex(i).update()
d.refresh()
for i in range(idx.getCount()): idx.getByIndex(i).update()
d.storeToURL(uno.systemPathToFileUrl(pdf), (pv("FilterName", "writer_pdf_Export"),))
d.close(True)
try: desk.terminate()
except Exception: pass
p.wait(timeout=30)
