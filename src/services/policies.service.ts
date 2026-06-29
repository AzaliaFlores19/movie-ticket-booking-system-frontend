import axios from '@/lib/axios';
import type { CancellationPolicy } from '@/types';

export const policiesApi = {
  async getAll(): Promise<CancellationPolicy[]> {
    const { data } = await axios.get('/politicas-cancelacion');
    return Array.isArray(data) ? data : [];
  },

  async create(payload: {
    horas_antes_minimo: number;
    horas_antes_maximo: number | null;
    porcentaje_reembolso: number;
  }): Promise<CancellationPolicy> {
    const { data } = await axios.post('/politicas-cancelacion', payload);
    return data;
  },

  async update(
    id: number,
    payload: Partial<{
      horas_antes_minimo: number;
      horas_antes_maximo: number | null;
      porcentaje_reembolso: number;
    }>
  ): Promise<CancellationPolicy> {
    const { data } = await axios.put(`/politicas-cancelacion/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/politicas-cancelacion/${id}`);
  },
};
