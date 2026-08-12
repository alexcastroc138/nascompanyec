import React, { useState } from 'react';
import { Home, CreditCard, Calendar, User, LogOut, X, ShieldCheck, Wallet, BarChart3 } from 'lucide-react';
import { SessionUser } from '../../lib/session';

interface BottomNavProps {
  activeTab: 'dashboard' | 'pos' | 'calendar' | 'turn' | 'ingresos' | string;
  onSelectTab: (tab: 'dashboard' | 'pos' | 'calendar' | 'turn' | 'ingresos') => void;
  currentUser: SessionUser | null;
  onLogout: () => void;
}

export default function BottomNav({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout
}: BottomNavProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleTabClick = (tab: 'dashboard' | 'pos' | 'calendar' | 'turn' | 'ingresos') => {
    setIsProfileOpen(false);
    onSelectTab(tab);
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-md z-40 flex items-center justify-around px-1 font-sans">
        
        {/* 🏠 Inicio */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition cursor-pointer ${
            activeTab === 'dashboard' && !isProfileOpen
              ? 'text-black font-bold'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <Home size={18} />
          <span className="text-[10px] tracking-tight">Inicio</span>
        </button>

        {/* 💳 POS */}
        <button
          onClick={() => handleTabClick('pos')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition cursor-pointer ${
            activeTab === 'pos' && !isProfileOpen
              ? 'text-black font-bold'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <CreditCard size={18} />
          <span className="text-[10px] tracking-tight">POS</span>
        </button>

        {/* 📅 Agenda */}
        <button
          onClick={() => handleTabClick('calendar')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition cursor-pointer ${
            activeTab === 'calendar' && !isProfileOpen
              ? 'text-black font-bold'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <Calendar size={18} />
          <span className="text-[10px] tracking-tight">Agenda</span>
        </button>

        {/* 🔒 Cerrar Caja / Turno */}
        <button
          onClick={() => handleTabClick('turn')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition cursor-pointer ${
            activeTab === 'turn' && !isProfileOpen
              ? 'text-black font-bold'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <Wallet size={18} />
          <span className="text-[10px] tracking-tight font-semibold">Caja/Turno</span>
        </button>

        {/* 📊 Ingresos */}
        <button
          onClick={() => handleTabClick('ingresos')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition cursor-pointer ${
            activeTab === 'ingresos' && !isProfileOpen
              ? 'text-black font-bold'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <BarChart3 size={18} />
          <span className="text-[10px] tracking-tight">Ingresos</span>
        </button>

        {/* 👤 Perfil */}
        <button
          onClick={() => setIsProfileOpen(true)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 transition cursor-pointer ${
            isProfileOpen
              ? 'text-black font-bold'
              : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <User size={18} />
          <span className="text-[10px] tracking-tight">Perfil</span>
        </button>
      </nav>

      {/* Profile Mobile Drawer / Popover */}
      {isProfileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200"
          onClick={() => setIsProfileOpen(false)}
        >
          <div 
            className="w-full bg-white rounded-t-2xl p-6 space-y-5 border-t border-gray-200 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-[10px] font-black font-display">
                  NAS
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 font-display">Mi Perfil</h3>
                  <p className="text-[11px] text-gray-500">Sesión de Usuario</p>
                </div>
              </div>

              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {currentUser?.name || 'Usuario'}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono truncate">
                    {currentUser?.email || 'correo@ejemplo.com'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                <span className="text-gray-500">Rol asignado:</span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wider bg-black text-white">
                  {currentUser?.role === 'admin' ? 'Administrador' : 'Especialista'}
                </span>
              </div>
            </div>

            {/* Direct Cerrar Caja / Turno Action Button in Drawer */}
            <button
              onClick={() => handleTabClick('turn')}
              className="w-full py-3 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <Wallet size={16} />
              <span>Cerrar Turno / Arqueo de Caja</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                setIsProfileOpen(false);
                onLogout();
              }}
              className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
