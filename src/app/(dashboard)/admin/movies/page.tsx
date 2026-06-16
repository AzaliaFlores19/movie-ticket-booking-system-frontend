'use client';

import { useState } from 'react';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { MOCK_MOVIES } from '@/lib/mock-data';

const PER_PAGE = 10;

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function MoviesAdminPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = MOCK_MOVIES.filter((m) =>
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
        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Agregar Película
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-800/60">
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                paginated.map((movie) => (
                  <tr key={movie.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                          {movie.poster_url ? (
                            <Image
                              src={movie.poster_url}
                              alt={movie.titulo}
                              width={40}
                              height={56}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-700" />
                          )}
                        </div>
                        <span className="font-medium text-zinc-100">{movie.titulo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{movie.genero?.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {movie.duracion ? formatDuration(movie.duracion) : '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{movie.idioma?.nombre ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-600/20 text-green-400 border border-green-500/30">
                        {movie.estado ?? 'Activa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
                active
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
