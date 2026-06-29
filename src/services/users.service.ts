import axios from '@/lib/axios';
import { MOCK_USERS } from '@/lib/mock-data';
import { User } from '@/types';

interface ApiUser {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  estado?: string;
  notificaciones_activas?: boolean;
  created_at?: string;
  updated_at?: string;
  roles?: { id?: number; nombre: string } | null;
  rol?: string;
}

// El backend envuelve las listas en { message, total, data: [...] }
interface ListResponse {
  message: string;
  total: number;
  data: ApiUser[];
}

function mapUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.nombre,
    email: apiUser.email,
    phone: apiUser.telefono ?? undefined,
    roleId: apiUser.roles?.id ?? 0,
    roleName: apiUser.roles?.nombre ?? apiUser.rol,
    status: apiUser.estado,
    createdAt: apiUser.created_at,
    updatedAt: apiUser.updated_at,
    notificationsEnabled: apiUser.notificaciones_activas,
  };
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roleId: number;
  phone?: string;
}

export const usersService = {
  // Todos los usuarios (vista de ADMIN)
  async getAll(): Promise<User[]> {
      const { data } = await axios.get<ListResponse>('/admin/users/all');
      return data.data.map(mapUser);
  },

  // Solo clientes (vista de RECEPCIONISTA)
  async getClients(): Promise<User[]> {
      const { data } = await axios.get<ListResponse>('/admin/users');
      return data.data.map(mapUser);
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await axios.post<{ message: string; user: ApiUser }>('/admin/users', payload);
    return mapUser(data.user);
  },

  // Activar / desactivar un usuario
  async changeStatus(id: number, estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'): Promise<void> {
    await axios.patch(`/admin/users/${id}/status`, { estado });
  },

  // Cambiar la contraseña de un usuario
  async changePassword(id: number, password: string): Promise<void> {
    await axios.patch(`/admin/users/${id}/password`, { password });
  },

  // Editar datos de un usuario (nombre, email, rol)
  async update(
    id: number,
    payload: { name?: string; email?: string; roleId?: number },
  ): Promise<void> {
    await axios.put(`/admin/users/${id}`, {
      ...(payload.name !== undefined && { nombre: payload.name }),
      ...(payload.email !== undefined && { email: payload.email }),
      ...(payload.roleId !== undefined && { id_rol: payload.roleId }),
    });
  },

  // Eliminar (baja lógica) un usuario
  async remove(id: number): Promise<void> {
    await axios.delete(`/admin/users/${id}`);
  },
};
