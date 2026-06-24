'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import {
  Ticket, Film, Clock, Building2, MapPin, Armchair, Hash,
  CalendarClock, RotateCcw, ChevronRight, Ban, AlertCircle,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { reservationsService } from '@/services/reservations.service';
import { Reservation } from '@/types';

type TabKey = 'proximas' | 'pasadas' | 'todas';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'proximas', label: 'Próximas' },
  { key: 'pasadas', label: 'Pasadas' },
  { key: 'todas', label: 'Todas' },
];

// Estilos de badge por estado de la reserva.
const STATUS_STYLES: Record<string, string> = {
  CONFIRMADA: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  PAGADA: 'bg-green-600/20 text-green-400 border-green-500/30',
  USADA: 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30',
  CANCELADA: 'bg-red-600/20 text-red-400 border-red-500/30',
};

function statusStyle(estado: string) {
  return STATUS_STYLES[estado] ?? 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30';
}

function seatLabels(r: Reservation) {
  return (r.asientos ?? [])
    .map((a) => `${a.asiento.fila}${a.asiento.columna}`)
    .sort();
}

function formatDate(dateStr: string) {
  const label = format(parseISO(dateStr), "EEE d 'de' MMM, yyyy", { locale: es });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function MyBookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('proximas');
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    reservationsService
      .getMine()
      .then((data) => { if (active) setReservations(data); })
      .catch(() => { if (active) setReservations([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const now = Date.now();

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

  const filtered = useMemo(() => {
    const sorted = [...reservations].sort(
      (a, b) =>
        new Date(b.funcion?.fecha_hora ?? 0).getTime() -
        new Date(a.funcion?.fecha_hora ?? 0).getTime()
    );
    if (tab === 'todas') return sorted;
    return sorted.filter((r) => {
      const time = new Date(r.funcion?.fecha_hora ?? 0).getTime();
      return tab === 'proximas' ? time >= now : time < now;
    });
  }, [reservations, tab, now]);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Boletos</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Consulta tus reservas y entradas compradas.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <Ticket className="w-4 h-4 text-red-400" />
            <span className="text-sm text-zinc-300">
              <span className="font-semibold text-white">{reservations.length}</span> en total
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 text-center text-zinc-500">Cargando tus boletos...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-zinc-950 border border-zinc-800/60 rounded-2xl">
            <CalendarClock className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No tienes boletos en esta sección</p>
            <Link
              href="/movies"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors"
            >
              <Film className="w-4 h-4" />
              Explorar películas
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((r) => {
              const fn = r.funcion;
              const seats = seatLabels(r);
              const upcoming = new Date(fn?.fecha_hora ?? 0).getTime() >= now;
              const canRefund = upcoming && r.estado !== 'CANCELADA';

              return (
                <div
                  key={r.id}
                  className="flex bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors"
                >
                  {/* Poster */}
                  <div className="w-24 sm:w-28 shrink-0 bg-zinc-800">
                    {fn?.pelicula?.poster_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fn.pelicula.poster_url}
                        alt={fn.pelicula.titulo ?? ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-6 h-6 text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-zinc-100 truncate">
                        {fn?.pelicula?.titulo ?? 'Función'}
                      </h3>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle(r.estado)}`}>
                        {r.estado}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-zinc-400">
                      <p className="flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        {fn?.fecha_hora ? formatDate(fn.fecha_hora) : '—'}
                        {fn?.fecha_hora && (
                          <>
                            <Clock className="w-3.5 h-3.5 text-red-500 shrink-0 ml-1" />
                            {format(parseISO(fn.fecha_hora), 'h:mm a')}
                          </>
                        )}
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        {fn?.cine?.nombre ?? '—'}
                        <span className="text-zinc-600">·</span>
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        {fn?.sala?.nombre ?? '—'}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Armchair className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        {seats.length > 0 ? seats.join(', ') : '—'}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        {r.codigo ?? `#${r.id}`}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                      <span className="font-bold text-red-400 shrink-0">
                        ${(r.total ?? 0).toLocaleString('es-MX')}
                      </span>
                      {canRefund ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCancelId(r.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600/10 text-red-400 border border-red-500/30 hover:bg-red-600/20 transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-600">
                          {r.estado === 'CANCELADA' ? 'Cancelada' : 'Finalizada'}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                  Se cancelará tu reserva <span className="font-semibold text-zinc-200">{cancelTarget.codigo ?? `#${cancelTarget.id}`}</span> para{' '}
                  <span className="font-semibold text-zinc-200">{cancelTarget.funcion?.pelicula?.titulo ?? 'la función'}</span>. Esta acción no se puede deshacer.
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
    </MainLayout>
  );
}
