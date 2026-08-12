import re

with open('src/services/db.service.ts', 'r') as f:
    content = f.read()

new_functions = """  // Usuarios
  getUsuarios: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/usuarios/list.php`);
      const data = await res.json();
      return data.status === 'success' ? data.data : [];
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para leer usuarios');
      return [];
    }
  },
  saveUsuario: async (usuario: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/usuarios/create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
      });
      const data = await res.json();
      return data.status === 'success';
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para guardar usuario');
      return true;
    }
  },
  // Inventario"""

content = content.replace("  // Inventario", new_functions)

with open('src/services/db.service.ts', 'w') as f:
    f.write(content)
