import re

with open('src/components/SpecialistDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update activeTab
content = content.replace(
    "useState<'dashboard' | 'pos' | 'calendar' | 'turn'>('dashboard')",
    "useState<'dashboard' | 'pos' | 'calendar' | 'turn' | 'ingresos'>('dashboard')"
)

# 2. Add Ingresos tab in sidebar
sidebar_btn = """            <button
              onClick={() => setActiveTab('ingresos')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer text-left ${
                activeTab === 'ingresos' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Receipt size={16} /><span>Ingresos / Historial</span>
            </button>"""

pos_btn = """            <button
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer text-left ${
                activeTab === 'pos' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <CreditCard size={16} /><span>POS / Facturación SRI</span>
            </button>"""

content = content.replace(pos_btn, pos_btn + "\n" + sidebar_btn)

# 3. Update handleRegistrarAbonoLocal
abono_func = """  const handleRegistrarAbonoLocal = (id: string, monto: number, metodoPago: string) => {
    if (!isCajaAbierta) {
      alert('¡Atención! No puedes registrar dinero si la caja está cerrada. Abre el turno de caja primero.');
      return;
    }

    // 1. Actualiza el estado de la cita (App.tsx)
    if (onAddAbono) {
      onAddAbono(id, monto, metodoPago);
    }

    // 2. Extraer datos para el recibo
    const apt = appointments.find(a => a.id === id);
    const clientName = apt?.cliente || apt?.customerName || 'Cliente';
    const serviceName = apt?.servicio || apt?.service || 'Reserva';

    // 3. Registrar el ingreso directo en CajaContext
    registrarVenta({
      monto: monto,
      metodoPago: metodoPago === 'cash' ? 'efectivo' : metodoPago === 'transfer' ? 'transferencia' : metodoPago === 'de_una' ? 'de_una' : 'tarjeta',
      comision: 0, // Los abonos no generan comisión hasta el cobro final
      descripcion: `Abono Reserva: ${clientName} - ${serviceName}`
    });

    // 4. Registrar en el Historial Global (sales)
    const mockInvoice = `REC-000${Math.floor(1000 + Math.random() * 9000)}`;
    onAddSale({
      id: 'abn_' + Date.now(),
      specialistId: currentUser.id,
      specialistName: currentUser.name,
      customerName: clientName,
      customerId: '9999999999999',
      customerEmail: 'N/A',
      customerAddress: 'N/A',
      items: [{ itemId: 'abono', name: `Abono: ${serviceName}`, price: monto, quantity: 1, category: 'Abono' }],
      subtotal: monto,
      commission: 0,
      paymentMethod: metodoPago as any,
      cashReceived: metodoPago === 'cash' ? monto : undefined,
      changeGiven: 0,
      timestamp: new Date().toISOString(),
      sriStatus: 'enviado_sri',
      invoiceNumber: mockInvoice
    });

    alert(`✅ Abono de $${monto.toFixed(2)} registrado exitosamente en caja mediante ${metodoPago.toUpperCase()}.`);
  };"""

old_abono_func = """  const handleRegistrarAbonoLocal = (id: string, monto: number, metodoPago: string) => {
    if (!isCajaAbierta) {
      alert('¡Atención! No puedes registrar dinero si la caja está cerrada. Abre el turno de caja primero.');
      return;
    }

    // 1. Actualiza el estado de la cita (App.tsx)
    if (onAddAbono) {
      onAddAbono(id, monto, metodoPago);
    }

    // 2. Extraer datos para el recibo
    const apt = appointments.find(a => a.id === id);
    const clientName = apt?.cliente || apt?.customerName || 'Cliente';
    const serviceName = apt?.servicio || apt?.service || 'Reserva';

    // 3. Registrar el ingreso directo en CajaContext
    registrarVenta({
      monto: monto,
      metodoPago: metodoPago as any,
      comision: 0, // Los abonos no generan comisión hasta el cobro final
      descripcion: `Abono Reserva: ${clientName} - ${serviceName}`
    });

    // 4. Registrar en el Historial Global (sales)
    const mockInvoice = `REC-000${Math.floor(1000 + Math.random() * 9000)}`;
    onAddSale({
      id: 'abn_' + Date.now(),
      specialistId: currentUser.id,
      specialistName: currentUser.name,
      customerName: clientName,
      customerId: '9999999999999',
      customerEmail: 'N/A',
      customerAddress: 'N/A',
      items: [{ itemId: 'abono', name: `Abono: ${serviceName}`, price: monto, quantity: 1, category: 'Abono' }],
      subtotal: monto,
      commission: 0,
      paymentMethod: metodoPago as any,
      cashReceived: metodoPago === 'efectivo' ? monto : undefined,
      changeGiven: 0,
      timestamp: new Date().toISOString(),
      sriStatus: 'enviado_sri',
      invoiceNumber: mockInvoice
    });

    alert(`✅ Abono de $${monto.toFixed(2)} registrado exitosamente en caja mediante ${metodoPago.toUpperCase()}.`);
  };"""

content = content.replace(old_abono_func, abono_func)


# 4. Remove HistorialVentas from pos
historial_pos = """              <div className="pt-6 border-t border-slate-200">
                <HistorialVentas sales={sales} />
              </div>
            </div>
          )}"""

historial_pos_replacement = """            </div>
          )}"""
content = content.replace(historial_pos, historial_pos_replacement)

# 5. Add Ingresos tab
ingresos_tab = """          {/* TAB: INGRESOS */}
          {activeTab === 'ingresos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 font-display">Historial de Ingresos</h1>
                  <p className="text-xs text-slate-500">Registro global de transacciones, ventas y abonos del estudio.</p>
                </div>
              </div>
              <div className="pt-2">
                <HistorialVentas sales={sales} />
              </div>
            </div>
          )}

          {/* TAB 3: CALENDAR */}"""

content = content.replace("          {/* TAB 3: CALENDAR */}", ingresos_tab)

with open('src/components/SpecialistDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
