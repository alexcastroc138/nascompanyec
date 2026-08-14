import re

# Update AdminDashboard.tsx
with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# Replace all occurrences of the hardcoded fallback
old_str = "(props.categories && props.categories.length > 0 ? props.categories : ['Servicios', 'Joyería', 'Piezas', 'Smoke Shop', 'Boutique', 'Ropa']).map(c => ("
new_str = "(props.categories || []).map(c => ("
content = content.replace(old_str, new_str)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)

# Update SpecialistDashboard.tsx
with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    content = f.read()

old_default = "  categories = ['Servicios', 'Joyería', 'Piezas', 'Smoke Shop', 'Boutique', 'Ropa'],"
new_default = "  categories = [],"
content = content.replace(old_default, new_default)

old_str_specialist = "{['Todos', ...(categories && categories.length > 0 ? categories : ['Servicios', 'Joyería', 'Piezas', 'Smoke Shop', 'Boutique', 'Ropa'])].map(cat => {"
new_str_specialist = "{['Todos', ...(categories || [])].map(cat => {"
content = content.replace(old_str_specialist, new_str_specialist)

with open('src/components/SpecialistDashboard.tsx', 'w') as f:
    f.write(content)

# Update App.tsx
with open('src/App.tsx', 'r') as f:
    app_content = f.read()

old_app_default = "const [categories, setCategories] = useState<string[]>(['Servicios', 'Joyería', 'Piezas', 'Smoke Shop', 'Boutique', 'Ropa']);"
new_app_default = "const [categories, setCategories] = useState<string[]>([]);"
app_content = app_content.replace(old_app_default, new_app_default)

with open('src/App.tsx', 'w') as f:
    f.write(app_content)
