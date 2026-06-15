import MainLayout from '@/components/layout/MainLayout';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarClock, Film, Building2, Clock, MapPin, ChevronRight, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { functionsService } from '@/services/functions.service';

interface Funcion {
  id: number;
  fecha_hora: string;
  estado: string;
  sala?: { id: number; nombre: string };
  pelicula?: { id: number; titulo: string; poster_url?: string };
  cine?: { id: number; nombre: string; ciudad?: { nombre: string } };
}

function getDateLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Hoy';
  if (isTomorrow(d)) return 'Mañana';
  const label = format(d, 'EEEE, d \'de\' MMMM', { locale: es });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const STATUS_STYLES: Record<string, string> = {
  DISPONIBLE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  AGOTADO: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  CANCELADO: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
};

export default async function FuncionesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; estado?: string }>;
}) {
  const { date: filterDate, estado: filterEstado } = await searchParams;

  let funciones: Funcion[] = [];
  try {
    funciones = await functionsService.getAll();
  } catch {
    funciones = [];
  }

  const filtered = funciones.filter((f) => {
    if (filterDate && !f.fecha_hora.startsWith(filterDate)) return false;
    if (filterEstado && f.estado !== filterEstado) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, Funcion[]>>((acc, f) => {
    const date = f.fecha_hora.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(f);
    return acc;
  }, {});

  const hasFilters = filterDate || filterEstado;

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-red-500/30 selection:text-white">
        
        {/* Encabezado Principal Premium */}
        <div className="relative bg-gradient-to-b from-red-950/20 via-[#0a0a0a] to-[#0a0a0a] py-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.08),_transparent_65%)] pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight text-white">
              Cartelera de <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">Funciones</span>
            </h1>
            <p className="text-zinc-400 text-sm max-w-md mx-auto font-medium">
              Explora todos los horarios, salas y películas disponibles cerca de ti
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          
          {/* Barra de Filtros */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <form className="flex items-center gap-2.5 bg-zinc-900/80 backdrop-blur-md border border-zinc-800/60 rounded-xl px-3.5 py-2 shadow-sm transition-colors focus-within:border-zinc-700">
              <Filter className="w-4 h-4 text-zinc-400" />
              <input
                type="date"
                name="date"
                defaultValue={filterDate}
                className="bg-transparent text-sm outline-none text-white scheme-dark cursor-pointer font-medium"
              />
              <button type="submit" className="text-xs bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-red-500 transition-all active:scale-95 shadow-md shadow-red-900/20">
                Filtrar
              </button>
            </form>
            
            {hasFilters && (
              <Link href="/functions" className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-400 transition-colors bg-zinc-900/40 rounded-xl border border-zinc-800/30">
                <X className="w-3.5 h-3.5" />
                Limpiar Filtros
              </Link>
            )}
          </div>

          {/* Estado de No Resultados */}
          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-zinc-900/20 rounded-2xl border border-zinc-900/60 backdrop-blur-sm px-4">
              <CalendarClock className="w-14 h-14 text-zinc-700 mb-4 stroke-[1.5]" />
              <h3 className="text-lg font-bold mb-1 text-zinc-200">No se encontraron funciones</h3>
              <p className="text-zinc-500 text-sm">Prueba seleccionando otra fecha o limpiando los criterios.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(grouped).sort().map(([date, fns]) => (
                <div key={date} className="group/date animate-in fade-in duration-300">
                  
                  {/* Divisor de Fecha */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 ring-4 ring-red-500/10" />
                    <h2 className="font-extrabold text-sm sm:text-base text-zinc-200 tracking-tight">{getDateLabel(date)}</h2>
                    <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
                      {format(parseISO(date + 'T00:00:00'), 'd MMM, yyyy', { locale: es })}
                    </span>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-zinc-800/60 to-transparent" />
                    <span className="text-xs font-semibold text-zinc-500 bg-zinc-900/60 border border-zinc-800/40 px-2 py-0.5 rounded-md">{fns.length} {fns.length === 1 ? 'función' : 'funciones'}</span>
                  </div>

                  {/* Grid de Tarjetas Compactas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fns.map((fn) => {
                      const statusStyle = STATUS_STYLES[fn.estado] || STATUS_STYLES.CANCELADO;
                      const isAvailable = fn.estado === 'DISPONIBLE';
                      
                      // Enlace de reserva dinámica
                      const bookingUrl = fn.pelicula ? `/movies/${fn.pelicula.id}/book/${fn.id}` : '#';

                      const CardContent = (
                        <div className="flex gap-4 p-4">
                          {/* Poster / Miniatura */}
                          <div className="shrink-0 w-16 h-24 rounded-xl overflow-hidden bg-zinc-800 shadow-inner relative">
                            {fn.pelicula?.poster_url ? (
                              <img src={fn.pelicula.poster_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-5 h-5 text-zinc-600" />
                              </div>
                            )}
                          </div>

                          {/* Contenido / Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h3 className="font-bold text-sm text-white leading-snug line-clamp-2 tracking-tight group-hover:text-red-400 transition-colors">
                                  {fn.pelicula?.titulo || 'Película Desconocida'}
                                </h3>
                                <span className={`shrink-0 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-md border ${statusStyle}`}>
                                  {fn.estado === 'DISPONIBLE' ? 'Disponible' : fn.estado === 'AGOTADO' ? 'Agotado' : 'Cancelado'}
                                </span>
                              </div>

                              <div className="space-y-1">
                                {/* Hora y Sala */}
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                                  <Clock className="w-3.5 h-3.5 text-red-500 shrink-0 stroke-[2]" />
                                  <span>{format(parseISO(fn.fecha_hora), 'h:mm a')}</span>
                                  {fn.sala && (
                                    <span className="text-zinc-400 font-medium px-1.5 py-0.5 bg-zinc-800/60 border border-zinc-700/30 rounded text-[10px]">
                                      {fn.sala.nombre}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Cine y Ciudad combinados para ahorrar espacio */}
                                {fn.cine && (
                                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                                    <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                    <span className="truncate">
                                      {fn.cine.nombre}
                                      {fn.cine.ciudad && <span className="text-zinc-500 font-normal"> ({fn.cine.ciudad.nombre})</span>}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Botón de Reservar Integrado directamente en el flujo de datos */}
                            <div className="pt-2">
                              {isAvailable ? (
                                <div className="inline-flex items-center gap-1 text-xs font-bold text-red-400 group-hover:text-red-300 transition-colors">
                                  <span>Reservar Asientos</span>
                                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 stroke-[2.5]" />
                                </div>
                              ) : (
                                <span className="text-xs font-bold text-zinc-600">
                                  No disponible
                                </span>
                              )}
                            </div>

                          </div>
                        </div>
                      );

                      // Si está disponible, toda la tarjeta es el Link para un comportamiento más nativo
                      return isAvailable ? (
                        <Link
                          key={fn.id}
                          href={bookingUrl}
                          className="group bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:border-zinc-700/60 hover:bg-zinc-900/80 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                        >
                          {CardContent}
                        </Link>
                      ) : (
                        <div
                          key={fn.id}
                          className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl overflow-hidden flex flex-col justify-between opacity-40 select-none"
                        >
                          {CardContent}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}