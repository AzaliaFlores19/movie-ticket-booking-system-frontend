'use client';

import { useState } from 'react';
import { Search, Plus, Pencil, X, Monitor } from 'lucide-react';
import { toast } from 'react-toastify';
import { MOCK_ROOMS, MOCK_CINEMAS } from '@/lib/mock-data';
import type { Sala } from '@/types';

const PER_PAGE = 10;

const EMPTY_FORM = { nombre: '', cine_id: '', filas: '', columnas: '' };
type FormState = typeof EMPTY_FORM;

const inputCls =
  'w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60';

function toFormValues(sala: Sala): FormState {
  return {
    nombre: sala.nombre ?? '',
    cine_id: String(sala.cine_id ?? sala.id_cine ?? ''),
    filas: String(sala.filas ?? ''),
    columnas: String(sala.columnas ?? ''),
  };
}

export default function SalasAdminPage() {
  const [salas, setSalas] = useState<Sala[]>([...MOCK_ROOMS]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);

  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [dimWarning, setDimWarning] = useState(false);

  function openEdit(sala: Sala) {
    setEditingSala(sala);
    setEditForm(toFormValues(sala));
    setDimWarning(false);
  }

  function handleEditChange(field: 'filas' | 'columnas', value: string) {
    if (!editingSala) return;
    const original = toFormValues(editingSala);
    const changed =
      (field === 'filas' ? value !== original.filas : editForm.filas !== original.filas) ||
      (field === 'columnas' ? value !== original.columnas : editForm.columnas !== original.columnas);
    setDimWarning(changed);
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cine = MOCK_CINEMAS.find((c) => c.id === Number(createForm.cine_id));
    const newSala: Sala = {
      id: Date.now(),
      nombre: createForm.nombre,
      cine_id: Number(createForm.cine_id),
      filas: Number(createForm.filas),
      columnas: Number(createForm.columnas),
      cines: cine ? { id: cine.id, nombre: cine.nombre, direccion: cine.direccion } : undefined,
    };
    setSalas((prev) => [newSala, ...prev]);
    setShowCreate(false);
    setCreateForm(EMPTY_FORM);
    toast.success('Sala creada correctamente');
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSala) return;
    const cine = MOCK_CINEMAS.find((c) => c.id === Number(editForm.cine_id));
    setSalas((prev) =>
      prev.map((s) =>
        s.id === editingSala.id
          ? {
              ...s,
              nombre: editForm.nombre,
              cine_id: Number(editForm.cine_id),
              filas: Number(editForm.filas),
              columnas: Number(editForm.columnas),
              cines: cine ? { id: cine.id, nombre: cine.nombre, direccion: cine.direccion } : s.cines,
            }
          : s
      )
    );
    setEditingSala(null);
    toast.success('Sala actualizada correctamente');
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
      {/* Header */}
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

      {/* Table Card */}
      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        {/* Toolbar */}
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

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['#', 'Sala', 'Cine', 'Filas', 'Columnas', 'Total asientos', ''].map((col) => (
                <th
                  key={col}
                  className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7}>
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
                    {/* # */}
                    <td className="px-4 py-3 text-zinc-500 text-xs w-10">{globalOffset + idx + 1}</td>
                    {/* Sala */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center shrink-0">
                          <Monitor className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="font-medium text-zinc-100">{sala.nombre}</span>
                      </div>
                    </td>
                    {/* Cine */}
                    <td className="px-4 py-3 text-zinc-400">{sala.cines?.nombre ?? '—'}</td>
                    {/* Filas */}
                    <td className="px-4 py-3 text-zinc-400">{sala.filas ?? '—'}</td>
                    {/* Columnas */}
                    <td className="px-4 py-3 text-zinc-400">{sala.columnas ?? '—'}</td>
                    {/* Total */}
                    <td className="px-4 py-3">
                      <span className="text-zinc-100 font-medium">{total > 0 ? total : '—'}</span>
                    </td>
                    {/* Acción */}
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

        {/* Pagination */}
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
              <button
                onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="Ej. Sala 1, Sala VIP"
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Cine <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={createForm.cine_id}
                  onChange={(e) => setCreateForm({ ...createForm, cine_id: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Seleccionar cine</option>
                  {MOCK_CINEMAS.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Filas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Ej. 10"
                    value={createForm.filas}
                    onChange={(e) => setCreateForm({ ...createForm, filas: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Columnas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Ej. 15"
                    value={createForm.columnas}
                    onChange={(e) => setCreateForm({ ...createForm, columnas: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
              {createForm.filas && createForm.columnas && (
                <p className="text-xs text-zinc-500">
                  Total de asientos:{' '}
                  <span className="text-zinc-300 font-medium">
                    {Number(createForm.filas) * Number(createForm.columnas)}
                  </span>
                </p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                  Crear
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
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Cine <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={editForm.cine_id}
                  onChange={(e) => setEditForm({ ...editForm, cine_id: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Seleccionar cine</option>
                  {MOCK_CINEMAS.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Filas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editForm.filas}
                    onChange={(e) => handleEditChange('filas', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Columnas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editForm.columnas}
                    onChange={(e) => handleEditChange('columnas', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              {editForm.filas && editForm.columnas && (
                <p className="text-xs text-zinc-500">
                  Total de asientos:{' '}
                  <span className="text-zinc-300 font-medium">
                    {Number(editForm.filas) * Number(editForm.columnas)}
                  </span>
                </p>
              )}
              {dimWarning && (
                <div className="flex gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-amber-400 text-sm leading-snug">
                    Cambiar las dimensiones eliminará y recreará todos los asientos de esta sala. Esta acción no se puede realizar si ya existen funciones programadas.
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSala(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
