'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarClock, CreditCard, MapPin, Ticket, Film, Armchair, ArrowLeft, Tag, X as XIcon } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { BookingTimer } from '@/components/booking/BookingTimer';
import { functionsService } from '@/services/functions.service';
import { couponsService } from '@/services/coupons.service';
import type { Funcion } from '@/types';

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();

  const funcionId = Number(params.get('funcionId'));
  const asientos = params.get('asientos')?.split(',').filter(Boolean) ?? [];
  const total = Number(params.get('total') ?? 0);

  const [funcion, setFuncion] = useState<Funcion | null>(null);
  const [loading, setLoading] = useState(true);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: number; codigo: string; tipo: string; valor: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (!funcionId) { setLoading(false); return; }
    let active = true;
    functionsService
      .getOne(funcionId)
      .then((f) => { if (active) setFuncion(f); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [funcionId]);

  const movie     = funcion?.pelicula?.titulo   ?? '—';
  const cine      = funcion?.cine?.nombre       ?? '—';
  const sala      = funcion?.sala?.nombre       ?? '—';
  const direccion = funcion?.cine?.direccion;
  const genero    = funcion?.pelicula?.genero?.nombre;
  const precio    = funcion?.precio ?? (asientos.length ? total / asientos.length : 0);

  const descuento = appliedCoupon
    ? appliedCoupon.tipo === 'PORCENTAJE'
      ? Math.round((total * appliedCoupon.valor) / 100)
      : Math.min(appliedCoupon.valor, total)
    : 0;
  const totalFinal = Math.max(0, total - descuento);

  const fechaHora = funcion?.fecha_hora
    ? format(parseISO(funcion.fecha_hora), "EEE d 'de' MMM, yyyy · h:mm a", { locale: es })
    : '—';

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const coupon = await couponsService.validateCoupon(couponCode);
      setAppliedCoupon(coupon);
      setCouponCode('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCouponError(msg ?? 'Cupón inválido o expirado.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  }

  function goToPayment() {
    const urlParams = new URLSearchParams(params.toString());
    if (appliedCoupon) {
      urlParams.set('couponId', String(appliedCoupon.id));
      urlParams.set('couponCodigo', appliedCoupon.codigo);
      urlParams.set('descuento', String(descuento));
    }
    urlParams.set('totalFinal', String(totalFinal));
    router.push(`/payment?${urlParams.toString()}`);
  }

  function backToSeatMap() {
    const peliculaId = funcion?.pelicula?.id ?? funcion?.pelicula_id;
    if (peliculaId && funcionId) {
      router.push(`/movies/${peliculaId}/book/${funcionId}`);
    } else {
      router.back();
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-sm text-zinc-400">Cargando resumen...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <BookingTimer />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Resumen de compra</h1>
          <p className="text-sm text-zinc-400 mt-1">Confirma los detalles de tus boletos antes de pagar.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5 space-y-5">
            {/* Película */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-600/20 border border-red-500/20 flex items-center justify-center shrink-0">
                <Ticket className="h-5 w-5 text-red-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white truncate">{movie}</h2>
                {genero && <p className="text-xs text-zinc-500 mt-0.5">{genero}</p>}
                <div className="mt-2 space-y-1 text-sm text-zinc-400">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {cine}
                    {direccion && <span className="text-zinc-600">· {direccion}</span>}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Film className="h-3.5 w-3.5 shrink-0" />
                    {sala}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                    <span className="capitalize">{fechaHora}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Asientos */}
            <div className="border-t border-zinc-800/60 pt-4">
              <p className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-1.5">
                <Armchair className="h-4 w-4 text-zinc-500" />
                Asientos seleccionados
              </p>
              <div className="flex flex-wrap gap-2">
                {asientos.length === 0 ? (
                  <span className="text-sm text-zinc-500">No hay asientos seleccionados.</span>
                ) : (
                  asientos.map((seat) => (
                    <span key={seat} className="rounded-lg bg-red-600/20 border border-red-500/20 px-3 py-1 font-mono text-sm text-red-300">
                      {seat}
                    </span>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Resumen de pago */}
          <aside className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5 h-fit space-y-4">
            <h2 className="font-semibold text-white pb-3 border-b border-zinc-800/60">Total</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Boletos</span>
                <span className="text-zinc-100">{asientos.length}</span>
              </div>
              {precio > 0 && (
                <div className="flex justify-between text-zinc-400">
                  <span>Precio por boleto</span>
                  <span className="text-zinc-100">${precio.toLocaleString('es-MX')}</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex justify-between text-green-400">
                  <span>Descuento ({appliedCoupon.codigo})</span>
                  <span>−${descuento.toLocaleString('es-MX')}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-white border-t border-zinc-800/60 pt-2 mt-2">
                <span>A pagar</span>
                <span>${totalFinal.toLocaleString('es-MX')}</span>
              </div>
            </div>

            {/* Campo cupón */}
            <div className="border-t border-zinc-800/60 pt-4">
              <p className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Cupón de descuento
              </p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-xs font-bold text-green-400">{appliedCoupon.codigo}</p>
                    <p className="text-[11px] text-zinc-400">
                      {appliedCoupon.tipo === 'PORCENTAJE'
                        ? `${appliedCoupon.valor}% de descuento`
                        : `$${appliedCoupon.valor.toLocaleString('es-MX')} de descuento`}
                    </p>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} className="text-zinc-500 hover:text-red-400 transition-colors p-1">
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código de cupón"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') applyCoupon(); }}
                      className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 uppercase"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 text-xs font-bold rounded-xl transition-colors"
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-400 mt-1.5">{couponError}</p>}
                </>
              )}
            </div>

            <button
              onClick={goToPayment}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-3 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              Confirmar y continuar al pago
            </button>
            <button
              onClick={backToSeatMap}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-sm font-semibold py-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar y volver al mapa
            </button>
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
