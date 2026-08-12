import { apiClient } from './apiClient';
import { Venta } from '../context/CajaContext';

const CAJA_STORAGE_KEY = 'caja_state';

export interface EstadoCajaResponse {
  isCajaAbierta: boolean;
  montoInicial: number;
  ventasDelTurno: Venta[];
}

export interface CierreTurnoDatos {
  efectivoFisico?: number;
  observaciones?: string;
  novedades?: string;
}

export async function obtenerEstadoCajaApi(): Promise<EstadoCajaResponse> {
  try {
    return await apiClient<EstadoCajaResponse>('/caja/estado.php');
  } catch {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CAJA_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return { isCajaAbierta: false, montoInicial: 0, ventasDelTurno: [] };
  }
}

export async function abrirTurnoApi(monto: number = 0): Promise<EstadoCajaResponse> {
  const payload = { isCajaAbierta: true, montoInicial: monto, ventasDelTurno: [] };
  try {
    return await apiClient<EstadoCajaResponse>('/caja/abrir.php', {
      method: 'POST',
      body: JSON.stringify({ montoInicial: monto }),
    });
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CAJA_STORAGE_KEY, JSON.stringify(payload));
    }
    return payload;
  }
}

export async function cerrarTurnoApi(datos?: CierreTurnoDatos): Promise<{ success: boolean }> {
  try {
    return await apiClient<{ success: boolean }>('/caja/cerrar.php', {
      method: 'POST',
      body: JSON.stringify(datos || {}),
    });
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CAJA_STORAGE_KEY);
    }
    return { success: true };
  }
}

export async function registrarVentaApi(nuevaVenta: Omit<Venta, 'id'> | Venta): Promise<Venta> {
  const ventaCompleta: Venta = {
    ...nuevaVenta,
    id: 'id' in nuevaVenta && nuevaVenta.id ? nuevaVenta.id : `v_${Date.now()}`,
    descripcion: nuevaVenta.descripcion || nuevaVenta.servicio || 'Servicio General',
    fecha: nuevaVenta.fecha || new Date().toISOString(),
  };

  try {
    return await apiClient<Venta>('/caja/ventas.php', {
      method: 'POST',
      body: JSON.stringify(ventaCompleta),
    });
  } catch {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CAJA_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const ventasActuales = Array.isArray(parsed.ventasDelTurno) ? parsed.ventasDelTurno : [];
        const nuevasVentas = [ventaCompleta, ...ventasActuales];
        localStorage.setItem(
          CAJA_STORAGE_KEY,
          JSON.stringify({ ...parsed, ventasDelTurno: nuevasVentas })
        );
      }
    }
    return ventaCompleta;
  }
}

export async function obtenerHistorialApi(fecha?: string): Promise<Venta[]> {
  try {
    return await apiClient<Venta[]>('/caja/historial.php', {
      params: fecha ? { fecha } : undefined,
    });
  } catch {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CAJA_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed.ventasDelTurno) ? parsed.ventasDelTurno : [];
      }
    }
    return [];
  }
}
