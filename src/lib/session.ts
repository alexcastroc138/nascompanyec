export interface SessionUser {
  id: string;
  email: string;
  role: 'admin' | 'specialist' | string;
  name?: string;
  avatar?: string;
}

const TOKEN_COOKIE_NAME = 'auth_token';

/**
 * Sets the auth_token cookie with appropriate attributes.
 */
export function setSessionToken(user: SessionUser, daysValid: number = 7): void {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name || '',
    avatar: user.avatar || '',
    exp: Date.now() + daysValid * 24 * 60 * 60 * 1000
  });

  const encodedPayload = encodeURIComponent(payload);
  const expires = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toUTCString();
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

  document.cookie = `${TOKEN_COOKIE_NAME}=${encodedPayload}; Path=/; Expires=${expires}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

/**
 * Retrieves and validates the current session token from cookies.
 */
export function getSessionToken(): SessionUser | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === TOKEN_COOKIE_NAME && value) {
      try {
        const decoded = decodeURIComponent(value);
        const parsed = JSON.parse(decoded);
        if (parsed.exp && Date.now() > parsed.exp) {
          clearSessionToken();
          return null;
        }
        return {
          id: parsed.id,
          email: parsed.email,
          role: parsed.role,
          name: parsed.name,
          avatar: parsed.avatar
        };
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Clears the auth_token cookie completely.
 */
export function clearSessionToken(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax`;
}
