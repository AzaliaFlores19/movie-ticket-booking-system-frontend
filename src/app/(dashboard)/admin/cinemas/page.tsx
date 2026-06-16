'use client';

import { useState } from 'react';
import { Search, Plus, Pencil, X, Building2, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { MOCK_CINEMAS, MOCK_CITIES } from '@/lib/mock-data';
import type { Cine } from '@/types';

const PER_PAGE = 10;

const EMPTY_FORM = { nombre: '', direccion: '', ciudad_id: '' };
type FormState = typeof EMPTY_FORM;

const inputCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60";

function toFormValues(cine: Cine): FormState {
  return {
    nombre: cine.nombre ?? '',
    direccion: cine.direccion ?? '',
    ciudad_id: String(cine.ciudad_id ?? ''),
  };
}

export default function CinemasAdminPage() {
  const [cinemas, setCinemas] = useState<Cine[]>([...MOCK_CINEMAS]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);

  const [editingCine, setEditingCine] = useState<Cine | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);

  function openEdit(cine: Cine) {
    setEditingCine(cine);
    setEditForm(toFormValues(cine));
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const city = MOCK_CITIES.find((c) => c.id === Number(createForm.ciudad_id));
    const newCine: Cine = {
      id: Date.now(),
      nombre: createForm.nombre,
      direccion: createForm.direccion,
      ciudad_id: Number(createForm.ciudad_id),
      ciudad: city,
    };
    setCinemas((prev) => [newCine, ...prev]);
    setShowCreate(false);
    setCreateForm(EMPTY_FORM);
    toast.success('Cine creado correctamente');
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCine) return;
    const city = MOCK_CITIES.find((c) => c.id === Number(editForm.ciudad_id));
    setCinemas((prev) =>
      prev.map((c) =>
        c.id === editingCine.id
          ? { ...c, nombre: editForm.nombre, direccion: editForm.direccion, ciudad_id: Number(editForm.ciudad_id), ciudad: city }
          : c
      )
    );
    setEditingCine(null);
    toast.success('Cine actualizado correctamente');
  }

  const filtered = cinemas.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.ciudad?.nombre ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cines</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestionar cartera de cines</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Cine
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
              placeholder="Buscar cines..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-64"
            />
          </div>
          <span className="text-xs text-zinc-500">{filtered.length} cine{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['Nombre', 'Dirección', 'Ciudad', ''].map((col) => (
                <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Building2 className="w-10 h-10 text-zinc-700" />
                    <p className="text-sm text-zinc-500">No se encontraron cines</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((cine) => (
                <tr key={cine.id} className="hover:bg-zinc-900/50 transition-colors">
                  {/* Nombre */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-red-400" />
                      </div>
                      <span className="font-medium text-zinc-100">{cine.nombre}</span>
                    </div>
                  </td>
                  {/* Dirección */}
                  <td className="px-4 py-3 text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      {cine.direccion ?? '—'}
                    </div>
                  </td>
                  {/* Ciudad */}
                  <td className="px-4 py-3 text-zinc-400">{cine.ciudad?.nombre ?? '—'}</td>
                  {/* Acción */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(cine)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
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

      {/* Modal — Agregar Cine */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Agregar Cine</h2>
              <button onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }} className="text-zinc-400 hover:text-white transition-colors">
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
                  placeholder="Nombre del cine"
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Dirección</label>
                <input
                  type="text"
                  placeholder="Dirección del cine"
                  value={createForm.direccion}
                  onChange={(e) => setCreateForm({ ...createForm, direccion: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={createForm.ciudad_id}
                  onChange={(e) => setCreateForm({ ...createForm, ciudad_id: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Seleccionar ciudad</option>
                  {MOCK_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
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

      {/* Modal — Editar Cine */}
      {editingCine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Editar Cine</h2>
              </div>
              <button onClick={() => setEditingCine(null)} className="text-zinc-400 hover:text-white transition-colors">
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
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Dirección</label>
                <input
                  type="text"
                  value={editForm.direccion}
                  onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={editForm.ciudad_id}
                  onChange={(e) => setEditForm({ ...editForm, ciudad_id: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Seleccionar ciudad</option>
                  {MOCK_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingCine(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
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
