import re

# Update App.tsx
with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("useState<string[]>([]);", "useState<Categoria[]>([]);")
content = content.replace("import { User, POSItem, Appointment, Sale, CierreCaja, WebhookLog, DynamicPromo, Expense, TimeEntry, EmailAlert } from './types';", "import { User, POSItem, Appointment, Sale, CierreCaja, WebhookLog, DynamicPromo, Expense, TimeEntry, EmailAlert, Categoria } from './types';")

# update handleAddCategory in App.tsx
old_handle = """  const handleAddCategory = async (cat: string) => {
    if (cat && cat.trim() !== '') {
      const cleanCat = cat.trim();
      if (!categories.includes(cleanCat)) {
        // Optimistic update
        setCategories([...categories, cleanCat]);
        const success = await dbService.saveCategoria(cleanCat);
        if (!success) {
          // Revert if failed, though optimistic is fine for now
          // Could also just refetch
        }
      }
    }
  };"""

new_handle = """  const handleAddCategory = async (cat: string) => {
    if (cat && cat.trim() !== '') {
      const cleanCat = cat.trim();
      const existing = categories.find(c => c.nombre.toLowerCase() === cleanCat.toLowerCase());
      if (!existing) {
        const newCat = await dbService.saveCategoria(cleanCat);
        if (newCat) {
          setCategories([...categories, newCat]);
        }
      }
    }
  };

  const handleEditCategory = async (id: string | number, newName: string) => {
    if (newName && newName.trim() !== '') {
      const success = await dbService.updateCategoria(id, newName.trim());
      if (success) {
        setCategories(categories.map(c => c.id === id ? { ...c, nombre: newName.trim() } : c));
      }
    }
  };

  const handleDeleteCategory = async (id: string | number) => {
    const success = await dbService.deleteCategoria(id);
    if (success) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };"""
content = content.replace(old_handle, new_handle)

# inject handleEditCategory and handleDeleteCategory into props
content = content.replace("onAddCategory={handleAddCategory}", "onAddCategory={handleAddCategory}\n                    onEditCategory={handleEditCategory}\n                    onDeleteCategory={handleDeleteCategory}")

with open('src/App.tsx', 'w') as f:
    f.write(content)

# Update AdminDashboard.tsx
with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { POSItem, Sale, Appointment, CierreCaja, Category, DynamicPromo, Expense, User, TimeEntry, EmailAlert } from '../types';", "import { POSItem, Sale, Appointment, CierreCaja, Category, DynamicPromo, Expense, User, TimeEntry, EmailAlert, Categoria } from '../types';")
content = content.replace("  categories?: string[];", "  categories?: Categoria[];")
content = content.replace("  onAddCategory?: (category: string) => void;", "  onAddCategory?: (category: string) => void;\n  onEditCategory?: (id: string | number, name: string) => void;\n  onDeleteCategory?: (id: string | number) => void;")

# Fix mappings in AdminDashboard
content = content.replace("{(props.categories || []).map(c => (", "{(props.categories || []).map(c => (")
# wait, mapping over objects, we need c.nombre
content = content.replace("                      <option key={c} value={c}>{c}</option>", "                      <option key={c.id} value={c.nombre}>{c.nombre}</option>")

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)

# Update SpecialistDashboard.tsx
with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    content = f.read()

if "import { POSItem, Sale, Appointment, CierreCaja, Category, DynamicPromo, Expense, User } from '../types';" in content:
    content = content.replace("import { POSItem, Sale, Appointment, CierreCaja, Category, DynamicPromo, Expense, User } from '../types';", "import { POSItem, Sale, Appointment, CierreCaja, Category, DynamicPromo, Expense, User, Categoria } from '../types';")
else:
    # Just to be sure
    content = content.replace("import { POSItem, Sale, Appointment, CierreCaja, Category, DynamicPromo, Expense, User", "import { POSItem, Sale, Appointment, CierreCaja, Category, DynamicPromo, Expense, User, Categoria")

content = content.replace("  categories?: string[];", "  categories?: Categoria[];")
content = content.replace("{['Todos', ...(categories || [])].map(cat => {", "{[{id: 'all', nombre: 'Todos'}, ...(categories || [])].map(cat => {")
content = content.replace("                      return (\n                        <button\n                          key={cat}", "                      return (\n                        <button\n                          key={cat.id}")
content = content.replace("                          onClick={() => setPosCategoryFilter(cat)}\n                          className={`whitespace-nowrap px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${", "                          onClick={() => setPosCategoryFilter(cat.nombre)}\n                          className={`whitespace-nowrap px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${")
content = content.replace("                            posCategoryFilter === cat", "                            posCategoryFilter === cat.nombre")
content = content.replace("                          {cat}\n                        </button>", "                          {cat.nombre}\n                        </button>")

with open('src/components/SpecialistDashboard.tsx', 'w') as f:
    f.write(content)

