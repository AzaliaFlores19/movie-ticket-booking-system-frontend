'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarClock, ChevronRight, Loader2, MapPin, Ticket } from 'lucide-react';
import { toast } from 'react-toastify';
import MainLayout from '@/components/layout/MainLayout';
import { SeatMap } from '@/components/seats/SeatMap';
import { authService } from '@/services/auth.service';
import { functionsService } from '@/services/functions.service';
import type { AsientoFuncion, Funcion } from '@/types';

function formatShowtime(value?: string | null) {
  if (!value) return '-';
  const [date, time = ''] = value.replace('Z', '').split('T');
  return time ? `${date} ${time.slice(0, 5)}` : date;
}

export default function BookPage({ params }: { params: Promise<{ id: string; functionId: string }> }) {
  const { id, functionId } = use(params);
  const router = useRouter();

  const [funcion, setFuncion] = useState<Funcion | null>(null);
  const [seats, setSeats] = useState<AsientoFuncion[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      const [funcionData, seatsData] = await Promise.all([
        functionsService.getOne(Number(functionId)),
        functionsService.getSeats(Number(functionId)),
      ]);

      if (!mounted) return;
      setFuncion(funcionData);
      setSeats(seatsData);
      setLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [functionId]);

  const selectedSeats = useMemo(() => seats.filter((seat) => selectedIds.has(seat.id)), [seats, selectedIds]);
  const ticketPrice = funcion?.precio ?? 150;
  const total = selectedSeats.length * ticketPrice;

  function toggleSeat(seat: AsientoFuncion) {
    const estado = seat.estado?.toUpperCase();
    const tipo = seat.asiento?.tipo?.toUpperCase();
    if (tipo === 'MANTENIMIENTO' || ['OCUPADO', 'RESERVADO', 'BLOQUEADO'].includes(estado)) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(seat.id)) next.delete(seat.id);
      else next.add(seat.id);
      return next;
    });
  }

  function handleContinue() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast.error('Inicia sesion para reservar tus asientos');
      router.push('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Selecciona al menos un asiento');
      return;
    }

    setReserving(true);
    const params = new URLSearchParams({
      functionId,
      seats: selectedSeats.map((seat) => `${seat.asiento.fila}${seat.asiento.columna}`).join(','),
      seatIds: selectedSeats.map((seat) => String(seat.id)).join(','),
      movie: funcion?.pelicula?.titulo ?? '',
      cine: funcion?.cine?.nombre ?? '',
      sala: funcion?.sala?.nombre ?? '',
      showtime: funcion?.fecha_hora ?? '',
      total: String(total),
    });

    toast.success('Asientos seleccionados');
    router.push(`/checkout?${params.toString()}`);
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="border-b border-zinc-800/60 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-[11px] font-semibold tracking-wide">
          {['Funcion', 'Asientos', 'Pago', 'Confirmacion'].map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 ${index === 1 ? 'bg-red-600 text-white' : 'text-zinc-500 bg-zinc-900'}`}>
                {step}
              </span>
              {index < 3 && <ChevronRight className="w-3 h-3 text-zinc-600" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href={`/movies/${id}`} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-400 transition-colors mb-5">
          <ArrowLeft className="w-4 h-4" />
          Volver a horarios
        </Link>

        <div className="mb-6 flex items-center gap-4">
          <div className="h-16 w-12 rounded-lg bg-zinc-900 overflow-hidden shrink-0">
            {funcion?.pelicula?.poster_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={funcion.pelicula.poster_url} alt={funcion.pelicula.titulo} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Ticket className="w-5 h-5 text-zinc-600" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{funcion?.pelicula?.titulo ?? 'Seleccion de asientos'}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
              <span className="inline-flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" />{formatShowtime(funcion?.fecha_hora)}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{funcion?.cine?.nombre ?? 'Cine'} - {funcion?.sala?.nombre ?? 'Sala'}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <SeatMap seats={seats} selectedIds={selectedIds} onToggleSeat={toggleSeat} />

          <aside className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-4 h-fit lg:sticky lg:top-20">
            <h2 className="font-semibold text-white pb-3 border-b border-zinc-800/60">Tus asientos</h2>

            {selectedSeats.length === 0 ? (
              <p className="text-sm text-zinc-500 py-6 text-center">Selecciona asientos disponibles en el mapa.</p>
            ) : (
              <div className="py-4 space-y-2">
                {selectedSeats.map((seat) => (
                  <div key={seat.id} className="flex items-center justify-between rounded-xl bg-zinc-900 px-3 py-2">
                    <span className="font-mono text-sm font-semibold text-red-300">{seat.asiento.fila}{seat.asiento.columna}</span>
                    <button type="button" onClick={() => toggleSeat(seat)} className="text-xs text-zinc-500 hover:text-red-300 transition-colors">
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-zinc-800/60 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Asientos</span>
                <span className="text-zinc-100">{selectedSeats.length}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Precio</span>
                <span className="text-zinc-100">L {ticketPrice}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-white pt-2">
                <span>Total</span>
                <span>L {total}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={selectedSeats.length === 0 || reserving}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 transition-colors"
            >
              {reserving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Continuar a pago
            </button>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
