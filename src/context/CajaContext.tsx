"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  abrirTurnoApi,
  cerrarTurnoApi,
  registrarVentaApi,
  obtenerEstadoCajaApi,
} from '../services/caja.service';

export interface Venta {
  id: string;
  monto: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | string;
  comision: number;
  descripcion: string;
  fecha: string;
  servicio?: string;
}

export interface CajaContextType {
  isCajaAbierta: boolean;
  montoInicial: number;
  ventasDelTurno: Venta[];
  abrirCaja: (montoInicial?: number) => void;
  cerrarCaja: (efectivoFisico?: number, novedades?: string) => void;
  registrarVenta: (venta: Omit<Venta, 'id'> | Venta) => void;
}

const CajaContext = createContext<CajaContextType | undefined>(undefined);

export const CajaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCajaAbierta, setIsCajaAbierta] = useState<boolean>(false);
  const [montoInicial, setMontoInicial] = useState<number>(0);
  const [ventasDelTurno, setVentasDelTurno] = useState<Venta[]>([]);

  useEffect(() => {
    let isMounted = true;
    obtenerEstadoCajaApi().then((estado) => {
      if (isMounted && estado) {
        setIsCajaAbierta(!!estado.isCajaAbierta);
        setMontoInicial(estado.montoInicial || 0);
        setVentasDelTurno(estado.ventasDelTurno || []);
      }
    }).catch((err) => {
      console.warn('Caja offline: estado inicial no disponible via API.');
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const abrirCaja = (monto: number = 0) => {
    setMontoInicial(monto);
    setIsCajaAbierta(true);
    setVentasDelTurno([]);
    // La app maneja la creacion en dbService, asi que la llamada duplicada aqui
    // se maneja en silencio si retorna 403.
    abrirTurnoApi(monto).catch((err) => {
      console.warn('Caja sync error/403:', err);
    });
  };

  const cerrarCaja = (efectivoFisico?: number, novedades?: string) => {
    setIsCajaAbierta(false);
    setMontoInicial(0);
    setVentasDelTurno([]);
    cerrarTurnoApi({ efectivoFisico, observaciones: novedades, novedades }).catch((err) => {
      console.warn('Caja offline: operacion local.');
    });
  };

  const registrarVenta = (nuevaVenta: Omit<Venta, 'id'> | Venta) => {
    const ventaTemporal: Venta = {
      ...nuevaVenta,
      id: 'id' in nuevaVenta && nuevaVenta.id ? nuevaVenta.id : `v_${Date.now()}`,
      descripcion: nuevaVenta.descripcion || nuevaVenta.servicio || 'Servicio General',
      fecha: nuevaVenta.fecha || new Date().toISOString(),
    };

    setVentasDelTurno((prev) => [ventaTemporal, ...prev]);

    registrarVentaApi(nuevaVenta).then((ventaConfirmada) => {
      if (ventaConfirmada) {
        setVentasDelTurno((prev) =>
          prev.map((v) => (v.id === ventaTemporal.id ? ventaConfirmada : v))
        );
      }
    }).catch((err) => {
      console.warn('Caja offline: venta guardada localmente.');
    });
  };

  return (
    <CajaContext.Provider
      value={{
        isCajaAbierta,
        montoInicial,
        ventasDelTurno,
        abrirCaja,
        cerrarCaja,
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
