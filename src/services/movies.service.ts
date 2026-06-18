import axios from '@/lib/axios';
import { MOCK_MOVIES, MOCK_CINES, MOCK_FUNCIONES } from '@/lib/mock-data';
import { Movie, Cine, Funcion, MovieFilters } from '@/types';

export const moviesService = {
  async getAll(filters?: MovieFilters): Promise<Movie[]> {
    try {
      const { data } = await axios.get('/peliculas', { params: filters });
      
      return data.data || data; 
    } catch (error) {
      console.log('Backend no disponible, ejecutando filtro mock en memoria...');
      
      if (!filters) return MOCK_MOVIES;

      return MOCK_MOVIES.filter((movie) => {
        if (filters.titulo && !movie.titulo.toLowerCase().includes(filters.titulo.toLowerCase())) {
          return false;
        }

        const movieGeneroId = movie.id_genero || (movie as any).genero_id || movie.genero?.id;
        if (filters.genero && String(movieGeneroId) !== String(filters.genero)) {
          return false;
        }

        const movieIdiomaId = movie.id_idioma || (movie as any).idioma_id || movie.idioma?.id;
        if (filters.idioma && String(movieIdiomaId) !== String(filters.idioma)) {
          return false;
        }

        const movieCiudadId = (movie as any).id_ciudad || (movie as any).ciudad_id;
        if (filters.ciudad_id && movieCiudadId && String(movieCiudadId) !== String(filters.ciudad_id)) {
          return false;
        }

        if (movie.fecha_estreno) {
          const movieDate = new Date(movie.fecha_estreno).getTime();
          if (filters.fecha_inicio && movieDate < new Date(filters.fecha_inicio).getTime()) {
            return false;
          }
          if(filters.fecha_fin && movieDate > new Date(filters.fecha_fin).getTime()) {
            return false;
          }
        }

        return true;
      });
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
