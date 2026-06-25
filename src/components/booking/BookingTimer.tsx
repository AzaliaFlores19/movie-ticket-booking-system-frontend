'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, AlertTriangle, X } from 'lucide-react';

const EXPIRY_KEY = 'booking_timer_expiry';
const REDIRECT_KEY = 'booking_timer_redirect';
const DURATION_MS = 10 * 60 * 1000; // 10 minutes

// Rutas que forman parte del flujo de reserva. Mientras navegues entre ellas el
// temporizador se mantiene; al salir a cualquier otra ruta se resetea.
function isBookingFlowPath(pathname: string) {
  return (
    pathname.includes('/book/') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/payment')
  );
}

interface BookingTimerProps {
  /**
   * When true, starts the timer session if one isn't already running.
   * Drive it from the seat selection (e.g. `autoStart={selected.length > 0}`).
   * Once started, the countdown continues even if this goes back to false.
   */
  autoStart?: boolean;
  /** Where to redirect when the timer expires (only used when this instance starts it). */
  redirectOnExpiry?: string;
}

export function BookingTimer({ autoStart = false, redirectOnExpiry = '/' }: BookingTimerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let expiry = Number(sessionStorage.getItem(EXPIRY_KEY)) || 0;

    // No active session yet: start one only if this instance is allowed to.
    if (!expiry || expiry <= Date.now()) {
      if (!autoStart) return;
      expiry = Date.now() + DURATION_MS;
      sessionStorage.setItem(EXPIRY_KEY, String(expiry));
      sessionStorage.setItem(REDIRECT_KEY, redirectOnExpiry);
    }

    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setExpired(true);
        sessionStorage.removeItem(EXPIRY_KEY);
        sessionStorage.removeItem(REDIRECT_KEY);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [autoStart, redirectOnExpiry]);

  // Resetear el temporizador al abandonar el flujo de reserva. La limpieza al
  // desmontar se ejecuta cuando ya navegamos a la ruta destino, así que basta con
  // comprobar si esa ruta sigue dentro del flujo.
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && !isBookingFlowPath(window.location.pathname)) {
        clearBookingTimer();
      }
    };
  }, [pathname]);

  // Redirect after the expiry modal shows for 4 s
  useEffect(() => {
    if (!expired) return;
    const redirect = sessionStorage.getItem(REDIRECT_KEY) ?? '/';
    const t = setTimeout(() => router.push(redirect), 4000);
    return () => clearTimeout(t);
  }, [expired, router]);

  // ── Expiry overlay ────────────────────────────────────────────────────────
  if (expired) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-7 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Tiempo agotado</h3>
            <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
              Tu sesión de reserva ha expirado. Los asientos seleccionados fueron liberados.
            </p>
          </div>
          <p className="text-xs text-zinc-600">Redirigiendo en unos segundos…</p>
        </div>
      </div>
    );
  }

  // Not started / dismissed
  if (secondsLeft === null || dismissed) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isWarning = secondsLeft <= 120 && secondsLeft > 60;
  const isDanger = secondsLeft <= 60;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl shadow-black/40 backdrop-blur-sm transition-colors duration-300 ${
        isDanger
          ? 'bg-red-950/90 border-red-500/50 text-red-300 animate-pulse'
          : isWarning
          ? 'bg-amber-950/90 border-amber-500/40 text-amber-300'
          : 'bg-zinc-900/95 border-zinc-700/50 text-zinc-200'
      }`}
    >
      {isDanger || isWarning ? (
        <AlertTriangle className="w-4 h-4 shrink-0" />
      ) : (
        <Clock className="w-4 h-4 shrink-0" />
      )}

      <div className="flex flex-col leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-current opacity-60">
          Reserva expira en
        </span>
        <span className="text-lg font-black font-mono tabular-nums tracking-tight leading-none">
          {display}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Ocultar temporizador"
        className="ml-1 text-current opacity-40 hover:opacity-80 transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function clearBookingTimer() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(EXPIRY_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
  }
}
