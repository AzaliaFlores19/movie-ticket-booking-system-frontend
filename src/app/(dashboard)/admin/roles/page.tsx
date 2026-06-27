'use client';

import { useState, useEffect } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { rolesService } from '@/services/roles.service';
import type { Role } from '@/types';

const PER_PAGE = 10;

export default function RolesAdminPage() {
  const [items, setItems] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await rolesService.getAll();
      setItems(data);
    } catch {
      toast.error('Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Roles</h1>
        <p className="text-sm text-zinc-400 mt-1">Niveles de acceso del sistema</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between flex-wrap gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar rol..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-full sm:w-64"
            />
          </div>
          <span className="text-xs text-zinc-500">{filtered.length} rol{filtered.length !== 1 ? 'es' : ''}</span>
        </div>

        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">#</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre del Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {loading ? (
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-zinc-500">Cargando roles...</td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={2}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <ShieldCheck className="w-10 h-10 text-zinc-700" />
                    <p className="text-sm text-zinc-500 font-medium">No se encontraron roles</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((item, index) => (
                <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{(page - 1) * PER_PAGE + index + 1}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-zinc-100">{item.name}</span>
                  </td>
                </tr>
              ))
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
    </div>
  );
}
