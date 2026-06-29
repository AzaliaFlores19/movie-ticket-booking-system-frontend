import axios from '@/lib/axios';

type ReservationReportFilters = {
  id_pelicula?: number;
  id_cine?: number;
  fecha?: string;
  estado?: string;
  page?: number;
  limit?: number;
};

type PaymentsReportFilters = {
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
};

export const reportsService = {
  async getReservations(filters: ReservationReportFilters) {
    const { data } = await axios.get('/admin/reportes/reservas', { params: filters });
    return data;
  },

  async exportReservationsCsv(filters: ReservationReportFilters) {
    const response = await axios.get('/admin/reportes/reservas/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  async getPayments(filters: PaymentsReportFilters) {
    const { data } = await axios.get('/admin/reportes/pagos', { params: filters });
    return data;
  },
};