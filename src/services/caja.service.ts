import { apiClient } from './apiClient';
import { Venta } from '../context/CajaContext';
import { getLocalISOString, getTodayStr } from '../utils/dateUtils';

const CAJA_STORAGE_KEY = 'caja_state';

export interface EstadoCajaResponse {
  isCajaAbierta: boolean;
  montoInicial: number;
  esperado_efectivo?: number;
  esperado_transferencia?: number;
  esperado_de_una?: number;
  esperado_tarjeta?: number;
  total_ventas?: number;
  total_transacciones?: number;
  efectivoEsperado?: number;
  subtotales?: {
    efectivo: number;
    transferencia: number;
    de_una: number;
    tarjeta: number;
    total: number;
  };
  turno?: {
    id: string;
    usuario_id: string;
    usuario_nombre: string;
    hora_apertura: string;
    estado: string;
  };
  ventasDelTurno: Venta[];
}

export interface CierreTurnoDatos {
  id?: string;
  usuario_id?: string;
  specialistId?: string;
  actualCash?: number;
  efectivoFisico?: number;
  expectedCash?: number;
  difference?: number;
  observaciones?: string;
  novedades?: string;
  notes?: string;
}

export async function obtenerEstadoCajaApi(specialistId?: string): Promise<EstadoCajaResponse> {
  try {
    const params = specialistId ? { specialistId } : undefined;
    const res = await apiClient<EstadoCajaResponse>('/caja/estado.php', { params });
    if (res && typeof window !== 'undefined') {
      localStorage.setItem(CAJA_STORAGE_KEY, JSON.stringify(res));
    }
    return res;
  } catch (e) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CAJA_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Ignore parse error
        }
      }
    }
    return { 
      isCajaAbierta: false, 
      montoInicial: 0, 
      esperado_efectivo: 0, 
      esperado_transferencia: 0, 
      esperado_de_una: 0, 
      esperado_tarjeta: 0, 
      total_ventas: 0, 
      efectivoEsperado: 0, 
      ventasDelTurno: [] 
    };
  }
}

export async function abrirTurnoApi(
  monto: number = 0, 
  specialist?: { id: string; name: string }
): Promise<EstadoCajaResponse> {
  const payload = {
    montoInicial: monto,
    usuario_id: specialist?.id,
    specialistId: specialist?.id,
    usuario_nombre: specialist?.name,
    specialistName: specialist?.name,
  };

  try {
    const res = await apiClient<{ status: string; message?: string; data?: any }>('/caja/abrir.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const stateData: EstadoCajaResponse = {
      isCajaAbierta: true,
      montoInicial: monto,
      turno: res.data,
      esperado_efectivo: 0,
      esperado_transferencia: 0,
      esperado_de_una: 0,
      esperado_tarjeta: 0,
      total_ventas: 0,
      efectivoEsperado: 0,
      ventasDelTurno: []
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(CAJA_STORAGE_KEY, JSON.stringify(stateData));
    }
    return stateData;
  } catch (e) {
    const localState: EstadoCajaResponse = { 
      isCajaAbierta: true, 
      montoInicial: monto, 
      esperado_efectivo: 0, 
      esperado_transferencia: 0, 
      esperado_de_una: 0, 
      esperado_tarjeta: 0, 
      total_ventas: 0, 
      efectivoEsperado: 0, 
      ventasDelTurno: [] 
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(CAJA_STORAGE_KEY, JSON.stringify(localState));
    }
    return localState;
  }
}

export async function cerrarTurnoApi(datos?: CierreTurnoDatos): Promise<{ success: boolean; data?: any }> {
  try {
    const res = await apiClient<{ status: string; message?: string; data?: any }>('/caja/cerrar.php', {
      method: 'POST',
      body: JSON.stringify(datos || {}),
    });

    if (typeof window !== 'undefined') {
      localStorage.removeItem(CAJA_STORAGE_KEY);
    }
    return { success: res.status === 'success', data: res.data };
  } catch (e) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CAJA_STORAGE_KEY);
    }
    return { success: true };
  }
}

export async function registrarVentaApi(nuevaVenta: (Omit<Venta, 'id'> | Venta) & { turno_id?: string; turnoId?: string }): Promise<Venta> {
  const ventaCompleta: Venta = {
    ...nuevaVenta,
    id: 'id' in nuevaVenta && nuevaVenta.id ? nuevaVenta.id : `v_${Date.now()}`,
    descripcion: nuevaVenta.descripcion || nuevaVenta.servicio || 'Servicio General',
    fecha: nuevaVenta.fecha || getLocalISOString(),
    turno_id: (nuevaVenta as any).turno_id || (nuevaVenta as any).turnoId,
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
