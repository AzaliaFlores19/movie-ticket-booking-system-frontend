import { Movie, Cine,  Funcion, User, Role, City, Sala, Genre, Language, Coupon, Payment, Refund, CancellationPolicy, Reservation, AsientoFuncion } from '@/types';
import { Pixelify_Sans } from 'next/font/google';

export const PEXELS_POSTERS = [
  'https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
  'https://images.pexels.com/photos/3945317/pexels-photo-3945317.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
  'https://images.pexels.com/photos/436413/pexels-photo-436413.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
  'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
  'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
  'https://images.pexels.com/photos/109669/pexels-photo-109669.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
  'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
  'https://images.pexels.com/photos/1200450/pexels-photo-1200450.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
  'https://images.pexels.com/photos/3756942/pexels-photo-3756942.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
  'https://images.pexels.com/photos/4350046/pexels-photo-4350046.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
  'https://images.pexels.com/photos/1537635/pexels-photo-1537635.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
  'https://images.pexels.com/photos/7722600/pexels-photo-7722600.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
];

export const MOCK_ROLES: Role[] = [
  { id: 1, name: 'ADMIN'},
  { id: 2, name: 'SECRETARIO' },
  { id: 3, name: 'CLIENTE' },
];

// Agrega de manera segura la propiedad password para el entorno mock
export const MOCK_USERS: Array<User & { password?: string }> = [
  { 
    id: 1, 
    name: 'Administrador', 
    email: 'admin@demo.com', 
    roleId: 1, 
    roleName: 'ADMIN', 
    password: 'admin123', // Contraseña personalizada
    createdAt: '2024-01-01' 
  },
  { 
    id: 2, 
    name: 'Secretario', 
    email: 'secretario@demo.com', 
    roleId: 2, 
    roleName: 'SECRETARIO', 
    password: 'secre123', // Contraseña personalizada
    createdAt: '2024-02-15' 
  },
  { 
    id: 3, 
    name: 'Carlos Garcia', 
    email: 'carlos@email.com', 
    roleId: 3, 
    roleName: 'CLIENTE', 
    password: 'password', 
    createdAt: '2024-03-10' 
  },
  { id: 4,  name: 'Maria Lopez',      email: 'maria@email.com',    roleId: 3, roleName: 'CLIENTE',    password: 'password', createdAt: '2024-03-20' },
  { id: 5,  name: 'Luis Hernández',   email: 'luis@email.com',     roleId: 3, roleName: 'CLIENTE',    password: 'password', createdAt: '2024-04-05' },
  { id: 6,  name: 'Ana Torres',       email: 'ana@email.com',      roleId: 3, roleName: 'CLIENTE',    password: 'password', createdAt: '2024-04-18' },
  { id: 7,  name: 'Jorge Ramírez',    email: 'jorge@email.com',    roleId: 3, roleName: 'CLIENTE',    password: 'password', createdAt: '2024-05-02' },
  { id: 8,  name: 'Sofía Mendoza',    email: 'sofia@email.com',    roleId: 3, roleName: 'CLIENTE',    password: 'password', createdAt: '2024-05-15' },
  { id: 9,  name: 'Diego Castro',     email: 'diego@email.com',    roleId: 3, roleName: 'CLIENTE',    password: 'password', createdAt: '2024-06-01' },
  { id: 10, name: 'Valeria Ríos',     email: 'valeria@email.com',  roleId: 3, roleName: 'CLIENTE',    password: 'password', createdAt: '2024-06-20' },
  { id: 11, name: 'Miguel Flores',    email: 'miguel@email.com',   roleId: 3, roleName: 'CLIENTE',    password: 'password', createdAt: '2024-07-08' },
  { id: 12, name: 'Gabriela Ortiz',   email: 'gaby@email.com',     roleId: 3, roleName: 'CLIENTE',    password: 'password', createdAt: '2024-07-25' },
];
export const MOCK_CITIES: City[] = [
  { id: 1, nombre: 'Ciudad de México', createdAt: '2024-01-01' },
  { id: 2, nombre: 'Monterrey', createdAt: '2024-01-15' },
  { id: 3, nombre: 'Guadalajara', createdAt: '2024-02-01' },
];

