import re

with open('src/services/db.service.ts', 'r') as f:
    content = f.read()

# Add import Categoria
if 'Categoria' not in content:
    content = content.replace("import { Appointment, POSItem, Sale } from '../types';", "import { Appointment, POSItem, Sale, Categoria } from '../types';")

# Replace getCategorias
old_get = """  getCategorias: async (): Promise<string[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/categorias/list.php`);
      const data = await res.json();
      return data.status === 'success' ? data.data : [];
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para leer categorias');
      return [];
    }
  },"""
new_get = """  getCategorias: async (): Promise<Categoria[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/categorias/list.php`);
      const data = await res.json();
      return data.status === 'success' ? data.data : [];
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para leer categorias');
      return [];
    }
  },"""
content = content.replace(old_get, new_get)

# Replace saveCategoria and add update and delete
old_save = """  saveCategoria: async (nombre: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/categorias/create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });
      const data = await res.json();
      return data.status === 'success';
    } catch (e) {
      console.error('Error guardando categoría:', e);
      return false;
    }
  },"""

new_save = """  saveCategoria: async (nombre: string): Promise<Categoria | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/categorias/create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });
      const data = await res.json();
      return data.status === 'success' ? data.data : null;
    } catch (e) {
      console.error('Error guardando categoría:', e);
      return null;
    }
  },
  updateCategoria: async (id: string | number, nombre: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/categorias/update.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, nombre })
      });
      const data = await res.json();
      return data.status === 'success';
    } catch (e) {
      console.error('Error actualizando categoría:', e);
      return false;
    }
  },
  deleteCategoria: async (id: string | number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/categorias/delete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      return data.status === 'success';
    } catch (e) {
      console.error('Error eliminando categoría:', e);
      return false;
    }
  },"""
content = content.replace(old_save, new_save)

with open('src/services/db.service.ts', 'w') as f:
    f.write(content)
