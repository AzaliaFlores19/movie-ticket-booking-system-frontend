'use client';

import Link from 'next/link';
import { authService } from '@/services/auth.service';
import {
  Film, Menu, X, Ticket, User, LogOut,
  ChevronDown, CalendarClock, Building2,
  LayoutDashboard,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

const NAV_LINKS = [
  { label: 'Películas', href: '/', icon: Film },
  { label: 'Funciones', href: '/functions', icon: CalendarClock },
  { label: 'Mis Boletos', href: '/my-bookings', icon: Ticket },
];

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    toast.success('Sesión cerrada correctamente');
    router.push('/');
    setUserMenuOpen(false);
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-900 shadow-lg'
          : 'bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 bg-gradient-to-tr from-red-700 to-red-500 rounded-lg flex items-center justify-center shadow-md shadow-red-500/10 transition-colors">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-white">
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Movie</span> Booking
            </span>
          </Link>

          {/* Enlaces Principales Escritorio */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-red-600/10 text-red-400 border border-red-500/10'
                    : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#121212] border border-transparent hover:border-zinc-800 transition-all"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:block text-sm font-semibold max-w-[100px] truncate text-zinc-200">
                    {user.name}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown de Menú Oscuro Premium */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1">
                    <div className="px-3.5 py-2.5 border-b border-zinc-800/60 mb-1.5">
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-600/10 text-red-400 border border-red-500/10">
                        {user.role || 'Cliente'}
                      </span>
                    </div>

                    {/* NUEVO: Enlace de Perfil Directo (Editable y Accesible) */}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-300 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 text-red-500" />
                      <span>Mi Perfil</span>
                    </Link>

                    {[
                      { label: 'Mis Boletos', href: '/my-bookings', icon: Ticket },
                      { label: 'Funciones', href: '/functions', icon: CalendarClock },
                    ].map(({ label, href, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-300 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Icon className="w-4 h-4 text-red-500" />
                        {label}
                      </Link>
                    ))}

                    {/* Lógica de Administración (Solo Dashboard Limpio) */}
                    {(user.role === 'ADMIN' || user.role === 'SECRETARIO') && (
                      <>
                        <div className="my-1.5 border-t border-zinc-800" />
                        <Link 
                          href="/admin" 
                          className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-300 hover:bg-[#1a1a1a] hover:text-white transition-colors" 
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-red-500" />
                          <span>Dashboard</span>
                        </Link>
                      </>
                    )}
                    
                    <div className="my-1.5 border-t border-zinc-800" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/5 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login" className="px-3 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-900/10 transition-all active:scale-95">
                  Registrarse
                </Link>
              </div>
            )}

            <button
              className="lg:hidden p-2 rounded-xl hover:bg-[#121212] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navegación Móvil */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-zinc-900 bg-[#0a0a0a] pb-4 pt-2 space-y-1 px-2 animate-in fade-in duration-200">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-red-600/10 text-red-400'
                  : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          
          {user && (
            <>
              <div className="my-1.5 border-t border-zinc-900" />
              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-[#121212]"
                onClick={() => setMobileOpen(false)}
              >
                <User className="w-4 h-4 text-red-500" />
                <span>Mi Perfil</span>
              </Link>
              {(user.role === 'ADMIN' || user.role === 'SECRETARIO') && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-[#121212]"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4 text-red-500" />
                  <span>Dashboard</span>
                </Link>
              )}
            </>
          )}

          {!user && (
            <div className="pt-3 flex gap-2">
              <Link href="/login" className="flex-1 text-center py-2.5 border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-300 hover:bg-[#121212] transition-colors" onClick={() => setMobileOpen(false)}>
                Iniciar Sesión
              </Link>
              <Link href="/register" className="flex-1 text-center py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors" onClick={() => setMobileOpen(false)}>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}

      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </nav>
  );
}