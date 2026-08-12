import re

with open('src/services/caja.service.ts', 'r') as f:
    content = f.read()

content = content.replace("'/caja/estado'", "'/caja/estado.php'")
content = content.replace("'/caja/abrir'", "'/caja/abrir.php'")
content = content.replace("'/caja/cerrar'", "'/caja/cerrar.php'")
content = content.replace("'/caja/ventas'", "'/caja/ventas.php'")
content = content.replace("'/caja/historial'", "'/caja/historial.php'")

with open('src/services/caja.service.ts', 'w') as f:
    f.write(content)
