import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
import_regex = re.compile(r"import \{([^}]+)\} from 'lucide-react';")
lucide_imports_match = import_regex.search(content)
if lucide_imports_match:
    imports_str = lucide_imports_match.group(1)
    new_imports = set(i.strip() for i in imports_str.split(','))
    # add necessary imports
    for i in ['LayoutDashboard', 'BarChart3', 'Wallet', 'Package', 'Tag', 'Users', 'Clock', 'Calendar', 'Bell', 'FileText']:
        new_imports.add(i)
    # Filter out empty
    new_imports = [i for i in new_imports if i]
    new_import_str = "import { " + ", ".join(new_imports) + " } from 'lucide-react';"
    content = import_regex.sub(new_import_str, content)

# 2. Add prop onSwitchToSpecialist to AdminDashboardProps
props_regex = re.compile(r"export interface AdminDashboardProps \{")
content = props_regex.sub("export interface AdminDashboardProps {\n  onSwitchToSpecialist?: () => void;", content)

# 3. Replace the main container and header
# We need to find the start of the return statement
start_regex = re.compile(r"return \(\s*<div className=\"max-w-7xl mx-auto p-4 space-y-5 text-slate-800 animate-fade-in\">\s*\{/\* HEADER TIPO HOSTINGER.*?\{/\* NUEVO TAB: RESUMEN DIARIO \(overview\) \*/\}", re.DOTALL)

new_layout = """return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* COLUMNA 1: MENÚ LATERAL IZQUIERDO (SIDEBAR COMPLETO) */}
      <aside className="w-64 bg-black text-white flex flex-col justify-between p-4 flex-shrink-0 overflow-y-auto border-r border-slate-800">
        <div>
          {/* Brand / Logo Admin */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-white text-black font-extrabold flex items-center justify-center text-xs">
              AD
            </div>
            <div>
              <h1 className="text-xs font-bold text-white tracking-tight">Admin Console</h1>
              <p className="text-[10px] text-slate-400 font-medium">BODYART ECUADOR</p>
            </div>
          </div>

          {/* LISTA VERTICAL DE NAVEGACIÓN (LOS 10 MÓDULOS A LA IZQUIERDA) */}
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
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-white text-black shadow-sm font-extrabold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pie de Sidebar: Botón Switch a Especialista */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          {props.onSwitchToSpecialist && (
            <button
              onClick={props.onSwitchToSpecialist}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold rounded-xl border border-slate-800 transition"
            >
              Vista Especialista
            </button>
          )}
        </div>
      </aside>

      {/* COLUMNA 2: ÁREA DE CONTENIDO PRINCIPAL A LA DERECHA */}
      <main className="flex-1 overflow-y-auto p-6 max-w-7xl">
        {/* NUEVO TAB: RESUMEN DIARIO (overview) */}"""

content = start_regex.sub(new_layout, content)

# Remove the closing div of the old main container at the very end
content = re.sub(r"</div>\s*\)\s*;\s*}\s*$", "</main>\n    </div>\n  );\n}\n", content)

# 4. Replace text-3xl with text-xl in the whole file
content = content.replace("text-3xl", "text-xl")
content = content.replace("text-4xl", "text-xl")

# And h2 text-xl font-bold -> text-sm font-bold
content = content.replace("text-xl font-bold text-slate-900", "text-sm font-bold text-slate-900")
content = content.replace("text-lg font-bold text-slate-900", "text-sm font-bold text-slate-900")

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)

print("Done")
