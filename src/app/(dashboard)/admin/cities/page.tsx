'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, MapPin, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { citiesService } from '@/services/cities.service';
import type { City } from '@/types';

const inputCls = 'w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60';

const PER_PAGE = 10;

function formatCreatedAt(value?: string) {
  return value ? value.split('T')[0] : '-';
}

// Extrae el mensaje de error que envía el backend NestJS (`message` puede ser string o string[]).
function getApiError(error: any, fallback: string) {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? fallback;
  return typeof message === 'string' ? message : fallback;
}

export default function CitiesAdminPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deletingCity, setDeletingCity] = useState<City | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    loadCities();
  }, []);

  async function loadCities() {
    try {
      setLoading(true);
      const data = await citiesService.getAll();
      setCities(data);
    } catch {
      toast.error('Error al cargar las ciudades');
    } finally {
      setLoading(false);
    }
  }

  const filteredCities = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cities;
    return cities.filter((city) => city.nombre.toLowerCase().includes(term));
  }, [cities, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCities.length / PER_PAGE));
  const paginatedCities = filteredCities.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Si el filtro/los datos reducen el total por debajo de la página actual, vuelve a una página válida.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function openCreate() {
    setEditingCity(null);
    setName('');
    setModalOpen(true);
  }

  function openEdit(city: City) {
    setEditingCity(city);
    setName(city.nombre);
    setModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();

    if (!cleanName) {
      toast.error('El nombre de la ciudad es requerido');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCity) {
        const updated = await citiesService.update(editingCity.id, { nombre: cleanName });
        setCities((prev) => prev.map((city) => (city.id === editingCity.id ? updated : city)));
        toast.success('Ciudad actualizada correctamente');
      } else {
        const created = await citiesService.create({ nombre: cleanName });
        setCities((prev) => [created, ...prev]);
        toast.success('Ciudad creada correctamente');
      }
      setModalOpen(false);
      setName('');
      setEditingCity(null);
    } catch (error) {
      toast.error(getApiError(error, 'No se pudo guardar la ciudad'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(city: City) {
    setSubmitting(true);
    try {
      await citiesService.delete(city.id);
      setCities((prev) => prev.filter((item) => item.id !== city.id));
      setDeletingCity(null);
      toast.success('Ciudad eliminada correctamente');
    } catch (error) {
      toast.error(getApiError(error, 'No se pudo eliminar la ciudad'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ciudades</h1>
          <p className="text-sm text-zinc-400 mt-1">Administrar ciudades disponibles para cines y funciones.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar ciudad
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Buscar ciudades..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50"
            />
          </div>
          <span className="text-xs text-zinc-500">{filteredCities.length} ciudad{filteredCities.length !== 1 ? 'es' : ''}</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['Ciudad', 'ID', 'Creacion', ''].map((column) => (
                <th key={column} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-14 text-center text-sm text-zinc-500">
                  Cargando ciudades...
                </td>
              </tr>
            ) : filteredCities.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-14 text-center text-sm text-zinc-500">
                  No se encontraron ciudades
                </td>
              </tr>
            ) : (
              paginatedCities.map((city) => (
                <tr key={city.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-red-400" />
                      </div>
                      <span className="font-medium text-zinc-100">{city.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 font-mono">#{city.id}</td>
                  <td className="px-4 py-3 text-zinc-400">{formatCreatedAt(city.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(city)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                        title="Editar ciudad"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCity(city)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-600/20 hover:text-red-300 transition-colors"
                        title="Eliminar ciudad"
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">{editingCity ? 'Editar ciudad' : 'Agregar ciudad'}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input value={name} onChange={(event) => setName(event.target.value)} className={inputCls} placeholder="Nombre de la ciudad" autoFocus />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Guardando...' : editingCity ? 'Guardar cambios' : 'Crear ciudad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCity && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Eliminar ciudad?</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Se eliminará <span className="font-medium text-zinc-200">{deletingCity.nombre}</span>. No podrás eliminarla si tiene cines asociados.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCity(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDelete(deletingCity)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
