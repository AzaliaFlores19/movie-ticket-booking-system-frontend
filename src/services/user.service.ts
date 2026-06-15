import axios from '@/lib/axios';
import { MOCK_USERS_DB, getMockProfile, updateMockProfile, changeMockPassword } from '@/lib/mock-data';
import { User } from '@/types';

export const usersApi = {
  async getProfile(): Promise<User> {
    try {
      const { data } = await axios.get('/auth/profile');
      return data;
    } catch (error) {
      console.warn('API /auth/profile falló, usando datos Mock');
      return getMockProfile();
    }
  },

  async updateProfile(payload: { name: string; email: string; phone: string }): Promise<User> {
    try {
      const { data } = await axios.put('/auth/profile', payload);
      return data;
    } catch (error) {
      console.warn('API put /auth/profile falló, actualizando datos Mock');
      return updateMockProfile(payload);
    }
  },

  async changePassword(payload: { currentPassword?: string; newPassword?: string }): Promise<{ success: boolean }> {
    try {
      const { data } = await axios.post('/auth/change-password', payload);
      return data;
    } catch (error) {
      console.warn('API /auth/change-password falló, procesando en datos Mock');
      return changeMockPassword(payload.currentPassword || '', payload.newPassword || '');
    }
  }
};