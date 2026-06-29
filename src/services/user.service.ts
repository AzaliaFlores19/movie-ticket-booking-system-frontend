import axios from '@/lib/axios';

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  notificaciones_activas: boolean;
  roles: { id: number; nombre: string };
}

export const getMyProfile = async (): Promise<{ user: UserProfile }> => {
  const { data } = await axios.get('/users/me');
  return data;
};

export const updateProfile = async (id: number, profileData: { nombre?: string; email?: string; telefono?: string }): Promise<any> => {
  const { data } = await axios.patch(`/users/${id}`, profileData);
  return data;
};

export const toggleNotifications = async (id: number): Promise<any> => {
  const { data } = await axios.patch(`/users/${id}/notificaciones`);
  return data;
};

export const changePassword = async (id: number, passwordData: { passwordActual: string; passwordNueva: string }): Promise<any> => {
  const { data } = await axios.put(`/users/${id}/password`, passwordData);
  return data;
};
