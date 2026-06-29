'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Plus, X, Pencil, Upload, Film, Trash2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { moviesService } from '@/services/movies.service';
import { genresService } from '@/services/genres.service';
import { languagesService } from '@/services/languages.service';
import type { Movie, Genre, Language } from '@/types';

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

// buscar response has no activo field (only active movies returned), so default to true
function isActive(m: Movie) {
  return m.activo !== false;
}

// buscar response has genero: { id, nombre }, create/update has id_genero — handle both
function toFormValues(movie: Movie): FormState {
  return {
    titulo: movie.titulo ?? '',
    idioma_id: String(movie.idioma?.id ?? movie.id_idioma ?? ''),
    genero_id: String(movie.genero?.id ?? movie.id_genero ?? ''),
    fecha_estreno: movie.fecha_estreno
      ? new Date(movie.fecha_estreno).toISOString().slice(0, 10)
      : '',
    sinopsis: movie.sinopsis ?? '',
    posterPreview: movie.poster_url ?? '',
  };
}


function MovieFormFields({
  form,
  genres,
  languages,
  onChange,
  onFileSelect,
}: {
  form: FormState;
  genres: Genre[];
  languages: Language[];
  onChange: (f: FormState) => void;
  onFileSelect: (file: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
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
                onClick={() => { onChange({ ...form, posterPreview: '' }); onFileSelect(null); if (fileRef.current) fileRef.current.value = ''; }}
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
            {genres.map((g) => (
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
            {languages.map((l) => (
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
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [createPosterFile, setCreatePosterFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editPosterFile, setEditPosterFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingMovie, setDeletingMovie] = useState<Movie | null>(null);

  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      moviesService.getAll(),
      genresService.getAll(),
      languagesService.getAll(),
    ])
      .then(([m, g, l]) => {
        if (!active) return;
        setMovies(m);
        setGenres(g);
        setLanguages(l);
      })
      .catch(() => { if (active) toast.error('Error al cargar datos'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function toggleActive(movie: Movie) {
    if (togglingId != null) return;
    setTogglingId(movie.id);
    try {
      const result = await moviesService.toggleStatus(movie.id);
      setMovies((prev) =>
        prev.map((m) => m.id === movie.id ? { ...m, activo: result.activo } : m)
      );
      toast.info(result.activo ? 'Película activada' : 'Película desactivada');
    } catch {
      toast.error('No se pudo cambiar el estado');
    } finally {
      setTogglingId(null);
    }
  }

  function handleDelete(movie: Movie) {
    setDeletingMovie(movie);
  }

  async function confirmDelete() {
    if (!deletingMovie) return;
    try {
      await moviesService.delete(deletingMovie.id);
      setMovies((prev) => prev.filter((m) => m.id !== deletingMovie.id));
      toast.success('Película eliminada correctamente');
      setDeletingMovie(null);
    } catch {
      toast.error('No se pudo eliminar la película');
    }
  }

  function openEdit(movie: Movie) {
    setEditingMovie(movie);
    setEditForm(toFormValues(movie));
    setEditPosterFile(null);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const generoId = createForm.genero_id ? Number(createForm.genero_id) : undefined;
      const idiomaId = createForm.idioma_id ? Number(createForm.idioma_id) : undefined;
      const created = await moviesService.create({
        titulo: createForm.titulo,
        sinopsis: createForm.sinopsis || undefined,
        fecha_estreno: createForm.fecha_estreno || undefined,
        id_genero: generoId,
        id_idioma: idiomaId,
      });

      let posterUrl = created.poster_url;
      if (createPosterFile) {
        try {
          posterUrl = await moviesService.uploadPoster(created.id, createPosterFile);
        } catch {
          toast.warning('Película creada pero no se pudo subir el poster');
        }
      }

      const enriched: Movie = {
        ...created,
        poster_url: posterUrl,
        genero: genres.find((g) => g.id === (generoId ?? created.id_genero)),
        idioma: languages.find((l) => l.id === (idiomaId ?? created.id_idioma)),
      };
      setMovies((prev) => [enriched, ...prev]);
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      setCreatePosterFile(null);
      toast.success('Película creada correctamente');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al crear la película');
    } finally {
      setCreating(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMovie) return;
    setSaving(true);
    try {
      const generoId = editForm.genero_id ? Number(editForm.genero_id) : undefined;
      const idiomaId = editForm.idioma_id ? Number(editForm.idioma_id) : undefined;
      const updated = await moviesService.update(editingMovie.id, {
        titulo: editForm.titulo,
        sinopsis: editForm.sinopsis || undefined,
        fecha_estreno: editForm.fecha_estreno || undefined,
        id_genero: generoId,
        id_idioma: idiomaId,
      });

      let posterUrl = updated.poster_url ?? editingMovie.poster_url;
      if (editPosterFile) {
        try {
          posterUrl = await moviesService.uploadPoster(editingMovie.id, editPosterFile);
        } catch {
          toast.warning('Datos actualizados pero no se pudo subir el poster');
        }
      }

      const enriched: Movie = {
        ...editingMovie,
        ...updated,
        poster_url: posterUrl,
        genero: genres.find((g) => g.id === (generoId ?? updated.id_genero ?? editingMovie.genero?.id)),
        idioma: languages.find((l) => l.id === (idiomaId ?? updated.id_idioma ?? editingMovie.idioma?.id)),
      };
      setMovies((prev) => prev.map((m) => m.id === editingMovie.id ? enriched : m));
      setEditingMovie(null);
      setEditPosterFile(null);
      toast.success('Película actualizada correctamente');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al actualizar la película');
    } finally {
      setSaving(false);
    }
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
              {['Título', 'Género', 'Estreno', 'Idioma', 'Estado', ''].map((col) => (
                <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                  Cargando películas...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Film className="w-10 h-10 text-zinc-700" />
                    <p className="text-sm text-zinc-500">No se encontraron películas</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((movie) => {
                const active = isActive(movie);
                const toggling = togglingId === movie.id;
                return (
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
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{movie.genero?.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{movie.fecha_estreno ? new Date(movie.fecha_estreno).toLocaleDateString('es-MX') : '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{movie.idioma?.nombre ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(movie)}
                        disabled={toggling}
                        className="flex items-center gap-2 disabled:opacity-50"
                      >
                        <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${active ? 'bg-green-500' : 'bg-zinc-600'}`}>
                          <span className={`pointer-events-none inline-block h-4 w-4 m-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${active ? 'translate-x-4' : 'translate-x-0'}`} />
                        </span>
                        <span className={`text-xs font-medium ${active ? 'text-green-400' : 'text-zinc-500'}`}>
                          {active ? 'Activa' : 'Inactiva'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(movie)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-900/50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
              <MovieFormFields form={createForm} genres={genres} languages={languages} onChange={setCreateForm} onFileSelect={setCreatePosterFile} />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creando...' : 'Crear'}
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
              <MovieFormFields form={editForm} genres={genres} languages={languages} onChange={setEditForm} onFileSelect={setEditPosterFile} />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMovie(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal — Confirmar Eliminación */}
      {deletingMovie && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Eliminar película?</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Esta acción no se puede deshacer. ¿Deseas eliminar "{deletingMovie.titulo}"?
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setDeletingMovie(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  CANCELAR
                </button>
                <button
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
