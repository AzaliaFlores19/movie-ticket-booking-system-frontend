import axios from '@/lib/axios';
import { Refund } from '@/types';

export const refundsService = {
  async getMine(): Promise<Refund[]> {
    const { data } = await axios.get<Refund[]>('/reembolsos');
    return Array.isArray(data) ? data : [];
  },

  async getAll(): Promise<Refund[]> {
    const { data } = await axios.get<Refund[]>('/reembolsos');
    return Array.isArray(data) ? data : [];
  },

  async getById(id: number): Promise<Refund> {
    const { data } = await axios.get<Refund>(`/reembolsos/${id}`);
    return data;
  },
};
