import axios from '@/lib/axios';
import { MOCK_ROLES } from '@/lib/mock-data';
import { Role } from '@/types';

export const rolesService = {
  async getAll(): Promise<Role[]> {
    try {
      const { data } = await axios.get('/roles');
      return data;
    } catch (error) {
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
