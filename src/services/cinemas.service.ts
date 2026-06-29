import axios from '@/lib/axios';

export interface Cine {
  id: number;
  nombre: string;
  direccion: string | null;
  id_ciudad: number;
  ciudades?: {
    id: number;
    nombre: string;
  };
}

export const getCines = async (): Promise<Cine[]> => {
  const { data } = await axios.get('/cines');
  return data;
};

export const getCineById = async (id: number): Promise<Cine> => {
  const { data } = await axios.get(`/cines/${id}`);
  return data;
};

export const createCine = async (cineData: { nombre: string; direccion: string; id_ciudad: number }): Promise<Cine> => {
  const { data } = await axios.post('/cines', cineData);
  return data;
};

export const updateCine = async (id: number, cineData: { nombre?: string; direccion?: string; id_ciudad?: number }): Promise<Cine> => {
  const { data } = await axios.put(`/cines/${id}`, cineData);
  return data;
};

export const deleteCine = async (id: number): Promise<{ message: string }> => {
  const { data } = await axios.delete(`/cines/${id}`);
  return data;
};
