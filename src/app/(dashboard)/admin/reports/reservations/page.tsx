'use client';

import { useState } from 'react';
import {
  Search, Ticket, Eye, CheckCircle2, Trash, Download,
  Film, Clock, User as UserIcon, Armchair, CalendarClock,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { MOCK_RESERVATIONS, MOCK_FUNCIONES } from '@/lib/mock-data';
import type { Reservation } from '@/types';

const PER_PAGE = 10;

const ESTADOS = ['PENDIENTE', 'CONFIRMADA', 'PAGADA', 'CANCELADA'] as const;
type Estado = (typeof ESTADOS)[number];

const ESTADO_STYLES: Record<string, string> = {
  PENDIENTE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CONFIRMADA: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PAGADA: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELADA: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function estadoBadge(estado: string) {
  const cls = ESTADO_STYLES[estado] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>
      {estado}
    </span>
  );
}

function formatDateTime(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function funcionLabel(funcionId: number) {
  const f = MOCK_FUNCIONES.find((x) => x.id === funcionId);
  if (!f) return `Funcion #${funcionId}`;
  return `${f.pelicula?.titulo ?? 'Pelicula'} · ${formatDateTime(f.fecha_hora)}`;
}

const CSV_DELIM = ';';

// Escapa un valor para CSV (comillas, separador y saltos de línea)
function csvCell(value: unknown) {
  const str = value == null ? '' : String(value);
  return /["\n;,]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export default function ReportsReservationsAdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([...MOCK_RESERVATIONS]);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'' | Estado>('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Reservation | null>(null);

  function updateEstado(id: number, estado: Estado) {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, estado } : r)));
    setViewing((v) => (v && v.id === id ? { ...v, estado } : v));
    toast.success(`Reserva marcada como ${estado}`);
  }

  const filtered = reservations.filter((r) => {
    const matchesSearch =
      (r.codigo ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.usuario?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.funcion?.pelicula?.titulo ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesEstado = !estadoFilter || r.estado === estadoFilter;

    // Filtro por rango de fechas (sobre la fecha de creación)
    const fecha = r.createdAt ? r.createdAt.slice(0, 10) : '';
    const matchesInicio = !fechaInicio || (fecha && fecha >= fechaInicio);
    const matchesFin = !fechaFin || (fecha && fecha <= fechaFin);

    return matchesSearch && matchesEstado && matchesInicio && matchesFin;
  });

  function exportCsv() {
    if (filtered.length === 0) {
      toast.info('No hay reservas para exportar');
      return;
    }

    const headers = ['Codigo', 'Cliente', 'Pelicula', 'Funcion', 'Total', 'Estado', 'Fecha'];
    const rows = filtered.map((r) => [
      r.codigo ?? `#${r.id}`,
      r.usuario?.name ?? '',
      r.funcion?.pelicula?.titulo ?? (r.funcion_id ? funcionLabel(r.funcion_id) : ''),
      formatDateTime(r.funcion?.fecha_hora),
      r.total ?? 0,
      r.estado,
      formatDateTime(r.createdAt),
    ]);

    const totalImporte = filtered.reduce((sum, r) => sum + (r.total ?? 0), 0);

    // Cabecera del documento con metadatos y filtros aplicados
    const meta: string[][] = [
      ['Reporte de Reservas'],
      ['Generado', new Date().toLocaleString('es-MX')],
      ['Estado', estadoFilter || 'Todos'],
      ['Rango de fechas', `${fechaInicio || 'Inicio'} a ${fechaFin || 'Hoy'}`],
      ['Total de reservas', String(filtered.length)],
      [],
    ];

    const footer: string[][] = [
      [],
      ['', '', '', 'TOTAL', String(totalImporte), '', ''],
    ];

    // BOM (acentos en Excel) + 'sep=;' para forzar a Excel a separar por columnas
    const csv = '﻿sep=' + CSV_DELIM + '\r\n' + [...meta, headers, ...rows, ...footer]
      .map((row) => row.map(csvCell).join(CSV_DELIM))
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-reservas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${filtered.length} reserva${filtered.length !== 1 ? 's' : ''} exportada${filtered.length !== 1 ? 's' : ''}`);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reporte de Reservas</h1>
          <p className="text-sm text-zinc-400 mt-1">Consultar y filtrar reservas registradas</p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-800/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar código, cliente o película..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-72"
              />
            </div>
            <select
              value={estadoFilter}
              onChange={(e) => { setEstadoFilter(e.target.value as '' | Estado); setPage(1); }}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-red-500/50"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fechaInicio}
                max={fechaFin || undefined}
                onChange={(e) => { setFechaInicio(e.target.value); setPage(1); }}
                title="Fecha desde"
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-red-500/50 [color-scheme:dark]"
              />
              <span className="text-zinc-600 text-sm">—</span>
              <input
                type="date"
                value={fechaFin}
                min={fechaInicio || undefined}
                onChange={(e) => { setFechaFin(e.target.value); setPage(1); }}
                title="Fecha hasta"
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-red-500/50 [color-scheme:dark]"
              />
            </div>
            {(fechaInicio || fechaFin) && (
              <button
                onClick={() => { setFechaInicio(''); setFechaFin(''); setPage(1); }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors"
              >
                <Trash className="w-3.5 h-3.5" />
                Limpiar fechas
              </button>
            )}
          </div>
          <span className="text-xs text-zinc-500">{filtered.length} reserva{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['Código', 'Cliente', 'Función', 'Total', 'Estado', 'Fecha', ''].map((col, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Ticket className="w-10 h-10 text-zinc-700" />
                    <p className="text-sm text-zinc-500">No se encontraron reservas</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-900/50 transition-colors">
                  {/* Código */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center shrink-0">
                        <Ticket className="w-4 h-4 text-red-400" />
                      </div>
                      <span className="font-medium text-zinc-100">{r.codigo ?? `#${r.id}`}</span>
                    </div>
                  </td>
                  {/* Cliente */}
                  <td className="px-4 py-3 text-zinc-300">{r.usuario?.name ?? '—'}</td>
                  {/* Función */}
                  <td className="px-4 py-3 text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span className="truncate max-w-[220px]">
                        {r.funcion?.pelicula?.titulo ?? (r.funcion_id ? funcionLabel(r.funcion_id) : '—')}
                      </span>
                    </div>
                  </td>
                  {/* Total */}
                  <td className="px-4 py-3 text-zinc-300 font-medium">L{(r.total ?? 0).toLocaleString('es-MX')}</td>
                  {/* Estado */}
                  <td className="px-4 py-3">{estadoBadge(r.estado)}</td>
                  {/* Fecha */}
                  <td className="px-4 py-3 text-zinc-500 text-xs">{formatDateTime(r.createdAt)}</td>
                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewing(r)}
                        title="Ver detalle"
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {r.estado !== 'CONFIRMADA' && r.estado !== 'PAGADA' && r.estado !== 'CANCELADA' && (
                        <button
                          onClick={() => updateEstado(r.id, 'CONFIRMADA')}
                          title="Confirmar"
                          className="p-1.5 rounded-lg text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {r.estado !== 'CANCELADA' && (
                        <button
                          onClick={() => updateEstado(r.id, 'CANCELADA')}
                          title="Cancelar"
                          className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
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

      {/* Modal — Detalle de Reserva */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white leading-tight">{viewing.codigo ?? `Reserva #${viewing.id}`}</h2>
                  <div className="mt-0.5">{estadoBadge(viewing.estado)}</div>
                </div>
              </div>
              <button onClick={() => setViewing(null)} className="text-zinc-400 hover:text-white transition-colors">
                <Trash className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3 text-sm">
              <DetailRow icon={UserIcon} label="Cliente" value={viewing.usuario?.name ?? '—'} />
              <DetailRow icon={Film} label="Película" value={viewing.funcion?.pelicula?.titulo ?? '—'} />
              <DetailRow icon={Clock} label="Función" value={formatDateTime(viewing.funcion?.fecha_hora)} />
              <DetailRow icon={Armchair} label="Asientos" value={viewing.asientos?.length ? String(viewing.asientos.length) : '—'} />
              <DetailRow icon={CalendarClock} label="Creada" value={formatDateTime(viewing.createdAt)} />
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <span className="text-zinc-400">Total</span>
                <span className="text-lg font-bold text-white">L{(viewing.total ?? 0).toLocaleString('es-MX')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-5">
              {viewing.estado !== 'CANCELADA' && (
                <button
                  onClick={() => updateEstado(viewing.id, 'CANCELADA')}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  Cancelar reserva
                </button>
              )}
              {viewing.estado !== 'CONFIRMADA' && viewing.estado !== 'PAGADA' && viewing.estado !== 'CANCELADA' && (
                <button
                  onClick={() => updateEstado(viewing.id, 'CONFIRMADA')}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-zinc-400">
        <Icon className="w-3.5 h-3.5 text-zinc-600" />
        {label}
      </span>
      <span className="text-zinc-200 font-medium text-right">{value}</span>
    </div>
  );
}
