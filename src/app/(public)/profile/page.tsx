"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, Loader2, Eye, EyeOff, Edit2, ArrowLeft, Bell } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from 'react-toastify';
import { getMyProfile, updateProfile, toggleNotifications, changePassword } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import ProfileLayout from '@/components/layout/MainLayout';

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("Usuario");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); 
  const [role, setRole] = useState("CLIENTE");
  
  const [isEditing, setIsEditing] = useState(false);
  const [backupData, setBackupData] = useState({ name: "", email: "", phone: "" }); 

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [userId, setUserId] = useState<number | null>(null);

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return "U";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const { user } = await getMyProfile();
        setUserId(user.id);
        setName(user.nombre);
        setEmail(user.email);
        setPhone(user.telefono || "");
        setRole(user.roles?.nombre || "CLIENTE");

        setNotificationsEnabled(!!user.notificaciones_activas);

        setBackupData({ name: user.nombre, email: user.email, phone: user.telefono || "" });
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) return;
        toast.error("Error al cargar la configuración del perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleUpdateNotifications = async (nextState: boolean) => {
    if (!userId) return;
    if (nextState === notificationsEnabled) return;
    
    setNotificationsEnabled(nextState);
    setIsUpdatingNotifications(true);

    try {
      await toggleNotifications(userId);
      toast.success(nextState ? "Notificaciones activadas" : "Notificaciones desactivadas");
    } catch (error) {
      console.error("Error al actualizar las notificaciones:", error);
      setNotificationsEnabled(!nextState); 
      toast.error("No se pudieron guardar tus preferencias de avisos.");
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      setUpdating(true);

      await updateProfile(userId, { nombre: name, email, telefono: phone });

      setBackupData({ name, email, phone }); 
      setIsEditing(false); 
      toast.success("¡Perfil actualizado con éxito!");

      // RE-FETCH para asegurar que el estado local sea igual al del servidor
      const { user } = await getMyProfile();
      setName(user.nombre);
      setEmail(user.email);
      setPhone(user.telefono || "");

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar la configuración.";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setName(backupData.name);
    setEmail(backupData.email);
    setPhone(backupData.phone);
    setIsEditing(false);
  };

  const handleUpdatePassword = async () => {
    if (!userId) return;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W_]{8,}$/;

    if (!passwordRegex.test(passwords.newPass)) {
      toast.error("Debe tener al menos 8 caracteres, una mayúscula y un número.");
      return;
    }

    if (passwords.newPass !== passwords.confirm) {
      toast.error("Las nuevas contraseñas no coinciden.");
      return;
    }

    try {
      setUpdating(true);

      await changePassword(userId, { passwordActual: passwords.current, passwordNueva: passwords.newPass });

      toast.success("¡Contraseña cambiada con éxito!");
      setPasswords({ current: "", newPass: "", confirm: "" });
      setShowChangePassword(false);
    } catch (err: any) {
      // Intentar extraer mensaje específico del backend
      const msg = err.response?.data?.message || err.message || "Error al cambiar la contraseña.";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = () => {
    authService.logout();
    router.push("/");
    window.location.reload(); // Fuerza recarga para limpiar estado
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-zinc-100 transition-all disabled:bg-zinc-950 disabled:text-zinc-500 disabled:border-zinc-900 disabled:cursor-not-allowed";

  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex min-h-[70vh] items-center justify-center bg-[#0a0a0a]">
          <div className="text-center flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <p className="text-sm font-medium text-zinc-500">Cargando perfil...</p>
          </div>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-[#0a0a0a] text-zinc-100">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-950 border border-zinc-800/80 px-4 py-2 rounded-xl shadow-md"
            >
              <ArrowLeft size={14} className="text-red-500" />
              Volver al Inicio
            </button>
          </div>

          <div className="flex flex-col items-center justify-center pt-2 space-y-3">
            <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg text-2xl font-bold text-white relative group">
              <div className="absolute inset-0 rounded-full bg-red-600/10 blur-md opacity-70"></div>
              <span className="relative z-10 text-red-500 tracking-wider">{getInitials(name)}</span>
            </div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Configuración de cuenta</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="rounded-2xl border border-zinc-800/60 bg-zinc-950 p-6 lg:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Información Personal</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Actualiza tus datos de contacto básicos.</p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all"
                >
                  <Edit2 size={13} className="text-red-500" />
                  Editar
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-medium">Nombre completo</label>
                <input type="text" value={name} disabled={!isEditing} onChange={(e) => setName(e.target.value)} className={inputCls} />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-medium">Correo electrónico</label>
                <input type="email" value={email} disabled={!isEditing} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-medium">Teléfono</label>
                <input type="text" value={phone} disabled={!isEditing} onChange={(e) => setPhone(e.target.value)} placeholder="No asignado" className={inputCls} />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-medium">Rol del sistema</label>
                <div className="h-[42px] flex items-center">
                  <span className="px-3 py-1 rounded-md text-[10px] bg-red-600/10 text-red-400 border border-red-500/20 uppercase font-bold tracking-widest">
                    {role}
                  </span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 justify-end border-t border-zinc-900 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
                >
                  {updating && <Loader2 className="w-3 h-3 animate-spin" />}
                  Guardar Cambios
                </button>
              </div>
            )}
          </form>

          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950 p-6 lg:p-8 space-y-6 shadow-xl">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-lg font-bold text-white tracking-tight">Preferencias del Sistema</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Configura cómo interactúas con las alertas de cinema.</p>
            </div>

            <div className="flex items-center justify-between border border-zinc-900 rounded-xl p-4 bg-zinc-900/20 gap-4">
              <div className="flex items-center gap-3 text-sm text-zinc-200 font-medium">
                <Bell size={18} className={`${notificationsEnabled ? "text-red-500 animate-pulse" : "text-zinc-500"}`} />
                <div className="flex flex-col gap-0.5">
                  <span>Avisos de funciones y reservas</span>
                  <span className="text-[11px] text-zinc-500 font-normal">Recibe alertas sobre tus películas programadas.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isUpdatingNotifications && (
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                )}
                
                <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                  <button
                    type="button"
                    disabled={isUpdatingNotifications}
                    onClick={() => handleUpdateNotifications(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      notificationsEnabled 
                        ? 'bg-red-600 text-white shadow-md shadow-red-900/20' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    SÍ
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingNotifications}
                    onClick={() => handleUpdateNotifications(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      !notificationsEnabled 
                        ? 'bg-zinc-700 text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    NO
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950 p-6 lg:p-8 space-y-6 shadow-xl">
            <div className="border-b border-zinc-900 pb-4">
              <h2 className="text-lg font-bold text-white tracking-tight">Seguridad de Cuenta</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Protege tu cuenta administrando la clave de acceso.</p>
            </div>
            
            {!showChangePassword ? (
              <div className="flex items-center justify-between border border-zinc-900 rounded-xl p-4 bg-zinc-900/20">
                <div className="flex items-center gap-3 text-sm text-zinc-200 font-medium">
                  <KeyRound size={18} className="text-red-500" />
                  Contraseña de acceso
                </div>
                <button
                  type="button"
                  onClick={() => setShowChangePassword(true)}
                  className="px-4 py-2 rounded-xl text-xs bg-zinc-900 border border-zinc-800 font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  Cambiar contraseña
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="space-y-3">
                  <div className="relative w-full">
                    <input
                      type={showCurrent ? "text" : "password"}
                      placeholder="Contraseña actual"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className={inputCls}
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative w-full">
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="Nueva contraseña (mín. 8 caracteres, 1 mayúscula, 1 número)"
                      value={passwords.newPass}
                      onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                      className={inputCls}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative w-full">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirmar nueva contraseña"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className={inputCls}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 justify-end border-t border-zinc-900 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswords({ current: "", newPass: "", confirm: "" });
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdatePassword}
                    disabled={updating}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
                  >
                    {updating && <Loader2 className="w-3 h-3 animate-spin" />}
                    Actualizar Clave
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full sm:w-64 py-3 rounded-xl text-red-400/90 hover:text-red-400 border border-red-900/30 hover:border-red-600/50 bg-red-950/10 hover:bg-red-950/30 active:scale-[0.98] flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 shadow-lg shadow-red-950/20 hover:shadow-red-900/40"
            >
              <LogOut size={15} className="text-red-500 animate-pulse" />
              Cerrar Sesión Activa
            </button>
          </div>

        </div>
      </div>
    </ProfileLayout>
  );
}
