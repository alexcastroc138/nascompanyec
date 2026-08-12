import React, { useState, useEffect } from 'react';
import { BarChart3, Package, Settings, Calendar, LogOut, Sparkles, Tag, LayoutDashboard, Wallet, Clock, Bell, Users, ShieldCheck, FileText, Menu, X } from 'lucide-react';
import { 
  INITIAL_USERS, INITIAL_ITEMS, INITIAL_APPOINTMENTS, 
  INITIAL_SALES, INITIAL_CIERRES, INITIAL_WEB_LOGS,
  INITIAL_PROMOS, INITIAL_TIME_ENTRIES, INITIAL_EMAIL_ALERTS 
} from './data';
import { User, POSItem, Sale, Appointment, CierreCaja, WebhookLog, DynamicPromo, TimeEntry, EmailAlert, Expense } from './types';
import { getSessionToken, clearSessionToken } from './lib/auth';
import BottomNav from './components/layout/BottomNav';
import { useLocalStorage } from './hooks/useLocalStorage';
import { CajaProvider } from './context/CajaContext';
import { dbService } from './services/db.service';

// Importing child components
import LoginPage from './components/LoginPage';
import SpecialistDashboard from './components/SpecialistDashboard';
import AdminDashboard from './components/AdminDashboard';
import SettingsPage from './components/SettingsPage';

