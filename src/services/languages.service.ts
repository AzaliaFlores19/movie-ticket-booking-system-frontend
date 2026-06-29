import axios from '@/lib/axios';
import { Language } from '@/types';

export const languagesService = {
  async getAll(): Promise<Language[]> {
    const { data } = await axios.get('/idiomas');
    return Array.isArray(data) ? data : [];
  },

  async create(language: Omit<Language, 'id' | 'createdAt' | 'updatedAt'>): Promise<Language> {
    const { data } = await axios.post('/idiomas', language);
    return data;
  },

  async update(id: number, language: Partial<Language>): Promise<Language> {
    const { data } = await axios.put(`/idiomas/${id}`, language);
    return data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/idiomas/${id}`);
  },
};
