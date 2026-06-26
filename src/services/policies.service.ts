import axios from '@/lib/axios';
import { MOCK_POLICIES } from '@/lib/mock-data';
import type { CancellationPolicy } from '@/types';

type BackendPolicy = {
  id: string | number;
  horas_antes_minimo: number;
  horas_antes_maximo?: number | null;
  porcentaje_reembolso: number | string;
};

function mapPolicy(p: BackendPolicy): CancellationPolicy {
  return {
    id: Number(p.id),
    nombre: `Política — ${p.horas_antes_minimo}h · ${Number(p.porcentaje_reembolso)}% reembolso`,
    horas_limite: p.horas_antes_minimo,
    porcentaje_reembolso: Number(p.porcentaje_reembolso),
    activo: true,
  };
}

export const policiesService = {
  async getAll(): Promise<CancellationPolicy[]> {
    try {
      const { data } = await axios.get<BackendPolicy[]>('/politicas-cancelacion');
      return Array.isArray(data) ? data.map(mapPolicy) : [];
    } catch {
      return [...MOCK_POLICIES];
    }
  },

  async getActive(): Promise<CancellationPolicy | null> {
    try {
      const all = await this.getAll();
      return all.find((p) => p.activo) ?? all[0] ?? null;
    } catch {
      return MOCK_POLICIES.find((p) => p.activo) ?? null;
    }
  },

  async create(dto: Pick<CancellationPolicy, 'horas_limite' | 'porcentaje_reembolso'>): Promise<CancellationPolicy> {
    const { data } = await axios.post<BackendPolicy>('/politicas-cancelacion', {
      horas_antes_minimo: dto.horas_limite,
      porcentaje_reembolso: dto.porcentaje_reembolso,
    });
    return mapPolicy(data);
  },

  async update(id: number, dto: Pick<CancellationPolicy, 'horas_limite' | 'porcentaje_reembolso'>): Promise<CancellationPolicy> {
    const { data } = await axios.put<BackendPolicy>(`/politicas-cancelacion/${id}`, {
      horas_antes_minimo: dto.horas_limite,
      porcentaje_reembolso: dto.porcentaje_reembolso,
    });
    return mapPolicy(data);
  },

  async remove(id: number): Promise<void> {
    await axios.delete(`/politicas-cancelacion/${id}`);
  },
};
