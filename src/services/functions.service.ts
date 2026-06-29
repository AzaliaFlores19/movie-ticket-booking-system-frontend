import axios from '@/lib/axios';
import { getMockFuncionById, getMockSeatsForFuncion, MOCK_FUNCIONES } from '@/lib/mock-data';
import { AsientoFuncion, Funcion, FuncionFilters } from '@/types';

type ApiEnvelope<T> = T | { data: T };

function unwrapData<T>(payload: ApiEnvelope<T>): T {
  return 'data' in Object(payload) ? (payload as { data: T }).data : (payload as T);
}

// El endpoint GET /funciones/:id/asientos devuelve un objeto "plano"
// (id_asiento_funcion, fila, columna, tipo, ...). Lo normalizamos al shape
// AsientoFuncion que consumen el mapa visual y el flujo de reserva.
function normalizeSeat(raw: any): AsientoFuncion {
  if (raw && typeof raw === 'object' && 'id_asiento_funcion' in raw) {
    return {
      id: Number(raw.id_asiento_funcion),
      estado: raw.estado,
      asiento_id: raw.id_asiento_fisico != null ? Number(raw.id_asiento_fisico) : undefined,
      asiento: {
        id: raw.id_asiento_fisico != null ? Number(raw.id_asiento_fisico) : Number(raw.id_asiento_funcion),
        fila: String(raw.fila ?? '').trim(),
        columna: Number(raw.columna),
        tipo: raw.tipo ?? 'NORMAL',
      },
      id_usuario: raw.id_usuario != null ? Number(raw.id_usuario) : null,
      bloqueado_hasta: raw.bloqueado_hasta ?? null,
    };
  }
  // Ya viene en el shape AsientoFuncion (datos mock).
  return raw as AsientoFuncion;
}

export interface BlockSeatsResponse {
  message: string;
  asientosAfectados: number[];
  expira_at: string;
}

export const functionsService = {
  async getAll(filters?: FuncionFilters): Promise<Funcion[]> {
    try {
      const { data } = await axios.get<Funcion[]>('/funciones', { params: filters });
      return unwrapData<Funcion[]>(data);
    } catch (error) {
      console.warn('API call failed, using mock data for functions');
      return MOCK_FUNCIONES as Funcion[];
    }
  },

  async create(payload: Partial<Funcion>): Promise<Funcion> {
    const { data } = await axios.post<Funcion>('/funciones', payload);
    return unwrapData<Funcion>(data);
  },

  async update(id: number, payload: Partial<Funcion>): Promise<Funcion> {
    const { data } = await axios.put<Funcion>(`/funciones/${id}`, payload);
    return unwrapData<Funcion>(data);
  },

  async cancel(id: number): Promise<Funcion> {
    const { data } = await axios.patch<Funcion>(`/funciones/${id}/cancelar`);
    return unwrapData<Funcion>(data);
  },

  async getOne(id: number): Promise<Funcion | null> {
    try {
      const { data } = await axios.get<Funcion>(`/funciones/${id}`);
      return unwrapData<Funcion>(data);
    } catch {
      return getMockFuncionById(id) as Funcion | null;
    }
  },

  async getSeats(funcionId: number): Promise<AsientoFuncion[]> {
    try {
      const { data } = await axios.get(`/funciones/${funcionId}/asientos`);
      const list = unwrapData<any[]>(data);
      return (Array.isArray(list) ? list : []).map(normalizeSeat);
    } catch {
      return getMockSeatsForFuncion(funcionId) as AsientoFuncion[];
    }
  },

  // Bloqueo temporal de asientos en el carrito (control de concurrencia).
  // POST /funciones/:id/asientos/bloquear. Lanza el error de axios (409) si
  // algún asiento ya fue tomado por otro usuario, para que la UI lo maneje.
  async blockSeats(
    funcionId: number,
    asientosFuncionIds: number[],
    minutosExpiracion?: number,
  ): Promise<BlockSeatsResponse> {
    const { data } = await axios.post<BlockSeatsResponse>(
      `/funciones/${funcionId}/asientos/bloquear`,
      { asientosFuncionIds, ...(minutosExpiracion ? { minutosExpiracion } : {}) },
    );
    return data;
  },
};
