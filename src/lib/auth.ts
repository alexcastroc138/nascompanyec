import { SessionUser, setSessionToken, getSessionToken, clearSessionToken } from './session';

export type Role = 'admin' | 'specialist' | 'cajero';

export interface LoginResult {
  success: boolean;
  user?: SessionUser;
  error?: string;
}

/**
 * Realiza la autenticación asíncrona segura mediante la API PHP en Hostinger (/api/auth/login.php)
 */
export async function authenticateCredentials(email: string, pass: string): Promise<LoginResult> {
  const cleanEmail = email.trim().toLowerCase();
  
  // URL base de la API definida en VITE_API_URL o relativa /api/auth/login.php
  const baseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '');
  const endpoint = `${baseUrl}/api/auth/login.php`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        password: pass,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === 'success' && data.user) {
      // Mapear el rol a la estructura interna del frontend React
      const mappedRole = (data.user.role === 'admin') ? 'admin' : 'specialist';
      
      const sessionUser: SessionUser = {
        id: data.user.id || 'usr_' + Date.now(),
        email: data.user.email,
        role: mappedRole,
        name: data.user.name || data.user.email,
        avatar: data.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };

      setSessionToken(sessionUser);
      return { success: true, user: sessionUser };
    } else {
      return {
        success: false,
        error: data.message || 'Credenciales incorrectas. Verifica el correo y la contraseña.'
      };
    }
  } catch (err: any) {
    console.error('Error al conectar con la API de autenticación PHP:', err);
    return {
      success: false,
      error: 'No se pudo conectar con el servidor PHP (/api/auth/login.php). Revisa tu conexión.'
    };
  }
}

/**
 * Checks if current user possesses the required role or roles.
 */
export function hasRole(currentRole: string, allowedRoles: string | string[]): boolean {
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(currentRole);
  }
  return currentRole === allowedRoles;
}

/**
 * Redirect path mapper based on role.
 */
export function getRedirectPath(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'specialist':
    case 'cajero':
      return '/especialista';
    default:
      return '/login';
  }
}

/**
 * Logout utility function.
 */
export function logout(): void {
  clearSessionToken();
}

export { getSessionToken, setSessionToken, clearSessionToken };
