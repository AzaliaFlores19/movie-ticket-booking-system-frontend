'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search, Ticket, Eye, Trash, Download, Film, Clock,
  User as UserIcon, Armchair, CalendarClock, Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { reportsService } from '@/services/reports.service';

const PER_PAGE = 10;
const ESTADOS = ['PENDIENTE_DE_PAGO', 'CONFIRMADA', 'PAGADA', 'CANCELADA'] as const;
type Estado = (typeof ESTADOS)[number];

type ReservationReportRow = {
  id: number;
  codigo: string;
  estado: string;
  cliente: string;
  pelicula: string;
  funcion: string;
  asientos: number;
  total: number;
  metodoPago: string;
  estadoPago: string;
  createdAt: string;
};

type ReportMeta = {
  total_items?: number;
  items_per_page?: number;
  current_page?: number;
  total_pages?: number;
};

const ESTADO_STYLES: Record<string, string> = {
  PENDIENTE_DE_PAGO: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
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
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-HN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeReservation(raw: ReservationApiRow): ReservationReportRow {
  const pago = raw.pagos?.[0];
  const funcion = raw.funciones;
  const id = toNumber(raw.id);
  return {
    id,
    codigo: raw.numero_reserva ?? `#${id}`,
    estado: raw.estado ?? '-',
    cliente: raw.usuarios?.nombre ?? raw.usuario?.nombre ?? (raw.id_usuario ? `Usuario #${raw.id_usuario}` : '-'),
    pelicula: funcion?.peliculas?.titulo ?? '-',
    funcion: funcion?.fecha_hora ?? raw.created_at,
    asientos: raw.reservaAsientos?.length ?? raw.asientos?.length ?? 0,
    total: toNumber(pago?.monto_final),
    metodoPago: pago?.metodo ?? '-',
    estadoPago: pago?.estado ?? '-',
    createdAt: raw.created_at ?? raw.createdAt ?? '',
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ReportsReservationsAdminPage() {
  const [reservations, setReservations] = useState<ReservationReportRow[]>([]);
  const [meta, setMeta] = useState<ReportMeta>({});
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'' | Estado>('');
  const [fecha, setFecha] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [viewing, setViewing] = useState<ReservationReportRow | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setLoading(true);
    });

    reportsService.getReservations({
      estado: estadoFilter || undefined,
      fecha: fecha || undefined,
      page,
      limit: PER_PAGE,
    })
      .then((response) => {
        if (!active) return;
        const data = (response.data ?? []) as ReservationApiRow[];
        setReservations(data.map(normalizeReservation));
        setMeta(response.meta ?? {});
      })
      .catch((error) => {
        const message = error?.response?.data?.message ?? 'No se pudo cargar el reporte de reservas.';
        toast.error(Array.isArray(message) ? message.join(', ') : message);
        if (active) {
          setReservations([]);
          setMeta({});
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [estadoFilter, fecha, page]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reservations;
    return reservations.filter((reservation) => [
      reservation.codigo,
      reservation.cliente,
      reservation.pelicula,
      reservation.estado,
      reservation.metodoPago,
    ].some((value) => value.toLowerCase().includes(term)));
  }, [reservations, search]);

  async function exportCsv() {
    setExporting(true);
    try {
      const blob = await reportsService.exportReservationsCsv({
        estado: estadoFilter || undefined,
        fecha: fecha || undefined,
      });
      downloadBlob(blob, `reporte-reservas-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Reporte de reservas descargado.');
    } catch (error: unknown) {
      const apiError = error && typeof error === 'object' ? error as { response?: { data?: { message?: string | string[] } } } : {};
      const message = apiError.response?.data?.message ?? 'No se pudo exportar el reporte.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setExporting(false);
    }
  }

  const totalPages = Math.max(1, meta.total_pages ?? 1);
  const totalItems = meta.total_items ?? filtered.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reporte de Reservas</h1>
          <p className="text-sm text-zinc-400 mt-1">Consultar, filtrar y exportar reservas registradas</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={exporting}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Exportar CSV
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar codigo, cliente o pelicula..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-72"
              />
            </div>
            <select
              value={estadoFilter}
              onChange={(event) => { setEstadoFilter(event.target.value as '' | Estado); setPage(1); }}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-red-500/50"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
            </select>
            <input
              type="date"
              value={fecha}
              onChange={(event) => { setFecha(event.target.value); setPage(1); }}
              title="Fecha de funcion"
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-red-500/50 [color-scheme:dark]"
            />
            {(estadoFilter || fecha) && (
              <button
                onClick={() => { setEstadoFilter(''); setFecha(''); setPage(1); }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors"
              >
                <Trash className="w-3.5 h-3.5" />
                Limpiar filtros
              </button>
            )}
          </div>
          <span className="text-xs text-zinc-500">{totalItems} reserva{totalItems !== 1 ? 's' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60">
                {['Codigo', 'Cliente', 'Funcion', 'Total', 'Pago', 'Estado', 'Fecha', ''].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-500"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Cargando reservas...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-500">No se encontraron reservas</td></tr>
              ) : filtered.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center shrink-0">
                        <Ticket className="w-4 h-4 text-red-400" />
                      </div>
                      <span className="font-medium text-zinc-100">{reservation.codigo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{reservation.cliente}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span className="truncate max-w-[220px]">{reservation.pelicula}</span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">{formatDateTime(reservation.funcion)}</p>
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
                  <td className="px-4 py-3">{estadoBadge(reservation.estado)}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{formatDateTime(reservation.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewing(reservation)} title="Ver detalle" className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-zinc-800/60">
            {[
              { label: '<<', target: 1 },
              { label: '<', target: page - 1 },
              { label: String(page), target: page, active: true },
              { label: '>', target: page + 1 },
              { label: '>>', target: totalPages },
            ].map(({ label, target, active }) => (
              <button
                key={label}
                onClick={() => setPage(Math.max(1, Math.min(totalPages, target)))}
                disabled={target < 1 || target > totalPages || target === page}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white leading-tight">{viewing.codigo}</h2>
                  <div className="mt-0.5">{estadoBadge(viewing.estado)}</div>
                </div>
              </div>
              <button onClick={() => setViewing(null)} className="text-zinc-400 hover:text-white transition-colors">
                <Trash className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <DetailRow icon={UserIcon} label="Cliente" value={viewing.cliente} />
              <DetailRow icon={Film} label="Pelicula" value={viewing.pelicula} />
              <DetailRow icon={Clock} label="Funcion" value={formatDateTime(viewing.funcion)} />
              <DetailRow icon={Armchair} label="Asientos" value={String(viewing.asientos)} />
              <DetailRow icon={CalendarClock} label="Creada" value={formatDateTime(viewing.createdAt)} />
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <span className="text-zinc-400">Total</span>
                <span className="text-lg font-bold text-white">L{(viewing.total ?? 0).toLocaleString('es-MX')}</span>
              </div>
            </div>
            <div className="flex justify-end px-6 pb-5">
              <button onClick={() => setViewing(null)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-sm font-medium transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-zinc-500">
        <Icon className="w-4 h-4" />
        {label}
      </span>
      <span className="text-zinc-200 text-right">{value}</span>
    </div>
  );
}