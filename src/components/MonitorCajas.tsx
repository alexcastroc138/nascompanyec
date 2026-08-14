import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/db.service';
import { getLocalISOString } from '../utils/dateUtils';
import { 
  RefreshCw, DollarSign, Clock, User as UserIcon, Lock, 
  Search, AlertTriangle, CheckCircle2, TrendingUp,
  CreditCard, Smartphone, Building2, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';

export interface TurnoAbiertoData {
  id: string;
  usuario_id: string;
  usuario_nombre: string;
  hora_apertura: string;
  monto_apertura: number;
  esperado_efectivo: number;
  esperado_transferencia: number;
  esperado_de_una: number;
  esperado_tarjeta: number;
  total_ventas: number;
  ingresos_calculados: number;
  cantidad_ventas: number;
  estado: string;
}

export interface CierreTurnoData {
  id: string;
  usuario_id: string;
  usuario_nombre: string;
  hora_apertura: string;
  hora_cierre: string;
  monto_apertura: number;
  efectivo_esperado: number;
  efectivo_real: number;
  diferencia: number;
  observaciones: string;
  total_ventas: number;
  cantidad_ventas: number;
  estado: string;
}

interface MonitorCajasProps {
  onRefreshParent?: () => void;
}

export const MonitorCajas: React.FC<MonitorCajasProps> = ({ onRefreshParent }) => {
  const [turnosAbiertos, setTurnosAbiertos] = useState<TurnoAbiertoData[]>([]);
  const [historialCierres, setHistorialCierres] = useState<CierreTurnoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const itemsPerPage = 8;

  const fetchMonitorData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const { cajasAbiertas, historialCierres: cierresRaw } = await dbService.getMonitorCajas();
      
      // 1. Mapeo seguro y robusto de Turnos Abiertos
      const mappedAbiertos: TurnoAbiertoData[] = (cajasAbiertas || []).map((t: any) => {
        const totalCalc = Number(t.total_ventas ?? t.ingresos_calculados ?? t.total_general ?? 0);
        return {
          id: String(t.id || ''),
          usuario_id: String(t.usuario_id || t.specialistId || ''),
          usuario_nombre: String(t.usuario_nombre || t.specialistName || 'Especialista'),
          hora_apertura: String(t.hora_apertura || t.startTime || getLocalISOString()),
          monto_apertura: Number(t.monto_apertura || 0),
          esperado_efectivo: Number(t.esperado_efectivo ?? t.efectivo_esperado ?? 0),
          esperado_transferencia: Number(t.esperado_transferencia || 0),
          esperado_de_una: Number(t.esperado_de_una || 0),
          esperado_tarjeta: Number(t.esperado_tarjeta || 0),
          total_ventas: totalCalc,
          ingresos_calculados: totalCalc,
          cantidad_ventas: Number(t.cantidad_ventas || 0),
          estado: String(t.estado || 'abierta')
        };
      });

      // 2. Mapeo seguro y robusto de Historial de Cierres
      const mappedCierres: CierreTurnoData[] = (cierresRaw || []).map((c: any) => {
        const espEf = Number(c.efectivo_esperado ?? c.esperado_efectivo ?? c.cashExpected ?? 0);
        const realEf = Number(c.efectivo_real ?? c.efectivo_entregado ?? c.actualCash ?? c.cashSubmitted ?? 0);
        const diff = c.diferencia !== undefined && c.diferencia !== null 
          ? Number(c.diferencia) 
          : Number(c.difference ?? (realEf - espEf));

        return {
          id: String(c.id || ''),
          usuario_id: String(c.usuario_id || c.specialistId || ''),
          usuario_nombre: String(c.usuario_nombre || c.specialistName || 'Especialista'),
          hora_apertura: String(c.hora_apertura || c.startTime || ''),
          hora_cierre: String(c.hora_cierre || c.endTime || getLocalISOString()),
          monto_apertura: Number(c.monto_apertura || 0),
          efectivo_esperado: espEf,
          efectivo_real: realEf,
          diferencia: diff,
          observaciones: String(c.observaciones || c.notes || c.novedades || ''),
          total_ventas: Number(c.total_ventas ?? c.total_general ?? c.ingresos_calculados ?? 0),
          cantidad_ventas: Number(c.cantidad_ventas || 0),
          estado: String(c.estado || 'cerrada')
        };
      });

      setTurnosAbiertos(mappedAbiertos);
      setHistorialCierres(mappedCierres);
      setLastUpdated(new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      if (onRefreshParent) {
        onRefreshParent();
      }
    } catch (err) {
      console.error('Error al sincronizar monitor de cajas:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonitorData();
    const interval = setInterval(() => fetchMonitorData(), 15000); // Polling cada 15s
    return () => clearInterval(interval);
  }, []);

  const handleForzarCierre = async (turno: TurnoAbiertoData) => {
    const confirm = window.confirm(
      `¿Confirmas el cierre forzoso del turno de ${turno.usuario_nombre}?\nEfectivo esperado por el sistema: $${turno.esperado_efectivo.toFixed(2)} USD`
    );
    if (!confirm) return;

    const payload = {
      id: turno.id,
      timestampCierre: getLocalISOString(),
      expectedCash: turno.esperado_efectivo,
      actualCash: turno.esperado_efectivo, // Cierre en cero diferencia al forzar
      difference: 0,
      notes: 'Cierre forzado administrativamente desde Monitor de Cajas'
    };

    const success = await dbService.cerrarTurno(payload);
    if (success) {
      alert(`Turno de ${turno.usuario_nombre} cerrado con éxito.`);
      fetchMonitorData(true);
    } else {
      alert('Hubo un inconveniente al cerrar el turno en el servidor.');
    }
  };

  // Filtrado y paginación de cierres
  const filteredCierres = useMemo(() => {
    if (!searchTerm.trim()) return historialCierres;
    const term = searchTerm.toLowerCase();
    return historialCierres.filter(c => 
      c.usuario_nombre.toLowerCase().includes(term) ||
      c.observaciones.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term)
    );
  }, [historialCierres, searchTerm]);

  const totalPages = Math.ceil(filteredCierres.length / itemsPerPage) || 1;
  const paginatedCierres = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCierres.slice(start, start + itemsPerPage);
  }, [filteredCierres, currentPage]);

  // Cálculos de Resumen
  const totalEfectivoEnCajas = turnosAbiertos.reduce((sum, t) => sum + t.esperado_efectivo, 0);
  const totalVentasActivas = turnosAbiertos.reduce((sum, t) => sum + t.total_ventas, 0);

  if (loading && turnosAbiertos.length === 0 && historialCierres.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-3xl animate-pulse">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
        <p className="text-slate-500 font-bold text-sm">Sincronizando estado de cajas con el servidor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* BARRA SUPERIOR DE ESTADO Y SINCRONIZACIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-black text-white rounded-xl shadow-xs">
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monitor de Control y Arqueo en Vivo</h3>
            <p className="text-xs text-slate-500 font-medium">
              Última actualización: <span className="font-mono font-semibold text-slate-700">{lastUpdated || 'Reciente'}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchMonitorData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-indigo-600' : ''} />
          {isRefreshing ? 'Actualizando...' : 'Refrescar Datos'}
        </button>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Turnos Abiertos</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black font-mono text-slate-900">{turnosAbiertos.length}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
              turnosAbiertos.length > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {turnosAbiertos.length > 0 ? 'Operando' : 'Sin Turnos'}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Efectivo Físico en Cajas</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black font-mono text-emerald-700">${totalEfectivoEnCajas.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 font-semibold">Esperado</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Recaudado (Turnos Activos)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black font-mono text-slate-900">${totalVentasActivas.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 font-semibold">Todos los métodos</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Cierres Auditados</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black font-mono text-slate-900">{historialCierres.length}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              Histórico
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: CAJAS ABIERTAS (TURNOS EN CURSO) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Cajas Abiertas en Tiempo Real ({turnosAbiertos.length})
          </h3>
        </div>

        {turnosAbiertos.length === 0 ? (
          <div className="bg-slate-50 p-8 rounded-3xl text-center border border-slate-200">
            <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="text-slate-700 font-bold text-sm">No hay turnos de caja abiertos en este momento.</p>
            <p className="text-xs text-slate-400 mt-1">Los especialistas verán la caja como cerrada hasta que inicien un nuevo turno.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {turnosAbiertos.map((turno) => (
              <div 
                key={turno.id} 
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                {/* Header Card */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {turno.usuario_nombre.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{turno.usuario_nombre}</h4>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        ● Caja Abierta
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Recaudación Total</span>
                    <span className="font-mono text-base font-black text-slate-900">
                      ${turno.total_ventas.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Desglose de Métodos de Pago Calculados */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <DollarSign size={13} className="text-emerald-600" /> Efectivo Esperado:
                    </span>
                    <span className="font-mono font-black text-emerald-700">
                      ${turno.esperado_efectivo.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Building2 size={13} className="text-slate-500" /> Transferencia:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      ${turno.esperado_transferencia.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Smartphone size={13} className="text-slate-500" /> De Una:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      ${turno.esperado_de_una.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CreditCard size={13} className="text-slate-500" /> Tarjeta:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      ${turno.esperado_tarjeta.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Info Apertura */}
                <div className="text-[11px] text-slate-500 flex justify-between items-center px-1">
                  <span>Apertura: <strong className="text-slate-700">{new Date(turno.hora_apertura).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  <span>Monto Base: <strong className="font-mono text-slate-700">${turno.monto_apertura.toFixed(2)}</strong></span>
                </div>

                {/* Botón Acción */}
                <button
                  type="button"
                  onClick={() => handleForzarCierre(turno)}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Lock size={13} />
                  Forzar Cierre de Turno
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: HISTORIAL DE CIERRES DE TURNO (AUDITORÍA COMPLETA) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Historial de Cierres de Turno (Auditoría de Cajas)</h3>
            <p className="text-xs text-slate-500">Registros persistidos en base de datos con verificación de arqueo y diferencias.</p>
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por especialista o notas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {filteredCierres.length === 0 ? (
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center text-slate-500 text-xs font-bold">
            {searchTerm ? `No se encontraron cierres que coincidan con "${searchTerm}".` : 'No hay cierres de caja registrados en el historial.'}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                  <tr>
                    <th className="p-4">Fecha / Hora Cierre</th>
                    <th className="p-4">Especialista</th>
                    <th className="p-4 text-right">Efectivo Esperado</th>
                    <th className="p-4 text-right">Efectivo Entregado</th>
                    <th className="p-4 text-center">Diferencia</th>
                    <th className="p-4 text-center">Estado Auditoría</th>
                    <th className="p-4">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCierres.map((c) => {
                    const diff = c.diferencia;
                    const isCuadrado = Math.abs(diff) < 0.01;
                    const isSobrante = diff > 0.01;
                    const isFaltante = diff < -0.01;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 text-slate-600 font-mono">
                          <div>
                            <strong className="text-slate-900 font-bold block">
                              {c.hora_cierre ? new Date(c.hora_cierre).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' }) : 'Reciente'}
                            </strong>
                            {c.hora_apertura && (
                              <span className="text-[10px] text-slate-400 block">
                                Inició: {new Date(c.hora_apertura).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-extrabold text-slate-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                            {c.usuario_nombre.charAt(0)}
                          </div>
                          <span>{c.usuario_nombre}</span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-slate-700">
                          ${c.efectivo_esperado.toFixed(2)}
                        </td>
                        <td className="p-4 text-right font-mono font-black text-slate-900">
                          ${c.efectivo_real.toFixed(2)}
                        </td>
                        <td className="p-4 text-center font-mono font-black">
                          {isCuadrado ? (
                            <span className="text-slate-400">$0.00</span>
                          ) : isSobrante ? (
                            <span className="text-blue-600">+{diff.toFixed(2)}</span>
                          ) : (
                            <span className="text-rose-600">{diff.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {isCuadrado ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase">
                              Cuadrado
                            </span>
                          ) : isSobrante ? (
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-[10px] font-extrabold uppercase">
                              Sobrante
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-[10px] font-extrabold uppercase">
                              Faltante
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 text-xs max-w-xs truncate" title={c.observaciones}>
                          {c.observaciones || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {filteredCierres.length > itemsPerPage && (
              <div className="bg-slate-50 p-3.5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredCierres.length)} de {filteredCierres.length} cierres
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-3 py-1 font-bold text-slate-700 bg-white border border-slate-200 rounded-lg">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