export default function App() {
  // Authentication & Session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<'specialist' | 'admin'>('specialist');
  const [adminActiveTab, setAdminActiveTab] = useState<'overview' | 'reports' | 'cajas' | 'inventory' | 'promos' | 'agents' | 'time' | 'calendar' | 'alerts' | 'sri' | 'settings'>('overview');
  const [isAdminMobileMenuOpen, setIsAdminMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const session = getSessionToken();
    if (session) {
      setIsAuthenticated(true);
      setCurrentRole(session.role as 'admin' | 'specialist');
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // App-level Persistent Shared States using useLocalStorage
  const [users, setUsers] = useLocalStorage<User[]>('studio_users', INITIAL_USERS);
  const specialistAmbar = users.find(u => u.role === 'specialist') || users[0] || INITIAL_USERS[0]; // Ámbar default
  const adminUser = users.find(u => u.role === 'admin') || users[0] || INITIAL_USERS[2]; // Admin default

  const [items, setItems] = useState<POSItem[]>(INITIAL_ITEMS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);

  useEffect(() => {
    if (isAuthenticated) {
      dbService.getCitas().then(data => { if (data) setAppointments(data); });
      dbService.getVentas().then(data => { if (data) setSales(data); });
      dbService.getInventario().then(data => { if (data) setItems(data); });
      dbService.getUsuarios().then(data => { if (data && data.length > 0) setUsers(data); });
    }
  }, [isAuthenticated]);

  const [cierres, setCierres] = useLocalStorage<CierreCaja[]>('studio_cierres', INITIAL_CIERRES);
  const [webhookLogs] = useState<WebhookLog[]>(INITIAL_WEB_LOGS);
  const [promos, setPromos] = useLocalStorage<DynamicPromo[]>('studio_promos', INITIAL_PROMOS);
  const [categories, setCategories] = useLocalStorage<string[]>('studio_categories', ['Servicios', 'Joyería', 'Piezas', 'Smoke Shop', 'Boutique', 'Ropa']);
  const [timeEntries] = useState<TimeEntry[]>(INITIAL_TIME_ENTRIES);

  const handleAddCategory = (cat: string) => {
    if (cat && cat.trim() !== '') {
      const cleanCat = cat.trim();
      if (!categories.includes(cleanCat)) {
        setCategories([...categories, cleanCat]);
      }
    }
  };

  const handleEditPromo = (updatedPromo: DynamicPromo) => {
    setPromos(prev => prev.map(p => p.id === updatedPromo.id ? updatedPromo : p));
    triggerNotification(`Promoción "${updatedPromo.name}" actualizada.`);
  };
  const [emailAlerts, setEmailAlerts] = useLocalStorage<EmailAlert[]>('studio_email_alerts', INITIAL_EMAIL_ALERTS);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('studio_expenses', []);

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses(prev => [newExpense, ...prev]);
    triggerNotification(`Gasto registrado: $${newExpense.amount.toFixed(2)} USD - ${newExpense.title}`);
  };

  // Active cash turn state persisted in localStorage
  const [activeTurn, setActiveTurn] = useLocalStorage<CierreCaja | null>('studio_active_turn', {
    id: 'c_active_initial',
    specialistId: '1',
    specialistName: 'Ámbar Piercing',
    startTime: new Date().toISOString(),
    totalSales: 0,
    totalCommissions: 0,
    cashExpected: 0,
    status: 'abierta'
  });

  // Authentication Handler
  const handleLogin = (role: 'admin' | 'specialist', email: string) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    setAdminActiveTab('overview');
    triggerNotification(`Sesión iniciada correctamente como ${role === 'admin' ? 'Administrador' : 'Especialista'}.`);
  };

  const handleLogout = () => {
    clearSessionToken();
    setIsAuthenticated(false);
    triggerNotification('Sesión cerrada correctamente.');
  };

  // User Management Handlers
  const handleAddUser = async (newUser: User) => {
    try {
      const success = await dbService.saveUsuario(newUser);
      if (success) {
        dbService.getUsuarios().then(data => { if (data && data.length > 0) setUsers(data); });
        triggerNotification(`Usuario/Agente "${newUser.name}" registrado correctamente.`);
      } else {
        triggerNotification(`Error al crear usuario "${newUser.name}" en la base de datos.`);
      }
    } catch (e) {
      triggerNotification(`Error de red al crear usuario.`);
    }
  };

  const handleEditUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    triggerNotification(`Usuario "${updatedUser.name}" actualizado.`);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    triggerNotification('Usuario eliminado.');
  };

  // Inventory CRUD Handlers
  const handleAddItem = (newItem: POSItem) => {
    setItems([...items, newItem]);
    dbService.saveInventarioItem(newItem, true);
    triggerNotification(`Producto "${newItem.name}" registrado en inventario.`);
    if (newItem.unit === 'unidades' && newItem.stock <= newItem.minStock) {
      setEmailAlerts([
        {
          id: `alert-${Date.now()}`,
          type: 'low_stock',
          subject: `⚠️ Alerta Stock Bajo: ${newItem.name}`,
          message: `El producto ${newItem.name} se encuentra con stock crítico de ${newItem.stock} unidades (mínimo ${newItem.minStock}).`,
          timestamp: new Date().toISOString(),
          read: false
        },
        ...emailAlerts
      ]);
    }
  };

  const handleEditItem = (updatedItem: POSItem) => {
    setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
    dbService.saveInventarioItem(updatedItem, false);
    triggerNotification(`Producto "${updatedItem.name}" actualizado.`);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
    triggerNotification(`Ítem eliminado del inventario.`);
  };

  // Dynamic Promo Handlers
  const handleAddPromo = (newPromo: DynamicPromo) => {
    setPromos([...promos, newPromo]);
    triggerNotification(`Promoción "${newPromo.name}" activada.`);
  };

  const handleTogglePromo = (promoId: string) => {
    setPromos(promos.map(p => p.id === promoId ? { ...p, active: !p.active } : p));
  };

  const handleDeletePromo = (promoId: string) => {
    setPromos(promos.filter(p => p.id !== promoId));
  };

  const [notification, setNotification] = useState<string | null>(
    "ℹ️ Sistema de Gestión Activo - Ink & Steel Studio Ecuador."
  );

  // Shared Action: Add Sale (POS)
  const handleAddSale = async (newSale: Sale) => {
    setSales([newSale, ...sales]);
    await dbService.saveVenta(newSale);
    dbService.getVentas().then(data => { if (data) setSales(data); });

    if (newSale.specialistId === '1' && activeTurn && activeTurn.status === 'abierta') {
      let addedCash = 0;
      if (newSale.paymentMethod === 'cash' || (newSale.paymentMethod as string) === 'efectivo') {
        addedCash = newSale.subtotal;
      } else if (newSale.paymentMethod === 'mixto') {
        if (newSale.detalles_json) {
          try {
            const parsed = JSON.parse(newSale.detalles_json);
            if (parsed.pagos && parsed.pagos.efectivo) {
              addedCash = Number(parsed.pagos.efectivo);
            }
          } catch (e) {
            console.error("Error al parsear detalles_json en App:", e);
          }
        }
      }
      
      setActiveTurn({
        ...activeTurn,
        totalSales: activeTurn.totalSales + newSale.subtotal,
        totalCommissions: activeTurn.totalCommissions + newSale.commission,
        cashExpected: activeTurn.cashExpected + addedCash
      });
    }

    triggerNotification(`Venta de $${newSale.subtotal.toFixed(2)} USD registrada para ${newSale.specialistName}. Enviada con éxito al SRI.`);
  };

  // Shared Action: Add Appointment
  const handleAddAppointment = async (appt: Appointment) => {
    setAppointments([...appointments, appt]);
    await dbService.saveCita(appt, true);
    dbService.getCitas().then(data => { if (data) setAppointments(data); });
    triggerNotification(`¡Nueva cita de ${appt.customerName || appt.cliente} insertada en el calendario!`);
  };

  const handleSaveAppointment = (savedApt: Appointment) => {
    const initialDeposit = savedApt.abonado || savedApt.deposit || 0;
    const exists = appointments.some((a) => a.id === savedApt.id);

    const apptDate = savedApt.fecha || savedApt.date || '';
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const todayStr = d.toISOString().split('T')[0];
    const isToday = apptDate === todayStr;

    // REGLA FINANCIERA: CUSTODIA DE ABONOS
    // Si es hoy, ingresa a la caja del día de hoy.
    // Si es futura (mañana o posterior), NO se registra venta ni altera la caja de hoy, quedando en custodia.
    if (!exists && initialDeposit > 0 && isToday) {
      const clientName = savedApt.cliente || savedApt.customerName || 'Cliente';
      const serviceName = savedApt.servicio || savedApt.service || 'Servicio';
      const rawPaymentMethod = savedApt.metodoPagoInicial || savedApt.metodoPagoAbono || 'efectivo';

      const salePaymentMethod = (rawPaymentMethod === 'cash' || rawPaymentMethod === 'efectivo')
        ? 'cash'
        : (rawPaymentMethod === 'transfer' || rawPaymentMethod === 'transferencia')
        ? 'transfer'
        : rawPaymentMethod === 'de_una'
        ? 'de_una'
        : 'card';

      const isEfectivo = rawPaymentMethod === 'cash' || rawPaymentMethod === 'efectivo';
      const mockInvoice = `REC-000${Math.floor(1000 + Math.random() * 9000)}`;

      const alreadyRegistered = sales.some(
        s => s.customerName === clientName && s.subtotal === initialDeposit && s.items.some(i => i.itemId === 'abono_inicial')
      );

      if (!alreadyRegistered) {
        handleAddSale({
          id: 'abn_ini_' + Date.now(),
          specialistId: '1',
          specialistName: savedApt.especialista || savedApt.specialistName || 'Ámbar Piercing',
          customerName: clientName,
          customerId: '9999999999999',
          customerEmail: 'N/A',
          customerAddress: 'N/A',
          items: [{ itemId: 'abono_inicial', name: `Abono Cita Hoy: ${serviceName}`, price: initialDeposit, quantity: 1, category: 'Abono' }],
          subtotal: initialDeposit,
          commission: 0,
          paymentMethod: salePaymentMethod as any,
          cashReceived: isEfectivo ? initialDeposit : undefined,
          changeGiven: 0,
          timestamp: new Date().toISOString(),
          sriStatus: 'enviado_sri' as any,
          invoiceNumber: mockInvoice
        });
      }
    }

    const updatedAptWithCustody: Appointment = {
      ...savedApt,
      estadoAbono: initialDeposit > 0 ? (isToday ? 'ingresado_caja' : 'en_custodia') : 'sin_abono'
    };

    setAppointments((prev) => {
      const existsInPrev = prev.some((a) => a.id === savedApt.id);
      if (existsInPrev) {
        return prev.map((a) => (a.id === savedApt.id ? updatedAptWithCustody : a));
      }
      return [updatedAptWithCustody, ...prev];
    });
    dbService.saveCita(updatedAptWithCustody, !exists).then(() => {
      dbService.getCitas().then(data => { if (data) setAppointments(data); });
    });
    triggerNotification(`Cita de "${savedApt.cliente || savedApt.customerName}" guardada (${isToday ? 'Abono en Caja' : 'Abono en Custodia'}).`);
  };

  const handleProcesarAbonoACaja = (apt: Appointment) => {
    const monto = apt.abonado || apt.deposit || 0;
    if (monto <= 0) return;

    const rawPaymentMethod = apt.metodoPagoAbono || apt.metodoPagoInicial || 'efectivo';
    const clientName = apt.cliente || apt.customerName || 'Cliente';
    const serviceName = apt.servicio || apt.service || 'Reserva';
    const mockInvoice = `REC-000${Math.floor(1000 + Math.random() * 9000)}`;
    const salePaymentMethod = (rawPaymentMethod === 'cash' || rawPaymentMethod === 'efectivo')
      ? 'cash'
      : (rawPaymentMethod === 'transfer' || rawPaymentMethod === 'transferencia')
      ? 'transfer'
      : rawPaymentMethod === 'de_una'
      ? 'de_una'
      : 'card';
    const isEfectivo = rawPaymentMethod === 'cash' || rawPaymentMethod === 'efectivo';

    handleAddSale({
      id: 'abn_custodia_' + Date.now(),
      specialistId: '1',
      specialistName: apt.especialista || apt.specialistName || 'Ámbar Piercing',
      customerName: clientName,
      customerId: '9999999999999',
      customerEmail: 'N/A',
      customerAddress: 'N/A',
      items: [{ itemId: 'abono_custodia', name: `Ingreso Abono Custodia: ${serviceName}`, price: monto, quantity: 1, category: 'Abono' }],
      subtotal: monto,
      commission: 0,
      paymentMethod: salePaymentMethod as any,
      cashReceived: isEfectivo ? monto : undefined,
      changeGiven: 0,
      timestamp: new Date().toISOString(),
      sriStatus: 'enviado_sri' as any,
      invoiceNumber: mockInvoice
    });

    const updatedApt = { ...apt, estadoAbono: 'ingresado_caja' } as Appointment;
    setAppointments((prev) => prev.map((a) => (a.id === apt.id ? updatedApt : a)));
    dbService.saveCita(updatedApt, false);
    triggerNotification(`Abono en Custodia de $${monto.toFixed(2)} ingresado a caja.`);
  };

  const handleAddAbono = (id: string, monto: number) => {
    let updatedCita: Appointment | null = null;
    setAppointments((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newAbonado = Math.min(item.precioTotal, item.abonado + monto);
          const isFull = newAbonado >= item.precioTotal;
          const updated = {
            ...item,
            abonado: newAbonado,
            estado: isFull ? 'completada' : item.estado
          } as Appointment;
          updatedCita = updated;
          return updated;
        }
        return item;
      })
    );
    if (updatedCita) {
      dbService.saveCita(updatedCita, false);
    }
    triggerNotification(`Abono de $${monto.toFixed(2)} USD registrado con éxito.`);
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    triggerNotification('Cita eliminada de la agenda.');
  };

  // Turn closing action
  const handleCerrarCaja = async (efectivoEntregado: number, notas: string) => {
    if (!activeTurn) return;

    const finalTurn: CierreCaja = {
      ...activeTurn,
      endTime: new Date().toISOString(),
      cashSubmitted: efectivoEntregado,
      physicalDifference: efectivoEntregado - activeTurn.cashExpected,
      notes: notas,
      status: 'cerrada'
    };

    setActiveTurn(finalTurn);
    setCierres([finalTurn, ...cierres]);
    
    await dbService.cerrarTurno({
      id: finalTurn.id,
      timestampCierre: finalTurn.endTime,
      expectedCash: finalTurn.cashExpected,
      actualCash: finalTurn.cashSubmitted,
      difference: finalTurn.physicalDifference,
      notes: finalTurn.notes
    });

    triggerNotification(`Caja de ${activeTurn.specialistName} Cerrada. Diferencia física: ${finalTurn.physicalDifference?.toFixed(2)} USD.`);
  };

  const handleReabrirCaja = async (specialist?: User) => {
    const specId = specialist?.id || '1';
    const specName = specialist?.name || 'Ámbar Piercing';
    const freshTurn: CierreCaja = {
      id: 'c_active_' + Date.now(),
      specialistId: specId,
      specialistName: specName,
      startTime: new Date().toISOString(),
      totalSales: 0,
      totalCommissions: 0,
      cashExpected: 0,
      status: 'abierta'
    };
    setActiveTurn(freshTurn);
    
    await dbService.abrirTurno({
      id: freshTurn.id,
      specialistId: freshTurn.specialistId,
      specialistName: freshTurn.specialistName,
      timestamp: freshTurn.startTime
    });

    triggerNotification(`Nuevo turno de caja iniciado para ${specName}.`);
  };

  // Inventory adjustment
  const handleUpdateInventory = (itemId: string, newQty: number) => {
    setItems(items.map(i => i.id === itemId ? { ...i, stock: newQty } : i));
  };

  const handleRestock = (itemId: string, qty: number) => {
    setItems(items.map(i => {
      if (i.id === itemId) {
        const updatedStock = i.stock + qty;
        triggerNotification(`Inventario reabastecido: +${qty} unidades de "${i.name}".`);
        return { ...i, stock: updatedStock };
      }
      return i;
    }));
  };

  // Sri Error correction retry
  const handleRetrySRI = (saleId: string) => {
    setSales(sales.map(s => {
      if (s.id === saleId) {
        const mockInvoice = `001-002-0000${Math.floor(100000 + Math.random() * 900000)}`;
        triggerNotification(`Reintentando Transmisión SRI: Autorizado Comprobante ${mockInvoice}.`);
        return {
          ...s,
          sriStatus: 'enviado_sri',
          invoiceNumber: mockInvoice
        };
      }
      return s;
    }));
  };

  const triggerNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => {
      setNotification(prev => prev === text ? null : prev);
    }, 5500);
  };

  // If not logged in, render real Login page
  if (!isAuthenticated) {
    return (
      <CajaProvider>
        <LoginPage onLogin={handleLogin} />
      </CajaProvider>
    );
  }

  return (
    <CajaProvider>
      <div className="min-h-screen bg-white font-sans text-slate-950 overflow-hidden antialiased">
        
        {/* Top Notification Toast Bar */}
        <div className="bg-slate-950 text-white text-xs px-6 py-2 flex items-center justify-between border-b border-slate-800 z-50 relative">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Sparkles size={13} className="text-amber-400 animate-pulse flex-shrink-0" />
              <span className="font-semibold text-slate-200">NAS COMPANY EC • Ecuador</span>
            </div>
            {notification && (
              <span className="text-emerald-400 font-mono text-[11px] truncate max-w-xl">
                • {notification}
              </span>
            )}
          </div>
        </div>

        {currentRole === 'specialist' ? (
          /* SPECIALIST FULLSCALE MODE */
          <div className="w-full h-full min-h-screen flex bg-white">
            <SpecialistDashboard
              currentUser={specialistAmbar}
              items={items}
              appointments={appointments}
              sales={sales}
              expenses={expenses}
              cierreCajaActiva={activeTurn}
              promos={promos}
              categories={categories}
              onAddSale={handleAddSale}
              onAddExpense={handleAddExpense}
              onAddAppointment={handleAddAppointment}
              onSaveAppointment={handleSaveAppointment}
              onAddAbono={handleAddAbono}
              onDeleteAppointment={handleDeleteAppointment}
              onCerrarCaja={handleCerrarCaja}
              onReabrirCaja={handleReabrirCaja}
              onUpdateInventory={handleUpdateInventory}
              onSwitchRole={(role) => {
                const session = getSessionToken();
                if (session && session.role === 'admin') {
                  setCurrentRole(role);
                  setAdminActiveTab('overview');
                } else {
                  triggerNotification('⚠️ Permiso denegado: Tu usuario no tiene el rol de Administrador.');
                }
              }}
              onLogout={handleLogout}
            />
          </div>
        ) : (
          /* ADMINISTRATOR ADVANCED COHESIVE WORKSPACE */
          <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-900 w-full min-w-0 overflow-x-hidden">
            
            {/* Mobile Admin Header (Visible on screens < md) */}
            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                  NAS
                </div>
                <div>
                  <h1 className="text-xs font-bold text-slate-900 tracking-tight">NAS COMPANY EC</h1>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Panel Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminMobileMenuOpen(!isAdminMobileMenuOpen)}
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
              >
                {isAdminMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                <span className="text-xs font-bold">{isAdminMobileMenuOpen ? 'Cerrar' : 'Menú'}</span>
              </button>
            </div>

            {/* Mobile Admin Navigation Dropdown / Drawer */}
            {isAdminMobileMenuOpen && (
              <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2 animate-in slide-in-from-top duration-200 z-30">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Navegación Admin</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'overview', label: 'Inicio', icon: LayoutDashboard },
                    { id: 'reports', label: 'Reportes BI', icon: BarChart3 },
                    { id: 'cajas', label: 'Control Cajas', icon: Wallet },
                    { id: 'inventory', label: 'Inventario', icon: Package },
                    { id: 'promos', label: 'Promociones', icon: Tag },
                    { id: 'agents', label: 'Agentes', icon: Users },
                    { id: 'time', label: 'Asistencia', icon: Clock },
                    { id: 'calendar', label: 'Agenda', icon: Calendar },
                    { id: 'alerts', label: 'Alertas', icon: Bell },
                    { id: 'sri', label: 'Recibos', icon: FileText },
                    { id: 'settings', label: 'Ajustes', icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = adminActiveTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setAdminActiveTab(item.id as any);
                          setIsAdminMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon size={15} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('specialist');
                      setIsAdminMobileMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    <Users size={14} />
                    <span>Vista Especialista</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition"
                  >
                    <LogOut size={14} />
                    <span>Salir</span>
                  </button>
                </div>
              </div>
            )}

            {/* Desktop Left Sidebar (Hidden on mobile < md) */}
            <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 h-screen flex-col justify-between p-4 flex-shrink-0 overflow-y-auto">
              <div>
                {/* Brand / Logo Admin */}
                <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-black text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
                    NAS
                  </div>
                  <div>
                    <h1 className="text-xs font-bold text-slate-900 tracking-tight">NAS COMPANY EC</h1>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Studio & Boutique</p>
                  </div>
                </div>

                {/* LISTA VERTICAL DE NAVEGACIÓN */}
                <nav className="space-y-1">
                  {[
                    { id: 'overview', label: 'Inicio / Dashboard', icon: LayoutDashboard },
                    { id: 'reports', label: '📊 Reportes BI', icon: BarChart3 },
                    { id: 'cajas', label: 'Control Cajas', icon: Wallet },
                    { id: 'inventory', label: 'Inventario e Insumos', icon: Package },
                    { id: 'promos', label: 'Promociones', icon: Tag },
                    { id: 'agents', label: 'Gestión de Agentes', icon: Users },
                    { id: 'time', label: 'Horas Extras / Asistencia', icon: Clock },
                    { id: 'calendar', label: 'Agenda y Citas', icon: Calendar },
                    { id: 'alerts', label: 'Alertas Stock', icon: Bell },
                    { id: 'sri', label: 'Auditoría Recibos', icon: FileText },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = adminActiveTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setAdminActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left ${
                          isActive
                            ? 'bg-black text-white shadow-md font-bold'
                            : 'text-slate-500 hover:bg-slate-100 font-semibold'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* SECCIÓN SISTEMA (AL PIE DEL SIDEBAR) */}
              <div className="pt-4 border-t border-slate-100 space-y-1">
                <button
                  type="button"
                  onClick={() => setAdminActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left ${
                    adminActiveTab === 'settings'
                      ? 'bg-black text-white shadow-md font-bold'
                      : 'text-slate-500 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <Settings size={16} />
                  <span>Configuración</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentRole('specialist');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  <Users size={16} />
                  <span>Vista Especialista</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left text-rose-600 hover:bg-rose-50 rounded-xl mt-1"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </aside>

            {/* Central Admin Panel Pane */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 min-h-screen min-w-0 w-full">
              <div className="max-w-7xl mx-auto space-y-5 min-w-0 w-full">
                {adminActiveTab === 'settings' ? (
                  <SettingsPage
                    users={users}
                    onAddUser={handleAddUser}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                  />
                ) : (
                  <AdminDashboard
                    activeTab={adminActiveTab}
                    isCajaAbierta={!!(activeTurn && activeTurn.status === 'abierta')}
                    activeTurn={activeTurn}
                    users={users}
                    items={items}
                    appointments={appointments}
                    sales={sales}
                    cierres={cierres}
                    promos={promos}
                    categories={categories}
                    timeEntries={timeEntries}
                    emailAlerts={emailAlerts}
                    expenses={expenses}
                    onRestock={handleRestock}
                    onRetrySRI={handleRetrySRI}
                    onAddItem={handleAddItem}
                    onEditItem={handleEditItem}
                    onDeleteItem={handleDeleteItem}
                    onAddPromo={handleAddPromo}
                    onEditPromo={handleEditPromo}
                    onTogglePromo={handleTogglePromo}
                    onDeletePromo={handleDeletePromo}
                    onAddCategory={handleAddCategory}
                    onAddUser={handleAddUser}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                    onSaveAppointment={handleSaveAppointment}
                    onAddAbono={handleAddAbono}
                    onDeleteAppointment={handleDeleteAppointment}
                    onProcesarAbonoACaja={handleProcesarAbonoACaja}
                  />
                )}
              </div>
            </main>
          </div>
        )}
      </div>
    </CajaProvider>
  );
}