export const MOCK_CINEMAS: Cine[] = [
  { id: 1,  nombre: 'CineMax Central',      direccion: 'Av. Principal 123',              ciudad_id: 1, ciudad: { id: 1, nombre: 'Ciudad de México' } },
  { id: 2,  nombre: 'Multiplex Norte',       direccion: 'Centro Comercial Norte 456',     ciudad_id: 1, ciudad: { id: 1, nombre: 'Ciudad de México' } },
  { id: 3,  nombre: 'Cinépolis Sur',         direccion: 'Blvd. del Sur 789',              ciudad_id: 1, ciudad: { id: 1, nombre: 'Ciudad de México' } },
  { id: 4,  nombre: 'CineMax Monterrey',     direccion: 'Av. Constitución 100',           ciudad_id: 2, ciudad: { id: 2, nombre: 'Monterrey' } },
  { id: 5,  nombre: 'Cinemex Valle',         direccion: 'Plaza Valle, Local 32',          ciudad_id: 2, ciudad: { id: 2, nombre: 'Monterrey' } },
  { id: 6,  nombre: 'Cinépolis Guadalajara', direccion: 'Av. Vallarta 2440',              ciudad_id: 3, ciudad: { id: 3, nombre: 'Guadalajara' } },
  { id: 7,  nombre: 'Cinemex Tapatío',       direccion: 'Centro Histórico, Local 5',      ciudad_id: 3, ciudad: { id: 3, nombre: 'Guadalajara' } },
  { id: 8,  nombre: 'Multiplex Oriente',     direccion: 'Calz. Ignacio Zaragoza 1300',   ciudad_id: 1, ciudad: { id: 1, nombre: 'Ciudad de México' } },
  { id: 9,  nombre: 'CineMax Poniente',      direccion: 'Santa Fe, Torre A',              ciudad_id: 1, ciudad: { id: 1, nombre: 'Ciudad de México' } },
  { id: 10, nombre: 'Cinépolis Cumbres',     direccion: 'Av. Cumbres 500',                ciudad_id: 2, ciudad: { id: 2, nombre: 'Monterrey' } },
  { id: 11, nombre: 'CineMax Tlaquepaque',   direccion: 'Periférico Sur 4050',            ciudad_id: 3, ciudad: { id: 3, nombre: 'Guadalajara' } },
  { id: 12, nombre: 'Multiplex Polanco',     direccion: 'Av. Presidente Masaryk 111',    ciudad_id: 1, ciudad: { id: 1, nombre: 'Ciudad de México' } },
];

export const MOCK_ROOMS: Sala[] = [
  { id: 1,  nombre: 'Sala 1',   filas: 10, columnas: 15, cine_id: 1, cines: { id: 1, nombre: 'CineMax Central',      direccion: 'Av. Principal 123' } },
  { id: 2,  nombre: 'Sala 2',   filas: 8,  columnas: 12, cine_id: 1, cines: { id: 1, nombre: 'CineMax Central',      direccion: 'Av. Principal 123' } },
  { id: 3,  nombre: 'Sala VIP', filas: 5,  columnas: 10, cine_id: 1, cines: { id: 1, nombre: 'CineMax Central',      direccion: 'Av. Principal 123' } },
  { id: 4,  nombre: 'Sala 1',   filas: 12, columnas: 18, cine_id: 2, cines: { id: 2, nombre: 'Multiplex Norte',      direccion: 'Centro Comercial Norte 456' } },
  { id: 5,  nombre: 'Sala 2',   filas: 10, columnas: 16, cine_id: 2, cines: { id: 2, nombre: 'Multiplex Norte',      direccion: 'Centro Comercial Norte 456' } },
  { id: 6,  nombre: 'Sala 3',   filas: 8,  columnas: 14, cine_id: 2, cines: { id: 2, nombre: 'Multiplex Norte',      direccion: 'Centro Comercial Norte 456' } },
  { id: 7,  nombre: 'Sala 1',   filas: 9,  columnas: 13, cine_id: 3, cines: { id: 3, nombre: 'Cinépolis Sur',        direccion: 'Blvd. del Sur 789' } },
  { id: 8,  nombre: 'Sala 2',   filas: 7,  columnas: 11, cine_id: 3, cines: { id: 3, nombre: 'Cinépolis Sur',        direccion: 'Blvd. del Sur 789' } },
  { id: 9,  nombre: 'Sala 1',   filas: 11, columnas: 17, cine_id: 4, cines: { id: 4, nombre: 'CineMax Monterrey',    direccion: 'Av. Constitución 100' } },
  { id: 10, nombre: 'Sala 2',   filas: 9,  columnas: 15, cine_id: 4, cines: { id: 4, nombre: 'CineMax Monterrey',    direccion: 'Av. Constitución 100' } },
  { id: 11, nombre: 'Sala VIP', filas: 6,  columnas: 8,  cine_id: 5, cines: { id: 5, nombre: 'Cinemex Valle',        direccion: 'Plaza Valle, Local 32' } },
  { id: 12, nombre: 'Sala 1',   filas: 10, columnas: 14, cine_id: 6, cines: { id: 6, nombre: 'Cinépolis Guadalajara',direccion: 'Av. Vallarta 2440' } },
];

