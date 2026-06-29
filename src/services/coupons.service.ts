import axiosInstance from '@/lib/axios';
import type { Coupon } from '@/types';

export const couponsApi = {
  async getAll(): Promise<Coupon[]> {
    const { data } = await axiosInstance.get('/cupones');
    return Array.isArray(data) ? data : (data.data ?? []);
  },

  async create(payload: {
    codigo: string;
    tipo: string;
    valor: number;
    fecha_expiracion: string;
    usos_maximos?: number;
  }): Promise<Coupon> {
    const { data } = await axiosInstance.post('/cupones', payload);
    return data;
  },

  async update(id: number, payload: {
    codigo?: string;
    tipo?: string;
    valor?: number;
    fecha_expiracion?: string;
    usos_maximos?: number;
  }): Promise<Coupon> {
    const { data } = await axiosInstance.put(`/cupones/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/cupones/${id}`);
  },

  async toggleStatus(id: number): Promise<Coupon> {
    const { data } = await axiosInstance.patch(`/cupones/${id}/status`);
    return data;
  },

  async validate(codigo: string): Promise<{ valido: boolean; id: number; codigo: string; tipo: string; valor: number; message: string }> {
    const { data } = await axiosInstance.post('/cupones/validar', { codigo });
    return data;
  },
};
