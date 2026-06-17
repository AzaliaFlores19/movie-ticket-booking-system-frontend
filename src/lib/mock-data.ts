import { Movie, Cine,  Funcion, User, Role, City, Sala, Genre, Language, Coupon, Payment, Refund, CancellationPolicy, Reservation } from '@/types';

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
  { id: 1, name: 'ADMIN', description: 'Acceso total al sistema' },
  { id: 2, name: 'SECRETARIO', description: 'Gestionar funciones y reservas' },
  { id: 3, name: 'CLIENTE', description: 'Reservar boletos y gestionar reservas propias' },
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
  { id: 1, nombre: 'CineMax Central', direccion: 'Av. Principal 123', ciudad_id: 1, ciudad: { id: 1, nombre: 'Ciudad de México' } },
  { id: 2, nombre: 'Multiplex Norte', direccion: 'Centro Comercial Norte 456', ciudad_id: 1, ciudad: { id: 1, nombre: 'Ciudad de México' } },
];

export const MOCK_ROOMS: Sala[] = [
  { id: 1, nombre: 'Sala 1', capacidad: 80, tipo: '2D', cine_id: 1, cine: { id: 1, nombre: 'CineMax Central' } },
  { id: 2, nombre: 'Sala 2', capacidad: 60, tipo: '3D', cine_id: 1, cine: { id: 1, nombre: 'CineMax Central' } },
];

export const MOCK_GENRES: Genre[] = [
  { id: 1, nombre: 'Acción' },
  { id: 2, nombre: 'Ciencia Ficción' },
  { id: 3, nombre: 'Terror' },
  { id: 4, nombre: 'Romance' },
];

export const MOCK_LANGUAGES: Language[] = [
  { id: 1, nombre: 'Inglés' },
  { id: 2, nombre: 'Español' },
];

export const MOCK_MOVIES: Movie[] = [
  { id: 1, titulo: 'Protocolo Sombra', sinopsis: 'Un agente de élite descubre una conspiración.', poster_url: PEXELS_POSTERS[0], duracion: 142, fecha_estreno: '2026-05-15', genero_id: 1, genero: MOCK_GENRES[0], idioma_id: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 2, titulo: 'La Última Señal', sinopsis: 'Un radioastrónomo recibe una transmisión misteriosa.', poster_url: PEXELS_POSTERS[1], duracion: 128, fecha_estreno: '2026-04-20', genero_id: 2, genero: MOCK_GENRES[1], idioma_id: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 3, titulo: 'Cosecha de Medianoche', sinopsis: '', poster_url: '', duracion: 105, fecha_estreno: '2026-03-10', genero_id: 3, genero: MOCK_GENRES[2], idioma_id: 2, idioma: MOCK_LANGUAGES[1], estado: 'Activa' },
  { id: 4, titulo: 'Corazón de la Ciudad', sinopsis: '', poster_url: '', duracion: 115, fecha_estreno: '2026-02-14', genero_id: 4, genero: MOCK_GENRES[3], idioma_id: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 5, titulo: 'Circuito Roto', sinopsis: '', poster_url: '', duracion: 135, fecha_estreno: '2026-01-22', genero_id: 2, genero: MOCK_GENRES[1], idioma_id: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 6, titulo: 'Camino Venenoso', sinopsis: '', poster_url: '', duracion: 118, fecha_estreno: '2025-12-05', genero_id: 1, genero: MOCK_GENRES[0], idioma_id: 2, idioma: MOCK_LANGUAGES[1], estado: 'Activa' },
  { id: 7, titulo: 'Eclipse Rojo', sinopsis: '', poster_url: '', duracion: 122, fecha_estreno: '2025-11-18', genero_id: 2, genero: MOCK_GENRES[1], idioma_id: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 8, titulo: 'La Mansión del Fin', sinopsis: '', poster_url: '', duracion: 98, fecha_estreno: '2025-10-31', genero_id: 3, genero: MOCK_GENRES[2], idioma_id: 2, idioma: MOCK_LANGUAGES[1], estado: 'Inactiva' },
  { id: 9, titulo: 'Furia Silenciosa', sinopsis: '', poster_url: '', duracion: 110, fecha_estreno: '2025-09-14', genero_id: 1, genero: MOCK_GENRES[0], idioma_id: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 10, titulo: 'Entre Sombras', sinopsis: '', poster_url: '', duracion: 95, fecha_estreno: '2025-08-20', genero_id: 4, genero: MOCK_GENRES[3], idioma_id: 2, idioma: MOCK_LANGUAGES[1], estado: 'Activa' },
  { id: 11, titulo: 'Zona Cero', sinopsis: '', poster_url: '', duracion: 130, fecha_estreno: '2025-07-04', genero_id: 2, genero: MOCK_GENRES[1], idioma_id: 1, idioma: MOCK_LANGUAGES[0], estado: 'Activa' },
  { id: 12, titulo: 'El Último Tren', sinopsis: '', poster_url: '', duracion: 108, fecha_estreno: '2025-06-15', genero_id: 3, genero: MOCK_GENRES[2], idioma_id: 2, idioma: MOCK_LANGUAGES[1], estado: 'Inactiva' },
];

