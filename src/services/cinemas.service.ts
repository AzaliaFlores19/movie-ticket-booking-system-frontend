import axios from '@/lib/axios';
import { Cine } from '@/types';

export const cinemasService = {
  async getAll(): Promise<Cine[]> {
    const { data } = await axios.get('/cines');
    return Array.isArray(data) ? data : [];
  },
};
