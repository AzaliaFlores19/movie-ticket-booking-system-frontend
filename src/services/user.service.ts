import axios from '@/lib/axios';
import { MOCK_USERS } from '@/lib/mock-data';
import { ClienteBusqueda } from '@/types';

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  notificaciones_activas: boolean;
  roles: { id: number; nombre: string };
}

export const getMyProfile = async (): Promise<{ user: UserProfile }> => {
  const { data } = await axios.get('/users/me');
  return data;
};

export const updateProfile = async (id: number, profileData: { nombre?: string; email?: string; telefono?: string }): Promise<any> => {
  const { data } = await axios.patch(`/users/${id}`, profileData);
  return data;
};

export const toggleNotifications = async (id: number): Promise<any> => {
  const { data } = await axios.patch(`/users/${id}/notificaciones`);
  return data;
};

export const changePassword = async (id: number, passwordData: { passwordActual: string; passwordNueva: string }): Promise<any> => {
  const { data } = await axios.put(`/users/${id}/password`, passwordData);
  return data;
};

export const usersApi = {
  // Búsqueda de clientes para que el personal de taquilla/administración pueda
  // asignar una reserva a un cliente. Consume GET /admin/users (ADMIN/RECEPCIONISTA),
  // que devuelve el listado de clientes (rol CLIENTE). El filtrado por nombre o email
  // se hace en el cliente para no acoplar la UI a la lógica del endpoint.
  async searchClients(search?: string): Promise<ClienteBusqueda[]> {
    const term = search?.trim().toLowerCase() ?? '';
    try {
      const { data } = await axios.get('/admin/users');
      // El endpoint responde { message, total, data: [...] }.
      const raw = (Array.isArray(data) ? data : data?.data ?? []) as ClienteBusqueda[];
      // La API (Prisma) usa `id_usuario` como PK; normalizamos a `id` para que
      // la reserva pueda asignarse al cliente y no caiga en el usuario autenticado.
      const list = raw.map((c) => ({ ...c, id: c.id ?? c.id_usuario }));
      if (!term) return list;
      return list.filter(
        (c) =>
          c.nombre?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term),
      );
    } catch (error) {
      console.warn('API /admin/users falló, usando clientes Mock para la búsqueda');
      return MOCK_USERS
        .filter((u) => u.roleName === 'CLIENTE')
        .filter((u) =>
          !term ||
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
        )
        .map((u) => ({ id: u.id, nombre: u.name, email: u.email, telefono: u.phone, estado: 'ACTIVO' }));
    }
  },
};
