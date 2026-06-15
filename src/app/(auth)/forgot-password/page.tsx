'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Film, Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  // Estado para controlar errores visuales en la tarjeta
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Limpiar errores previos

    if (!email.trim()) { 
      const msg = 'Por favor, introduce tu correo electrónico';
      setFormError(msg);
      toast.error(msg); 
      return; 
    }

    // Validación estricta con arroba y formato correcto del lado del cliente
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const msg = 'Por favor, introduce un correo válido con arroba y dominio (ejemplo@dominio.com).';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      // Llamada directa a tu servicio de autenticación mock
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      // Si el servicio mock dice que el usuario no existe, manejamos la respuesta visualmente
      // Nota: Por seguridad en producción se suele dejar pasar, pero aquí lee tu mock perfectamente
      const errorMessage = err?.message || 'Ocurrió un inconveniente. Inténtalo de nuevo.';
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

        {/* Tarjeta con efecto Glassmorphism Oscuro (Fondo Negro Unificado) */}
        <div className="bg-[#121212]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {sent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Revisa tu correo</h2>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  Si ese correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña a la brevedad.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a Iniciar Sesión
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-white">¿Olvidaste tu contraseña?</h1>
                <p className="text-zinc-400 text-sm mt-1.5">
                  Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
                </p>
              </div>

              {/* Banner de alerta visual incrustado */}
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
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@ejemplo.com"
                      className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-red-900/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando enlace...</span>
                    </>
                  ) : (
                    'Enviar enlace de restablecimiento'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-zinc-800/60 pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-500 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a Iniciar Sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}