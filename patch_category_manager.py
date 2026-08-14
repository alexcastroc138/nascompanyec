import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# Replace button text
content = content.replace("<Plus size={16} /> Nueva Categoría", "<Tag size={16} /> Gestor de Categorías")

# Replace modal
old_modal = """      {/* MODAL DE NUEVA CATEGORÍA */}
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
      )}"""

new_modal = """      {/* MODAL GESTOR DE CATEGORÍAS */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
              <h3 className="font-bold text-slate-900 text-base font-display">Gestor de Categorías</h3>
              <button onClick={() => { setIsCategoryModalOpen(false); setNewCategoryName(''); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newCategoryName.trim()) {
                props.onAddCategory?.(newCategoryName.trim());
                setNewCategoryName('');
              }
            }} className="flex gap-2 mb-4 shrink-0">
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nueva categoría..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black"
              />
              <button type="submit" className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap">
                Añadir
              </button>
            </form>
            
            <div className="flex-1 overflow-y-auto min-h-0 border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold sticky top-0">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Nombre</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(props.categories || []).map(cat => (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 text-slate-400 font-mono">#{cat.id}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {cat.nombre}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => {
                              const newName = prompt('Editar nombre de categoría:', cat.nombre);
                              if (newName && newName.trim() !== '') {
                                props.onEditCategory?.(cat.id, newName.trim());
                              }
                            }} 
                            className="p-1.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) {
                                props.onDeleteCategory?.(cat.id);
                              }
                            }} 
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!props.categories || props.categories.length === 0) && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-slate-400 italic">No hay categorías registradas</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 shrink-0">
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
                Cerrar Gestor
              </button>
            </div>
          </div>
        </div>
      )}"""

content = content.replace(old_modal, new_modal)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
