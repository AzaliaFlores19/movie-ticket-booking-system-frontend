'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Ticket, X, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { couponsService } from '@/services/coupons.service';
import type { Coupon } from '@/types';

const PER_PAGE = 10;

const EMPTY_CREATE = { codigo: '', tipo: 'PORCENTAJE', valor: 0, fecha_fin: '', usos_maximo: 0 };
const EMPTY_EDIT   = { codigo: '', tipo: 'PORCENTAJE', valor: 0, fecha_fin: '', usos_maximo: 0 };

function formatDate(dateStr?: string) {
  if (!dateStr) return 'Sin límite';
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

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

const inputCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60";

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    couponsService.getAll().then((data) => {
      setCoupons(data);
      setLoading(false);
    });
  }, []);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);

  // Edit modal
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function toggleActive(id: number) {
    try {
      const updated = await couponsService.toggleStatus(id);
      setCoupons((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.info(updated.activo ? 'Cupón activado' : 'Cupón desactivado');
    } catch {
      toast.error('No se pudo cambiar el estado del cupón.');
    }
  }

  function openEdit(coupon: Coupon) {
    setEditingCoupon(coupon);
    setEditForm({
      codigo: coupon.codigo,
      tipo: coupon.tipo,
      valor: coupon.valor,
      fecha_fin: coupon.fecha_fin || '',
      usos_maximo: coupon.usos_maximo || 0,
    });
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await couponsService.create({
        codigo: createForm.codigo.toUpperCase(),
        tipo: createForm.tipo,
        valor: Number(createForm.valor),
        fecha_fin: createForm.fecha_fin || undefined,
        usos_maximo: Number(createForm.usos_maximo) || undefined,
      });
      setCoupons((prev) => [created, ...prev]);
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
      toast.success('Cupón creado correctamente');
    } catch {
      toast.error('No se pudo crear el cupón.');
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCoupon) return;
    try {
      const updated = await couponsService.update(editingCoupon.id, {
        codigo: editForm.codigo.toUpperCase(),
        tipo: editForm.tipo,
        valor: Number(editForm.valor),
        fecha_fin: editForm.fecha_fin || undefined,
        usos_maximo: Number(editForm.usos_maximo) || undefined,
      });
      setCoupons((prev) => prev.map((c) => (c.id === editingCoupon.id ? updated : c)));
      setEditingCoupon(null);
      toast.success('Cupón actualizado correctamente');
    } catch {
      toast.error('No se pudo actualizar el cupón.');
    }
  }

  async function handleDelete(id: number) {
    try {
      await couponsService.remove(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success('Cupón eliminado correctamente');
    } catch {
      toast.error('No se pudo eliminar el cupón.');
    }
    setDeletingId(null);
  }

  const filtered = coupons.filter(
    (c) =>
      c.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cupones</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestionar cupones de descuento</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Cupón
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between flex-wrap gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por código..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-full sm:w-64"
            />
          </div>
          <span className="text-xs text-zinc-500">{filtered.length} cupón{filtered.length !== 1 ? 'es' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
                {['Código', 'Tipo', 'Valor', 'Vencimiento', 'Usos', 'Estado', 'Acciones'].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-500 text-sm">
                    Cargando cupones...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Ticket className="w-10 h-10 text-zinc-700" />
                      <p className="text-sm text-zinc-500">No se encontraron cupones</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-md text-xs">
                        {coupon.codigo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {coupon.tipo === 'PORCENTAJE' ? 'Porcentaje' : 'Valor Fijo'}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {coupon.tipo === 'PORCENTAJE' ? `${coupon.valor}%` : `$${coupon.valor}`}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{formatDate(coupon.fecha_fin)}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {coupon.usos_actuales} / {coupon.usos_maximo || '∞'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(coupon.id)} className="flex items-center gap-2 group">
                        <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${coupon.activo ? 'bg-green-500' : 'bg-zinc-600'}`}>
                          <span className={`pointer-events-none inline-block h-4 w-4 m-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${coupon.activo ? 'translate-x-4' : 'translate-x-0'}`} />
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${coupon.activo ? 'text-green-400' : 'text-zinc-500'}`}>
                          {coupon.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-blue-400 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(coupon.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-zinc-800/60">
            {[
              { label: '«', target: 1 },
              { label: '‹', target: page - 1 },
              { label: String(page), target: page, active: true },
              { label: '›', target: page + 1 },
              { label: '»', target: totalPages },
            ].map(({ label, target, active }) => (
              <button
                key={label}
                onClick={() => setPage(Math.max(1, Math.min(totalPages, target)))}
                disabled={target < 1 || target > totalPages || target === page}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  active ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal — Crear Cupón */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white tracking-tight">Agregar Nuevo Cupón</h2>
              <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <Field label="Código del Cupón" required>
                <input
                  type="text"
                  required
                  placeholder="EJ: CINE2026"
                  className={`${inputCls} font-mono uppercase`}
                  value={createForm.codigo}
                  onChange={(e) => setCreateForm({ ...createForm, codigo: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo" required>
                  <select
                    className={inputCls}
                    value={createForm.tipo}
                    onChange={(e) => setCreateForm({ ...createForm, tipo: e.target.value })}
                  >
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                    <option value="FIJO">Valor Fijo ($)</option>
                  </select>
                </Field>
                <Field label="Valor" required>
                  <input
                    type="number"
                    required
                    min={1}
                    className={inputCls}
                    value={createForm.valor}
                    onChange={(e) => setCreateForm({ ...createForm, valor: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vencimiento">
                  <input
                    type="date"
                    className={inputCls}
                    value={createForm.fecha_fin}
                    onChange={(e) => setCreateForm({ ...createForm, fecha_fin: e.target.value })}
                  />
                </Field>
                <Field label="Límite de Usos">
                  <input
                    type="number"
                    min={0}
                    placeholder="0 = ilimitado"
                    className={inputCls}
                    value={createForm.usos_maximo}
                    onChange={(e) => setCreateForm({ ...createForm, usos_maximo: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 transition-colors">
                  CANCELAR
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
                  CREAR CUPÓN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal — Editar Cupón */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white tracking-tight">Editar Cupón</h2>
              <button onClick={() => setEditingCoupon(null)} className="text-zinc-500 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <Field label="Código del Cupón" required>
                <input
                  type="text"
                  required
                  className={`${inputCls} font-mono uppercase`}
                  value={editForm.codigo}
                  onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo" required>
                  <select
                    className={inputCls}
                    value={editForm.tipo}
                    onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
                  >
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                    <option value="FIJO">Valor Fijo ($)</option>
                  </select>
                </Field>
                <Field label="Valor" required>
                  <input
                    type="number"
                    required
                    min={1}
                    className={inputCls}
                    value={editForm.valor}
                    onChange={(e) => setEditForm({ ...editForm, valor: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vencimiento">
                  <input
                    type="date"
                    className={inputCls}
                    value={editForm.fecha_fin}
                    onChange={(e) => setEditForm({ ...editForm, fecha_fin: e.target.value })}
                  />
                </Field>
                <Field label="Límite de Usos">
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    value={editForm.usos_maximo}
                    onChange={(e) => setEditForm({ ...editForm, usos_maximo: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button type="button" onClick={() => setEditingCoupon(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 transition-colors">
                  CANCELAR
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
                  GUARDAR CAMBIOS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal — Confirmación de Borrado */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Eliminar cupón?</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Esta acción no se puede deshacer. El cupón dejará de estar disponible para todos los usuarios.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  onClick={() => handleDelete(deletingId)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
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
