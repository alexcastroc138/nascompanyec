import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

old_ui = """                <div className="space-y-1.5">
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
                </div>"""

new_ui = """                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Tipo de Descuento</label>
                  <select
                    value={promoFormData.discountType}
                    onChange={e => setPromoFormData({ ...promoFormData, discountType: e.target.value as 'fixed' | 'percentage' })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black"
                  >
                    <option value="fixed">Precio Fijo ($)</option>
                    <option value="percentage">Porcentaje (%)</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {promoFormData.discountType === 'percentage' ? 'Porcentaje de Descuento (%) *' : 'Precio Combo Final ($ USD) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={promoFormData.discountType === 'percentage' ? 100 : undefined}
                    required
                    value={promoFormData.bundlePrice}
                    onChange={e => setPromoFormData({ ...promoFormData, bundlePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-black"
                  />
                </div>"""

content = content.replace(old_ui, new_ui)

# Also update the table header to reflect this
content = content.replace('<th className="p-3.5 text-right">Precio Combo</th>', '<th className="p-3.5 text-right">Descuento</th>')

# And the table cell
old_td = """                    <td className="p-3.5 font-black text-slate-900 text-right font-mono">
                      ${p.bundlePrice.toFixed(2)}
                    </td>"""
new_td = """                    <td className="p-3.5 font-black text-slate-900 text-right font-mono">
                      {p.discountType === 'percentage' ? `${p.bundlePrice}% OFF` : `$${p.bundlePrice.toFixed(2)}`}
                    </td>"""

content = content.replace(old_td, new_td)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
