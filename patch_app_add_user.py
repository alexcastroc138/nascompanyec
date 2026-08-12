import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_add_user = """  const handleAddUser = (newUser: User) => {
    setUsers([...users, newUser]);
    triggerNotification(`Usuario/Agente "${newUser.name}" registrado correctamente.`);
  };"""

new_add_user = """  const handleAddUser = async (newUser: User) => {
    try {
      const success = await dbService.saveUsuario(newUser);
      if (success) {
        dbService.getUsuarios().then(data => { if (data && data.length > 0) setUsers(data); });
        triggerNotification(`Usuario/Agente "${newUser.name}" registrado correctamente.`);
      } else {
        triggerNotification(`Error al crear usuario "${newUser.name}" en la base de datos.`);
      }
    } catch (e) {
      triggerNotification(`Error de red al crear usuario.`);
    }
  };"""

content = content.replace(old_add_user, new_add_user)

old_useEffect = """  useEffect(() => {
    if (isAuthenticated) {
      dbService.getCitas().then(data => { if (data) setAppointments(data); });
      dbService.getVentas().then(data => { if (data) setSales(data); });
      dbService.getInventario().then(data => { if (data) setItems(data); });
    }
  }, [isAuthenticated]);"""

new_useEffect = """  useEffect(() => {
    if (isAuthenticated) {
      dbService.getCitas().then(data => { if (data) setAppointments(data); });
      dbService.getVentas().then(data => { if (data) setSales(data); });
      dbService.getInventario().then(data => { if (data) setItems(data); });
      dbService.getUsuarios().then(data => { if (data && data.length > 0) setUsers(data); });
    }
  }, [isAuthenticated]);"""

content = content.replace(old_useEffect, new_useEffect)

with open('src/App.tsx', 'w') as f:
    f.write(content)
