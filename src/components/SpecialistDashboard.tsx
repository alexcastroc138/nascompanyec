// src/components/SpecialistDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Calendar, Check, User as UserIcon, CreditCard, 
  ChevronRight, Sparkles, Receipt, RefreshCw, X, AlertCircle, 
  Clock, Home, ShieldCheck, Plus, MapPin, Mail, DollarSign, AlertTriangle, ArrowRight, Bookmark, Archive, Search, Tag, LogOut
} from 'lucide-react';
import { POSItem, Sale, Appointment, CierreCaja, Category, DynamicPromo, Expense, User } from '../types';
import BottomNav from './layout/BottomNav';
import CalendarModule from './calendar/CalendarModule';
import HistorialVentas from './pos/HistorialVentas';
import { useCaja } from '../context/CajaContext';
import { enviarAlertaCaja, enviarAlertaStock } from '../utils/emailAlerts';

interface SpecialistDashboardProps {
  users?: any[];
  currentUser: any;
  items: POSItem[];
  appointments: Appointment[];
  sales: Sale[];
  expenses?: Expense[];
  cierreCajaActiva: CierreCaja | null;
  promos?: DynamicPromo[];
  categories?: string[];
  onAddSale: (sale: Sale) => void;
  onAddExpense?: (expense: Expense) => void;
  onAddAppointment: (appt: Appointment) => void;
  onSaveAppointment?: (apt: Appointment) => void;
  onAddAbono?: (id: string, monto: number, metodoPago?: string) => void;
  onDeleteAppointment?: (id: string) => void;
  onCerrarCaja: (efectivoEntregado: number, notas: string) => void;
  onReabrirCaja: (specialist?: User) => Promise<boolean> | void | any;
  onUpdateInventory: (itemId: string, qty: number) => void;
  onSwitchRole: (role: 'specialist' | 'admin') => void;
  onLogout?: () => void;
}

