import re

with open('src/components/LoginPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("  onLogin: (role: 'admin' | 'specialist', email: string) => void;", "  onLogin: (user: any) => void;")
content = content.replace("        onLogin(result.user.role as 'admin' | 'specialist', result.user.email);", "        onLogin(result.user);")

with open('src/components/LoginPage.tsx', 'w') as f:
    f.write(content)
