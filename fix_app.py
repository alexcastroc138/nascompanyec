import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

idx = content.find("/* ADMINISTRATOR ADVANCED COHESIVE SIDEBAR WORKSPACE */")
if idx != -1:
    content = content[:idx] + """/* ADMINISTRATOR ADVANCED COHESIVE SIDEBAR WORKSPACE */
          <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 w-full overflow-hidden">
            {/* Admin Left Sidebar */}
            <aside className="w-64 bg-black text-white h-screen flex flex-col justify-between p-4 flex-shrink-0 overflow-y-auto border-r border-slate-800">
              <div>
                {/* Brand / Logo Admin */}
                <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-white text-black font-extrabold flex items-center justify-center text-xs">
                    AD
                  </div>
                  <div>
                    <h1 className="text-xs font-bold text-white tracking-tight">Admin Console</h1>
                    <p className="text-[10px] text-slate-400 font-medium">BODYART ECUADOR</p>
                  </div>
                </div>

                {/* LISTA VERTICAL DE NAVEGACIÓN */}
                <nav className="space-y-1">
                  {[
                    { id: 'overview', label: 'Inicio / Dashboard', icon: LayoutDashboard },
                    { id: 'reports', label: '📊 Reportes BI', icon: BarChart3 },
                    { id: 'cajas', label: 'Control Cajas', icon: Wallet },
                    { id: 'inventory', label: 'Inventario e Insumos', icon: Package },
                    { id: 'promos', label: 'Promociones', icon: Tag },
                    { id: 'agents', label: 'Gestión de Agentes', icon: Users },
                    { id: 'time', label: 'Horas Extras / Asistencia', icon: Clock },
                    { id: 'calendar', label: 'Agenda y Citas', icon: Calendar },
                    { id: 'alerts', label: 'Alertas Stock', icon: Bell },
                    { id: 'sri', label: 'Auditoría Recibos', icon: FileText },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = adminActiveTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setAdminActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-white text-black shadow-sm font-extrabold'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* SECCIÓN SISTEMA (AL PIE DEL SIDEBAR) */}
              <div className="pt-4 border-t border-slate-800 space-y-1">
                <button
                  type="button"
                  onClick={() => setAdminActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    adminActiveTab === 'settings'
                      ? 'bg-white text-black shadow-sm font-extrabold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Settings size={16} />
                  <span>Configuración</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentRole('specialist');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left text-slate-400 hover:bg-slate-900 hover:text-white"
                >
                  <Users size={16} />
                  <span>Vista Especialista</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 mt-2"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </aside>

            {/* Central Admin Panel Pane */}
            <main className="flex-1 overflow-y-auto p-5 bg-slate-50 h-screen">
              <div className="max-w-7xl mx-auto space-y-5">
                {adminActiveTab === 'settings' ? (
                  <SettingsPage
                    users={users}
                    onAddUser={handleAddUser}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                  />
                ) : (
                  <AdminDashboard
                    activeTab={adminActiveTab}
                    users={users}
                    items={items}
                    appointments={appointments}
                    sales={sales}
                    cierres={cierres}
                    promos={promos}
                    categories={categories}
                    timeEntries={timeEntries}
                    emailAlerts={emailAlerts}
                    expenses={expenses}
                    onRestock={handleRestock}
                    onRetrySRI={handleRetrySRI}
                    onAddItem={handleAddItem}
                    onEditItem={handleEditItem}
                    onDeleteItem={handleDeleteItem}
                    onAddPromo={handleAddPromo}
                    onEditPromo={handleEditPromo}
                    onTogglePromo={handleTogglePromo}
                    onDeletePromo={handleDeletePromo}
                    onAddCategory={handleAddCategory}
                    onAddUser={handleAddUser}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                  />
                )}
              </div>
            </main>
          </div>
        )}
      </div>
    </CajaProvider>
  );
}
"""

with open('src/App.tsx', 'w') as f:
    f.write(content)
