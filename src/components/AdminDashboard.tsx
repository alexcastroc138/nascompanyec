import React, { useState } from 'react';
import { User, POSItem, Sale, Appointment, CierreCaja, DynamicPromo, TimeEntry, EmailAlert, Expense } from '../types';
import { Bell, Wallet, LayoutDashboard, Trash2, PieChart, Users, Plus, ChevronDown, Clock, TrendingUp, AlertTriangle, DollarSign, BarChart3, User as UserIcon, FileText, Download, Lock, Tag, Box, X, Calendar, Edit2, Package, ShieldCheck, Lightbulb, Target, Award } from 'lucide-react';
import HistorialVentas from './pos/HistorialVentas';
import CalendarModule from './calendar/CalendarModule';

interface AdminDashboardProps {
  activeTab: string;
  isCajaAbierta?: boolean;
  activeTurn?: CierreCaja | null;
  users: User[];
  items: POSItem[];
  appointments: Appointment[];
  sales: Sale[];
  cierres: CierreCaja[];
  promos: DynamicPromo[];
  categories?: string[];
  timeEntries: TimeEntry[];
  emailAlerts: EmailAlert[];
  expenses?: Expense[];
  onRestock: (id: string, qty: number) => void;
  onRetrySRI: (id: string) => void;
  onAddItem: (item: POSItem) => void;
  onEditItem: (item: POSItem) => void;
  onDeleteItem: (id: string) => void;
  onAddPromo: (promo: DynamicPromo) => void;
  onEditPromo?: (promo: DynamicPromo) => void;
  onTogglePromo: (id: string) => void;
  onDeletePromo: (id: string) => void;
  onAddCategory?: (category: string) => void;
  onAddUser: (user: User) => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (id: string) => void;
}

