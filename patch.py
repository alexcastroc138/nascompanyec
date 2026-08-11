import sys

with open('src/components/SpecialistDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update cart.forEach
old_foreach = """          cart.forEach(cartItem => {
            if (cartItem.item.unit === 'unidades') {
              onUpdateInventory(cartItem.item.id, cartItem.item.stock - cartItem.quantity);
            }
          });"""

new_foreach = """          cart.forEach(cartItem => {
            if (cartItem.item.insumosAsociados && cartItem.item.insumosAsociados.length > 0) {
              cartItem.item.insumosAsociados.forEach(insumo => {
                const originalItem = items.find(i => i.id === insumo.itemId);
                if (originalItem) {
                  onUpdateInventory(insumo.itemId, originalItem.stock - (insumo.qty * cartItem.quantity));
                }
              });
            }
            if (cartItem.item.unit === 'unidades') {
              onUpdateInventory(cartItem.item.id, cartItem.item.stock - cartItem.quantity);
            }
          });"""

content = content.replace(old_foreach, new_foreach)

# 2. Add category filters
old_buscador = """                  {/* Buscador */}"""

new_filters = """                  {/* Filtros de Categorías */}
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'servicios', 'joyeria', 'piezas', 'smoke'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition border ${
                          selectedCategory === cat 
                            ? 'bg-black text-white border-black shadow-sm' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {cat === 'all' ? 'Todos' : cat === 'servicios' ? 'Servicios' : cat === 'joyeria' ? 'Joyería' : cat === 'piezas' ? 'Piezas' : 'Smoke Shop'}
                      </button>
                    ))}
                  </div>
                  {/* Buscador */}"""

content = content.replace(old_buscador, new_filters)

with open('src/components/SpecialistDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
