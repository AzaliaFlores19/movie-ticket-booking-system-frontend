'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import {
  Ticket, Film, Clock, Building2, MapPin, Armchair, Hash,
  CalendarClock, RotateCcw, ChevronRight, Ban, AlertCircle, ShieldCheck
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { reservationsService } from '@/services/reservations.service';
import { refundsService } from '@/services/refunds.service';
import { Reservation, Refund } from '@/types';
import { MOCK_POLICIES } from '@/lib/mock-data';

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
  REEMBOLSADA: 'bg-teal-600/20 text-teal-400 border-teal-500/30',
};

function statusStyle(estado: string) {
  return STATUS_STYLES[estado] ?? 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30';
}

// Estilos de badge por estado del reembolso.
const REFUND_STATUS_STYLES: Record<string, string> = {
  PENDIENTE: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
  PROCESADO: 'bg-green-600/20 text-green-400 border-green-500/30',
  RECHAZADO: 'bg-red-600/20 text-red-400 border-red-500/30',
};

function refundStatusStyle(estado: string) {
  return REFUND_STATUS_STYLES[estado] ?? 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30';
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
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('proximas');
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelStep, setCancelStep] = useState<1 | 2>(1);
  const [cancelling, setCancelling] = useState(false);

  const activePolicy = MOCK_POLICIES.find((p) => p.activo) ?? null;

  useEffect(() => {
    let active = true;
    reservationsService
      .getMine()
      .then((data) => { if (active) setReservations(data); })
      .catch(() => { if (active) setReservations([]); })
      .finally(() => { if (active) setLoading(false); });
    refundsService
      .getMine()
      .then((data) => { if (active) setRefunds(data); })
      .catch(() => { if (active) setRefunds([]); });
    return () => { active = false; };
  }, []);

  // Reembolso por id de pago, para mostrar su estado en cada reserva.
  const refundByPaymentId = useMemo(() => {
    const map = new Map<number, Refund>();
    for (const rf of refunds) {
      if (rf.pago_id != null) map.set(rf.pago_id, rf);
    }
    return map;
  }, [refunds]);

  const now = Date.now();

  const cancelTarget = reservations.find((r) => r.id === cancelId) ?? null;

  const horasRestantes = cancelTarget?.funcion?.fecha_hora
    ? (new Date(cancelTarget.funcion.fecha_hora).getTime() - Date.now()) / (1000 * 60 * 60)
    : 0;
  const eligibleForRefund = activePolicy ? horasRestantes >= activePolicy.horas_limite : false;
  const refundAmount = cancelTarget && activePolicy && eligibleForRefund
    ? Math.round((cancelTarget.total * activePolicy.porcentaje_reembolso) / 100)
    : 0;

  function openCancelModal(id: number) {
    setCancelId(id);
    setCancelStep(1);
  }

  function closeCancel() {
    setCancelId(null);
    setCancelStep(1);
  }

  const handleCancel = async () => {
    if (cancelId == null) return;
    setCancelling(true);
    try {
      await reservationsService.cancel(cancelId);
      setReservations((prev) =>
        prev.map((r) => (r.id === cancelId ? { ...r, estado: 'CANCELADA' } : r))
      );
      toast.success(
        refundAmount > 0
          ? `Reserva cancelada. Se reembolsarán $${refundAmount.toLocaleString('es-MX')}.`
          : 'Reserva cancelada. No aplica reembolso.'
      );
      closeCancel();
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
              const refund = r.payment?.id != null ? refundByPaymentId.get(r.payment.id) : undefined;
              const refundProcessed = refund?.estado === 'PROCESADO';
              // Si el reembolso ya se procesó, la reserva se muestra como REEMBOLSADA.
              const displayStatus = refundProcessed ? 'REEMBOLSADA' : r.estado;

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
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle(displayStatus)}`}>
                        {displayStatus}
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
                      {refund && (
                        <p className="flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          Reembolso
                          {!refundProcessed && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${refundStatusStyle(refund.estado)}`}>
                              {refund.estado}
                            </span>
                          )}
                          <span className="text-zinc-500">· ${(refund.monto ?? 0).toLocaleString('es-MX')}</span>
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                      <span className="font-bold text-red-400 shrink-0">
                        ${(r.total ?? 0).toLocaleString('es-MX')}
                      </span>
                      {canRefund ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openCancelModal(r.id)}
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

      {/* Modal Paso 1 — Política de cancelación */}
      {cancelTarget && cancelStep === 1 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Política de cancelación</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Antes de confirmar, revisa las condiciones</p>
                </div>
              </div>

              {activePolicy ? (
                <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-zinc-100">{activePolicy.nombre}</p>
                  {activePolicy.descripcion && (
                    <p className="text-xs text-zinc-400">{activePolicy.descripcion}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-full px-3 py-1">
                      <span className="text-zinc-400">Hasta</span>
                      <span className="font-bold text-zinc-100">{activePolicy.horas_limite}h</span>
                      <span className="text-zinc-500">antes de la función</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-full px-3 py-1">
                      <span className="text-zinc-400">Reembolso:</span>
                      <span className={`font-bold ${activePolicy.porcentaje_reembolso === 100 ? 'text-green-400' : activePolicy.porcentaje_reembolso === 0 ? 'text-zinc-500' : 'text-amber-400'}`}>
                        {activePolicy.porcentaje_reembolso}%
                      </span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl p-4">
                  <p className="text-xs text-zinc-400">No hay una política de cancelación activa. No se garantiza reembolso.</p>
                </div>
              )}

              <p className="text-xs text-zinc-500">
                Reserva <span className="text-zinc-300 font-medium">{cancelTarget.codigo ?? `#${cancelTarget.id}`}</span> ·{' '}
                <span className="text-zinc-300 font-medium">{cancelTarget.funcion?.pelicula?.titulo ?? 'la función'}</span>
              </p>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeCancel}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  VOLVER
                </button>
                <button
                  onClick={() => setCancelStep(2)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  CONTINUAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paso 2 — Confirmar con monto de reembolso */}
      {cancelTarget && cancelStep === 2 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Confirmar cancelación</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Total pagado</span>
                  <span className="text-zinc-100 font-medium">${(cancelTarget.total ?? 0).toLocaleString('es-MX')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">% de reembolso</span>
                  <span className="text-zinc-300">{eligibleForRefund && activePolicy ? activePolicy.porcentaje_reembolso : 0}%</span>
                </div>
                <div className="border-t border-zinc-700/60 pt-3 flex justify-between">
                  <span className="text-sm font-semibold text-zinc-200">Monto a reembolsar</span>
                  <span className={`text-base font-bold ${refundAmount > 0 ? 'text-green-400' : 'text-zinc-500'}`}>
                    {refundAmount > 0 ? `$${refundAmount.toLocaleString('es-MX')}` : 'Sin reembolso'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setCancelStep(1)}
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