export default function SpecialistDashboard({
  currentUser,
  users = [],
  items,
  appointments,
  sales,
  expenses = [],
  cierreCajaActiva,
  promos = [],
  categories = ['Servicios', 'Joyería', 'Piezas', 'Smoke Shop', 'Boutique', 'Ropa'],
  onAddSale,
  onAddExpense,
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
  // Data Isolation
  const isAdmin = currentUser?.role === 'admin';
  const filteredSales = isAdmin ? sales : sales.filter(s => s.specialistId === currentUser?.id || s.specialistName === currentUser?.name);
  const filteredExpenses = isAdmin ? expenses : expenses.filter(e => e.specialistId === currentUser?.id || e.specialistName === currentUser?.name);

  // Consume CajaContext
  const { isCajaAbierta, montoInicial, ventasDelTurno, abrirCaja, cerrarCaja, registrarVenta } = useCaja();

  // Navigation state for left sidebar
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'calendar' | 'turn' | 'ingresos'>('dashboard');
  
  // POS category & search query filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [posSearchQuery, setPosSearchQuery] = useState<string>('');
  
  // POS sales parameters & checkout form
  const [cart, setCart] = useState<Array<{ item: POSItem; quantity: number; isMerma?: boolean }>>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'de_una' | 'mixto'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isPagoMixtoPOS, setIsPagoMixtoPOS] = useState<boolean>(false);
  const [montoEfectivoPOS, setMontoEfectivoPOS] = useState<string>('');
  const [montoTransferenciaPOS, setMontoTransferenciaPOS] = useState<string>('');
  const [montoDeUnaPOS, setMontoDeUnaPOS] = useState<string>('');
  const [montoTarjetaPOS, setMontoTarjetaPOS] = useState<string>('');
  const [aplicaComision, setAplicaComision] = useState<boolean>(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [sriFeedback, setSriFeedback] = useState<string | null>(null);

  // Timbrador Digital
  const [clockInTime, setClockInTime] = useState<string>('09:00');
  const [clockOutTime, setClockOutTime] = useState<string>('Sin registrar');
  const [isClockedIn, setIsClockedIn] = useState<boolean>(true);
  const [isClockedOut, setIsClockedOut] = useState<boolean>(false);

  useEffect(() => {
    if (isCajaAbierta && cierreCajaActiva?.startTime) {
      // Parse ISO date and extract local time
      try {
        const dateObj = new Date(cierreCajaActiva.startTime);
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        setClockInTime(timeStr);
        setIsClockedIn(true);
      } catch (e) {
        console.error("Error parsing clock in time", e);
      }
    }
  }, [isCajaAbierta, cierreCajaActiva]);

  // Timbrador Handlers
  const handleTimbrarEntrada = async () => {
    try {
      if (isCajaAbierta) {
        alert('❌ La caja ya se encuentra abierta. Ve al POS para registrar ventas.');
        return;
      }
      
      let finalTime = clockInTime;
      if (clockInTime === '09:00' || clockInTime === '09:00 AM' || !clockInTime) {
        finalTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        setClockInTime(finalTime);
      }
      
      const success = await onReabrirCaja(currentUser);
      if (success === false) {
        return;
      }
      
      setIsClockedIn(true);
      abrirCaja(0);
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
    const timeString = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setClockOutTime(timeString);
    setIsClockedOut(true);
    alert('✅ Hora de salida registrada. Por favor, ingresa el efectivo físico abajo para cuadrar la caja.');
  };

  // Turn cash declarations
  const [declaredCash, setDeclaredCash] = useState<string>('');
  const [closingNotes, setClosingNotes] = useState<string>('');

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [expenseTitle, setExpenseTitle] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseReason, setExpenseReason] = useState<string>('');

  const handleRegistrarGastoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(expenseAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('❌ Por favor ingresa un monto válido de gasto.');
      return;
    }
    if (!expenseTitle.trim()) {
      alert('❌ Por favor ingresa el concepto o título del gasto.');
      return;
    }

    const newExpense: Expense = {
      id: 'exp_' + Date.now(),
      specialistId: currentUser.id,
      specialistName: currentUser.name,
      title: expenseTitle.trim(),
      description: expenseReason.trim() || expenseTitle.trim(),
      amount: parsedAmount,
      timestamp: new Date().toISOString()
    };

    if (onAddExpense) {
      onAddExpense(newExpense);
    }

    // Descontar automáticamente del dinero en efectivo del turno si la caja está abierta
    if (isCajaAbierta) {
      registrarVenta({
        monto: -parsedAmount,
        metodoPago: 'efectivo',
        comision: 0,
        descripcion: `GASTO CAJA CHICA: ${expenseTitle.trim()}`
      });
    }

    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseReason('');
    setIsExpenseModalOpen(false);
    alert(`✅ Gasto de $${parsedAmount.toFixed(2)} USD registrado correctamente.`);
  };

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

  const toggleMerma = (itemId: string) => {
    setCart(prev => prev.map(i => i.item.id === itemId ? { ...i, isMerma: !i.isMerma } : i));
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
  const ventasGlobalesArtista = filteredSales.filter(s => s.specialistId === currentUser.id);
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
  const dayOfWeekEn = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const activePromosToday = promos.filter(p => p.active && (p.dayOfWeek === 'all' || p.dayOfWeek === dayOfWeekEn));

  let promoDiscount = 0;
  let appliedPromoNames: string[] = [];

  activePromosToday.forEach(promo => {
    const matchingItems = cart.filter(i => !i.isMerma && (promo.applicableCategory === 'all' || i.item.category.toLowerCase() === promo.applicableCategory.toLowerCase()));
    const matchingCount = matchingItems.reduce((sum, i) => sum + i.quantity, 0);

    if (matchingCount >= promo.requiredQuantity && promo.requiredQuantity > 0) {
      const bundleApplications = Math.floor(matchingCount / promo.requiredQuantity);
      
      // Extraer precios individuales para aplicar descuento a los más baratos primero
      let itemsToDiscount: number[] = [];
      matchingItems.forEach(cartItem => {
        for(let i=0; i < cartItem.quantity; i++) itemsToDiscount.push(cartItem.item.price);
      });
      itemsToDiscount.sort((a,b) => a - b);
      
      const itemsInPromo = itemsToDiscount.slice(0, bundleApplications * promo.requiredQuantity);
      const regularPrice = itemsInPromo.reduce((sum, price) => sum + price, 0);
      
      let promoPriceTotal = 0;
      if (promo.discountType === 'percentage') {
        const discountAmount = regularPrice * (promo.bundlePrice / 100);
        promoPriceTotal = regularPrice - discountAmount;
      } else {
        promoPriceTotal = bundleApplications * promo.bundlePrice;
      }
      
      const discount = Math.max(0, regularPrice - promoPriceTotal);
      if (discount > 0) {
        promoDiscount += discount;
        if (!appliedPromoNames.includes(promo.name)) appliedPromoNames.push(promo.name);
      }
    }
  });

  const subtotalCart = cart.reduce((sum, i) => sum + (i.isMerma ? 0 : i.item.price * i.quantity), 0);
  const finalPayableTotal = Math.max(0, subtotalCart - promoDiscount);

  const cashReceivedVal = parseFloat(cashReceived) || 0;
  const changeGivenVal = paymentMethod === 'cash' && cashReceivedVal >= finalPayableTotal 
    ? (cashReceivedVal - finalPayableTotal) 
    : 0;

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = posSearchQuery.trim().toLowerCase();
    const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  // Confirm Sale process
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!isCajaAbierta) {
      alert('¡Error! Debes tener un turno de caja abierto para registrar ventas.');
      return;
    }

    if (!isPagoMixtoPOS) {
      if (paymentMethod === 'cash' && cashReceivedVal < finalPayableTotal) {
        alert(`¡Efectivo Insuficiente! El cliente entregó ${cashReceivedVal.toFixed(2)} USD pero el total a cobrar es ${finalPayableTotal.toFixed(2)} USD.`);
        return;
      }
    } else {
      const efec = parseFloat(montoEfectivoPOS || '0');
      const trans = parseFloat(montoTransferenciaPOS || '0');
      const deuna = parseFloat(montoDeUnaPOS || '0');
      const tarjeta = parseFloat(montoTarjetaPOS || '0');
      
      const totalMixto = efec + trans + deuna + tarjeta;
      if (Math.abs(totalMixto - finalPayableTotal) > 0.01) {
        alert('❌ En Pago Mixto, la suma de los montos debe ser exacta al Total a Cobrar.');
        return;
      }
    }

    const finalCommissionValue = aplicaComision ? (finalPayableTotal * (currentUser.commissionRate || 0.40)) : 0;
    const mockInvoice = `001-002-0000${Math.floor(100000 + Math.random() * 900000)}`;
    const timestampIso = new Date().toISOString();
    
    const finalSale: Sale = {
      id: 's_pos_' + Date.now(),
      specialistId: currentUser.id,
      specialistName: currentUser.name,
      turnoId: isCajaAbierta && cierreCajaActiva ? cierreCajaActiva.id : undefined,
      customerName: customerName || 'Consumidor Final',
      customerId: customerId || '9999999999999',
      customerEmail: customerEmail || 'final@bodyart.com',
      customerAddress: customerAddress || 'Quito, Ecuador',
      items: cart.map(i => ({
        itemId: i.item.id,
        name: i.isMerma ? '[MERMA/REGALO] ' + i.item.name : i.item.name,
        price: i.isMerma ? 0 : i.item.price,
        quantity: i.quantity,
        category: i.item.category
      })),
      subtotal: finalPayableTotal,
      commission: finalCommissionValue,
      paymentMethod: paymentMethod,
      cashReceived: (!isPagoMixtoPOS && paymentMethod === 'cash') ? cashReceivedVal : undefined,
      changeGiven: (!isPagoMixtoPOS && paymentMethod === 'cash') ? changeGivenVal : undefined,
      timestamp: timestampIso,
      sriStatus: 'procesado' as any,
      invoiceNumber: mockInvoice
    };

    if (isPagoMixtoPOS) {
      finalSale.paymentMethod = 'mixto' as any;
      const desglose = {
        efectivo: parseFloat(montoEfectivoPOS || '0'),
        transferencia: parseFloat(montoTransferenciaPOS || '0'),
        de_una: parseFloat(montoDeUnaPOS || '0'),
        tarjeta: parseFloat(montoTarjetaPOS || '0')
      };
      
      finalSale.detalles_json = JSON.stringify({
        items: finalSale.items,
        pagos: desglose
      });
    } else {
      finalSale.detalles_json = JSON.stringify(finalSale.items);
    }

    cart.forEach(cartItem => {
      if (cartItem.item.insumosAsociados && cartItem.item.insumosAsociados.length > 0) {
        cartItem.item.insumosAsociados.forEach(insumo => {
          const originalItem = items.find(i => i.id === insumo.itemId);
          if (originalItem) {
            const newStock = originalItem.stock - (insumo.qty * cartItem.quantity);
            onUpdateInventory(insumo.itemId, newStock);
            if (newStock <= (originalItem.minStock || 5)) {
              enviarAlertaStock(originalItem.name, newStock, originalItem.minStock || 5, originalItem.category);
            }
          }
        });
      }
      if (cartItem.item.unit === 'unidades') {
        const newStock = cartItem.item.stock - cartItem.quantity;
        onUpdateInventory(cartItem.item.id, newStock);
        if (newStock <= (cartItem.item.minStock || 5)) {
          enviarAlertaStock(cartItem.item.name, newStock, cartItem.item.minStock || 5, cartItem.item.category);
        }
      }
    });

    // La venta se guarda ÚNICAMENTE disparando onAddSale (evita duplicación)
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
    alert('✅ Venta Registrada exitosamente.');
    setActiveTab('dashboard');
  };

  // Turn management expected cash
  const getSubtotalsForTurn = () => {
    if (!isCajaAbierta) return { efectivo: 0, transferencia: 0, de_una: 0, tarjeta: 0 };
    
    let efec = 0, trans = 0, de_una = 0, tarj = 0;

    // 1. Calcular ingresos usando las ventas globales para poder desestructurar el pago mixto (detalles_json / items)
    // Buscamos las ventas del día de hoy (como en los otros bloques) para evitar fallos si falta cierreCajaActiva
    const today = new Date().toISOString().split('T')[0];
    const salesTurno = filteredSales.filter(s => s.timestamp && s.timestamp.startsWith(today));

    salesTurno.forEach(s => {
      const pm = (s.paymentMethod || 'cash').toLowerCase();

      if (pm === 'mixto') {
        if (s.detalles_json) {
          try {
            const parsed = JSON.parse(s.detalles_json);
            if (parsed.pagos) {
              efec += Number(parsed.pagos.efectivo) || 0;
              trans += Number(parsed.pagos.transferencia) || 0;
              de_una += Number(parsed.pagos.de_una) || 0;
              tarj += Number(parsed.pagos.tarjeta) || 0;
            }
          } catch (e) {
            console.error("Error al parsear detalles_json de pago mixto:", e);
          }
        }
      } else if (pm === 'cash' || pm === 'efectivo') {
        efec += s.subtotal;
      } else if (pm === 'transfer' || pm === 'transferencia') {
        trans += s.subtotal;
      } else if (pm === 'de_una') {
        de_una += s.subtotal;
      } else {
        tarj += s.subtotal;
      }
    });

    // 2. Procesar Gastos (Caja Chica) u otros movimientos manuales restando del efectivo
    (ventasDelTurno || []).forEach(v => {
      const monto = parseFloat((v as any).monto) || 0;
      if (monto < 0) { // Identificamos que es un gasto
        const metodo = (v as any).metodoPago;
        if (metodo === 'efectivo') efec += monto;
        else if (metodo === 'transferencia') trans += monto;
        else if (metodo === 'de_una') de_una += monto;
        else if (metodo === 'tarjeta') tarj += monto;
      }
    });

    return { efectivo: efec, transferencia: trans, de_una: de_una, tarjeta: tarj };
  };
  const subtotalsTurn = getSubtotalsForTurn();

  // Boutique vs Estudio calculations for today
  const salesHoy = filteredSales.filter(s => s.timestamp && s.timestamp.startsWith(hoyStr));
  const boutiqueBreakdownHoy = salesHoy.reduce((acc, s) => {
    const boutiqueItemsAmount = (s.items || [])
      .filter(i => {
        const cat = (i.category || '').toLowerCase();
        return cat === 'boutique' || cat === 'ropa';
      })
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (boutiqueItemsAmount > 0) {
      acc.total += boutiqueItemsAmount;
      const pm = (s.paymentMethod || 'cash').toLowerCase();
      
      if (pm === 'mixto') {
        let parsedCash = 0, parsedTrans = 0, parsedDeUna = 0, parsedTarj = 0;
        if (s.detalles_json) {
          try {
            const parsed = JSON.parse(s.detalles_json);
            if (parsed.pagos) {
              parsedCash = Number(parsed.pagos.efectivo) || 0;
              parsedTrans = Number(parsed.pagos.transferencia) || 0;
              parsedDeUna = Number(parsed.pagos.de_una) || 0;
              parsedTarj = Number(parsed.pagos.tarjeta) || 0;
            }
          } catch (e) {
            console.error("Error al parsear pago mixto en boutiqueBreakdown:", e);
          }
        }
        const ratio = s.subtotal > 0 ? boutiqueItemsAmount / s.subtotal : 0;
        acc.efectivo += parsedCash * ratio;
        acc.transferencia += parsedTrans * ratio;
        acc.de_una += parsedDeUna * ratio;
        acc.tarjeta += parsedTarj * ratio;
      }
      else if (pm === 'cash' || pm === 'efectivo') acc.efectivo += boutiqueItemsAmount;
      else if (pm === 'transfer' || pm === 'transferencia') acc.transferencia += boutiqueItemsAmount;
      else if (pm === 'de_una') acc.de_una += boutiqueItemsAmount;
      else acc.tarjeta += boutiqueItemsAmount;
    }
    return acc;
  }, { efectivo: 0, transferencia: 0, de_una: 0, tarjeta: 0, total: 0 });

  const totalBoutiqueHoy = boutiqueBreakdownHoy.total;

  const estudioBreakdownHoy = salesHoy.reduce((acc, s) => {
    const estudioItemsAmount = (s.items || [])
      .filter(i => {
        const cat = (i.category || '').toLowerCase();
        return cat !== 'boutique' && cat !== 'ropa';
      })
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (estudioItemsAmount > 0) {
      acc.total += estudioItemsAmount;
      const pm = (s.paymentMethod || 'cash').toLowerCase();
      
      if (pm === 'mixto') {
        let parsedCash = 0, parsedTrans = 0, parsedDeUna = 0, parsedTarj = 0;
        if (s.detalles_json) {
          try {
            const parsed = JSON.parse(s.detalles_json);
            if (parsed.pagos) {
              parsedCash = Number(parsed.pagos.efectivo) || 0;
              parsedTrans = Number(parsed.pagos.transferencia) || 0;
              parsedDeUna = Number(parsed.pagos.de_una) || 0;
              parsedTarj = Number(parsed.pagos.tarjeta) || 0;
            }
          } catch (e) {
            console.error("Error al parsear pago mixto en estudioBreakdown:", e);
          }
        }
        const ratio = s.subtotal > 0 ? estudioItemsAmount / s.subtotal : 0;
        acc.efectivo += parsedCash * ratio;
        acc.transferencia += parsedTrans * ratio;
        acc.de_una += parsedDeUna * ratio;
        acc.tarjeta += parsedTarj * ratio;
      }
      else if (pm === 'cash' || pm === 'efectivo') acc.efectivo += estudioItemsAmount;
      else if (pm === 'transfer' || pm === 'transferencia') acc.transferencia += estudioItemsAmount;
      else if (pm === 'de_una') acc.de_una += estudioItemsAmount;
      else acc.tarjeta += estudioItemsAmount;
    }
    return acc;
  }, { efectivo: 0, transferencia: 0, de_una: 0, tarjeta: 0, total: 0 });

  const totalVentasHoyGeneral = salesHoy.reduce((acc, s) => acc + s.subtotal, 0);
  const totalEstudioHoy = estudioBreakdownHoy.total;

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

    const diff = parsedCashSubmitted - subtotalsTurn.efectivo;
    cerrarCaja(parsedCashSubmitted, closingNotes);
    onCerrarCaja(parsedCashSubmitted, closingNotes);

    // Enviar alerta por correo usando EmailJS
    enviarAlertaCaja({
      usuario: currentUser.name || 'Especialista',
      montoEfectivoEsperado: subtotalsTurn.efectivo,
      montoEfectivoReal: parsedCashSubmitted,
      diferencia: diff,
      observaciones: closingNotes,
      totalVentas: subtotalsTurn.efectivo + subtotalsTurn.transferencia + subtotalsTurn.de_una + subtotalsTurn.tarjeta
    });

    setDeclaredCash('');
    setClosingNotes('');
    alert('✅ Caja cuadrada y cerrada exitosamente.');
  };

  const handleReabrirTurnoCompletamente = () => {
    onReabrirCaja(currentUser); 
    abrirCaja(0); 
    const timeString = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setClockInTime(timeString);
    setClockOutTime('Sin registrar');
    setIsClockedIn(true);
    setIsClockedOut(false);
    setDeclaredCash('');
    setClosingNotes('');
  };

  // --- NUEVA LÓGICA: Puente entre Abono del Calendario y Caja ---
  const handleRegistrarAbonoLocal = (id: string, monto: number, metodoPago: string) => {
    const apt = appointments.find(a => a.id === id);
    if (!apt) return;

    const tzOffset = (new Date()).getTimezoneOffset() * 60000; 
    const todayStr = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    const isToday = apt.fecha === todayStr || apt.date === todayStr;

    if (isToday && !isCajaAbierta) {
      alert('¡Atención! No puedes registrar dinero a la caja de HOY si está cerrada. Abre el turno de caja primero.');
      return;
    }

    // 1. Actualiza el estado de la cita (App.tsx)
    if (onAddAbono) {
      onAddAbono(id, monto, metodoPago);
    }

    // 2. Extraer datos para el recibo
    const clientName = apt?.cliente || apt?.customerName || 'Cliente';
    const serviceName = apt?.servicio || apt?.service || 'Reserva';

    // 3. Registrar el ingreso directo en CajaContext SOLO si es para hoy
    if (isToday) {
      registrarVenta({
        monto: monto,
        metodoPago: (metodoPago === 'cash' || metodoPago === 'efectivo') ? 'efectivo' : (metodoPago === 'transfer' || metodoPago === 'transferencia') ? 'transferencia' : metodoPago === 'de_una' ? 'de_una' : 'tarjeta',
        comision: 0, // Los abonos no generan comisión hasta el cobro final
        descripcion: `Abono Reserva HOY: ${clientName} - ${serviceName}`
      });

      // 4. Registrar en el Historial Global (sales)
      const mockInvoice = `REC-000${Math.floor(1000 + Math.random() * 9000)}`;
      const mappedPaymentMethod = (metodoPago === 'cash' || metodoPago === 'efectivo') ? 'cash' : (metodoPago === 'transfer' || metodoPago === 'transferencia') ? 'transfer' : metodoPago === 'de_una' ? 'de_una' : 'card';
      const isEfectivo = metodoPago === 'cash' || metodoPago === 'efectivo';

      onAddSale({
        id: 'abn_' + Date.now(),
        specialistId: currentUser.id,
        specialistName: currentUser.name,
        turnoId: isCajaAbierta && cierreCajaActiva ? cierreCajaActiva.id : undefined,
        customerName: clientName,
        customerId: '9999999999999',
        customerEmail: 'N/A',
        customerAddress: 'N/A',
        items: [{ itemId: 'abono', name: `Abono HOY: ${serviceName}`, price: monto, quantity: 1, category: 'Abono' }],
        subtotal: monto,
        commission: 0,
        paymentMethod: mappedPaymentMethod as any,
        cashReceived: isEfectivo ? monto : undefined,
        changeGiven: 0,
        timestamp: new Date().toISOString(),
        sriStatus: 'enviado_sri' as any,
        invoiceNumber: mockInvoice
      });

      alert(`✅ Abono de $${monto.toFixed(2)} registrado exitosamente en la caja de HOY mediante ${metodoPago.toUpperCase()}.`);
    } else {
      alert(`✅ Abono de $${monto.toFixed(2)} registrado. Al ser una cita futura, no afecta la caja física de hoy.`);
    }
  };

  const handleProcesarAbonoACajaLocal = (apt: Appointment) => {
    const monto = apt.abonado || apt.deposit || 0;
    if (monto <= 0) return;

    const rawPaymentMethod = apt.metodoPagoAbono || apt.metodoPagoInicial || 'efectivo';
    const clientName = apt.cliente || apt.customerName || 'Cliente';
    const serviceName = apt.servicio || apt.service || 'Reserva';

    const cajaPaymentMethod = (rawPaymentMethod === 'cash' || rawPaymentMethod === 'efectivo')
      ? 'efectivo'
      : (rawPaymentMethod === 'transfer' || rawPaymentMethod === 'transferencia')
      ? 'transferencia'
      : rawPaymentMethod === 'de_una'
      ? 'de_una'
      : 'tarjeta';

    // El ingreso de Abono a Caja Chica/Turno ya no duplica, usa onAddSale en lugar de registrarVenta directamente

    const mockInvoice = `REC-000${Math.floor(1000 + Math.random() * 9000)}`;
    const mappedPaymentMethod = (rawPaymentMethod === 'cash' || rawPaymentMethod === 'efectivo')
      ? 'cash'
      : (rawPaymentMethod === 'transfer' || rawPaymentMethod === 'transferencia')
      ? 'transfer'
      : rawPaymentMethod === 'de_una'
      ? 'de_una'
      : 'card';
    const isEfectivo = rawPaymentMethod === 'cash' || rawPaymentMethod === 'efectivo';

    onAddSale({
      id: 'abn_' + Date.now(),
      specialistId: currentUser.id,
      specialistName: currentUser.name,
      customerName: clientName,
      customerId: '9999999999999',
      customerEmail: 'N/A',
      customerAddress: 'N/A',
      items: [{ itemId: 'abono_liberado', name: `Abono Ingresado a Caja: ${serviceName}`, price: monto, quantity: 1, category: 'Abono' }],
      subtotal: monto,
      commission: 0,
      paymentMethod: mappedPaymentMethod as any,
      cashReceived: isEfectivo ? monto : undefined,
      changeGiven: 0,
      timestamp: new Date().toISOString(),
      sriStatus: 'enviado_sri' as any,
      invoiceNumber: mockInvoice
    });

    const updatedApt: Appointment = {
      ...apt,
      estadoAbono: 'ingresado_caja'
    };

    onSaveAppointment(updatedApt);
    alert(`✅ Abono de $${monto.toFixed(2)} USD ingresado exitosamente a la caja fuerte.`);
  };

  const handleSaveAppointmentLocal = (savedApt: Appointment) => {
    const isNew = !appointments.some(a => a.id === savedApt.id);
    const initialDeposit = savedApt.abonado || savedApt.deposit || 0;

    const tzOffset = (new Date()).getTimezoneOffset() * 60000; 
    const todayStr = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    const isToday = savedApt.fecha === todayStr;

    if (isNew && initialDeposit > 0) {
      if (isToday) {
        if (!isCajaAbierta) {
          alert('¡Atención! La cita es para HOY y requiere ingresar el abono a la caja, pero la caja está CERRADA. Abre el turno primero.');
          return;
        }

        const clientName = savedApt.cliente || savedApt.customerName || 'Cliente';
        const serviceName = savedApt.servicio || savedApt.service || 'Servicio';
        const rawPaymentMethod = savedApt.metodoPagoInicial || 'efectivo';
        const cajaPaymentMethod = (rawPaymentMethod === 'cash' || rawPaymentMethod === 'efectivo')
          ? 'efectivo'
          : (rawPaymentMethod === 'transfer' || rawPaymentMethod === 'transferencia')
          ? 'transferencia'
          : rawPaymentMethod === 'de_una'
          ? 'de_una'
          : 'tarjeta';

        // 1. La venta se guarda con onAddSale

        // 2. Registrar en el Historial Global (sales) solo si es para hoy
        const mockInvoice = `REC-000${Math.floor(1000 + Math.random() * 9000)}`;
        const mappedPaymentMethod = (rawPaymentMethod === 'cash' || rawPaymentMethod === 'efectivo') ? 'cash' : (rawPaymentMethod === 'transfer' || rawPaymentMethod === 'transferencia') ? 'transfer' : rawPaymentMethod === 'de_una' ? 'de_una' : 'card';
        const isEfectivo = rawPaymentMethod === 'cash' || rawPaymentMethod === 'efectivo';

        onAddSale({
          id: 'abn_ini_' + Date.now(),
          specialistId: currentUser.id,
          specialistName: currentUser.name,
          turnoId: isCajaAbierta && cierreCajaActiva ? cierreCajaActiva.id : undefined,
          customerName: clientName,
          customerId: '9999999999999',
          customerEmail: 'N/A',
          customerAddress: 'N/A',
          items: [{ itemId: 'abono_inicial', name: `Abono Inicial Cita HOY: ${serviceName}`, price: initialDeposit, quantity: 1, category: 'Abono' }],
          subtotal: initialDeposit,
          commission: 0,
          paymentMethod: mappedPaymentMethod as any,
          cashReceived: isEfectivo ? initialDeposit : undefined,
          changeGiven: 0,
          timestamp: new Date().toISOString(),
          sriStatus: 'enviado_sri' as any,
          invoiceNumber: mockInvoice
        });
      }
    }

    if (onSaveAppointment) {
      onSaveAppointment(savedApt);
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-white font-sans text-slate-950 overflow-x-hidden rounded-2xl border border-slate-100 min-h-[720px] shadow-sm w-full min-w-0">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex w-64 border-r border-slate-150 flex-col justify-between p-6 bg-slate-50/50 shrink-0 select-none">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white font-display font-medium text-xs italic tracking-wider shadow-xs">IS</div>
            <div>
              <span className="font-bold tracking-tight text-md font-display block text-slate-900">Ink & Steel</span>
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase block">Gestión Especialistas</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer text-left ${
                activeTab === 'dashboard' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Home size={16} /><span>Inicio / Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer text-left ${
                activeTab === 'pos' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <CreditCard size={16} /><span>POS / Ventas / Recibos</span>
            </button>
            <button
              onClick={() => setActiveTab('ingresos')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer text-left ${
                activeTab === 'ingresos' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Receipt size={16} /><span>Ingresos / Historial</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer text-left ${
                activeTab === 'calendar' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Calendar size={16} /><span>Agenda y Citas</span>
            </button>
            <button
              onClick={() => setActiveTab('turn')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer text-left ${
                activeTab === 'turn' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Clock size={16} /><span>Cerrar Turno</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-150 space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3">
            <img src={currentUser.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80"} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
            <div className="truncate">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-extrabold block">ESPECIALISTA</span>
              <span className="text-sm font-bold text-slate-900 block truncate">{currentUser.name}</span>
              <span className="text-xs text-emerald-600 font-medium block">On-duty • Rol Verificado</span>
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
        <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col min-w-0 w-full">
          
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
                    <span className="font-mono text-xs font-semibold text-slate-500">SISTEMA POS • EN LÍNEA</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
                  {/* Comisiones Historicas Bar */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-150/80 shadow-xs flex flex-col justify-between min-h-[180px]">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-extrabold text-slate-450">Comisiones Acumuladas</span>
                      <p className="text-xs text-slate-400 mt-0.5">Disponibles al llegar a $1200 en ventas</p>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-slate-900 font-display">${totalComisionesAcumuladas.toFixed(2)}</span>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-slate-500">Ventas: ${totalVentasAcumuladas.toFixed(2)}</span>
                          <span className={totalVentasAcumuladas >= META_VENTAS ? 'text-emerald-600' : 'text-slate-400'}>
                            {porcentajeMeta.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${totalVentasAcumuladas >= META_VENTAS ? 'bg-emerald-500' : 'bg-black'}`}
                            style={{ width: `${porcentajeMeta}%` }}
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
                          <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                              apt.estado === 'falto' || apt.estado === 'cancelado' ? 'bg-rose-100 text-rose-800'
                              : apt.estado === 'pagado' || apt.estado === 'realizado' ? 'bg-emerald-100 text-emerald-800'
                              : apt.estado === 'confirmada' ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
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
                  <h1 className="text-xl font-bold text-slate-900 font-display">Punto de Venta POS & Recibos</h1>
                  <p className="text-xs text-slate-500">Selecciona productos o servicios para cobrar y registrar en la caja del estudio.</p>
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
                  {/* Promociones Activas Hoy */}
                  {activePromosToday.length > 0 && (
                    <div className="space-y-2 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-amber-500" />
                          Promociones Activas Hoy
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activePromosToday.map(promo => (
                          <div 
                            key={promo.id} 
                            className="bg-slate-950 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between border border-slate-800"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs">{promo.name}</span>
                                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase rounded-full border border-amber-500/30">
                                  {promo.applicableCategory === 'all' ? 'Todas' : promo.applicableCategory}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">{promo.description}</p>
                              <p className="text-xs text-amber-400/90 font-medium pt-0.5">
                                {promo.discountType === 'percentage' ? `Lleva ${promo.requiredQuantity} con ${promo.bundlePrice}% OFF` : `Lleva ${promo.requiredQuantity} por sólo $${promo.bundlePrice.toFixed(2)} USD`}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-base font-black font-mono text-emerald-400">{promo.discountType === 'percentage' ? `${promo.bundlePrice}%` : `$${promo.bundlePrice.toFixed(2)}`}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Filtros de Categorías */}
                  <div className="flex flex-wrap gap-2">
                    {['Todos', ...(categories && categories.length > 0 ? categories : ['Servicios', 'Joyería', 'Piezas', 'Smoke Shop', 'Boutique', 'Ropa'])].map(cat => {
                      const isAll = cat === 'Todos';
                      const isSelected = isAll ? selectedCategory === 'all' : selectedCategory.toLowerCase() === cat.toLowerCase();
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(isAll ? 'all' : cat)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border cursor-pointer ${
                            isSelected 
                              ? 'bg-black text-white border-black shadow-sm' 
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
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
                          <span className="text-xs font-bold uppercase text-slate-400 block">{item.category}</span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">{item.name}</h4>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                          <span className="font-bold text-sm text-slate-900">${item.price.toFixed(2)}</span>
                          <span className="text-xs text-slate-500">{item.unit === 'unidades' ? `Stock: ${item.stock}` : 'Servicio'}</span>
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
                        {cart.map(({ item, quantity, isMerma }) => (
                          <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                            <div className="pr-2">
                              <p className="font-bold text-slate-900">{item.name}</p>
                              {isMerma ? (
                                <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                                  <span className="line-through text-slate-400 font-normal">${item.price.toFixed(2)}</span>
                                  <span>$0.00 (Merma)</span>
                                </p>
                              ) : (
                                <p className="text-xs text-slate-500">${item.price.toFixed(2)} c/u</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button type="button" onClick={() => updateCartQty(item.id, -1)} className="px-1.5 bg-slate-200 hover:bg-slate-300 rounded font-bold text-slate-700 cursor-pointer">-</button>
                              <span className="font-bold text-xs">{quantity}</span>
                              <button type="button" onClick={() => updateCartQty(item.id, 1)} className="px-1.5 bg-slate-200 hover:bg-slate-300 rounded font-bold text-slate-700 cursor-pointer">+</button>
                              <button
                                type="button"
                                title={isMerma ? "Quitar Merma" : "Marcar como Merma/Regalo"}
                                onClick={() => toggleMerma(item.id)}
                                className={`p-1 rounded text-xs transition cursor-pointer ${isMerma ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300' : 'hover:bg-slate-200 text-slate-600'}`}
                              >
                                🎁
                              </button>
                              <button type="button" onClick={() => removeFromCart(item.id)} className="text-rose-600 font-bold ml-0.5 hover:bg-rose-50 px-1 rounded cursor-pointer">✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-3 pt-3 border-t border-slate-200 mt-4">
                    {/* Método de Pago Selección */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-500">MÉTODO DE PAGO</label>
                        <label className="flex items-center gap-1 text-xs font-bold text-blue-600 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isPagoMixtoPOS} 
                            onChange={(e) => {
                              setIsPagoMixtoPOS(e.target.checked);
                              if (!e.target.checked) setPaymentMethod('cash');
                              else setPaymentMethod('mixto');
                            }}
                            className="w-3.5 h-3.5 accent-blue-600 rounded"
                          />
                          Pago Mixto
                        </label>
                      </div>
                      
                      {!isPagoMixtoPOS ? (
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['cash', 'card', 'transfer', 'de_una'] as const).map(met => (
                            <button
                              key={met}
                              type="button"
                              onClick={() => setPaymentMethod(met)}
                              className={`py-1.5 border text-[11px] font-bold rounded-lg text-center cursor-pointer transition ${
                                paymentMethod === met
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {met === 'cash' ? 'Efectivo' : met === 'card' ? 'Tarjeta' : met === 'transfer' ? 'Transf.' : 'De Una'}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 w-24">💵 Efectivo:</span>
                            <input 
                              type="number" step="0.01" min="0" value={montoEfectivoPOS || ''} 
                              onChange={(e) => setMontoEfectivoPOS(e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500" placeholder="0.00"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 w-24">🏦 Transferencia:</span>
                            <input 
                              type="number" step="0.01" min="0" value={montoTransferenciaPOS || ''} 
                              onChange={(e) => setMontoTransferenciaPOS(e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500" placeholder="0.00"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 w-24">📱 De Una:</span>
                            <input 
                              type="number" step="0.01" min="0" value={montoDeUnaPOS || ''} 
                              onChange={(e) => setMontoDeUnaPOS(e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500" placeholder="0.00"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 w-24">💳 Tarjeta:</span>
                            <input 
                              type="number" step="0.01" min="0" value={montoTarjetaPOS || ''} 
                              onChange={(e) => setMontoTarjetaPOS(e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500" placeholder="0.00"
                            />
                          </div>
                          <div className="text-xs font-bold text-right mt-1 flex justify-between items-center">
                            <span className="text-slate-500">Total: ${(parseFloat(montoEfectivoPOS || '0') + parseFloat(montoTransferenciaPOS || '0') + parseFloat(montoDeUnaPOS || '0') + parseFloat(montoTarjetaPOS || '0')).toFixed(2)}</span>
                            <span className={Math.abs((parseFloat(montoEfectivoPOS || '0') + parseFloat(montoTransferenciaPOS || '0') + parseFloat(montoDeUnaPOS || '0') + parseFloat(montoTarjetaPOS || '0')) - finalPayableTotal) < 0.01 ? "text-emerald-600" : "text-rose-600"}>
                              {Math.abs((parseFloat(montoEfectivoPOS || '0') + parseFloat(montoTransferenciaPOS || '0') + parseFloat(montoDeUnaPOS || '0') + parseFloat(montoTarjetaPOS || '0')) - finalPayableTotal) < 0.01 ? '✅ Cuadra' : '❌ No cuadra'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* INPUT DE EFECTIVO Y VUELTO (Solo visible si es 'cash') */}
                    {paymentMethod === 'cash' && (
                      <div className="flex items-center gap-3 pt-1 pb-2">
                        <div className="space-y-1 flex-1">
                          <label className="text-xs font-bold text-slate-600 uppercase block">Efectivo Recibido *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              required={paymentMethod === 'cash'}
                              value={cashReceived}
                              onChange={(e) => setCashReceived(e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-black"
                            />
                          </div>
                        </div>
                        <div className="space-y-1 flex-1">
                          <label className="text-xs font-bold text-slate-600 uppercase block">Vuelto / Cambio</label>
                          <div className={`w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold text-right ${
                            parseFloat(cashReceived) >= finalPayableTotal 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            ${changeGivenVal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 uppercase block">Cliente</label>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nombre completo" 
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 uppercase block">Cédula / RUC (Ecuador)</label>
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

                    {/* Desglose Subtotal y Promoción */}
                    {subtotalCart > 0 && (
                      <div className="space-y-1 pt-2 border-t border-slate-200">
                        <div className="flex justify-between items-center text-xs text-slate-600">
                          <span>Subtotal:</span>
                          <span className="font-mono">${subtotalCart.toFixed(2)} USD</span>
                        </div>
                        {promoDiscount > 0 && (
                          <div className="space-y-0.5">
                            <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                              <span>Descuento Promoción:</span>
                              <span className="font-mono">- ${promoDiscount.toFixed(2)} USD</span>
                            </div>
                            <p className="text-xs text-emerald-600/80 font-medium text-right truncate">
                              {appliedPromoNames.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total a pagar:</span>
                      <span>${finalPayableTotal.toFixed(2)} USD</span>
                    </div>

                    <button
                      type="submit"
                      disabled={cart.length === 0 || isProcessingSale || !isCajaAbierta}
                      className="w-full py-3 bg-black hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      {isProcessingSale ? 'Procesando...' : 'Emitir Recibo y Cobrar'}
                    </button>
                  </form>
                </div>
              </div>
              
            </div>
          )}

          {/* TAB: INGRESOS */}
          {activeTab === 'ingresos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 font-display">Historial de Ingresos y Gastos</h1>
                  <p className="text-xs text-slate-500">Registro global de transacciones, ventas, abonos y egresos de caja chica.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={15} />
                  <span>Registrar Gasto (Caja Chica)</span>
                </button>
              </div>
              <div className="pt-2">
                <HistorialVentas sales={filteredSales} expenses={filteredExpenses} />
              </div>
            </div>
          )}

          {/* TAB 3: CALENDAR */}
          {activeTab === 'calendar' && (
            <CalendarModule 
              currentSpecialistName={currentUser.name}
              specialistsList={users.map(u => u.name) || ['Ámbar Piercing', 'Carlos Tattoo', 'Elena BodyArt', 'General Studio']}
              appointments={appointments}
              onSaveAppointment={handleSaveAppointmentLocal}
              onAddAbono={handleRegistrarAbonoLocal}
              onDeleteAppointment={onDeleteAppointment}
              onProcesarAbonoACaja={handleProcesarAbonoACajaLocal}
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
                {!isCajaAbierta ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <button
                      type="button"
                      onClick={handleTimbrarEntrada}
                      className="w-full max-w-sm h-24 bg-emerald-500 active:bg-emerald-600 text-white font-black text-xl sm:text-2xl rounded-2xl shadow-lg border-b-4 border-emerald-700 flex flex-col items-center justify-center space-y-1 transition-all active:translate-y-1 active:border-b-0"
                    >
                      <span>INICIAR TURNO</span>
                      <span className="text-xs font-medium text-emerald-100 uppercase tracking-widest block">Toca para abrir caja</span>
                    </button>
                    <div className="flex flex-col w-full max-w-sm">
                       <label className="text-xs text-slate-500 font-bold mb-1">O modificar hora manual:</label>
                       <input 
                         type="time" 
                         value={clockInTime}
                         onChange={(e) => setClockInTime(e.target.value)}
                         className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black" 
                       />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-xs uppercase font-extrabold text-slate-400 block">Hora de Entrada</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-lg font-bold text-slate-900">{clockInTime}</span>
                        <div className="flex items-center gap-2">
                           <input 
                             type="time" 
                             value={clockInTime}
                             onChange={(e) => setClockInTime(e.target.value)}
                             className="px-2 py-1 border border-slate-200 rounded-md text-xs bg-white w-24" 
                           />
                           <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded-md">Abierta</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-xs uppercase font-extrabold text-slate-400 block">Hora de Salida</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-lg font-bold text-slate-900">{clockOutTime}</span>
                        <button 
                          type="button"
                          onClick={handleTimbrarSalida}
                          disabled={!isCajaAbierta}
                          className="text-xs font-bold bg-black hover:bg-slate-800 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg cursor-pointer transition shadow-xs w-full sm:w-auto mt-2 sm:mt-0"
                        >
                          Timbrar Salida
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FORMULARIO CIERRE O VISTA FINAL */}
              {isCajaAbierta ? (
                <form onSubmit={handleCajaCierreSubmit} className="space-y-6">
                  {/* 3 BLOQUES VISUALES JERÁRQUICOS DE CIERRE DE TURNO */}
                  <div className="space-y-4 min-w-0 w-full">
                    {/* BLOQUE 1 (MÁXIMA PRIORIDAD: CAJA GLOBAL Y EFECTIVO FÍSICO) */}
                    <div className="p-4 sm:p-6 md:p-8 bg-black text-white rounded-3xl border border-slate-800 shadow-xl space-y-4 sm:space-y-6 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-slate-800 pb-4 sm:pb-5">
                        <div>
                          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-400">Bloque 1 • Arqueo Inmediato de Caja</span>
                          <h3 className="text-base sm:text-xl font-bold font-display text-white mt-0.5">Caja Global & Efectivo Físico Requerido</h3>
                        </div>
                        <div className="text-left sm:text-right bg-emerald-950/80 border border-emerald-500/30 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl w-full sm:w-auto">
                          <span className="text-[11px] sm:text-xs uppercase font-bold text-emerald-400 block">Efectivo Físico Esperado</span>
                          <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono text-emerald-300 mt-0.5 block whitespace-nowrap min-w-0">${subtotalsTurn.efectivo.toFixed(2)} USD</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-col justify-between min-w-0">
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Total Efectivo</span>
                          <span className="text-base sm:text-xl md:text-2xl font-black text-white font-mono mt-1 block whitespace-nowrap min-w-0">${subtotalsTurn.efectivo.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-col justify-between min-w-0">
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Total Transferencia</span>
                          <span className="text-base sm:text-xl md:text-2xl font-black text-white font-mono mt-1 block whitespace-nowrap min-w-0">${subtotalsTurn.transferencia.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-col justify-between min-w-0">
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Total De Una</span>
                          <span className="text-base sm:text-xl md:text-2xl font-black text-white font-mono mt-1 block whitespace-nowrap min-w-0">${subtotalsTurn.de_una.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-col justify-between min-w-0">
                          <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Total Tarjeta</span>
                          <span className="text-base sm:text-xl md:text-2xl font-black text-white font-mono mt-1 block whitespace-nowrap min-w-0">${subtotalsTurn.tarjeta.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0 w-full">
                      {/* BLOQUE 2 (DESGLOSE ESTUDIO NAS: TATUAJES, PIERCINGS, SERVICIOS) */}
                      <div className="p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 sm:space-y-5 min-w-0 w-full">
                        <div className="flex flex-col border-b border-slate-200/80 pb-3 sm:pb-4">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5">Bloque 2</span>
                          <div className="flex justify-between items-center gap-2">
                            <h4 className="text-base sm:text-lg font-bold text-slate-900">Estudio NAS</h4>
                            <span className="text-lg sm:text-2xl font-black text-slate-900 font-mono whitespace-nowrap min-w-0">${totalEstudioHoy.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 text-xs sm:text-sm font-mono">
                          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 flex flex-col justify-center min-w-0">
                            <span className="text-slate-500 font-sans font-bold uppercase text-xs tracking-tight block">Efectivo</span>
                            <span className="font-extrabold text-slate-900 text-sm sm:text-base font-mono whitespace-nowrap min-w-0 block mt-1">${estudioBreakdownHoy.efectivo.toFixed(2)}</span>
                          </div>
                          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 flex flex-col justify-center min-w-0">
                            <span className="text-slate-500 font-sans font-bold uppercase text-xs tracking-tight block">Transf</span>
                            <span className="font-extrabold text-slate-900 text-sm sm:text-base font-mono whitespace-nowrap min-w-0 block mt-1">${estudioBreakdownHoy.transferencia.toFixed(2)}</span>
                          </div>
                          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 flex flex-col justify-center min-w-0">
                            <span className="text-slate-500 font-sans font-bold uppercase text-xs tracking-tight block">De Una</span>
                            <span className="font-extrabold text-slate-900 text-sm sm:text-base font-mono whitespace-nowrap min-w-0 block mt-1">${estudioBreakdownHoy.de_una.toFixed(2)}</span>
                          </div>
                          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 flex flex-col justify-center min-w-0">
                            <span className="text-slate-500 font-sans font-bold uppercase text-xs tracking-tight block">Tarjeta</span>
                            <span className="font-extrabold text-slate-900 text-sm sm:text-base font-mono whitespace-nowrap min-w-0 block mt-1">${estudioBreakdownHoy.tarjeta.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* BLOQUE 3 (DESGLOSE BOUTIQUE: ROPA & ACCESORIOS) */}
                      <div className="p-4 sm:p-6 bg-purple-50/70 border border-purple-200/80 rounded-3xl space-y-4 sm:space-y-5 min-w-0 w-full">
                        <div className="flex flex-col border-b border-purple-200/80 pb-3 sm:pb-4">
                          <span className="text-xs sm:text-sm font-extrabold text-purple-700 uppercase tracking-wider block mb-0.5">Bloque 3</span>
                          <div className="flex justify-between items-center gap-2">
                            <h4 className="text-base sm:text-lg font-bold text-purple-950">Boutique & Ropa</h4>
                            <span className="text-lg sm:text-2xl font-black text-purple-950 font-mono whitespace-nowrap min-w-0">${totalBoutiqueHoy.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 text-xs sm:text-sm font-mono">
                          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-purple-200 flex flex-col justify-center min-w-0">
                            <span className="text-slate-500 font-sans font-bold uppercase text-xs tracking-tight block">Efectivo</span>
                            <span className="font-extrabold text-purple-950 text-sm sm:text-base font-mono whitespace-nowrap min-w-0 block mt-1">${boutiqueBreakdownHoy.efectivo.toFixed(2)}</span>
                          </div>
                          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-purple-200 flex flex-col justify-center min-w-0">
                            <span className="text-slate-500 font-sans font-bold uppercase text-xs tracking-tight block">Transf</span>
                            <span className="font-extrabold text-purple-950 text-sm sm:text-base font-mono whitespace-nowrap min-w-0 block mt-1">${boutiqueBreakdownHoy.transferencia.toFixed(2)}</span>
                          </div>
                          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-purple-200 flex flex-col justify-center min-w-0">
                            <span className="text-slate-500 font-sans font-bold uppercase text-xs tracking-tight block">De Una</span>
                            <span className="font-extrabold text-purple-950 text-sm sm:text-base font-mono whitespace-nowrap min-w-0 block mt-1">${boutiqueBreakdownHoy.de_una.toFixed(2)}</span>
                          </div>
                          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-purple-200 flex flex-col justify-center min-w-0">
                            <span className="text-slate-500 font-sans font-bold uppercase text-xs tracking-tight block">Tarjeta</span>
                            <span className="font-extrabold text-purple-950 text-sm sm:text-base font-mono whitespace-nowrap min-w-0 block mt-1">${boutiqueBreakdownHoy.tarjeta.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PHYSICAL COUNT INPUT CARD */}
                    <div className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                      <div>
                        <span className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">Ingreso de Efectivo Contado en Caja</span>
                        <p className="text-xs text-slate-500 mt-0.5">Ingresa la suma física total contada en billetes/monedas para validar cuadre.</p>
                      </div>
                      <div className="w-full sm:w-64 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xl">$</span>
                        <input 
                          type="number"
                          step="0.01"
                          value={declaredCash}
                          onChange={(e) => setDeclaredCash(e.target.value)}
                          placeholder="0.00"
                          required
                          className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xl font-bold text-slate-900 focus:outline-none focus:border-black transition"
                        />
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
      
      {/* MODAL REGISTRAR GASTO / CAJA CHICA */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  $
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">Registrar Salida / Gasto</h3>
                  <p className="text-[11px] text-slate-500">Caja Chica del Estudio</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegistrarGastoSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Concepto / Título del Gasto *</label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="Ej. Compra de pan, piezas regaladas, viáticos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Monto Total ($ USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Observaciones / Detalle (Opcional)</label>
                <textarea
                  rows={2}
                  value={expenseReason}
                  onChange={(e) => setExpenseReason(e.target.value)}
                  placeholder="Motivo detallado del gasto o comprobante físico de respaldo..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black"
                />
              </div>

              {isCajaAbierta && (
                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-amber-800 text-[11px]">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Caja Abierta:</strong> Este gasto se descontará automáticamente del total en efectivo esperado para el cuadre del turno.
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  Confirmar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
