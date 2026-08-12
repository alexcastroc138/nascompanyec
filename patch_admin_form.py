import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

email_field = """              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={userFormData.email || ''}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="ejemplo@estudio.com"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black"
                />
              </div>"""

password_field = """              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Contraseña {userFormData.id ? '(Dejar vacío para no cambiar)' : '*'}
                </label>
                <input
                  type="password"
                  required={!userFormData.id}
                  value={userFormData.password || ''}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-black"
                />
              </div>"""

content = content.replace(email_field, email_field + '\n' + password_field)

# Add password to newUser
newUser_code = """                  const newUser: User = {
                    id: `usr_${Date.now()}`,
                    name: userFormData.name.trim(),
                    email: userFormData.email.trim(),
                    role: userFormData.role || 'specialist',
                    commissionRate: Number(userFormData.commissionRate) ?? 0.40,
                    shiftSchedule: userFormData.shiftSchedule || 'turno_manana',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    phone: ''
                  };"""

newUser_code_repl = """                  const newUser: User = {
                    id: `usr_${Date.now()}`,
                    name: userFormData.name.trim(),
                    email: userFormData.email.trim(),
                    password: userFormData.password,
                    role: userFormData.role || 'specialist',
                    commissionRate: Number(userFormData.commissionRate) ?? 0.40,
                    shiftSchedule: userFormData.shiftSchedule || 'turno_manana',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    phone: ''
                  };"""
content = content.replace(newUser_code, newUser_code_repl)


with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
