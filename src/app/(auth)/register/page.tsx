'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Film, Mail, Loader2, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      const msg = 'Por favor, rellena todos los campos requeridos.';
      toast.error(msg);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const msg = 'Por favor, introduce un correo electrónico válido (ejemplo@dominio.com).';
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'La contraseña debe tener al menos 6 caracteres.';
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      await authService.register(name, email, password);
      toast.success('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
      setTimeout(() => {
        router.push('/login');
      }, 600);
    } catch (err: any) {
      const errorMessage = err?.message || 'Hubo un error al intentar crear la cuenta. Inténtalo de nuevo.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-zinc-100 px-4 py-8 relative overflow-y-auto">

      {/* Glows ambientales — espejados respecto al login */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-950/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-950/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 rounded-2xl overflow-hidden border border-zinc-800/40 shadow-[0_24px_64px_rgba(0,0,0,0.7)] flex min-h-[600px]">

        {/* ── Panel del formulario (izquierda) ── */}
        <div className="flex-1 bg-[#111111] flex flex-col justify-center px-8 py-10 sm:px-10 border-r border-zinc-800/30">

          <Link
            href="/"
            className="inline-flex items-center gap-2.5 mb-8 group w-fit"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-red-700 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/30">
              <Film className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-black tracking-tight text-white">
              <span className="text-red-500">Movie</span> Booking
            </span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Crear cuenta</h1>
            <p className="text-xs text-zinc-500">Únete para reservar tus boletos fácilmente.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.14em]">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full bg-white/[0.03] border border-zinc-800/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-red-600/50 focus:bg-red-950/[0.08] focus:ring-1 focus:ring-red-500/10 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.14em]">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@ejemplo.com"
                  className="w-full bg-white/[0.03] border border-zinc-800/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-red-600/50 focus:bg-red-950/[0.08] focus:ring-1 focus:ring-red-500/10 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.14em]">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-zinc-800/80 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-red-600/50 focus:bg-red-950/[0.08] focus:ring-1 focus:ring-red-500/10 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[9px] text-zinc-600 mt-1.5 pl-1">Mínimo 6 caracteres.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-red-950/40 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando tu cuenta...</span>
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-zinc-800/40 pt-5">
            <p className="text-xs text-zinc-500">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-red-500 hover:text-red-400 font-bold transition-colors">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>

        {/* ── Panel decorativo derecha ── */}
        <div className="hidden md:flex md:w-[44%] flex-col justify-between p-8 bg-[#0d0608] relative overflow-hidden">

          {/* Film strips */}
          <div className="absolute top-0 left-3 w-10 h-full flex flex-col gap-1.5 py-3 opacity-[0.08]">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-3 h-2.5 bg-white rounded-sm mx-auto" />
            ))}
          </div>
          <div className="absolute top-0 right-3 w-10 h-full flex flex-col gap-1.5 py-3 opacity-[0.08]">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-3 h-2.5 bg-white rounded-sm mx-auto" />
            ))}
          </div>

          {/* Póster SVG abstracto */}
          <svg
            viewBox="0 0 220 260"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[200px] opacity-90 z-[1]"
          >
            <rect width="220" height="260" rx="6" fill="#1a0808" />
            <ellipse cx="110" cy="80"  rx="90" ry="75" fill="#3d0a0a" opacity="0.9" />
            <ellipse cx="60"  cy="160" rx="70" ry="60" fill="#1f0d1a" opacity="0.8" />
            <ellipse cx="170" cy="190" rx="65" ry="55" fill="#2a0a14" opacity="0.7" />
            <ellipse cx="110" cy="100" rx="50" ry="55" fill="#7f1d1d" opacity="0.35" />
            <ellipse cx="110" cy="90"  rx="28" ry="32" fill="#b91c1c" opacity="0.22" />
            <ellipse cx="110" cy="82"  rx="12" ry="14" fill="#ef4444" opacity="0.18" />
            <ellipse cx="110" cy="115" rx="18" ry="20" fill="#0d0305" opacity="0.95" />
            <path d="M88 170 Q95 138 110 135 Q125 138 132 170 L130 220 Q110 228 90 220 Z" fill="#0d0305" opacity="0.95" />
            <line x1="110" y1="0" x2="80"  y2="100" stroke="#ef4444" strokeWidth="0.5" opacity="0.12" />
            <line x1="110" y1="0" x2="110" y2="115" stroke="#ef4444" strokeWidth="0.8" opacity="0.15" />
            <line x1="110" y1="0" x2="140" y2="100" stroke="#ef4444" strokeWidth="0.5" opacity="0.12" />
            <line x1="110" y1="0" x2="55"  y2="130" stroke="#ef4444" strokeWidth="0.3" opacity="0.08" />
            <line x1="110" y1="0" x2="165" y2="130" stroke="#ef4444" strokeWidth="0.3" opacity="0.08" />
            {[40, 80, 120, 160, 200, 240].map(y => (
              <rect key={y} x="0" y={y} width="220" height="0.5" fill="#fff" opacity="0.03" />
            ))}
            <text x="110" y="248" textAnchor="middle" fontFamily="Georgia, serif" fontSize="7" fill="rgba(239,68,68,0.5)" letterSpacing="4">MOVIE BOOKING</text>
            <rect x="30" y="236" width="160" height="0.5" fill="rgba(239,68,68,0.2)" />
            {[[30,30],[190,55],[55,210],[175,230],[20,130],[200,150]].map(([cx,cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="0.8" fill="#fff" opacity="0.07" />
            ))}
            <rect width="220" height="260" rx="6" fill="none" stroke="rgba(185,28,28,0.25)" strokeWidth="1" />
          </svg>

          {/* Tagline arriba */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="h-px flex-1 bg-red-900/30" />
            <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-red-800/60">Tu próxima función</span>
            <div className="h-px flex-1 bg-red-900/30" />
          </div>

          {/* Quote abajo */}
          <div className="relative z-10">
            <p className="text-5xl leading-none text-red-900/50 font-serif mb-3">"</p>
            <p className="text-[11.5px] leading-relaxed text-white/40 italic mb-3">
              Cada película es un mundo nuevo esperando ser descubierto en la oscuridad de la sala.
            </p>
            <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-red-800/70">— François Truffaut</p>
          </div>
        </div>

      </div>
    </div>
  );
}