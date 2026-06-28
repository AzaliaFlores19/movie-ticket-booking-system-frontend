import axios from '@/lib/axios';
import { Sala } from '@/types';

export const salasService = {
  async getAll(): Promise<Sala[]> {
    const { data } = await axios.get('/salas');
    return data;
  },
};
