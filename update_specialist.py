import re

with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "onAddAbono?: (id: string, monto: number) => void;",
    "onAddAbono?: (id: string, monto: number, metodoPago?: string) => void;"
)

content = content.replace(
    "const handleRegistrarAbonoLocal = (id: string, monto: number, metodoPago: string) => {",
    "const handleRegistrarAbonoLocal = (id: string, monto: number, metodoPago: string) => {"
)

with open('src/components/SpecialistDashboard.tsx', 'w') as f:
    f.write(content)