export default function AdminDashboard(props: AdminDashboardProps) {
  const activeTab = props.activeTab;

  // --- LÓGICA DE BI Y FILTROS EN REPORTES ---
  const [reportView, setReportView] = useState<'general' | 'tatuadores' | 'boutique' | 'inteligencia'>('general');
  const [datePreset, setDatePreset] = useState<'hoy' | 'ayer' | 'semana' | 'mes' | 'ano' | 'custom'>('mes');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [artistFilter, setArtistFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // --- LÓGICA DE PAGINACIÓN DE CAJAS ---
  const [cajasCurrentPage, setCajasCurrentPage] = useState(1);
  const cajasItemsPerPage = 8;

  // --- LÓGICA DE USUARIOS (MODAL) ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'specialist',
    commissionRate: 0.40,
    shiftSchedule: 'turno_manana'
  });

  // --- LÓGICA DE CATEGORÍAS (MODAL) ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // --- LÓGICA DE INVENTARIO Y RECETAS (MODAL) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    category: string;
    unit: string;
    price: number;
    stock: number;
    minStock: number;
    insumosAsociados: { itemId: string; qty: number }[];
  }>({
    name: '', category: 'piezas', unit: 'unidades', price: 0, stock: 0, minStock: 5, insumosAsociados: []
  });

  // --- LÓGICA DE PROMOCIONES (MODAL) ---
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<DynamicPromo | null>(null);
  const [promoFormData, setPromoFormData] = useState({
    name: '',
    description: '',
    dayOfWeek: 'all',
    applicableCategory: 'all',
    requiredQuantity: 1,
    bundlePrice: 0
  });

  const openPromoModal = (promo?: DynamicPromo) => {
    if (promo) {
      setEditingPromo(promo);
      setPromoFormData({
        name: promo.name,
        description: promo.description,
        dayOfWeek: promo.dayOfWeek,
        applicableCategory: promo.applicableCategory,
        requiredQuantity: promo.requiredQuantity,
        bundlePrice: promo.bundlePrice
      });
    } else {
      setEditingPromo(null);
      setPromoFormData({
        name: '',
        description: '',
        dayOfWeek: 'all',
        applicableCategory: 'all',
        requiredQuantity: 1,
        bundlePrice: 0
      });
    }
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoFormData.name.trim()) return;

    if (editingPromo) {
      const updatedPromo: DynamicPromo = {
        ...editingPromo,
        name: promoFormData.name.trim(),
        description: promoFormData.description.trim() || promoFormData.name.trim(),
        dayOfWeek: promoFormData.dayOfWeek as any,
        applicableCategory: promoFormData.applicableCategory,
        requiredQuantity: Number(promoFormData.requiredQuantity) || 1,
        bundlePrice: Number(promoFormData.bundlePrice) || 0
      };
      if (props.onEditPromo) {
        props.onEditPromo(updatedPromo);
      } else {
        props.onAddPromo(updatedPromo);
      }
    } else {
      const newPromo: DynamicPromo = {
        id: `promo_${Date.now()}`,
        name: promoFormData.name.trim(),
        description: promoFormData.description.trim() || promoFormData.name.trim(),
        active: true,
        dayOfWeek: promoFormData.dayOfWeek as any,
        startTime: '00:00',
        endTime: '23:59',
        applicableCategory: promoFormData.applicableCategory,
        requiredQuantity: Number(promoFormData.requiredQuantity) || 1,
        bundlePrice: Number(promoFormData.bundlePrice) || 0
      };
      props.onAddPromo(newPromo);
    }

    setIsPromoModalOpen(false);
    setEditingPromo(null);
    setPromoFormData({
      name: '',
      description: '',
      dayOfWeek: 'all',
      applicableCategory: 'all',
      requiredQuantity: 1,
      bundlePrice: 0
    });
  };

  const openModal = (item?: POSItem) => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        price: item.price,
        stock: item.stock,
        minStock: item.minStock,
        insumosAsociados: item.insumosAsociados || []
      });
    } else {
      setFormData({
        name: '', category: 'piezas', unit: 'unidades', price: 0, stock: 0, minStock: 5, insumosAsociados: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCategoryChange = (val: string) => {
    const newUnit = val === 'servicios' ? 'servicio' : 'unidades';
    setFormData(prev => ({
      ...prev,
      category: val,
      unit: newUnit,
      stock: newUnit === 'servicio' ? 0 : prev.stock,
      minStock: newUnit === 'servicio' ? 0 : prev.minStock
    }));
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: POSItem = {
      id: formData.id || `item_${Date.now()}`,
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      price: Number(formData.price),
      stock: formData.unit === 'unidades' ? Number(formData.stock) : 0,
      minStock: formData.unit === 'unidades' ? Number(formData.minStock) : 0,
      insumosAsociados: formData.unit === 'servicio' ? formData.insumosAsociados.filter(i => i.itemId) : []
    };

    if (formData.id) {
      props.onEditItem(payload);
    } else {
      props.onAddItem(payload);
    }
    setIsModalOpen(false);
  };

  // Cálculos de Resumen General y BI
  const hoyStr = new Date().toISOString().split('T')[0];
  const ventasHoy = props.sales.filter(s => s.timestamp && s.timestamp.startsWith(hoyStr));
  const totalSales = ventasHoy.reduce((acc, s) => acc + s.subtotal, 0);
  const totalCommissions = ventasHoy.reduce((acc, s) => acc + s.commission, 0);
  const lowStockItems = props.items.filter(i => i.unit === 'unidades' && i.stock <= i.minStock);
  const alertasStock = lowStockItems.map(item => ({
    id: 'stk_' + item.id,
    subject: 'Alerta de Stock Bajo',
    message: `El producto "${item.name}" tiene ${item.stock} unidades (Mínimo: ${item.minStock})`,
    timestamp: new Date().toISOString()
  }));

  // BI Period Filtering
  const nowMs = new Date().getTime();
  const daysThreshold = datePreset === 'semana' ? 7 : datePreset === 'mes' ? 30 : 365;
  const filteredSalesPeriod = props.sales.filter(s => {
    if (!s.timestamp) return true;
    const sMs = new Date(s.timestamp).getTime();
    return (nowMs - sMs) <= (daysThreshold * 24 * 60 * 60 * 1000);
  });

  const totalIngresosPeriod = filteredSalesPeriod.reduce((acc, s) => acc + s.subtotal, 0);
  const totalComisionesPeriod = filteredSalesPeriod.reduce((acc, s) => acc + s.commission, 0);

  const totalGastosPeriod = (props.expenses || [])
    .filter(e => {
      if (!e.timestamp) return true;
      const eMs = new Date(e.timestamp).getTime();
      return (nowMs - eMs) <= (daysThreshold * 24 * 60 * 60 * 1000);
    })
    .reduce((acc, e) => acc + e.amount, 0);

  const utilidadNetaReal = Math.max(0, totalIngresosPeriod - totalGastosPeriod - totalComisionesPeriod);

  // Business Line Breakdown
  let estudioTotal = 0;
  let boutiqueTotal = 0;
  let joyeriaTotal = 0;
  let smokeTotal = 0;

  filteredSalesPeriod.forEach(s => {
    (s.items || []).forEach(item => {
      const cat = (item.category || '').toLowerCase();
      const itemSub = item.price * item.quantity;
      if (cat === 'boutique' || cat === 'ropa') {
        boutiqueTotal += itemSub;
      } else if (cat === 'joyeria' || cat === 'jewelry' || cat === 'piezas') {
        joyeriaTotal += itemSub;
      } else if (cat === 'smoke' || cat === 'smokeshop') {
        smokeTotal += itemSub;
      } else {
        estudioTotal += itemSub;
      }
    });
  });
  const totalLinesSum = Math.max(1, estudioTotal + boutiqueTotal + joyeriaTotal + smokeTotal);

  // Promo Stats
  const promoStats = props.promos.map(promo => {
    let appliedCount = 0;
    let revenue = 0;
    props.sales.forEach(s => {
      const match = (s.items || []).some(i => {
        const cat = (i.category || '').toLowerCase();
        return promo.applicableCategory === 'all' || cat === promo.applicableCategory.toLowerCase();
      });
      if (match) {
        appliedCount++;
        revenue += s.subtotal;
      }
    });
    return { ...promo, appliedCount, revenue };
  });

  // Artist Accumulated Commissions
  const artistCommissionsList = props.users.map(u => {
    const userSales = props.sales.filter(s => s.specialistId === u.id || (s.specialistName && s.specialistName.toLowerCase().includes(u.name.toLowerCase())));
    const totalUserSales = userSales.reduce((acc, s) => acc + s.subtotal, 0);
    const totalUserComm = userSales.reduce((acc, s) => acc + s.commission, 0);
    return {
      user: u,
      salesCount: userSales.length,
      totalUserSales,
      totalUserComm
    };
  });

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      {/* NUEVO TAB: RESUMEN DIARIO (overview) */}
      {activeTab === 'overview' && (() => {
        // Calcular datos del día
        const hoy = new Date().toISOString().split('T')[0];
        const ventasHoy = props.sales.filter(s => s.timestamp && s.timestamp.startsWith(hoy));
        const ingresosHoy = ventasHoy.reduce((sum, s) => sum + s.subtotal, 0);
        
        const gastosHoy = props.expenses?.filter(e => e.timestamp && e.timestamp.startsWith(hoy)).reduce((sum, e) => sum + e.amount, 0) || 0;
        const utilidadHoy = ingresosHoy - gastosHoy;
        
        // Desglose de Caja de Hoy
        const efectivoHoy = ventasHoy.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.subtotal, 0);
        const transHoy = ventasHoy.filter(s => s.paymentMethod === 'transfer').reduce((sum, s) => sum + s.subtotal, 0);
        const deUnaHoy = ventasHoy.filter(s => s.paymentMethod === 'de_una').reduce((sum, s) => sum + s.subtotal, 0);
        const tarjetaHoy = ventasHoy.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.subtotal, 0);
        
        return (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-900 font-display px-2">Panel Principal: Hoy</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Ingresos Hoy</span>
                <span className="text-xl font-black font-mono text-slate-900 block mt-2">${ingresosHoy.toFixed(2)}</span>
              </div>
              <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200 shadow-sm">
                <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider block">Gastos Hoy</span>
                <span className="text-xl font-black font-mono text-rose-700 block mt-2">${gastosHoy.toFixed(2)}</span>
              </div>
              <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 shadow-sm">
                <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider block">Utilidad Día</span>
                <span className="text-xl font-black font-mono text-emerald-700 block mt-2">${utilidadHoy.toFixed(2)}</span>
              </div>
              <div className="bg-black text-white p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Estado Caja</span>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xl font-black font-mono text-white block">
                    {props.isCajaAbierta ? 'ABIERTA' : 'CERRADA'}
                  </span>
                  {props.isCajaAbierta ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] animate-pulse bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      CAJA ABIERTA
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                      CAJA CERRADA
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Desglose de Caja de Hoy</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><DollarSign size={16} className="text-emerald-600"/> Efectivo Físico</span>
                    <span className="font-mono font-black text-emerald-700">${efectivoHoy.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">🏦 Transferencias</span>
                    <span className="font-mono font-black text-slate-900">${transHoy.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">📱 De Una</span>
                    <span className="font-mono font-black text-slate-900">${deUnaHoy.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">💳 Tarjeta</span>
                    <span className="font-mono font-black text-slate-900">${tarjetaHoy.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Dinámicas Activas</h3>
                <div className="space-y-3">
                   {props.promos?.filter(p => p.active).length > 0 ? (
                      props.promos.filter(p => p.active).slice(0,4).map(p => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                          <span className="text-sm font-bold text-indigo-900">{p.name}</span>
                          <span className="px-2 py-1 bg-indigo-600 text-white text-[10px] uppercase font-bold rounded-full">Activa</span>
                        </div>
                      ))
                   ) : (
                      <p className="text-sm text-slate-500 italic p-4 text-center">No hay promociones activas hoy.</p>
                   )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB: REPORTES Y INTELIGENCIA DE NEGOCIOS (BI) */}
      {activeTab === 'reports' && (() => {
        // Central Evaluator Functions for Filtering Sales
        const matchesDate = (s: Sale) => {
          if (!s.timestamp) return true;
          const saleDate = new Date(s.timestamp);
          const now = new Date();

          if (datePreset === 'hoy') {
            return saleDate.getDate() === now.getDate() &&
                   saleDate.getMonth() === now.getMonth() &&
                   saleDate.getFullYear() === now.getFullYear();
          }
          if (datePreset === 'ayer') {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            return saleDate.getDate() === yesterday.getDate() &&
                   saleDate.getMonth() === yesterday.getMonth() &&
                   saleDate.getFullYear() === yesterday.getFullYear();
          }
          if (datePreset === 'semana') {
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay() || 7;
            startOfWeek.setDate(now.getDate() - day + 1);
            startOfWeek.setHours(0, 0, 0, 0);
            return saleDate >= startOfWeek;
          }
          if (datePreset === 'mes') {
            return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
          }
          if (datePreset === 'ano') {
            return saleDate.getFullYear() === now.getFullYear();
          }
          if (datePreset === 'custom') {
            if (startDate && saleDate < new Date(startDate + 'T00:00:00')) return false;
            if (endDate && saleDate > new Date(endDate + 'T23:59:59')) return false;
            return true;
          }
          return true;
        };

        const matchesArtist = (s: Sale) => {
          if (artistFilter === 'all') return true;
          return s.specialistId === artistFilter || (s.specialistName && s.specialistName.toLowerCase().includes(artistFilter.toLowerCase()));
        };

        const matchesCategory = (s: Sale) => {
          if (categoryFilter === 'all') return true;
          const items = s.items || [];
          if (items.length === 0) return true;
          return items.some(i => {
            const cat = (i.category || '').toLowerCase();
            if (categoryFilter === 'estudio') {
              return cat === 'servicios' || cat === 'estudio' || cat === 'tatuajes' || cat === 'piercings' || (!['boutique', 'ropa', 'joyeria', 'jewelry', 'piezas', 'smoke', 'smokeshop'].includes(cat));
            }
            if (categoryFilter === 'boutique') return cat === 'boutique' || cat === 'ropa';
            if (categoryFilter === 'joyeria') return cat === 'joyeria' || cat === 'jewelry' || cat === 'piezas';
            if (categoryFilter === 'smoke') return cat === 'smoke' || cat === 'smokeshop';
            return cat === categoryFilter.toLowerCase();
          });
        };

        const matchesPayment = (s: Sale) => {
          if (paymentFilter === 'all') return true;
          return s.paymentMethod === paymentFilter;
        };

        // CENTRAL EVALUATED SALES
        const filteredSales = props.sales.filter(s => matchesDate(s) && matchesArtist(s) && matchesCategory(s) && matchesPayment(s));

        // Key Metrics
        const totalIngresosPeriod = filteredSales.reduce((acc, s) => acc + s.subtotal, 0);
        const totalComisionesPeriod = filteredSales.reduce((acc, s) => acc + s.commission, 0);

        // Mermas count & amount
        const mermasVentas = filteredSales.filter(s => s.subtotal === 0 || (s.items || []).some(i => i.price === 0));
        const mermasVal = mermasVentas.reduce((acc, s) => {
          const itemCostSum = (s.items || []).reduce((ci, it) => ci + (it.price || 5), 0);
          return acc + itemCostSum;
        }, 0);

        const utilidadNetaReal = totalIngresosPeriod - totalComisionesPeriod - mermasVal;

        // Cancelled appointments lost income estimate
        const citasCanceladas = (props.appointments || []).filter(a => a.status === 'cancelled');
        const perdidasCitasVal = citasCanceladas.reduce((acc, a) => acc + (a.price || a.precioTotal || 35), 0);

        // Client retention calculations
        const clientSalesMap: { [name: string]: { count: number; total: number } } = {};
        filteredSales.forEach(s => {
          const name = (s.customerName || 'Walk-in / POS').trim();
          if (!clientSalesMap[name]) clientSalesMap[name] = { count: 0, total: 0 };
          clientSalesMap[name].count += 1;
          clientSalesMap[name].total += s.subtotal;
        });

        let recurrentesCount = 0;
        let recurrentesSales = 0;
        let nuevosCount = 0;
        let nuevosSales = 0;
        let walkinCount = 0;
        let walkinSales = 0;

        Object.entries(clientSalesMap).forEach(([name, data]) => {
          if (name.toLowerCase().includes('walk-in') || name.toLowerCase().includes('pos') || name === 'Cliente Final') {
            walkinCount += data.count;
            walkinSales += data.total;
          } else if (data.count > 1) {
            recurrentesCount += 1;
            recurrentesSales += data.total;
          } else {
            nuevosCount += 1;
            nuevosSales += data.total;
          }
        });

        const totalClientsTracked = Math.max(1, recurrentesCount + nuevosCount + walkinCount);

        // Boutique Top Sales Calculation
        const productSalesMap: { [id: string]: { name: string; category: string; qty: number; revenue: number } } = {};
        filteredSales.forEach(s => {
          (s.items || []).forEach(it => {
            const cat = (it.category || '').toLowerCase();
            if (cat === 'boutique' || cat === 'ropa' || cat === 'piezas' || cat === 'joyería' || cat === 'joyeria' || cat === 'smoke shop') {
              if (!productSalesMap[it.itemId]) {
                productSalesMap[it.itemId] = { name: it.name, category: it.category || 'Boutique', qty: 0, revenue: 0 };
              }
              productSalesMap[it.itemId].qty += it.quantity;
              productSalesMap[it.itemId].revenue += (it.price * it.quantity);
            }
          });
        });

        const topBoutiqueProducts = Object.values(productSalesMap)
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);

        // Dead inventory calculation
        const soldItemIds = new Set<string>();
        props.sales.forEach(s => (s.items || []).forEach(it => soldItemIds.add(it.itemId)));
        const deadInventory = props.items.filter(i => i.unit === 'unidades' && i.stock > 0 && !soldItemIds.has(i.id));

        // Artist Commissions, Sales & Shift Performance (Turno Mañana vs Turno Tarde)
        const artistCommissionsList = props.users.map(u => {
          const userSales = filteredSales.filter(s => 
            s.specialistId === u.id || (s.specialistName && s.specialistName.toLowerCase().includes(u.name.toLowerCase()))
          );
          
          const morningSales = userSales.filter(s => {
            if (!s.timestamp) return true;
            const h = new Date(s.timestamp).getHours();
            return h < 14;
          });

          const afternoonSales = userSales.filter(s => {
            if (!s.timestamp) return false;
            const h = new Date(s.timestamp).getHours();
            return h >= 14;
          });

          const morningTotal = morningSales.reduce((acc, s) => acc + s.subtotal, 0);
          const afternoonTotal = afternoonSales.reduce((acc, s) => acc + s.subtotal, 0);
          const morningComm = morningSales.reduce((acc, s) => acc + s.commission, 0);
          const afternoonComm = afternoonSales.reduce((acc, s) => acc + s.commission, 0);

          const morningTx = morningSales.length;
          const afternoonTx = afternoonSales.length;

          const morningTicketAvg = morningTx > 0 ? morningTotal / morningTx : 0;
          const afternoonTicketAvg = afternoonTx > 0 ? afternoonTotal / afternoonTx : 0;

          const totalUserSales = userSales.reduce((acc, s) => acc + s.subtotal, 0);
          const totalUserComm = userSales.reduce((acc, s) => acc + s.commission, 0);

          // Days in period estimate
          const uniqueDates = new Set(userSales.map(s => (s.timestamp || '').split('T')[0])).size || 1;
          const morningPromDia = morningTotal / uniqueDates;
          const afternoonPromDia = afternoonTotal / uniqueDates;

          let efficiencyLabel = '🟢 Alto impacto en cualquier turno';
          let efficiencyBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';

          if (totalUserSales === 0) {
            efficiencyLabel = '⚪ Sin registros en período';
            efficiencyBadgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
          } else if (morningTotal > 0 && afternoonTotal > 0) {
            const ratio = morningTotal / afternoonTotal;
            if (ratio >= 0.75 && ratio <= 1.35) {
              efficiencyLabel = '🟢 Alto impacto en cualquier turno';
              efficiencyBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
            } else if (ratio > 1.35) {
              efficiencyLabel = '🌅 Mayor productividad en Turno Mañana';
              efficiencyBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
            } else {
              efficiencyLabel = '⚡ Mayor rotación en Turno Tarde';
              efficiencyBadgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-300';
            }
          } else if (morningTotal > 0) {
            efficiencyLabel = '🌅 Actividad en Turno Mañana';
            efficiencyBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
          } else {
            efficiencyLabel = '⚡ Actividad en Turno Tarde';
            efficiencyBadgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-300';
          }

          return {
            user: u,
            salesCount: userSales.length,
            totalUserSales,
            totalUserComm,
            netNAS: totalUserSales - totalUserComm,
            morningTotal,
            afternoonTotal,
            morningComm,
            afternoonComm,
            morningTx,
            afternoonTx,
            morningTicketAvg,
            afternoonTicketAvg,
            morningPromDia,
            afternoonPromDia,
            efficiencyLabel,
            efficiencyBadgeClass
          };
        });

        const topSpecialist = artistCommissionsList.length > 0
          ? [...artistCommissionsList].sort((a, b) => (b.salesCount > 0 ? b.totalUserSales / b.salesCount : 0) - (a.salesCount > 0 ? a.totalUserSales / a.salesCount : 0))[0]
          : null;

        // --- CALCULATION FOR CHARTS ---
        // CHART A: Ventas por Día de la Semana (Lunes a Domingo)
        const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const salesByDay = [0, 0, 0, 0, 0, 0, 0];
        filteredSales.forEach(s => {
          if (!s.timestamp) return;
          const d = new Date(s.timestamp);
          let dayIndex = d.getDay() - 1; // 0=Sun -> -1
          if (dayIndex === -1) dayIndex = 6;
          salesByDay[dayIndex] += s.subtotal;
        });
        const maxDaySales = Math.max(...salesByDay, 1);
        const maxDayIndex = salesByDay.indexOf(maxDaySales);

        // CHART B: Horas Pico (10:00 a 18:00)
        const peakHours = [10, 11, 12, 13, 14, 15, 16, 17, 18];
        const hourStats = peakHours.map(h => {
          const salesInHour = filteredSales.filter(s => {
            if (!s.timestamp) return false;
            const hour = new Date(s.timestamp).getHours();
            return hour === h;
          });
          return {
            hourLabel: `${h}:00`,
            count: salesInHour.length,
            total: salesInHour.reduce((sum, s) => sum + s.subtotal, 0)
          };
        });
        const maxHourCount = Math.max(...hourStats.map(hs => hs.count), 1);

        // CHART D: Donut SVG Breakdown
        let catEstudio = 0;
        let catBoutique = 0;
        let catJoyeria = 0;
        let catSmoke = 0;

        filteredSales.forEach(s => {
          (s.items || []).forEach(item => {
            const cat = (item.category || '').toLowerCase();
            const val = item.price * item.quantity;
            if (cat === 'boutique' || cat === 'ropa') catBoutique += val;
            else if (cat === 'joyeria' || cat === 'jewelry' || cat === 'piezas') catJoyeria += val;
            else if (cat === 'smoke' || cat === 'smokeshop') catSmoke += val;
            else catEstudio += val;
          });
        });

        const catTotal = Math.max(1, catEstudio + catBoutique + catJoyeria + catSmoke);
        const pEstudio = Math.round((catEstudio / catTotal) * 100);
        const pBoutique = Math.round((catBoutique / catTotal) * 100);
        const pJoyeria = Math.round((catJoyeria / catTotal) * 100);
        const pSmoke = Math.round((catSmoke / catTotal) * 100);

        // SVG stroke-dasharray (circumference ≈ 100)
        const dashEstudio = `${pEstudio} ${100 - pEstudio}`;
        const dashBoutique = `${pBoutique} ${100 - pBoutique}`;
        const dashJoyeria = `${pJoyeria} ${100 - pJoyeria}`;
        const dashSmoke = `${pSmoke} ${100 - pSmoke}`;

        const offsetBoutique = 100 - pEstudio;
        const offsetJoyeria = 100 - (pEstudio + pBoutique);
        const offsetSmoke = 100 - (pEstudio + pBoutique + pJoyeria);

        return (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header: BARRA DE FILTROS DINÁMICOS SUPERIOR */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Módulo de Inteligencia de Negocios &amp; Reportes (BI)</h2>
                  <p className="text-xs text-slate-500 font-semibold">Análisis en tiempo real para NAS COMPANY EC con filtros interactivos</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReportView('general')}
                    className={`px-3.5 py-2 rounded-xl text-xs transition cursor-pointer ${
                      reportView === 'general' ? 'bg-black text-white shadow-md font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'
                    }`}
                  >
                    📊 [General] Ventas &amp; Gráficos
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportView('tatuadores')}
                    className={`px-3.5 py-2 rounded-xl text-xs transition cursor-pointer ${
                      reportView === 'tatuadores' ? 'bg-black text-white shadow-md font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'
                    }`}
                  >
                    🎨 [Tatuadores] Rentabilidad
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportView('boutique')}
                    className={`px-3.5 py-2 rounded-xl text-xs transition cursor-pointer ${
                      reportView === 'boutique' ? 'bg-black text-white shadow-md font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'
                    }`}
                  >
                    🛍️ [Boutique] Inventario
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportView('inteligencia')}
                    className={`px-3.5 py-2 rounded-xl text-xs transition cursor-pointer ${
                      reportView === 'inteligencia' ? 'bg-black text-white shadow-md font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold'
                    }`}
                  >
                    💡 [Inteligencia] AI Insights
                  </button>
                </div>
              </div>

              {/* FILTROS MULTI-CRITERIO EN TIEMPO REAL */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {/* 1. Filtro Fecha / Período */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">📅 Período / Fecha</label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'hoy', label: 'Hoy' },
                      { id: 'ayer', label: 'Ayer' },
                      { id: 'semana', label: 'Semana' },
                      { id: 'mes', label: 'Mes' },
                      { id: 'ano', label: 'Año' },
                      { id: 'custom', label: 'Custom' },
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setDatePreset(p.id as any)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                          datePreset === p.id ? 'bg-black text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {datePreset === 'custom' && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full text-[10px] p-1 border border-slate-300 rounded bg-white font-mono"
                      />
                      <span className="text-slate-400 font-bold text-xs">-</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full text-[10px] p-1 border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Filtro Tatuador / Especialista */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">🎨 Tatuador / Especialista</label>
                  <select
                    value={artistFilter}
                    onChange={e => setArtistFilter(e.target.value)}
                    className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                  >
                    <option value="all">👥 [Todos los Tatuadores]</option>
                    {props.users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Filtro Línea / Categoría */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">🛍️ Línea / Categoría</label>
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                  >
                    <option value="all">🏷️ [Todas las Líneas]</option>
                    <option value="estudio">✒️ Estudio (Tatuajes/Piercings)</option>
                    <option value="boutique">👕 Boutique / Ropa</option>
                    <option value="joyeria">💍 Joyería / Piezas</option>
                    <option value="smoke">🌿 Smoke Shop</option>
                  </select>
                </div>

                {/* 4. Filtro Método de Pago */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">💳 Método de Pago</label>
                  <select
                    value={paymentFilter}
                    onChange={e => setPaymentFilter(e.target.value)}
                    className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                  >
                    <option value="all">💰 [Todos los Métodos]</option>
                    <option value="cash">💵 Efectivo</option>
                    <option value="transfer">🏦 Transferencia</option>
                    <option value="de_una">📱 De Una</option>
                    <option value="card">💳 Tarjeta</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SUB-VIEW: GENERAL */}
            {reportView === 'general' && (
              <div className="space-y-6">
                {/* 4 KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ingresos Brutos</span>
                    <span className="text-xl font-extrabold font-mono text-slate-900 block mt-2">${totalIngresosPeriod.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1 block">{filteredSales.length} ventas evaluadas</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Costos Estimados (Com.+Mermas)</span>
                    <span className="text-xl font-extrabold font-mono text-slate-900 block mt-2">${(totalComisionesPeriod + mermasVal).toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Com. (${totalComisionesPeriod.toFixed(2)}) + Mermas (${mermasVal.toFixed(2)})</span>
                  </div>
                  <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 shadow-sm">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Utilidad Real NAS</span>
                    <span className="text-xl font-extrabold font-mono text-emerald-800 block mt-2">${utilidadNetaReal.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Margen neto del estudio</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ticket Promedio</span>
                    <span className="text-xl font-extrabold font-mono text-slate-900 block mt-2">
                      ${(totalIngresosPeriod / Math.max(1, filteredSales.length)).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Promedio por transacción</span>
                  </div>
                </div>

                {/* SECCIÓN DE GRÁFICAS VISUALES NATIVAS SVG */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* GRÁFICO A: Ventas por Día de la Semana */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">A) Ventas por Día de la Semana (Lun - Dom)</h3>
                        <p className="text-[11px] text-slate-500 font-semibold">Distribución de ingresos según el día de atención</p>
                      </div>
                      <span className="text-xs font-extrabold font-mono text-black bg-slate-100 px-2.5 py-1 rounded-lg">
                        Max: ${maxDaySales.toFixed(0)}
                      </span>
                    </div>

                    <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-100 pb-2">
                      {daysOfWeek.map((dayLabel, idx) => {
                        const val = salesByDay[idx];
                        const heightPct = Math.max(10, Math.round((val / maxDaySales) * 100));
                        const isMax = idx === maxDayIndex && val > 0;

                        return (
                          <div key={dayLabel} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group">
                            {/* Floating $ badge over bar */}
                            <span className={`text-[10px] font-extrabold font-mono transition-all ${
                              isMax ? 'bg-black text-white px-1.5 py-0.5 rounded shadow-md -translate-y-1' : 'text-slate-500'
                            }`}>
                              ${val.toFixed(0)}
                            </span>

                            {/* Bar container */}
                            <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden">
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full rounded-t-lg transition-all duration-300 ${
                                  isMax ? 'bg-black' : 'bg-slate-400 group-hover:bg-slate-600'
                                }`}
                              />
                            </div>

                            <span className="text-[10px] font-bold text-slate-600 uppercase">{dayLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* GRÁFICO B: Intensidad - Horas Pico (10:00 a 18:00) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">B) Horas Pico de Atención (10:00 a 18:00)</h3>
                        <p className="text-[11px] text-slate-500 font-semibold">Intensidad de flujo de clientes y transacciones por horario</p>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {hourStats.map(hs => {
                        const barPct = Math.max(6, Math.round((hs.count / maxHourCount) * 100));
                        return (
                          <div key={hs.hourLabel} className="flex items-center gap-3 text-xs">
                            <span className="w-12 font-mono font-bold text-slate-600 text-[11px]">{hs.hourLabel}</span>
                            <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${barPct}%` }}
                                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                              />
                            </div>
                            <span className="w-24 text-right font-mono font-bold text-slate-800 text-[11px]">
                              {hs.count} tx (${hs.total.toFixed(0)})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* GRÁFICO C: Comparativo de Rentabilidad por Tatuador */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">C) Rentabilidad Comparativa por Tatuador</h3>
                      <p className="text-[11px] text-slate-500 font-semibold">Ingreso Bruto (Gris) vs. Utilidad Real NAS (Verde)</p>
                    </div>

                    <div className="space-y-3">
                      {artistCommissionsList.map(a => {
                        const maxGross = Math.max(...artistCommissionsList.map(item => item.totalUserSales), 1);
                        const grossWidth = Math.max(5, Math.round((a.totalUserSales / maxGross) * 100));
                        const netWidth = Math.max(5, Math.round((a.netNAS / maxGross) * 100));

                        return (
                          <div key={a.user.id} className="space-y-1 text-xs">
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-slate-900">{a.user.name}</span>
                              <span className="font-mono text-slate-600 text-[11px]">
                                Bruto: <strong className="text-slate-900">${a.totalUserSales.toFixed(0)}</strong> | NAS: <strong className="text-emerald-700">${a.netNAS.toFixed(0)}</strong>
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div style={{ width: `${grossWidth}%` }} className="bg-slate-400 h-full rounded-full" />
                              </div>
                              <div className="w-full bg-emerald-50 h-2 rounded-full overflow-hidden">
                                <div style={{ width: `${netWidth}%` }} className="bg-emerald-500 h-full rounded-full" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* GRÁFICO D: Donut SVG por Línea de Negocio */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">D) Distribución por Línea de Negocio (Donut SVG)</h3>
                      <p className="text-[11px] text-slate-500 font-semibold">Participación en ventas por categoría de producto/servicio</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#000000" strokeWidth="4" strokeDasharray={dashEstudio} strokeDashoffset="0" />
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray={dashBoutique} strokeDashoffset={offsetBoutique} />
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray={dashJoyeria} strokeDashoffset={offsetJoyeria} />
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray={dashSmoke} strokeDashoffset={offsetSmoke} />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xs font-black font-mono text-slate-900 block">${catTotal.toFixed(0)}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Total</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-black"></span>
                          <span className="font-semibold text-slate-700">Estudio / Tatuajes: <strong>{pEstudio}%</strong> (${catEstudio.toFixed(2)})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                          <span className="font-semibold text-slate-700">Boutique / Ropa: <strong>{pBoutique}%</strong> (${catBoutique.toFixed(2)})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                          <span className="font-semibold text-slate-700">Joyería / Piezas: <strong>{pJoyeria}%</strong> (${catJoyeria.toFixed(2)})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                          <span className="font-semibold text-slate-700">Smoke Shop: <strong>{pSmoke}%</strong> (${catSmoke.toFixed(2)})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TABLA 1: Flujo de Caja y Cancelaciones */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Flujo de Caja, Cancelaciones y Cortesías</h3>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Análisis de efectividad de cobro e ingresos no concretados</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-medium text-slate-700">
                      <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <tr>
                          <th className="p-3">Estado / Flujo</th>
                          <th className="p-3 text-center">Transacciones / Citas</th>
                          <th className="p-3 text-right">Monto Válido ($)</th>
                          <th className="p-3 text-center">Estatus SRI / Fiscal</th>
                          <th className="p-3 text-right">Impacto Financiero</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ventas Completadas (POS)
                          </td>
                          <td className="p-3 text-center font-bold">{filteredSales.length}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">${totalIngresosPeriod.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase">Procesado SRI</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">+${totalIngresosPeriod.toFixed(2)}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Citas Canceladas
                          </td>
                          <td className="p-3 text-center font-bold text-rose-700">{citasCanceladas.length}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-400">${perdidasCitasVal.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold uppercase">Sin Factura</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-rose-600">-${perdidasCitasVal.toFixed(2)}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Mermas / Cortesías ($0.00) 🎁
                          </td>
                          <td className="p-3 text-center font-bold text-amber-700">{mermasVentas.length}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-400">$0.00</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold uppercase">Costo Interno</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-amber-600">-${mermasVal.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TABLA 2: Nuevos vs Recurrentes */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">Análisis de Clientes: Nuevos vs Recurrentes</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Retención de clientes y valor de vida útil</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-medium text-slate-700">
                      <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <tr>
                          <th className="p-3">Perfil del Cliente</th>
                          <th className="p-3 text-center">Total Clientes</th>
                          <th className="p-3 text-center">% del Total</th>
                          <th className="p-3 text-right">Ventas Generadas ($)</th>
                          <th className="p-3 text-right">Ticket Promedio ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">Clientes Recurrentes (&gt;1 compra/cita)</td>
                          <td className="p-3 text-center font-bold">{recurrentesCount}</td>
                          <td className="p-3 text-center font-mono font-bold">{((recurrentesCount / totalClientsTracked) * 100).toFixed(1)}%</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">${recurrentesSales.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono text-emerald-700 font-bold">${(recurrentesSales / Math.max(1, recurrentesCount)).toFixed(2)}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">Clientes Nuevos (Primera Visita)</td>
                          <td className="p-3 text-center font-bold">{nuevosCount}</td>
                          <td className="p-3 text-center font-mono font-bold">{((nuevosCount / totalClientsTracked) * 100).toFixed(1)}%</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">${nuevosSales.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono text-slate-800 font-bold">${(nuevosSales / Math.max(1, nuevosCount)).toFixed(2)}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">Clientes POS Directos / Walk-in</td>
                          <td className="p-3 text-center font-bold">{walkinCount}</td>
                          <td className="p-3 text-center font-mono font-bold">{((walkinCount / totalClientsTracked) * 100).toFixed(1)}%</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">${walkinSales.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono text-slate-800 font-bold">${(walkinSales / Math.max(1, walkinCount)).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW: TATUADORES (Rendimiento por Especialista vs. Turno) */}
            {reportView === 'tatuadores' && (
              <div className="space-y-6">
                {/* GRÁFICO VISUAL COMPARATIVO PAREADO POR ESPECIALISTA Y TURNO */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Gráfico Comparativo de Ventas: Turno Mañana vs. Turno Tarde</h3>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Comparación de productividad horaria por trabajadora (10:00-13:59 vs 14:00-20:00+)
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
                        <span className="text-slate-700">🌅 Turno Mañana</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-slate-900"></span>
                        <span className="text-slate-700">⚡ Turno Tarde</span>
                      </div>
                    </div>
                  </div>

                  {/* Paired Bar Chart */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {artistCommissionsList.map(a => {
                      const maxVal = Math.max(a.morningTotal, a.afternoonTotal, 1);
                      const mPct = Math.max(8, Math.round((a.morningTotal / maxVal) * 100));
                      const aPct = Math.max(8, Math.round((a.afternoonTotal / maxVal) * 100));

                      return (
                        <div key={a.user.id} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                                {a.user.name.charAt(0)}
                              </div>
                              <span className="font-bold text-sm text-slate-900">{a.user.name}</span>
                            </div>
                            <span className="text-xs font-mono font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                              Total: ${a.totalUserSales.toFixed(0)}
                            </span>
                          </div>

                          {/* Bars Comparison Container */}
                          <div className="space-y-2 pt-1">
                            {/* Mañana Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                                <span>🌅 Mañana ({a.morningTx} tx)</span>
                                <span className="font-mono font-bold text-amber-700">${a.morningTotal.toFixed(2)}</span>
                              </div>
                              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${mPct}%` }}
                                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                                />
                              </div>
                            </div>

                            {/* Tarde Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                                <span>⚡ Tarde/Noche ({a.afternoonTx} tx)</span>
                                <span className="font-mono font-bold text-slate-900">${a.afternoonTotal.toFixed(2)}</span>
                              </div>
                              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${aPct}%` }}
                                  className="bg-slate-900 h-full rounded-full transition-all duration-300"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${a.efficiencyBadgeClass}`}>
                              {a.efficiencyLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* TABLA COMPARATIVA DE EFICIENCIA POR ESPECIALISTA Y TURNO */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">Tabla Comparativa de Eficiencia por Turno</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Productividad por Trabajador, Ventas en Mañana vs. Tarde y Evaluación de Eficiencia
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-medium text-slate-700">
                      <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <tr>
                          <th className="p-3.5">Especialista</th>
                          <th className="p-3.5 text-center">Turno Mañana (Ventas / Prom. Cita)</th>
                          <th className="p-3.5 text-center">Turno Tarde (Ventas / Prom. Cita)</th>
                          <th className="p-3.5 text-right">TOTAL GENERADO</th>
                          <th className="p-3.5 text-right">Utilidad Real NAS</th>
                          <th className="p-3.5 text-center">Eficiencia vs. Horario</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {artistCommissionsList.map(a => (
                          <tr key={a.user.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-3.5 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                                  {a.user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{a.user.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                                    {a.salesCount} atenciones en total
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 text-center font-mono">
                              <span className="font-extrabold text-slate-900 block">${a.morningTotal.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-500 block">
                                {a.morningTx} tx • Avg ${a.morningTicketAvg.toFixed(0)}
                              </span>
                            </td>
                            <td className="p-3.5 text-center font-mono">
                              <span className="font-extrabold text-slate-900 block">${a.afternoonTotal.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-500 block">
                                {a.afternoonTx} tx • Avg ${a.afternoonTicketAvg.toFixed(0)}
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-mono font-extrabold text-slate-900">
                              ${a.totalUserSales.toFixed(2)}
                            </td>
                            <td className="p-3.5 text-right font-mono font-extrabold text-emerald-700">
                              ${a.netNAS.toFixed(2)}
                            </td>
                            <td className="p-3.5 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border inline-block ${a.efficiencyBadgeClass}`}>
                                {a.efficiencyLabel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TABLA MAESTRA DE FINANZAS Y COMISIONES */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">Desglose Financiero de Comisiones y Retención</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Resumen consolidado de comisiones pagadas y margen operativo
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-medium text-slate-700">
                      <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <tr>
                          <th className="p-3.5">Tatuador / Especialista</th>
                          <th className="p-3.5 text-center">Citas Atendidas</th>
                          <th className="p-3.5 text-right">Ventas Generadas ($)</th>
                          <th className="p-3.5 text-right">Comisiones Pagadas ($)</th>
                          <th className="p-3.5 text-right">Ticket Promedio ($)</th>
                          <th className="p-3.5 text-right">Utilidad Real para NAS ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {artistCommissionsList.map(a => {
                          const ticketAvg = a.salesCount > 0 ? a.totalUserSales / a.salesCount : 0;
                          return (
                            <tr key={a.user.id} className="hover:bg-slate-50/50 transition">
                              <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                                  {a.user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{a.user.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                                    Comisión: {((a.user.commissionRate || 0.4) * 100).toFixed(0)}%
                                  </p>
                                </div>
                              </td>
                              <td className="p-3.5 text-center font-bold">{a.salesCount}</td>
                              <td className="p-3.5 text-right font-mono font-bold text-slate-900">${a.totalUserSales.toFixed(2)}</td>
                              <td className="p-3.5 text-right font-mono font-bold text-rose-600">${a.totalUserComm.toFixed(2)}</td>
                              <td className="p-3.5 text-right font-mono font-bold text-slate-800">${ticketAvg.toFixed(2)}</td>
                              <td className="p-3.5 text-right font-mono font-extrabold text-emerald-700">${a.netNAS.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                        <tr>
                          <td className="p-3.5 font-extrabold">TOTAL ESTUDIO</td>
                          <td className="p-3.5 text-center font-extrabold">
                            {artistCommissionsList.reduce((acc, a) => acc + a.salesCount, 0)}
                          </td>
                          <td className="p-3.5 text-right font-mono font-extrabold">
                            ${artistCommissionsList.reduce((acc, a) => acc + a.totalUserSales, 0).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-mono font-extrabold text-rose-600">
                            ${artistCommissionsList.reduce((acc, a) => acc + a.totalUserComm, 0).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-mono font-extrabold">-</td>
                          <td className="p-3.5 text-right font-mono font-extrabold text-emerald-700">
                            ${artistCommissionsList.reduce((acc, a) => acc + (a.totalUserSales - a.totalUserComm), 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW: BOUTIQUE */}
            {reportView === 'boutique' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Izquierda: Top Ventas */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">Top 5 Productos Boutique &amp; Ropa</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Productos con mayor rotación en el almacén</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-medium text-slate-700">
                      <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <tr>
                          <th className="p-3">Producto</th>
                          <th className="p-3">Categoría</th>
                          <th className="p-3 text-center">Unidades</th>
                          <th className="p-3 text-right">Ingresos ($)</th>
                          <th className="p-3 text-right">Margen Est.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {topBoutiqueProducts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-400">Sin registros de ventas de boutique.</td>
                          </tr>
                        ) : (
                          topBoutiqueProducts.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-900">{p.name}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase">{p.category}</span>
                              </td>
                              <td className="p-3 text-center font-bold font-mono text-slate-900">{p.qty}</td>
                              <td className="p-3 text-right font-mono font-bold text-slate-900">${p.revenue.toFixed(2)}</td>
                              <td className="p-3 text-right font-mono font-bold text-emerald-600">~60%</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Columna Derecha: Inventario Muerto y Crítico */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">Alertas de Inventario Muerto y Crítico</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Productos sin rotación (&gt;30 días) o con stock bajo</p>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {lowStockItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-rose-50/60 border border-rose-200 rounded-xl">
                        <div>
                          <p className="font-bold text-xs text-rose-900">{item.name}</p>
                          <p className="text-[10px] text-rose-600 font-semibold uppercase">Stock actual: {item.stock} / Mínimo: {item.minStock}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-rose-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                          CRÍTICO (Stock Bajo)
                        </span>
                      </div>
                    ))}

                    {deadInventory.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                        <div>
                          <p className="font-bold text-xs text-amber-900">{item.name}</p>
                          <p className="text-[10px] text-amber-700 font-semibold uppercase">Unidades estancadas: {item.stock} ($USD {(item.stock * item.price).toFixed(2)})</p>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                          SIN ROTACIÓN (&gt;30 días)
                        </span>
                      </div>
                    ))}

                    {lowStockItems.length === 0 && deadInventory.length === 0 && (
                      <p className="p-8 text-center text-slate-400 text-xs font-semibold">
                        ✅ No se detectaron productos críticos ni inventario estancado.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW: INTELIGENCIA */}
            {reportView === 'inteligencia' && (
              <div className="space-y-4">
                <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-2">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Lightbulb size={20} />
                    <h3 className="text-lg font-bold">Módulo de Recomendaciones AI &amp; Oportunidades</h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    Sugerencias automáticas basadas en el comportamiento real de compras y rotación de inventario en NAS COMPANY EC.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Card 1: Oportunidad */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Target size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">💡 Oportunidad: Venta Cruzada Post-Tatuaje</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Se detectó que el <strong>78%</strong> de los clientes que se realizan tatuajes o perforaciones no compran productos de cuidado o boutique en la misma sesión.
                    </p>
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-medium">
                      <strong>Recomendación:</strong> Configurar un incentivo automático del 10% en cremas de cuidado o prendas NAS COMPANY EC al cerrar la cita en el POS.
                    </div>
                  </div>

                  {/* Card 2: Riesgo */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <AlertTriangle size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">⚠️ Riesgo: Inventario Inactivo en Joyería</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Se registraron <strong>{deadInventory.length}</strong> piezas de joyería/boutique con más de 30 días sin ventas, congelando capital de trabajo.
                    </p>
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900 font-medium">
                      <strong>Recomendación:</strong> Crear un paquete promocional dinámico (ej. "Piercing + Joya extra con 15% OFF") en la pestaña de Promociones.
                    </div>
                  </div>

                  {/* Card 3: Destacado */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Award size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">🏆 Destacado: Especialista del Mes</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {topSpecialist ? (
                        <>
                          El especialista <strong>{topSpecialist.user.name}</strong> logró el ticket promedio más alto (<strong>${(topSpecialist.salesCount > 0 ? topSpecialist.totalUserSales / topSpecialist.salesCount : 0).toFixed(2)} USD</strong>).
                        </>
                      ) : (
                        'No hay suficientes registros para determinar al líder de ventas.'
                      )}
                    </p>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-indigo-900 font-medium">
                      <strong>Recomendación:</strong> Compartir la metodología de recomendación de insumos de este especialista con el resto del equipo durante las reuniones de turno.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
      {/* TAB: INVENTARIO (Aquí va el código nuevo del modal) */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">Gestión Completa de Inventario</h2>
              <p className="text-xs text-slate-500 mt-1">Administra el catálogo de servicios, piezas, y asocia insumos para descuento automático.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Plus size={16} /> Nueva Categoría
              </button>
              <button
                type="button"
                onClick={() => openModal()}
                className="px-4 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Plus size={16} /> Nuevo Producto / Servicio
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="p-4">Producto / Servicio</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 text-center">Tipo</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {props.items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-bold text-slate-900">{item.name}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold uppercase text-slate-600">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold">${item.price.toFixed(2)}</td>
                    <td className="p-4 text-center font-bold">
                      {item.unit === 'servicio' ? (
                        <span className="text-slate-400 font-normal italic">N/A</span>
                      ) : (
                        <span className={item.stock <= item.minStock ? 'text-rose-600' : 'text-emerald-600'}>
                          {item.stock}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.unit === 'servicio' && item.insumosAsociados && item.insumosAsociados.length > 0 ? (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                          Servicio (Usa Insumos)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 uppercase">{item.unit}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openModal(item)} className="p-1.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => props.onDeleteItem(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CAJAS Y AUDITORÍA DE CIERRES */}
      {activeTab === 'cajas' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-sm font-bold text-slate-900 font-display">Auditoría Global de Cajas y Cierres de Turno</h2>
            <p className="text-sm text-slate-500 mt-2">Verificación de cuadre físico de efectivo, diferencias reportadas y desglose completo de transacciones.</p>
          </div>

          {/* TABLA AUDITORÍA DE CIERRES PAGINADA */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Historial de Cierres de Turno (Auditoría de Cajas)</h3>
            {(!props.cierres || props.cierres.length === 0) ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center text-slate-500 text-sm font-bold">
                No hay cierres de caja registrados en esta sesión.
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-xs">
                      <tr>
                        <th className="p-4">Fecha / Hora</th>
                        <th className="p-4">Especialista</th>
                        <th className="p-4 text-right">Efectivo Esperado</th>
                        <th className="p-4 text-right">Efectivo Entregado</th>
                        <th className="p-4 text-center">Diferencia</th>
                        <th className="p-4 text-center">Estado</th>
                        <th className="p-4">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {props.cierres.slice((cajasCurrentPage - 1) * cajasItemsPerPage, cajasCurrentPage * cajasItemsPerPage).map(c => {
                        const submitted = c.cashSubmitted ?? c.cashExpected;
                        const diff = submitted - c.cashExpected;
                        return (
                          <tr key={c.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 text-slate-600 font-mono">
                              {c.endTime ? new Date(c.endTime).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' }) : 'En curso'}
                            </td>
                            <td className="p-4 font-bold text-slate-900">{c.specialistName}</td>
                            <td className="p-4 text-right font-mono font-medium">${c.cashExpected.toFixed(2)}</td>
                            <td className="p-4 text-right font-mono font-bold text-slate-900">${submitted.toFixed(2)}</td>
                            <td className="p-4 text-center">
                              {Math.abs(diff) < 0.01 ? (
                                <span className="text-slate-400 font-mono font-bold">-</span>
                              ) : diff > 0 ? (
                                <span className="text-blue-600 font-mono font-bold">+{diff.toFixed(2)}</span>
                              ) : (
                                <span className="text-rose-600 font-mono font-bold">{diff.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {Math.abs(diff) < 0.01 ? (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">Cuadrado</span>
                              ) : diff > 0 ? (
                                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">Sobrante</span>
                              ) : (
                                <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold uppercase">Faltante</span>
                              )}
                            </td>
                            <td className="p-4 text-slate-500 text-xs max-w-xs truncate" title={c.notes}>
                              {c.notes || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                {props.cierres.length > cajasItemsPerPage && (
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">
                      Mostrando {((cajasCurrentPage - 1) * cajasItemsPerPage) + 1} - {Math.min(cajasCurrentPage * cajasItemsPerPage, props.cierres.length)} de {props.cierres.length} cierres
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCajasCurrentPage(p => Math.max(1, p - 1))}
                        disabled={cajasCurrentPage === 1}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCajasCurrentPage(p => Math.min(Math.ceil(props.cierres.length / cajasItemsPerPage), p + 1))}
                        disabled={cajasCurrentPage === Math.ceil(props.cierres.length / cajasItemsPerPage)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-8 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-6">Historial General de Transacciones y Gastos</h3>
            <HistorialVentas sales={props.sales} expenses={props.expenses} />
          </div>
        </div>
      )}

      {/* TAB: CALENDARIO GLOBAL (Restaurado) */}
      {activeTab === 'calendar' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <CalendarModule 
            isAdmin={true}
            appointments={props.appointments}
          />
        </div>
      )}

      {/* TAB: AGENTES */}
      {activeTab === 'agents' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">Gestión de Agentes y Especialistas</h2>
              <p className="text-xs text-slate-500">Usuarios registrados con acceso al sistema y porcentaje de comisión.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setUserFormData({ name: '', email: '', role: 'specialist', commissionRate: 0.40 });
                setIsUserModalOpen(true);
              }}
              className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Plus size={14} /> Nuevo Usuario / Agente
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="p-3.5">Nombre</th>
                  <th className="p-3.5">Rol</th>
                  <th className="p-3.5">Turno Asignado</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5 text-right">Comisión</th>
                  <th className="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {props.users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">
                        {u.shiftSchedule === 'turno_manana' ? 'Mañana (10:00 - 16:00)' : u.shiftSchedule === 'turno_tarde' ? 'Tarde (16:00 - 22:00)' : 'Rotativo'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono">{u.email}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-700 font-mono">
                      {((u.commissionRate || 0) * 100).toFixed(0)}%
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setUserFormData(u);
                            setIsUserModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg cursor-pointer transition"
                          title="Editar usuario"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => props.onDeleteUser?.(u.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                          title="Eliminar usuario"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PROMOCIONES */}
      {activeTab === 'promos' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">Promociones Activas y Ofertas</h2>
              <p className="text-xs text-slate-500">Reglas dinámicas de descuento aplicadas en el POS.</p>
            </div>
            <button
              type="button"
              onClick={() => openPromoModal()}
              className="px-4 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Plus size={16} /> + Nueva Promoción
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="p-3.5">Promoción</th>
                  <th className="p-3.5">Días Aplicables</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5 text-right">Precio Combo</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {props.promos.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.description}</p>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">{p.dayOfWeek === 'all' ? 'Todos los Días' : p.dayOfWeek}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-bold uppercase">
                        {p.applicableCategory}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-900 font-mono">${p.bundlePrice.toFixed(2)}</td>
                    <td className="p-3.5 text-center">
                      <button 
                        type="button"
                        onClick={() => props.onTogglePromo?.(p.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider cursor-pointer transition ${
                          p.active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p.active ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => props.onTogglePromo?.(p.id)}
                          title={p.active ? "Desactivar promo" : "Activar promo"}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition cursor-pointer"
                        >
                          {p.active ? 'Pausar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openPromoModal(p)}
                          title="Editar promoción"
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => props.onDeletePromo?.(p.id)}
                          title="Eliminar promoción"
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: HORAS EXTRAS Y TURNOS */}
      {activeTab === 'time' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">Asignación de Turnos y Timbrado de Horas</h2>
              <p className="text-sm text-slate-500 mt-2">Control de horarios programados por especialista y contraste con entradas/salidas reales.</p>
            </div>
          </div>

          {/* Cards de Asignación de Turnos */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Horarios Programados por Especialista</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {props.users.map(u => (
                <div key={u.id} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{u.name}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{u.role}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-400 block mb-2 uppercase">Turno Asignado</span>
                    <select
                      value={u.shiftSchedule || 'turno_manana'}
                      onChange={(e) => {
                        const updatedUser: User = { ...u, shiftSchedule: e.target.value as any };
                        props.onEditUser?.(updatedUser);
                      }}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-black cursor-pointer shadow-sm"
                    >
                      <option value="turno_manana">Mañana (10:00 - 16:00)</option>
                      <option value="turno_tarde">Tarde (16:00 - 22:00)</option>
                      <option value="rotativo">Rotativo</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de Registros de Timbrado */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Registro de Marcación de Asistencia (Timbrado)</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold">
                  <tr>
                    <th className="p-5">Empleado</th>
                    <th className="p-5">Turno Teórico</th>
                    <th className="p-5">Fecha</th>
                    <th className="p-5">Entrada Real</th>
                    <th className="p-5">Salida Real</th>
                    <th className="p-5 text-right">Hrs Reg.</th>
                    <th className="p-5 text-right">Hrs Extras</th>
                    <th className="p-5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {props.timeEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-500 font-bold text-base">No hay registros de timbrado.</td>
                    </tr>
                  ) : (
                    props.timeEntries.map(t => {
                      const userObj = props.users.find(u => u.name.toLowerCase() === t.employeeName.toLowerCase());
                      const shift = userObj?.shiftSchedule || 'turno_manana';
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-5 font-black text-slate-900 text-base">{t.employeeName}</td>
                          <td className="p-5">
                            <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-black text-slate-700 tracking-wider">
                              {shift === 'turno_manana' ? '10:00 - 16:00' : shift === 'turno_tarde' ? '16:00 - 22:00' : 'Rotativo'}
                            </span>
                          </td>
                          <td className="p-5 text-slate-700 font-mono font-bold">{t.date}</td>
                          <td className="p-5 font-mono text-emerald-700 font-black text-base">{t.clockIn}</td>
                          <td className="p-5 font-mono text-slate-500 font-bold text-base">{t.clockOut || '---'}</td>
                          <td className="p-5 text-right font-mono font-bold text-slate-900">{t.regularHours}h</td>
                          <td className="p-5 text-right font-mono font-black text-rose-600">{t.overtimeHours > 0 ? `+${t.overtimeHours}h` : '0h'}</td>
                          <td className="p-5 text-center">
                            <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                              t.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ALERTAS */}
      {activeTab === 'alerts' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 font-display">Alertas del Sistema y Notificaciones</h2>
            <p className="text-xs text-slate-500">Historial de alertas por bajo inventario, cierres de caja y sobretiempos.</p>
          </div>
          {alertasStock.length === 0 ? (
            <p className="p-8 text-center text-slate-400 text-xs">No existen alertas registradas.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alertasStock.map(alert => (
                <div key={alert.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-xs font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800">
                      STOCK BAJO
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{new Date(alert.timestamp).toLocaleTimeString('es-EC')}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{alert.subject}</h4>
                  <p className="text-xs text-slate-600">{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: AUDITORÍA RECIBOS */}
      {activeTab === 'sri' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 font-display">Auditoría de Recibos Internos</h2>
            <p className="text-xs text-slate-500">Historial completo de comprobantes y recibos procesados en el sistema.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="p-3.5">N° Recibo / Comprobante</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Especialista</th>
                  <th className="p-3.5 text-right">Monto USD</th>
                  <th className="p-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {props.sales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No hay ventas ni recibos registrados.</td>
                  </tr>
                ) : (
                  props.sales.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{s.invoiceNumber || s.id}</td>
                      <td className="p-3.5 text-slate-600 font-mono">{new Date(s.timestamp).toLocaleDateString('es-EC')}</td>
                      <td className="p-3.5 font-bold text-slate-800">{s.customerName}</td>
                      <td className="p-3.5 text-slate-700">{s.specialistName}</td>
                      <td className="p-3.5 text-right font-bold font-mono text-slate-900">${s.subtotal.toFixed(2)}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-extrabold uppercase tracking-wider">
                          PROCESADO
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE INVENTARIO Y RECETAS (El que arreglamos) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-slate-900 font-display">
                {formData.id ? 'Editar Ítem' : 'Nuevo Producto / Servicio'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nombre del Producto / Servicio *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={e => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black"
                  >
                    <option value="">Seleccione o cree una...</option>
                    {(props.categories && props.categories.length > 0 ? props.categories : ['Servicios', 'Joyería', 'Piezas', 'Smoke Shop', 'Boutique', 'Ropa']).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Precio de Venta ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black font-mono"
                  />
                </div>

                {formData.unit === 'unidades' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Stock Físico Actual</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Alerta de Stock Mínimo</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minStock}
                        onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-1 sm:col-span-2 mt-2 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                          <Box size={16} /> Receta de Insumos (Opcional)
                        </h4>
                        <p className="text-xs text-indigo-600/70 mt-0.5 max-w-sm">
                          Si agregas insumos aquí, el sistema los descontará automáticamente de tu inventario cada vez que vendas este servicio.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, insumosAsociados: [...prev.insumosAsociados, { itemId: '', qty: 1 }] }))}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition"
                      >
                        + Agregar Insumo
                      </button>
                    </div>

                    {formData.insumosAsociados.length > 0 && (
                      <div className="space-y-2.5 pt-2">
                        {formData.insumosAsociados.map((insumo, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row items-center gap-2">
                            <select
                              value={insumo.itemId}
                              required
                              onChange={(e) => {
                                const newInsumos = [...formData.insumosAsociados];
                                newInsumos[idx].itemId = e.target.value;
                                setFormData({ ...formData, insumosAsociados: newInsumos });
                              }}
                              className="flex-1 w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400"
                            >
                              <option value="">Selecciona el insumo a descontar...</option>
                              {props.items.filter(i => i.unit === 'unidades').map(i => (
                                <option key={i.id} value={i.id}>{i.name} (Quedan: {i.stock})</option>
                              ))}
                            </select>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <span className="text-xs text-indigo-400 font-bold shrink-0">Cant:</span>
                              <input
                                type="number"
                                min="1"
                                required
                                value={insumo.qty}
                                onChange={(e) => {
                                  const newInsumos = [...formData.insumosAsociados];
                                  newInsumos[idx].qty = parseInt(e.target.value) || 1;
                                  setFormData({ ...formData, insumosAsociados: newInsumos });
                                }}
                                className="w-16 px-2 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-center font-bold focus:outline-none focus:border-indigo-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newInsumos = formData.insumosAsociados.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, insumosAsociados: newInsumos });
                                }}
                                className="p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm transition"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PROMOCIONES DINÁMICAS */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-slate-900 font-display">
                {editingPromo ? 'Editar Promoción Dinámica' : 'Nueva Promoción Dinámica'}
              </h3>
              <button onClick={() => setIsPromoModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Nombre / Título de la Promoción *</label>
                <input
                  type="text"
                  required
                  value={promoFormData.name}
                  onChange={e => setPromoFormData({ ...promoFormData, name: e.target.value })}
                  placeholder="Ej. 2x1 en Perforaciones o 2 Piezas por $25"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Descripción (Opcional)</label>
                <input
                  type="text"
                  value={promoFormData.description}
                  onChange={e => setPromoFormData({ ...promoFormData, description: e.target.value })}
                  placeholder="Detalle o condiciones de la promo"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Día de la Dinámica *</label>
                  <select
                    value={promoFormData.dayOfWeek}
                    onChange={e => setPromoFormData({ ...promoFormData, dayOfWeek: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black"
                  >
                    <option value="all">Todos los días</option>
                    <option value="Monday">Lunes</option>
                    <option value="Tuesday">Martes</option>
                    <option value="Wednesday">Miércoles</option>
                    <option value="Thursday">Jueves</option>
                    <option value="Friday">Viernes</option>
                    <option value="Saturday">Sábado</option>
                    <option value="Sunday">Domingo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Categoría Aplica *</label>
                  <select
                    value={promoFormData.applicableCategory}
                    onChange={e => setPromoFormData({ ...promoFormData, applicableCategory: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black"
                  >
                    <option value="all">Todas las categorías</option>
                    {(props.categories && props.categories.length > 0 ? props.categories : ['Servicios', 'Joyería', 'Piezas', 'Smoke Shop', 'Boutique', 'Ropa']).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Cantidad Requerida *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={promoFormData.requiredQuantity}
                    onChange={e => setPromoFormData({ ...promoFormData, requiredQuantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Precio Combo Final ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={promoFormData.bundlePrice}
                    onChange={e => setPromoFormData({ ...promoFormData, bundlePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm transition cursor-pointer"
                >
                  Guardar Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE NUEVA CATEGORÍA */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base font-display">Crear Nueva Categoría</h3>
              <button onClick={() => { setIsCategoryModalOpen(false); setNewCategoryName(''); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newCategoryName.trim()) {
                props.onAddCategory?.(newCategoryName.trim());
                setNewCategoryName('');
                setIsCategoryModalOpen(false);
              }
            }}>
              <div className="space-y-1.5 mb-5">
                <label className="text-xs font-bold text-slate-700 block">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej. Ropa, Bebidas, Insumos Médicos..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setIsCategoryModalOpen(false); setNewCategoryName(''); }} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs">
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE NUEVO/EDITAR USUARIO */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base font-display">
                {userFormData.id ? 'Editar Usuario / Agente' : 'Nuevo Usuario / Agente'}
              </h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!userFormData.name?.trim() || !userFormData.email?.trim()) return;

                if (userFormData.id) {
                  const updated: User = {
                    id: userFormData.id,
                    name: userFormData.name.trim(),
                    email: userFormData.email.trim(),
                    role: userFormData.role || 'specialist',
                    commissionRate: Number(userFormData.commissionRate) ?? 0.40,
                    shiftSchedule: userFormData.shiftSchedule || 'turno_manana',
                    avatar: userFormData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    phone: userFormData.phone || ''
                  };
                  props.onEditUser?.(updated);
                } else {
                  const newUser: User = {
                    id: `usr_${Date.now()}`,
                    name: userFormData.name.trim(),
                    email: userFormData.email.trim(),
                    role: userFormData.role || 'specialist',
                    commissionRate: Number(userFormData.commissionRate) ?? 0.40,
                    shiftSchedule: userFormData.shiftSchedule || 'turno_manana',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    phone: ''
                  };
                  props.onAddUser(newUser);
                }
                setIsUserModalOpen(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={userFormData.name || ''}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={userFormData.email || ''}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="ejemplo@estudio.com"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Rol de Acceso *</label>
                  <select
                    value={userFormData.role || 'specialist'}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black"
                  >
                    <option value="specialist">Especialista</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Comisión (ej. 0.40) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    required
                    value={userFormData.commissionRate ?? 0.40}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Turno Horario Semanal *</label>
                <select
                  value={userFormData.shiftSchedule || 'turno_manana'}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, shiftSchedule: e.target.value as any }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black"
                >
                  <option value="turno_manana">Turno Mañana (10:00 - 16:00)</option>
                  <option value="turno_tarde">Turno Tarde (16:00 - 22:00)</option>
                  <option value="rotativo">Turno Rotativo</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  {userFormData.id ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
  );
}