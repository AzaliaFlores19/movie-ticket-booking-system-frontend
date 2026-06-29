import axios from '@/lib/axios';
import { Genre } from '@/types';

export const genresService = {
  async getAll(): Promise<Genre[]> {
    const { data } = await axios.get('/generos');
    return Array.isArray(data) ? data : [];
  },

  async create(genre: Omit<Genre, 'id' | 'createdAt' | 'updatedAt'>): Promise<Genre> {
    const { data } = await axios.post('/generos', genre);
    return data;
  },

  async update(id: number, genre: Partial<Genre>): Promise<Genre> {
    const { data } = await axios.put(`/generos/${id}`, genre);
    return data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/generos/${id}`);
  },
};
