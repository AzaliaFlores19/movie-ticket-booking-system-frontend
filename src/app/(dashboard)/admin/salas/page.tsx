'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, X, Monitor, AlertTriangle, Armchair, Loader2, Wrench } from 'lucide-react';
import { toast } from 'react-toastify';
import { salasService, type SalaSeat, type SeatPhysicalStatus } from '@/services/salas.service';
import { getCines } from '@/services/cinemas.service';
import type { Sala, Cine } from '@/types';

const PER_PAGE = 10;

const EMPTY_FORM = { nombre: '', id_cine: '', filas: '', columnas: '', precio: '' };
type FormState = typeof EMPTY_FORM;
type SeatStatusDraft = Record<number, SeatPhysicalStatus>;

const inputCls =
  'w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60';

function toFormValues(sala: Sala): FormState {
  return {
    nombre: sala.nombre ?? '',
    id_cine: String(sala.id_cine ?? ''),
    filas: String(sala.filas ?? ''),
    columnas: String(sala.columnas ?? ''),
    precio: String(sala.precio ?? ''),
  };
}

function getApiMessage(error: unknown, fallback: string) {
  const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
  const message = response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || fallback;
}

function normalizeSeatStatus(status?: string): SeatPhysicalStatus {
  return status === 'MANTENIMIENTO' ? 'MANTENIMIENTO' : 'ESTANDAR';
}

function seatStatusLabel(status?: string) {
  return normalizeSeatStatus(status) === 'MANTENIMIENTO' ? 'Mantenimiento' : 'Disponible';
}

function groupSeatsByRow(seats: SalaSeat[]) {
  const rows = new Map<string, SalaSeat[]>();
  seats.forEach((seat) => {
    const rowSeats = rows.get(seat.fila) ?? [];
    rowSeats.push(seat);
    rows.set(seat.fila, rowSeats);
  });

  return Array.from(rows.entries())
    .sort(([rowA], [rowB]) => rowA.localeCompare(rowB, 'es', { numeric: true }))
    .map(([row, rowSeats]) => ({
      row,
      seats: rowSeats.sort((a, b) => a.columna - b.columna),
    }));
}

