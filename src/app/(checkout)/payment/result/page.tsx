"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Ticket,
  MapPin,
  CalendarClock,
  CreditCard,
  Banknote,
  Hash,
  RefreshCcw,
  Home,
  BookOpen,
  Loader2,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

interface PaymentResult {
  status: "success" | "error";
  errorMessage?: string;
  reserva?: { numero_reserva: string; estado: string };
  pago?: {
    monto_final: string;
    metodo: "TARJETA" | "EFECTIVO";
    estado: string;
    referencia_externa: string;
    created_at: string;
    monto_entregado?: string;
    vuelto?: string;
  };
  movie?: string;
  cine?: string;
  sala?: string;
  showtime?: string;
  seats?: string[];
}

const METHOD_LABELS: Record<string, string> = {
  TARJETA: "Tarjeta",
  EFECTIVO: "Efectivo",
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  TARJETA: <CreditCard className="h-4 w-4" />,
  EFECTIVO: <Banknote className="h-4 w-4" />,
};

function formatShowtime(value?: string | null) {
  if (!value) return "-";
  const [date, time = ""] = value.replace("Z", "").split("T");
  return time ? `${date} ${time.slice(0, 5)}` : date;
}

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("es-HN", { dateStyle: "medium", timeStyle: "short" });
}

export default function PaymentResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("payment_result");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setResult(JSON.parse(raw));
    } catch {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      </MainLayout>
    );
  }

  if (!result) return null;

  const isSuccess = result.status === "success";

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* ── Banner de resultado ── */}
        <div
          className={`rounded-2xl border p-6 mb-6 flex items-start gap-4 ${
            isSuccess
              ? "bg-emerald-950/30 border-emerald-500/25"
              : "bg-red-950/30 border-red-500/25"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-8 w-8 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h1 className="text-xl font-bold text-white">
              {isSuccess ? "¡Pago exitoso!" : "El pago no se pudo completar"}
            </h1>
            <p
              className={`text-sm mt-1 ${isSuccess ? "text-emerald-300/70" : "text-red-300/70"}`}
            >
              {isSuccess
                ? "Tu reserva ha sido confirmada. Guarda tu código de reserva."
                : result.errorMessage ||
                  "Ocurrió un error al procesar el pago. Intenta de nuevo."}
            </p>
          </div>
        </div>

        {isSuccess && result.reserva && result.pago ? (
          <div className="space-y-4">
            {/* Código de reserva */}
            <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.14em] mb-3">
                Código de reserva
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-600/15 border border-emerald-500/20 flex items-center justify-center">
                  <Hash className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-2xl font-black font-mono tracking-widest text-white">
                  {result.reserva.numero_reserva}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Presenta este código en taquilla o en la app al momento de
                ingresar.
              </p>
            </div>

            {/* Detalle de la transacción */}
            <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.14em] mb-3">
                Detalle de la transacción
              </p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Estado</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/15 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {result.pago.estado}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Método</span>
                  <span className="inline-flex items-center gap-1.5 text-zinc-200">
                    {METHOD_ICONS[result.pago.metodo]}
                    {METHOD_LABELS[result.pago.metodo] ?? result.pago.metodo}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Referencia</span>
                  <span className="font-mono text-xs text-zinc-300">
                    {result.pago.referencia_externa}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Fecha</span>
                  <span className="text-zinc-300">
                    {formatDateTime(result.pago.created_at)}
                  </span>
                </div>
                {/* Desglose efectivo */}
                {result.pago.metodo === "EFECTIVO" &&
                  result.pago.monto_entregado && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Monto entregado</span>
                        <span className="font-mono text-zinc-200">
                          L {parseFloat(result.pago.monto_entregado).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Vuelto</span>
                        <span className="font-mono font-semibold text-emerald-400">
                          L {parseFloat(result.pago.vuelto ?? "0").toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                <div className="flex justify-between items-center border-t border-zinc-800/60 pt-2.5 mt-1">
                  <span className="font-semibold text-white">Total pagado</span>
                  <span className="text-lg font-bold text-white">
                    L {result.pago.monto_final}
                  </span>
                </div>
              </div>
            </div>

            {/* Detalle de la compra */}
            <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.14em] mb-3">
                Detalle de la compra
              </p>
              <div className="flex items-start gap-3 mb-4">
                <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-red-600/20 border border-red-500/20 flex items-center justify-center">
                  <Ticket className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {result.movie}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {result.cine} — {result.sala}
                  </p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                    <CalendarClock className="h-3 w-3" />
                    {formatShowtime(result.showtime)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.12em] mb-2">
                  Asientos
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(result.seats ?? []).map((s) => (
                    <span
                      key={s}
                      className="rounded-lg bg-red-600/20 border border-red-500/20 px-2.5 py-0.5 font-mono text-xs text-red-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Acciones éxito */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/my-bookings"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-sm font-semibold py-3 transition-all duration-200 shadow-lg shadow-red-950/40"
              >
                <BookOpen className="h-4 w-4" />
                Mis reservas
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800/60 bg-zinc-950 hover:border-zinc-700 text-zinc-300 hover:text-white text-sm font-semibold py-3 transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                Inicio
              </Link>
            </div>
          </div>
        ) : (
          /* ── Vista de error ── */
          <div className="space-y-4">
            <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-6 text-center space-y-3">
              <p className="text-sm text-zinc-400">
                No se realizó ningún cargo a tu cuenta. Puedes intentarlo
                nuevamente con los mismos datos o seleccionar otro método de
                pago.
              </p>
              {result.seats && result.seats.length > 0 && (
                <p className="text-xs text-zinc-600">
                  Tus asientos siguen reservados por un tiempo limitado.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-sm font-semibold py-3 transition-all duration-200 shadow-lg shadow-red-950/40"
              >
                <RefreshCcw className="h-4 w-4" />
                Reintentar pago
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800/60 bg-zinc-950 hover:border-zinc-700 text-zinc-300 hover:text-white text-sm font-semibold py-3 transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                Inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
