import axios from '@/lib/axios';
import { Sala } from '@/types';

export const salasService = {
  async getAll(): Promise<Sala[]> {
    const { data } = await axios.get('/salas');
    return Array.isArray(data) ? data : [];
  },

  async create(payload: {
    nombre: string;
    id_cine: number;
    filas: number;
    columnas: number;
    precio: number;
  }): Promise<Sala> {
    const { data } = await axios.post('/salas', payload);
    return data;
  },

  async update(id: number, payload: Partial<{
    nombre: string;
    id_cine: number;
    filas: number;
    columnas: number;
    precio: number;
  }>): Promise<Sala> {
    const { data } = await axios.put(`/salas/${id}`, payload);
    return data;
  },
};
