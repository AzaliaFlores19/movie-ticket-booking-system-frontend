'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Plus, X, Pencil, Upload, Film } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { MOCK_MOVIES, MOCK_GENRES, MOCK_LANGUAGES } from '@/lib/mock-data';
import type { Movie } from '@/types';

const PER_PAGE = 10;

const EMPTY_FORM = {
  titulo: '',
  idioma_id: '',
  genero_id: '',
  fecha_estreno: '',
  sinopsis: '',
  posterPreview: '',
};

type FormState = typeof EMPTY_FORM;

function toFormValues(movie: Movie): FormState {
  return {
    titulo: movie.titulo ?? '',
    idioma_id: String(movie.idioma_id ?? ''),
    genero_id: String(movie.genero_id ?? ''),
    fecha_estreno: movie.fecha_estreno ?? '',
    sinopsis: movie.sinopsis ?? '',
    posterPreview: movie.poster_url ?? '',
  };
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function MovieFormFields({ form, onChange }: { form: FormState; onChange: (f: FormState) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ ...form, posterPreview: ev.target?.result as string });
    reader.readAsDataURL(file);
  }

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Poster</label>
        <div className="flex items-start gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-24 h-32 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors"
          >
            {form.posterPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.posterPreview} alt="Poster" className="w-full h-full object-cover" />
            ) : (
              <Upload className="w-6 h-6 text-zinc-500" />
            )}
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            >
              Seleccionar imagen
            </button>
            <p className="text-xs text-zinc-500">PNG, JPG hasta 5MB</p>
            {form.posterPreview && (
              <button
                type="button"
                onClick={() => { onChange({ ...form, posterPreview: '' }); if (fileRef.current) fileRef.current.value = ''; }}
                className="text-xs text-red-400 hover:text-red-300 text-left transition-colors"
              >
                Quitar imagen
              </button>
            )}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleImageChange} />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Título de la película"
          value={form.titulo}
          onChange={(e) => onChange({ ...form, titulo: e.target.value })}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Género <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={form.genero_id}
            onChange={(e) => onChange({ ...form, genero_id: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-red-500/60"
          >
            <option value="">Seleccionar género</option>
            {MOCK_GENRES.map((g) => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Idioma <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={form.idioma_id}
            onChange={(e) => onChange({ ...form, idioma_id: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-red-500/60"
          >
            <option value="">Seleccionar idioma</option>
            {MOCK_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Fecha de Estreno <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          required
          value={form.fecha_estreno}
          onChange={(e) => onChange({ ...form, fecha_estreno: e.target.value })}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-red-500/60 [color-scheme:dark]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Sinopsis</label>
        <textarea
          rows={4}
          placeholder="Descripción breve de la película"
          value={form.sinopsis}
          onChange={(e) => onChange({ ...form, sinopsis: e.target.value })}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60 resize-none"
        />
      </div>
    </>
  );
}

export default function MoviesAdminPage() {
  const [movies, setMovies] = useState<Movie[]>([...MOCK_MOVIES]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);

  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);

  const [activeIds, setActiveIds] = useState<Set<number>>(
    () => new Set(MOCK_MOVIES.filter((m) => (m.estado ?? 'Activa') === 'Activa').map((m) => m.id))
  );

  function toggleActive(id: number) {
    const wasActive = activeIds.has(id);
    setActiveIds((prev) => {
      const next = new Set(prev);
      wasActive ? next.delete(id) : next.add(id);
      return next;
    });
    toast.info(wasActive ? 'Película desactivada' : 'Película activada');
  }

  function openEdit(movie: Movie) {
    setEditingMovie(movie);
    setEditForm(toFormValues(movie));
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const genre = MOCK_GENRES.find((g) => g.id === Number(createForm.genero_id));
    const language = MOCK_LANGUAGES.find((l) => l.id === Number(createForm.idioma_id));
    const newMovie: Movie = {
      id: Date.now(),
      titulo: createForm.titulo,
      sinopsis: createForm.sinopsis,
      poster_url: createForm.posterPreview || '',
      duracion: 0,
      fecha_estreno: createForm.fecha_estreno,
      genero_id: Number(createForm.genero_id),
      genero: genre,
      idioma_id: Number(createForm.idioma_id),
      idioma: language,
      estado: 'Activa',
    };
    setMovies((prev) => [newMovie, ...prev]);
    setActiveIds((prev) => new Set([...prev, newMovie.id]));
    setShowCreate(false);
    setCreateForm(EMPTY_FORM);
    toast.success('Película creada correctamente');
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMovie) return;
    const genre = MOCK_GENRES.find((g) => g.id === Number(editForm.genero_id));
    const language = MOCK_LANGUAGES.find((l) => l.id === Number(editForm.idioma_id));
    setMovies((prev) =>
      prev.map((m) =>
        m.id === editingMovie.id
          ? { ...m, titulo: editForm.titulo, sinopsis: editForm.sinopsis, poster_url: editForm.posterPreview || m.poster_url, fecha_estreno: editForm.fecha_estreno, genero_id: Number(editForm.genero_id), genero: genre, idioma_id: Number(editForm.idioma_id), idioma: language }
          : m
      )
    );
    setEditingMovie(null);
    toast.success('Película actualizada correctamente');
  }

  const filtered = movies.filter((m) =>
    m.titulo.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Películas</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestionar catálogo de películas</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Película
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar películas..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-64"
            />
          </div>
          <span className="text-xs text-zinc-500">{filtered.length} película{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['Título', 'Género', 'Duración', 'Idioma', 'Estado', ''].map((col) => (
                <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Film className="w-10 h-10 text-zinc-700" />
                    <p className="text-sm text-zinc-500">No se encontraron películas</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((movie) => (
                <tr key={movie.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                        {movie.poster_url ? (
                          <Image src={movie.poster_url} alt={movie.titulo} width={40} height={56} className="w-full h-full object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-4 h-4 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100">{movie.titulo}</p>
                        {movie.fecha_estreno && <p className="text-xs text-zinc-500 mt-0.5">{movie.fecha_estreno}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{movie.genero?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400">{movie.duracion ? formatDuration(movie.duracion) : '—'}</td>
                  <td className="px-4 py-3 text-zinc-400">{movie.idioma?.nombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(movie.id)}
                      className="flex items-center gap-2"
                    >
                      <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${activeIds.has(movie.id) ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <span className={`pointer-events-none inline-block h-4 w-4 m-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${activeIds.has(movie.id) ? 'translate-x-4' : 'translate-x-0'}`} />
                      </span>
                      <span className={`text-xs font-medium ${activeIds.has(movie.id) ? 'text-green-400' : 'text-zinc-500'}`}>
                        {activeIds.has(movie.id) ? 'Activa' : 'Inactiva'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(movie)}
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

      {/* Modal — Agregar */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-lg font-semibold text-white">Agregar Película</h2>
              <button onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="px-6 py-5 space-y-4">
              <MovieFormFields form={createForm} onChange={setCreateForm} />
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

      {/* Modal — Editar */}
      {editingMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-lg font-semibold text-white">Editar Película</h2>
              <button onClick={() => setEditingMovie(null)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
              <MovieFormFields form={editForm} onChange={setEditForm} />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingMovie(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
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
