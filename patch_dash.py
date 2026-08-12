import re

with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    content = f.read()

# Fix types in props
content = content.replace(
    "onReabrirCaja: (specialist?: User) => void;",
    "onReabrirCaja: (specialist?: User) => Promise<boolean> | void | any;"
)

old_handleOpenTurn = """  const handleOpenTurn = () => {
    try {
      if (isCajaAbierta) {
        alert('❌ La caja ya está abierta.');
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

new_handleOpenTurn = """  const handleOpenTurn = async () => {
    try {
      if (isCajaAbierta) {
        alert('❌ La caja ya está abierta.');
        return;
      }
      
      let finalTime = clockInTime;
      if (clockInTime === '09:00' || clockInTime === '09:00 AM' || !clockInTime) {
        finalTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        setClockInTime(finalTime);
      }
      
      const success = await onReabrirCaja(currentUser);
      if (success === false) {
        // failed (e.g. 403 box already open)
        // alert handled by App
        return;
      }
      
      setIsClockedIn(true);
      abrirCaja(0);
      alert('✅ Turno abierto correctamente. El POS ha sido desbloqueado.');
    } catch (error) {
      alert('❌ Ocurrió un error al intentar abrir la caja: ' + error);
    }
  };"""

content = content.replace(old_handleOpenTurn, new_handleOpenTurn)

with open('src/components/SpecialistDashboard.tsx', 'w') as f:
    f.write(content)
