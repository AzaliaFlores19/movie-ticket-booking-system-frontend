'use client';

import { useMemo, useState, useEffect } from 'react';
import { CalendarClock, Clock, Film, Pencil, Plus, Search, TicketX, X, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { funcionesService } from '@/services/funciones.service';
import { moviesService } from '@/services/movies.service';
import { salasService } from '@/services/salas.service';
import type { Funcion, Movie, Sala } from '@/types';

const PER_PAGE = 10;
const inputCls = 'w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60 [color-scheme:dark]';

const EMPTY_FORM = {
  pelicula_id: '',
  sala_id: '',
  fecha_hora: '',
};

type FunctionForm = typeof EMPTY_FORM;

function statusClass(status: string) {
  const normalized = status?.toUpperCase();
  if (normalized === 'DISPONIBLE' || normalized === 'PROGRAMADA') return 'bg-green-500/15 text-green-300 border-green-500/20';
  if (normalized === 'CANCELADA') return 'bg-red-500/15 text-red-300 border-red-500/20';
  if (normalized === 'AGOTADO') return 'bg-amber-500/15 text-amber-300 border-amber-500/20';
  return 'bg-zinc-700/60 text-zinc-300 border-zinc-600';
}
function formatFunctionDate(value?: string) {
  return value ? value.split('T')[0] : '-';
}

function formatFunctionTime(value?: string) {
  return value?.split('T')[1]?.slice(0, 5) || '-';
}

function formatFunctionDateTime(value?: string) {
  const date = formatFunctionDate(value);
  const time = formatFunctionTime(value);
  return date === '-' ? '-' : `${date} ${time}`;
}

function toDateTimeLocal(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

function toFormValues(funcion: Funcion): FunctionForm {
  return {
    pelicula_id: String(funcion.id_pelicula ?? ''),
    sala_id: String(funcion.id_sala ?? ''),
    fecha_hora: toDateTimeLocal(funcion.fecha_hora),
  };
}

function FunctionFormFields({ form, onChange, movies, rooms }: { form: FunctionForm; onChange: (form: FunctionForm) => void; movies: Movie[]; rooms: Sala[] }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Pelicula <span className="text-red-500">*</span>
        </label>
        <select required value={form.pelicula_id} onChange={(event) => onChange({ ...form, pelicula_id: event.target.value })} className={inputCls}>
          <option value="">Seleccionar pelicula</option>
          {movies.map((movie) => (
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
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.nombre} - {room.cines?.nombre ?? 'Cine'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Fecha y hora <span className="text-red-500">*</span>
        </label>
        <input required type="datetime-local" value={form.fecha_hora} onChange={(event) => onChange({ ...form, fecha_hora: event.target.value })} className={inputCls} />
      </div>
    </>
  );
}

export default function FunctionsAdminPage() {
  const [functions, setFunctions] = useState<Funcion[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Sala[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingFunction, setEditingFunction] = useState<Funcion | null>(null);
  const [form, setForm] = useState<FunctionForm>(EMPTY_FORM);
  const [cancelTarget, setCancelTarget] = useState<Funcion | null>(null);
  const [deletingFunction, setDeletingFunction] = useState<Funcion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferences();
    loadFunctions();
  }, []);

  async function loadFunctions() {
    setLoading(true);
    try {
      const data = await funcionesService.getAll();
      setFunctions(data);
    } catch {
      toast.error('Error al cargar funciones');
    } finally {
      setLoading(false);
    }
  }

  async function loadReferences() {
    try {
      const [moviesData, roomsData] = await Promise.all([
        moviesService.getAll(),
        salasService.getAll()
      ]);
      setMovies(moviesData);
      setRooms(roomsData);
    } catch {
      toast.error('Error al cargar catálogo de películas o salas');
    }
  }

  const filteredFunctions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return functions;
    return functions.filter((funcion) => {
      return [
        funcion.peliculas?.titulo,
        funcion.salas?.cines?.nombre,
        funcion.salas?.nombre,
        funcion.estado,
      ].some((value) => value?.toLowerCase().includes(term));
    });
  }, [functions, search]);

  const totalPages = Math.max(1, Math.ceil(filteredFunctions.length / PER_PAGE));
  const paginated = filteredFunctions.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function openCreate() {
    setEditingFunction(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(funcion: Funcion) {
    setEditingFunction(funcion);
    setForm(toFormValues(funcion));
    setFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    const [datePart, timePart] = form.fecha_hora.split('T');
    if (!datePart || !timePart) {
      toast.error('Formato de fecha inválido.');
      return;
    }
    
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    if (utcDate <= new Date()) {
      toast.error('La fecha y hora de la función deben ser futuras.');
      return;
    }

    const payload = {
      id_pelicula: Number(form.pelicula_id),
      id_sala: Number(form.sala_id),
      fecha_hora: utcDate.toISOString(),
    };

    try {
      if (editingFunction) {
        await funcionesService.update(editingFunction.id, payload);
        toast.success('Funcion actualizada correctamente');
      } else {
        await funcionesService.create(payload);
        toast.success('Funcion creada correctamente');
      }
      setFormOpen(false);
      setEditingFunction(null);
      setForm(EMPTY_FORM);
      loadFunctions();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al guardar la funcion';
      toast.error(msg);
    }
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    try {
      await funcionesService.cancelar(cancelTarget.id);
      toast.info('Funcion cancelada. Se notificara a clientes afectados.');
      setCancelTarget(null);
      loadFunctions();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al cancelar la funcion';
      toast.error(msg);
    }
  }

  function handleDelete(funcion: Funcion) {
    setDeletingFunction(funcion);
  }

  async function confirmDelete() {
    if (!deletingFunction) return;
    try {
      await funcionesService.remove(deletingFunction.id);
      toast.success('Funcion eliminada correctamente');
      setDeletingFunction(null);
      loadFunctions();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al eliminar la funcion';
      toast.error(msg);
    }
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
          onClick={openCreate}
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
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Buscar funciones..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50"
            />
          </div>
          <span className="text-xs text-zinc-500">{filteredFunctions.length} funcion{filteredFunctions.length !== 1 ? 'es' : ''}</span>
        </div>

        {loading ? (
            <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
        ) : (
            <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-zinc-800/60">
                {['Pelicula', 'Fecha', 'Cine', 'Sala', 'Estado', ''].map((column) => (
                    <th key={column} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {column}
                    </th>
                ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
                {paginated.length === 0 ? (
                <tr>
                    <td colSpan={6} className="text-center py-10 text-zinc-500">No se encontraron funciones</td>
                </tr>
                ) : (
                paginated.map((funcion) => (
                    <tr key={funcion.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center overflow-hidden">
                            <div className="h-full w-full flex items-center justify-center bg-zinc-800">
                            {funcion.peliculas?.poster_url && (
                                <img src={funcion.peliculas.poster_url} alt={funcion.peliculas.titulo} className="h-full w-full object-cover" />
                            )}
                            </div>
                        </div>
                        <p className="font-medium text-zinc-100">{funcion.peliculas?.titulo ?? 'Pelicula sin titulo'}</p>
                        </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                        <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5 text-zinc-600" />{formatFunctionDate(funcion.fecha_hora)}</span>
                        <span className="flex items-center gap-1.5 text-xs"><Clock className="w-3.5 h-3.5 text-zinc-600" />{formatFunctionTime(funcion.fecha_hora)}</span>
                        </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{funcion.salas?.cines?.nombre ?? '-'}</td>
                    <td className="px-4 py-3 text-zinc-400">{funcion.salas?.nombre ?? '-'}</td>
                    <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(funcion.estado)}`}>
                        {funcion.estado}
                        </span>
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => openEdit(funcion)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors" title="Editar funcion">
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setCancelTarget(funcion)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-600/20 hover:text-red-300 transition-colors" title="Cancelar funcion">
                            <TicketX className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(funcion)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-900/50 hover:text-red-400 transition-colors" title="Eliminar funcion">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        )}
      </div>

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
      
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto scrollbar-hide">
            <div className="sticky top-0 z-10 bg-zinc-900 flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">{editingFunction ? 'Editar funcion' : 'Crear nueva funcion'}</h2>
              <button type="button" onClick={() => setFormOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <FunctionFormFields form={form} onChange={setForm} movies={movies} rooms={rooms} />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                  {editingFunction ? 'Guardar cambios' : 'Crear funcion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
            <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-zinc-800">
              <div className="h-10 w-10 rounded-xl bg-red-600/20 border border-red-500/20 flex items-center justify-center">
                <TicketX className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">Cancelar funcion</h2>
                <p className="text-sm text-zinc-400 mt-1">Esta accion puede afectar clientes con reservaciones activas.</p>
              </div>
              <button type="button" onClick={() => setCancelTarget(null)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <p className="text-sm font-medium text-zinc-100">{cancelTarget.peliculas?.titulo}</p>
                <p className="text-xs text-zinc-500 mt-1">{formatFunctionDateTime(cancelTarget.fecha_hora)}</p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setCancelTarget(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  Volver
                </button>
                <button type="button" onClick={confirmCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                  Confirmar cancelacion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {deletingFunction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Eliminar función?</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Esta acción no se puede deshacer. ¿Deseas eliminar esta función?
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setDeletingFunction(null)}
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
