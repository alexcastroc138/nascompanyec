import React, { useState, useEffect } from 'react';
import { X, UserPlus, Lock, Percent, Mail, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newUser: User) => void;
  initialUser?: User | null;
}

export default function NewUserModal({
  isOpen,
  onClose,
  onSave,
  initialUser
}: NewUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'specialist'>('specialist');
  const [commission, setCommission] = useState(40);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (initialUser) {
      setName(initialUser.name || '');
      setEmail(initialUser.email || '');
      setRole(initialUser.role || 'specialist');
      setCommission(Math.round((initialUser.commissionRate || 0.4) * 100));
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setRole('specialist');
      setCommission(40);
      setPassword('');
    }
  }, [initialUser, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const userToSave: User = {
      id: initialUser?.id || `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      avatar: initialUser?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      commissionRate: commission / 100,
      password: password
    };

    onSave(userToSave);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-black text-white rounded-xl">
              <UserPlus size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 font-display">
                {initialUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <p className="text-[11px] text-gray-500">
                Añadir o modificar información del personal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 block">
              Nombre Completo
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Sofía Mendoza"
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 block">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sofia@estudio.com"
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Rol
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'specialist')}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              >
                <option value="specialist">Especialista</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Comisión
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-full pl-3 pr-7 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 block">
              Contraseña {initialUser && '(Opcional)'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required={!initialUser}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
            >
              Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
