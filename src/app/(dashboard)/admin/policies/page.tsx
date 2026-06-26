'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { policiesService } from '@/services/policies.service';
import type { CancellationPolicy } from '@/types';

const PER_PAGE = 10;
const EMPTY_FORM = { nombre: '', descripcion: '', horas_limite: 24, porcentaje_reembolso: 100 };
type FormState = typeof EMPTY_FORM;

const inputCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function RefundBadge({ horas, porcentaje }: { horas: number; porcentaje: number }) {
  const color = porcentaje === 100 ? 'text-green-400' : porcentaje === 0 ? 'text-zinc-500' : 'text-amber-400';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-zinc-800/80 border border-zinc-700 rounded-full px-3 py-1">
      <span className="text-zinc-400">hasta {horas}h</span>
      <span className="text-zinc-600">·</span>
      <span className={`font-bold ${color}`}>{porcentaje}%</span>
    </span>
  );
}

export default function PoliciesAdminPage() {
  const [policies, setPolicies] = useState<CancellationPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    policiesService.getAll().then((data) => {
      setPolicies(data);
      setLoading(false);
    });
  }, []);

  const [showCreate, setShowCreate] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CancellationPolicy | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const modalOpen = showCreate || !!editingPolicy;

  function openCreate() {
    setForm(EMPTY_FORM);
    setShowCreate(true);
  }

  function openEdit(policy: CancellationPolicy) {
    setForm({
      nombre: policy.nombre,
      descripcion: policy.descripcion ?? '',
      horas_limite: policy.horas_limite,
      porcentaje_reembolso: policy.porcentaje_reembolso,
    });
    setEditingPolicy(policy);
  }

  function closeModal() {
    setShowCreate(false);
    setEditingPolicy(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = { horas_limite: form.horas_limite, porcentaje_reembolso: form.porcentaje_reembolso };
    try {
      if (showCreate) {
        const created = await policiesService.create(payload);
        setPolicies((prev) => [created, ...prev.map((p) => ({ ...p, activo: false }))]);
        toast.success('Política creada correctamente.');
      } else if (editingPolicy) {
        const updated = await policiesService.update(editingPolicy.id, payload);
        setPolicies((prev) => prev.map((p) => p.id === editingPolicy.id ? updated : p));
        toast.success('Política actualizada correctamente.');
      }
    } catch {
      toast.error('No se pudo guardar la política.');
    }
    closeModal();
  }

  async function handleDelete(id: number) {
    try {
      await policiesService.remove(id);
      setPolicies((prev) => prev.filter((p) => p.id !== id));
      toast.success('Política eliminada correctamente.');
    } catch {
      toast.error('No se pudo eliminar la política.');
    }
    setDeletingId(null);
  }

  function toggleActive(policy: CancellationPolicy) {
    const previousActive = policies.find((p) => p.activo);
    setPolicies((prev) => prev.map((p) => ({ ...p, activo: p.id === policy.id ? !p.activo : false })));
    if (!policy.activo && previousActive) {
      toast.success(`"${policy.nombre}" activada. "${previousActive.nombre}" fue desactivada.`);
    } else if (!policy.activo) {
      toast.success(`"${policy.nombre}" activada.`);
    } else {
      toast.info('Política desactivada.');
    }
  }

  const filtered = policies.filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between flex-wrap gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-full sm:w-64"
            />
          </div>
          <span className="text-xs text-zinc-500">{filtered.length} política{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
                {['Nombre', 'Límite / Reembolso', 'Estado', 'Acciones'].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-zinc-500 text-sm">
                    Cargando políticas...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <ShieldCheck className="w-10 h-10 text-zinc-700" />
                      <p className="text-sm text-zinc-500 font-medium">No se encontraron políticas</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((policy) => (
                <tr key={policy.id} className="hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-zinc-100 group-hover:text-red-400 transition-colors">{policy.nombre}</p>
                        {policy.descripcion && (
                          <p className="text-[11px] text-zinc-500 mt-0.5 max-w-[220px] truncate">{policy.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RefundBadge horas={policy.horas_limite} porcentaje={policy.porcentaje_reembolso} />
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(policy)} className="flex items-center gap-2">
                      <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${policy.activo ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <span className={`inline-block h-4 w-4 m-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${policy.activo ? 'translate-x-4' : 'translate-x-0'}`} />
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${policy.activo ? 'text-green-400' : 'text-zinc-500'}`}>
                        {policy.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(policy)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-blue-400 transition-all active:scale-90" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingId(policy.id)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-all active:scale-90" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-zinc-800/60">
            {[{ label: '«', target: 1 }, { label: '‹', target: page - 1 }, { label: String(page), target: page, active: true }, { label: '›', target: page + 1 }, { label: '»', target: totalPages }]
              .map(({ label, target, active }) => (
                <button key={label} onClick={() => setPage(Math.max(1, Math.min(totalPages, target)))}
                  disabled={target < 1 || target > totalPages || target === page}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}
                >{label}</button>
              ))}
          </div>
        )}
      </div>

      {/* Modal — Crear / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {showCreate ? 'Agregar Política' : 'Editar Política'}
              </h2>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Field label="Nombre de la Política" required>
                <input
                  type="text" required autoFocus placeholder="Ej: Reembolso Estándar"
                  className={inputCls} value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </Field>
              <Field label="Descripción">
                <input
                  type="text" placeholder="Breve descripción de cuándo aplica"
                  className={inputCls} value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Horas límite" required>
                  <input
                    type="number" min={0} required className={inputCls}
                    value={form.horas_limite}
                    onChange={(e) => setForm({ ...form, horas_limite: Number(e.target.value) })}
                  />
                </Field>
                <Field label="% de Reembolso" required>
                  <input
                    type="number" min={0} max={100} required className={inputCls}
                    value={form.porcentaje_reembolso}
                    onChange={(e) => setForm({ ...form, porcentaje_reembolso: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <p className="text-[11px] text-zinc-500 bg-zinc-800/50 rounded-xl px-3 py-2">
                Se aplicará un reembolso del{' '}
                <span className="text-zinc-200 font-semibold">{form.porcentaje_reembolso}%</span>{' '}
                si se cancela con al menos{' '}
                <span className="text-zinc-200 font-semibold">{form.horas_limite}h</span>{' '}
                de anticipación.
              </p>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 transition-colors">
                  CANCELAR
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
                  {showCreate ? 'CREAR POLÍTICA' : 'GUARDAR CAMBIOS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal — Confirmar borrado */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Eliminar política?</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Esta acción no se puede deshacer. Las funciones que usen esta política quedarán sin reglas de reembolso.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button onClick={() => setDeletingId(null)} className="flex-1 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  CANCELAR
                </button>
                <button onClick={() => handleDelete(deletingId)} className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20">
                  SÍ, ELIMINAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
