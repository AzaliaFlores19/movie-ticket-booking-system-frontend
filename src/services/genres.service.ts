import axios from '@/lib/axios';
import { MOCK_GENRES } from '@/lib/mock-data';
import { Genre } from '@/types';

export const genresService = {
  async getAll(): Promise<Genre[]> {
    try {
      const { data } = await axios.get('/genres');
      return data;
    } catch (error) {
      return MOCK_GENRES;
    }
  },
};
