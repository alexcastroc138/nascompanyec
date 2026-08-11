import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Main container
# Currently it's `<div className="space-y-6 animate-fade-in text-slate-900">`
content = content.replace(
    '<div className="space-y-6 animate-fade-in text-slate-900">',
    '<div className="max-w-7xl mx-auto p-4 space-y-5 text-slate-800 animate-fade-in">'
)

# 2. Header and Nav replacement
nav_regex = re.compile(
    r"\{\/\* HEADER TIPO HOSTINGER \(SAAS MODERNO\) \*\/\}.*?\{\/\* NUEVO TAB: RESUMEN DIARIO \(overview\) \*\/\}",
    re.DOTALL
)

new_header = """{/* HEADER TIPO HOSTINGER (SAAS MODERNO) */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
          <h1 className="text-sm font-bold tracking-tight">Consola de Control Admin</h1>
        </div>

        {/* NAVEGACIÓN FUNCIONAL ALINEADA A LA DERECHA */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            Dashboard Hoy
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            📊 Reportes BI
          </button>

          {/* SELECTOR DESPLEGABLE CONECTADO QUE CAMBIA LA PESTAÑA REALMENTE */}
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-white"
          >
            <optgroup label="Operaciones">
              <option value="cajas">Control Cajas</option>
              <option value="inventory">Inventario e Insumos</option>
              <option value="promos">Promociones</option>
            </optgroup>
            <optgroup label="Personal & Agenda">
              <option value="agents">Gestión Agentes</option>
              <option value="time">Horas Extras / Asistencia</option>
              <option value="calendar">Agenda / Citas</option>
            </optgroup>
            <optgroup label="Sistema & Auditoría">
              <option value="alerts">Alertas Stock</option>
              <option value="sri">Auditoría Recibos</option>
            </optgroup>
          </select>
        </div>
      </header>

      {/* NUEVO TAB: RESUMEN DIARIO (overview) */}"""

content = nav_regex.sub(new_header, content)

# 3. Typography limitations
content = content.replace("text-3xl", "text-xl").replace("text-4xl", "text-xl").replace("text-2xl", "text-xl")

# 4. Reports Tab replacement
reports_regex = re.compile(
    r"\{\/\* TAB: REPORTES Y ANALÍTICAS \(reports\) - Antiguo overview \*\/\}.*?\{\/\* TAB: INVENTARIO \*\/\}",
    re.DOTALL
)

new_reports = """{/* TAB: REPORTES Y ANALÍTICAS (reports) - Antiguo overview */}
      {activeTab === 'reports' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Inteligencia de Negocios y Reportes</h2>
              <p className="text-xs text-slate-500">Métricas acumuladas de rendimiento del estudio.</p>
            </div>
            <div className="flex gap-1.5">
              {(['semanal', 'mensual', 'anual'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodFilter(p)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase transition ${periodFilter === p ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {p === 'semanal' ? 'Semana' : p === 'mensual' ? 'Mes' : 'Año'}
                </button>
              ))}
            </div>
          </div>

          {/* GRÁFICOS COMPACTOS SVG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DONUT SVG POR LÍNEAS DE NEGOCIO */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 tracking-wider">Distribución por Línea de Negocio</h3>
              <div className="flex items-center gap-6">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 11.25 27.17" fill="none" stroke="#000000" strokeWidth="4" strokeDasharray="60, 100" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 -11.25 27.17" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="30, 100" />
                </svg>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-black"></span><span className="font-semibold">Estudio Nas: 60%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span><span className="font-semibold">Boutique: 30%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span><span className="font-semibold">Joyería: 10%</span></div>
                </div>
              </div>
            </div>

            {/* BARRAS DE PROGRESO DE RENTABILIDAD */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Balance Financiero Acumulado</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1"><span>Ingresos Totales</span><span className="text-emerald-600 font-bold">$1,250.00</span></div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full w-[85%]"></div></div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1"><span>Gastos Caja Chica</span><span className="text-rose-600 font-bold">$180.00</span></div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="bg-rose-500 h-full w-[20%]"></div></div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1"><span>Comisiones Especialistas</span><span className="text-indigo-600 font-bold">$420.00</span></div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="bg-indigo-500 h-full w-[40%]"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: INVENTARIO */}"""

content = reports_regex.sub(new_reports, content)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