export const MOCK_GENRES: Genre[] = [
  { id: 1, nombre: 'Acción' },
  { id: 2, nombre: 'Ciencia Ficción' },
  { id: 3, nombre: 'Terror' },
  { id: 4, nombre: 'Romance' },
  { id: 5, nombre: 'Comedia' },
  { id: 6, nombre: 'Drama' },
  { id: 7, nombre: 'Documental' },
  { id: 8, nombre: 'Animación' },
];

export const MOCK_LANGUAGES: Language[] = [
  { id: 1, nombre: 'Inglés' },
  { id: 2, nombre: 'Español' },
];

export const MOCK_MOVIES: Movie[] = [
  { id: 1, titulo: 'Protocolo Sombra', sinopsis: 'Un agente de élite descubre una conspiración.', poster_url: PEXELS_POSTERS[0], duracion: 142, fecha_estreno: '2026-05-15', id_genero: 1, genero: MOCK_GENRES[0], id_idioma: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 2, titulo: 'La Última Señal', sinopsis: 'Un radioastrónomo recibe una transmisión misteriosa.', poster_url: PEXELS_POSTERS[1], duracion: 128, fecha_estreno: '2026-04-20', id_genero: 2, genero: MOCK_GENRES[1], id_idioma: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 3, titulo: 'Ecos del Pasado', sinopsis: 'Una pareja se muda a una casa con un oscuro secreto.', poster_url: PEXELS_POSTERS[2], duracion: 115, fecha_estreno: '2026-03-10', id_genero: 3, genero: MOCK_GENRES[2], id_idioma: 2, idioma: MOCK_LANGUAGES[1], estado: 'Activa' },
  { id: 4, titulo: 'Amor en Tiempos de Crisis', sinopsis: 'Dos almas se encuentran durante un apocalipsis.', poster_url: PEXELS_POSTERS[3], duracion: 130, fecha_estreno: '2026-02-14', id_genero: 4, genero: MOCK_GENRES[3], id_idioma: 2, idioma: MOCK_LANGUAGES[1], estado: 'Activa' },
  { id: 5, titulo: 'Códigos de Guerra', sinopsis: 'Un hacker se infiltra en una red militar secreta.', poster_url: PEXELS_POSTERS[4], duracion: 138, fecha_estreno: '2026-01-30', id_genero: 1, genero: MOCK_GENRES[0], id_idioma: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 6, titulo: 'Camino Venenoso', sinopsis: 'Un viaje peligroso por un sendero tóxico.', poster_url: PEXELS_POSTERS[5], duracion: 118, fecha_estreno: '2025-12-05', id_genero: 1, genero: MOCK_GENRES[0], id_idioma: 2, idioma: MOCK_LANGUAGES[1], estado: 'Activa' },
  { id: 7, titulo: 'Eclipse Rojo', sinopsis: 'Un fenómeno astronómico amenaza con destruir el mundo.', poster_url: PEXELS_POSTERS[6], duracion: 122, fecha_estreno: '2025-11-18', id_genero: 2, genero: MOCK_GENRES[1], id_idioma: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 8, titulo: 'La Mansión del Fin', sinopsis: 'Un lugar aislado alberga secretos oscuros.', poster_url: PEXELS_POSTERS[7], duracion: 98, fecha_estreno: '2025-10-31', id_genero: 3, genero: MOCK_GENRES[2], id_idioma: 2, idioma: MOCK_LANGUAGES[1], estado: 'Inactiva' },
  { id: 9, titulo: 'Furia Silenciosa', sinopsis: 'Una mujer descubre un complot que pone en peligro su vida.', poster_url: PEXELS_POSTERS[8], duracion: 110, fecha_estreno: '2025-09-14', id_genero: 1, genero: MOCK_GENRES[0], id_idioma: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 10, titulo: 'Entre Sombras', sinopsis: 'Un detective investiga un caso que lo lleva al borde de la locura.', poster_url: PEXELS_POSTERS[9], duracion: 95, fecha_estreno: '2025-08-20', id_genero: 4, genero: MOCK_GENRES[3], id_idioma: 2, idioma: MOCK_LANGUAGES[1], estado: 'Activa' },
  { id: 11, titulo: 'Zona Cero', sinopsis: 'Un grupo de supervivientes lucha por sobrevivir en un mundo devastado.', poster_url: PEXELS_POSTERS[10], duracion: 130, fecha_estreno: '2025-07-04', id_genero: 2, genero: MOCK_GENRES[1], id_idioma: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 12, titulo: 'El Último Tren', sinopsis: 'Un tren se dirige hacia el futuro con un destino desconocido.', poster_url: PEXELS_POSTERS[11], duracion: 108, fecha_estreno: '2025-06-15', id_genero: 3, genero: MOCK_GENRES[2], id_idioma: 2, idioma: MOCK_LANGUAGES[1], estado: 'Inactiva' },
  { id: 13, titulo: 'Horizonte Perdido', sinopsis: 'Un piloto se estrella en una isla misteriosa.', poster_url: PEXELS_POSTERS[0], duracion: 125, fecha_estreno: '2025-05-10', id_genero: 1, genero: MOCK_GENRES[0], id_idioma: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 14, titulo: 'La Ciudad Escondida', sinopsis: 'Un periodista descubre una ciudad oculta bajo la metrópolis.', poster_url: PEXELS_POSTERS[1], duracion: 135, fecha_estreno: '2025-04-01', id_genero: 2, genero: MOCK_GENRES[1], id_idioma: 2, idioma: MOCK_LANGUAGES[1], estado: 'Activa' },
  { id: 15, titulo: 'Noche de Pesadilla', sinopsis: 'Un grupo de amigos enfrenta sus peores miedos en una noche aterradora.', poster_url: PEXELS_POSTERS[2], duracion: 90, fecha_estreno: '2025-03-20', id_genero: 3, genero: MOCK_GENRES[2], id_idioma: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
];

export const MOCK_FUNCIONES: Funcion[] = [
  { id: 1, fecha_hora: '2026-06-12T14:00:00Z', estado: 'DISPONIBLE', precio: 150, pelicula_id: 1, pelicula: MOCK_MOVIES[0], sala_id: 1, sala: MOCK_ROOMS[0], cine: MOCK_CINEMAS[0] },
  { id: 2, fecha_hora: '2026-06-12T17:30:00Z', estado: 'DISPONIBLE', precio: 180, pelicula_id: 1, pelicula: MOCK_MOVIES[0], sala_id: 1, sala: MOCK_ROOMS[0], cine: MOCK_CINEMAS[0] },
  { id: 3, fecha_hora: '2026-06-12T20:00:00Z', estado: 'DISPONIBLE', precio: 150, pelicula_id: 2, pelicula: MOCK_MOVIES[1], sala_id: 2, sala: MOCK_ROOMS[1], cine: MOCK_CINEMAS[1] },
  { id: 4, fecha_hora: '2026-06-12T22:30:00Z', estado: 'DISPONIBLE', precio: 180, pelicula_id: 3, pelicula: MOCK_MOVIES[2], sala_id: 3, sala: MOCK_ROOMS[2], cine: MOCK_CINEMAS[2] },
  { id: 5, fecha_hora: '2026-06-12T23:00:00Z', estado: 'DISPONIBLE', precio: 150, pelicula_id: 4, pelicula: MOCK_MOVIES[3], sala_id: 4, sala: MOCK_ROOMS[3], cine: MOCK_CINEMAS[3] },
  // Funciones futuras para reservas con días de anticipación (hoy: 2026-06-20)
  { id: 6,  fecha_hora: '2026-06-21T16:00:00Z', estado: 'DISPONIBLE', precio: 150, pelicula_id: 1, pelicula: MOCK_MOVIES[0], sala_id: 1, sala: MOCK_ROOMS[0], cine: MOCK_CINEMAS[0] },
  { id: 7,  fecha_hora: '2026-06-21T19:30:00Z', estado: 'DISPONIBLE', precio: 180, pelicula_id: 2, pelicula: MOCK_MOVIES[1], sala_id: 2, sala: MOCK_ROOMS[1], cine: MOCK_CINEMAS[1] },
  { id: 8,  fecha_hora: '2026-06-22T20:00:00Z', estado: 'AGOTADO',    precio: 150, pelicula_id: 3, pelicula: MOCK_MOVIES[2], sala_id: 3, sala: MOCK_ROOMS[2], cine: MOCK_CINEMAS[2] },
  { id: 9,  fecha_hora: '2026-06-23T18:00:00Z', estado: 'DISPONIBLE', precio: 180, pelicula_id: 4, pelicula: MOCK_MOVIES[3], sala_id: 4, sala: MOCK_ROOMS[3], cine: MOCK_CINEMAS[3] },
  { id: 10, fecha_hora: '2026-06-25T21:00:00Z', estado: 'DISPONIBLE', precio: 150, pelicula_id: 5, pelicula: MOCK_MOVIES[4], sala_id: 5, sala: MOCK_ROOMS[4], cine: MOCK_CINEMAS[1] },
  { id: 11, fecha_hora: '2026-06-27T17:00:00Z', estado: 'DISPONIBLE', precio: 200, pelicula_id: 1, pelicula: MOCK_MOVIES[0], sala_id: 6, sala: MOCK_ROOMS[5], cine: MOCK_CINEMAS[1] },
  { id: 12, fecha_hora: '2026-06-28T22:30:00Z', estado: 'CANCELADO',  precio: 150, pelicula_id: 2, pelicula: MOCK_MOVIES[1], sala_id: 7, sala: MOCK_ROOMS[6], cine: MOCK_CINEMAS[2] },
  { id: 13, fecha_hora: '2026-07-01T19:00:00Z', estado: 'DISPONIBLE', precio: 180, pelicula_id: 3, pelicula: MOCK_MOVIES[2], sala_id: 8, sala: MOCK_ROOMS[7], cine: MOCK_CINEMAS[2] },
  { id: 14, fecha_hora: '2026-07-03T20:30:00Z', estado: 'DISPONIBLE', precio: 200, pelicula_id: 5, pelicula: MOCK_MOVIES[4], sala_id: 9, sala: MOCK_ROOMS[8], cine: MOCK_CINEMAS[3] },
  { id: 15, fecha_hora: '2026-07-05T16:30:00Z', estado: 'DISPONIBLE', precio: 150, pelicula_id: 4, pelicula: MOCK_MOVIES[3], sala_id: 10, sala: MOCK_ROOMS[9], cine: MOCK_CINEMAS[3] },
];

// Helper para construir asientos de una reserva de forma compacta.
function mockAsientos(labels: string[], startId: number): AsientoFuncion[] {
  return labels.map((label, i) => ({
    id: startId + i,
    estado: 'RESERVADO',
    asiento: {
      id: startId + i,
      fila: label.charAt(0),
      columna: Number(label.slice(1)),
      tipo: 'NORMAL',
    },
  }));
}

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 1, codigo: 'RES-001', estado: 'CONFIRMADA', total: 450, usuario_id: 3, usuario: MOCK_USERS[2],
    funcion_id: 101,
    funcion: { id: 101, fecha_hora: '2026-06-25T20:00:00Z', estado: 'DISPONIBLE', precio: 150, pelicula_id: 1, pelicula: MOCK_MOVIES[0], sala_id: 3, sala: MOCK_ROOMS[2], cine: MOCK_CINEMAS[0] },
    asientos: mockAsientos(['E5', 'E6', 'E7'], 1),
    payment: { id: 1, monto: 450, metodo: 'TARJETA', estado: 'COMPLETADO', referencia: 'TXN-001' },
    createdAt: '2026-06-10',
  },
  {
    id: 2, codigo: 'RES-002', estado: 'PAGADA', total: 360, usuario_id: 3, usuario: MOCK_USERS[2],
    funcion_id: 102,
    funcion: { id: 102, fecha_hora: '2026-06-28T17:30:00Z', estado: 'DISPONIBLE', precio: 180, pelicula_id: 2, pelicula: MOCK_MOVIES[1], sala_id: 4, sala: MOCK_ROOMS[3], cine: MOCK_CINEMAS[1] },
    asientos: mockAsientos(['C8', 'C9'], 10),
    payment: { id: 2, monto: 360, metodo: 'TARJETA', estado: 'COMPLETADO', referencia: 'TXN-002' },
    createdAt: '2026-06-12',
  },
  {
    id: 3, codigo: 'RES-003', estado: 'PAGADA', total: 150, usuario_id: 3, usuario: MOCK_USERS[2],
    funcion_id: 103,
    funcion: { id: 103, fecha_hora: '2026-07-02T22:00:00Z', estado: 'DISPONIBLE', precio: 150, pelicula_id: 5, pelicula: MOCK_MOVIES[4], sala_id: 1, sala: MOCK_ROOMS[0], cine: MOCK_CINEMAS[0] },
    asientos: mockAsientos(['A1'], 20),
    payment: { id: 3, monto: 150, metodo: 'EFECTIVO', estado: 'COMPLETADO', referencia: 'TXN-003' },
    createdAt: '2026-06-15',
  },
  {
    id: 4, codigo: 'RES-004', estado: 'USADA', total: 300, usuario_id: 3, usuario: MOCK_USERS[2],
    funcion_id: 104,
    funcion: { id: 104, fecha_hora: '2026-06-05T19:00:00Z', estado: 'FINALIZADA', precio: 150, pelicula_id: 3, pelicula: MOCK_MOVIES[2], sala_id: 2, sala: MOCK_ROOMS[1], cine: MOCK_CINEMAS[0] },
    asientos: mockAsientos(['D4', 'D5'], 30),
    payment: { id: 4, monto: 300, metodo: 'TARJETA', estado: 'COMPLETADO', referencia: 'TXN-004' },
    createdAt: '2026-05-30',
  },
  {
    id: 5, codigo: 'RES-005', estado: 'CANCELADA', total: 180, usuario_id: 3, usuario: MOCK_USERS[2],
    funcion_id: 105,
    funcion: { id: 105, fecha_hora: '2026-05-20T21:30:00Z', estado: 'FINALIZADA', precio: 180, pelicula_id: 4, pelicula: MOCK_MOVIES[3], sala_id: 4, sala: MOCK_ROOMS[3], cine: MOCK_CINEMAS[1] },
    asientos: mockAsientos(['B2'], 40),
    payment: { id: 5, monto: 180, metodo: 'TRANSFERENCIA', estado: 'REEMBOLSADO', referencia: 'TXN-005' },
    createdAt: '2026-05-15',
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 1, monto: 450, metodo: 'TARJETA', estado: 'COMPLETADO', referencia: 'TXN-001', reserva_id: 1, createdAt: '2026-06-09' },
  { id: 2, monto: 360, metodo: 'TARJETA', estado: 'COMPLETADO', referencia: 'TXN-002', reserva_id: 2, createdAt: '2026-06-10' },
  { id: 3, monto: 150, metodo: 'EFECTIVO', estado: 'PENDIENTE', referencia: 'TXN-003', reserva_id: 3, createdAt: '2026-06-11' },
  { id: 4, monto: 900, metodo: 'TARJETA', estado: 'COMPLETADO', referencia: 'TXN-004', reserva_id: 4, createdAt: '2026-06-11' },
  { id: 5, monto: 300, metodo: 'TRANSFERENCIA', estado: 'FALLIDO', referencia: 'TXN-005', reserva_id: 5, createdAt: '2026-06-12' },
  { id: 6, monto: 540, metodo: 'TARJETA', estado: 'COMPLETADO', referencia: 'TXN-006', reserva_id: 6, createdAt: '2026-06-12' },
  { id: 7, monto: 180, metodo: 'EFECTIVO', estado: 'COMPLETADO', referencia: 'TXN-007', reserva_id: 7, createdAt: '2026-06-13' },
  { id: 8, monto: 720, metodo: 'TARJETA', estado: 'REEMBOLSADO', referencia: 'TXN-008', reserva_id: 8, createdAt: '2026-06-13' },
  { id: 9, monto: 270, metodo: 'TRANSFERENCIA', estado: 'COMPLETADO', referencia: 'TXN-009', reserva_id: 9, createdAt: '2026-06-14' },
  { id: 10, monto: 450, metodo: 'TARJETA', estado: 'PENDIENTE', referencia: 'TXN-010', reserva_id: 10, createdAt: '2026-06-14' },
  { id: 11, monto: 630, metodo: 'TARJETA', estado: 'COMPLETADO', referencia: 'TXN-011', reserva_id: 11, createdAt: '2026-06-15' },
  { id: 12, monto: 210, metodo: 'EFECTIVO', estado: 'COMPLETADO', referencia: 'TXN-012', reserva_id: 12, createdAt: '2026-06-15' },
];

