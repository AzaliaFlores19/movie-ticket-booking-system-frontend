import axios from '@/lib/axios';
import { MOCK_REFUNDS } from '@/lib/mock-data';
import { Refund } from '@/types';

export const refundsService = {
  // Reembolsos asociados a las reservas del usuario en sesión.
  async getMine(): Promise<Refund[]> {
    try {
      const { data } = await axios.get<Refund[]>('/reembolsos/mios');
      return data;
    } catch (error) {
      console.warn('API call failed, using mock data for my refunds');
      return MOCK_REFUNDS as Refund[];
    }
  },

  // Todos los reembolsos (panel de administración).
  async getAll(): Promise<Refund[]> {
    try {
      const { data } = await axios.get<Refund[]>('/reembolsos');
      return data;
    } catch (error) {
      console.warn('API call failed, using mock data for refunds');
      return MOCK_REFUNDS as Refund[];
    }
  },
};
