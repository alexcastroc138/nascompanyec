"use client";

import React, { useState, useEffect } from 'react';
import { Appointment, InventoryItem } from '../../types/appointment';
import { Calendar, Clock, User, Phone, DollarSign, FileText, Sparkles, UserCheck, AlertCircle } from 'lucide-react';
import { generarLinkGoogleCalendar } from '../../utils/calendarUtils';

interface AppointmentFormProps {
  initialData?: Partial<Appointment>;
  onSubmit: (data: Appointment) => void;
  onCancel: () => void;
  isAdmin?: boolean;
  specialistsList?: string[];
}

const DEFAULT_SPECIALISTS = ['Ámbar Piercing', 'Carlos Tattoo', 'Elena BodyArt', 'General Studio'];

const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'joya_1', nombre: 'Labret Titanio ASTM F-136', stock: 8, categoria: 'Piercing' },
  { id: 'joya_2', nombre: 'Argolla Clicker Titanio G23', stock: 3, categoria: 'Piercing' },
  { id: 'joya_3', nombre: 'Nostril L-Bend Oro 14k', stock: 0, categoria: 'Piercing' },
  { id: 'joya_4', nombre: 'Microdermal Titanio 4mm', stock: 5, categoria: 'Piercing' },
  { id: 'joya_5', nombre: 'Banana Navel Cristal Swarovsky', stock: 0, categoria: 'Piercing' }
];

