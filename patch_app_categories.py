import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace useLocalStorage
old_categories_state = "  const [categories, setCategories] = useLocalStorage<string[]>('studio_categories', ['Servicios', 'Joyería', 'Piezas', 'Smoke Shop', 'Boutique', 'Ropa']);"
new_categories_state = "  const [categories, setCategories] = useState<string[]>(['Servicios', 'Joyería', 'Piezas', 'Smoke Shop', 'Boutique', 'Ropa']);"
content = content.replace(old_categories_state, new_categories_state)

# Replace useEffect
old_use_effect = """  useEffect(() => {
    if (isAuthenticated) {
      dbService.getCitas().then(data => { if (data) setAppointments(data); });
      dbService.getVentas().then(data => { if (data) setSales(data); });
      dbService.getInventario().then(data => { if (data) setItems(data); });
      dbService.getUsuarios().then(data => { 
        if (data && data.length > 0) {
          setUsers(data.map(u => ({
            ...u,
            avatar: u.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            commissionRate: u.commissionRate || 0.4
          })));
        } 
      });
    }
  }, [isAuthenticated]);"""

new_use_effect = """  useEffect(() => {
    if (isAuthenticated) {
      dbService.getCitas().then(data => { if (data) setAppointments(data); });
      dbService.getVentas().then(data => { if (data) setSales(data); });
      dbService.getInventario().then(data => { if (data) setItems(data); });
      dbService.getCategorias().then(data => { if (data && data.length > 0) setCategories(data); });
      dbService.getUsuarios().then(data => { 
        if (data && data.length > 0) {
          setUsers(data.map(u => ({
            ...u,
            avatar: u.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            commissionRate: u.commissionRate || 0.4
          })));
        } 
      });
    }
  }, [isAuthenticated]);"""

content = content.replace(old_use_effect, new_use_effect)

# Update handleAddCategory
old_handle_add_category = """  const handleAddCategory = (cat: string) => {
    if (cat && cat.trim() !== '') {
      const cleanCat = cat.trim();
      if (!categories.includes(cleanCat)) {
        setCategories([...categories, cleanCat]);
      }
    }
  };"""

new_handle_add_category = """  const handleAddCategory = async (cat: string) => {
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
content = content.replace(old_handle_add_category, new_handle_add_category)

with open('src/App.tsx', 'w') as f:
    f.write(content)
