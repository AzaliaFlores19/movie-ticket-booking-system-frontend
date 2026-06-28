import axiosInstance from '@/lib/axios';
import type { CancellationPolicy } from '@/types';

export const policiesApi = {
  async getAll(): Promise<CancellationPolicy[]> {
    const { data } = await axiosInstance.get('/politicas-cancelacion');
    return Array.isArray(data) ? data : [];
  },

  async create(payload: {
    horas_antes_minimo: number;
    horas_antes_maximo?: number | null;
    porcentaje_reembolso: number;
  }): Promise<CancellationPolicy> {
    const { data } = await axiosInstance.post('/politicas-cancelacion', payload);
    return data;
  },

  async update(id: number, payload: {
    horas_antes_minimo?: number;
    horas_antes_maximo?: number | null;
    porcentaje_reembolso?: number;
  }): Promise<CancellationPolicy> {
    const { data } = await axiosInstance.put(`/politicas-cancelacion/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/politicas-cancelacion/${id}`);
  },
};
