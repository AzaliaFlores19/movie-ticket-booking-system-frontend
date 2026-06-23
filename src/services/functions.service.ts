import axios from '@/lib/axios';
import { MOCK_FUNCIONES } from '@/lib/mock-data';
import { Funcion, FuncionFilters } from '@/types';

type ApiEnvelope<T> = T | { data: T };

function unwrapData<T>(payload: ApiEnvelope<T>): T {
  return 'data' in Object(payload) ? (payload as { data: T }).data : (payload as T);
}

export const functionsService = {
  async getAll(filters?: FuncionFilters): Promise<Funcion[]> {
    try {
      const { data } = await axios.get<Funcion[]>('/funciones', { params: filters });
      return unwrapData<Funcion[]>(data);
    } catch {
      console.warn('API call failed, using mock data for functions');
      return MOCK_FUNCIONES as Funcion[];
    }
  },

  async create(payload: Partial<Funcion>): Promise<Funcion> {
    const { data } = await axios.post<Funcion>('/funciones', payload);
    return unwrapData<Funcion>(data);
  },

  async update(id: number, payload: Partial<Funcion>): Promise<Funcion> {
    const { data } = await axios.put<Funcion>(`/funciones/${id}`, payload);
    return unwrapData<Funcion>(data);
  },

  async cancel(id: number): Promise<Funcion> {
    const { data } = await axios.patch<Funcion>(`/funciones/${id}/cancelar`);
    return unwrapData<Funcion>(data);
  },
};
