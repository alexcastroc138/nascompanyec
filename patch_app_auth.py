import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_use_effect = """      dbService.getUsuarios().then(data => { if (data && data.length > 0) setUsers(data); });"""
new_use_effect = """      dbService.getUsuarios().then(data => { 
        if (data && data.length > 0) {
          setUsers(data.map(u => ({
            ...u,
            avatar: u.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            commissionRate: u.commissionRate || 0.4
          })));
        } 
      });"""

content = content.replace(old_use_effect, new_use_effect)

with open('src/App.tsx', 'w') as f:
    f.write(content)
