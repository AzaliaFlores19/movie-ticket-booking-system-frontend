'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CalendarClock, CreditCard, MapPin, Ticket } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

function CheckoutContent() {
  const params = useSearchParams();
  const seats = params.get('seats')?.split(',').filter(Boolean) ?? [];
  const movie = params.get('movie') || 'Pelicula';
  const cine = params.get('cine') || 'Cine';
  const sala = params.get('sala') || 'Sala';
  const showtime = params.get('showtime');
  const total = params.get('total') || '0';

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Resumen de compra</h1>
          <p className="text-sm text-zinc-400 mt-1">Confirma los detalles de tus boletos antes de pagar.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-600/20 border border-red-500/20 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{movie}</h2>
                <div className="mt-2 space-y-1 text-sm text-zinc-400">
                  <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{cine} - {sala}</p>
                  <p className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" />{showtime ? new Date(showtime).toLocaleString() : '-'}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800/60 pt-4">
              <p className="text-sm font-medium text-zinc-300 mb-3">Asientos seleccionados</p>
              <div className="flex flex-wrap gap-2">
                {seats.length === 0 ? (
                  <span className="text-sm text-zinc-500">No hay asientos seleccionados.</span>
                ) : (
                  seats.map((seat) => (
                    <span key={seat} className="rounded-lg bg-red-600/20 border border-red-500/20 px-3 py-1 font-mono text-sm text-red-300">
                      {seat}
                    </span>
                  ))
                )}
              </div>
            </div>
          </section>

          <aside className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5 h-fit">
            <h2 className="font-semibold text-white pb-3 border-b border-zinc-800/60">Total</h2>
            <div className="py-4 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Boletos</span>
                <span className="text-zinc-100">{seats.length}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white">
                <span>A pagar</span>
                <span>L {total}</span>
              </div>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-3 transition-colors">
              <CreditCard className="h-4 w-4" />
              Continuar pago
            </button>
            <Link href="/" className="mt-3 block text-center text-xs text-zinc-500 hover:text-red-300 transition-colors">
              Seguir explorando
            </Link>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="max-w-4xl mx-auto px-4 py-8 text-sm text-zinc-400">Cargando resumen...</div>
        </MainLayout>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
