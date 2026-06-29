'use client';

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { BookingTimer } from '@/components/booking/BookingTimer';
import {
  ArrowLeft, Loader2, Clock, Building2, Film, Ticket, Check, User,
  AlertCircle, X, Search, Users, Loader,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { authService } from '@/services/auth.service';
import { functionsService } from '@/services/functions.service';
import { reservationsService } from '@/services/reservations.service';
import { usersApi } from '@/services/user.service';
import type { AsientoFuncion, ClienteBusqueda, Funcion } from '@/types';

const STAFF_ROLES = ['ADMIN', 'RECEPCIONISTA'];

// Minutos que dura el bloqueo temporal de los asientos en el carrito. Se alinea
// con la duración visible del BookingTimer (10 min).
const BLOCK_MINUTES = 10;
// Cada cuánto se refresca el mapa para reflejar lo que toman otros clientes.
const REFRESH_MS = 12000;

const SEAT_BASE =
  'w-7 h-7 sm:w-8 sm:h-8 rounded-t-lg text-[10px] font-semibold flex items-center justify-center transition-all duration-150';

type UISeatState = 'available' | 'selected' | 'occupied' | 'blocked' | 'maintenance';

// Estado visual de un asiento considerando el control de concurrencia: un asiento
// BLOQUEADO por otro usuario no se puede tomar, pero el propio (mismo id_usuario)
// sigue disponible para este usuario.
function seatUIState(
  seat: AsientoFuncion,
  selected: Set<number>,
  currentUserId: number | null,
): UISeatState {
  const estado = seat.estado?.toUpperCase();
  const tipo = seat.asiento?.tipo?.toUpperCase();

  if (selected.has(seat.id)) return 'selected';
  if (tipo === 'MANTENIMIENTO' || estado === 'MANTENIMIENTO' || estado === 'NO_DISPONIBLE') return 'maintenance';
  if (estado === 'OCUPADO' || estado === 'PENDIENTE_DE_PAGO') return 'occupied';
  if (estado === 'BLOQUEADO') {
    if (currentUserId != null && seat.id_usuario != null && Number(seat.id_usuario) === currentUserId) {
      return 'available';
    }
    return 'blocked';
  }
  return 'available';
}

function isSelectable(state: UISeatState) {
  return state === 'available' || state === 'selected';
}

// Lectura tolerante de la función: la API puede devolver `pelicula/cine/sala`
// (mock) o `peliculas/salas` (Prisma). Resolvemos ambos shapes.
function readFuncion(f: any) {
  return {
    titulo: f?.pelicula?.titulo ?? f?.peliculas?.titulo ?? 'Función',
    cine: f?.cine?.nombre ?? f?.salas?.cines?.nombre ?? null,
    direccion: f?.cine?.direccion ?? f?.salas?.cines?.direccion ?? null,
    sala: f?.sala?.nombre ?? f?.salas?.nombre ?? null,
    fechaHora: f?.fecha_hora as string | undefined,
    // El precio vive en la sala (Prisma): GET /funciones/:id no trae `precio`
    // a nivel de función, sino dentro de `salas`.
    precio: Number(f?.precio ?? f?.salas?.precio ?? f?.sala?.precio ?? 0),
    peliculaId: f?.pelicula?.id ?? f?.pelicula_id ?? f?.id_pelicula ?? null,
  };
}

export default function BookPage({ params }: { params: Promise<{ id: string; functionId: string }> }) {
  const { id, functionId } = use(params);
  const funcionId = Number(functionId);
  const router = useRouter();

  const [funcion, setFuncion] = useState<Funcion | null>(null);
  const [seats, setSeats] = useState<AsientoFuncion[]>([]);
  const [otherFunciones, setOtherFunciones] = useState<Funcion[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Asiento no disponible que el usuario intentó tomar → dispara modal informativo.
  const [blockedSeat, setBlockedSeat] = useState<AsientoFuncion | null>(null);
  // Conflicto de concurrencia (409) al bloquear o reservar.
  const [conflict, setConflict] = useState<string | null>(null);

  // Rol e identidad del usuario en sesión.
  const [isStaff, setIsStaff] = useState(false);
  const currentUserId = useMemo(() => authService.getCurrentUserId(), []);

  // --- Búsqueda de cliente (solo staff) ---
  const [clientQuery, setClientQuery] = useState('');
  const [clientResults, setClientResults] = useState<ClienteBusqueda[]>([]);
  const [searchingClients, setSearchingClients] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClienteBusqueda | null>(null);
  const clientBoxRef = useRef<HTMLDivElement>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // Carga del mapa de asientos. `silent` evita el spinner en los refrescos.
  const loadSeats = useCallback(
    async (silent = false) => {
      try {
        const data = await functionsService.getSeats(funcionId);
        setSeats(data);
        // Poda de la selección: si un asiento que tenía seleccionado ya lo tomó
        // otro cliente, lo quito y aviso (control de concurrencia en vivo).
        setSelected((prev) => {
          if (prev.length === 0) return prev;
          const byId = new Map(data.map((s) => [s.id, s]));
          const stillValid = prev.filter((sid) => {
            const seat = byId.get(sid);
            if (!seat) return false;
            const st = seatUIState(seat, new Set(), currentUserId);
            return st === 'available';
          });
          if (!silent && stillValid.length !== prev.length) {
            toast.warn('Algunos asientos seleccionados acaban de ser tomados por otro cliente.');
          }
          return stillValid.length === prev.length ? prev : stillValid;
        });
      } catch {
        if (!silent) toast.error('No se pudo cargar el mapa de asientos.');
      }
    },
    [funcionId, currentUserId],
  );

  useEffect(() => {
    // Solo ADMIN/RECEPCIONISTA reservan a nombre de un cliente; el resto reserva
    // a su propio nombre. Normalizamos el rol para evitar fallos por mayúsculas.
    const role = (authService.getCurrentUser()?.role ?? '').toString().trim().toUpperCase();
    setIsStaff(STAFF_ROLES.includes(role));

    let active = true;
    Promise.all([
      functionsService.getOne(funcionId),
      functionsService.getSeats(funcionId),
    ])
      .then(([fn, rawSeats]) => {
        if (!active) return;
        setFuncion(fn);
        setSeats(rawSeats);
        if (fn?.pelicula_id) {
          functionsService
            .getAll({ pelicula_id: fn.pelicula_id })
            .then((all) => { if (active) setOtherFunciones(all.filter((f) => f.estado === 'DISPONIBLE')); })
            .catch(() => {});
        }
      })
      .catch(() => { if (active) setFuncion(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [funcionId]);

  // Refresco periódico del mapa para reflejar la concurrencia.
  useEffect(() => {
    const t = setInterval(() => loadSeats(true), REFRESH_MS);
    return () => clearInterval(t);
  }, [loadSeats]);

  // Cierre del dropdown de clientes al hacer clic fuera.
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (clientBoxRef.current && !clientBoxRef.current.contains(e.target as Node)) {
        setClientDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Búsqueda de clientes con debounce (solo staff).
  useEffect(() => {
    if (!isStaff) return;
    if (selectedClient) return;
    const term = clientQuery.trim();
    let active = true;
    setSearchingClients(true);
    const t = setTimeout(async () => {
      try {
        const data = await usersApi.searchClients(term);
        if (active) setClientResults(data.slice(0, 8));
      } catch {
        if (active) setClientResults([]);
      } finally {
        if (active) setSearchingClients(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(t); };
  }, [clientQuery, isStaff, selectedClient]);

  const meta = funcion ? readFuncion(funcion) : null;
  const precio = meta?.precio ?? 0;
  const total = selected.length * precio;
  const backHref = isStaff ? '/admin/reservations' : `/movies/${id}`;

  const rows = useMemo(() => {
    const map = new Map<string, AsientoFuncion[]>();
    for (const s of seats) {
      const fila = s.asiento?.fila ?? '-';
      if (!map.has(fila)) map.set(fila, []);
      map.get(fila)!.push(s);
    }
    for (const list of map.values()) list.sort((a, b) => a.asiento.columna - b.asiento.columna);
    return Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }, [seats]);

  const selectedSeatLabels = useMemo(
    () =>
      seats
        .filter((s) => selectedSet.has(s.id))
        .map((s) => `${s.asiento.fila}${s.asiento.columna}`)
        .sort(),
    [seats, selectedSet],
  );

  function toggleSeat(seat: AsientoFuncion) {
    const state = seatUIState(seat, selectedSet, currentUserId);
    if (!isSelectable(state)) {
      setBlockedSeat(seat);
      return;
    }
    setSelected((prev) =>
      prev.includes(seat.id) ? prev.filter((s) => s !== seat.id) : [...prev, seat.id],
    );
  }

  function pickClient(c: ClienteBusqueda) {
    setSelectedClient(c);
    setClientQuery('');
    setClientResults([]);
    setClientDropdownOpen(false);
  }

  function clearClient() {
    setSelectedClient(null);
    setClientQuery('');
  }

  // Extrae el mensaje de error de la API (Nest devuelve { message }).
  function apiMessage(err: any, fallback: string) {
    const raw = err?.response?.data?.message;
    if (Array.isArray(raw)) return raw.join(', ');
    if (typeof raw === 'string') return raw;
    return fallback;
  }

  async function handleConfirm() {
    if (selected.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      // 1) Control de concurrencia: bloqueo en firme de los asientos antes de
      //    crear la reserva o avanzar al pago. Si otro cliente se adelantó, la
      //    API responde 409 y refrescamos el mapa.
      await functionsService.blockSeats(funcionId, selected, BLOCK_MINUTES);

      // 2) Reserva formal (cliente o staff). Si hay un cliente seleccionado
      //    (solo staff) se envía su id; de lo contrario el backend usa el id del
      //    usuario autenticado, dejando la reserva a su propio nombre.
      const res = await reservationsService.create({
        id_funcion: funcionId,
        asientosFuncionIds: selected,
        ...(isStaff && selectedClient ? { id_usuario_cliente: selectedClient.id } : {}),
      });

      // 3) Con la reserva ya creada, mostramos la página de pago/checkout
      //    llevando el código y el total. El cobro se gestiona en ese flujo.
      const query = new URLSearchParams({
        funcionId: String(funcionId),
        reservaId: String(res.reservaId),
        reservaCodigo: res.codigoTicket,
        asientos: selectedSeatLabels.join(','),
        asientosFuncionIds: selected.join(','),
        total: String(total),
      });
      router.push(`/checkout?${query.toString()}`);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setConflict(apiMessage(err, 'Uno o más asientos ya fueron tomados por otro cliente.'));
        await loadSeats(true);
      } else {
        toast.error(apiMessage(err, 'No se pudo procesar la reserva. Intenta de nuevo.'));
      }
    } finally {
      setSubmitting(false);
    }
  }

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
      <BookingTimer autoStart={selected.length > 0} redirectOnExpiry={`/movies/${id}`} />
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
              {meta?.titulo}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-zinc-400">
              {meta?.fechaHora && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  {format(parseISO(meta.fechaHora), "EEEE d 'de' MMMM, h:mm a", { locale: es })}
                </span>
              )}
              {meta?.cine && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  {meta.cine}
                </span>
              )}
              {meta?.sala && (
                <span className="px-2 py-0.5 bg-zinc-800/60 border border-zinc-700/30 rounded text-xs text-zinc-300">
                  {meta.sala}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

            {/* Mapa de asientos */}
            <div className="bg-zinc-900/90 rounded-2xl p-5 sm:p-8 border border-zinc-800/30">
              <div className="mb-8">
                <div className="h-2 bg-gradient-to-b from-zinc-500 to-transparent rounded-t-[50%] mx-auto max-w-md" />
                <p className="text-center text-[10px] uppercase tracking-[0.3em] text-zinc-500 mt-2 font-semibold">
                  Pantalla
                </p>
              </div>

              {rows.length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-500">
                  No hay asientos configurados para esta función.
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 overflow-x-auto pb-2">
                  {rows.map(([fila, fSeats]) => (
                    <div key={fila} className="flex items-center gap-1.5">
                      <span className="w-4 text-[10px] font-bold text-zinc-600 shrink-0">{fila}</span>
                      <div className="flex gap-1.5">
                        {fSeats.map((seat) => {
                          const state = seatUIState(seat, selectedSet, currentUserId);
                          let cls = '';
                          if (state === 'selected') {
                            cls = 'bg-red-600 text-white ring-2 ring-red-400/50 cursor-pointer';
                          } else if (state === 'available') {
                            cls = 'bg-zinc-700/60 text-zinc-300 hover:bg-zinc-600 cursor-pointer';
                          } else if (state === 'occupied') {
                            cls = 'bg-zinc-800/40 text-zinc-700 cursor-not-allowed';
                          } else if (state === 'blocked') {
                            cls = 'bg-amber-700/40 text-amber-500/70 cursor-not-allowed';
                          } else {
                            cls = 'bg-amber-900/30 text-amber-700/60 cursor-not-allowed';
                          }
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              onClick={() => toggleSeat(seat)}
                              title={`${fila}${seat.asiento.columna} — ${state}`}
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
              )}

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
                  <span className="w-3.5 h-3.5 rounded bg-amber-700/40" /> En otro carrito
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

              {/* Buscador de cliente (solo staff) */}
              {isStaff && (
                <div className="mb-4" ref={clientBoxRef}>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    Cliente
                    <span className="text-zinc-600 font-normal">(opcional)</span>
                  </label>

                  {selectedClient ? (
                    <div className="flex items-center justify-between gap-2 bg-zinc-800 border border-zinc-700/40 rounded-xl px-3 py-2">
                      <span className="min-w-0">
                        <span className="block text-sm text-zinc-100 truncate">{selectedClient.nombre}</span>
                        <span className="block text-[11px] text-zinc-500 truncate">{selectedClient.email}</span>
                      </span>
                      <button
                        type="button"
                        onClick={clearClient}
                        className="text-zinc-500 hover:text-zinc-200 transition-colors shrink-0"
                        aria-label="Quitar cliente"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                      <input
                        type="text"
                        value={clientQuery}
                        onChange={(e) => { setClientQuery(e.target.value); setClientDropdownOpen(true); }}
                        onFocus={() => setClientDropdownOpen(true)}
                        placeholder="Buscar por nombre o email..."
                        className="w-full bg-zinc-800 border border-zinc-700/40 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-red-500/50"
                      />
                      {clientDropdownOpen && (
                        <div className="absolute z-50 top-full mt-1.5 left-0 w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                          {searchingClients ? (
                            <div className="flex items-center gap-2 px-3 py-3 text-xs text-zinc-500">
                              <Loader className="w-3.5 h-3.5 animate-spin" /> Buscando...
                            </div>
                          ) : clientResults.length === 0 ? (
                            <div className="flex items-center gap-2 px-3 py-3 text-xs text-zinc-500">
                              <Users className="w-3.5 h-3.5" /> Sin clientes que coincidan.
                            </div>
                          ) : (
                            clientResults.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => pickClient(c)}
                                className="w-full text-left px-3 py-2 hover:bg-zinc-800 transition-colors"
                              >
                                <span className="block text-sm text-zinc-100 truncate">{c.nombre}</span>
                                <span className="block text-[11px] text-zinc-500 truncate">{c.email}</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-zinc-600 mt-1.5">
                    Sin cliente, la reserva queda a tu nombre.
                  </p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Asientos</span>
                  <span className="text-zinc-200 font-medium text-right max-w-[150px]">
                    {selectedSeatLabels.length > 0 ? selectedSeatLabels.join(', ') : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Cantidad</span>
                  <span className="text-zinc-200 font-medium">{selected.length}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Precio unitario</span>
                  <span className="text-zinc-200 font-medium">L{precio.toLocaleString('es-MX')}</span>
                </div>
                <div className="border-t border-zinc-800/60 pt-3 flex justify-between items-center">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-black text-lg text-red-400">L{total.toLocaleString('es-MX')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={selected.length === 0 || submitting}
                className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {submitting
                  ? 'Procesando...'
                  : isStaff ? 'Crear Reserva' : 'Continuar al pago'}
              </button>
              <p className="text-[11px] text-zinc-600 text-center mt-3">
                {selected.length === 0
                  ? 'Selecciona al menos un asiento para continuar.'
                  : `${selected.length} asiento${selected.length > 1 ? 's' : ''} seleccionado${selected.length > 1 ? 's' : ''}.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal — Asiento no disponible */}
      {blockedSeat && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setBlockedSeat(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setBlockedSeat(null)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-200 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Asiento no disponible</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  El asiento{' '}
                  <span className="font-semibold text-zinc-200">
                    {blockedSeat.asiento.fila}{blockedSeat.asiento.columna}
                  </span>{' '}
                  {blockedSeat.estado?.toUpperCase() === 'MANTENIMIENTO'
                    ? 'está en mantenimiento y no puede reservarse.'
                    : blockedSeat.estado?.toUpperCase() === 'BLOQUEADO'
                    ? 'está reservado temporalmente en el carrito de otro cliente.'
                    : 'ya está ocupado.'}{' '}
                  Por favor elige otro asiento disponible.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBlockedSeat(null)}
                className="w-full py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                ENTENDIDO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Conflicto de concurrencia (409) */}
      {conflict && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setConflict(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Asientos no disponibles</h3>
                <p className="text-sm text-zinc-400 mt-1">{conflict}</p>
                <p className="text-xs text-zinc-600 mt-2">
                  Actualizamos el mapa de asientos. Revisa tu selección e inténtalo de nuevo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConflict(null)}
                className="w-full py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                ENTENDIDO
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
