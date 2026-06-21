import axios from '@/lib/axios';
import { MOCK_LANGUAGES } from '@/lib/mock-data';
import { Language } from '@/types';

export const languagesService = {
  async getAll(): Promise<Language[]> {
    try {
      const { data } = await axios.get('/languages');
      return data;
    } catch (error) {
      return MOCK_LANGUAGES;
    }
  },

  async create(language: Omit<Language, 'id' | 'createdAt' | 'updatedAt'>): Promise<Language> {
    const { data } = await axios.post('/languages', language);
    return data;
  },

  async update(id: number, language: Partial<Language>): Promise<Language> {
    const { data } = await axios.put(`/languages/${id}`, language);
    return data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/languages/${id}`);
  }
};
