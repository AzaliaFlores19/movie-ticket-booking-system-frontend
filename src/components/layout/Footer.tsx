import Link from 'next/link';
import { Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-[#121212] mt-16 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-tr from-red-700 to-red-500 rounded-lg flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-lg tracking-tight text-white">
                <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Movie</span> Booking
              </span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Encuentra horarios, reserva tus boletos cómodamente y disfruta de la mejor experiencia cinematográfica.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-3.5">Enlaces Rápidos</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Películas', href: '/' },
                { label: 'Mis Boletos', href: '/my-bookings' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-red-500 transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-3.5">Cuenta</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Iniciar Sesión', href: '/auth/login' },
                { label: 'Registrarse', href: '/auth/register' },
                { label: 'Olvidé mi Contraseña', href: '/auth/forgot-password' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-red-500 transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Barra inferior de derechos de autor */}
        <div className="mt-10 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600 font-medium">
            &copy; {new Date().getFullYear()} Movie Booking. Todos los derechos reservados.
          </p>
          <div className="flex gap-2 opacity-60">
            <span className="w-2 h-2 rounded-full bg-red-800 inline-block" />
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          </div>
        </div>
      </div>
    </footer>
  );
}