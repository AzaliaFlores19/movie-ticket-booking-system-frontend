import axios from '@/lib/axios';
import { MOCK_ROLES } from '@/lib/mock-data';
import { Role } from '@/types';

interface ApiRole {
  id: number;
  nombre: string;
}

export const rolesService = {
  async getAll(): Promise<Role[]> {
    try {
      // El backend devuelve un arreglo de { id, nombre }
      const { data } = await axios.get<ApiRole[]>('/roles');
      return data.map((r) => ({ id: r.id, name: r.nombre }));
    } catch (error) {
      // Fallback (p. ej. si el rol actual no tiene acceso a GET /roles)
      return MOCK_ROLES;
    }
  },

  async create(role: Omit<Role, 'id'>): Promise<Role> {
    const { data } = await axios.post('/roles', role);
    return data;
  },

  async update(id: number, role: Partial<Role>): Promise<Role> {
    const { data } = await axios.put(`/roles/${id}`, role);
    return data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/roles/${id}`);
  }
};
