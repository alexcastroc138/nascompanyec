import re

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

# Introduce currentUser state
app_content = app_content.replace("  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);", "  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);\n  const [currentUser, setCurrentUser] = useState<any>(null);")

# Update useEffect for session
old_use_effect = """  useEffect(() => {
    const session = getSessionToken();
    if (session) {
      setIsAuthenticated(true);
      setCurrentRole(session.role as 'admin' | 'specialist');
    } else {
      setIsAuthenticated(false);
    }
  }, []);"""
new_use_effect = """  useEffect(() => {
    const session = getSessionToken();
    if (session) {
      setIsAuthenticated(true);
      setCurrentRole(session.role as 'admin' | 'specialist');
      setCurrentUser(session);
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, []);"""
app_content = app_content.replace(old_use_effect, new_use_effect)

# Update handleLogin
old_handle_login = """  const handleLogin = (role: 'admin' | 'specialist', email: string) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    setAdminActiveTab('overview');
    triggerNotification(`Sesión iniciada correctamente como ${role === 'admin' ? 'Administrador' : 'Especialista'}.`);
  };"""
new_handle_login = """  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setCurrentRole(user.role as 'admin' | 'specialist');
    setIsAuthenticated(true);
    setAdminActiveTab('overview');
    triggerNotification(`Sesión iniciada correctamente como ${user.role === 'admin' ? 'Administrador' : 'Especialista'}.`);
  };"""
app_content = app_content.replace(old_handle_login, new_handle_login)

# Update handleLogout
app_content = app_content.replace("    clearSessionToken();\n    setIsAuthenticated(false);", "    clearSessionToken();\n    setIsAuthenticated(false);\n    setCurrentUser(null);")

# Replace hardcoded specialistAmbar with currentUser fallback
old_ambar = "  const specialistAmbar = users.find(u => u.role === 'specialist') || users[0] || INITIAL_USERS[0]; // Ámbar default"
new_ambar = "  const specialistAmbar = currentUser || users.find(u => u.role === 'specialist') || users[0] || INITIAL_USERS[0];"
app_content = app_content.replace(old_ambar, new_ambar)

old_admin = "  const adminUser = users.find(u => u.role === 'admin') || users[0] || INITIAL_USERS[2]; // Admin default"
new_admin = "  const adminUser = currentUser || users.find(u => u.role === 'admin') || users[0] || INITIAL_USERS[2];"
app_content = app_content.replace(old_admin, new_admin)

with open('src/App.tsx', 'w') as f:
    f.write(app_content)
