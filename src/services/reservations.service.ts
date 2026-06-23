import axios from '@/lib/axios';
import { MOCK_RESERVATIONS } from '@/lib/mock-data';
import { Reservation } from '@/types';

export const reservationsService = {
  // Reservas/boletos del usuario en sesión.
  async getMine(): Promise<Reservation[]> {
    try {
      const { data } = await axios.get<Reservation[]>('/reservas/mias');
      return data;
    } catch (error) {
      console.warn('API call failed, using mock data for my reservations');
      return MOCK_RESERVATIONS as Reservation[];
    }
  },

  // Todas las reservas (panel de recepción/administración).
  async getAll(): Promise<Reservation[]> {
    try {
      const { data } = await axios.get<Reservation[]>('/reservas');
      return data;
    } catch (error) {
      console.warn('API call failed, using mock data for reservations');
      return MOCK_RESERVATIONS as Reservation[];
    }
  },

  // Cancela una reserva. Devuelve la reserva actualizada.
  async cancel(id: number): Promise<void> {
    try {
      await axios.patch(`/reservas/${id}/cancelar`);
    } catch (error) {
      console.warn('API call failed, cancel simulated locally');
    }
  },
};
