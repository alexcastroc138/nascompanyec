const fs = require('fs');

const specialistDashboardCode = `// src/components/SpecialistDashboard.tsx
import React, { useState } from 'react';
import { 
  ShoppingBag, Calendar, Check, User, CreditCard, 
  ChevronRight, Sparkles, Receipt, RefreshCw, X, AlertCircle, 
  Clock, Home, ShieldCheck, Plus, MapPin, Mail, DollarSign, AlertTriangle, ArrowRight, Bookmark, Archive, Search, Tag, LogOut
} from 'lucide-react';
import { POSItem, Sale, Appointment, CierreCaja, Category, DynamicPromo } from '../types';
import BottomNav from './layout/BottomNav';
import CalendarModule from './calendar/CalendarModule';
import HistorialVentas from './pos/HistorialVentas';
import { useCaja } from '../context/CajaContext';

interface SpecialistDashboardProps {
  currentUser: any;
  items: POSItem[];
  appointments: Appointment[];
  sales: Sale[];
  cierreCajaActiva: CierreCaja | null;
  promos?: DynamicPromo[];
  onAddSale: (sale: Sale) => void;
  onAddAppointment: (appt: Appointment) => void;
  onSaveAppointment?: (apt: Appointment) => void;
  onAddAbono?: (id: string, monto: number, metodoPago?: string) => void;
  onDeleteAppointment?: (id: string) => void;
  onCerrarCaja: (efectivoEntregado: number, notas: string) => void;
  onReabrirCaja: () => void;
  onUpdateInventory: (itemId: string, qty: number) => void;
  onSwitchRole: (role: 'specialist' | 'admin') => void;
  onLogout?: () => void;
}

export default function SpecialistDashboard({
  currentUser,
  items,
  appointments,
  sales,
  cierreCajaActiva,
  promos = [],
  onAddSale,
  onAddAppointment,
  onSaveAppointment,
  onAddAbono,
  onDeleteAppointment,
  onCerrarCaja,
  onReabrirCaja,
  onUpdateInventory,
  onSwitchRole,
  onLogout
}: SpecialistDashboardProps) {
  // Consume CajaContext
  const { isCajaAbierta, montoInicial, ventasDelTurno, abrirCaja, cerrarCaja, registrarVenta } = useCaja();

  // Navigation state for left sidebar
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'calendar' | 'turn'>('dashboard');
  
  // POS category & search query filters
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [posSearchQuery, setPosSearchQuery] = useState<string>('');
  
  // POS sales parameters & checkout form
  const [cart, setCart] = useState<Array<{ item: POSItem; quantity: number }>>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'de_una'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [aplicaComision, setAplicaComision] = useState<boolean>(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [sriFeedback, setSriFeedback] = useState<string | null>(null);

  // Timbrador Digital
  const [clockInTime, setClockInTime] = useState<string>('09:00 AM');
  const [clockOutTime, setClockOutTime] = useState<string>('Sin registrar');
  const [isClockedIn, setIsClockedIn] = useState<boolean>(true);
  const [isClockedOut, setIsClockedOut] = useState<boolean>(false);

  // Timbrador Handlers
  const handleTimbrarEntrada = () => {
    try {
      if (isCajaAbierta) {
        alert('❌ La caja ya se encuentra abierta. Ve al POS para registrar ventas.');
        return;
      }
      const timeString = new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: true });
      setClockInTime(timeString);
      setIsClockedIn(true);
      abrirCaja(0);
      onReabrirCaja();
      alert('✅ Turno abierto correctamente. El POS ha sido desbloqueado.');
    } catch (error) {
      alert('❌ Ocurrió un error al intentar abrir la caja: ' + error);
    }
  };

  const handleTimbrarSalida = () => {
    if (!isCajaAbierta) {
      alert('❌ No puedes timbrar salida porque tu caja está cerrada.');
      return;
    }
    const timeString = new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: true });
    setClockOutTime(timeString);
    setIsClockedOut(true);
    alert('✅ Hora de salida registrada. Por favor, ingresa el efectivo físico abajo para cuadrar la caja.');
  };

  // Turn cash declarations
  const [declaredCash, setDeclaredCash] = useState<string>('');
  const [closingNotes, setClosingNotes] = useState<string>('');

  // Cart operations
  const addToCart = (item: POSItem) => {
    if (item.stock <= 0 && item.unit === 'unidades') return;
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.item.id !== itemId));
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.item.id === itemId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }));
  };

  // Calculations for current specialist from global sales
  const hoyStr = new Date().toISOString().split('T')[0];
  const ventasGlobalesArtista = sales.filter(s => s.specialistId === currentUser.id);
  const totalVentasAcumuladas = ventasGlobalesArtista.reduce((acc, s) => acc + s.subtotal, 0);
  const totalComisionesAcumuladas = ventasGlobalesArtista.reduce((acc, s) => acc + s.commission, 0);
  const META_VENTAS = 1200;
  const porcentajeMeta = Math.min(100, (totalVentasAcumuladas / META_VENTAS) * 100);
  
  // Filter appointments for today using correct prop names (cliente/customerName, fecha/date)
  const ambarApptsToday = appointments.filter(a => {
    const isOwner = a.specialistId === currentUser.id || a.especialista === currentUser.name;
    const isToday = a.date === hoyStr || a.fecha === hoyStr;
    return isOwner && isToday;
  });

  // Dynamic Pricing & Promos
  const totalPiercingsInCart = cart.filter(i => i.item.category === 'piercing').reduce((sum, i) => sum + i.quantity, 0);
  const isPromo3x10Active = totalPiercingsInCart >= 3;
  const regularPiercingsSubtotal = cart.filter(i => i.item.category === 'piercing').reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
  const promoDiscount = isPromo3x10Active ? Math.max(0, regularPiercingsSubtotal - 10.00) : 0;
  
  const subtotalCart = cart.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
  const finalPayableTotal = Math.max(0, subtotalCart - promoDiscount);

  const cashReceivedVal = parseFloat(cashReceived) || 0;
  const changeGivenVal = paymentMethod === 'cash' && cashReceivedVal >= finalPayableTotal 
    ? (cashReceivedVal - finalPayableTotal) 
    : 0;

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = posSearchQuery.trim().toLowerCase();
    const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  // Confirm Sale & SRI upload process
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!isCajaAbierta) {
      alert('¡Error! Debes tener un turno de caja abierto para registrar ventas.');
      return;
    }

    if (paymentMethod === 'cash' && cashReceivedVal < finalPayableTotal) {
      alert(\`¡Efectivo Insuficiente! El cliente entregó $\${cashReceivedVal.toFixed(2)} USD pero el total a cobrar es $\${finalPayableTotal.toFixed(2)} USD.\`);
      return;
    }

    const finalCommissionValue = aplicaComision ? (finalPayableTotal * (currentUser.commissionRate || 0.40)) : 0;

    setIsProcessingSale(true);
    setSriFeedback('Firmando xml comprobante (XAdES-BES)...');

    setTimeout(() => {
      setSriFeedback('Transmitiendo orden autorizada al SRI Ecuador...');
      setTimeout(() => {
        setSriFeedback('Aprobado. Clave de Acceso SRI generada con éxito.');
        setTimeout(() => {
          const mockInvoice = \`001-002-0000\${Math.floor(100000 + Math.random() * 900000)}\`;
          const timestampIso = new Date().toISOString();
          
          const finalSale: Sale = {
            id: 's_pos_' + Date.now(),
            specialistId: currentUser.id,
            specialistName: currentUser.name,
            customerName: customerName || 'Consumidor Final',
            customerId: customerId || '9999999999999',
            customerEmail: customerEmail || 'final@bodyart.com',
            customerAddress: customerAddress || 'Quito, Ecuador',
            items: cart.map(i => ({
              itemId: i.item.id,
              name: i.item.name,
              price: i.item.price,
              quantity: i.quantity,
              category: i.item.category
            })),
            subtotal: finalPayableTotal,
            commission: finalCommissionValue,
            paymentMethod: paymentMethod,
            cashReceived: paymentMethod === 'cash' ? cashReceivedVal : undefined,
            changeGiven: paymentMethod === 'cash' ? changeGivenVal : undefined,
            timestamp: timestampIso,
            sriStatus: 'enviado_sri',
            invoiceNumber: mockInvoice
          };

          cart.forEach(cartItem => {
            if (cartItem.item.unit === 'unidades') {
              onUpdateInventory(cartItem.item.id, cartItem.item.stock - cartItem.quantity);
            }
          });

          registrarVenta({
            monto: finalPayableTotal,
            metodoPago: paymentMethod === 'cash' ? 'efectivo' : paymentMethod === 'transfer' ? 'transferencia' : paymentMethod === 'de_una' ? 'de_una' : 'tarjeta',
            comision: finalCommissionValue,
            descripcion: cart.map(c => \`\${c.quantity}x \${c.item.name}\`).join(', ')
          });
          onAddSale(finalSale);
          
          setCart([]);
          setCustomerName('');
          setCustomerId('');
          setCustomerEmail('');
          setCustomerAddress('');
          setCashReceived('');
          setAplicaComision(false);
          setSriFeedback(null);
          setIsProcessingSale(false);
          setActiveTab('dashboard');
        }, 800);
      }, 800);
    }, 800);
  };

  // Turn management expected cash
  const getSubtotalsForTurn = () => {
    if (!isCajaAbierta) return { efectivo: 0, transferencia: 0, de_una: 0, tarjeta: 0 };
    return (ventasDelTurno || []).reduce((acc, s) => {
      const monto = parseFloat((s as any).monto) || 0;
      const metodo = (s as any).metodoPago;
      if (metodo === 'efectivo') acc.efectivo += monto;
      else if (metodo === 'transferencia') acc.transferencia += monto;
      else if (metodo === 'de_una') acc.de_una += monto;
      else if (metodo === 'tarjeta') acc.tarjeta += monto;
      return acc;
    }, { efectivo: 0, transferencia: 0, de_una: 0, tarjeta: 0 });
  };
  const subtotalsTurn = getSubtotalsForTurn();

  const handleCajaCierreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCajaAbierta) {
      alert('❌ La caja ya está cerrada.');
      return;
    }
    const parsedCashSubmitted = parseFloat(declaredCash);
    if (isNaN(parsedCashSubmitted)) {
      alert('❌ Por favor ingresa un monto válido de efectivo contado.');
      return;
    }

    cerrarCaja(parsedCashSubmitted, closingNotes);
    onCerrarCaja(parsedCashSubmitted, closingNotes);
    setDeclaredCash('');
    setClosingNotes('');
    alert('✅ Caja cuadrada y cerrada exitosamente.');
  };

  const handleReabrirTurnoCompletamente = () => {
    onReabrirCaja(); 
    abrirCaja(0); 
    const timeString = new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: true });
    setClockInTime(timeString);
    setClockOutTime('Sin registrar');
    setIsClockedIn(true);
    setIsClockedOut(false);
    setDeclaredCash('');
    setClosingNotes('');
  };

  // --- NUEVA LÓGICA: Puente entre Abono del Calendario y Caja ---
  const handleRegistrarAbonoLocal = (id: string, monto: number, metodoPago: string) => {
    if (!isCajaAbierta) {
      alert('¡Atención! No puedes registrar dinero si la caja está cerrada. Abre el turno de caja primero.');
      return;
    }

    // 1. Actualiza el estado de la cita (App.tsx)
    if (onAddAbono) {
      onAddAbono(id, monto, metodoPago);
    }

    // 2. Extraer datos para el recibo
    const apt = appointments.find(a => a.id === id);
    const clientName = apt?.cliente || apt?.customerName || 'Cliente';
    const serviceName = apt?.servicio || apt?.service || 'Reserva';

    // 3. Registrar el ingreso directo en CajaContext
    registrarVenta({
      monto: monto,
      metodoPago: metodoPago as any,
      comision: 0, // Los abonos no generan comisión hasta el cobro final
      descripcion: \`Abono Reserva: \${clientName} - \${serviceName}\`
    });

    // 4. Registrar en el Historial Global (sales)
    const mockInvoice = \`REC-000\${Math.floor(1000 + Math.random() * 9000)}\`;
    onAddSale({
      id: 'abn_' + Date.now(),
      specialistId: currentUser.id,
      specialistName: currentUser.name,
      customerName: clientName,
      customerId: '9999999999999',
      customerEmail: 'N/A',
      customerAddress: 'N/A',
      items: [{ itemId: 'abono', name: \`Abono: \${serviceName}\`, price: monto, quantity: 1, category: 'Abono' }],
      subtotal: monto,
      commission: 0,
      paymentMethod: metodoPago as any,
      cashReceived: metodoPago === 'efectivo' ? monto : undefined,
      changeGiven: 0,
      timestamp: new Date().toISOString(),
      sriStatus: 'enviado_sri',
      invoiceNumber: mockInvoice
    });

    alert(\`✅ Abono de $\${monto.toFixed(2)} registrado exitosamente en caja mediante \${metodoPago.toUpperCase()}.\`);
  };

  return (
    <div className="flex bg-white font-sans text-slate-950 overflow-hidden rounded-2xl border border-slate-100 min-h-[720px] shadow-sm w-full">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex w-64 border-r border-slate-150 flex-col justify-between p-6 bg-slate-50/50 shrink-0 select-none">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white font-display font-medium text-xs italic tracking-wider shadow-xs">IS</div>
            <div>
              <span className="font-bold tracking-tight text-md font-display block text-slate-900">Ink & Steel</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">Gestión Especialistas</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={\`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer text-left \${
                activeTab === 'dashboard' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }\`}
            >
              <Home size={16} /><span>Inicio / Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={\`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer text-left \${
                activeTab === 'pos' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }\`}
            >
              <CreditCard size={16} /><span>POS / Facturación SRI</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={\`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer text-left \${
                activeTab === 'calendar' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }\`}
            >
              <Calendar size={16} /><span>Agenda y Citas</span>
            </button>
            <button
              onClick={() => setActiveTab('turn')}
              className={\`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer text-left \${
                activeTab === 'turn' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }\`}
            >
              <Clock size={16} /><span>Cerrar Turno</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-150 space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3">
            <img src={currentUser.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80"} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
            <div className="truncate">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">ESPECIALISTA</span>
              <span className="text-sm font-bold text-slate-900 block truncate">{currentUser.name}</span>
              <span className="text-[10px] text-emerald-600 font-medium block">On-duty • Rol Verificado</span>
            </div>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="w-full py-2 px-3 text-gray-500 hover:text-red-600 font-medium text-xs flex items-center justify-center space-x-2 transition cursor-pointer rounded-lg hover:bg-rose-50">
              <LogOut size={14} /><span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white overflow-y-auto min-w-0 w-full pb-20 md:pb-0">
        <div className="p-8 flex-1 flex flex-col">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-display">Bienvenido, {currentUser.name}</h1>
                    <p className="text-sm text-slate-500 mt-1">Este es tu resumen diario de operaciones para hoy {new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-right">
                    <span className="font-mono text-xs font-semibold text-slate-500">SRI ECUADOR • EN LINEA</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  {/* Comisiones Historicas Bar */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-150/80 shadow-xs flex flex-col justify-between min-h-[180px]">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-extrabold text-slate-450">Comisiones Acumuladas</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Disponibles al llegar a $1200 en ventas</p>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-slate-900 font-display">\${totalComisionesAcumuladas.toFixed(2)}</span>
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-slate-500">Ventas: \${totalVentasAcumuladas.toFixed(2)}</span>
                          <span className={totalVentasAcumuladas >= META_VENTAS ? 'text-emerald-600' : 'text-slate-400'}>
                            {porcentajeMeta.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={\`h-2 rounded-full transition-all duration-500 \${totalVentasAcumuladas >= META_VENTAS ? 'bg-emerald-500' : 'bg-black'}\`}
                            style={{ width: \`\${porcentajeMeta}%\` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Citas Hoy */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-150/80 shadow-xs flex flex-col justify-between min-h-[180px]">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-extrabold text-slate-450">Citas Pendientes</span>
                      <p className="text-xs text-slate-400 mt-0.5">Por atender hoy en el estudio</p>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-slate-900 font-display">
                        {ambarApptsToday.filter(a => a.estado === 'pendiente' || a.status === 'pending').length} <span className="text-sm font-normal text-slate-450">de {ambarApptsToday.length} total</span>
                      </span>
                    </div>
                  </div>

                  {/* Venta Rapida */}
                  <button 
                    type="button"
                    onClick={() => setActiveTab('pos')}
                    className="group bg-black hover:bg-slate-900 text-white p-6 rounded-2xl font-display text-left flex flex-col justify-between min-h-[180px] cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex justify-between items-start w-full">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Acción Rápida</span>
                        <h3 className="text-lg font-bold text-white mt-1">Nueva Venta Rápida</h3>
                        <p className="text-xs text-slate-300 mt-0.5 max-w-[200px]">Añade servicios al ticket y genera factura SRI instantánea.</p>
                      </div>
                      <CreditCard className="text-white/80" size={24} />
                    </div>
                    <span className="text-xs font-bold underline flex items-center gap-1 text-slate-200">
                      Abrir Terminal POS <ArrowRight size={14} />
                    </span>
                  </button>
                </div>

                {/* Agenda de hoy list */}
                <div className="mt-8">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-4">Agenda Rápida de Hoy</h3>
                  {ambarApptsToday.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-sm text-slate-400">No tienes citas agendadas para hoy.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {ambarApptsToday.map(apt => (
                        <div key={apt.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                          <div className="flex items-center gap-4">
                            <span className="font-mono font-bold text-slate-900">{apt.hora || apt.time}</span>
                            <div>
                              <p className="font-bold text-slate-900">{apt.cliente || apt.customerName}</p>
                              <p className="text-xs text-slate-500">{apt.servicio || apt.service}</p>
                            </div>
                          </div>
                          <span className={\`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider \${
                              apt.estado === 'falto' || apt.estado === 'cancelado' ? 'bg-rose-100 text-rose-800'
                              : apt.estado === 'pagado' || apt.estado === 'realizado' ? 'bg-emerald-100 text-emerald-800'
                              : apt.estado === 'confirmada' ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }\`}>
                            {apt.estado || apt.status || 'Pendiente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: POS */}
          {activeTab === 'pos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 font-display">Punto de Venta POS & Facturación SRI</h1>
                  <p className="text-xs text-slate-500">Selecciona productos o servicios para facturar electrónicamente al cliente.</p>
                </div>
                {isCajaAbierta ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    🟢 Caja Abierta
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    🔴 Caja Cerrada
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {/* Buscador */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input 
                      type="text" 
                      value={posSearchQuery}
                      onChange={(e) => setPosSearchQuery(e.target.value)}
                      placeholder="Buscar perforaciones, insumos, titanio..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black"
                    />
                  </div>
                  {/* Catálogo */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredItems.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className="p-4 bg-white border border-slate-200 hover:border-black rounded-xl cursor-pointer transition shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">{item.category}</span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">{item.name}</h4>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                          <span className="font-bold text-sm text-slate-900">\${item.price.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-500">{item.unit === 'unidades' ? \`Stock: \${item.stock}\` : 'Servicio'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carrito & Checkout */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 font-display pb-2 border-b border-slate-200">Ticket de Venta</h3>
                    {cart.length === 0 ? (
                      <p className="text-xs text-slate-400 py-8 text-center">El carrito está vacío</p>
                    ) : (
                      <div className="space-y-2 py-3 divide-y divide-slate-200/60 max-h-60 overflow-y-auto">
                        {cart.map(({ item, quantity }) => (
                          <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-900">{item.name}</p>
                              <p className="text-[10px] text-slate-500">\${item.price.toFixed(2)} c/u</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => updateCartQty(item.id, -1)} className="px-1.5 bg-slate-200 rounded font-bold text-slate-700">-</button>
                              <span className="font-bold">{quantity}</span>
                              <button type="button" onClick={() => updateCartQty(item.id, 1)} className="px-1.5 bg-slate-200 rounded font-bold text-slate-700">+</button>
                              <button type="button" onClick={() => removeFromCart(item.id)} className="text-rose-600 font-bold ml-1">✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-3 pt-3 border-t border-slate-200 mt-4">
                    {/* Método de Pago Selección */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1.5">MÉTODO DE PAGO</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['cash', 'card', 'transfer', 'de_una'] as const).map(met => (
                          <button
                            key={met}
                            type="button"
                            onClick={() => setPaymentMethod(met)}
                            className={\`py-1.5 border text-[11px] font-bold rounded-lg text-center cursor-pointer transition \${
                              paymentMethod === met
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }\`}
                          >
                            {met === 'cash' ? 'Efectivo' : met === 'card' ? 'Tarjeta' : met === 'transfer' ? 'Transf.' : 'De Una'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase block">Cliente</label>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nombre completo" 
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase block">Cédula / RUC (Ecuador)</label>
                      <input 
                        type="text" 
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        placeholder="1722000000" 
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    
                    {/* Checkbox Comisión */}
                    <div className="pt-2 pb-1">
                      <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={aplicaComision} 
                          onChange={(e) => setAplicaComision(e.target.checked)} 
                          className="w-4 h-4 accent-black cursor-pointer rounded"
                        />
                        Generar Comisión (Cliente captado por Especialista)
                      </label>
                    </div>

                    <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total a pagar:</span>
                      <span>\${finalPayableTotal.toFixed(2)} USD</span>
                    </div>

                    <button
                      type="submit"
                      disabled={cart.length === 0 || isProcessingSale || !isCajaAbierta}
                      className="w-full py-3 bg-black hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      {isProcessingSale ? (sriFeedback || 'Procesando...') : 'Emitir Factura SRI y Cobrar'}
                    </button>
                  </form>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-200">
                <HistorialVentas sales={sales} />
              </div>
            </div>
          )}

          {/* TAB 3: CALENDAR */}
          {activeTab === 'calendar' && (
            <CalendarModule 
              currentSpecialistName={currentUser.name}
              specialistsList={['Ámbar Piercing', 'Carlos Tattoo', 'Elena BodyArt', 'General Studio']}
              appointments={appointments}
              onSaveAppointment={onSaveAppointment}
              onAddAbono={handleRegistrarAbonoLocal}
              onDeleteAppointment={onDeleteAppointment}
            />
          )}

          {/* TAB 4: CIERRE TURNO */}
          {activeTab === 'turn' && (
            <div className="max-w-3xl mx-auto w-full space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h1 className="text-xl font-bold text-slate-900 font-display">Cierre de Caja y Control de Asistencia</h1>
                <p className="text-xs text-slate-400 mt-1">Somete el efectivo físico disponible en tu sobre para cuadrar la sesión del día</p>
              </div>

              {/* TIMBRADOR */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Timbrador Digital • Control de Asistencia</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Hora de Entrada</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono text-sm font-bold text-slate-900">{clockInTime}</span>
                      <button 
                        type="button"
                        onClick={handleTimbrarEntrada}
                        disabled={isCajaAbierta}
                        className="text-xs font-bold bg-black hover:bg-slate-800 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg cursor-pointer transition shadow-xs"
                      >
                        {isCajaAbierta ? 'Iniciado' : 'Timbrar Entrada'}
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Hora de Salida</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono text-sm font-bold text-slate-900">{clockOutTime}</span>
                      <button 
                        type="button"
                        onClick={handleTimbrarSalida}
                        disabled={!isCajaAbierta}
                        className="text-xs font-bold bg-black hover:bg-slate-800 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg cursor-pointer transition shadow-xs"
                      >
                        Timbrar Salida
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* FORMULARIO CIERRE O VISTA FINAL */}
              {isCajaAbierta ? (
                <form onSubmit={handleCajaCierreSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* SYSTEM EXPECTED */}
                    <div className="p-6 bg-slate-50/50 border border-slate-150 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Sistemático Esperado</span>
                        <p className="text-xs text-slate-500 mt-0.5">Desglose de recaudación según ventas del turno</p>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Efectivo</span>
                          <span className="text-lg font-bold text-slate-900 font-mono">\${subtotalsTurn.efectivo.toFixed(2)}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Transferencia</span>
                          <span className="text-lg font-bold text-slate-900 font-mono">\${subtotalsTurn.transferencia.toFixed(2)}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">De Una</span>
                          <span className="text-lg font-bold text-slate-900 font-mono">\${subtotalsTurn.de_una.toFixed(2)}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Tarjetas</span>
                          <span className="text-lg font-bold text-slate-900 font-mono">\${subtotalsTurn.tarjeta.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* PHYSICAL COUNT */}
                    <div className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Dinero Físico Contado</span>
                        <p className="text-xs text-slate-500 mt-0.5">Ingresa el total exacto de Efectivo en caja</p>
                      </div>
                      <div className="mt-4">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xl">$</span>
                          <input 
                            type="number"
                            step="0.01"
                            value={declaredCash}
                            onChange={(e) => setDeclaredCash(e.target.value)}
                            placeholder="Ej. 150.00"
                            required
                            className="w-full pl-9 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-2xl font-bold text-slate-900 focus:outline-none focus:border-black transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 block">Observaciones / Novedades</label>
                    <textarea 
                      value={closingNotes}
                      onChange={(e) => setClosingNotes(e.target.value)}
                      rows={3}
                      placeholder="Escribe aquí cualquier diferencia, pagos a proveedores o anotación relevante..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-black hover:bg-slate-800 text-white text-sm font-bold rounded-xl uppercase tracking-wider transition cursor-pointer"
                  >
                    Cuadrar Caja y Cerrar Turno
                  </button>
                </form>
              ) : (
                <div className="p-10 bg-white border border-slate-200 rounded-2xl text-center space-y-6">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
                    <Check className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-display">Cierre de Caja Guardado con Éxito</h2>
                    <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">Has completado el cuadre diario. La información ha sido autorizada y sincronizada.</p>
                  </div>
                  <button
                    onClick={handleReabrirTurnoCompletamente}
                    className="px-6 py-3 bg-black hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition cursor-pointer"
                  >
                    Reabrir Turno 
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        onSelectTab={setActiveTab as any} 
        currentUser={currentUser} 
        onLogout={onLogout || (() => {})} 
      />
    </div>
  );
}
`;

fs.writeFileSync('src/components/SpecialistDashboard.tsx', specialistDashboardCode);
