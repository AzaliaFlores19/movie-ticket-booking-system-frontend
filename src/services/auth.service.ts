import axios from '@/lib/axios';

const SESSION_KEY = 'movie_auth_session';

type AuthUserResponse = {
  id?: number;
  email?: string;
  nombre?: string;
  name?: string;
  id_rol?: number;
};

type ApiErrorResponse = {
  response?: {
    status?: number;
    data?: { message?: unknown };
  };
};

function extractMessage(raw: unknown): string | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw.join(', ');
  if (typeof raw === 'string') return raw;
  return null;
}

function getApiError(error: unknown): ApiErrorResponse {
  return error && typeof error === 'object' ? (error as ApiErrorResponse) : {};
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

const ROLE_MAP: Record<number, string> = {
  1: 'ADMIN',
  2: 'CLIENTE',
  3: 'RECEPCIONISTA',
};

async function fetchRoleName(accessToken: string, idRol?: number): Promise<string> {
  if (idRol !== undefined && ROLE_MAP[idRol]) {
    return ROLE_MAP[idRol];
  }

  const headers = { Authorization: `Bearer ${accessToken}` };
  try {
    const { data } = await axios.get('/auth/profile', { headers });
    const role = data.role ?? data.roles?.nombre ?? data.roleName;
    if (role) return role;
  } catch {
    // continue
  }

  return 'CLIENTE';
}

function buildSession(rawUser: AuthUserResponse, access_token: string, role: string) {
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
      const rawUser = data.user as AuthUserResponse;
      const role = await fetchRoleName(access_token, rawUser?.id_rol);
      const sessionData = buildSession(rawUser, access_token, role);

      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        setAuthCookies(access_token, role);
      }
      return sessionData;
    } catch (error: unknown) {
      const apiError = getApiError(error);
      const msg = extractMessage(apiError.response?.data?.message);
      throw new Error(msg || 'El correo electronico o la contrasena son incorrectos');
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
        const rawUser = data.user as AuthUserResponse;
        const role = await fetchRoleName(access_token, rawUser?.id_rol);
        const sessionData = buildSession(rawUser, access_token, role);

        if (typeof window !== 'undefined') {
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
          setAuthCookies(access_token, role);
        }
        return { success: true, autoLogin: true, sessionData };
      }

      return { success: true, autoLogin: false };
    } catch (error: unknown) {
      const apiError = getApiError(error);
      const status = apiError.response?.status;
      const msg = extractMessage(apiError.response?.data?.message);

      if (status === 409 || (msg && msg.toLowerCase().includes('ya esta'))) {
        throw new Error('Este correo electronico ya esta registrado.');
      }
      throw new Error(msg || `Error al registrarse (${status}). Intenta de nuevo.`);
    }
  },

  async forgotPassword(email: string) {
    try {
      await axios.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error: unknown) {
      const apiError = getApiError(error);
      const msg = extractMessage(apiError.response?.data?.message);
      throw new Error(msg || 'No se pudo enviar el correo. Intenta de nuevo.');
    }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      await axios.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error: unknown) {
      const apiError = getApiError(error);
      const msg = extractMessage(apiError.response?.data?.message);
      throw new Error(msg || 'El token es invalido o expiro. Solicita un nuevo enlace.');
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

  getCurrentUserId(): number | null {
    const id = this.getCurrentUser()?.id;
    return id != null ? Number(id) : null;
  },
};