import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('movie_auth_session');
    if (session) {
      const { token } = JSON.parse(session);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default instance;
