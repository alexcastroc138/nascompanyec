export type Role = 'admin' | 'specialist';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password?: string;
  avatar: string;
  commissionRate: number; // e.g. 0.35 for 35% commission
  phone?: string;
  shiftSchedule?: 'turno_manana' | 'turno_tarde' | 'rotativo';
}

export type Category = 'tattoo' | 'piercing' | 'jewelry' | 'aftercare' | 'Abono' | 'abono' | 'piezas' | 'joyeria' | 'smoke' | 'servicios' | 'insumos' | 'boutique' | 'ropa' | string;

export interface POSItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  insumosAsociados?: { itemId: string; qty: number }[];
}

export interface SaleItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  category: Category;
}

export interface Sale {
  id: string;
  specialistId: string;
  specialistName: string;
  turnoId?: string;
  customerName: string;
  customerId?: string; // Cédula/RUC for Ecuadorian billing
  customerEmail?: string;
  customerAddress?: string;
  items: SaleItem[];
  subtotal: number;
  commission: number; // computed commission for this sale
  paymentMethod: 'cash' | 'card' | 'transfer' | 'de_una' | 'mixto';
  cashReceived?: number; // Cash handed by customer
  changeGiven?: number;  // Change/Vuelto returned
  timestamp: string;
  detalles_json?: string; // ISO date string
  sriStatus: 'pendiente' | 'enviado_sri' | 'error_sri';
  invoiceNumber?: string; // SRI authorization e.g. 001-002-000000123
}

export interface TattooDetails {
  bodyPart?: string;
  sizeCm?: string;
  depositAmount?: number;
  referenceNotes?: string;
}

export interface Appointment {
  id: string;
  customerName?: string;
  customerPhone?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  duration?: number; // in minutes (e.g. 60)
  specialistId?: string;
  specialistName?: string;
  service?: string;
  serviceType?: 'piercing' | 'tattoo' | 'jewelry' | 'consultation';
  tattooDetails?: TattooDetails;
  price?: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';

  // Spanish alias fields for CalendarModule compatibility
  cliente?: string;
  telefono?: string;
  fecha?: string;
  hora?: string;
  especialista?: string;
  servicio?: string;
  detalles?: string;
  details?: string;
  joyaId?: string;
  precioTotal?: number;
  abonado?: number;
  deposit?: number;
  metodoPagoInicial?: string;
  metodoPagoAbono?: 'cash' | 'card' | 'transfer' | 'de_una';
  estadoAbono?: 'ingresado_caja' | 'en_custodia' | 'sin_abono';
  captadoPorEspecialista?: boolean;
  aplicaComision?: boolean;
  estado?: 'confirmada' | 'pendiente' | 'completada' | 'cancelada' | 'falto' | 'cancelado' | 'pagado' | 'realizado';
}

export interface DynamicPromo {
  id: string;
  name: string;
  description: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'all';
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "21:00"
  applicableCategory: Category | 'all';
  requiredQuantity: number; // e.g. 3
  bundlePrice: number;     // e.g. 10.00 USD
  discountType?: 'fixed' | 'percentage';     // e.g. 10.00 USD
  active: boolean;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM
  clockOut?: string; // HH:MM
  scheduledStart: string; // "09:00"
  scheduledEnd: string;   // "16:00"
  regularHours: number;
  overtimeHours: number;
  status: 'active' | 'completed';
  notes?: string;
}

export interface EmailAlert {
  id: string;
  type: 'low_inventory' | 'low_stock' | 'cierre_caja' | 'overtime_alert';
  recipient?: string;
  subject: string;
  body?: string;
  message?: string;
  timestamp: string;
  detalles_json?: string;
  read: boolean;
}

export interface CierreCaja {
  id: string;
  specialistId: string;
  specialistName: string;
  startTime: string; // ISO date string when session started
  endTime?: string; // ISO date string when session closed (exact)
  totalSales: number;
  totalCommissions: number;
  cashExpected: number;
  cashSubmitted?: number;
  physicalDifference?: number;
  status: 'abierta' | 'cerrada';
  notes?: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  detalles_json?: string;
  source: 'WhatsApp' | 'n8n_flow' | 'api_call';
  message: string;
  extractedJson?: string;
  result: string;
  status: 'success' | 'warning' | 'error';
}

export interface Expense {
  id: string;
  specialistId: string;
  specialistName: string;
  title: string;
  description: string;
  amount: number;
  timestamp: string;
  detalles_json?: string;
}


export interface Categoria {
  id: string | number;
  nombre: string;
}
