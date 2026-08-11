import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# Add ChevronDown, PieChart, LayoutDashboard to lucide-react imports
content = re.sub(
    r"import \{([^}]+)\} from 'lucide-react';",
    r"import {\1, ChevronDown, PieChart, LayoutDashboard } from 'lucide-react';",
    content
)

# Add 'reports' to the activeTab state if it exists, actually it's a string, let's just make sure activeTab can take 'reports'. It's typed as any right now?
# "const [activeTab, setActiveTab] = useState<string>('overview');" or similar.
# The user might have: const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'cajas' | 'calendar' | 'inventory' | 'promos' | 'time' | 'alerts' | 'sri'>('overview');
content = re.sub(
    r"useState<'overview' \| 'agents'",
    r"useState<'overview' | 'reports' | 'agents'",
    content
)

# Replace CABECERA Y EXPORTAR (Tu diseño original) up to {activeTab === 'overview' && (
nav_regex = re.compile(
    r"\{\/\* CABECERA Y EXPORTAR \(Tu diseño original\).*?\{\/\* TAB: RESUMEN GENERAL \& BI \(Business Intelligence\) \*\/\}\s*\{activeTab === 'overview' && \(",
    re.DOTALL
)

new_nav = """      {/* HEADER TIPO HOSTINGER (SAAS MODERNO) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
        {/* IZQUIERDA: LOGO + BADGE */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-xl font-black text-xl tracking-tighter shrink-0">
            IS
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">ERP Ink & Steel</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">Vite Active</span>
            </div>
          </div>
        </div>

        {/* DERECHA: NAVEGACIÓN Y EXPORTAR */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto md:justify-end">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-black text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <LayoutDashboard size={14} /> Resumen Diario
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <PieChart size={14} /> Reportes & Analíticas
          </button>

          {/* DESPLEGABLE OPERACIONES */}
          <div className="relative group">
            <button className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${['cajas', 'inventory', 'promos'].includes(activeTab) ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              Operaciones <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <button onClick={() => setActiveTab('cajas')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <ShieldCheck size={14} /> Control Cajas
              </button>
              <button onClick={() => setActiveTab('inventory')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <Box size={14} /> Inventario
              </button>
              <button onClick={() => setActiveTab('promos')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <Tag size={14} /> Promociones
              </button>
            </div>
          </div>

          {/* DESPLEGABLE PERSONAL */}
          <div className="relative group">
            <button className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${['agents', 'time'].includes(activeTab) ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              Personal <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <button onClick={() => setActiveTab('agents')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <Users size={14} /> Gestión Agentes
              </button>
              <button onClick={() => setActiveTab('time')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <Clock size={14} /> Horas Extras / Asistencia
              </button>
            </div>
          </div>

          {/* DESPLEGABLE AUDITORÍA & SISTEMA */}
          <div className="relative group">
            <button className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${['calendar', 'alerts', 'sri'].includes(activeTab) ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              Sistema <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <button onClick={() => setActiveTab('calendar')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <Calendar size={14} /> Calendario
              </button>
              <button onClick={() => setActiveTab('alerts')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <AlertTriangle size={14} /> Alertas
              </button>
              <button onClick={() => setActiveTab('sri')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <FileText size={14} /> Auditoría Recibos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NUEVO TAB: RESUMEN DIARIO (overview) */}
      {activeTab === 'overview' && (() => {
        // Calcular datos del día
        const hoy = new Date().toISOString().split('T')[0];
        const ventasHoy = props.sales.filter(s => s.timestamp.startsWith(hoy));
        const ingresosHoy = ventasHoy.reduce((sum, s) => sum + s.subtotal, 0);
        
        const gastosHoy = props.expenses?.filter(e => e.date.startsWith(hoy)).reduce((sum, e) => sum + e.amount, 0) || 0;
        const utilidadHoy = ingresosHoy - gastosHoy;
        
        // Desglose de Caja de Hoy
        const efectivoHoy = ventasHoy.filter(s => s.paymentMethod === 'cash' || s.paymentMethod === 'efectivo').reduce((sum, s) => sum + s.subtotal, 0);
        const transHoy = ventasHoy.filter(s => s.paymentMethod === 'transfer' || s.paymentMethod === 'transferencia').reduce((sum, s) => sum + s.subtotal, 0);
        const deUnaHoy = ventasHoy.filter(s => s.paymentMethod === 'de_una').reduce((sum, s) => sum + s.subtotal, 0);
        const tarjetaHoy = ventasHoy.filter(s => s.paymentMethod === 'card' || s.paymentMethod === 'tarjeta').reduce((sum, s) => sum + s.subtotal, 0);
        
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 font-display px-2">Panel Principal: Hoy</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Ingresos Hoy</span>
                <span className="text-3xl font-black font-mono text-slate-900 block mt-2">${ingresosHoy.toFixed(2)}</span>
              </div>
              <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200 shadow-sm">
                <span className="text-xs font-extrabold text-rose-700 uppercase tracking-wider block">Gastos Hoy</span>
                <span className="text-3xl font-black font-mono text-rose-700 block mt-2">${gastosHoy.toFixed(2)}</span>
              </div>
              <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 shadow-sm">
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">Utilidad Día</span>
                <span className="text-3xl font-black font-mono text-emerald-700 block mt-2">${utilidadHoy.toFixed(2)}</span>
              </div>
              <div className="bg-black text-white p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Estado Caja</span>
                <span className="text-2xl font-black font-mono text-white block mt-2 mt-3">{props.cierres?.filter(c => !c.endTime && c.startTime.startsWith(hoy)).length > 0 ? 'ABIERTA' : 'CERRADA'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Desglose de Caja de Hoy</h3>
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
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Dinámicas Activas</h3>
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

      {/* TAB: REPORTES Y ANALÍTICAS (reports) - Antiguo overview */}
      {activeTab === 'reports' && ("""

content = nav_regex.sub(new_nav, content)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
