'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, Clock, Film, Plus, Search, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { SeatMap } from '@/components/seats/SeatMap';
import { MOCK_CINEMAS, MOCK_FUNCIONES, MOCK_MOVIES, MOCK_ROOMS, getMockSeatsForFuncion } from '@/lib/mock-data';
import { functionsService } from '@/services/functions.service';
import type { AsientoFuncion, Funcion } from '@/types';

const inputCls = 'w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60 [color-scheme:dark]';

const EMPTY_FORM = {
  pelicula_id: '',
  sala_id: '',
  fecha_hora: '',
  precio: '',
  estado: 'DISPONIBLE',
};

type FunctionForm = typeof EMPTY_FORM;

function statusClass(status: string) {
  const normalized = status?.toUpperCase();
  if (normalized === 'DISPONIBLE' || normalized === 'PROGRAMADA') return 'bg-green-500/15 text-green-300 border-green-500/20';
  if (normalized === 'CANCELADO') return 'bg-red-500/15 text-red-300 border-red-500/20';
  if (normalized === 'AGOTADO') return 'bg-amber-500/15 text-amber-300 border-amber-500/20';
  return 'bg-zinc-700/60 text-zinc-300 border-zinc-600';
}

function buildFunctionFromForm(form: FunctionForm): Funcion {
  const movie = MOCK_MOVIES.find((item) => item.id === Number(form.pelicula_id));
  const room = MOCK_ROOMS.find((item) => item.id === Number(form.sala_id));
  const cinema = MOCK_CINEMAS.find((item) => item.id === (room?.cine_id ?? room?.id_cine ?? room?.cines?.id));

  return {
    id: Date.now(),
    pelicula_id: Number(form.pelicula_id),
    pelicula: movie,
    sala_id: Number(form.sala_id),
    sala: room,
    cine: cinema,
    fecha_hora: new Date(form.fecha_hora).toISOString(),
    precio: form.precio ? Number(form.precio) : undefined,
    estado: form.estado,
  };
}

function FunctionFormFields({ form, onChange }: { form: FunctionForm; onChange: (form: FunctionForm) => void }) {
  const selectedRoom = MOCK_ROOMS.find((room) => room.id === Number(form.sala_id));
  const previewSeats = selectedRoom ? getMockSeatsForFuncion(selectedRoom.id) as AsientoFuncion[] : [];

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Pelicula <span className="text-red-500">*</span>
        </label>
        <select required value={form.pelicula_id} onChange={(event) => onChange({ ...form, pelicula_id: event.target.value })} className={inputCls}>
          <option value="">Seleccionar pelicula</option>
          {MOCK_MOVIES.map((movie) => (
            <option key={movie.id} value={movie.id}>{movie.titulo}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Sala <span className="text-red-500">*</span>
        </label>
        <select required value={form.sala_id} onChange={(event) => onChange({ ...form, sala_id: event.target.value })} className={inputCls}>
          <option value="">Seleccionar sala</option>
          {MOCK_ROOMS.map((room) => (
            <option key={room.id} value={room.id}>
              {room.nombre} - {room.cines?.nombre ?? room.cine?.nombre ?? 'Cine'}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Fecha y hora <span className="text-red-500">*</span>
          </label>
          <input required type="datetime-local" value={form.fecha_hora} onChange={(event) => onChange({ ...form, fecha_hora: event.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Precio</label>
          <input type="number" min="0" step="0.01" value={form.precio} onChange={(event) => onChange({ ...form, precio: event.target.value })} className={inputCls} placeholder="150" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Estado</label>
        <select value={form.estado} onChange={(event) => onChange({ ...form, estado: event.target.value })} className={inputCls}>
          <option value="DISPONIBLE">Disponible</option>
          <option value="PROGRAMADA">Programada</option>
          <option value="AGOTADO">Agotado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-zinc-300">Distribucion de asientos</label>
          <span className="text-xs text-zinc-500">{selectedRoom ? `${selectedRoom.filas ?? 8} filas x ${selectedRoom.columnas ?? 10} columnas` : 'Seleccione una sala'}</span>
        </div>
        <SeatMap seats={previewSeats} readOnly compact />
      </div>
    </>
  );
}

export default function FunctionsAdminPage() {
  const [functions, setFunctions] = useState<Funcion[]>(MOCK_FUNCIONES);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FunctionForm>(EMPTY_FORM);

  const filteredFunctions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return functions;
    return functions.filter((funcion) => {
      return [
        funcion.pelicula?.titulo,
        funcion.cine?.nombre,
        funcion.sala?.nombre,
        funcion.estado,
      ].some((value) => value?.toLowerCase().includes(term));
    });
  }, [functions, search]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildFunctionFromForm(form);

    setFunctions((prev) => [payload, ...prev]);
    functionsService.create({
      pelicula_id: payload.pelicula_id,
      sala_id: payload.sala_id,
      fecha_hora: payload.fecha_hora,
      precio: payload.precio,
      estado: payload.estado,
    }).catch(() => undefined);
    toast.success('Funcion creada correctamente');

    setFormOpen(false);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Funciones</h1>
          <p className="text-sm text-zinc-400 mt-1">Crear funciones del catalogo.</p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva funcion
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar funciones..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50"
            />
          </div>
          <span className="text-xs text-zinc-500">{filteredFunctions.length} funcion{filteredFunctions.length !== 1 ? 'es' : ''}</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['Pelicula', 'Fecha', 'Cine / sala', 'Precio', 'Estado'].map((column) => (
                <th key={column} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {filteredFunctions.map((funcion) => {
              const date = new Date(funcion.fecha_hora);
              return (
                <tr key={funcion.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center">
                        <Film className="h-4 w-4 text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100">{funcion.pelicula?.titulo ?? 'Pelicula sin titulo'}</p>
                        <p className="text-xs text-zinc-500">ID #{funcion.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5 text-zinc-600" />{date.toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5 text-xs"><Clock className="w-3.5 h-3.5 text-zinc-600" />{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    <p>{funcion.cine?.nombre ?? funcion.sala?.cines?.nombre ?? '-'}</p>
                    <p className="text-xs text-zinc-500">{funcion.sala?.nombre ?? '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{funcion.precio ? `L ${funcion.precio}` : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(funcion.estado)}`}>
                      {funcion.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto scrollbar-hide">
            <div className="sticky top-0 z-10 bg-zinc-900 flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Crear nueva funcion</h2>
              <button type="button" onClick={() => setFormOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <FunctionFormFields form={form} onChange={setForm} />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                  Crear funcion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
