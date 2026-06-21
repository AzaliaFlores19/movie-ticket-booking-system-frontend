'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, Loader2, Clock, Building2, Film, Ticket, Check, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { getMockFuncionById, getMockSeatsForFuncion, MOCK_USERS, MOCK_FUNCIONES } from '@/lib/mock-data';
import { authService } from '@/services/auth.service';
import { Funcion } from '@/types';

const STAFF_ROLES = ['ADMIN', 'SECRETARIO'];
const CLIENTES = MOCK_USERS.filter((u) => u.roleName === 'CLIENTE');

interface Seat {
  id: number;
  estado: string;
  asiento: { id: number; fila: string; columna: number; tipo: string };
}

const SEAT_BASE = 'w-7 h-7 sm:w-8 sm:h-8 rounded-t-lg text-[10px] font-semibold flex items-center justify-center transition-all duration-150';

export default function BookPage({ params }: { params: Promise<{ id: string; functionId: string }> }) {
  const { id, functionId } = use(params);
  const funcionId = Number(functionId);
  const router = useRouter();

  const [funcion, setFuncion] = useState<Funcion | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Rol del usuario en sesión: ADMIN/SECRETARIO usan el flujo de staff (reservan para un cliente).
  const [isStaff, setIsStaff] = useState(false);
  const [clienteId, setClienteId] = useState<number | null>(null);

  useEffect(() => {
    // Math.random() en el generador de asientos: lo ejecutamos solo en cliente para evitar hydration mismatch.
    setFuncion(getMockFuncionById(funcionId));
    setSeats(getMockSeatsForFuncion(funcionId));
    const role = authService.getCurrentUser()?.role;
    setIsStaff(STAFF_ROLES.includes(role));
    setLoading(false);
  }, [funcionId]);

  const backHref = isStaff ? '/admin/reservations' : `/movies/${id}`;

  const handleConfirm = () => {
    if (selected.length === 0) return;
    if (isStaff && !clienteId) return;
    const seatLabels = seats
      .filter((s) => selected.includes(s.id))
      .map((s) => `${s.asiento.fila}${s.asiento.columna}`)
      .sort()
      .join(',');
    const query = new URLSearchParams({
      funcionId: String(funcionId),
      asientos: seatLabels,
      total: String(selected.length * (funcion?.precio ?? 0)),
    });
    if (isStaff && clienteId) query.set('clienteId', String(clienteId));
    router.push(`/checkout?${query.toString()}`);
  };

  const toggleSeat = (seat: Seat) => {
    if (seat.estado !== 'DISPONIBLE') return;
    setSelected((prev) =>
      prev.includes(seat.id) ? prev.filter((s) => s !== seat.id) : [...prev, seat.id]
    );
  };

  // Agrupar asientos por fila para renderizar el mapa.
  const rows = useMemo(() => {
    const map = new Map<string, Seat[]>();
    for (const s of seats) {
      if (!map.has(s.asiento.fila)) map.set(s.asiento.fila, []);
      map.get(s.asiento.fila)!.push(s);
    }
    for (const list of map.values()) list.sort((a, b) => a.asiento.columna - b.asiento.columna);
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  // Horarios disponibles de la misma película, agrupados por cine.
  // Solo se muestran al cliente para que pueda elegir otra función antes de reservar.
  const funcionesPorCine = useMemo(() => {
    if (!funcion) return [];
    const disponibles = MOCK_FUNCIONES.filter(
      (f) => f.pelicula_id === funcion.pelicula_id && f.estado === 'DISPONIBLE'
    ).sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora));

    const map = new Map<number, { cine: NonNullable<Funcion['cine']>; funciones: Funcion[] }>();
    for (const f of disponibles) {
      if (!f.cine) continue;
      if (!map.has(f.cine.id)) map.set(f.cine.id, { cine: f.cine, funciones: [] });
      map.get(f.cine.id)!.funciones.push(f);
    }
    return Array.from(map.values());
  }, [funcion]);

  const precio = funcion?.precio ?? 0;
  const total = selected.length * precio;

  const selectedSeats = seats
    .filter((s) => selected.includes(s.id))
    .map((s) => `${s.asiento.fila}${s.asiento.columna}`)
    .sort();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh] bg-[#0a0a0a]">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      </MainLayout>
    );
  }

  if (!funcion) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-[#0a0a0a]">
          <Film className="w-16 h-16 text-red-700 mb-4" />
          <h2 className="text-xl font-bold mb-2 text-white">Función no encontrada</h2>
          <Link href={`/movies/${id}`} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500 transition-colors">
            Volver
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-500 transition-colors mb-6 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            {isStaff ? 'Volver al listado de reservas' : 'Volver'}
          </Link>

          {/* Resumen de la función */}
          <div className="bg-zinc-900/90 rounded-2xl p-5 mb-6 border border-zinc-800/30">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">
              {funcion.pelicula?.titulo ?? 'Función'}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                {format(parseISO(funcion.fecha_hora), "EEEE d 'de' MMMM, h:mm a", { locale: es })}
              </span>
              {funcion.cine && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  {funcion.cine.nombre}
                </span>
              )}
              {funcion.sala && (
                <span className="px-2 py-0.5 bg-zinc-800/60 border border-zinc-700/30 rounded text-xs text-zinc-300">
                  {funcion.sala.nombre}
                </span>
              )}
            </div>
          </div>

          {/* Horarios disponibles — solo para clientes, antes del mapa de asientos */}
          {!isStaff && funcionesPorCine.length > 0 && (
            <div className="bg-zinc-900/90 rounded-2xl p-5 mb-6 border border-zinc-800/30">
              <h2 className="font-bold text-sm text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                Horarios disponibles
              </h2>
              <div className="space-y-5">
                {funcionesPorCine.map(({ cine, funciones }) => (
                  <div key={cine.id}>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Building2 className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-sm font-semibold text-white">{cine.nombre}</span>
                      {cine.direccion && (
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {cine.direccion}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {funciones.map((f) => {
                        const isCurrent = f.id === funcionId;
                        return (
                          <Link
                            key={f.id}
                            href={`/movies/${id}/book/${f.id}`}
                            aria-current={isCurrent ? 'true' : undefined}
                            className={`inline-flex flex-col items-center px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                              isCurrent
                                ? 'bg-red-600 border-red-500 text-white font-semibold cursor-default pointer-events-none'
                                : 'bg-zinc-800/60 border-zinc-700/40 text-zinc-200 hover:border-red-500/50 hover:text-white'
                            }`}
                          >
                            <span className="font-medium">
                              {format(parseISO(f.fecha_hora), 'h:mm a', { locale: es })}
                            </span>
                            <span className={`text-[10px] ${isCurrent ? 'text-red-100' : 'text-zinc-500'}`}>
                              {format(parseISO(f.fecha_hora), "d MMM", { locale: es })}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

            {/* Mapa de asientos */}
            <div className="bg-zinc-900/90 rounded-2xl p-5 sm:p-8 border border-zinc-800/30">
              {/* Pantalla */}
              <div className="mb-8">
                <div className="h-2 bg-gradient-to-b from-zinc-500 to-transparent rounded-t-[50%] mx-auto max-w-md" />
                <p className="text-center text-[10px] uppercase tracking-[0.3em] text-zinc-500 mt-2 font-semibold">
                  Pantalla
                </p>
              </div>

              {/* Grid */}
              <div className="flex flex-col items-center gap-1.5 overflow-x-auto pb-2">
                {rows.map(([fila, fSeats]) => (
                  <div key={fila} className="flex items-center gap-1.5">
                    <span className="w-4 text-[10px] font-bold text-zinc-600 shrink-0">{fila}</span>
                    <div className="flex gap-1.5">
                      {fSeats.map((seat) => {
                        const isSelected = selected.includes(seat.id);
                        const estado = seat.estado;
                        let cls = '';
                        if (isSelected) {
                          cls = 'bg-red-600 text-white ring-2 ring-red-400/50 cursor-pointer';
                        } else if (estado === 'DISPONIBLE') {
                          cls = 'bg-zinc-700/60 text-zinc-300 hover:bg-zinc-600 cursor-pointer';
                        } else if (estado === 'OCUPADO') {
                          cls = 'bg-zinc-800/40 text-zinc-700 cursor-not-allowed';
                        } else {
                          cls = 'bg-amber-900/30 text-amber-700/60 cursor-not-allowed';
                        }
                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => toggleSeat(seat)}
                            disabled={estado !== 'DISPONIBLE'}
                            title={`${fila}${seat.asiento.columna} — ${estado}`}
                            className={`${SEAT_BASE} ${cls}`}
                          >
                            {seat.asiento.columna}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Leyenda */}
              <div className="flex flex-wrap justify-center gap-4 mt-8 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-zinc-700/60" /> Disponible
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-red-600" /> Seleccionado
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-zinc-800/40" /> Ocupado
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-amber-900/30" /> Mantenimiento
                </span>
              </div>
            </div>

            {/* Panel de resumen */}
            <div className="bg-zinc-900/90 rounded-2xl p-5 border border-zinc-800/30 h-fit lg:sticky lg:top-6">
              <h2 className="font-bold text-sm text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-red-500" />
                {isStaff ? 'Nueva Reserva' : 'Tu Reserva'}
              </h2>

              {isStaff && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    Reservar para
                  </label>
                  <div className="relative">
                    <select
                      value={clienteId ?? ''}
                      onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full appearance-none bg-zinc-800 border border-zinc-700/40 rounded-xl pl-3 pr-9 py-2 text-sm text-zinc-100 outline-none focus:border-red-500/50 [color-scheme:dark] cursor-pointer"
                    >
                      <option value="">Selecciona un cliente...</option>
                      {CLIENTES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Asientos</span>
                  <span className="text-zinc-200 font-medium text-right max-w-[150px]">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Cantidad</span>
                  <span className="text-zinc-200 font-medium">{selected.length}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Precio unitario</span>
                  <span className="text-zinc-200 font-medium">${precio.toLocaleString('es-MX')}</span>
                </div>
                <div className="border-t border-zinc-800/60 pt-3 flex justify-between items-center">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-black text-lg text-red-400">${total.toLocaleString('es-MX')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={selected.length === 0 || (isStaff && !clienteId)}
                className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <Check className="w-4 h-4" />
                {isStaff ? 'Crear Reserva' : 'Continuar al pago'}
              </button>
              <p className="text-[11px] text-zinc-600 text-center mt-3">
                {selected.length === 0
                  ? 'Selecciona al menos un asiento para continuar.'
                  : isStaff && !clienteId
                  ? 'Selecciona el cliente para continuar.'
                  : `${selected.length} asiento${selected.length > 1 ? 's' : ''} seleccionado${selected.length > 1 ? 's' : ''}.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
