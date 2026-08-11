import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# Replace any remaining text-3xl or text-4xl with text-xl font-extrabold
content = content.replace("text-3xl", "text-xl font-extrabold")
content = content.replace("text-4xl", "text-xl font-extrabold")

# Ensure KPI labels are updated 
# Old labels might be text-xs or text-sm, we should make them text-[11px] font-semibold text-slate-500 uppercase tracking-wider
# Let's replace uppercase tracking-wider classes with the correct label classes
content = re.sub(r'text-(xs|sm)\s+font-extrabold\s+text-(slate|rose|emerald|amber)-\d00\s+uppercase\s+tracking-wider', 
                 lambda m: f"text-[11px] font-semibold text-{m.group(2)}-500 uppercase tracking-wider", content)
                 
# Specifically fix text-base font-bold for section titles if any text-xl or text-lg font-bold remain
content = re.sub(r'text-(xl|lg|2xl)\s+font-bold\s+text-slate-900', 'text-base font-bold text-slate-900', content)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)

