import { MOCK_USERS } from '@/lib/mock-data';

export const authService = {


  
  async login(email: string, password: string) {
    // 1. Simular latencia de red de medio segundo
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2. Buscar al usuario ignorando mayúsculas/minúsculas
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

    // 3. Validar de forma estricta contra la contraseña del mock
    // Si el usuario no existe o la contraseña ingresada no coincide con su valor en MOCK_USERS
    if (!user || user.password !== password) {
      throw new Error('El correo electrónico o la contraseña son incorrectos');
    }

    // 4. Mecanismo de persistencia nativo del cliente
    // Guardamos los datos simulados en localStorage para que la app mantenga la sesión viva
    const sessionData = {
      email: user.email,
      name: user.name,
      role: user.roleName, // Guarda el rol dinámico ('ADMIN', 'SECRETARIO', 'CLIENTE')
      token: `mock-jwt-token-for-${user.id}`,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('movie_auth_session', JSON.stringify(sessionData));
    }

    // Retornamos el objeto para el componente Login
    return sessionData;
  },

  async register(name: string, email: string, password: string) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Comprobar si el correo ya existe en tus mocks
    const userExists = MOCK_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      throw new Error('Este correo electrónico ya está registrado.');
    }

    // Simulación de insertar el nuevo usuario en el array
    const newUser = {
      id: MOCK_USERS.length + 1,
      name,
      email,
      roleId: 3,
      roleName: 'CLIENTE',
      password, // Asignamos la contraseña para que luego pueda iniciar sesión
      createdAt: new Date().toISOString().split('T')[0],
    };

    MOCK_USERS.push(newUser);
    return { success: true };
  },

  async forgotPassword(email: string) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const userExists = MOCK_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!userExists) {
      throw new Error('No se encontró ninguna cuenta con ese correo electrónico.');
    }

    return { success: true };
  },

  // Método utilitario extra por si necesitas cerrar sesión en tu app
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('movie_auth_session');
    }
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('movie_auth_session');
    return session ? JSON.parse(session) : null;
  }
};