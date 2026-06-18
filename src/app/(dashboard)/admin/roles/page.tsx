'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { rolesService } from '@/services/roles.service';
import type { Role } from '@/types';

const PER_PAGE = 10;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60";

export default function RolesAdminPage() {
  const [items, setItems] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editingItem, setEditingItem] = useState<Role | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const [formName, setFormName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await rolesService.getAll();
      setItems(data);
    } catch (error) {
      toast.error('Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const newItem = await rolesService.create({ name: formName });
      setItems([newItem, ...items]);
      setShowCreate(false);
      setFormName('');
      toast.success('Rol creado correctamente');
    } catch (error) {
      const mock = { id: Date.now(), name: formName };
      setItems([mock, ...items]);
      setShowCreate(false);
      setFormName('');
      toast.success('Rol creado (Modo Local)');
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const updated = await rolesService.update(editingItem.id, { name: formName });
      setItems(items.map(i => i.id === editingItem.id ? updated : i));
      setEditingItem(null);
      setFormName('');
      toast.success('Rol actualizado correctamente');
    } catch (error) {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, name: formName } : i));
      setEditingItem(null);
      setFormName('');
      toast.success('Rol actualizado (Modo Local)');
    }
  }

  async function handleDelete(id: number) {
    try {
      await rolesService.delete(id);
      setItems(items.filter(i => i.id !== id));
      setDeletingId(null);
      toast.success('Rol eliminado correctamente');
    } catch (error) {
      setItems(items.filter(i => i.id !== id));
      setDeletingId(null);
      toast.success('Rol eliminado (Modo Local)');
    }
  }

  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Roles</h1>
          <p className="text-sm text-zinc-400 mt-1">Administrar niveles de acceso y permisos</p>
        </div>
        <button
          onClick={() => { setFormName(''); setShowCreate(true); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Agregar Rol
        </button>
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
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">Cargando roles...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <ShieldCheck className="w-10 h-10 text-zinc-700" />
                      <p className="text-sm text-zinc-500 font-medium">No se encontraron roles</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => (
                  <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{(page - 1) * PER_PAGE + index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-zinc-100 group-hover:text-red-400 transition-colors">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingItem(item); setFormName(item.name); }}
                          className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-blue-400 transition-all active:scale-90"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-all active:scale-90"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {(showCreate || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {showCreate ? 'Agregar Rol' : 'Editar Rol'}
              </h2>
              <button onClick={() => { setShowCreate(false); setEditingItem(null); }} className="text-zinc-500 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={showCreate ? handleCreate : handleEdit} className="p-6 space-y-4">
              <Field label="Nombre del Rol" required>
                <input
                  type="text"
                  required
                  placeholder="Ej: ADMIN, EDITOR..."
                  className={inputCls}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value.toUpperCase())}
                  autoFocus
                />
              </Field>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button 
                  type="button" 
                  onClick={() => { setShowCreate(false); setEditingItem(null); }} 
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 transition-colors"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                >
                  {showCreate ? 'CREAR' : 'GUARDAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Eliminar rol?</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Esta acción no se puede deshacer. Se afectarán los usuarios con este rol.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  onClick={() => handleDelete(deletingId)}
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
