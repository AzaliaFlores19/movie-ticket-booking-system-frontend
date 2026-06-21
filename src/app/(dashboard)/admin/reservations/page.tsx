'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Film, X, ChevronDown, Check, Clock, Building2, CalendarClock, Ticket, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { functionsService } from '@/services/functions.service';
import { Funcion } from '@/types';

const PER_PAGE = 8;

function formatDateLabel(dateStr: string) {
  const label = format(parseISO(dateStr), "EEEE, d 'de' MMMM, yyyy", { locale: es });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function Dropdown({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 bg-zinc-900 border rounded-xl text-sm transition-colors ${
          open ? 'border-red-500/50 text-zinc-100' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100'
        }`}
      >
        <span className={value ? 'text-zinc-100' : ''}>{value || placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 min-w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full flex items-center justify-between gap-4 px-3 py-2 text-sm transition-colors hover:bg-zinc-800 whitespace-nowrap ${
              !value ? 'text-zinc-100' : 'text-zinc-400'
            }`}
          >
            {placeholder}
            {!value && <Check className="w-3.5 h-3.5 text-red-400" />}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-4 px-3 py-2 text-sm transition-colors hover:bg-zinc-800 whitespace-nowrap ${
                value === opt ? 'text-zinc-100' : 'text-zinc-400'
              }`}
            >
              {opt}
              {value === opt && <Check className="w-3.5 h-3.5 text-red-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReservationsAdminPage() {
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch]     = useState('');
  const [cine, setCine]         = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [page, setPage]         = useState(1);

  useEffect(() => {
    let active = true;
    functionsService
      .getAll()
      .then((data) => { if (active) setFunciones(data); })
      .catch(() => { if (active) setFunciones([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const reset = () => {
    setSearch(''); setCine(''); setDateFrom(''); setDateTo(''); setPage(1);
  };

  const hasFilters = search || cine || dateFrom || dateTo;

  // Solo funciones que aún están disponibles: estado DISPONIBLE y que no hayan ocurrido todavía.
  const availableFunctions = useMemo(() => {
    const now = Date.now();
    return funciones
      .filter((f) => f.estado === 'DISPONIBLE' && new Date(f.fecha_hora).getTime() >= now)
      .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  }, [funciones]);

  const cineOptions = useMemo(
    () => Array.from(new Set(availableFunctions.map((f) => f.cine?.nombre).filter(Boolean) as string[])),
    [availableFunctions]
  );

  const filtered = useMemo(() => {
    return availableFunctions.filter((f) => {
      const day = f.fecha_hora.slice(0, 10); // YYYY-MM-DD
      if (search) {
        const haystack = [f.pelicula?.titulo, f.cine?.nombre, f.sala?.nombre]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      if (cine && f.cine?.nombre !== cine) return false;
      if (dateFrom && day < dateFrom) return false;
      if (dateTo && day > dateTo) return false;
      return true;
    });
  }, [availableFunctions, search, cine, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Reservas</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Funciones aún disponibles. Filtra por fecha para reservar con días de anticipación.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Ticket className="w-4 h-4 text-red-400" />
          <span className="text-sm text-zinc-300">
            <span className="font-semibold text-white">{filtered.length}</span> disponibles
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-800/60 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar película, cine o sala..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-60"
            />
          </div>

          {/* Cine */}
          <Dropdown
            value={cine}
            placeholder="Todos los cines"
            options={cineOptions}
            onChange={(v) => { setCine(v); setPage(1); }}
          />

          {/* Fecha desde */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500">Desde</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 focus:outline-none focus:border-red-500/50 [color-scheme:dark]"
            />
          </div>

          {/* Fecha hasta */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500">Hasta</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 focus:outline-none focus:border-red-500/50 [color-scheme:dark]"
            />
          </div>

          {/* Limpiar */}
          {hasFilters && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60">
                {['', 'Película', 'Fecha', 'Hora', 'Cine', 'Sala', 'Precio', 'Estado', ''].map((col, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-zinc-500">
                    Cargando funciones...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center">
                    <CalendarClock className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-400 font-medium">No hay funciones disponibles</p>
                    <p className="text-zinc-600 text-xs mt-1">Prueba con otra fecha o limpia los filtros.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((fn) => (
                  <tr key={fn.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0">
                        {fn.pelicula?.poster_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={fn.pelicula.poster_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Film className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {fn.pelicula?.titulo ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {formatDateLabel(fn.fecha_hora)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-zinc-200 font-medium">
                        <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        {format(parseISO(fn.fecha_hora), 'h:mm a')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        {fn.cine?.nombre ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{fn.sala?.nombre ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-100">
                      {fn.precio != null ? `$${fn.precio.toLocaleString('es-MX')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-600/20 text-green-400 border border-green-500/30">
                        Disponible
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {fn.pelicula?.id != null ? (
                        <Link
                          href={`/movies/${fn.pelicula.id}/book/${fn.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors active:scale-95"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          Reservar
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-zinc-800/60">
            {[
              { label: '«', target: 1 },
              { label: '‹', target: currentPage - 1 },
              { label: String(currentPage), target: currentPage, active: true },
              { label: '›', target: currentPage + 1 },
              { label: '»', target: totalPages },
            ].map(({ label, target, active }, i) => (
              <button
                key={i}
                onClick={() => setPage(Math.max(1, Math.min(totalPages, target)))}
                disabled={target < 1 || target > totalPages || target === currentPage}
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
        )}
      </div>
    </div>
  );
}
