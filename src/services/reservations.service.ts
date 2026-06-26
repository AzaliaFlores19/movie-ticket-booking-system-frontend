import axios from '@/lib/axios';
import { MOCK_RESERVATIONS } from '@/lib/mock-data';
import { Reservation } from '@/types';

// Maps the backend snake_case/nested shape to the frontend Reservation type.
function mapReservation(r: any): Reservation {
  return {
    id: Number(r.id),
    codigo: r.numero_reserva ?? r.codigo,
    estado: r.estado,
    total: Number(r.total ?? r.pagos?.[0]?.monto ?? 0),
    usuario_id: Number(r.id_usuario),
    usuario: r.usuarios
      ? { id: Number(r.usuarios.id), name: r.usuarios.nombre, email: r.usuarios.email, roleId: 0, roleName: '' }
      : r.usuario,
    funcion: r.funciones
      ? {
          id: Number(r.funciones.id),
          fecha_hora: r.funciones.fecha_hora,
          precio: Number(r.funciones.precio ?? 0),
          estado: r.funciones.estado,
          pelicula: r.funciones.peliculas
            ? { id: Number(r.funciones.peliculas.id), titulo: r.funciones.peliculas.titulo, poster_url: r.funciones.peliculas.poster_url }
            : r.funciones.pelicula,
          sala: r.funciones.salas ?? r.funciones.sala,
          cine: r.funciones.cines ?? r.funciones.cine,
        }
      : r.funcion,
    asientos: r.reservaAsientos?.map((ra: any) => ({
      id: Number(ra.id),
      asiento: {
        id: Number(ra.asientosfuncion?.id ?? ra.asiento?.id),
        fila: ra.asientosfuncion?.asientos?.fila ?? ra.asiento?.fila ?? '',
        columna: ra.asientosfuncion?.asientos?.columna ?? ra.asiento?.columna ?? '',
      },
    })) ?? r.asientos ?? [],
    createdAt: r.created_at ?? r.createdAt,
  };
}

export const reservationsService = {
  // Reservas del usuario en sesión (backend filtra por rol automáticamente).
  async getMine(): Promise<Reservation[]> {
    try {
      const { data } = await axios.get<any[]>('/reservas');
      return Array.isArray(data) ? data.map(mapReservation) : [];
    } catch {
      console.warn('API call failed, using mock data for reservations');
      return MOCK_RESERVATIONS as Reservation[];
    }
  },

  // Todas las reservas (admin ve todas, cliente ve las suyas — mismo endpoint).
  async getAll(): Promise<Reservation[]> {
    try {
      const { data } = await axios.get<any[]>('/reservas');
      return Array.isArray(data) ? data.map(mapReservation) : [];
    } catch {
      console.warn('API call failed, using mock data for reservations');
      return MOCK_RESERVATIONS as Reservation[];
    }
  },

  async cancel(id: number): Promise<void> {
    await axios.patch(`/reservas/${id}/cancelar`);
  },
};
