import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_vars = """  const [users, setUsers] = useLocalStorage<User[]>('studio_users', INITIAL_USERS);
  const specialistAmbar = users[0] || INITIAL_USERS[0]; // Ámbar default
  const adminUser = users[2] || INITIAL_USERS[2]; // Admin default"""

new_vars = """  const [users, setUsers] = useLocalStorage<User[]>('studio_users', INITIAL_USERS);
  const specialistAmbar = users.find(u => u.role === 'specialist') || users[0] || INITIAL_USERS[0]; // Ámbar default
  const adminUser = users.find(u => u.role === 'admin') || users[0] || INITIAL_USERS[2]; // Admin default"""

content = content.replace(old_vars, new_vars)

with open('src/App.tsx', 'w') as f:
    f.write(content)
