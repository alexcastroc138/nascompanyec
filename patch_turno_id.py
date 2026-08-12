import re

with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    content = f.read()

# For Abono Inicial
old_abono_inicial = """        onAddSale({
          id: 'abn_ini_' + Date.now(),
          specialistId: currentUser.id,
          specialistName: currentUser.name,
          customerName: clientName,"""
new_abono_inicial = """        onAddSale({
          id: 'abn_ini_' + Date.now(),
          specialistId: currentUser.id,
          specialistName: currentUser.name,
          turnoId: isCajaAbierta && cierreCajaActiva ? cierreCajaActiva.id : undefined,
          customerName: clientName,"""
content = content.replace(old_abono_inicial, new_abono_inicial)

# Check if there are other places where `onAddSale` is called without `turnoId`?
# In POS checkout, we already added it in a previous patch? Let's check `turnoId: isCajaAbierta && cierreCajaActiva ? cierreCajaActiva.id : undefined,`
# Wait, let's just make sure we also add it to `handleRegistrarAbonoLocal` if it doesn't have it.
old_abono = """      onAddSale({
        id: 'abn_' + Date.now(),
        specialistId: currentUser.id,
        specialistName: currentUser.name,
        customerName: clientName,"""
new_abono = """      onAddSale({
        id: 'abn_' + Date.now(),
        specialistId: currentUser.id,
        specialistName: currentUser.name,
        turnoId: isCajaAbierta && cierreCajaActiva ? cierreCajaActiva.id : undefined,
        customerName: clientName,"""
content = content.replace(old_abono, new_abono)

old_abono_caja = """    onAddSale({
      id: 'abn_caja_' + Date.now(),
      specialistId: currentUser.id,
      specialistName: currentUser.name,
      customerName: clientName,"""
new_abono_caja = """    onAddSale({
      id: 'abn_caja_' + Date.now(),
      specialistId: currentUser.id,
      specialistName: currentUser.name,
      turnoId: isCajaAbierta && cierreCajaActiva ? cierreCajaActiva.id : undefined,
      customerName: clientName,"""
content = content.replace(old_abono_caja, new_abono_caja)

with open('src/components/SpecialistDashboard.tsx', 'w') as f:
    f.write(content)
