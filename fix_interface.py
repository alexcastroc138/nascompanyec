with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace("interface AdminDashboardProps {", "interface AdminDashboardProps {\n  activeTab: string;")

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)

