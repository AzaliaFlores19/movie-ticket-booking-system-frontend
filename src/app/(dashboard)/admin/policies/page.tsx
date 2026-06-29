'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, X, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { policiesApi } from '@/services/policies.service';
import type { CancellationPolicy } from '@/types';

const EMPTY_FORM = { horas_antes_minimo: 0, horas_antes_maximo: '' as string | number, porcentaje_reembolso: 100 };
type FormState = typeof EMPTY_FORM;

const inputCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="text-zinc-500 text-xs font-normal ml-1">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function windowLabel(p: CancellationPolicy) {
  const min = p.horas_antes_minimo;
  const max = p.horas_antes_maximo;
  if (max == null || max === 0) return `Desde ${min}h antes`;
  return `${min}h – ${max}h antes`;
}

function RefundBadge({ porcentaje }: { porcentaje: number }) {
  const color = porcentaje === 100 ? 'text-green-400' : porcentaje === 0 ? 'text-zinc-500' : 'text-amber-400';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-zinc-800/80 border border-zinc-700 rounded-full px-3 py-1">
      <span className={`font-bold ${color}`}>{porcentaje}%</span>
      <span className="text-zinc-500">reembolso</span>
    </span>
  );
}

export default function PoliciesAdminPage() {
  const [policies, setPolicies] = useState<CancellationPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CancellationPolicy | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const modalOpen = showCreate || !!editingPolicy;

  useEffect(() => {
    policiesApi.getAll()
      .then(setPolicies)
      .catch(() => toast.error('No se pudieron cargar las políticas'))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setShowCreate(true);
  }

  function openEdit(policy: CancellationPolicy) {
    setForm({
      horas_antes_minimo: policy.horas_antes_minimo,
      horas_antes_maximo: policy.horas_antes_maximo ?? '',
      porcentaje_reembolso: policy.porcentaje_reembolso,
    });
    setEditingPolicy(policy);
  }

  function closeModal() {
    setShowCreate(false);
    setEditingPolicy(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      horas_antes_minimo: Number(form.horas_antes_minimo),
      horas_antes_maximo: form.horas_antes_maximo !== '' ? Number(form.horas_antes_maximo) : null,
      porcentaje_reembolso: Number(form.porcentaje_reembolso),
    };
    try {
      if (showCreate) {
        // Eliminar todas las políticas existentes antes de crear la nueva
        await Promise.all(policies.map((p) => policiesApi.delete(p.id)));
        const newPolicy = await policiesApi.create(payload);
        setPolicies([newPolicy]);
        toast.success('Política creada correctamente.');
      } else if (editingPolicy) {
        const updated = await policiesApi.update(editingPolicy.id, payload);
        setPolicies((prev) => prev.map((p) => p.id === editingPolicy.id ? updated : p));
        toast.success('Política actualizada correctamente.');
      }
      closeModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo guardar la política');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Políticas</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestionar políticas de cancelación y reembolso</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Agregar Política
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
                {['Ventana de cancelación', '% Reembolso', 'Acciones'].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-zinc-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Cargando políticas...
                  </td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <ShieldCheck className="w-10 h-10 text-zinc-700" />
                      <p className="text-sm text-zinc-500 font-medium">No se encontraron políticas</p>
                    </div>
                  </td>
                </tr>
              ) : policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                      <p className="font-semibold text-zinc-100 group-hover:text-red-400 transition-colors">{windowLabel(policy)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RefundBadge porcentaje={policy.porcentaje_reembolso} />
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(policy)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-blue-400 transition-all active:scale-90" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal — Crear / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {showCreate ? 'Agregar Política' : 'Editar Política'}
              </h2>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Mínimo de horas" required>
                  <input
                    type="number" min={0} required autoFocus className={inputCls}
                    value={form.horas_antes_minimo}
                    onChange={(e) => setForm({ ...form, horas_antes_minimo: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Máximo de horas" hint="(opcional)">
                  <input
                    type="number" min={0} placeholder="Sin límite" className={inputCls}
                    value={form.horas_antes_maximo}
                    onChange={(e) => setForm({ ...form, horas_antes_maximo: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="% de Reembolso" required>
                <input
                  type="number" min={0} max={100} required className={inputCls}
                  value={form.porcentaje_reembolso}
                  onChange={(e) => setForm({ ...form, porcentaje_reembolso: Number(e.target.value) })}
                />
              </Field>
              <p className="text-[11px] text-zinc-500 bg-zinc-800/50 rounded-xl px-3 py-2">
                Se aplicará un reembolso del{' '}
                <span className="text-zinc-200 font-semibold">{form.porcentaje_reembolso}%</span>
                {' '}si se cancela entre{' '}
                <span className="text-zinc-200 font-semibold">{form.horas_antes_minimo}h</span>
                {form.horas_antes_maximo !== '' && (
                  <> y <span className="text-zinc-200 font-semibold">{form.horas_antes_maximo}h</span></>
                )}
                {' '}antes de la función.
              </p>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 transition-colors">CANCELAR</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  {showCreate ? 'CREAR POLÍTICA' : 'GUARDAR CAMBIOS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
