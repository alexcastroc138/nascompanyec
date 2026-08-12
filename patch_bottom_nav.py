import re

with open('src/components/layout/BottomNav.tsx', 'r') as f:
    content = f.read()

# Add BarChart3 to imports
content = content.replace("from 'lucide-react'", "from 'lucide-react'")
content = content.replace("Wallet }", "Wallet, BarChart3 }")

# Add the new button before the profile button
new_button = """        {/* 📊 Ingresos */}
        <button
          onClick={() => handleTabClick('ingresos')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition cursor-pointer ${
            activeTab === 'ingresos' && !isProfileOpen
              ? 'text-black font-bold'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <BarChart3 size={18} />
          <span className="text-[10px] tracking-tight">Ingresos</span>
        </button>"""

content = content.replace("        {/* 👤 Perfil */}", new_button + "\n\n        {/* 👤 Perfil */}")

# Update types
content = content.replace(
    "activeTab: 'dashboard' | 'pos' | 'calendar' | 'turn' | string;",
    "activeTab: 'dashboard' | 'pos' | 'calendar' | 'turn' | 'ingresos' | string;"
)
content = content.replace(
    "onSelectTab: (tab: 'dashboard' | 'pos' | 'calendar' | 'turn') => void;",
    "onSelectTab: (tab: 'dashboard' | 'pos' | 'calendar' | 'turn' | 'ingresos') => void;"
)
content = content.replace(
    "handleTabClick = (tab: 'dashboard' | 'pos' | 'calendar' | 'turn')",
    "handleTabClick = (tab: 'dashboard' | 'pos' | 'calendar' | 'turn' | 'ingresos')"
)

with open('src/components/layout/BottomNav.tsx', 'w') as f:
    f.write(content)
