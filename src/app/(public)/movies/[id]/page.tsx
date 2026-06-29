'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { moviesService } from '@/services/movies.service';
import { citiesService } from '@/services/cities.service';
import { Calendar, Clock, MapPin, Film, ChevronRight, ArrowLeft, Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Movie, Cine, Funcion, City } from '@/types';

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = Number(unwrappedParams.id);
  const router = useRouter();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [cines, setCines] = useState<Cine[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCine, setSelectedCine] = useState<number | null>(null);
  const [funciones, setFunciones] = useState<Funcion[]>([]);
  
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingCines, setLoadingCines] = useState(true);
  const [loadingFunciones, setLoadingFunciones] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingMovie(true);
      setLoadingCines(true);
      
      const [movieData, cinesData, citiesData] = await Promise.all([
        moviesService.getOne(id),
        moviesService.getCines(id),
        citiesService.getAll()
      ]);
      
      setMovie(movieData);
      setCines(cinesData);
      setCities(citiesData);
      setLoadingMovie(false);
      setLoadingCines(false);
    };
    fetchData();
  }, [id]);

  const handleCineSelect = async (cineId: number) => {
    setSelectedCine(cineId);
    setLoadingFunciones(true);
    console.log(`Cargando funciones para película ${id} y cine ${cineId}`);
    try {
      const res = await moviesService.getFunciones(id, cineId);
      console.log('Respuesta de funciones:', res);
      setFunciones(res || []);
    } catch (error) {
      console.error('Error al cargar funciones:', error);
      setFunciones([]);
    } finally {
      setLoadingFunciones(false);
    }
  };

  const filteredCines = (cines || []).filter((c) => {
  if (!selectedCity) return true;
  
  const cineCiudadId = c.ciudad?.id || (c as any).ciudad_id;
  
  return String(cineCiudadId) === selectedCity;
});

  const groupedFunciones = funciones.reduce<Record<string, Funcion[]>>((acc, f) => {
    const date = format(new Date(f.fecha_hora), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(f);
    return acc;
  }, {});

  const formatGroupDate = (dateStr: string) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const formatted = format(dateObj, 'EEEE, d \'de\' MMMM', { locale: es });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  if (loadingMovie) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh] bg-[#0a0a0a]">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      </MainLayout>
    );
  }

  if (!movie) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-[#0a0a0a]">
          <Film className="w-16 h-16 text-red-700 mb-4" />
          <h2 className="text-xl font-bold mb-2 text-white">Película no encontrada</h2>
          <Link href="/" className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500 transition-colors">
            Volver a películas
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-500 transition-colors mb-6 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Volver a películas
          </Link>

          {/* Bloque Detalle de la Película */}
          <div className="bg-zinc-900/90 rounded-2xl overflow-hidden mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md border border-zinc-800/20">
            <div className="flex flex-col sm:flex-row gap-0">
              <div className="shrink-0 sm:w-44 md:w-52">
                {movie.poster_url ? (
                  <img src={movie.poster_url} alt={movie.titulo} className="w-full h-full object-cover" style={{ maxHeight: '280px' }} />
                ) : (
                  <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-gradient-to-br from-zinc-800/50 to-zinc-900">
                    <Film className="w-12 h-12 text-zinc-700" />
                  </div>
                )}
              </div>

              <div className="flex-1 p-5 md:p-7">
                <h1 className="text-2xl md:text-3xl font-black mb-2 text-white tracking-tight">{movie.titulo}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {movie.genero && (
                    <span className="px-2.5 py-0.5 bg-red-600/10 text-red-400 text-xs font-semibold rounded-full border border-red-500/10">
                      {movie.genero.nombre}
                    </span>
                  )}
                  {movie.idioma && (
                    <span className="px-2.5 py-0.5 bg-zinc-800/60 text-zinc-300 text-xs font-medium rounded-full border border-zinc-700/30">
                      {movie.idioma.nombre}
                    </span>
                  )}
                  {movie.fecha_estreno && (
                    <span className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      {format(new Date(movie.fecha_estreno), 'd MMM, yyyy', { locale: es })}
                    </span>
                  )}
                  {movie.duracion && (
                    <span className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
                      <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      {Math.floor(movie.duracion / 60)}h {movie.duracion % 60}m
                    </span>
                  )}
                </div>

                {movie.sinopsis && (
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-4 font-normal">
                    {movie.sinopsis}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Buscador de Cines y Horarios */}
          <div className="bg-zinc-900/90 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md border border-zinc-800/20">
            
            <div className="p-4 border-b border-zinc-800/30 flex flex-col sm:flex-row sm:items-center gap-3 bg-zinc-850/40">
              <div className="flex items-center gap-2 flex-1">
                <Building2 className="w-4 h-4 text-red-500" />
                <span className="font-bold text-xs text-zinc-300 tracking-wider uppercase">Encuentra Cines y Horarios</span>
              </div>
              {cities.length > 0 && (
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700/30 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-zinc-600 text-white scheme-dark cursor-pointer transition-colors hover:border-zinc-600/40"
                >
                  <option value="" className="bg-zinc-900">Todas las Ciudades</option>
                  {cities.map((c) => (
                    <option key={String(c.id)} value={String(c.id)} className="bg-zinc-900">{c.nombre}</option>
                  ))}
                </select>
              )}
            </div>

            {loadingCines ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
              </div>
            ) : cines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MapPin className="w-10 h-10 text-zinc-800 mb-3" />
                <p className="font-medium mb-1 text-zinc-400">No Hay Cines Con Funciones Disponibles </p>
              </div>
            ) : filteredCines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MapPin className="w-10 h-10 text-zinc-800 mb-3" />
                <p className="font-medium mb-1 text-zinc-400">No hay cines con funciones disponibles en esta ciudad</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/30">
                {filteredCines.map((cine) => (
                  <div key={String(cine.id)}>
                    <button
                      onClick={() => selectedCine === Number(cine.id) ? setSelectedCine(null) : handleCineSelect(Number(cine.id))}
                      className="w-full flex items-center gap-4 p-4 hover:bg-zinc-800/20 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 bg-zinc-800/80 border border-zinc-700/20 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors">{cine.nombre}</p>
                        {cine.direccion && <p className="text-xs text-zinc-400 truncate mt-0.5">{cine.direccion}</p>}
                      </div>
                      <ChevronRight className={`w-4 h-4 text-zinc-600 transition-transform duration-200 ${selectedCine === Number(cine.id) ? 'rotate-90 text-red-500' : ''}`} />
                    </button>

                    {/* Desplegable de Horarios Internos */}
                    {selectedCine === Number(cine.id) && (
                      <div className="px-4 pb-5 pt-2 bg-zinc-950/20 border-t border-zinc-800/20 animate-in fade-in duration-200">
                        {loadingFunciones ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                          </div>
                        ) : funciones.length === 0 ? (
                          <p className="text-sm text-zinc-500 py-4 text-center italic">No hay funciones disponibles en este cine.</p>
                        ) : (
                          <div className="space-y-4 pt-2">
                            {Object.entries(groupedFunciones).sort().map(([date, fns]) => {
                                const funcionesDisponibles = fns.filter(f => f.estado_funcion === 'DISPONIBLE');
                                if (funcionesDisponibles.length === 0) return null;
                                
                                return (
                                  <div key={date} className="border-b border-zinc-800/20 last:border-0 pb-3 last:pb-0">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5">
                                      {formatGroupDate(date)}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {funcionesDisponibles.map((fn) => {
                                        // Extraemos directamente la hora de la cadena ISO sin convertir a objeto Date
                                        const timePart = fn.fecha_hora.split('T')[1]; // "19:14:00.000Z"
                                        const [hours, minutes] = timePart.split(':');
                                        const hourNum = parseInt(hours, 10);
                                        const ampm = hourNum >= 12 ? 'PM' : 'AM';
                                        const formattedHours = hourNum % 12 || 12;
                                        
                                        return (
                                          <button
                                            key={String(fn.id_funcion)}
                                            onClick={() => router.push(`/movies/${id}/book/${fn.id_funcion}`)}
                                            className="border border-zinc-700/30 bg-zinc-800 text-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-150 cursor-pointer"
                                          >
                                            {formattedHours}:{minutes} {ampm}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
}
