with open('src/App.tsx', 'r') as f:
    content = f.read()

import re

# 1. Replace useLocalStorage with useState for users
old_users_state = "  const [users, setUsers] = useLocalStorage<User[]>('studio_users', INITIAL_USERS);"
new_users_state = """  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  useEffect(() => {
    dbService.getUsuarios().then(data => {
      if (data && data.length > 0) {
        setUsers(data.map(u => ({
          ...u,
          avatar: u.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          commissionRate: u.commissionRate || 0.4
        })));
      }
    });
  }, []);"""

content = content.replace(old_users_state, new_users_state)

# 2. Replace handleAddUser
old_add_user = """  const handleAddUser = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
  };"""

new_add_user = """  const handleAddUser = async (newUser: User) => {
    const success = await dbService.saveUsuario(newUser);
    if (success) {
      triggerNotification(`Usuario ${newUser.name} creado exitosamente.`);
      dbService.getUsuarios().then(data => {
        if (data && data.length > 0) {
          setUsers(data.map(u => ({
            ...u,
            avatar: u.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            commissionRate: u.commissionRate || 0.4
          })));
        }
      });
    } else {
      triggerNotification('Error al crear usuario.');
    }
  };"""

content = content.replace(old_add_user, new_add_user)

with open('src/App.tsx', 'w') as f:
    f.write(content)
