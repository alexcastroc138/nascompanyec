import { Appointment } from '../types';
import { getLocalISOString, getTodayStr } from './dateUtils';

export interface CitaCalendarData {
  cliente?: string;
  customerName?: string;
  servicio?: string;
  service?: string;
  especialista?: string;
  specialistName?: string;
  fechaHoraInicio?: Date | string;
  fecha?: string;
  date?: string;
  hora?: string;
  time?: string;
  duracionMinutos?: number;
  duration?: number;
  abono?: number;
  abonado?: number;
  deposit?: number;
  saldoPendiente?: number;
  precioTotal?: number;
  price?: number;
  telefono?: string;
  customerPhone?: string;
  detalles?: string;
  details?: string;
  [key: string]: any;
}

/**
 * Convierte un objeto Date a la representación en cadena UTC estricta de Google Calendar: YYYYMMDDTHHmmssZ
 */
function toUTCGoogleString(date: Date): string {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Genera un enlace dinámico directo para agregar un evento a Google Calendar (Client-Side).
 * No requiere autenticación API de Google ni tokens OAuth.
 */
export function generarLinkGoogleCalendar(cita: CitaCalendarData | Partial<Appointment> | any): string {
  const c: any = cita || {};
  const cliente = c.cliente || c.customerName || 'Cliente';
  const servicio = c.servicio || c.service || 'Cita de Arte Corporal';
  const especialista = c.especialista || c.specialistName || 'Estudio NAS';
  
  const abono = c.abono ?? c.abonado ?? c.deposit ?? 0;
  const precioTotal = c.precioTotal ?? c.price ?? abono;
  const saldoPendiente = c.saldoPendiente ?? Math.max(0, precioTotal - abono);

  const duracionMinutos = c.duracionMinutos ?? c.duration ?? 60;

  let startDate: Date;

  if (c.fechaHoraInicio) {
    startDate = typeof c.fechaHoraInicio === 'string' ? new Date(c.fechaHoraInicio) : c.fechaHoraInicio;
  } else {
    const fechaStr = c.fecha || c.date || getTodayStr(); // YYYY-MM-DD
    const horaStr = c.hora || c.time || '10:00'; // HH:mm
    const [year, month, day] = fechaStr.split('-').map(Number);
    const [hours, minutes] = horaStr.split(':').map(Number);
    startDate = new Date(year || 2026, (month || 1) - 1, day || 1, hours || 10, minutes || 0, 0);
  }

  const endDate = new Date(startDate.getTime() + duracionMinutos * 60 * 1000);

  // Generar formato ISO/UTC YYYYMMDDTHHmmssZ
  const startUTC = toUTCGoogleString(startDate);
  const endUTC = toUTCGoogleString(endDate);
  const rangoFechas = `${startUTC}/${endUTC}`;

  const titulo = encodeURIComponent(`Cita: ${servicio} - ${cliente}`);
  
  const detallesTexto = 
`Cliente: ${cliente}
Especialista: ${especialista}
Abono Custodia: $${abono.toFixed(2)}
Saldo a cobrar en local: $${saldoPendiente.toFixed(2)}`;

  const detalles = encodeURIComponent(detallesTexto);
  const ubicacion = encodeURIComponent('NAS COMPANY EC');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${rangoFechas}&details=${detalles}&location=${ubicacion}`;
}
