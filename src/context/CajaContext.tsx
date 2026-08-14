"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLocalISOString } from '../utils/dateUtils';
import {
  abrirTurnoApi,
  cerrarTurnoApi,
  registrarVentaApi,
  obtenerEstadoCajaApi,
  EstadoCajaResponse,
} from '../services/caja.service';

export interface Venta {
  id: string;
  monto: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | string;
  comision: number;
  descripcion: string;
  fecha: string;
  servicio?: string;
  detalles_json?: string;
  turno_id?: string;
}

export interface CajaContextType {
  isCajaAbierta: boolean;
  turnoId: string | null;
  turnoActual: {
    id: string;
    usuario_id: string;
    usuario_nombre: string;
    hora_apertura: string;
    estado: string;
  } | null;
  montoInicial: number;
  esperadoEfectivo: number;
  esperadoTransferencia: number;
  esperadoDeUna: number;
  esperadoTarjeta: number;
  totalVentasTurno: number;
  ventasDelTurno: Venta[];
  abrirCaja: (montoInicial?: number, specialist?: { id: string; name: string }) => Promise<void>;
  cerrarCaja: (efectivoFisico?: number, novedades?: string, specialistId?: string) => Promise<void>;
  recargarEstadoCaja: (specialistId?: string) => Promise<void>;
  registrarVenta: (venta: (Omit<Venta, 'id'> | Venta) & { turno_id?: string; turnoId?: string }) => void;
}

const CajaContext = createContext<CajaContextType | undefined>(undefined);

export const CajaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCajaAbierta, setIsCajaAbierta] = useState<boolean>(false);
  const [turnoId, setTurnoId] = useState<string | null>(null);
  const [turnoActual, setTurnoActual] = useState<any | null>(null);
  const [montoInicial, setMontoInicial] = useState<number>(0);
  const [esperadoEfectivo, setEsperadoEfectivo] = useState<number>(0);
  const [esperadoTransferencia, setEsperadoTransferencia] = useState<number>(0);
  const [esperadoDeUna, setEsperadoDeUna] = useState<number>(0);
  const [esperadoTarjeta, setEsperadoTarjeta] = useState<number>(0);
  const [totalVentasTurno, setTotalVentasTurno] = useState<number>(0);
  const [ventasDelTurno, setVentasDelTurno] = useState<Venta[]>([]);

  const aplicarEstado = (estado: EstadoCajaResponse) => {
    setIsCajaAbierta(!!estado.isCajaAbierta);
    setMontoInicial(estado.montoInicial || 0);
    setTurnoId(estado.turno?.id || null);
    setTurnoActual(estado.turno || null);
    setEsperadoEfectivo(estado.esperado_efectivo ?? estado.efectivoEsperado ?? 0);
    setEsperadoTransferencia(estado.esperado_transferencia ?? estado.subtotales?.transferencia ?? 0);
    setEsperadoDeUna(estado.esperado_de_una ?? estado.subtotales?.de_una ?? 0);
    setEsperadoTarjeta(estado.esperado_tarjeta ?? estado.subtotales?.tarjeta ?? 0);
    setTotalVentasTurno(estado.total_ventas ?? estado.subtotales?.total ?? 0);
    setVentasDelTurno(estado.ventasDelTurno || []);
  };

  const recargarEstadoCaja = async (specialistId?: string) => {
    try {
      const estado = await obtenerEstadoCajaApi(specialistId);
      if (estado) {
        aplicarEstado(estado);
      }
    } catch (err) {
      console.warn('Caja offline: estado no disponible via API.', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    obtenerEstadoCajaApi().then((estado) => {
      if (isMounted && estado) {
        aplicarEstado(estado);
      }
    }).catch((err) => {
      console.warn('Caja offline: estado inicial no disponible via API.', err);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const abrirCaja = async (monto: number = 0, specialist?: { id: string; name: string }) => {
    setMontoInicial(monto);
    setIsCajaAbierta(true);
    setVentasDelTurno([]);
    try {
      const res = await abrirTurnoApi(monto, specialist);
      if (res.turno?.id) {
        setTurnoId(res.turno.id);
        setTurnoActual(res.turno);
      }
      await recargarEstadoCaja(specialist?.id);
    } catch (err) {
      console.warn('Caja sync error al abrir:', err);
    }
  };

  const cerrarCaja = async (efectivoFisico?: number, novedades?: string, specialistId?: string) => {
    setIsCajaAbierta(false);
    setTurnoId(null);
    setTurnoActual(null);
    setMontoInicial(0);
    setEsperadoEfectivo(0);
    setEsperadoTransferencia(0);
    setEsperadoDeUna(0);
    setEsperadoTarjeta(0);
    setTotalVentasTurno(0);
    setVentasDelTurno([]);

    try {
      await cerrarTurnoApi({ 
        id: turnoId || undefined,
        efectivoFisico, 
        actualCash: efectivoFisico,
        observaciones: novedades, 
        novedades,
        specialistId,
        usuario_id: specialistId
      });
      await recargarEstadoCaja(specialistId);
    } catch (err) {
      console.warn('Caja offline: operacion local de cierre.', err);
    }
  };

  const registrarVenta = (nuevaVenta: (Omit<Venta, 'id'> | Venta) & { turno_id?: string; turnoId?: string }) => {
    const activeTurnId = nuevaVenta.turno_id || nuevaVenta.turnoId || turnoId || undefined;
    const ventaTemporal: Venta = {
      ...nuevaVenta,
      id: 'id' in nuevaVenta && nuevaVenta.id ? nuevaVenta.id : `v_${Date.now()}`,
      descripcion: nuevaVenta.descripcion || nuevaVenta.servicio || 'Servicio General',
      fecha: nuevaVenta.fecha || getLocalISOString(),
      turno_id: activeTurnId,
    };

    setVentasDelTurno((prev) => [ventaTemporal, ...prev]);

    registrarVentaApi({ ...nuevaVenta, turno_id: activeTurnId }).then((ventaConfirmada) => {
      if (ventaConfirmada) {
        setVentasDelTurno((prev) =>
          prev.map((v) => (v.id === ventaTemporal.id ? ventaConfirmada : v))
        );
      }
    }).catch((err) => {
      console.warn('Caja offline: venta guardada localmente.', err);
    });
  };

  return (
    <CajaContext.Provider
      value={{
        isCajaAbierta,
        turnoId,
        turnoActual,
        montoInicial,
        esperadoEfectivo,
        esperadoTransferencia,
        esperadoDeUna,
        esperadoTarjeta,
        totalVentasTurno,
        ventasDelTurno,
        abrirCaja,
        cerrarCaja,
        recargarEstadoCaja,
        registrarVenta,
      }}
    >
      {children}
    </CajaContext.Provider>
  );
};

export const useCaja = () => {
  const context = useContext(CajaContext);
  if (!context) {
    throw new Error('useCaja debe ser usado dentro de un CajaProvider');
  }
  return context;
};
