'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Film, Mail, Loader2, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para capturar y renderizar errores visuales directamente en la tarjeta
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Limpiar alertas previas en cada envío

    // 1. Validaciones minuciosas del lado del cliente
    if (!name.trim() || !email.trim() || !password.trim()) {
      const msg = 'Por favor, rellena todos los campos requeridos.';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    // Validación de formato de correo con Expresión Regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const msg = 'Por favor, introduce un correo electrónico válido (ejemplo@dominio.com).';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    // Validación de longitud mínima para la contraseña
    if (password.length < 6) {
      const msg = 'La contraseña debe tener al menos 6 caracteres.';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      // 2. Envío de datos al mock centralizado
      await authService.register(name, email, password);
      
      toast.success('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
      
      // Redirección controlada al login tras un microsegundo para que asimile la notificación
      setTimeout(() => {
        router.push('/login');
      }, 600);

    } catch (err: any) {
      // 3. Captura del error dinámico ("Este correo ya está registrado")
      const errorMessage = err?.message || 'Hubo un error al intentar crear la cuenta. Inténtalo de nuevo.';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-[#0a0a0a] text-zinc-100 px-4 relative overflow-hidden">
      {/* Efecto visual de fondo de sala de cine */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-zinc-900/40 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group transition-transform duration-300 hover:scale-105">
            <div className="w-11 h-11 bg-gradient-to-tr from-red-700 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-all">
              <Film className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Movie</span> Booking
            </span>
          </Link>
        </div>

        {/* Tarjeta Glassmorphic */}
        <div className="bg-[#121212]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">Crear cuenta</h1>
            <p className="text-zinc-400 text-sm mt-1.5">Únete para reservar tus boletos fácilmente.</p>
          </div>

          {/* Alerta interactiva del formulario */}
          {formError && (
            <div className="mb-4 flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-2 block uppercase tracking-wider">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-2 block uppercase tracking-wider">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@ejemplo.com"
                  className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-2 block uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-red-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> <span>Creando tu cuenta...</span>
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-zinc-800/60 pt-4">
            <p className="text-sm text-zinc-400">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-red-500 hover:text-red-400 font-semibold transition-colors">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}