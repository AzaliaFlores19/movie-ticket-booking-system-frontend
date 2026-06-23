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

  async create(genre: Omit<Genre, 'id' | 'createdAt' | 'updatedAt'>): Promise<Genre> {
    const { data } = await axios.post('/genres', genre);
    return data;
  },

  async update(id: number, genre: Partial<Genre>): Promise<Genre> {
    const { data } = await axios.put(`/genres/${id}`, genre);
    return data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/genres/${id}`);
  }
};