function SeatStatusPanel({
  seats,
  loading,
  disabled,
  pendingSeatStatuses,
  onToggle,
}: {
  seats: SalaSeat[];
  loading: boolean;
  disabled: boolean;
  pendingSeatStatuses: SeatStatusDraft;
  onToggle: (seat: SalaSeat, nextStatus: SeatPhysicalStatus) => void;
}) {
  const groupedRows = groupSeatsByRow(seats);
  const pendingCount = Object.keys(pendingSeatStatuses).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-700/70 bg-zinc-950/70 shadow-inner shadow-black/20">
      <div className="flex items-start justify-between gap-3 border-b border-zinc-800/70 px-4 py-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-zinc-50">Estado de asientos</h3>
          <p className="text-xs leading-relaxed text-zinc-400">Selecciona asientos para cambiar su estado. Los cambios se aplican al guardar el modal.</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
          <Armchair className="h-4 w-4 text-red-300" />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando asientos...
        </div>
      ) : seats.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-zinc-500">No hay asientos registrados para esta sala.</p>
      ) : (
        <div className="space-y-5 px-4 py-5">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5">
              <span className="h-3 w-3 rounded-sm border border-emerald-300/70 bg-emerald-500/20" />
              Disponible
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5">
              <span className="h-3 w-3 rounded-sm border border-amber-300/70 bg-amber-500/20" />
              Mantenimiento
            </span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-red-200">
                {pendingCount} cambio{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-auto rounded-2xl border border-zinc-800/70 bg-black/20 px-3 py-5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="mx-auto inline-flex min-w-full flex-col items-center gap-5">
              <div className="flex w-72 flex-col items-center gap-1 sm:w-96">
                <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-transparent via-red-400/70 to-transparent shadow-[0_0_18px_rgba(248,113,113,0.35)]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500">Pantalla</span>
              </div>

              <div className="inline-flex flex-col items-center gap-2">
                {groupedRows.map(({ row, seats: rowSeats }) => (
                  <div key={row} className="flex min-w-max items-center gap-3">
                    <span className="flex h-9 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-xs font-semibold text-zinc-500">{row}</span>
                    <div className="flex gap-2">
                      {rowSeats.map((seat) => {
                        const effectiveStatus = pendingSeatStatuses[seat.id] ?? normalizeSeatStatus(seat.estadoFisico);
                        const isMaintenance = effectiveStatus === 'MANTENIMIENTO';
                        const nextStatus: SeatPhysicalStatus = isMaintenance ? 'ESTANDAR' : 'MANTENIMIENTO';
                        const isPending = pendingSeatStatuses[seat.id] != null;

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            title={`${seat.codigo}: ${seatStatusLabel(effectiveStatus)}${isPending ? ' (pendiente)' : ''}`}
                            disabled={disabled}
                            onClick={() => onToggle(seat, nextStatus)}
                            className={`relative flex h-12 w-12 items-center justify-center rounded-xl border text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 ${
                              isMaintenance
                                ? 'border-amber-300/70 bg-amber-500/15 text-amber-100 shadow-amber-950/30 hover:bg-amber-500/25'
                                : 'border-emerald-300/70 bg-emerald-500/15 text-emerald-100 shadow-emerald-950/30 hover:bg-emerald-500/25'
                            } ${isPending ? 'ring-2 ring-red-400/70 ring-offset-2 ring-offset-black/30' : ''}`}
                          >
                            {isPending && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]" />}
                            <span className="inline-flex items-center gap-1">
                              {seat.codigo}
                              {isMaintenance && <Wrench className="h-3 w-3" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-[11px] text-zinc-500">Click en un asiento para alternar su estado físico.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SeatPreview({ filas, columnas }: { filas: number; columnas: number }) {
  if (!filas || !columnas || filas > 26 || columnas > 30) return null;
  const rows = Array.from({ length: filas }, (_, i) => String.fromCharCode(65 + i));
  const cols = Array.from({ length: columnas }, (_, i) => i + 1);
  return (
    <div className="mt-3 p-3 bg-zinc-800/50 border border-zinc-700/60 rounded-xl space-y-2">
      <p className="text-xs text-zinc-500 text-center mb-2">Vista previa de distribución</p>
      <div className="flex flex-col items-center gap-1 overflow-x-auto">
        {rows.map((fila) => (
          <div key={fila} className="flex items-center gap-1">
            <span className="text-[9px] text-zinc-600 w-3 shrink-0">{fila}</span>
            {cols.map((col) => (
              <div
                key={col}
                className="w-3 h-3 rounded-sm bg-zinc-600 border border-zinc-500/50"
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-zinc-700/40">
        <div className="h-0.5 w-8 bg-zinc-500 rounded" />
        <span className="text-[9px] text-zinc-500">PANTALLA</span>
        <div className="h-0.5 w-8 bg-zinc-500 rounded" />
      </div>
    </div>
  );
}

export default function SalasAdminPage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [cines, setCines] = useState<Cine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [dimWarning, setDimWarning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seatMap, setSeatMap] = useState<SalaSeat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [pendingSeatStatuses, setPendingSeatStatuses] = useState<SeatStatusDraft>({});

  useEffect(() => {
    let active = true;
    Promise.all([salasService.getAll(), getCines()])
      .then(([s, c]) => {
        if (!active) return;
        setSalas(s);
        setCines(c as Cine[]);
      })
      .catch(() => toast.error('Error al cargar datos'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function loadSeatMap(salaId: number) {
    setLoadingSeats(true);
    try {
      const seats = await salasService.getSeats(salaId);
      setSeatMap(seats);
    } catch {
      setSeatMap([]);
      toast.error('No se pudieron cargar los asientos de la sala');
    } finally {
      setLoadingSeats(false);
    }
  }

  function closeEditModal() {
    setEditingSala(null);
    setSeatMap([]);
    setPendingSeatStatuses({});
  }

  function openEdit(sala: Sala) {
    setEditingSala(sala);
    setEditForm(toFormValues(sala));
    setDimWarning(false);
    setPendingSeatStatuses({});
    void loadSeatMap(sala.id);
  }

  function handleDelete(sala: Sala) {
    setDeletingSala(sala);
  }

  async function confirmDelete() {
    if (!deletingSala) return;
    try {
      await salasService.remove(deletingSala.id);
      toast.success('Sala eliminada correctamente');
      setDeletingSala(null);
      setSalas((prev) => prev.filter((s) => s.id !== deletingSala.id));
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(typeof msg === 'string' && msg.includes('funciones')
        ? 'No se puede eliminar la sala porque tiene funciones programadas.'
        : 'Error al eliminar la sala');
    }
  }

  function handleEditChange(field: 'filas' | 'columnas', value: string) {
    if (!editingSala) return;
    const original = toFormValues(editingSala);
    const newForm = { ...editForm, [field]: value };
    const changed =
      newForm.filas !== original.filas || newForm.columnas !== original.columnas;
    setDimWarning(changed);
    setEditForm(newForm);
  }

  function handleSeatStatusToggle(seat: SalaSeat, nextStatus: SeatPhysicalStatus) {
    const originalStatus = normalizeSeatStatus(seat.estadoFisico);
    setPendingSeatStatuses((prev) => {
      const next = { ...prev };
      if (nextStatus === originalStatus) {
        delete next[seat.id];
      } else {
        next[seat.id] = nextStatus;
      }
      return next;
    });
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await salasService.create({
        nombre: createForm.nombre,
        id_cine: Number(createForm.id_cine),
        filas: Number(createForm.filas),
        columnas: Number(createForm.columnas),
        precio: Number(createForm.precio),
      });
      const cine = cines.find((c) => c.id === Number(createForm.id_cine));
      setSalas((prev) => [{ ...created, cines: cine ? { id: cine.id, nombre: cine.nombre, direccion: cine.direccion } : undefined }, ...prev]);
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      toast.success('Sala creada correctamente');
    } catch (err) {
      toast.error(getApiMessage(err, 'Error al crear la sala'));
    } finally {
      setCreating(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSala) return;
    setSaving(true);
    try {
      const seatStatusEntries = Object.entries(pendingSeatStatuses);
      const updated = await salasService.update(editingSala.id, {
        nombre: editForm.nombre,
        id_cine: Number(editForm.id_cine),
        filas: Number(editForm.filas),
        columnas: Number(editForm.columnas),
        precio: Number(editForm.precio),
      });
      if (seatStatusEntries.length > 0) {
        await Promise.all(
          seatStatusEntries.map(([seatId, status]) =>
            salasService.updateSeatStatus(editingSala.id, Number(seatId), status)
          )
        );
      }
      const cine = cines.find((c) => c.id === Number(editForm.id_cine));
      setSalas((prev) =>
        prev.map((s) =>
          s.id === editingSala.id
            ? { ...updated, cines: cine ? { id: cine.id, nombre: cine.nombre, direccion: cine.direccion } : s.cines }
            : s
        )
      );
      closeEditModal();
      toast.success(seatStatusEntries.length > 0 ? 'Sala y asientos actualizados correctamente' : 'Sala actualizada correctamente');
    } catch (err) {
      const msg = getApiMessage(err, 'Error al actualizar la sala');
      const isActiveFunctions = typeof msg === 'string' && msg.includes('funciones programadas');
      toast.error(isActiveFunctions
        ? 'No se pueden cambiar las dimensiones: la sala tiene funciones programadas activas.'
        : msg
      );
    } finally {
      setSaving(false);
    }
  }

  const filtered = salas.filter(
    (s) =>
      s.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (s.cines?.nombre ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const globalOffset = (page - 1) * PER_PAGE;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Salas</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestionar salas de cine</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Sala
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar salas..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-64"
            />
          </div>
          <span className="text-xs text-zinc-500">{filtered.length} sala{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['#', 'Sala', 'Cine', 'Filas', 'Columnas', 'Total asientos', 'Precio', ''].map((col) => (
                <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">Cargando salas...</td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Monitor className="w-10 h-10 text-zinc-700" />
                    <p className="text-sm text-zinc-500">No se encontraron salas</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((sala, idx) => {
                const total = (sala.filas ?? 0) * (sala.columnas ?? 0);
                return (
                  <tr key={sala.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3 text-zinc-500 text-xs w-10">{globalOffset + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center shrink-0">
                          <Monitor className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="font-medium text-zinc-100">{sala.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{sala.cines?.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{sala.filas ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{sala.columnas ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-zinc-100 font-medium">{total > 0 ? total : '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {sala.precio != null ? `L${sala.precio.toLocaleString('es-MX')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(sala)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sala)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-900/50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-zinc-800/60">
            {[
              { label: '«', target: 1 },
              { label: '‹', target: page - 1 },
              { label: String(page), target: page, active: true },
              { label: '›', target: page + 1 },
              { label: '»', target: totalPages },
            ].map(({ label, target, active }) => (
              <button
                key={label}
                onClick={() => setPage(Math.max(1, Math.min(totalPages, target)))}
                disabled={target < 1 || target > totalPages || target === page}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  active ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal — Agregar Sala */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-lg font-semibold text-white">Agregar Sala</h2>
              <button onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input type="text" required maxLength={50} placeholder="Ej. Sala 1, Sala VIP"
                  value={createForm.nombre} onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Cine <span className="text-red-500">*</span></label>
                <select required value={createForm.id_cine} onChange={(e) => setCreateForm({ ...createForm, id_cine: e.target.value })} className={inputCls}>
                  <option value="">Seleccionar cine</option>
                  {cines.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Filas <span className="text-red-500">*</span></label>
                  <input type="number" required min={1} max={26} placeholder="Ej. 10"
                    value={createForm.filas} onChange={(e) => setCreateForm({ ...createForm, filas: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Columnas <span className="text-red-500">*</span></label>
                  <input type="number" required min={1} max={30} placeholder="Ej. 15"
                    value={createForm.columnas} onChange={(e) => setCreateForm({ ...createForm, columnas: e.target.value })}
                    className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Precio por asiento (L) <span className="text-red-500">*</span></label>
                <input type="number" required min={0} placeholder="Ej. 150"
                  value={createForm.precio} onChange={(e) => setCreateForm({ ...createForm, precio: e.target.value })}
                  className={inputCls} />
              </div>
              {createForm.filas && createForm.columnas && (
                <>
                  <p className="text-xs text-zinc-500">
                    Total de asientos: <span className="text-zinc-300 font-medium">{Number(createForm.filas) * Number(createForm.columnas)}</span>
                  </p>
                  <SeatPreview filas={Number(createForm.filas)} columnas={Number(createForm.columnas)} />
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={creating}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                  {creating ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal — Editar Sala */}
      {editingSala && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Editar Sala</h2>
              </div>
              <button onClick={closeEditModal} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input type="text" required maxLength={50}
                  value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Cine <span className="text-red-500">*</span></label>
                <select required value={editForm.id_cine} onChange={(e) => setEditForm({ ...editForm, id_cine: e.target.value })} className={inputCls}>
                  <option value="">Seleccionar cine</option>
                  {cines.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Filas <span className="text-red-500">*</span></label>
                  <input type="number" required min={1} max={26}
                    value={editForm.filas} onChange={(e) => handleEditChange('filas', e.target.value)}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Columnas <span className="text-red-500">*</span></label>
                  <input type="number" required min={1} max={30}
                    value={editForm.columnas} onChange={(e) => handleEditChange('columnas', e.target.value)}
                    className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Precio por asiento (L)</label>
                <input type="number" min={0}
                  value={editForm.precio} onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
                  className={inputCls} />
              </div>
              {editForm.filas && editForm.columnas && (
                <>
                  <p className="text-xs text-zinc-500">
                    Total de asientos: <span className="text-zinc-300 font-medium">{Number(editForm.filas) * Number(editForm.columnas)}</span>
                  </p>
                  <SeatPreview filas={Number(editForm.filas)} columnas={Number(editForm.columnas)} />
                </>
              )}
              {dimWarning && (
                <div className="flex gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-amber-400 text-xs leading-snug">
                    Cambiar las dimensiones eliminará y recreará todos los asientos. No se puede realizar si la sala ya tiene funciones programadas.
                  </span>
                </div>
              )}
              <SeatStatusPanel
                seats={seatMap}
                loading={loadingSeats}
                disabled={saving}
                pendingSeatStatuses={pendingSeatStatuses}
                onToggle={handleSeatStatusToggle}
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeEditModal}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal — Confirmar Eliminación */}
      {deletingSala && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Eliminar sala?</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Esta acción no se puede deshacer. ¿Deseas eliminar la sala "{deletingSala.nombre}"?
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setDeletingSala(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                >
                  SÍ, ELIMINAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
