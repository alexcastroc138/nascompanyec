import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db.service';

interface TurnoAbierto {
  id: string;
  usuario_id: string;
  usuario_nombre: string;
  hora_apertura: string;
  ingresos_calculados: number;
}

export const MonitorCajas: React.FC = () => {
  const [turnos, setTurnos] = useState<TurnoAbierto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTurnos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/caja/monitor.php');
      const data = await response.json();
      if (data.status === 'success') {
        setTurnos(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching turnos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurnos();
    const interval = setInterval(fetchTurnos, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleForzarCierre = async (turno: TurnoAbierto) => {
    const confirm = window.confirm(`¿Estás seguro de forzar el cierre de caja de ${turno.usuario_nombre}?`);
    if (!confirm) return;

    const payload = {
      id: turno.id,
      timestampCierre: new Date().toISOString(),
      expectedCash: turno.ingresos_calculados,
      actualCash: 0,
      difference: -turno.ingresos_calculados,
      notes: 'Forzado por Administrador'
    };

    const success = await dbService.cerrarTurno(payload);
    if (success) {
      alert('Caja cerrada forzosamente');
      fetchTurnos();
    } else {
      alert('Error al cerrar caja');
    }
  };

  if (loading && turnos.length === 0) {
    return <div className="p-4 text-center text-slate-500 font-bold">Cargando monitor de cajas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Cajas Abiertas</h3>
        <button onClick={fetchTurnos} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300">
          Actualizar
        </button>
      </div>

      {turnos.length === 0 ? (
        <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">
          <p className="text-slate-500 font-bold text-sm">No hay turnos activos en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {turnos.map((turno) => (
            <div key={turno.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-slate-800">{turno.usuario_nombre}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Abierta</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-bold block">Ingresos Turno</span>
                  <span className="font-mono text-lg font-black text-slate-900">${Number(turno.ingresos_calculados).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Hora Apertura</span>
                  <span className="text-xs font-bold text-slate-700">{new Date(turno.hora_apertura).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => handleForzarCierre(turno)}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-colors border border-rose-100"
              >
                Forzar Cierre de Caja
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
