import React, { useState } from 'react';
import { AlertCircle, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { authenticateCredentials } from '../lib/auth';

interface LoginPageProps {
  onLogin: (role: 'admin' | 'specialist', email: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authenticateCredentials(email, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLogin(result.user.role as 'admin' | 'specialist', result.user.email);
      } else {
        setError(result.error || 'Credenciales incorrectas.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Error al procesar la autenticación. Intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4 antialiased font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200/80 shadow-xs p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mx-auto text-xs font-black tracking-tight shadow-xs font-display">
            NAS
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight font-display">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Accede al sistema de gestión de NAS COMPANY EC
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 block">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition duration-150 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 block">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition duration-150 disabled:opacity-50"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-lg flex items-center space-x-2 text-rose-700 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-black hover:bg-neutral-800 disabled:bg-gray-400 text-white text-xs font-semibold rounded-lg transition duration-150 flex items-center justify-center space-x-2 shadow-xs cursor-pointer active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Validando...</span>
              </>
            ) : (
              <>
                <span>Ingresar</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
