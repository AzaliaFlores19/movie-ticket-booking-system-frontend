export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  roleId: number;
  roleName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  notificationsEnabled?: boolean;
}

export interface Role {
  id: number;
  name: string;
}

export interface City {
  id: number;
  nombre: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Genre {
  id: number;
  nombre: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Language {
  id: number;
  nombre: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cine {
  id: number;
  nombre: string;
  direccion?: string;
  ciudad_id?: number;
  ciudad?: City;
  salas?: Sala[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Sala {
  id: number;
  nombre: string;
  capacidad?: number;
  tipo?: string;
  filas?: number;
  columnas?: number;
  precio?: number;
  cine_id?: number;
  id_cine?: number;
  cine?: Pick<Cine, 'id' | 'nombre'>;
  cines?: Pick<Cine, 'id' | 'nombre' | 'direccion'> & {
    id_ciudad?: number;
    ciudades?: { id?: number; nombre?: string };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Movie {
  id: number;
  titulo: string;
  sinopsis?: string;
  poster_url?: string;
  duracion?: number;
  fecha_estreno?: string;
  id_genero?: number;
  genero?: Genre;
  id_idioma?: number;
  idioma?: Language;
  estado?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Funcion {
  id: number;
  id_funcion: number;
  fecha_hora: string;
  estado: string;
  estado_funcion: string;
  precio?: number;
  pelicula_id?: number;
  id_pelicula?: number;
  pelicula?: Movie;
  peliculas?: Movie;
  sala_id?: number;
  id_sala?: number;
  sala?: Sala;
  salas?: Sala;
  cine?: Cine;
  createdAt?: string;
  updatedAt?: string;
}

export interface Asiento {
  id: number;
  fila: string;
  columna: number;
  tipo: string;
  sala_id?: number;
}

export interface AsientoFuncion {
  id: number;
  estado: string;
  funcion_id?: number;
  asiento_id?: number;
  asiento: Asiento;
  // Campos de concurrencia provenientes del mapa de asientos de la API.
  id_usuario?: number | null;
  bloqueado_hasta?: string | null;
}

// Cliente devuelto por GET /admin/users (búsqueda para reservas de taquilla).
export interface ClienteBusqueda {
  id: number;
  // La API (Prisma) entrega la PK como `id_usuario`; se normaliza a `id`.
  id_usuario?: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  estado?: string;
}

export interface ReservaFuncion {
  id: number;
  fecha_hora: string;
  estado?: string;
  precio?: number;
  cine?: string;
  ubicacion?: string;
  peliculas?: { id?: number; titulo?: string; poster_url?: string };
  salas?: { nombre?: string; precio?: number; cines?: { nombre?: string; direccion?: string } };
}

export interface ReservaAsiento {
  id: number;
  asientosfuncion?: {
    asientos?: { id?: number; codigo?: string; fila?: string; columna?: number };
  };
}

export interface Reservation {
  id: number;
  // API field names
  numero_reserva?: string;
  id_usuario?: number;
  id_funcion?: number;
  funciones?: ReservaFuncion;
  reservaAsientos?: ReservaAsiento[];
  // Legacy field names (mock / older integration)
  codigo?: string;
  estado: string;
  total?: number;
  usuario_id?: number;
  usuario?: User & { nombre?: string; telefono?: string };
  funcion_id?: number;
  funcion?: Funcion;
  asientos?: AsientoFuncion[];
  payment?: Payment;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: number;
  monto: number;
  metodo: string;
  estado: string;
  referencia?: string;
  reserva_id?: number;
  reserva?: Reservation;
  createdAt?: string;
  updatedAt?: string;
}

export interface Refund {
  id: number;
  monto: number;
  estado: string;
  motivo?: string;
  pago_id?: number;
  pago?: Payment;
  createdAt?: string;
  updatedAt?: string;
}

export interface Coupon {
  id: number;
  codigo: string;
  tipo: string;
  valor: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_expiracion?: string;
  usos_maximo?: number;
  usos_maximos?: number;
  usos_actuales?: number;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CancellationPolicy {
  id: number;
  horas_antes_minimo: number;
  horas_antes_maximo?: number | null;
  porcentaje_reembolso: number;
}

export interface ReportFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  ciudad_id?: number;
  cine_id?: number;
  pelicula_id?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface LoginCredentials {
  email: string;
  password_hash: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleId?: number;
}

export interface MovieFilters {
  titulo?: string;
  genero?: string;
  idioma?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  ciudad_id?: string;
}

export interface ReservationCreate {
  id_funcion: number;
  asientosFuncionIds: number[];
  codigo_cupon?: string;
}

export interface ReservationFilters {
  estado?: string;
  usuario_id?: number;
  funcion_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  page?: number;
  limit?: number;
}

export interface PaymentFilters {
  estado?: string;
  metodo?: string;
  reserva_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  page?: number;
  limit?: number;
}

export interface RefundFilters {
  estado?: string;
  pago_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  page?: number;
  limit?: number;
}

export interface CouponFilters {
  codigo?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface FuncionFilters {
  pelicula_id?: number;
  sala_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
  page?: number;
  limit?: number;
}

export interface SalaFilters {
  nombre?: string;
  cine_id?: number;
  page?: number;
  limit?: number;
}

export interface CineFilters {
  nombre?: string;
  ciudad_id?: number;
  page?: number;
  limit?: number;
}

export interface CityFilters {
  nombre?: string;
  page?: number;
  limit?: number;
}

export interface UserFilters {
  name?: string;
  email?: string;
  roleId?: number;
  page?: number;
  limit?: number;
}

// En tu archivo @/types/index.ts (o donde declares MovieFilters)
