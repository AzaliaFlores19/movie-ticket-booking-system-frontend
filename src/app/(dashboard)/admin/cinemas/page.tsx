'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, X, Building2, MapPin, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { getCines, createCine, updateCine, deleteCine, type Cine } from '@/services/cinemas.service';
import { citiesService } from '@/services/cities.service';
import type { City } from '@/types'; 
const PER_PAGE = 10;

const EMPTY_FORM = { nombre: '', direccion: '', id_ciudad: '' };
type FormState = typeof EMPTY_FORM;

function toFormValues(cine: Cine): FormState {
  return {
    nombre: cine.nombre ?? '',
    direccion: cine.direccion ?? '',
    id_ciudad: String(cine.id_ciudad ?? ''),
  };
}

export default function CinemasAdminPage() {
  const [cinemas, setCinemas] = useState<Cine[]>([]);
  const [ciudades, setCiudades] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);

  const [editingCine, setEditingCine] = useState<Cine | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [deletingCine, setDeletingCine] = useState<Cine | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cinemasData, ciudadesData] = await Promise.all([
        getCines(),
        citiesService.getAll(),
      ]);
      setCinemas(cinemasData);
      setCiudades(ciudadesData);
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openEdit(cine: Cine) {
    setEditingCine(cine);
    setEditForm(toFormValues(cine));
  }

  function handleDelete(cine: Cine) {
    setDeletingCine(cine);
  }

  async function confirmDelete() {
    if (!deletingCine) return;
    try {
      await deleteCine(deletingCine.id);
      toast.success('Cine eliminado correctamente');
      setDeletingCine(null);
      fetchData();
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 409) {
        toast.error('No se puede eliminar el cine porque tiene salas o funciones asociadas.');
      } else {
        toast.error('Error al eliminar el cine');
      }
    }
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createCine({
        nombre: createForm.nombre,
        direccion: createForm.direccion,
        id_ciudad: Number(createForm.id_ciudad),
      });
      toast.success('Cine creado correctamente');
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      fetchData();
    } catch (error) {
      toast.error('Error al crear el cine');
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCine) return;
    try {
      await updateCine(editingCine.id, {
        nombre: editForm.nombre,
        direccion: editForm.direccion,
        id_ciudad: Number(editForm.id_ciudad),
      });
      toast.success('Cine actualizado correctamente');
      setEditingCine(null);
      fetchData();
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('No se puede modificar el cine porque tiene funciones activas.');
      } else {
        toast.error('Error al actualizar el cine');
      }
    }
  }

  const filtered = cinemas.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.ciudades?.nombre ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const inputCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60";

  return (
    <div className="space-y-6">
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

      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
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

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : (
          <>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-red-400" />
                          </div>
                          <span className="font-medium text-zinc-100">{cine.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          {cine.direccion ?? '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{cine.ciudades?.nombre ?? '—'}</td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(cine)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cine)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-900/50 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Componente de paginación acoplado correctamente */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-zinc-800/60 bg-zinc-950 rounded-b-2xl">
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
                    disabled={target < 1 || target > totalPages || (!active && target === page)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                      active ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </>
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
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre *</label>
                <input type="text" required placeholder="Nombre" value={createForm.nombre} onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Dirección</label>
                <input type="text" placeholder="Dirección" value={createForm.direccion} onChange={(e) => setCreateForm({ ...createForm, direccion: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Ciudad *</label>
                <select required value={createForm.id_ciudad} onChange={(e) => setCreateForm({ ...createForm, id_ciudad: e.target.value })} className={inputCls}>
                    <option value="">Seleccione una ciudad</option>
                    {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Crear</button>
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
              <h2 className="text-lg font-semibold text-white">Editar Cine</h2>
              <button onClick={() => setEditingCine(null)} className="text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre *</label>
                <input type="text" required value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Dirección</label>
                <input type="text" value={editForm.direccion} onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Ciudad *</label>
                <select required value={editForm.id_ciudad} onChange={(e) => setEditForm({ ...editForm, id_ciudad: e.target.value })} className={inputCls}>
                    <option value="">Seleccione una ciudad</option>
                    {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingCine(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal — Confirmar Eliminación */}
      {deletingCine && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Eliminar cine?</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Esta acción no se puede deshacer. ¿Deseas eliminar el cine "{deletingCine.nombre}"?
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCine(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
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