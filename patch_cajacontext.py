import re

with open('src/context/CajaContext.tsx', 'r') as f:
    content = f.read()

old_abrir = """  const abrirCaja = (monto: number = 0) => {
    setMontoInicial(monto);
    setIsCajaAbierta(true);
    setVentasDelTurno([]);
    abrirTurnoApi(monto).catch((err) => {
      console.warn('Caja offline: operacion local.');
    });
  };"""

new_abrir = """  const abrirCaja = (monto: number = 0) => {
    setMontoInicial(monto);
    setIsCajaAbierta(true);
    setVentasDelTurno([]);
    // La app maneja la creacion en dbService, asi que la llamada duplicada aqui
    // se maneja en silencio si retorna 403.
    abrirTurnoApi(monto).catch((err) => {
      console.warn('Caja sync error/403:', err);
    });
  };"""

content = content.replace(old_abrir, new_abrir)

with open('src/context/CajaContext.tsx', 'w') as f:
    f.write(content)
