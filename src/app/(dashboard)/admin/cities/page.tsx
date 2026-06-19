'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { MOCK_CITIES } from '@/lib/mock-data';
import { citiesService } from '@/services/cities.service';
import type { City } from '@/types';

const inputCls = 'w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60';

export default function CitiesAdminPage() {
  const [cities, setCities] = useState<City[]>(MOCK_CITIES);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    citiesService.getAll().then(setCities).catch(() => setCities(MOCK_CITIES));
  }, []);

  const filteredCities = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cities;
    return cities.filter((city) => city.nombre.toLowerCase().includes(term));
  }, [cities, search]);

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

    if (editingCity) {
      const updated = { ...editingCity, nombre: cleanName };
      setCities((prev) => prev.map((city) => (city.id === editingCity.id ? updated : city)));
      citiesService.update(editingCity.id, { nombre: cleanName }).catch(() => undefined);
      toast.success('Ciudad actualizada correctamente');
    } else {
      const created: City = { id: Date.now(), nombre: cleanName, createdAt: new Date().toISOString() };
      setCities((prev) => [created, ...prev]);
      citiesService.create({ nombre: cleanName }).catch(() => undefined);
      toast.success('Ciudad creada correctamente');
    }

    setModalOpen(false);
    setName('');
    setEditingCity(null);
  }

  function handleDelete(city: City) {
    setCities((prev) => prev.filter((item) => item.id !== city.id));
    citiesService.delete(city.id).catch(() => undefined);
    toast.info('Ciudad eliminada de la vista');
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
              onChange={(event) => setSearch(event.target.value)}
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
            {filteredCities.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-14 text-center text-sm text-zinc-500">
                  No se encontraron ciudades
                </td>
              </tr>
            ) : (
              filteredCities.map((city) => (
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
                  <td className="px-4 py-3 text-zinc-400">{city.createdAt ? new Date(city.createdAt).toLocaleDateString() : '-'}</td>
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
                        onClick={() => handleDelete(city)}
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
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                  {editingCity ? 'Guardar cambios' : 'Crear ciudad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
