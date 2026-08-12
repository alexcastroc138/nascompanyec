import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_reabrir = """  const handleReabrirCaja = async (specialist?: User) => {
    const specId = specialist?.id || '1';
    const specName = specialist?.name || 'Ámbar Piercing';

    const freshTurn: CierreCaja = {
      id: 'c_active_' + Date.now(),
      specialistId: specId,
      specialistName: specName,
      startTime: new Date().toISOString(),
      totalSales: 0,
      totalCommissions: 0,
      cashExpected: 0,
      status: 'abierta'
    };

    setActiveTurn(freshTurn);
    
    await dbService.abrirTurno({
      id: freshTurn.id,
      specialistId: freshTurn.specialistId,
      specialistName: freshTurn.specialistName,
      startTime: freshTurn.startTime,
      status: 'abierta'
    });
  };"""

new_reabrir = """  const handleReabrirCaja = async (specialist?: User): Promise<boolean> => {
    const specId = specialist?.id || '1';
    const specName = specialist?.name || 'Ámbar Piercing';

    const freshTurn: CierreCaja = {
      id: 'c_active_' + Date.now(),
      specialistId: specId,
      specialistName: specName,
      startTime: new Date().toISOString(),
      totalSales: 0,
      totalCommissions: 0,
      cashExpected: 0,
      status: 'abierta'
    };

    const result = await dbService.abrirTurno({
      id: freshTurn.id,
      specialistId: freshTurn.specialistId,
      specialistName: freshTurn.specialistName,
      startTime: freshTurn.startTime,
      status: 'abierta'
    });
    
    if (!result.success) {
      triggerNotification(result.message || 'Error al abrir caja');
      return false;
    }

    setActiveTurn(freshTurn);
    return true;
  };"""

content = content.replace(old_reabrir, new_reabrir)

with open('src/App.tsx', 'w') as f:
    f.write(content)
