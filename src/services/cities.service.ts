import axios from '@/lib/axios';
import { City, CityFilters } from '@/types';

type CityPayload = { nombre: string };

// El backend devuelve { id, nombre, created_at }. Normalizamos al shape `City` del frontend.
function normalizeCity(raw: any): City {
  return {
    id: Number(raw.id),
    nombre: raw.nombre,
    createdAt: raw.created_at ?? raw.createdAt,
  };
}

function unwrap<T>(payload: any): T {
  return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
}

export const citiesService = {
  async getAll(filters?: CityFilters): Promise<City[]> {
      const { data } = await axios.get('/ciudades', { params: filters });
      const list = unwrap<any[]>(data) ?? [];
      return list.map(normalizeCity);
  },

  async create(payload: CityPayload): Promise<City> {
    const { data } = await axios.post('/ciudades', payload);
    return normalizeCity(unwrap(data));
  },

  async update(id: number, payload: CityPayload): Promise<City> {
    const { data } = await axios.patch(`/ciudades/${id}`, payload);
    return normalizeCity(unwrap(data));
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/ciudades/${id}`);
  },
};
