import re

with open('src/services/db.service.ts', 'r') as f:
    content = f.read()

old_func = """  abrirTurno: async (turno: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/caja/abrir.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turno)
      });
      const data = await res.json();
      return data.status === 'success';
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para abrirTurno');
      return true;
    }
  },"""

new_func = """  abrirTurno: async (turno: any): Promise<{ success: boolean, message?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/caja/abrir.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turno)
      });
      const data = await res.json();
      if (res.status === 403 || data.status === 'error') {
        return { success: false, message: data.message };
      }
      return { success: data.status === 'success' };
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para abrirTurno');
      return { success: true };
    }
  },"""

content = content.replace(old_func, new_func)

with open('src/services/db.service.ts', 'w') as f:
    f.write(content)