export const MOCK_FUNCIONES: Funcion[] = [
  { id: 1, fecha_hora: '2026-06-12T14:00:00Z', estado: 'DISPONIBLE', precio: 150, pelicula_id: 1, pelicula: MOCK_MOVIES[0], sala_id: 1, sala: MOCK_ROOMS[0], cine: MOCK_CINEMAS[0] },
  { id: 2, fecha_hora: '2026-06-12T17:30:00Z', estado: 'DISPONIBLE', precio: 180, pelicula_id: 1, pelicula: MOCK_MOVIES[0], sala_id: 1, sala: MOCK_ROOMS[0], cine: MOCK_CINEMAS[0] },
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: 1, codigo: 'RES-001', estado: 'CONFIRMADA', total: 450, usuario_id: 3, usuario: MOCK_USERS[2], funcion_id: 1, funcion: MOCK_FUNCIONES[0], createdAt: '2026-06-10' },
  { id: 2, codigo: 'RES-002', estado: 'PAGADA', total: 360, usuario_id: 4, usuario: MOCK_USERS[3], funcion_id: 2, funcion: MOCK_FUNCIONES[1], createdAt: '2026-06-11' },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 1, monto: 450, metodo: 'TARJETA', estado: 'COMPLETADO', referencia: 'TXN-001', reserva_id: 1, createdAt: '2026-06-10' },
];

export const MOCK_REFUNDS: Refund[] = [
  { id: 1, monto: 200, estado: 'PROCESADO', motivo: 'Función cancelada', pago_id: 3, createdAt: '2026-06-09' },
];

export const MOCK_COUPONS: Coupon[] = [
  { id: 1, codigo: 'SAVE20', tipo: 'PORCENTAJE', valor: 20, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31', usos_maximo: 100, usos_actuales: 25, activo: true },
];

export const MOCK_POLICIES: CancellationPolicy[] = [
  { id: 1, nombre: 'Reembolso Completo', descripcion: 'Cancela hasta 24 horas antes de la función', horas_limite: 24, porcentaje_reembolso: 100, activo: true },
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
export let MOCK_USERS_DB = [...MOCK_USERS];

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
  
  // Buscar por el email de la sesión activa
  const found = MOCK_USERS_DB.find(u => u.email.toLowerCase() === activeEmail?.toLowerCase());
  
  // Si se encuentra, mapeamos los campos correctos garantizando 'roleName'
  return found 
    ? { id: found.id, name: found.name, email: found.email, phone: found.phone || '9999-0000', roleId: found.roleId, roleName: found.roleName } 
    : MOCK_USERS_DB[0]; // Fallback por seguridad
}

export function updateMockProfile(data: { name: string; email: string; phone: string }): User {
  const activeEmail = getActiveMockUserEmail();
  
  // 1. Actualizar base de datos mock en memoria
  MOCK_USERS_DB = MOCK_USERS_DB.map(u => 
    u.email.toLowerCase() === activeEmail?.toLowerCase() 
      ? { ...u, name: data.name, email: data.email, phone: data.phone } 
      : u
  );

  // 2. IMPORTANTE: Sincronizar el localStorage para que el Navbar o Sidebar cambien de nombre al instante
  if (typeof window !== 'undefined' && activeEmail) {
    const session = localStorage.getItem('movie_auth_session');
    if (session) {
      const parsed = JSON.parse(session);
      localStorage.setItem('movie_auth_session', JSON.stringify({
        ...parsed,
        name: data.name,
        email: data.email
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
