import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old = """    if (!result.success) {
      triggerNotification(result.message || 'Error al abrir caja');
      return false;
    }"""

new = """    if (!result.success) {
      alert('❌ Error de Seguridad: ' + (result.message || 'Error al abrir caja'));
      triggerNotification(result.message || 'Error al abrir caja');
      return false;
    }"""

content = content.replace(old, new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
