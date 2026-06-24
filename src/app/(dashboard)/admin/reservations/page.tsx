'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, Film, X, ChevronDown, Check, Clock, Building2, CalendarClock,
  Ticket, ChevronRight, User, Armchair, Ban, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { functionsService } from '@/services/functions.service';
import { reservationsService } from '@/services/reservations.service';
import { Funcion, Reservation } from '@/types';

const PER_PAGE = 8;

type TabKey = 'manage' | 'create';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'manage', label: 'Reservas' },
  { key: 'create', label: 'Nueva reserva' },
];

// Estilos de badge por estado de la reserva.
const STATUS_STYLES: Record<string, string> = {
  CONFIRMADA: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  PAGADA: 'bg-green-600/20 text-green-400 border-green-500/30',
  USADA: 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30',
  CANCELADA: 'bg-red-600/20 text-red-400 border-red-500/30',
};

// Estados que ya no admiten cancelación.
const FINAL_STATES = ['CANCELADA', 'USADA'];

function statusStyle(estado: string) {
  return STATUS_STYLES[estado] ?? 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30';
}

function seatLabels(r: Reservation) {
  return (r.asientos ?? [])
    .map((a) => `${a.asiento.fila}${a.asiento.columna}`)
    .sort()
    .join(', ');
}

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
  const [tab, setTab] = useState<TabKey>('manage');

  // --- Datos ---
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [loadingFunctions, setLoadingFunctions] = useState(true);

  // --- Filtros: pestaña Reservas ---
  const [rSearch, setRSearch]   = useState('');
  const [rEstado, setREstado]   = useState('');
  const [rPage, setRPage]       = useState(1);

  // --- Filtros: pestaña Nueva reserva ---
  const [search, setSearch]     = useState('');
  const [cine, setCine]         = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [page, setPage]         = useState(1);

  // --- Cancelación ---
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    reservationsService
      .getAll()
      .then((data) => { if (active) setReservations(data); })
      .catch(() => { if (active) setReservations([]); })
      .finally(() => { if (active) setLoadingReservations(false); });
    functionsService
      .getAll()
      .then((data) => { if (active) setFunciones(data); })
      .catch(() => { if (active) setFunciones([]); })
      .finally(() => { if (active) setLoadingFunctions(false); });
    return () => { active = false; };
  }, []);

  // ───────────────────────── Pestaña: Reservas ─────────────────────────

  const estadoOptions = useMemo(
    () => Array.from(new Set(reservations.map((r) => r.estado).filter(Boolean))),
    [reservations]
  );

  const filteredReservations = useMemo(() => {
    const sorted = [...reservations].sort(
      (a, b) =>
        new Date(b.funcion?.fecha_hora ?? 0).getTime() -
        new Date(a.funcion?.fecha_hora ?? 0).getTime()
    );
    return sorted.filter((r) => {
      if (rEstado && r.estado !== rEstado) return false;
      if (rSearch) {
        const haystack = [r.codigo, r.usuario?.name, r.usuario?.email, r.funcion?.pelicula?.titulo]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(rSearch.toLowerCase())) return false;
      }
      return true;
    });
  }, [reservations, rSearch, rEstado]);

  const rTotalPages = Math.max(1, Math.ceil(filteredReservations.length / PER_PAGE));
  const rCurrentPage = Math.min(rPage, rTotalPages);
  const rPaginated = filteredReservations.slice((rCurrentPage - 1) * PER_PAGE, rCurrentPage * PER_PAGE);
  const rHasFilters = rSearch || rEstado;

  const cancelTarget = reservations.find((r) => r.id === cancelId) ?? null;

  const handleCancel = async () => {
    if (cancelId == null) return;
    setCancelling(true);
    try {
      await reservationsService.cancel(cancelId);
      setReservations((prev) =>
        prev.map((r) => (r.id === cancelId ? { ...r, estado: 'CANCELADA' } : r))
      );
      toast.success('Reserva cancelada correctamente');
      setCancelId(null);
    } catch {
      toast.error('No se pudo cancelar la reserva');
    } finally {
      setCancelling(false);
    }
  };

  // ─────────────────────── Pestaña: Nueva reserva ───────────────────────

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

  const filteredFunctions = useMemo(() => {
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

  const fTotalPages = Math.max(1, Math.ceil(filteredFunctions.length / PER_PAGE));
  const fCurrentPage = Math.min(page, fTotalPages);
  const fPaginated = filteredFunctions.slice((fCurrentPage - 1) * PER_PAGE, fCurrentPage * PER_PAGE);
  const fHasFilters = search || cine || dateFrom || dateTo;
  const resetFunctionFilters = () => {
    setSearch(''); setCine(''); setDateFrom(''); setDateTo(''); setPage(1);
  };

  // ───────────────────────────── Paginación ─────────────────────────────

  function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
    return (
      <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-zinc-800/60">
        {[
          { label: '«', target: 1 },
          { label: '‹', target: current - 1 },
          { label: String(current), target: current, active: true },
          { label: '›', target: current + 1 },
          { label: '»', target: total },
        ].map(({ label, target, active }, i) => (
          <button
            key={i}
            onClick={() => onChange(Math.max(1, Math.min(total, target)))}
            disabled={target < 1 || target > total || target === current}
            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              active ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Reservas</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {tab === 'manage'
              ? 'Consulta, filtra y cancela las reservas registradas.'
              : 'Funciones aún disponibles. Filtra por fecha para reservar con anticipación.'}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Ticket className="w-4 h-4 text-red-400" />
          <span className="text-sm text-zinc-300">
            <span className="font-semibold text-white">
              {tab === 'manage' ? filteredReservations.length : filteredFunctions.length}
            </span>{' '}
            {tab === 'manage' ? 'reservas' : 'disponibles'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-red-600 text-white'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ───────────────────────── Pestaña: Reservas ───────────────────────── */}
      {tab === 'manage' && (
        <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-zinc-800/60 flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar código, cliente o película..."
                value={rSearch}
                onChange={(e) => { setRSearch(e.target.value); setRPage(1); }}
                className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-64"
              />
            </div>

            <Dropdown
              value={rEstado}
              placeholder="Todos los estados"
              options={estadoOptions}
              onChange={(v) => { setREstado(v); setRPage(1); }}
            />

            {rHasFilters && (
              <button
                onClick={() => { setRSearch(''); setREstado(''); setRPage(1); }}
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
                  {['Código', 'Cliente', 'Película', 'Función', 'Asientos', 'Total', 'Estado', 'Acciones'].map((col, i) => (
                    <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {loadingReservations ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                      Cargando reservas...
                    </td>
                  </tr>
                ) : rPaginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center">
                      <Ticket className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-400 font-medium">No hay reservas</p>
                      <p className="text-zinc-600 text-xs mt-1">Prueba con otro estado o limpia los filtros.</p>
                    </td>
                  </tr>
                ) : (
                  rPaginated.map((r) => {
                    const canCancel = !FINAL_STATES.includes(r.estado);
                    return (
                      <tr key={r.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                          {r.codigo ?? `#${r.id}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-zinc-100">
                            <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            {r.usuario?.name ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-100">
                          {r.funcion?.pelicula?.titulo ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {r.funcion?.fecha_hora ? (
                            <span className="inline-flex flex-col">
                              <span className="text-zinc-300">{formatDateLabel(r.funcion.fecha_hora)}</span>
                              <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                                <Clock className="w-3 h-3 text-red-500 shrink-0" />
                                {format(parseISO(r.funcion.fecha_hora), 'h:mm a')}
                                {r.funcion.cine?.nombre && (
                                  <>
                                    <Building2 className="w-3 h-3 ml-1.5 shrink-0" />
                                    {r.funcion.cine.nombre}
                                  </>
                                )}
                              </span>
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-zinc-300">
                          <span className="inline-flex items-center gap-1.5">
                            <Armchair className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            {seatLabels(r) || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-zinc-100">
                          ${(r.total ?? 0).toLocaleString('es-MX')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle(r.estado)}`}>
                            {r.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {canCancel ? (
                            <button
                              onClick={() => setCancelId(r.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-600/10 transition-colors active:scale-95"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Cancelar
                            </button>
                          ) : (
                            <span className="text-xs text-zinc-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loadingReservations && filteredReservations.length > 0 && (
            <Pagination current={rCurrentPage} total={rTotalPages} onChange={setRPage} />
          )}
        </div>
      )}

      {/* ─────────────────────── Pestaña: Nueva reserva ─────────────────────── */}
      {tab === 'create' && (
        <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-zinc-800/60 flex flex-wrap items-center gap-3">
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

            <Dropdown
              value={cine}
              placeholder="Todos los cines"
              options={cineOptions}
              onChange={(v) => { setCine(v); setPage(1); }}
            />

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500">Desde</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 focus:outline-none focus:border-red-500/50 [color-scheme:dark]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500">Hasta</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 focus:outline-none focus:border-red-500/50 [color-scheme:dark]"
              />
            </div>

            {fHasFilters && (
              <button
                onClick={resetFunctionFilters}
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
                {loadingFunctions ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-zinc-500">
                      Cargando funciones...
                    </td>
                  </tr>
                ) : fPaginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center">
                      <CalendarClock className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-400 font-medium">No hay funciones disponibles</p>
                      <p className="text-zinc-600 text-xs mt-1">Prueba con otra fecha o limpia los filtros.</p>
                    </td>
                  </tr>
                ) : (
                  fPaginated.map((fn) => (
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

          {!loadingFunctions && filteredFunctions.length > 0 && (
            <Pagination current={fCurrentPage} total={fTotalPages} onChange={setPage} />
          )}
        </div>
      )}

      {/* Modal — Confirmar cancelación */}
      {cancelTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Cancelar reserva?</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Se cancelará la reserva{' '}
                  <span className="font-semibold text-zinc-200">{cancelTarget.codigo ?? `#${cancelTarget.id}`}</span>
                  {cancelTarget.usuario?.name && (
                    <> de <span className="font-semibold text-zinc-200">{cancelTarget.usuario.name}</span></>
                  )}
                  {' '}para{' '}
                  <span className="font-semibold text-zinc-200">{cancelTarget.funcion?.pelicula?.titulo ?? 'la función'}</span>.
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setCancelId(null)}
                  disabled={cancelling}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  VOLVER
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'CANCELANDO...' : 'SÍ, CANCELAR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
