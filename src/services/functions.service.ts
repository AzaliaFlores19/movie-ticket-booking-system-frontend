import axios from '@/lib/axios';
import { MOCK_FUNCIONES } from '@/lib/mock-data';
import { Funcion } from '@/types';

export const functionsService = {
  async getAll(): Promise<Funcion[]> {
    try {
      const { data } = await axios.get<Funcion[]>('/funciones');
      return data;
    } catch (error) {
      console.warn('API call failed, using mock data for functions');
      return MOCK_FUNCIONES as Funcion[];
    }
  },
};
