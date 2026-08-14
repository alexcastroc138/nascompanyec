"use client";

import React, { useState, useEffect } from 'react';
import { Alert } from '../../types/alert';
import { getLocalISOString, getTodayStr } from '../../utils/dateUtils';
import { 
  AlertTriangle, Landmark, CheckCircle2, ShieldCheck, 
  Check, Loader2, Package, Bell, RefreshCw
} from 'lucide-react';

const MOCK_API_ALERTS: Alert[] = [
  {
    id: 'alt_1',
    tipo: 'CAJA',
    titulo: 'Alerta de Cierre de Caja con Desfase',
    mensaje: 'Desfase detectado en el cierre nocturno: -$15.50 USD. Fondo esperado: $250.00, entregado: $234.50.',
    emisor: 'ambar@bodyart.com',
    fecha: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    leida: false
  },
  {
    id: 'alt_2',
    tipo: 'STOCK',
    titulo: 'Stock Crítico en Inventario',
    mensaje: 'El producto "Agujas Catéter 16G Titanio" ha alcanzado 0 unidades en inventario.',
    emisor: 'sistema@bodyart.com',
    fecha: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    leida: false
  },
  {
    id: 'alt_3',
    tipo: 'CAJA',
    titulo: 'Cierre de Caja Turno Tarde Exitoso',
    mensaje: 'Cierre completado sin novedades por $340.00 USD. Cuadre perfecto de efectivo.',
    emisor: 'carlos@bodyart.com',
    fecha: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hours ago
    leida: true
  },
  {
    id: 'alt_4',
    tipo: 'STOCK',
    titulo: 'Reposición Sugerida de Joyería',
    mensaje: 'Labret Titanio ASTM F-136 se encuentra bajo el límite mínimo (3 unidades restantes).',
    emisor: 'inventario@bodyart.com',
    fecha: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
    leida: true
  },
  {
    id: 'alt_5',
    tipo: 'SISTEMA',
    titulo: 'Sincronización SRI Completada',
    mensaje: 'Todas las facturas electrónicas del día fueron firmadas y enviadas al SRI con éxito.',
    emisor: 'sri@bodyart.com',
    fecha: new Date(Date.now() - 1000 * 60 * 2880).toISOString(), // 2 days ago
    leida: true
  }
];

export default function AlertsTab() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // useEffect simulating API fetch (/api/alerts)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchAlerts = async () => {
      try {
        // Simulating API network latency
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (isMounted) {
          setAlerts(MOCK_API_ALERTS);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAlerts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkAllAsRead = () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, leida: true })));
  };

  const handleToggleRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, leida: !alert.leida } : alert
      )
    );
  };

  const unreadCount = alerts.filter((a) => !a.leida).length;

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-5 font-sans text-xs">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-150 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-gray-900" />
            <h3 className="font-bold text-gray-900 text-base font-display">
              Centro de Alertas y Notificaciones Dinámicas
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-extrabold rounded-full">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitoreo en tiempo real de cierres de caja con desfases y niveles críticos de stock en inventario.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 size={14} className="text-gray-700" />
            <span>Marcar todas como leídas</span>
          </button>
        </div>
      </div>

      {/* CONTENT LIST */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <Loader2 size={24} className="animate-spin text-gray-800" />
          <p className="text-xs font-medium">Cargando historial de alertas del servidor...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <p className="text-xs">No hay alertas registradas en el sistema.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isDesfase =
              alert.tipo === 'CAJA' &&
              (alert.titulo.toLowerCase().includes('desfase') ||
                alert.mensaje.toLowerCase().includes('desfase') ||
                alert.mensaje.includes('-'));

            return (
              <div
                key={alert.id}
                onClick={() => handleToggleRead(alert.id)}
                className={`p-4 rounded-xl border transition duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  alert.leida
                    ? 'bg-gray-50/60 border-gray-200/70 opacity-60'
                    : 'bg-white border-gray-200 shadow-2xs hover:border-gray-300'
                }`}
              >
                {/* Left Side: Icon + Message Details */}
                <div className="flex items-start gap-3.5 flex-1">
                  
                  {/* Icon depending on type */}
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      alert.tipo === 'STOCK'
                        ? 'bg-amber-100 text-amber-800'
                        : alert.tipo === 'CAJA'
                        ? isDesfase
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {alert.tipo === 'STOCK' ? (
                      <AlertTriangle size={18} />
                    ) : alert.tipo === 'CAJA' ? (
                      <Landmark size={18} />
                    ) : (
                      <ShieldCheck size={18} />
                    )}
                  </div>

                  {/* Text content */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-xs ${
                          isDesfase ? 'text-red-600 font-extrabold' : 'text-gray-900'
                        }`}
                      >
                        {alert.titulo}
                      </span>
                      {!alert.leida && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{alert.mensaje}</p>

                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <span>Emisor: <strong className="text-gray-600">{alert.emisor}</strong></span>
                      <span>•</span>
                      <span className="uppercase font-bold tracking-wider text-gray-500">{alert.tipo}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Timestamp & Read Status Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 text-right shrink-0">
                  <span className="text-xs text-gray-400 font-mono">
                    {new Date(alert.fecha).toLocaleString('es-EC', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRead(alert.id);
                    }}
                    className={`mt-1 px-2 py-0.5 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                      alert.leida
                        ? 'text-gray-400 hover:text-gray-700'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {alert.leida ? (
                      <span>Leída</span>
                    ) : (
                      <>
                        <Check size={12} />
                        <span>Marcar leída</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
