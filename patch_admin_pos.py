import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# Replace all occurrences of `const cat = (item.category || '').toLowerCase();`
content = content.replace("const cat = (item.category || '').toLowerCase();", "const catStr = typeof item.category === 'string' ? item.category : ((item.category as any)?.nombre || '');\n      const cat = catStr.toLowerCase();")
content = content.replace("const cat = (i.category || '').toLowerCase();", "const catStr = typeof i.category === 'string' ? i.category : ((i.category as any)?.nombre || '');\n        const cat = catStr.toLowerCase();")
content = content.replace("const cat = (it.category || '').toLowerCase();", "const catStr = typeof it.category === 'string' ? it.category : ((it.category as any)?.nombre || '');\n            const cat = catStr.toLowerCase();")

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)

