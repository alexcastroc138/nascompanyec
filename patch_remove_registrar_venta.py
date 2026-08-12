import re

with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Remove registrarVenta in checkout (isPagoMixtoPOS block and else block)
old_pos_checkout = """    if (isPagoMixtoPOS) {
      if (parseFloat(montoEfectivoPOS || '0') > 0) {
        registrarVenta({ monto: parseFloat(montoEfectivoPOS), metodoPago: 'efectivo', comision: finalCommissionValue, descripcion: `[Mixto] ` + cart.map(c => `${c.quantity}x ${c.item.name}`).join(', ') });
      }
      if (parseFloat(montoTransferenciaPOS || '0') > 0) {
        registrarVenta({ monto: parseFloat(montoTransferenciaPOS), metodoPago: 'transferencia', comision: 0, descripcion: `[Mixto] ` + cart.map(c => `${c.quantity}x ${c.item.name}`).join(', ') });
      }
      if (parseFloat(montoDeUnaPOS || '0') > 0) {
        registrarVenta({ monto: parseFloat(montoDeUnaPOS), metodoPago: 'de_una', comision: 0, descripcion: `[Mixto] ` + cart.map(c => `${c.quantity}x ${c.item.name}`).join(', ') });
      }
      if (parseFloat(montoTarjetaPOS || '0') > 0) {
        registrarVenta({ monto: parseFloat(montoTarjetaPOS), metodoPago: 'tarjeta', comision: 0, descripcion: `[Mixto] ` + cart.map(c => `${c.quantity}x ${c.item.name}`).join(', ') });
      }
    } else {
      registrarVenta({
        monto: finalPayableTotal,
        metodoPago: paymentMethod === 'cash' ? 'efectivo' : paymentMethod === 'transfer' ? 'transferencia' : paymentMethod === 'de_una' ? 'de_una' : 'tarjeta',
        comision: finalCommissionValue,
        descripcion: cart.map(c => `${c.quantity}x ${c.item.name}`).join(', ')
      });
    }"""

new_pos_checkout = """    // La venta se guarda ÚNICAMENTE disparando onAddSale (evita duplicación)"""
content = content.replace(old_pos_checkout, new_pos_checkout)

# 2. Remove registrarVenta in handleProcesarAbonoACaja (Line 643-651)
old_abono_1 = """    // 3. Registrar el ingreso directo en CajaContext SOLO si es para hoy
    if (isToday) {
      registrarVenta({
        monto: monto,
        metodoPago: (metodoPago === 'cash' || metodoPago === 'efectivo') ? 'efectivo' : (metodoPago === 'transfer' || metodoPago === 'transferencia') ? 'transferencia' : metodoPago === 'de_una' ? 'de_una' : 'tarjeta',
        comision: 0, // Los abonos no generan comisión hasta el cobro final
        descripcion: `Abono Reserva HOY: ${clientName} - ${serviceName}`
      });
    }"""
new_abono_1 = """    // 3. La venta del abono se registra mediante onAddSale para evitar duplicación."""
content = content.replace(old_abono_1, new_abono_1)

# 3. Remove registrarVenta in onProcesarAbonoACaja prop ? Wait, is there another handle?
# Let's check for "Ingreso de Abono en Custodia a Caja"
old_abono_2 = """    registrarVenta({
      monto: monto,
      metodoPago: cajaPaymentMethod,
      comision: 0,
      descripcion: `Ingreso de Abono en Custodia a Caja: ${clientName} - ${serviceName}`
    });"""
new_abono_2 = """    // El ingreso de Abono a Caja Chica/Turno ya no duplica, usa onAddSale en lugar de registrarVenta directamente"""
content = content.replace(old_abono_2, new_abono_2)

# 4. Remove registrarVenta in handleSaveAppt (initial deposit)
old_abono_3 = """        // 1. Registrar el ingreso directo en CajaContext solo si es para hoy
        registrarVenta({
          monto: initialDeposit,
          metodoPago: cajaPaymentMethod,
          comision: 0,
          descripcion: `Abono Inicial Cita HOY: ${clientName} - ${serviceName}`,
          fecha: new Date().toISOString()
        });"""
new_abono_3 = """        // 1. La venta se guarda con onAddSale"""
content = content.replace(old_abono_3, new_abono_3)

with open('src/components/SpecialistDashboard.tsx', 'w') as f:
    f.write(content)
