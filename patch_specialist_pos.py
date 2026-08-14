import re

with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    content = f.read()

# Fix 1: Filter buttons
old_filter = """                  <div className="flex flex-wrap gap-2">
                    {[{id: 'all', nombre: 'Todos'}, ...(categories || [])].map(cat => {
                      const isAll = cat === 'Todos';
                      const isSelected = isAll ? selectedCategory === 'all' : selectedCategory.toLowerCase() === cat.toLowerCase();
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(isAll ? 'all' : cat)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border cursor-pointer ${
                            isSelected 
                              ? 'bg-black text-white border-black shadow-sm' 
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {cat.nombre}
                        </button>
                      );
                    })}
                  </div>"""

new_filter = """                  <div className="flex flex-wrap gap-2">
                    {[{id: 'all', nombre: 'Todos'}, ...(categories || [])].map(cat => {
                      const catName = typeof cat === 'string' ? cat : (cat.nombre || '');
                      const isAll = catName === 'Todos' || cat.id === 'all';
                      const isSelected = isAll ? selectedCategory === 'all' : selectedCategory.toLowerCase() === catName.toLowerCase();
                      return (
                        <button
                          key={typeof cat === 'string' ? cat : cat.id}
                          onClick={() => setSelectedCategory(isAll ? 'all' : catName)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border cursor-pointer ${
                            isSelected 
                              ? 'bg-black text-white border-black shadow-sm' 
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {catName}
                        </button>
                      );
                    })}
                  </div>"""

content = content.replace(old_filter, new_filter)

# Fix 2: (i.category || '').toLowerCase()
content = content.replace("const cat = (i.category || '').toLowerCase();", "const catStr = typeof i.category === 'string' ? i.category : ((i.category as any)?.nombre || '');\n        const cat = catStr.toLowerCase();")

with open('src/components/SpecialistDashboard.tsx', 'w') as f:
    f.write(content)

