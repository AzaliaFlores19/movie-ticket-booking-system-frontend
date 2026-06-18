'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, CreditCard, X, ChevronDown, Check } from 'lucide-react';
import { MOCK_PAYMENTS } from '@/lib/mock-data';

const PER_PAGE = 10;

const STATUS_STYLES: Record<string, string> = {
  COMPLETADO:  'bg-green-600/20 text-green-400 border border-green-500/30',
  PENDIENTE:   'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30',
  FALLIDO:     'bg-red-600/20 text-red-400 border border-red-500/30',
  REEMBOLSADO: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
};

const METODOS = ['TARJETA', 'EFECTIVO', 'TRANSFERENCIA'];
const ESTADOS = ['COMPLETADO', 'PENDIENTE', 'FALLIDO', 'REEMBOLSADO'];

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-MX');
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
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 bg-zinc-900 border rounded-xl text-sm transition-colors ${
          open ? 'border-red-500/50 text-zinc-100' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100'
        }`}
      >
        <span className={value ? 'text-zinc-100' : ''}>{value || placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 min-w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-zinc-800 ${
              !value ? 'text-zinc-100' : 'text-zinc-400'
            }`}
          >
            {placeholder}
            {!value && <Check className="w-3.5 h-3.5 text-red-400" />}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-zinc-800 ${
                value === opt ? 'text-zinc-100' : 'text-zinc-400'
              }`}
            >
              {opt}
              {value === opt && <Check className="w-3.5 h-3.5 text-red-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PaymentsAdminPage() {
  const [search, setSearch]     = useState('');
  const [metodo, setMetodo]     = useState('');
  const [estado, setEstado]     = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [page, setPage]         = useState(1);

  const reset = () => {
    setSearch(''); setMetodo(''); setEstado('');
    setDateFrom(''); setDateTo(''); setPage(1);
  };

  const hasFilters = search || metodo || estado || dateFrom || dateTo;

  const filtered = MOCK_PAYMENTS.filter((p) => {
    if (search && !([p.referencia, p.metodo, p.estado, String(p.id), String(p.monto)]
      .some((v) => v?.toLowerCase().includes(search.toLowerCase())))) return false;
    if (metodo && p.metodo !== metodo) return false;
    if (estado && p.estado !== estado) return false;
    if (dateFrom && p.createdAt && p.createdAt < dateFrom) return false;
    if (dateTo   && p.createdAt && p.createdAt > dateTo)   return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pagos</h1>
          <p className="text-sm text-zinc-400 mt-1">Ver todas las transacciones de pago</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-800/60 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar pagos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-52"
            />
          </div>

          {/* Método */}
          <Dropdown
            value={metodo}
            placeholder="Todos los métodos"
            options={METODOS}
            onChange={(v) => { setMetodo(v); setPage(1); }}
          />

          {/* Estado */}
          <Dropdown
            value={estado}
            placeholder="Todos los estados"
            options={ESTADOS}
            onChange={(v) => { setEstado(v); setPage(1); }}
          />

          {/* Fecha desde */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500">Desde</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 focus:outline-none focus:border-red-500/50 [color-scheme:dark]"
            />
          </div>

          {/* Fecha hasta */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500">Hasta</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 focus:outline-none focus:border-red-500/50 [color-scheme:dark]"
            />
          </div>

          {/* Limpiar */}
          {hasFilters && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60">
                {['', 'ID', 'Monto', 'Método', 'Referencia', 'Estado', 'Fecha'].map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                paginated.map((payment) => (
                  <tr key={payment.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 text-red-400" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-100">#{payment.id}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-100">
                      ${payment.monto.toLocaleString('es-MX')}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{payment.metodo}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-zinc-300">{payment.referencia ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[payment.estado] ?? 'bg-zinc-700/40 text-zinc-400'}`}>
                        {payment.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{formatDate(payment.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
                active
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
