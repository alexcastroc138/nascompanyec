with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    content = f.read()

import re

# Insert the constants
old_start = """  // Consume CajaContext
  const { isCajaAbierta, montoInicial, ventasDelTurno, abrirCaja, cerrarCaja, registrarVenta } = useCaja();"""

new_start = """  // Data Isolation
  const isAdmin = currentUser?.role === 'admin';
  const filteredSales = isAdmin ? sales : sales.filter(s => s.specialistId === currentUser?.id || s.specialistName === currentUser?.name);
  const filteredExpenses = isAdmin ? expenses : expenses.filter(e => e.specialistId === currentUser?.id || e.specialistName === currentUser?.name);

  // Consume CajaContext
  const { isCajaAbierta, montoInicial, ventasDelTurno, abrirCaja, cerrarCaja, registrarVenta } = useCaja();"""

content = content.replace(old_start, new_start)

# Replace usages
content = content.replace("const ventasGlobalesArtista = sales.filter(s => s.specialistId === currentUser.id);", "const ventasGlobalesArtista = filteredSales.filter(s => s.specialistId === currentUser.id);")
content = content.replace("const salesTurno = sales.filter(s => s.timestamp && s.timestamp.startsWith(today));", "const salesTurno = filteredSales.filter(s => s.timestamp && s.timestamp.startsWith(today));")
content = content.replace("const salesHoy = sales.filter(s => s.timestamp && s.timestamp.startsWith(hoyStr));", "const salesHoy = filteredSales.filter(s => s.timestamp && s.timestamp.startsWith(hoyStr));")
content = content.replace("<HistorialVentas sales={sales} expenses={expenses} />", "<HistorialVentas sales={filteredSales} expenses={filteredExpenses} />")

# Verify expense calculation uses filteredExpenses
# Is there an expense calculation for Cierre de Caja? Let's check.

with open('src/components/SpecialistDashboard.tsx', 'w') as f:
    f.write(content)
