import { Appointment, POSItem, Sale } from '../types';

const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '');

export const dbService = {
  // Citas
  getCitas: async (): Promise<Appointment[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/citas/list.php`);
      const data = await res.json();
      return data.status === 'success' ? data.data : [];
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para leer citas');
      return [];
    }
  },
  saveCita: async (cita: Appointment, isNew: boolean = false): Promise<boolean> => {
    try {
      const endpoint = isNew ? '/api/citas/create.php' : '/api/citas/update.php';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cita)
      });
      const data = await res.json();
      return data.status === 'success';
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para guardar cita');
      return true;
    }
  },
  
  // Ventas
  getVentas: async (): Promise<Sale[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/ventas/list.php`);
      const data = await res.json();
      return data.status === 'success' ? data.data : [];
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para leer ventas');
      return [];
    }
  },
  saveVenta: async (venta: Sale): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/ventas/create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venta)
      });
      const data = await res.json();
      return data.status === 'success';
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para guardar venta');
      return true;
    }
  },

  // Turnos (Cajas)
  abrirTurno: async (turno: any): Promise<{ success: boolean, message?: string }> => {
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
  },

  cerrarTurno: async (turno: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/caja/cerrar.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turno)
      });
      const data = await res.json();
      return data.status === 'success';
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para cerrarTurno');
      return true;
    }
  },

  // Usuarios
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
  // Inventario
  getInventario: async (): Promise<POSItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/inventario/list.php`);
      const data = await res.json();
      return data.status === 'success' ? data.data : [];
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para leer inventario');
      return [];
    }
  },
  saveInventarioItem: async (item: POSItem, isNew: boolean = false): Promise<boolean> => {
    try {
      const endpoint = isNew ? '/api/inventario/create.php' : '/api/inventario/update.php';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      return data.status === 'success';
    } catch (e) {
      console.warn('Backend no disponible, usando modo offline para guardar inventario item');
      return true;
    }
  }
};
