'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle, Film, Loader2, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '@/services/auth.service';

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = useMemo(() => params.get('token')?.trim() ?? '', [params]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!token) {
      toast.error('El enlace no incluye un token valido.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('La nueva contrasena debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      toast.success('Contrasena actualizada correctamente.');
      window.setTimeout(() => router.push('/login'), 1400);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar la contrasena.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dark min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-zinc-100 px-4 py-8 relative overflow-y-auto">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-950/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-950/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 rounded-2xl overflow-hidden border border-zinc-800/40 shadow-[0_24px_64px_rgba(0,0,0,0.7)] flex min-h-[560px]">
        <div className="hidden md:flex md:w-[44%] flex-col justify-between p-8 bg-[#0d0608] relative overflow-hidden">
          <div className="absolute top-0 left-3 w-10 h-full flex flex-col gap-1.5 py-3 opacity-[0.08]">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="w-3 h-2.5 bg-white rounded-sm mx-auto" />
            ))}
          </div>
          <div className="absolute top-0 right-3 w-10 h-full flex flex-col gap-1.5 py-3 opacity-[0.08]">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="w-3 h-2.5 bg-white rounded-sm mx-auto" />
            ))}
          </div>

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-red-700 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black tracking-tight text-white">
              <span className="text-red-500">Movie</span> Booking
            </span>
          </div>

          <div className="relative z-10 mx-auto my-auto w-48 h-64 rounded-lg border border-red-900/30 bg-red-950/10 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.22),transparent_58%)]" />
            <Lock className="w-16 h-16 text-red-500/35 relative z-10" />
          </div>

          <div className="relative z-10">
            <p className="text-[11.5px] leading-relaxed text-white/40 italic mb-3">
              Crea una nueva contrasena y vuelve a tu cuenta con seguridad.
            </p>
            <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-red-800/70">Movie Booking</p>
          </div>
        </div>

        <div className="flex-1 bg-[#111111] flex flex-col justify-center px-8 py-10 sm:px-10 border-l border-zinc-800/30">
          {success ? (
            <div className="text-center py-4 space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-1 shadow-inner">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Contrasena actualizada</h1>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-sm mx-auto">
                  Ya puedes iniciar sesion con tu nueva contrasena.
                </p>
              </div>
              <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 hover:text-red-400 transition-colors">
                Ir al login
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-red-500/65 hover:text-red-400 transition-colors mb-7 group">
                <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
                Volver al login
              </Link>

              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Restablecer contrasena</h1>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Ingresa una nueva contrasena para recuperar el acceso a tu cuenta.
                </p>
              </div>

              {!token && (
                <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Este enlace no contiene token. Solicita un nuevo correo de recuperacion.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordField label="Nueva contrasena" value={newPassword} onChange={setNewPassword} />
                <PasswordField label="Confirmar contrasena" value={confirmPassword} onChange={setConfirmPassword} />

                <button type="submit" disabled={loading || !token} className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-red-950/40 mt-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Actualizando...</span></> : 'Guardar nueva contrasena'}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-zinc-800/40 pt-5">
                <Link href="/forgot-password" className="text-xs text-red-500 hover:text-red-400 font-bold transition-colors">
                  Solicitar un nuevo enlace
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="text-[9px] font-bold text-zinc-500 mb-2 block uppercase tracking-[0.14em]">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
        <input type="password" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Minimo 8 caracteres" className="w-full bg-white/[0.03] border border-zinc-800/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-700 outline-none focus:border-red-600/50 focus:bg-red-950/[0.08] focus:ring-1 focus:ring-red-500/10 transition-all duration-200" required />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}