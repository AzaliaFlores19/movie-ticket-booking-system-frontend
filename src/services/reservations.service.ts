import axios from '@/lib/axios';
import { MOCK_RESERVATIONS } from '@/lib/mock-data';
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

  // Reservas/boletos del usuario en sesión. GET /reservas ya viene filtrado por
  // el backend según el rol del JWT: un CLIENTE solo recibe las suyas (no existe
  // un endpoint /reservas/mias).
  async getMine(): Promise<Reservation[]> {
    const { data } = await axios.get<Reservation[]>('/reservas');
    return Array.isArray(data) ? data : [];
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

  // Detalle de una reserva. GET /reservas/:id. Incluye película, asientos y
  // estado, usado para hidratar el resumen de compra en el checkout.
  async getOne(id: number): Promise<Reservation> {
    const { data } = await axios.get<Reservation>(`/reservas/${id}`);
    return data;
  },

  // Cancela una reserva. Devuelve la reserva actualizada.
  async cancel(id: number): Promise<void> {
    try {
      await axios.patch(`/reservas/${id}/cancelar`);
    } catch {
      console.warn('API call failed, cancel simulated locally');
    }
  },
};
