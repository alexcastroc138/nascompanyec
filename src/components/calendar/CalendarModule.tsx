// src/components/calendar/CalendarModule.tsx
"use client";

import React, { useState } from 'react';
import { Appointment } from '../../types/appointment';
import AppointmentModal from './AppointmentModal';
import AppointmentForm from './AppointmentForm';
import { generarLinkGoogleCalendar } from '../../utils/calendarUtils';
import { 
  Plus, Calendar, Search, Edit2, Trash2, DollarSign, 
  CheckCircle, Clock, AlertCircle, Phone, User, Filter, Eye 
} from 'lucide-react';

interface CalendarModuleProps {
  isAdmin?: boolean;
  currentSpecialistName?: string;
  specialistsList?: string[];
  appointments?: Appointment[];
  onSaveAppointment?: (apt: Appointment) => void;
  onAddAbono?: (id: string, monto: number, metodoPago: string) => void;
  onDeleteAppointment?: (id: string) => void;
  onProcesarAbonoACaja?: (apt: Appointment) => void;
}

export default function CalendarModule({
  isAdmin = false,
  currentSpecialistName = 'Ámbar Piercing',
  specialistsList = ['Ámbar Piercing', 'Carlos Tattoo', 'Elena BodyArt', 'General Studio'],
  appointments = [],
  onSaveAppointment,
  onAddAbono,
  onDeleteAppointment,
  onProcesarAbonoACaja
}: CalendarModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState<string>('todos');
  const [mostrarSoloHoy, setMostrarSoloHoy] = useState(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Details Modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Appointment | null>(null);
  
  // Abono Modal states
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
  const [selectedAbonoAppt, setSelectedAbonoAppt] = useState<Appointment | null>(null);
  const [nuevoAbono, setNuevoAbono] = useState<number>(0);
  const [metodoPagoAbono, setMetodoPagoAbono] = useState<string>('efectivo');

  // Delete Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAppt, setDeletingAppt] = useState<Appointment | null>(null);

  // Filter appointments
  const localD = new Date();
  localD.setMinutes(localD.getMinutes() - localD.getTimezoneOffset());
  const hoyStr = localD.toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((apt) => {
    const clientName = apt.cliente || apt.customerName || '';
    const phone = apt.telefono || apt.customerPhone || '';
    const details = apt.detalles || apt.service || '';
    
    const matchesSearch = 
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      details.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesService = filterService === 'todos' || (apt.servicio || apt.service) === filterService;
    
    const aptFecha = apt.fecha || apt.date || '';
    const matchesToday = !mostrarSoloHoy || aptFecha === hoyStr;

    return matchesSearch && matchesService && matchesToday;
  });

  // Cálculo del Total de Abonos en Custodia para el filtro / día actual seleccionado
  const totalAbonosCustodiaDia = filteredAppointments.reduce((sum, apt) => {
    const isCustodia = apt.estadoAbono === 'en_custodia' || (apt.fecha !== hoyStr && (apt.abonado || apt.deposit || 0) > 0);
    return isCustodia ? sum + (apt.abonado || apt.deposit || 0) : sum;
  }, 0);

  const handleOpenDetails = (apt: Appointment) => {
    setCitaSeleccionada(apt);
    setIsDetailsModalOpen(true);
  };

  const procesarAbonoACaja = (cita: Appointment) => {
    if (!cita) return;

    const updatedApt: Appointment = {
      ...cita,
      estadoAbono: 'ingresado_caja'
    };

    if (onProcesarAbonoACaja) {
      onProcesarAbonoACaja(cita);
    } else {
      onSaveAppointment?.(updatedApt);
    }

    setCitaSeleccionada(updatedApt);
    setIsDetailsModalOpen(false);
  };

  const handleOpenNewModal = () => {
    setEditingAppointment(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setIsFormModalOpen(true);
  };

  const handleSaveAppointment = (savedAppointment: Appointment) => {
    onSaveAppointment?.(savedAppointment);
    setIsFormModalOpen(false);
    setEditingAppointment(null);
  };

  // Open Registrar Abono Modal
  const handleOpenAbonoModal = (apt: Appointment) => {
    setSelectedAbonoAppt(apt);
    setNuevoAbono(0);
    setMetodoPagoAbono('efectivo'); // Resetear al abrir
    setIsAbonoModalOpen(true);
  };

  // Save Nuevo Abono
  const handleSaveAbono = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAbonoAppt || nuevoAbono <= 0) return;
    onAddAbono?.(selectedAbonoAppt.id, nuevoAbono, metodoPagoAbono);
    setIsAbonoModalOpen(false);
    setSelectedAbonoAppt(null);
    setNuevoAbono(0);
  };

  const handleOpenDeleteModal = (apt: Appointment) => {
    setDeletingAppt(apt);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingAppt) return;
    onDeleteAppointment?.(deletingAppt.id);
    setIsDeleteModalOpen(false);
    setDeletingAppt(null);
  };

  // Direct Status Update from Table
  const handleChangeEstado = (id: string, nuevoEstado: string) => {
    const aptToUpdate = appointments.find(a => a.id === id);
    if (aptToUpdate && onSaveAppointment) {
      onSaveAppointment({
        ...aptToUpdate,
        estado: nuevoEstado as any
      });
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-black" />
            <h1 className="text-lg font-bold text-gray-900 tracking-tight font-display">
              Gestión de Citas y Agenda
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isAdmin 
              ? 'Administra las citas globales de todos los artistas y especialistas del estudio.' 
              : `Agenda personal de ${currentSpecialistName}. Registra abonos y gestiona clientes.`}
          </p>
        </div>
        <button
          onClick={handleOpenNewModal}
          className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] shrink-0"
        >
          <Plus size={16} />
          <span>+ Nueva Cita</span>
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, teléfono o detalles..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition select-none shrink-0 shadow-2xs">
            <input 
              type="checkbox" 
              checked={mostrarSoloHoy} 
              onChange={(e) => setMostrarSoloHoy(e.target.checked)} 
              className="w-4 h-4 accent-black rounded cursor-pointer"
            />
            <span className="font-bold text-gray-800 text-[11px] whitespace-nowrap">Ver solo citas de hoy</span>
          </label>
        </div>

        <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto justify-start sm:justify-end">
          <Filter className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          {(['todos', 'Perforación', 'Tatuaje', 'Joyería', 'Control'].map(filter => (
            <button
              key={filter}
              onClick={() => setFilterService(filter)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                filterService === filter 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter === 'todos' ? 'Todos los Servicios' : filter}
            </button>
          )))}
        </div>
      </div>

      {/* RESUMEN DE ABONOS EN CUSTODIA DEL DÍA / FILTRO SELECCIONADO */}
      {totalAbonosCustodiaDia > 0 && (
        <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              💰
            </div>
            <div>
              <div className="text-sm font-extrabold text-emerald-950 flex flex-wrap items-center gap-2">
                <span>Total de Abonos en Custodia para este día:</span>
                <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg text-sm border border-emerald-300 font-black">
                  ${totalAbonosCustodiaDia.toFixed(2)} USD
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                🔒 Dinero abonado en reserva. No suma a la caja del día actual por ser citas futuras. Se abonará al completarse.
              </p>
            </div>
          </div>
          <div className="self-start sm:self-auto shrink-0">
            <span className="px-3 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs">
              <span>🔒 Custodia Activa</span>
            </span>
          </div>
        </div>
      )}

      {/* MAIN DATA TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase font-extrabold tracking-wider text-gray-500">
              <tr>
                <th className="py-3.5 px-4 font-bold">Cliente</th>
                <th className="py-3.5 px-4 font-bold">Fecha y Hora</th>
                <th className="py-3.5 px-4 font-bold">Especialista</th>
                <th className="py-3.5 px-4 font-bold">Servicio / Detalles</th>
                <th className="py-3.5 px-4 font-bold text-right">Total USD</th>
                <th className="py-3.5 px-4 font-bold text-right">Abonado</th>
                <th className="py-3.5 px-4 font-bold text-right">Pendiente</th>
                <th className="py-3.5 px-4 font-bold text-center">Estado</th>
                <th className="py-3.5 px-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Calendar size={32} className="opacity-20 mb-3" />
                      <p className="text-sm font-medium">No se encontraron citas agendadas.</p>
                      <p className="text-xs mt-1">Intenta ajustando los filtros de búsqueda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const saldoPendiente = Math.max(0, apt.precioTotal - apt.abonado);
                  return (
                    <tr key={apt.id} className="hover:bg-gray-50/60 transition duration-150">
                      
                      <td className="py-3.5 px-4 font-medium text-gray-900">
                        <div className="font-bold">{apt.cliente || apt.customerName}</div>
                        {(apt.telefono || apt.customerPhone) && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone size={10} className="text-gray-400" />
                            <span>{apt.telefono || apt.customerPhone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{apt.fecha || apt.date}</div>
                        <div className="text-xs text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                          <Clock size={10} className="text-gray-400" />
                          <span>{apt.hora || apt.time}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-800">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-800 font-medium rounded-md text-[11px]">
                          {apt.especialista || apt.specialistName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-800 max-w-[220px]">
                        <div className="font-bold text-gray-900">{apt.servicio || apt.service}</div>
                        {(apt.detalles || apt.details) && (
                          <div className="text-xs text-gray-500 truncate mt-0.5" title={apt.detalles || apt.details}>
                            {apt.detalles || apt.details}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                        ${(apt.precioTotal || apt.price || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                        <div className="text-emerald-700">${(apt.abonado || apt.deposit || 0).toFixed(2)}</div>
                        {(apt.abonado || apt.deposit || 0) > 0 && (
                          <div className="mt-0.5">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                                apt.estadoAbono === 'en_custodia' || (apt.fecha || apt.date) !== hoyStr
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              <span>💵 Abono Pagado: ${(apt.abonado || apt.deposit || 0).toFixed(2)}</span>
                              <span>
                                {apt.estadoAbono === 'en_custodia' || (apt.fecha || apt.date) !== hoyStr
                                  ? '(Custodia)'
                                  : '(En Caja)'}
                              </span>
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                        <span className={saldoPendiente > 0 ? 'text-amber-700' : 'text-gray-400 font-normal'}>
                          ${saldoPendiente.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <select
                          value={apt.estado || apt.status || 'pendiente'}
                          onChange={(e) => handleChangeEstado(apt.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider cursor-pointer border-none focus:ring-0 appearance-none text-center outline-none ${
                            apt.estado === 'falto' || apt.estado === 'cancelado' 
                              ? 'bg-rose-100 text-rose-800'
                              : apt.estado === 'pagado' || apt.estado === 'realizado' || saldoPendiente === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.estado === 'confirmada'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="pagado">Pagado</option>
                          <option value="realizado">Realizado</option>
                          <option value="falto">Falto</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(apt)}
                            title="Ver Detalles de Cita"
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => window.open(generarLinkGoogleCalendar(apt), '_blank')}
                            title="Agregar a Google Calendar"
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Calendar size={13} />
                            <span className="hidden sm:inline">Google Calendar</span>
                          </button>
                          <button
                            onClick={() => handleOpenAbonoModal(apt)}
                            title="Registrar Abono"
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <DollarSign size={12} />
                            <span>Abonar</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(apt)}
                            title="Editar Cita"
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(apt)}
                            title="Eliminar Cita"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {/* MODAL DETALLES DE CITA */}
      <AppointmentModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setCitaSeleccionada(null);
        }}
        title="Detalles de la Cita Agendada"
      >
        {citaSeleccionada && (
          <div className="space-y-4 font-sans text-xs text-gray-800">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{citaSeleccionada.cliente || citaSeleccionada.customerName}</h3>
                  <p className="text-slate-500 font-mono mt-0.5">{citaSeleccionada.telefono || citaSeleccionada.customerPhone || 'Sin teléfono'}</p>
                </div>
                <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold">
                  {citaSeleccionada.especialista || citaSeleccionada.specialistName}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 font-bold block">Servicio:</span>
                  <span className="font-bold text-slate-900">{citaSeleccionada.servicio || citaSeleccionada.service}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Fecha y Hora:</span>
                  <span className="font-bold text-slate-900">{citaSeleccionada.fecha || citaSeleccionada.date} - {citaSeleccionada.hora || citaSeleccionada.time}</span>
                </div>
              </div>

              {(citaSeleccionada.detalles || citaSeleccionada.details) && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 font-bold block">Detalles:</span>
                  <p className="text-slate-700 font-medium italic mt-0.5">{citaSeleccionada.detalles || citaSeleccionada.details}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Resumen Financiero</h4>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 text-[10px] block font-bold">Precio Total</span>
                  <span className="text-sm font-extrabold text-slate-900">${(citaSeleccionada.precioTotal || citaSeleccionada.price || 0).toFixed(2)}</span>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-emerald-700 text-[10px] block font-bold">Abonado</span>
                  <span className="text-sm font-extrabold text-emerald-800">${(citaSeleccionada.abonado || citaSeleccionada.deposit || 0).toFixed(2)}</span>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-amber-700 text-[10px] block font-bold">Pendiente</span>
                  <span className="text-sm font-extrabold text-amber-800">${Math.max(0, (citaSeleccionada.precioTotal || citaSeleccionada.price || 0) - (citaSeleccionada.abonado || citaSeleccionada.deposit || 0)).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-slate-600 text-xs">
                <span>Método Pago Abono: <strong className="text-slate-900 uppercase">{(citaSeleccionada.metodoPagoAbono || citaSeleccionada.metodoPagoInicial || 'Efectivo')}</strong></span>
                <span>Estado Abono: <strong className="text-slate-900 uppercase">{citaSeleccionada.estadoAbono || 'Sin abono'}</strong></span>
              </div>
            </div>

            {citaSeleccionada?.estadoAbono === 'en_custodia' && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-xs text-emerald-800 font-medium mb-3">
                  ⚠️ Este abono de ${citaSeleccionada.abonado} está en custodia y aún no ingresa a la caja de hoy.
                </p>
                <button
                  onClick={() => procesarAbonoACaja(citaSeleccionada)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  📥 Ingresar $ {citaSeleccionada.abonado} a Caja Fuerte Ahora
                </button>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setCitaSeleccionada(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </AppointmentModal>

      <AppointmentModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAppointment(null);
        }}
        title={editingAppointment ? 'Editar Cita Agendada' : 'Agendar Nueva Cita'}
      >
        <AppointmentForm
          initialData={editingAppointment || undefined}
          onSubmit={handleSaveAppointment}
          onCancel={() => {
            setIsFormModalOpen(false);
            setEditingAppointment(null);
          }}
          isAdmin={isAdmin}
          specialistsList={specialistsList}
        />
      </AppointmentModal>

      {/* MODAL ABONOS CON MÉTODO DE PAGO */}
      <AppointmentModal
        isOpen={isAbonoModalOpen}
        onClose={() => {
          setIsAbonoModalOpen(false);
          setSelectedAbonoAppt(null);
        }}
        title="Registrar Nuevo Abono a Cita"
      >
        {selectedAbonoAppt && (
          <form onSubmit={handleSaveAbono} className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
              <p className="font-bold text-gray-900">{selectedAbonoAppt.cliente || selectedAbonoAppt.customerName}</p>
              <p className="text-gray-500">
                Servicio: <span className="font-semibold text-gray-800">{selectedAbonoAppt.servicio || selectedAbonoAppt.service}</span>
              </p>
              <div className="flex justify-between pt-1 border-t border-gray-200 text-gray-700">
                <span>Precio Total: <strong>${(selectedAbonoAppt.precioTotal || selectedAbonoAppt.price || 0).toFixed(2)}</strong></span>
                <span>Abonado: <strong className="text-emerald-700">${(selectedAbonoAppt.abonado || selectedAbonoAppt.deposit || 0).toFixed(2)}</strong></span>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              <label className="font-semibold text-gray-800 block">Método de Pago *</label>
              <select
                value={metodoPagoAbono}
                onChange={(e) => setMetodoPagoAbono(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="de_una">De Una</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-800 block">Monto del Abono ($ USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={Math.max(0.01, (selectedAbonoAppt.precioTotal || selectedAbonoAppt.price || 0) - (selectedAbonoAppt.abonado || selectedAbonoAppt.deposit || 0))}
                  required
                  autoFocus
                  value={nuevoAbono || ''}
                  onChange={(e) => setNuevoAbono(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAbonoModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={nuevoAbono <= 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold rounded-lg transition"
              >
                Guardar Abono
              </button>
            </div>
          </form>
        )}
      </AppointmentModal>

      <AppointmentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
      >
        {deletingAppt && (
          <div className="space-y-4 text-xs">
            <p>Se eliminará la cita de <strong>{deletingAppt.cliente}</strong>.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-rose-600 text-white rounded-lg">Eliminar</button>
            </div>
          </div>
        )}
      </AppointmentModal>

    </div>
  );
}
