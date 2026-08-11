import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Update AdminDashboardProps to receive activeTab
props_regex = re.compile(r"export interface AdminDashboardProps \{")
content = props_regex.sub("export interface AdminDashboardProps {\n  activeTab: string;", content)

# 2. Update AdminDashboard component definition to use props.activeTab and remove its own activeTab state
def_regex = re.compile(r"export default function AdminDashboard\(props: AdminDashboardProps\) \{\s*const \[activeTab, setActiveTab\] = useState[^;]+;")
content = def_regex.sub("export default function AdminDashboard(props: AdminDashboardProps) {\n  const activeTab = props.activeTab;", content)

# 3. Replace the entire container + sidebar layout with just the content wrapper
# Start finding from `return (`
start_layout_regex = re.compile(r"return \(\s*<div className=\"flex h-screen bg-slate-100 overflow-hidden font-sans\">\s*\{\/\* COLUMNA 1: MENÚ LATERAL IZQUIERDO \(SIDEBAR COMPLETO\) \*\/\}.*?\{\/\* COLUMNA 2: ÁREA DE CONTENIDO PRINCIPAL A LA DERECHA \*\/\}\s*<main className=\"flex-1 overflow-y-auto p-6 max-w-7xl\">\s*\{\/\* NUEVO TAB: RESUMEN DIARIO \(overview\) \*\/\}", re.DOTALL)

new_start_layout = """return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      {/* NUEVO TAB: RESUMEN DIARIO (overview) */}"""
content = start_layout_regex.sub(new_start_layout, content)

# End layout replacement (since we removed <main> and outer <div>)
end_layout_regex = re.compile(r"<\/main>\s*<\/div>\s*\)\s*;\s*\}\s*$")
content = end_layout_regex.sub("    </div>\n  );\n}", content)

# 4. Remove activeTab from reports map buttons? Wait, there are no activeTab sets in the content itself since they were moved to App.tsx. 

# Let's fix typographies to match the prompt rules
content = content.replace("text-xl font-bold text-slate-900", "text-base font-bold text-slate-900")

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)

print("AdminDashboard updated")
