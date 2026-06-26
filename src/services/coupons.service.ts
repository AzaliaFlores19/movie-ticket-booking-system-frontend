import axios from '@/lib/axios';
import { MOCK_COUPONS } from '@/lib/mock-data';
import type { Coupon } from '@/types';

// Backend uses different field names — this maps them to the frontend type.
type BackendCoupon = {
  id: string | number;
  codigo: string;
  tipo: string;
  valor: number | string;
  fecha_expiracion: string;
  usos_maximos?: number | null;
  usos_actuales: number;
  activo: boolean;
  created_at?: string;
};

function mapCoupon(c: BackendCoupon): Coupon {
  return {
    id: Number(c.id),
    codigo: c.codigo,
    tipo: c.tipo,
    valor: Number(c.valor),
    fecha_fin: c.fecha_expiracion,
    usos_maximo: c.usos_maximos ?? undefined,
    usos_actuales: c.usos_actuales,
    activo: c.activo,
    createdAt: c.created_at,
  };
}

type CreateCouponPayload = {
  codigo: string;
  tipo: string;
  valor: number;
  fecha_fin?: string;
  usos_maximo?: number;
};

export const couponsService = {
  async getAll(): Promise<Coupon[]> {
    try {
      const { data } = await axios.get<BackendCoupon[]>('/cupones');
      return Array.isArray(data) ? data.map(mapCoupon) : [];
    } catch {
      return [...MOCK_COUPONS];
    }
  },

  async create(payload: CreateCouponPayload): Promise<Coupon> {
    const { data } = await axios.post<BackendCoupon>('/cupones', {
      codigo: payload.codigo,
      tipo: payload.tipo,
      valor: payload.valor,
      fecha_expiracion: payload.fecha_fin,
      usos_maximos: payload.usos_maximo || undefined,
    });
    return mapCoupon(data);
  },

  async update(id: number, payload: Partial<CreateCouponPayload>): Promise<Coupon> {
    const { data } = await axios.put<BackendCoupon>(`/cupones/${id}`, {
      ...(payload.codigo && { codigo: payload.codigo }),
      ...(payload.tipo && { tipo: payload.tipo }),
      ...(payload.valor !== undefined && { valor: payload.valor }),
      ...(payload.fecha_fin && { fecha_expiracion: payload.fecha_fin }),
      ...(payload.usos_maximo !== undefined && { usos_maximos: payload.usos_maximo }),
    });
    return mapCoupon(data);
  },

  async toggleStatus(id: number): Promise<Coupon> {
    const { data } = await axios.patch<BackendCoupon>(`/cupones/${id}/status`);
    return mapCoupon(data);
  },

  async remove(id: number): Promise<void> {
    await axios.delete(`/cupones/${id}`);
  },

  async validateCoupon(codigo: string): Promise<{ id: number; codigo: string; tipo: string; valor: number }> {
    const { data } = await axios.post('/cupones/validar', { codigo: codigo.toUpperCase().trim() });
    return { id: Number(data.id), codigo: data.codigo, tipo: data.tipo, valor: Number(data.valor) };
  },
};
