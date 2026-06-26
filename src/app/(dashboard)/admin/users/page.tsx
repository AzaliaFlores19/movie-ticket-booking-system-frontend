'use client';

import { useState } from 'react';
import { Search, Plus, Pencil, Users, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { MOCK_USERS, MOCK_ROLES } from '@/lib/mock-data';
import type { User } from '@/types';

const PER_PAGE = 10;

type UserWithPassword = User & { password?: string };

const EMPTY_CREATE = { name: '', email: '', password: '', roleId: '' };
const EMPTY_EDIT   = { name: '', email: '', roleId: '' };

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

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

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserWithPassword[]>([...MOCK_USERS]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [activeIds, setActiveIds] = useState<Set<number>>(() => new Set(MOCK_USERS.map((u) => u.id)));

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [showCreatePwd, setShowCreatePwd] = useState(false);

  // Edit modal
  const [editingUser, setEditingUser] = useState<UserWithPassword | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);

  // Dropdown

  function toggleActive(id: number) {
    const wasActive = activeIds.has(id);
    setActiveIds((prev) => {
      const next = new Set(prev);
      wasActive ? next.delete(id) : next.add(id);
      return next;
    });
    toast.info(wasActive ? 'Usuario desactivado' : 'Usuario activado');
  }

  function openEdit(user: UserWithPassword) {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, roleId: String(user.roleId) });
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const role = MOCK_ROLES.find((r) => r.id === Number(createForm.roleId));
    const newUser: UserWithPassword = {
      id: Date.now(),
      name: createForm.name,
      email: createForm.email,
      password: createForm.password,
      roleId: Number(createForm.roleId),
      roleName: role?.name ?? '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [newUser, ...prev]);
    setActiveIds((prev) => new Set([...prev, newUser.id]));
    setShowCreate(false);
    setCreateForm(EMPTY_CREATE);
    setShowCreatePwd(false);
    toast.success('Usuario creado correctamente');
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    const role = MOCK_ROLES.find((r) => r.id === Number(editForm.roleId));
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? { ...u, name: editForm.name, email: editForm.email, roleId: Number(editForm.roleId), roleName: role?.name ?? u.roleName }
          : u
      )
    );
    setEditingUser(null);
    toast.success('Usuario actualizado correctamente');
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestionar cuentas de usuario</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Usuario
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 w-64"
            />
          </div>
          <span className="text-xs text-zinc-500">{filtered.length} usuario{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['Nombre', 'Email', 'Estado', 'Fecha de Registro', ''].map((col) => (
                <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Users className="w-10 h-10 text-zinc-700" />
                    <p className="text-sm text-zinc-500">No se encontraron usuarios</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs shrink-0">
                        {getInitial(user.name)}
                      </div>
                      <span className="font-medium text-zinc-100">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{user.email}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(user.id)} className="flex items-center gap-2">
                      <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${activeIds.has(user.id) ? 'bg-green-500' : 'bg-zinc-600'}`}>
                        <span className={`pointer-events-none inline-block h-4 w-4 m-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${activeIds.has(user.id) ? 'translate-x-4' : 'translate-x-0'}`} />
                      </span>
                      <span className={`text-xs font-medium ${activeIds.has(user.id) ? 'text-green-400' : 'text-zinc-500'}`}>
                        {activeIds.has(user.id) ? 'Activo' : 'Inactivo'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(user)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
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

      {/* Modal — Crear Usuario */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-lg font-semibold text-white">Agregar Usuario</h2>
              <button onClick={() => { setShowCreate(false); setCreateForm(EMPTY_CREATE); setShowCreatePwd(false); }} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="px-6 py-5 space-y-4">
              <Field label="Nombre" required>
                <input
                  type="text"
                  required
                  placeholder="Nombre completo"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  required
                  placeholder="correo@ejemplo.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Contraseña" required>
                <div className="relative">
                  <input
                    type={showCreatePwd ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className={`${inputCls} pr-10`}
                  />
                  <button type="button" onClick={() => setShowCreatePwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                    {showCreatePwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
              <Field label="Rol" required>
                <select
                  required
                  value={createForm.roleId}
                  onChange={(e) => setCreateForm({ ...createForm, roleId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Seleccionar rol</option>
                  {MOCK_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </Field>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setCreateForm(EMPTY_CREATE); setShowCreatePwd(false); }} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal — Editar Usuario */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">
                  {getInitial(editingUser.name)}
                </div>
                <h2 className="text-lg font-semibold text-white">Editar Usuario</h2>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
              <Field label="Nombre" required>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Rol" required>
                <select
                  required
                  value={editForm.roleId}
                  onChange={(e) => setEditForm({ ...editForm, roleId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Seleccionar rol</option>
                  {MOCK_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </Field>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
