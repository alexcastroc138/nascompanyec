import re

with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    content = f.read()

old_logic = """  const getSubtotalsForTurn = () => {
    if (!isCajaAbierta || !cierreCajaActiva) return { efectivo: 0, transferencia: 0, de_una: 0, tarjeta: 0 };
    
    let efec = 0, trans = 0, de_una = 0, tarj = 0;

    // 1. Calcular ingresos usando las ventas globales para poder desestructurar el pago mixto (detalles_json / items)
    // Buscamos las ventas que pertenecen a este turno (ya sea por turnoId explícito o por rango de tiempo)
    const salesTurno = sales.filter(s => {
      if (s.turnoId === cierreCajaActiva.id) return true;
      if (s.timestamp && s.timestamp >= cierreCajaActiva.startTime) {
        if (!cierreCajaActiva.endTime) return true;
        return s.timestamp <= cierreCajaActiva.endTime;
      }
      return false;
    });"""

new_logic = """  const getSubtotalsForTurn = () => {
    if (!isCajaAbierta) return { efectivo: 0, transferencia: 0, de_una: 0, tarjeta: 0 };
    
    let efec = 0, trans = 0, de_una = 0, tarj = 0;

    // 1. Calcular ingresos usando las ventas globales para poder desestructurar el pago mixto (detalles_json / items)
    // Buscamos las ventas del día de hoy (como en los otros bloques) para evitar fallos si falta cierreCajaActiva
    const today = new Date().toISOString().split('T')[0];
    const salesTurno = sales.filter(s => s.timestamp && s.timestamp.startsWith(today));"""

content = content.replace(old_logic, new_logic)

with open('src/components/SpecialistDashboard.tsx', 'w') as f:
    f.write(content)
