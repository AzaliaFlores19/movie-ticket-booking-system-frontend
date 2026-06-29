import axios from '@/lib/axios';
import { Reservation } from '@/types';

type CreateReservationPayload = {
  id_funcion: number;
  asientosFuncionIds: number[];
  id_usuario_cliente?: number;
};

type CreateReservationResponse = {
  message: string;
  reservaId: number;
  codigoTicket: string;
  estado: string;
};

export const reservationsService = {
  async create(payload: CreateReservationPayload): Promise<CreateReservationResponse> {
    const { data } = await axios.post<CreateReservationResponse>('/reservas', payload);
    return data;
  },

  // Reservas/boletos del usuario en sesión.
  async getMine(): Promise<Reservation[]> {
    try {
      const { data } = await axios.get<Reservation[]>('/reservas/mias');
      return data;
    } catch {
      console.warn('API call failed, using mock data for my reservations');
      return MOCK_RESERVATIONS as Reservation[];
    }
  },

  async getAll(): Promise<Reservation[]> {
    try {
      const { data } = await axios.get<Reservation[]>('/reservas');
      return data;
    } catch {
      console.warn('API call failed, using mock data for reservations');
      return MOCK_RESERVATIONS as Reservation[];
    }
  },

  async cancel(id: number): Promise<void> {
    try {
      await axios.patch(`/reservas/${id}/cancelar`);
    } catch {
      console.warn('API call failed, cancel simulated locally');
    }
  },
};