export const MOCK_REFUNDS: Refund[] = [
  { id: 1, monto: 200, estado: 'PROCESADO', motivo: 'Función cancelada', pago_id: 3, createdAt: '2026-06-09' },
];

export const MOCK_COUPONS: Coupon[] = [
  { id: 1, codigo: 'SAVE20', tipo: 'PORCENTAJE', valor: 20, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31', usos_maximo: 100, usos_actuales: 25, activo: true },
  { id: 2, codigo: 'BIENVENIDO', tipo: 'FIJO', valor: 50, fecha_inicio: '2026-01-01', fecha_fin: '2026-06-30', usos_maximo: 500, usos_actuales: 120, activo: true },
  { id: 3, codigo: 'CINEVIP', tipo: 'PORCENTAJE', valor: 15, fecha_inicio: '2026-05-01', fecha_fin: '2026-05-31', usos_maximo: 50, usos_actuales: 50, activo: false },
  { id: 4, codigo: 'LUNES2X1', tipo: 'PORCENTAJE', valor: 50, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31', usos_maximo: 1000, usos_actuales: 450, activo: true },
  { id: 5, codigo: 'PROMO10', tipo: 'FIJO', valor: 10, fecha_inicio: '2026-01-01', fecha_fin: '2026-03-31', usos_maximo: 200, usos_actuales: 200, activo: false },
];

export const MOCK_POLICIES: CancellationPolicy[] = [
  { id: 1,  nombre: 'Reembolso Completo',          descripcion: 'Cancela hasta 24 horas antes de la función',           horas_limite: 24,  porcentaje_reembolso: 100, activo: true,  createdAt: '2026-01-10' },
  { id: 2,  nombre: 'Reembolso Parcial 50%',        descripcion: 'Aplica a cancelaciones con al menos 12 horas de aviso', horas_limite: 12,  porcentaje_reembolso: 50,  activo: true,  createdAt: '2026-01-15' },
  { id: 3,  nombre: 'Sin Reembolso',                descripcion: 'Promociones y boletos en oferta',                       horas_limite: 0,   porcentaje_reembolso: 0,   activo: false, createdAt: '2026-02-01' },
  { id: 4,  nombre: 'Estrenos y Preestrenos',       descripcion: 'Política estricta para funciones especiales',           horas_limite: 72,  porcentaje_reembolso: 100, activo: true,  createdAt: '2026-02-10' },
  { id: 5,  nombre: 'Madrugada',                    descripcion: 'Funciones de madrugada y horario nocturno',             horas_limite: 6,   porcentaje_reembolso: 25,  activo: true,  createdAt: '2026-02-20' },
  { id: 6,  nombre: 'Temporada Alta',               descripcion: 'Vacaciones y días festivos',                            horas_limite: 48,  porcentaje_reembolso: 75,  activo: true,  createdAt: '2026-03-01' },
  { id: 7,  nombre: 'Función Familiar',             descripcion: 'Matinés y funciones infantiles',                        horas_limite: 3,   porcentaje_reembolso: 100, activo: true,  createdAt: '2026-03-05' },
  { id: 8,  nombre: 'IMAX Premium',                 descripcion: 'Salas IMAX y experiencias premium',                    horas_limite: 96,  porcentaje_reembolso: 80,  activo: false, createdAt: '2026-03-10' },
  { id: 9,  nombre: 'Evento Deportivo',             descripcion: 'Transmisiones en vivo de deportes',                    horas_limite: 48,  porcentaje_reembolso: 0,   activo: true,  createdAt: '2026-03-15' },
  { id: 10, nombre: 'Función Privada',              descripcion: 'Alquiler exclusivo de sala',                            horas_limite: 168, porcentaje_reembolso: 50,  activo: true,  createdAt: '2026-03-20' },
  { id: 11, nombre: 'Boleto Flexible',              descripcion: 'Permite cambios hasta 1 hora antes',                   horas_limite: 1,   porcentaje_reembolso: 100, activo: true,  createdAt: '2026-04-01' },
  { id: 12, nombre: 'Suscripción Mensual',          descripcion: 'Clientes con plan de membresía activa',                horas_limite: 2,   porcentaje_reembolso: 100, activo: false, createdAt: '2026-04-10' },
];

export const MOCK_CINES = MOCK_CINEMAS;
export const MOCK_FUNCTIONS = MOCK_FUNCIONES;

// Helper functions
export function getPosterByIndex(index: number): string {
  return PEXELS_POSTERS[index % PEXELS_POSTERS.length];
}

export function getMockCinesForMovie(movieId: number) {
  return MOCK_CINEMAS.map((cine) => ({
    ...cine,
    funciones: MOCK_FUNCIONES.filter((f) => f.pelicula_id === movieId && f.cine?.id === cine.id),
  }));
}

export function getMockFuncionById(funcionId: number) {
  return MOCK_FUNCIONES.find((f) => f.id === funcionId) || null;
}

export function getMockSeatsForFuncion(funcionId: number) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seats: Array<{
    id: number;
    estado: string;
    asiento: { id: number; fila: string; columna: number; tipo: string };
  }> = [];
  let seatId = 1;
  rows.forEach((row, rowIndex) => {
    for (let col = 1; col <= 10; col++) {
      const isOccupied = Math.random() < 0.2;
      const isMaintenance = rowIndex === 3 && col === 5;
      seats.push({
        id: seatId,
        estado: isMaintenance ? 'MANTENIMIENTO' : isOccupied ? 'OCUPADO' : 'DISPONIBLE',
        asiento: {
          id: seatId,
          fila: row,
          columna: col,
          tipo: isMaintenance ? 'MANTENIMIENTO' : 'NORMAL',
        },
      });
      seatId++;
    }
  });
  return seats;
}

// Base de datos Mock extendida para simular persistencia en memoria dinámica
export let MOCK_USERS_DB = [...MOCK_USERS].map(u => ({ ...u, notificationsEnabled: false }));
// Función utilitaria interna para saber quién tiene la sesión activa en LocalStorage
function getActiveMockUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('movie_auth_session');
  if (!session) return null;
  try {
    return JSON.parse(session).email || null;
  } catch {
    return null;
  }
}

