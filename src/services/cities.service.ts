import axios from '@/lib/axios';
import { MOCK_CITIES } from '@/lib/mock-data';
import { City, CityFilters } from '@/types';

type ApiEnvelope<T> = T | { data: T };

function unwrapData<T>(payload: ApiEnvelope<T>): T {
  return 'data' in Object(payload) ? (payload as { data: T }).data : (payload as T);
}

export const citiesService = {
  async getAll(filters?: CityFilters): Promise<City[]> {
    try {
      const { data } = await axios.get('/ciudades', { params: filters });
      return unwrapData<City[]>(data);
    } catch {
      return MOCK_CITIES;
    }
  },

  async create(payload: Partial<City>): Promise<City> {
    const { data } = await axios.post('/ciudades', payload);
    return unwrapData<City>(data);
  },

  async update(id: number, payload: Partial<City>): Promise<City> {
    const { data } = await axios.put(`/ciudades/${id}`, payload);
    return unwrapData<City>(data);
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/ciudades/${id}`);
  },
};