export default function AppointmentForm({
  initialData,
  onSubmit,
  onCancel,
  isAdmin = false,
  specialistsList = DEFAULT_SPECIALISTS
}: AppointmentFormProps) {
  const getLocalTodayStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  // Main fields
  const [cliente, setCliente] = useState(initialData?.cliente || '');
  const [telefono, setTelefono] = useState(initialData?.telefono || '');
  const [fecha, setFecha] = useState(initialData?.fecha || getLocalTodayStr());
  const [hora, setHora] = useState(initialData?.hora || '10:00');
  const [especialista, setEspecialista] = useState(initialData?.especialista || specialistsList[0] || 'Ámbar Piercing');
  const [servicio, setServicio] = useState(initialData?.servicio || 'Tatuaje');

  // Dynamic Detail fields depending on service
  const [zonaCorporal, setZonaCorporal] = useState('');
  const [tamano, setTamano] = useState('');
  const [color, setColor] = useState('Negro / Sombras');
  const [selectedJoyaId, setSelectedJoyaId] = useState<string>(initialData?.joyaId || 'joya_1');
  const [observaciones, setObservaciones] = useState('');
  const [joyaError, setJoyaError] = useState<string>('');

  // Global Financial fields (Always at bottom, always visible, always editable)
  const [precioTotal, setPrecioTotal] = useState<number>(initialData?.precioTotal || 0);
  const [abonado, setAbonado] = useState<number>(initialData?.abonado || 0);
  const [metodoPagoAbono, setMetodoPagoAbono] = useState<string>(initialData?.metodoPagoAbono || initialData?.metodoPagoInicial || 'efectivo');
  const [aplicaComision, setAplicaComision] = useState<boolean>(initialData?.aplicaComision ?? initialData?.captadoPorEspecialista ?? true);
  
  // Mixed payment states
  const [isPagoMixto, setIsPagoMixto] = useState<boolean>(false);
  const [montoEfectivo, setMontoEfectivo] = useState<number>(0);
  const [montoTransferencia, setMontoTransferencia] = useState<number>(0);
  const [montoDeUna, setMontoDeUna] = useState<number>(0);
  const [montoTarjeta, setMontoTarjeta] = useState<number>(0);

  // Parse existing details if editing
  useEffect(() => {
    if (initialData) {
      setCliente(initialData.cliente || '');
      setTelefono(initialData.telefono || '');
      setFecha(initialData.fecha || getLocalTodayStr());
      setHora(initialData.hora || '10:00');
      setEspecialista(initialData.especialista || specialistsList[0] || 'Ámbar Piercing');
      setServicio(initialData.servicio || 'Tatuaje');
      setPrecioTotal(initialData.precioTotal ?? 0);
      setAbonado(initialData.abonado ?? 0);
      if (initialData.metodoPagoAbono || initialData.metodoPagoInicial) {
        setMetodoPagoAbono(initialData.metodoPagoAbono || initialData.metodoPagoInicial || 'cash');
      }
      if (initialData.aplicaComision !== undefined || initialData.captadoPorEspecialista !== undefined) {
        setAplicaComision(initialData.aplicaComision ?? initialData.captadoPorEspecialista ?? true);
      }
      if (initialData.joyaId) {
        setSelectedJoyaId(initialData.joyaId);
      }

      if (initialData.detalles) {
        setObservaciones(initialData.detalles);
      }
    }
  }, [initialData, specialistsList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedJoya = INVENTORY_ITEMS.find((item) => item.id === selectedJoyaId);

    // Strict validation for Piercing inventory stock
    if (servicio === 'Perforación') {
      if (!selectedJoya || selectedJoya.stock === 0) {
        setJoyaError('Esta joya se encuentra agotada en inventario.');
        return;
      }
    }
    setJoyaError('');

    // Construct details summary according to service type
    let detallesFormatted = observaciones;
    if (servicio === 'Tatuaje') {
      const parts = [];
      if (zonaCorporal) parts.push(`Zona: ${zonaCorporal}`);
      if (tamano) parts.push(`Tamaño: ${tamano}`);
      if (color) parts.push(`Estilo: ${color}`);
      if (observaciones) parts.push(`Notas: ${observaciones}`);
      detallesFormatted = parts.length > 0 ? parts.join(' | ') : 'Sin detalles específicos';
    } else if (servicio === 'Perforación') {
      const parts = [];
      if (zonaCorporal) parts.push(`Zona: ${zonaCorporal}`);
      if (selectedJoya) parts.push(`Joya: ${selectedJoya.nombre}`);
      if (observaciones) parts.push(`Notas: ${observaciones}`);
      detallesFormatted = parts.length > 0 ? parts.join(' | ') : 'Sin detalles específicos';
    }

    const initialDeposit = Number(abonado) || 0;

    if (isPagoMixto && initialDeposit > 0) {
      const sum = montoEfectivo + montoTransferencia + montoDeUna + montoTarjeta;
      if (Math.abs(sum - initialDeposit) > 0.01) {
        alert('❌ En Pago Mixto, la suma de los montos debe ser igual al Abono Inicial.');
        return;
      }
      detallesFormatted += ` | Pago Mixto: Efectivo ${montoEfectivo.toFixed(2)}, Transferencia ${montoTransferencia.toFixed(2)}, DeUna ${montoDeUna.toFixed(2)}, Tarjeta ${montoTarjeta.toFixed(2)}`;
    }

    const todayStr = getLocalTodayStr();
    const isToday = fecha === todayStr;

    const appointmentPayload: Appointment = {
      id: initialData?.id || `apt_${Date.now()}`,
      cliente: cliente.trim(),
      telefono: telefono.trim(),
      fecha,
      hora,
      especialista,
      servicio,
      detalles: detallesFormatted,
      joyaId: servicio === 'Perforación' ? selectedJoyaId : undefined,
      precioTotal: Number(precioTotal) || 0,
      abonado: initialDeposit,
      metodoPagoInicial: initialDeposit > 0 ? (metodoPagoAbono as any) : undefined,
      metodoPagoAbono: initialDeposit > 0 ? (metodoPagoAbono as any) : undefined,
      estadoAbono: initialDeposit > 0 ? (isToday ? 'ingresado_caja' : 'en_custodia') : 'sin_abono',
      aplicaComision,
      estado: initialData?.estado || 'pendiente'
    };

    onSubmit(appointmentPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans text-xs">
      {/* 1. INFORMACIÓN BÁSICA DEL CLIENTE Y CITA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Cliente */}
        <div className="space-y-1">
          <label className="font-semibold text-gray-700 flex items-center gap-1.5">
            <User size={13} className="text-gray-400" />
            <span>Nombre del Cliente *</span>
          </label>
          <input
            type="text"
            required
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Ej. Maria Lopez"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Teléfono */}
        <div className="space-y-1">
          <label className="font-semibold text-gray-700 flex items-center gap-1.5">
            <Phone size={13} className="text-gray-400" />
            <span>Teléfono / WhatsApp *</span>
          </label>
          <input
            type="tel"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej. +593 99 123 4567"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Fecha */}
        <div className="space-y-1">
          <label className="font-semibold text-gray-700 flex items-center gap-1.5">
            <Calendar size={13} className="text-gray-400" />
            <span>Fecha de Cita *</span>
          </label>
          <input
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Hora */}
        <div className="space-y-1">
          <label className="font-semibold text-gray-700 flex items-center gap-1.5">
            <Clock size={13} className="text-gray-400" />
            <span>Hora *</span>
          </label>
          <input
            type="time"
            required
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* 2. SERVICIO Y ESPECIALISTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
        {/* Tipo de Servicio */}
        <div className="space-y-1">
          <label className="font-semibold text-gray-700 flex items-center gap-1.5">
            <Sparkles size={13} className="text-gray-400" />
            <span>Tipo de Servicio *</span>
          </label>
          <select
            value={servicio}
            onChange={(e) => {
              setServicio(e.target.value);
              setJoyaError('');
            }}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer"
          >
            <option value="Tatuaje">Tatuaje</option>
            <option value="Perforación">Perforación</option>
            <option value="Control">Control / Mantenimiento</option>
            <option value="Retoque">Retoque</option>
            <option value="Otro">Otro servicio</option>
          </select>
        </div>

        {/* Especialista (Visible/Editable para Admin o Selector) */}
        <div className="space-y-1">
          <label className="font-semibold text-gray-700 flex items-center gap-1.5">
            <UserCheck size={13} className="text-gray-400" />
            <span>Especialista Asignado *</span>
          </label>
          {isAdmin ? (
            <select
              value={especialista}
              onChange={(e) => setEspecialista(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer font-medium"
            >
              {specialistsList.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={especialista}
              onChange={(e) => setEspecialista(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black"
            />
          )}
        </div>
      </div>

      {/* 3. CAMPOS DINÁMICOS DE DETALLES SEGÚN EL SERVICIO */}
      <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/70 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900 uppercase tracking-wider text-xs flex items-center gap-1">
            <FileText size={12} className="text-gray-500" />
            Detalles Específicos del Servicio
          </span>
          <span className="text-xs text-gray-400 font-medium">({servicio})</span>
        </div>

        {servicio === 'Tatuaje' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">Zona Corporal</label>
              <input
                type="text"
                placeholder="Ej. Antebrazo derecho"
                value={zonaCorporal}
                onChange={(e) => setZonaCorporal(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">Tamaño Estimado</label>
              <input
                type="text"
                placeholder="Ej. 10x15 cm"
                value={tamano}
                onChange={(e) => setTamano(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">Color / Estilo</label>
              <input
                type="text"
                placeholder="Ej. Negro y Sombras"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs"
              />
            </div>
          </div>
        )}

        {servicio === 'Perforación' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">Zona / Perforación</label>
              <input
                type="text"
                placeholder="Ej. Nostril izquierdo / Helix"
                value={zonaCorporal}
                onChange={(e) => setZonaCorporal(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">Joya Incluida (Inventario)</label>
              <select
                value={selectedJoyaId}
                onChange={(e) => {
                  setSelectedJoyaId(e.target.value);
                  setJoyaError('');
                }}
                className={`w-full px-2.5 py-1.5 bg-white border rounded-md text-xs font-medium focus:outline-none cursor-pointer ${
                  joyaError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-gray-200 focus:border-black'
                }`}
              >
                {INVENTORY_ITEMS.map((item) => (
                  <option key={item.id} value={item.id} disabled={item.stock === 0}>
                    {item.nombre} (Stock: {item.stock})
                  </option>
                ))}
              </select>
              {joyaError && (
                <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{joyaError}</span>
                </p>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-medium text-gray-600 block mb-1">Observaciones / Especificaciones</label>
          <textarea
            rows={2}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Anota referencias de diseño, alergias, requerimientos de anestesia o notas del cliente..."
            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* 4. FINANZAS Y ABONOS (GLOBALES: SIEMPRE VISIBLES Y EDITABLES AL FINAL) */}
      <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-emerald-900 tracking-tight text-xs flex items-center gap-1.5">
            <DollarSign size={14} className="text-emerald-600" />
            Finanzas de la Cita (Campos Globales)
          </span>
          <span className="text-[11px] font-bold text-emerald-800">
            Pendiente: ${Math.max(0, (precioTotal || 0) - (abonado || 0)).toFixed(2)} USD
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Precio Total */}
          <div className="space-y-1">
            <label className="font-semibold text-gray-800 block text-xs">
              Precio Total ($ USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={precioTotal}
                onChange={(e) => setPrecioTotal(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Abono Inicial */}
          <div className="space-y-1">
            <label className="font-semibold text-gray-800 block text-xs">
              Abono Inicial ($ USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max={precioTotal || 9999}
                required
                value={abonado}
                onChange={(e) => setAbonado(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Método de Pago del Anticipo / Abono Inicial */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Método de Pago del Anticipo <span className="text-red-500">*</span>
            </label>
            <label className="flex items-center gap-1 text-xs font-bold text-blue-600 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPagoMixto} 
                onChange={(e) => {
                  setIsPagoMixto(e.target.checked);
                  if (!e.target.checked) setMetodoPagoAbono('efectivo');
                  else setMetodoPagoAbono('mixto');
                }}
                className="w-3.5 h-3.5 accent-blue-600 rounded"
              />
              Pago Mixto
            </label>
          </div>
          
          {!isPagoMixto ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMetodoPagoAbono('efectivo')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPagoAbono === 'efectivo' || metodoPagoAbono === 'cash'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                💵 Efectivo
              </button>
              <button
                type="button"
                onClick={() => setMetodoPagoAbono('transferencia')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPagoAbono === 'transferencia' || metodoPagoAbono === 'transfer'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🏦 Transferencia
              </button>
              <button
                type="button"
                onClick={() => setMetodoPagoAbono('de_una')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPagoAbono === 'de_una'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                📱 De Una
              </button>
              <button
                type="button"
                onClick={() => setMetodoPagoAbono('tarjeta')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  metodoPagoAbono === 'tarjeta' || metodoPagoAbono === 'card'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                💳 Tarjeta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 w-24">💵 Efectivo:</span>
                <input 
                  type="number" step="0.01" min="0" value={montoEfectivo || ''} 
                  onChange={(e) => setMontoEfectivo(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500" placeholder="0.00"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 w-24">🏦 Transferencia:</span>
                <input 
                  type="number" step="0.01" min="0" value={montoTransferencia || ''} 
                  onChange={(e) => setMontoTransferencia(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500" placeholder="0.00"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 w-24">📱 De Una:</span>
                <input 
                  type="number" step="0.01" min="0" value={montoDeUna || ''} 
                  onChange={(e) => setMontoDeUna(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500" placeholder="0.00"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 w-24">💳 Tarjeta:</span>
                <input 
                  type="number" step="0.01" min="0" value={montoTarjeta || ''} 
                  onChange={(e) => setMontoTarjeta(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500" placeholder="0.00"
                />
              </div>
              <div className="text-xs font-bold text-right mt-1 flex justify-between items-center">
                <span className="text-slate-500">Suma total: ${(montoEfectivo + montoTransferencia + montoDeUna + montoTarjeta).toFixed(2)}</span>
                <span className={(montoEfectivo + montoTransferencia + montoDeUna + montoTarjeta) === abonado ? "text-emerald-600" : "text-rose-600"}>
                  {(montoEfectivo + montoTransferencia + montoDeUna + montoTarjeta) === abonado ? '✅ Cuadra con el abono' : '❌ No cuadra'}
                </span>
              </div>
            </div>
          )}

          {/* Mensaje Informativo de Custodia si la cita es en una fecha futura */}
          {fecha !== getLocalTodayStr() && (
            <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-lg text-[11px] font-semibold text-amber-800 flex items-center gap-2 mt-2">
              <span className="text-sm">🔒</span>
              <span>Dinero en Custodia: Este abono no sumará a la caja de hoy por ser una cita futura.</span>
            </div>
          )}
        </div>

        {/* Checkbox Comisión Especialista */}
        <div className="pt-2 border-t border-emerald-200/50">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={aplicaComision}
              onChange={(e) => setAplicaComision(e.target.checked)}
              className="w-4 h-4 accent-black cursor-pointer rounded"
            />
            <span>¿Cliente captado por Especialista? (Aplica Comisión)</span>
          </label>
        </div>
      </div>

      {/* BUTTON ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={() => window.open(generarLinkGoogleCalendar({
            cliente,
            telefono,
            fecha,
            hora,
            especialista,
            servicio,
            detalles: observaciones,
            precioTotal,
            abono: abonado,
            saldoPendiente: Math.max(0, precioTotal - abonado)
          }), '_blank')}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <span>🗓️ Agregar a Google Calendar</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer active:scale-[0.99]"
          >
            {initialData?.id ? 'Guardar Cambios' : 'Agendar Cita'}
          </button>
        </div>
      </div>
    </form>
  );
}
