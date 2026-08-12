with open('src/components/NewUserModal.tsx', 'r') as f:
    content = f.read()

import re

old_save = """    const userToSave: User = {
      id: initialUser?.id || `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      avatar: initialUser?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      commissionRate: commission / 100
    };"""

new_save = """    const userToSave: User = {
      id: initialUser?.id || `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      avatar: initialUser?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      commissionRate: commission / 100,
      password: password
    };"""

content = content.replace(old_save, new_save)
with open('src/components/NewUserModal.tsx', 'w') as f:
    f.write(content)
