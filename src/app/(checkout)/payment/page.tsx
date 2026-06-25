"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CalendarClock,
  MapPin,
  Ticket,
  CreditCard,
  Banknote,
  Lock,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { BookingTimer } from "@/components/booking/BookingTimer";
import { toast } from "react-toastify";

type PaymentMethod = "TARJETA" | "EFECTIVO";

function formatShowtime(value?: string | null) {
  if (!value) return "-";
  const [date, time = ""] = value.replace("Z", "").split("T");
  return time ? `${date} ${time.slice(0, 5)}` : date;
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function PaymentContent() {
  const params = useSearchParams();
  const router = useRouter();

  const seats = params.get("seats")?.split(",").filter(Boolean) ?? [];
  const movie = params.get("movie") || "Película";
  const cine = params.get("cine") || "Cine";
  const sala = params.get("sala") || "Sala";
  const showtime = params.get("showtime");
  const total = params.get("total") || "0";

  const [method, setMethod] = useState<PaymentMethod>("TARJETA");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const totalNum = parseFloat(total) || 0;
  const cashNum = parseFloat(cashAmount) || 0;
  const vuelto = cashNum - totalNum;

  function validateCard(): boolean {
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length !== 16) {
      toast.error("El número de tarjeta debe tener 16 dígitos.");
      return false;
    }
    if (!cardName.trim()) {
      toast.error("Ingresa el nombre del titular.");
      return false;
    }
    const [mm, yy] = expiry.split("/");
    const month = parseInt(mm, 10);
    const year = 2000 + parseInt(yy || "0", 10);
    const now = new Date();
    if (
      !mm ||
      !yy ||
      month < 1 ||
      month > 12 ||
      year < now.getFullYear() ||
      (year === now.getFullYear() && month < now.getMonth() + 1)
    ) {
      toast.error("La fecha de expiración no es válida.");
      return false;
    }
    if (cvv.length < 3) {
      toast.error("El CVV debe tener al menos 3 dígitos.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (method === "TARJETA" && !validateCard()) return;

    if (method === "EFECTIVO") {
      if (!cashAmount || cashNum <= 0) {
        toast.error("Ingresa el monto que vas a entregar.");
        return;
      }
      if (cashNum < totalNum) {
        toast.error(`El monto es insuficiente. Debes entregar al menos L ${totalNum}.`);
        return;
      }
    }

    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1200));

      const result = {
        status: "success",
        reserva: {
          numero_reserva: `RES-${Math.floor(100000 + Math.random() * 900000)}`,
          estado: "PAGADA",
        },
        pago: {
          monto_final: total,
          metodo: method,
          estado: "APROBADO",
          referencia_externa: `SIM-${Date.now()}`,
          created_at: new Date().toISOString(),
          ...(method === "EFECTIVO" && {
            monto_entregado: cashAmount,
            vuelto: vuelto.toFixed(2),
          }),
        },
        movie,
        cine,
        sala,
        showtime,
        seats,
      };

      sessionStorage.setItem("payment_result", JSON.stringify(result));
      router.push("/payment/result");
    } catch {
      toast.error("No pudimos procesar el pago. Intenta de nuevo.");
      setLoading(false);
    }
  }

  const methodOptions: {
    id: PaymentMethod;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      id: "TARJETA",
      label: "Tarjeta",
      icon: <CreditCard className="h-4 w-4" />,
      desc: "Débito o crédito",
    },
    {
      id: "EFECTIVO",
      label: "Efectivo",
      icon: <Banknote className="h-4 w-4" />,
      desc: "Pago en taquilla",
    },
  ];

  return (
    <MainLayout>
      <BookingTimer />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-red-500/65 hover:text-red-400 transition-colors mb-4 group"
          >
            <ArrowLeft
              size={11}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Volver al resumen
          </button>
          <h1 className="text-2xl font-bold text-white">Método de pago</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Elige cómo deseas pagar tus boletos.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            {/* ── Panel izquierdo: formulario ── */}
            <div className="space-y-5">
              {/* Selector de método */}
              <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.14em] mb-3">
                  Selecciona un método
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {methodOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMethod(opt.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border py-4 px-2 text-center transition-all duration-200 ${
                        method === opt.id
                          ? "border-red-500/50 bg-red-950/20 text-red-400"
                          : "border-zinc-800/60 bg-white/[0.02] text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                      }`}
                    >
                      {opt.icon}
                      <span className="text-xs font-semibold">{opt.label}</span>
                      <span className="text-[10px] text-zinc-600 leading-tight">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulario de tarjeta */}
              {method === "TARJETA" && (
                <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/60">
                    <CreditCard className="h-4 w-4 text-red-400" />
                    <p className="text-sm font-semibold text-white">
                      Datos de la tarjeta
                    </p>
                    <div className="ml-auto flex items-center gap-1 text-[10px] text-zinc-600">
                      <Lock className="h-3 w-3" /> Conexión segura
                    </div>
                  </div>

                  {/* Número */}
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.14em]">
                      Número de tarjeta
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                        maxLength={19}
                        className="w-full bg-white/[0.03] border border-zinc-800/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-700 font-mono tracking-widest outline-none focus:border-red-600/50 focus:bg-red-950/[0.08] focus:ring-1 focus:ring-red-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.14em]">
                      Nombre del titular
                    </label>
                    <input
                      type="text"
                      placeholder="Como aparece en la tarjeta"
                      value={cardName}
                      onChange={(e) =>
                        setCardName(e.target.value.toUpperCase())
                      }
                      className="w-full bg-white/[0.03] border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 uppercase tracking-wide outline-none focus:border-red-600/50 focus:bg-red-950/[0.08] focus:ring-1 focus:ring-red-500/10 transition-all duration-200"
                    />
                  </div>

                  {/* Expiración + CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.14em]">
                        Expiración
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/AA"
                        value={expiry}
                        onChange={(e) =>
                          setExpiry(formatExpiry(e.target.value))
                        }
                        maxLength={5}
                        className="w-full bg-white/[0.03] border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 font-mono outline-none focus:border-red-600/50 focus:bg-red-950/[0.08] focus:ring-1 focus:ring-red-500/10 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.14em]">
                        CVV
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          inputMode="numeric"
                          placeholder="•••"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(
                              e.target.value.replace(/\D/g, "").slice(0, 4),
                            )
                          }
                          maxLength={4}
                          className="w-full bg-white/[0.03] border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 font-mono outline-none focus:border-red-600/50 focus:bg-red-950/[0.08] focus:ring-1 focus:ring-red-500/10 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Efectivo */}
              {method === "EFECTIVO" && (
                <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/60">
                    <Banknote className="h-4 w-4 text-amber-400" />
                    <p className="text-sm font-semibold text-white">Pago en efectivo</p>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.14em]">
                      ¿Con cuánto vas a pagar?
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">L</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        className="w-full bg-white/[0.03] border border-zinc-800/80 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-zinc-700 font-mono outline-none focus:border-red-600/50 focus:bg-red-950/[0.08] focus:ring-1 focus:ring-red-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Preview del vuelto */}
                  {cashNum > 0 && (
                    <div className={`rounded-xl border p-3 space-y-2 text-sm transition-colors ${
                      cashNum >= totalNum
                        ? "bg-emerald-950/20 border-emerald-500/20"
                        : "bg-red-950/20 border-red-500/20"
                    }`}>
                      <div className="flex justify-between text-zinc-400">
                        <span>Total a pagar</span>
                        <span className="text-white font-mono">L {totalNum.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Monto entregado</span>
                        <span className="text-white font-mono">L {cashNum.toFixed(2)}</span>
                      </div>
                      <div className={`flex justify-between font-bold border-t pt-2 ${
                        cashNum >= totalNum
                          ? "border-emerald-500/20 text-emerald-400"
                          : "border-red-500/20 text-red-400"
                      }`}>
                        <span>{cashNum >= totalNum ? "Vuelto" : "Falta"}</span>
                        <span className="font-mono">
                          L {Math.abs(vuelto).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Preséntate en taquilla al menos
                    <span className="text-white font-semibold"> 30 minutos antes </span>
                    de la función con tu código de reserva.
                  </p>
                </div>
              )}

            </div>

            {/* ── Panel derecho: resumen ── */}
            <aside className="space-y-4 h-fit lg:sticky lg:top-6">
              <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-red-600/20 border border-red-500/20 flex items-center justify-center">
                    <Ticket className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white leading-tight truncate">
                      {movie}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      {cine} — {sala}
                    </p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <CalendarClock className="h-3 w-3 flex-shrink-0" />
                      {formatShowtime(showtime)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-800/60 pt-3">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.12em] mb-2">
                    Asientos
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {seats.length === 0 ? (
                      <span className="text-xs text-zinc-600">—</span>
                    ) : (
                      seats.map((s) => (
                        <span
                          key={s}
                          className="rounded-lg bg-red-600/20 border border-red-500/20 px-2 py-0.5 font-mono text-xs text-red-300"
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-zinc-800/60 pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Boletos</span>
                    <span className="text-zinc-100">{seats.length}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white">
                    <span>Total</span>
                    <span>L {total}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:opacity-50 text-white text-sm font-semibold py-3.5 transition-all duration-200 shadow-lg shadow-red-950/40 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Pagar L {total}
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-zinc-600">
                Pago seguro con encriptación SSL
              </p>
            </aside>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="max-w-4xl mx-auto px-4 py-8 text-sm text-zinc-400">
            Cargando formulario de pago...
          </div>
        </MainLayout>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
