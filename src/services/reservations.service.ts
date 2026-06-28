import axios from '@/lib/axios';
import { Reservation } from '@/types';

export const reservationsService = {
  async getMine(): Promise<Reservation[]> {
    const { data } = await axios.get<Reservation[]>('/reservas');
    return Array.isArray(data) ? data : [];
  },

  async getAll(): Promise<Reservation[]> {
    const { data } = await axios.get<Reservation[]>('/reservas');
    return data;
  },

  async cancel(id: number): Promise<void> {
    await axios.patch(`/reservas/${id}/cancelar`);
  },
};
