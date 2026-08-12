"use client";

import React, { useState } from 'react';
import { Calendar, DollarSign, CreditCard, ArrowUpRight, ArrowDownLeft, CheckCircle2, MinusCircle } from 'lucide-react';
import { Sale, Expense } from '../../types';

interface HistorialVentasProps {
  sales?: Sale[];
  expenses?: Expense[];
}

interface TransaccionUnificada {
  id: string;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  paymentMethod: string;
  descripcion: string;
  timestamp: string;
  specialistName?: string;
  sriStatus?: string;
}

export default function HistorialVentas({ sales = [], expenses = [] }: HistorialVentasProps) {
  // 1. LÓGICA DE FILTRADO Y CÁLCULO
  const todayStr = new Date().toISOString().split('T')[0];
  const [fechaFiltro, setFechaFiltro] = useState<string>(todayStr);

  const safeSales = Array.isArray(sales) ? sales : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const transaccionesUnificadas: TransaccionUnificada[] = [
    ...safeSales.map(v => ({
      id: v.id,
      tipo: 'ingreso' as const,
      monto: v.subtotal || 0,
      paymentMethod: v.paymentMethod || 'cash',
      descripcion: v.items?.map(i => i.name).join(', ') || 'Servicio General',
      timestamp: v.timestamp || new Date().toISOString(),
      specialistName: v.specialistName,
      sriStatus: v.sriStatus
    })),
    ...safeExpenses.map(g => ({
      id: g.id,
      tipo: 'gasto' as const,
      monto: g.amount || 0,
      paymentMethod: 'cash',
      descripcion: g.title ? `Gasto: ${g.title}` : 'Salida de caja',
      timestamp: g.timestamp || new Date().toISOString(),
      specialistName: g.specialistName
    }))
  ];

  // Ordenar de más reciente a más antiguo
  transaccionesUnificadas.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const movimientosFiltrados = transaccionesUnificadas.filter((t) => {
    if (!t.timestamp) return true;
    return t.timestamp.startsWith(fechaFiltro);
  });

  const totalRecaudadoDia = movimientosFiltrados.reduce((acc, t) => {
    return t.tipo === 'ingreso' ? acc + t.monto : acc - t.monto;
  }, 0);

  const formatHora = (fechaIso: string) => {
    if (!fechaIso) return '--:--';
    try {
      if (fechaIso.endsWith('Z')) {
        const date = new Date(fechaIso);
        return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      const match = fechaIso.match(/(\d{2}:\d{2})(:\d{2})?/);
      if (match) return match[1];
      
      const date = new Date(fechaIso);
      return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '--:--';
    }
  };

  const getMetodoIcon = (metodo: string, tipo: 'ingreso' | 'gasto') => {
    if (tipo === 'gasto') return <MinusCircle size={18} className="text-rose-400" />;
    const m = (metodo || '').toLowerCase();
    if (m === 'card' || m === 'tarjeta') return <CreditCard size={18} />;
    if (m === 'transfer' || m === 'transferencia') return <ArrowUpRight size={18} />;
    return <DollarSign size={18} />;
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs font-sans">
      
      {/* 2. RESUMEN TOTAL ESTILO BANCARIO */}
      <div className="mb-8 p-6 bg-linear-to-br from-gray-900 via-gray-900 to-neutral-800 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <DollarSign size={120} />
        </div>
        
        <p className="text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">
          Balance Neto (Día seleccionado)
        </p>

        <div className="flex items-baseline gap-2">
          <span className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${totalRecaudadoDia >= 0 ? 'text-white' : 'text-rose-400'}`}>
            ${totalRecaudadoDia.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-sm font-bold text-emerald-400 font-mono">USD</span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-400 border-t border-gray-800 pt-3">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>Sincronizado con balance general e historial de caja chica</span>
        </div>
      </div>

      {/* 3. ENCABEZADO Y FILTRO DE FECHA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-150">
        <div>
          <h3 className="text-base font-bold text-gray-900 font-display">Movimientos recientes</h3>
          <p className="text-xs text-gray-400">Ingresos, ventas, abonos y egresos registrados en el sistema.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="pl-8 pr-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-black transition cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. LISTA DE MOVIMIENTOS Y 5. EMPTY STATE */}
      {movimientosFiltrados.length === 0 ? (
        <div className="py-12 px-4 text-center space-y-2">
          <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <ArrowDownLeft size={22} />
          </div>
          <p className="text-xs text-gray-500 font-medium">
            No se encontraron movimientos para esta fecha.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {movimientosFiltrados.map((mov) => (
            <div
              key={mov.id}
              className={`p-3.5 bg-white hover:bg-gray-50/80 border rounded-xl transition duration-150 flex items-center justify-between gap-3 group ${
                mov.tipo === 'gasto' ? 'border-rose-200/80 bg-rose-50/10' : 'border-gray-150/90'
              }`}
            >
              {/* COLUMNA IZQUIERDA: AVATAR */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform ${
                  mov.tipo === 'gasto' ? 'bg-rose-950 text-rose-400' : 'bg-black text-white'
                }`}>
                  {getMetodoIcon(mov.paymentMethod, mov.tipo)}
                </div>

                {/* COLUMNA CENTRAL: DESCRIPCIÓN + MÉTODO & HORA */}
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {mov.descripcion}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium capitalize flex items-center gap-1">
                    {mov.tipo === 'gasto' ? (
                      <span className="text-rose-600 font-semibold">Salida (Caja Chica)</span>
                    ) : (
                      <span>{mov.paymentMethod === 'cash' ? 'Efectivo' : mov.paymentMethod === 'card' ? 'Tarjeta' : mov.paymentMethod === 'de_una' ? 'De Una' : mov.paymentMethod === 'mixto' ? 'Pago Mixto' : 'Transferencia'}</span>
                    )}
                    <span>•</span>
                    <span className="font-mono text-gray-400">{formatHora(mov.timestamp)}</span>
                    {mov.specialistName && (
                      <>
                        <span>•</span>
                        <span className="text-gray-500">{mov.specialistName}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* COLUMNA DERECHA: MONTO + ESTADO */}
              <div className="text-right shrink-0">
                {mov.tipo === 'gasto' ? (
                  <p className="text-xs sm:text-sm font-extrabold text-rose-600 font-mono">
                    - ${mov.monto.toFixed(2)} USD
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm font-extrabold text-emerald-600 font-mono">
                    + ${mov.monto.toFixed(2)} USD
                  </p>
                )}
                <p className="text-xs text-gray-400 font-semibold tracking-tight mt-0.5">
                  {mov.tipo === 'gasto' ? 'Registrado' : 'Completado'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
