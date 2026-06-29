'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, CreditCard, RefreshCcw, X, ChevronDown, Check, Loader2 } from 'lucide-react';
import { reportsService } from '@/services/reports.service';
import { refundsService } from '@/services/refunds.service';
import { toast } from 'react-toastify';

const PER_PAGE = 10;

const STATUS_STYLES: Record<string, string> = {
  APROBADO: 'bg-green-600/20 text-green-400 border border-green-500/30',
  COMPLETADO: 'bg-green-600/20 text-green-400 border border-green-500/30',
  PENDIENTE: 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30',
  PENDIENTE_DE_PAGO: 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30',
  FALLIDO: 'bg-red-600/20 text-red-400 border border-red-500/30',
  REEMBOLSADO: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
  SOLICITADO: 'bg-purple-600/20 text-purple-300 border border-purple-500/30',
};

const TIPOS = ['PAGO', 'REEMBOLSO'];
const ESTADOS = ['APROBADO', 'PENDIENTE', 'FALLIDO', 'REEMBOLSADO', 'SOLICITADO'];

type HistoryRow = {
  id: string;
  tipo: 'PAGO' | 'REEMBOLSO';
  monto: number;
  metodo: string;
  referencia: string;
  estado: string;
  cliente: string;
  reserva: string;
  createdAt: string;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizePayment(raw: PaymentApiRow): HistoryRow {
  const id = String(raw.id ?? '');
  return {
    id: `pago-${id}`,
    tipo: 'PAGO',
    monto: toNumber(raw.monto_final ?? raw.monto),
    metodo: raw.metodo ?? '-',
    referencia: raw.referencia_externa ?? raw.referencia ?? '-',
    estado: raw.estado ?? '-',
    cliente: raw.reservas?.usuarios?.nombre ?? raw.reserva?.usuario?.name ?? '-',
    reserva: raw.reservas?.numero_reserva ?? raw.reserva?.codigo ?? '-',
    createdAt: raw.created_at ?? raw.createdAt ?? '',
  };
}

function normalizeRefund(raw: RefundApiRow): HistoryRow {
  const id = String(raw.id ?? '');
  return {
    id: `reembolso-${id}`,
    tipo: 'REEMBOLSO',
    monto: toNumber(raw.monto),
    metodo: 'EFECTIVO',
    referencia: raw.pago_id ? `Pago #${raw.pago_id}` : '-',
    estado: raw.estado ?? 'SOLICITADO',
    cliente: raw.pago?.reserva?.usuario?.name ?? '-',
    reserva: raw.pago?.reserva?.codigo ?? '-',
    createdAt: raw.created_at ?? raw.createdAt ?? '',
  };
}

function Dropdown({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex items-center gap-2 px-3 py-2 bg-zinc-900 border rounded-xl text-sm transition-colors ${
          open ? 'border-red-500/50 text-zinc-100' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100'
        }`}
      >
        <span className={value ? 'text-zinc-100' : ''}>{value || placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 min-w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
          <button type="button" onClick={() => { onChange(''); setOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-zinc-800 ${!value ? 'text-zinc-100' : 'text-zinc-400'}`}>
            {placeholder}
            {!value && <Check className="w-3.5 h-3.5 text-red-400" />}
          </button>
          {options.map((option) => (
            <button key={option} type="button" onClick={() => { onChange(option); setOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-zinc-800 ${value === option ? 'text-zinc-100' : 'text-zinc-400'}`}>
              {option}
              {value === option && <Check className="w-3.5 h-3.5 text-red-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PaymentsAdminPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [estado, setEstado] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setLoading(true);
    });

    Promise.all([
      reportsService.getPayments({
        fecha_inicio: dateFrom || undefined,
        fecha_fin: dateTo || undefined,
        estado: estado || undefined,
      }),
      refundsService.getAll(),
    ])
      .then(([paymentsReport, refunds]) => {
        if (!active) return;
        const paymentRows = (paymentsReport.detalle_pagos ?? []).map(normalizePayment);
        const refundRows = (refunds ?? []).map(normalizeRefund);
        setRows([...paymentRows, ...refundRows].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      })
      .catch((error) => {
        const message = error?.response?.data?.message ?? 'No se pudo cargar el historial de pagos y reembolsos.';
        toast.error(Array.isArray(message) ? message.join(', ') : message);
        if (active) setRows([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [dateFrom, dateTo, estado]);

  const reset = () => {
    setSearch(''); setTipo(''); setEstado('');
    setDateFrom(''); setDateTo(''); setPage(1);
  };

  const hasFilters = search || tipo || estado || dateFrom || dateTo;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (tipo && row.tipo !== tipo) return false;
      if (term && ![row.id, row.monto, row.metodo, row.estado, row.referencia, row.cliente, row.reserva]
        .some((value) => String(value).toLowerCase().includes(term))) return false;
      if (dateFrom && row.createdAt && row.createdAt.slice(0, 10) < dateFrom) return false;
      if (dateTo && row.createdAt && row.createdAt.slice(0, 10) > dateTo) return false;
      return true;
    });
  }, [rows, search, tipo, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pagos y Reembolsos</h1>
          <p className="text-sm text-zinc-400 mt-1">Ver historial financiero con filtros</p>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800/60 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar historial..."
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-52"
            />
          </div>

          <Dropdown value={tipo} placeholder="Todos los tipos" options={TIPOS} onChange={(value) => { setTipo(value); setPage(1); }} />
          <Dropdown value={estado} placeholder="Todos los estados" options={ESTADOS} onChange={(value) => { setEstado(value); setPage(1); }} />

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500">Desde</span>
            <input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 focus:outline-none focus:border-red-500/50 [color-scheme:dark]" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500">Hasta</span>
            <input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 focus:outline-none focus:border-red-500/50 [color-scheme:dark]" />
          </div>

          {hasFilters && (
            <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800 transition-colors">
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}

          <span className="ml-auto text-xs text-zinc-500">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60">
                {['', 'Tipo', 'ID', 'Reserva', 'Cliente', 'Monto', 'Metodo', 'Referencia', 'Estado', 'Fecha'].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-zinc-500"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Cargando historial...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-zinc-500">Sin resultados</td></tr>
              ) : paginated.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
                      {row.tipo === 'PAGO' ? <CreditCard className="w-4 h-4 text-red-400" /> : <RefreshCcw className="w-4 h-4 text-red-400" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{row.tipo}</td>
                  <td className="px-4 py-3 font-medium text-zinc-100">#{row.id.replace('pago-', '').replace('reembolso-', '')}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.reserva}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.cliente}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-100">L {row.monto.toFixed(2)}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.metodo}</td>
                  <td className="px-4 py-3"><span className="font-mono text-xs text-zinc-300">{row.referencia}</span></td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[row.estado] ?? 'bg-zinc-700/40 text-zinc-400'}`}>{row.estado}</span></td>
                  <td className="px-4 py-3 text-zinc-400">{formatDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-zinc-800/60">
          {[
            { label: '<<', target: 1 },
            { label: '<', target: page - 1 },
            { label: String(page), target: page, active: true },
            { label: '>', target: page + 1 },
            { label: '>>', target: totalPages },
          ].map(({ label, target, active }) => (
            <button
              key={label}
              onClick={() => setPage(Math.max(1, Math.min(totalPages, target)))}
              disabled={target < 1 || target > totalPages || target === page}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}