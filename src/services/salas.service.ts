import axios from '@/lib/axios';
import { Sala } from '@/types';

export type SeatPhysicalStatus = 'ESTANDAR' | 'MANTENIMIENTO';

export interface SalaSeat {
  id: number;
  id_sala: number;
  fila: string;
  columna: number;
  codigo: string;
  estadoFisico: string;
}

interface SeatStatusResponse {
  message: string;
  idAsiento: number;
  nuevoEstado: string;
}

export const salasService = {
  async getAll(): Promise<Sala[]> {
    const { data } = await axios.get('/salas');
    return Array.isArray(data) ? data : [];
  },

  async create(payload: {
    nombre: string;
    id_cine: number;
    filas: number;
    columnas: number;
    precio: number;
  }): Promise<Sala> {
    const { data } = await axios.post('/salas', payload);
    return data;
  },

  async update(id: number, payload: Partial<{
    nombre: string;
    id_cine: number;
    filas: number;
    columnas: number;
    precio: number;
  }>): Promise<Sala> {
    const { data } = await axios.put(`/salas/${id}`, payload);
    return data;
  },

  async getSeats(id: number): Promise<SalaSeat[]> {
    const { data } = await axios.get(`/salas/${id}/asientos`);
    return Array.isArray(data) ? data : [];
  },

  async updateSeatStatus(id: number, idAsiento: number, tipo: SeatPhysicalStatus): Promise<SeatStatusResponse> {
    const { data } = await axios.patch(`/salas/${id}/asientos/${idAsiento}/estado`, { tipo });
    return data;
  },
  async remove(id: number): Promise<{ message: string }> {
    const { data } = await axios.delete(`/salas/${id}`);
    return data;
  },
};
