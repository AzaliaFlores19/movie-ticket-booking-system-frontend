import axios from '@/lib/axios';
import { MOCK_MOVIES, MOCK_CINES, MOCK_FUNCIONES } from '@/lib/mock-data';
import { Movie, Cine, Funcion, MovieFilters } from '@/types';

export const moviesService = {
  async getAll(filters?: MovieFilters): Promise<Movie[]> {
    try {
      const { data } = await axios.get('/movies', { params: filters });
      return data;
    } catch (error) {
      return MOCK_MOVIES;
    }
  },

  async getOne(id: number): Promise<Movie | null> {
    try {
      const { data } = await axios.get(`/movies/${id}`);
      return data;
    } catch (error) {
      return MOCK_MOVIES.find((m) => m.id === id) || null;
    }
  },

  async getCines(movieId: number): Promise<Cine[]> {
    try {
      const { data } = await axios.get(`/movies/${movieId}/cines`);
      return data;
    } catch (error) {
      return MOCK_CINES;
    }
  },

  async getFunciones(movieId: number, cineId: number): Promise<Funcion[]> {
    try {
      const { data } = await axios.get(`/movies/${movieId}/cines/${cineId}/funciones`);
      return data;
    } catch (error) {
      return MOCK_FUNCIONES;
    }
  },

  async create(data: FormData) {
    return await axios.post('/movies', data);
  },

  async update(id: number, data: any) {
    return await axios.put(`/movies/${id}`, data);
  },

  async delete(id: number) {
    return await axios.delete(`/movies/${id}`);
  },
};
