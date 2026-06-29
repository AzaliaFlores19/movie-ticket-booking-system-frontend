'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, X, Monitor, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { salasService } from '@/services/salas.service';
import { cinemasService } from '@/services/cinemas.service';
import type { Sala, Cine } from '@/types';

const PER_PAGE = 10;

const EMPTY_FORM = { nombre: '', id_cine: '', filas: '', columnas: '', precio: '' };
type FormState = typeof EMPTY_FORM;

const inputCls =
  'w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60';

function toFormValues(sala: Sala): FormState {
  return {
    nombre: sala.nombre ?? '',
    id_cine: String(sala.id_cine ?? ''),
    filas: String(sala.filas ?? ''),
    columnas: String(sala.columnas ?? ''),
    precio: String(sala.precio ?? ''),
  };
}

function SeatPreview({ filas, columnas }: { filas: number; columnas: number }) {
  if (!filas || !columnas || filas > 26 || columnas > 30) return null;
  const rows = Array.from({ length: filas }, (_, i) => String.fromCharCode(65 + i));
  const cols = Array.from({ length: columnas }, (_, i) => i + 1);
  return (
    <div className="mt-3 p-3 bg-zinc-800/50 border border-zinc-700/60 rounded-xl space-y-2">
      <p className="text-xs text-zinc-500 text-center mb-2">Vista previa de distribución</p>
      <div className="flex flex-col items-center gap-1 overflow-x-auto">
        {rows.map((fila) => (
          <div key={fila} className="flex items-center gap-1">
            <span className="text-[9px] text-zinc-600 w-3 shrink-0">{fila}</span>
            {cols.map((col) => (
              <div
                key={col}
                className="w-3 h-3 rounded-sm bg-zinc-600 border border-zinc-500/50"
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-zinc-700/40">
        <div className="h-0.5 w-8 bg-zinc-500 rounded" />
        <span className="text-[9px] text-zinc-500">PANTALLA</span>
        <div className="h-0.5 w-8 bg-zinc-500 rounded" />
      </div>
    </div>
  );
}

export default function SalasAdminPage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [cines, setCines] = useState<Cine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [dimWarning, setDimWarning] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([salasService.getAll(), cinemasService.getAll()])
      .then(([s, c]) => {
        if (!active) return;
        setSalas(s);
        setCines(c);
      })
      .catch(() => toast.error('Error al cargar datos'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function openEdit(sala: Sala) {
    setEditingSala(sala);
    setEditForm(toFormValues(sala));
    setDimWarning(false);
  }

  function handleEditChange(field: 'filas' | 'columnas', value: string) {
    if (!editingSala) return;
    const original = toFormValues(editingSala);
    const newForm = { ...editForm, [field]: value };
    const changed =
      newForm.filas !== original.filas || newForm.columnas !== original.columnas;
    setDimWarning(changed);
    setEditForm(newForm);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await salasService.create({
        nombre: createForm.nombre,
        id_cine: Number(createForm.id_cine),
        filas: Number(createForm.filas),
        columnas: Number(createForm.columnas),
        precio: Number(createForm.precio),
      });
      const cine = cines.find((c) => c.id === Number(createForm.id_cine));
      setSalas((prev) => [{ ...created, cines: cine ? { id: cine.id, nombre: cine.nombre, direccion: cine.direccion } : undefined }, ...prev]);
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      toast.success('Sala creada correctamente');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al crear la sala');
    } finally {
      setCreating(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSala) return;
    setSaving(true);
    try {
      const updated = await salasService.update(editingSala.id, {
        nombre: editForm.nombre,
        id_cine: Number(editForm.id_cine),
        filas: Number(editForm.filas),
        columnas: Number(editForm.columnas),
        precio: Number(editForm.precio),
      });
      const cine = cines.find((c) => c.id === Number(editForm.id_cine));
      setSalas((prev) =>
        prev.map((s) =>
          s.id === editingSala.id
            ? { ...updated, cines: cine ? { id: cine.id, nombre: cine.nombre, direccion: cine.direccion } : s.cines }
            : s
        )
      );
      setEditingSala(null);
      toast.success('Sala actualizada correctamente');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      const isActiveFunctions = typeof msg === 'string' && msg.includes('funciones programadas');
      toast.error(isActiveFunctions
        ? 'No se pueden cambiar las dimensiones: la sala tiene funciones programadas activas.'
        : Array.isArray(msg) ? msg.join(', ') : msg || 'Error al actualizar la sala'
      );
    } finally {
      setSaving(false);
    }
  }

  const filtered = salas.filter(
    (s) =>
      s.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (s.cines?.nombre ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const globalOffset = (page - 1) * PER_PAGE;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Salas</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestionar salas de cine</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Sala
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar salas..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-64"
            />
          </div>
          <span className="text-xs text-zinc-500">{filtered.length} sala{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['#', 'Sala', 'Cine', 'Filas', 'Columnas', 'Total asientos', 'Precio', ''].map((col) => (
                <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">Cargando salas...</td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Monitor className="w-10 h-10 text-zinc-700" />
                    <p className="text-sm text-zinc-500">No se encontraron salas</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((sala, idx) => {
                const total = (sala.filas ?? 0) * (sala.columnas ?? 0);
                return (
                  <tr key={sala.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3 text-zinc-500 text-xs w-10">{globalOffset + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center shrink-0">
                          <Monitor className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="font-medium text-zinc-100">{sala.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{sala.cines?.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{sala.filas ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{sala.columnas ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-zinc-100 font-medium">{total > 0 ? total : '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {sala.precio != null ? `L${sala.precio.toLocaleString('es-MX')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(sala)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

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

      {/* Modal — Agregar Sala */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-lg font-semibold text-white">Agregar Sala</h2>
              <button onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input type="text" required maxLength={50} placeholder="Ej. Sala 1, Sala VIP"
                  value={createForm.nombre} onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Cine <span className="text-red-500">*</span></label>
                <select required value={createForm.id_cine} onChange={(e) => setCreateForm({ ...createForm, id_cine: e.target.value })} className={inputCls}>
                  <option value="">Seleccionar cine</option>
                  {cines.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Filas <span className="text-red-500">*</span></label>
                  <input type="number" required min={1} max={26} placeholder="Ej. 10"
                    value={createForm.filas} onChange={(e) => setCreateForm({ ...createForm, filas: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Columnas <span className="text-red-500">*</span></label>
                  <input type="number" required min={1} max={30} placeholder="Ej. 15"
                    value={createForm.columnas} onChange={(e) => setCreateForm({ ...createForm, columnas: e.target.value })}
                    className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Precio por asiento (L) <span className="text-red-500">*</span></label>
                <input type="number" required min={0} placeholder="Ej. 150"
                  value={createForm.precio} onChange={(e) => setCreateForm({ ...createForm, precio: e.target.value })}
                  className={inputCls} />
              </div>
              {createForm.filas && createForm.columnas && (
                <>
                  <p className="text-xs text-zinc-500">
                    Total de asientos: <span className="text-zinc-300 font-medium">{Number(createForm.filas) * Number(createForm.columnas)}</span>
                  </p>
                  <SeatPreview filas={Number(createForm.filas)} columnas={Number(createForm.columnas)} />
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={creating}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                  {creating ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal — Editar Sala */}
      {editingSala && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Editar Sala</h2>
              </div>
              <button onClick={() => setEditingSala(null)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input type="text" required maxLength={50}
                  value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Cine <span className="text-red-500">*</span></label>
                <select required value={editForm.id_cine} onChange={(e) => setEditForm({ ...editForm, id_cine: e.target.value })} className={inputCls}>
                  <option value="">Seleccionar cine</option>
                  {cines.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Filas <span className="text-red-500">*</span></label>
                  <input type="number" required min={1} max={26}
                    value={editForm.filas} onChange={(e) => handleEditChange('filas', e.target.value)}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Columnas <span className="text-red-500">*</span></label>
                  <input type="number" required min={1} max={30}
                    value={editForm.columnas} onChange={(e) => handleEditChange('columnas', e.target.value)}
                    className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Precio por asiento (L)</label>
                <input type="number" min={0}
                  value={editForm.precio} onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
                  className={inputCls} />
              </div>
              {editForm.filas && editForm.columnas && (
                <>
                  <p className="text-xs text-zinc-500">
                    Total de asientos: <span className="text-zinc-300 font-medium">{Number(editForm.filas) * Number(editForm.columnas)}</span>
                  </p>
                  <SeatPreview filas={Number(editForm.filas)} columnas={Number(editForm.columnas)} />
                </>
              )}
              {dimWarning && (
                <div className="flex gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-amber-400 text-xs leading-snug">
                    Cambiar las dimensiones eliminará y recreará todos los asientos. No se puede realizar si la sala ya tiene funciones programadas.
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingSala(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
