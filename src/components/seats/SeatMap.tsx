'use client';


import type { AsientoFuncion } from '@/types';

type SeatState = 'available' | 'reserved' | 'selected' | 'maintenance' | 'blocked';

type SeatMapProps = {
  seats: AsientoFuncion[];
  selectedIds?: Set<number>;
  onToggleSeat?: (seat: AsientoFuncion) => void;
  readOnly?: boolean;
  compact?: boolean;
};

function getSeatState(seat: AsientoFuncion, selectedIds: Set<number>): SeatState {
  const estado = seat.estado?.toUpperCase();
  const tipo = seat.asiento?.tipo?.toUpperCase();

  if (selectedIds.has(seat.id)) return 'selected';
  if (tipo === 'MANTENIMIENTO' || estado === 'MANTENIMIENTO') return 'maintenance';
  if (estado === 'BLOQUEADO') return 'blocked';
  if (estado === 'OCUPADO' || estado === 'RESERVADO') return 'reserved';

  return 'available';
}

function seatClass(state: SeatState, compact: boolean) {
  const size = compact ? 'h-5 w-5 text-[9px]' : 'h-7 w-7 sm:h-8 sm:w-8 text-[10px]';
  const base = `${size} flex items-center justify-center rounded-t-md border border-transparent font-medium transition-colors`;
  const classes: Record<SeatState, string> = {
    available: `${base} seat-available text-zinc-200`,
    reserved: `${base} seat-occupied text-zinc-200`,
    selected: `${base} seat-selected text-white`,
    maintenance: `${base} seat-maintenance text-zinc-500`,
    blocked: `${base} seat-blocked text-white`,
  };
  return classes[state];
}

export function SeatMap({ seats, selectedIds = new Set(), onToggleSeat, readOnly = false, compact = false }: SeatMapProps) {
  const rows = seats.reduce<Record<string, AsientoFuncion[]>>((acc, seat) => {
    const row = seat.asiento?.fila ?? '-';
    acc[row] = acc[row] ?? [];
    acc[row].push(seat);
    return acc;
  }, {});
  const sortedRows = Object.keys(rows).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return (
    <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
      <div className="py-4 text-center bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800/60">
        <div className="w-48 max-w-[70%] h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent mx-auto mb-1 rounded" />
        <p className="text-[10px] font-semibold tracking-[0.28em] text-zinc-500">PANTALLA</p>
      </div>
      <div className="p-4 overflow-x-auto scrollbar-hide flex justify-center">
        {sortedRows.length === 0 ? (
          <div className="py-10 text-center text-sm text-zinc-500">No hay asientos disponibles para mostrar</div>
        ) : (
          <div className="min-w-max space-y-1.5">
            {sortedRows.map((row) => {
              const rowSeats = [...rows[row]].sort((a, b) => a.asiento.columna - b.asiento.columna);
              return (
                <div key={row} className="flex items-center justify-center gap-1.5">
                  <span className="w-5 shrink-0 text-right font-mono text-xs text-zinc-500">{row}</span>
                  <div className="flex items-center gap-1">
                    {rowSeats.map((seat) => {
                      const state = getSeatState(seat, selectedIds);
                      const disabled = readOnly || state === 'reserved' || state === 'maintenance' || state === 'blocked';
                      return (
                        <button
                          key={seat.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => onToggleSeat?.(seat)}
                          className={seatClass(state, compact)}
                          title={`${seat.asiento.fila}${seat.asiento.columna} - ${state}`}
                        >
                          {state === 'selected' ? seat.asiento.columna : ''}
                        </button>
                      );
                    })}
                  </div>
                  <span className="w-5 shrink-0" aria-hidden />
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="border-t border-zinc-800/60 px-4 py-3 flex flex-wrap justify-center gap-4">
        {[
          ['Disponible', 'bg-zinc-700'],
          ['Seleccionado', 'bg-red-600'],
          ['Reservado', 'bg-zinc-500 opacity-60'],
          ['Bloqueado', 'bg-amber-600 opacity-70'],
        ].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`h-4 w-4 rounded-sm ${color}`} />
            <span className="text-xs text-zinc-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