export function getMockProfile(): User {
  const activeEmail = getActiveMockUserEmail();
  const found = MOCK_USERS_DB.find(u => u.email.toLowerCase() === activeEmail?.toLowerCase());
  
  // 2. Aseguramos que el retorno mapee siempre la propiedad de las notificaciones
  return found 
    ? { 
        id: found.id, 
        name: found.name, 
        email: found.email, 
        phone: found.phone || '9999-0000', 
        roleId: found.roleId, 
        roleName: found.roleName,
        notificationsEnabled: !!found.notificationsEnabled 
      } 
    : { ...MOCK_USERS_DB[0], notificationsEnabled: false };
}

// 3. CAMBIO CRÍTICO: Usamos Partial para permitir recibir solo { notificationsEnabled: boolean }
export function updateMockProfile(data: Partial<{ name: string; email: string; phone: string; notificationsEnabled: boolean }>): User {
  const activeEmail = getActiveMockUserEmail();
  
  // Modificación segura combinando el estado anterior con los nuevos datos recibidos (...data)
  MOCK_USERS_DB = MOCK_USERS_DB.map(u => 
    u.email.toLowerCase() === activeEmail?.toLowerCase() 
      ? { ...u, ...data } // 👈 Así no borra el nombre/teléfono cuando solo cambias el toggle
      : u
  );

  // Sincronizar LocalStorage solo si vienen campos de sesión globales
  if (typeof window !== 'undefined' && activeEmail) {
    const session = localStorage.getItem('movie_auth_session');
    if (session) {
      const parsed = JSON.parse(session);
      const updatedSessionFields: Record<string, any> = {};
      if (data.name) updatedSessionFields.name = data.name;
      if (data.email) updatedSessionFields.email = data.email;

      localStorage.setItem('movie_auth_session', JSON.stringify({
        ...parsed,
        ...updatedSessionFields
      }));
    }
  }

  return getMockProfile();
}

export function changeMockPassword(current: string, newPass: string): { success: boolean } {
  const activeEmail = getActiveMockUserEmail();
  const user = MOCK_USERS_DB.find(u => u.email.toLowerCase() === activeEmail?.toLowerCase());
  
  if (!user || user.password !== current) {
    throw new Error('La contraseña actual es incorrecta.');
  }
  
  MOCK_USERS_DB = MOCK_USERS_DB.map(u => 
    u.email.toLowerCase() === activeEmail?.toLowerCase() ? { ...u, password: newPass } : u
  );
  return { success: true };
}