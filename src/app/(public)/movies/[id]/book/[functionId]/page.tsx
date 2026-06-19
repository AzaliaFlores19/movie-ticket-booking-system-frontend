'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, ChevronRight, Loader2, MapPin, Ticket } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { SeatMap } from '@/components/seats/SeatMap';
import { functionsService } from '@/services/functions.service';
import type { AsientoFuncion, Funcion } from '@/types';

export default function BookPage({ params }: { params: Promise<{ id: string; functionId: string }> }) {
  const { id, functionId } = use(params);
  const [funcion, setFuncion] = useState<Funcion | null>(null);
  const [seats, setSeats] = useState<AsientoFuncion[]>([]);
  const [loading, setLoading] = useState(true);

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
            <h1 className="text-xl font-bold text-white">{funcion?.pelicula?.titulo ?? 'Mapa de asientos'}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
              <span className="inline-flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" />{funcion?.fecha_hora ? new Date(funcion.fecha_hora).toLocaleString() : '-'}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{funcion?.cine?.nombre ?? 'Cine'} - {funcion?.sala?.nombre ?? 'Sala'}</span>
            </div>
          </div>
        </div>

        <SeatMap seats={seats} readOnly />
      </div>
    </MainLayout>
  );
}
