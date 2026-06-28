import axios from '@/lib/axios';
import { MOCK_CITIES } from '@/lib/mock-data';

export interface Ciudad {
  id: number;
  nombre: string;
}

// Función para obtener datos reales del backend
export const getCiudades = async (): Promise<Ciudad[]> => {
  const { data } = await axios.get('/ciudades');
  return data;
};

// Objeto para compatibilidad con componentes que usan el mock
// Usamos Promise.resolve para asegurar que los métodos then/catch funcionen
export const citiesService = {
  getAll: () => Promise.resolve(MOCK_CITIES),
  create: () => Promise.resolve(),
  update: () => Promise.resolve(),
  delete: () => Promise.resolve(),
};
