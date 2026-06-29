import axios from '@/lib/axios';

const SESSION_KEY = 'movie_auth_session';

function extractMessage(raw: unknown): string | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw.join(', ');
  if (typeof raw === 'string') return raw;
  return null;
}

function setAuthCookies(token: string, role: string) {
  const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
  document.cookie = `auth_token=${token};expires=${expires};path=/;SameSite=Strict`;
  document.cookie = `auth_role=${role};expires=${expires};path=/;SameSite=Strict`;
}

function clearAuthCookies() {
  const past = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `auth_token=;expires=${past};path=/;SameSite=Strict`;
  document.cookie = `auth_role=;expires=${past};path=/;SameSite=Strict`;
}

// Mapeo directo de IDs de roles a nombres
const ROLE_MAP: Record<number, string> = {
  1: 'ADMIN',
  2: 'CLIENTE',
  3: 'RECEPCIONISTA',
};

// Tries multiple strategies to get the role name string from the backend.
async function fetchRoleName(accessToken: string, idRol?: number): Promise<string> {
  // Si tenemos el ID, usamos nuestro mapeo local que es seguro y rápido
  if (idRol !== undefined && ROLE_MAP[idRol]) {
    return ROLE_MAP[idRol];
  }

  // Fallback si no tenemos el ID o no está en el mapa
  const headers = { Authorization: `Bearer ${accessToken}` };
  try {
    const { data } = await axios.get('/auth/profile', { headers });
    const role = data.role ?? data.roles?.nombre ?? data.roleName;
    if (role) return role;
  } catch { /* continue */ }

  return 'CLIENTE';
}

function buildSession(rawUser: any, access_token: string, role: string) {
  return {
    id: rawUser.id,
    email: rawUser.email,
    name: rawUser.nombre ?? rawUser.name,
    role,
    token: access_token,
  };
}

export const authService = {
  async login(email: string, password: string) {
    try {
      const { data } = await axios.post('/auth/login', {
        email,
        password_hash: password,
      });

      const access_token = data.access_token;
      const rawUser = data.user;
      const role = await fetchRoleName(access_token, rawUser?.id_rol);
      const sessionData = buildSession(rawUser, access_token, role);

      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        setAuthCookies(access_token, role);
      }
      return sessionData;
    } catch (apiError: any) {
      const status = apiError?.response?.status;
      const msg = extractMessage(apiError?.response?.data?.message);

      throw new Error(msg || 'El correo electrónico o la contraseña son incorrectos');
    }
  },

  async register(name: string, email: string, password: string, phone?: string) {
    try {
      const { data } = await axios.post('/auth/register', {
        name,
        email,
        password,
        ...(phone && { phone }),
        roleId: 2,
      });

      const access_token = data.access_token;
      if (access_token) {
        const rawUser = data.user;
        const role = await fetchRoleName(access_token, rawUser?.id_rol);
        const sessionData = buildSession(rawUser, access_token, role);

        if (typeof window !== 'undefined') {
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
          setAuthCookies(access_token, role);
        }
        return { success: true, autoLogin: true, sessionData };
      }

      return { success: true, autoLogin: false };
    } catch (apiError: any) {
      const status = apiError?.response?.status;
      const msg = extractMessage(apiError?.response?.data?.message);

      if (status === 409 || (msg && msg.toLowerCase().includes('ya esta'))) {
        throw new Error('Este correo electrónico ya está registrado.');
      }
      throw new Error(msg || `Error al registrarse (${status}). Intenta de nuevo.`);
    }
  },

  async forgotPassword(email: string) {
    try {
      await axios.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (apiError: any) {
      const status = apiError?.response?.status;
      const msg = extractMessage(apiError?.response?.data?.message);
      throw new Error(msg || 'No se pudo enviar el correo. Intenta de nuevo.');
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
      clearAuthCookies();
    }
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },
};