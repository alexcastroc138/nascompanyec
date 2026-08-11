import { User, POSItem, Appointment, Sale, CierreCaja, WebhookLog, DynamicPromo, TimeEntry, EmailAlert } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Ámbar Piercing',
    role: 'specialist',
    email: 'ambar@bodyart.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    commissionRate: 0.40, // 40% commission on piercing services
    phone: '+593 99 123 4567'
  },
  {
    id: '2',
    name: 'Carlos Ink',
    role: 'specialist',
    email: 'carlos@bodyart.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    commissionRate: 0.50, // 50% commission on tattoo services
    phone: '+593 98 765 4321'
  },
  {
    id: '3',
    name: 'Administrador General',
    role: 'admin',
    email: 'admin@bodyart.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    commissionRate: 0,
    phone: '+593 99 999 9999'
  }
];

export const INITIAL_ITEMS: POSItem[] = [
  // Piercing Services
  { id: 'p1', name: 'Perforación Hélix Básico (Titanio)', category: 'piercing', price: 25.00, stock: 100, minStock: 20, unit: 'servicio' },
  { id: 'p2', name: 'Perforación Nostril (Titanio)', category: 'piercing', price: 30.00, stock: 100, minStock: 15, unit: 'servicio' },
  { id: 'p3', name: 'Perforación Septum (Titanio)', category: 'piercing', price: 35.00, stock: 100, minStock: 10, unit: 'servicio' },
  { id: 'p4', name: 'Perforación Ombligo (Titanio G23)', category: 'piercing', price: 40.00, stock: 100, minStock: 10, unit: 'servicio' },
  
  // Tattoo Services
  { id: 't1', name: 'Tatuaje Minimalista (Línea Fina, <5cm)', category: 'tattoo', price: 60.00, stock: 150, minStock: 0, unit: 'servicio' },
  { id: 't2', name: 'Tatuaje Mediano (Sombra/Relleno, <12cm)', category: 'tattoo', price: 120.00, stock: 150, minStock: 0, unit: 'servicio' },
  { id: 't3', name: 'Sesión Tatuaje Completa (Día Completo)', category: 'tattoo', price: 350.00, stock: 50, minStock: 0, unit: 'servicio' },

  // Jewelries
  { id: 'j1', name: 'Labret Titanio Roscado Interno 1.2mm', category: 'jewelry', price: 15.00, stock: 45, minStock: 15, unit: 'unidades' },
  { id: 'j2', name: 'Clicker Bisagra Titanio ASTM F136', category: 'jewelry', price: 22.00, stock: 12, minStock: 10, unit: 'unidades' },
  { id: 'j3', name: 'Nostril L-Bend Oro Sólido 14k', category: 'jewelry', price: 75.00, stock: 5, minStock: 2, unit: 'unidades' },
  { id: 'j4', name: 'Microdermal Base + Corona Circonia', category: 'jewelry', price: 45.00, stock: 8, minStock: 5, unit: 'unidades' },

  // Aftercare Products
  { id: 'a1', name: 'Espuma Limpiadora After_Inked 100ml', category: 'aftercare', price: 18.00, stock: 24, minStock: 8, unit: 'unidades' },
  { id: 'a2', name: 'Suero Fisiológico Spray NeilMed 75ml', category: 'aftercare', price: 14.50, stock: 4, minStock: 6, unit: 'unidades' },
  { id: 'a3', name: 'Crema Cicatrizante Solución Estudio 30g', category: 'aftercare', price: 10.00, stock: 40, minStock: 10, unit: 'unidades' }
];

// Seed dates around today (2026-05-25)
export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_SALES: Sale[] = [];

export const INITIAL_CIERRES: CierreCaja[] = [];

export const INITIAL_WEB_LOGS: WebhookLog[] = [];

export const INITIAL_PROMOS: DynamicPromo[] = [
  {
    id: 'promo_1',
    name: 'Jueves de Perforaciones: 3x$10',
    description: 'Llevas 3 perforaciones básicas de titanio por solo $10.00 USD (Precio Regular $24-25 c/u).',
    dayOfWeek: 'Thursday', // Or active for all/scheduled
    startTime: '09:00',
    endTime: '21:00',
    applicableCategory: 'piercing',
    requiredQuantity: 3,
    bundlePrice: 10.00,
    active: true
  },
  {
    id: 'promo_2',
    name: 'Martes de Joyería: 20% Descuento',
    description: '20% de descuento en clickers de titanio y nostrils oro 14k.',
    dayOfWeek: 'Tuesday',
    startTime: '10:00',
    endTime: '19:00',
    applicableCategory: 'jewelry',
    requiredQuantity: 1,
    bundlePrice: 0, // calculated as percentage
    active: true
  }
];

export const INITIAL_TIME_ENTRIES: TimeEntry[] = [];

export const INITIAL_EMAIL_ALERTS: EmailAlert[] = [];
