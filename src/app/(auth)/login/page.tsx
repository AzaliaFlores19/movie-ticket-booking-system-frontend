'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Film, Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Nuevo estado para renderizar errores en la interfaz de forma visual
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Limpiar errores previos en cada intento
    
    if (!email || !password) { 
      const errorMsg = 'Por favor, rellena todos los campos';
      setFormError(errorMsg);
      toast.error(errorMsg); 
      return; 
    }
    
    setLoading(true);

    try {
      // 1. Ejecuta el inicio de sesión con tus Mocks
      await authService.login(email, password);
      
      toast.success('¡Bienvenido de nuevo!');
      
      // 2. Captura si venías redirigido de otra página o va a la raíz '/'
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/';
      
      // 3. FIX DE REDIRECCIÓN PARA ROUTE GROUPS:
      // window.location limpia por completo la memoria de renderizado estático de (auth), 
      // actualizando el Layout de la Home instantáneamente sin quedarse trabado.
      setTimeout(() => {
        window.location.href = redirect;
      }, 400); // Pequeña pausa para apreciar el Toast de éxito

    } catch (err: any) {
      // Evitamos romper la consola con excepciones completas y extraemos el texto limpio
      const errorMessage = err?.message || 'Contraseña o correo electrónico incorrectos';
      
      // Mostramos el error en ambos canales visuales
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-[#0a0a0a] text-zinc-100 px-4 relative overflow-hidden">
      {/* Luces de neón ambientales de fondo de cine */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-zinc-900/40 blur-[120px] pointer-events-none" />

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

        {/* Tarjeta con efecto Glassmorphism Oscuro */}
        <div className="bg-[#121212]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">Bienvenido de nuevo</h1>
            <p className="text-zinc-400 text-sm mt-1.5">Inicia sesión en tu cuenta para continuar</p>
          </div>

          {/* Banner de alerta visual incrustado en el formulario */}
          {formError && (
            <div className="mb-4 flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-2 block uppercase tracking-wider">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@ejemplo.com"
                  className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all duration-200"
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
                  className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all duration-200"
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

            <div className="flex justify-end pt-1">
              <Link href="/forgot-password" className="text-xs font-medium text-red-500 hover:text-red-400 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-red-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-zinc-800/60 pt-4">
            <p className="text-sm text-zinc-400">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-red-500 hover:text-red-400 font-semibold transition-colors">
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}