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
};
