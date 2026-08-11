import React, { useState } from 'react';
import { 
  Building2, Users, Sliders, UserPlus, Edit, Trash2, 
  ShieldCheck, Check, Mail, Phone, MapPin, Globe, Bell, DollarSign, Key
} from 'lucide-react';
import { User } from '../types';
import NewUserModal from './NewUserModal';

interface SettingsPageProps {
  users: User[];
  onAddUser: (user: User) => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
}

export default function SettingsPage({
  users,
  onAddUser,
  onEditUser,
  onDeleteUser
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'agents' | 'preferences'>('agents');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Studio Profile Form State
  const [studioName, setStudioName] = useState('NAS COMPANY EC');
  const [studioRuc, setStudioRuc] = useState('1792345678001');
  const [studioAddress, setStudioAddress] = useState('Av. de los Shyris N34-12 y Portugal, Quito');
  const [studioPhone, setStudioPhone] = useState('+593 99 123 4567');
  const [profileSaved, setProfileSaved] = useState(false);

  // Preferences State
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSendSri, setAutoSendSri] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('USD');
  const [prefsSaved, setPrefsSaved] = useState(false);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = (user: User) => {
    if (editingUser && onEditUser) {
      onEditUser(user);
    } else {
      onAddUser(user);
    }
  };

  const handleDelete = (userId: string) => {
    if (onDeleteUser && window.confirm('¿Estás seguro de eliminar este usuario?')) {
      onDeleteUser(userId);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 3000);
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden antialiased font-sans">
      
      {/* Settings Container Layout: Left 25%, Right 75% */}
      <div className="flex flex-col md:flex-row min-h-[640px]">
        
        {/* Left Column (25% Menu Vertical) */}
        <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-gray-200/80 bg-gray-50/60 p-5 space-y-6 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-display">Configuración</h2>
            <p className="text-xs text-gray-500 mt-0.5">Administración global y equipo</p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                activeTab === 'profile'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Building2 size={16} />
              <span>Perfil del Estudio</span>
            </button>

            <button
              onClick={() => setActiveTab('agents')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                activeTab === 'agents'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users size={16} />
              <span>Gestión de Agentes</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                activeTab === 'preferences'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Sliders size={16} />
              <span>Preferencias</span>
            </button>
          </nav>
        </div>

        {/* Right Column (75% Content Pane) */}
        <div className="w-full md:w-3/4 p-8 space-y-6 bg-white">
          
          {/* TAB 1: GESTIÓN DE AGENTES */}
          {activeTab === 'agents' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 font-display">Gestión de Agentes</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Administra el personal, sus roles en el sistema y porcentaje de comisiones.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-2 shadow-xs cursor-pointer shrink-0"
                >
                  <UserPlus size={14} />
                  <span>+ Nuevo Usuario</span>
                </button>
              </div>

              {/* Clean Table */}
              <div className="border border-gray-200/80 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-4">Nombre</th>
                      <th className="p-4">Correo</th>
                      <th className="p-4">Rol</th>
                      <th className="p-4 text-right">Comisión</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/60 transition">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                            />
                            <span className="font-bold text-gray-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 font-mono text-[11px]">{u.email}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}
                          >
                            {u.role === 'admin' ? 'Administrador' : 'Especialista'}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-gray-900">
                          {Math.round((u.commissionRate || 0.4) * 100)}%
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition cursor-pointer"
                              title="Editar Usuario"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Eliminar Usuario"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PERFIL DEL ESTUDIO */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
              <div className="pb-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 font-display">Perfil del Estudio</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Información fiscal y datos de contacto de la matriz principal.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 block">Nombre del Estudio</label>
                  <input
                    type="text"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 block">RUC Tributario (SRI)</label>
                    <input
                      type="text"
                      value={studioRuc}
                      onChange={(e) => setStudioRuc(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 font-mono focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 block">Teléfono Principal</label>
                    <input
                      type="text"
                      value={studioPhone}
                      onChange={(e) => setStudioPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 block">Dirección Matriz</label>
                  <input
                    type="text"
                    value={studioAddress}
                    onChange={(e) => setStudioAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>

                {profileSaved && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                    <Check size={14} />
                    <span>Información del estudio actualizada correctamente.</span>
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PREFERENCIAS */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
              <div className="pb-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 font-display">Preferencias del Sistema</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configura el comportamiento general de facturación y alertas.
                </p>
              </div>

              <form onSubmit={handleSavePrefs} className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200/60">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Emisión Automática Facturación SRI</span>
                    <span className="text-[11px] text-gray-500 block">Enviar comprobantes electrónicos inmediatamente tras cobrar en POS.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSendSri}
                    onChange={(e) => setAutoSendSri(e.target.checked)}
                    className="w-4 h-4 accent-black rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200/60">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Alertas por Correo Electrónico</span>
                    <span className="text-[11px] text-gray-500 block">Notificar al administrador cuando un producto llegue a stock crítico.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-black rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 block">Moneda del Sistema</label>
                  <select
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="USD">USD ($ - Dólar Estadounidense Ecuador)</option>
                  </select>
                </div>

                {prefsSaved && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                    <Check size={14} />
                    <span>Preferencias guardadas exitosamente.</span>
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
                  >
                    Guardar Preferencias
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* New / Edit User Modal */}
      <NewUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        initialUser={editingUser}
      />
    </div>
  );
}
