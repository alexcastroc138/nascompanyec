import re

with open('src/context/CajaContext.tsx', 'r') as f:
    content = f.read()

content = content.replace("console.error('Error al obtener estado inicial de caja:', err);", "console.warn('Caja offline: estado inicial no disponible via API.');")
content = content.replace("console.error('Error al abrir turno en API:', err);", "console.warn('Caja offline: operacion local.');")
content = content.replace("console.error('Error al cerrar turno en API:', err);", "console.warn('Caja offline: operacion local.');")
content = content.replace("console.error('Error al registrar venta en API:', err);", "console.warn('Caja offline: venta guardada localmente.');")

with open('src/context/CajaContext.tsx', 'w') as f:
    f.write(content)
