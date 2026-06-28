import axios from '@/lib/axios';
import { CreateFuncionDto } from '../types'; // Asumiendo que moveremos/crearemos tipos aquí

export const funcionesService = {
  async getAll() {
    const { data } = await axios.get('/funciones');
    return data;
  },

  async create(data: any) {
    const response = await axios.post('/funciones', data);
    return response.data;
  },

  async update(id: number, data: any) {
    const response = await axios.put(`/funciones/${id}`, data);
    return response.data;
  },

  async cancelar(id: number) {
    const response = await axios.patch(`/funciones/${id}/cancelar`);
    return response.data;
  },

  async remove(id: number) {
    const response = await axios.delete(`/funciones/${id}`);
    return response.data;
  },
};
