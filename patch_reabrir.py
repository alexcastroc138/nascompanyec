import re

with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    content = f.read()

old_timbrar = """  const handleTimbrarEntrada = () => {
    try {
      if (isCajaAbierta) {
        alert('❌ La caja ya se encuentra abierta. Ve al POS para registrar ventas.');
        return;
      }
      
      let finalTime = clockInTime;
      if (clockInTime === '09:00' || clockInTime === '09:00 AM' || !clockInTime) {
        finalTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        setClockInTime(finalTime);
      }
      
      setIsClockedIn(true);
      abrirCaja(0);
      onReabrirCaja(currentUser);
      alert('✅ Turno abierto correctamente. El POS ha sido desbloqueado.');
    } catch (error) {
      alert('❌ Ocurrió un error al intentar abrir la caja: ' + error);
    }
  };"""

new_timbrar = """  const handleTimbrarEntrada = async () => {
    try {
      if (isCajaAbierta) {
        alert('❌ La caja ya se encuentra abierta. Ve al POS para registrar ventas.');
        return;
      }
      
      let finalTime = clockInTime;
      if (clockInTime === '09:00' || clockInTime === '09:00 AM' || !clockInTime) {
        finalTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        setClockInTime(finalTime);
      }
      
      const success = await onReabrirCaja(currentUser);
      if (success === false) {
        return;
      }
      
      setIsClockedIn(true);
      abrirCaja(0);
      alert('✅ Turno abierto correctamente. El POS ha sido desbloqueado.');
    } catch (error) {
      alert('❌ Ocurrió un error al intentar abrir la caja: ' + error);
    }
  };"""

content = content.replace(old_timbrar, new_timbrar)

old_reabrir = """  const handleReabrirTurnoCompletamente = () => {
    onReabrirCaja(currentUser); 
    abrirCaja(0); 
    
    const timeString = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setClockInTime(timeString);
    setClockOutTime('Sin registrar');
    setIsClockedIn(true);
    setIsClockedOut(false);
    setDeclaredCash('');
    setClosingNotes('');
  };"""

new_reabrir = """  const handleReabrirTurnoCompletamente = async () => {
    const success = await onReabrirCaja(currentUser); 
    if (success === false) {
      return;
    }
    abrirCaja(0); 
    
    const timeString = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setClockInTime(timeString);
    setClockOutTime('Sin registrar');
    setIsClockedIn(true);
    setIsClockedOut(false);
    setDeclaredCash('');
    setClosingNotes('');
  };"""

content = content.replace(old_reabrir, new_reabrir)

with open('src/components/SpecialistDashboard.tsx', 'w') as f:
    f.write(content)
