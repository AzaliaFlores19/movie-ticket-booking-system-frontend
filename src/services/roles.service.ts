import axios from '@/lib/axios';
import { Role } from '@/types';

interface ApiRole {
  id: number;
  nombre: string;
}

export const rolesService = {
  async getAll(): Promise<Role[]> {
    
      const { data } = await axios.get<ApiRole[]>('/roles');
      return data.map((r) => ({ id: r.id, name: r.nombre }));
    
  
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
