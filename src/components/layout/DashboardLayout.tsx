'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Building2, Film, CalendarClock, Ticket,
  CreditCard, Tag, FileText, MapPin, Monitor, Globe, Shield,
  Menu, ChevronLeft, LogOut, ChevronRight, BarChart3,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  RECEPCIONISTA: 'Recepcionista',
  CLIENTE: 'Cliente',
};

const NAV_ITEMS = [
  { label: 'Películas', href: '/admin/movies', icon: Film, roles: ['ADMIN'] },
  { label: 'Funciones', href: '/admin/functions', icon: CalendarClock, roles: ['ADMIN'] },
  { label: 'Cines', href: '/admin/cinemas', icon: Building2, roles: ['ADMIN'] },
  { label: 'Salas', href: '/admin/salas', icon: Monitor, roles: ['ADMIN'] },
  { label: 'Ciudades', href: '/admin/cities', icon: MapPin, roles: ['ADMIN'] },
  { label: 'Géneros', href: '/admin/genres', icon: Film, roles: ['ADMIN'] },
  { label: 'Idiomas', href: '/admin/languages', icon: Globe, roles: ['ADMIN'] },
  { label: 'Usuarios', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { label: 'Roles', href: '/admin/roles', icon: Shield, roles: ['ADMIN'] },
  { label: 'Reservaciones', href: '/admin/reservations', icon: Ticket, roles: ['ADMIN', 'RECEPCIONISTA'] },
  { label: 'Pagos y Reembolsos', href: '/admin/payments', icon: CreditCard, roles: ['ADMIN', 'RECEPCIONISTA'] },
  { label: 'Cupones', href: '/admin/coupons', icon: Tag, roles: ['ADMIN'] },
  { label: 'Políticas', href: '/admin/policies', icon: FileText, roles: ['ADMIN'] },
  { label: 'Reportes', href: '/admin/reports/reservations', icon: BarChart3, roles: ['ADMIN', 'RECEPCIONISTA'] },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) return null;

  if (!user) {
    window.location.href = '/login?redirect=' + encodeURIComponent(pathname);
    return null;
  }

  const filteredItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex">
      {/* Overlay Móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar Lateral */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-zinc-950 border-r border-zinc-800/60 transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-56' : 'w-16'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-zinc-800/60 shrink-0">
          {sidebarOpen ? (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center shadow-md shadow-red-900/30">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                <span className="text-red-500">Movie</span>Admin
              </span>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center shadow-md shadow-red-900/30">
                <Film className="w-4 h-4 text-white" />
              </div>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block p-1 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navegación del Panel */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 custom-scrollbar">
          <div className="space-y-1">
            {filteredItems.map((item) => {
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-900/20'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                  } ${!sidebarOpen ? 'justify-center' : ''}`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-100'}`} />
                  {sidebarOpen && <span className="text-[13px] tracking-wide">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sección de Usuario / Cuenta */}
        <div className="border-t border-zinc-800/60 p-3 shrink-0 bg-zinc-950/60">
          <div className={`flex items-center ${sidebarOpen ? 'gap-2.5' : 'justify-center'}`}>
            <div className="w-8 h-8 bg-red-600/10 text-red-400 rounded-full border border-red-500/20 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-200 truncate">{user?.name}</p>
                  <p className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase mt-0.5">{user?.role ? (ROLE_LABEL[user.role] ?? user.role) : ''}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-red-400 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-zinc-950 border-b border-zinc-800/60 flex items-center px-4 lg:px-6 gap-4 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
              {filteredItems.find((i) => i.href === '/admin' ? pathname === '/admin' : pathname === i.href || pathname.startsWith(i.href + '/'))?.label || 'Panel'}
            </h1>
          </div>

          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Film className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver Sitio Comercial</span>
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto bg-[#0a0a0a]">
          {children}
        </main>
      </div>
    </div>
  );
}