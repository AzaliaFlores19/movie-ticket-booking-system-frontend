import axios from '@/lib/axios';
import { Movie, Cine, Funcion, MovieFilters } from '@/types';

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function getSessionUserId(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const session = localStorage.getItem('movie_auth_session');
    if (session) {
      const { id } = JSON.parse(session);
      return id ?? 0;
    }
  } catch {}
  return 0;
}

export const moviesService = {
  async getAll(filters?: MovieFilters): Promise<Movie[]> {
    const { data } = await axios.get('/peliculas', { params: filters });
    // response: { message, total, data: [...] }
    return Array.isArray(data) ? data : unwrap<Movie[]>(data);
  },

  async getOne(id: number): Promise<Movie> {
    const { data } = await axios.get(`/peliculas/${id}`);
    return unwrap<Movie>(data);
  },

  async create(payload: {
    titulo: string;
    sinopsis?: string;
    fecha_estreno?: string;
    id_genero?: number;
    id_idioma?: number;
  }): Promise<Movie> {
    // response: { message, data: rawPeliculaObject }
    const { data } = await axios.post('/peliculas', {
      ...payload,
      id_usuario: getSessionUserId(),
    });
    return unwrap<Movie>(data);
  },

  async update(id: number, payload: Partial<{
    titulo: string;
    sinopsis: string;
    fecha_estreno: string;
    id_genero: number;
    id_idioma: number;
  }>): Promise<Movie> {
    // response: { message, data: rawPeliculaObject, editor: {...} }
    const { data } = await axios.put(`/peliculas/${id}`, {
      ...payload,
      id_editor: getSessionUserId(),
    });
    return unwrap<Movie>(data);
  },

  async toggleStatus(id: number): Promise<{ id: number; activo: boolean }> {
    // response: { message, data: { id, activo }, editor: {...} }
    const { data } = await axios.patch(`/peliculas/${id}/status`, {
      id_editor: getSessionUserId(),
    });
    return unwrap<{ id: number; activo: boolean }>(data);
  },

  async uploadPoster(id: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('poster', file);
    const { data } = await axios.post(`/peliculas/${id}/poster`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const result = unwrap<{ poster_url: string }>(data);
    return result.poster_url;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/peliculas/${id}`);
  },

  async getCines(movieId: number): Promise<Cine[]> {
    const { data } = await axios.get(`/peliculas/${movieId}/cines`);
    return Array.isArray(data) ? data : unwrap<Cine[]>(data);
  },

  async getFunciones(movieId: number, cineId: number): Promise<Funcion[]> {
    const { data } = await axios.get(`/peliculas/${movieId}/cines/${cineId}/funciones`);
    return Array.isArray(data) ? data : unwrap<Funcion[]>(data);
  },
};
