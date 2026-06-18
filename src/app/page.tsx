'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MovieCard from '@/components/movies/MovieCard';
import { Search, MapPin, ChevronDown, SlidersHorizontal, Calendar, X } from 'lucide-react';
import { moviesService } from '@/services/movies.service';
import { citiesService } from '@/services/cities.service';
import { genresService } from '@/services/genres.service';
import { languagesService } from '@/services/languages.service';
import { Movie, City, Genre, Language } from '@/types';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); 
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [moviesData, citiesData, genresData, languagesData] = await Promise.all([
          // Mapeo exacto hacia los Query DTOs de NestJS:
          moviesService.getAll({
            titulo: searchTerm || undefined,
            ciudad_id: selectedCity || undefined,
            genero: selectedGenre || undefined,
            idioma: selectedLanguage || undefined,
            fecha_inicio: selectedDate || undefined, // Mandamos la fecha seleccionada aquí
          }),
          citiesService.getAll().catch(() => []), // Salvaguardas por si fallan los otros endpoints
          genresService.getAll().catch(() => []),
          languagesService.getAll().catch(() => [])
        ]);

        setMovies(moviesData);
        setCities(citiesData);
        setGenres(genresData);
        setLanguages(languagesData);
      } catch (error) {
        console.error("Error al buscar información de cartelera", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, selectedCity, selectedGenre, selectedLanguage, selectedDate]); 

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedGenre('');
    setSelectedLanguage('');
    setSelectedDate(''); 
  };

  const hasFilters = searchTerm || selectedCity || selectedGenre || selectedLanguage || selectedDate;
  const selectedCityName = cities.find((c) => String(c.id) === selectedCity)?.nombre;

  return (
    <MainLayout>
      {/* SECCIÓN HERO */}
      <div className="relative bg-[#0a0a0a] text-zinc-100 pt-16 pb-12 border-b border-zinc-900 z-30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(220,38,38,0.12),transparent_70%)]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-500/20 rounded-full text-red-400 text-xs font-semibold mb-4 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Cartelera Actual
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight text-white">
              Encuentra Horarios{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                &amp; Compra Boletos
              </span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
              Explora las últimas películas, descubre cines cercanos y reserva tus asientos en segundos desde nuestra cartelera digital.
            </p>
          </div>

          {/* Barra de Filtros Principal */}
          <div className="max-w-3xl mx-auto relative z-40">
            <form 
              className="flex flex-col sm:flex-row gap-2.5 bg-[#121212]/90 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" 
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex-1 flex items-center gap-2.5 bg-[#1a1a1a] border border-zinc-800 rounded-xl px-3.5 py-3 transition-all focus-within:border-red-500/50">
                <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar películas..."
                  className="bg-transparent text-sm outline-none w-full placeholder:text-zinc-600 text-white"
                />
              </div>

              {/* Selector de Ciudades Dropdown */}
              <div className="relative w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  className="flex items-center gap-2.5 bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-sm w-full sm:w-[200px] text-zinc-200 hover:border-zinc-700 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="flex-1 text-left truncate">
                    {selectedCityName || 'Todas las Ciudades'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${cityDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {cityDropdownOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:w-64 bg-[#121212] border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 py-1.5 max-h-60 overflow-y-auto backdrop-blur-2xl">
                    <button 
                      type="button" 
                      onClick={() => { setSelectedCity(''); setCityDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-800/60 transition-colors text-zinc-400 border-b border-zinc-800/40 mb-1"
                    >
                      Todas las Ciudades
                    </button>
                    
                    {cities.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-zinc-500 italic">No hay ciudades disponibles</p>
                    ) : (
                      cities.map((city) => (
                        <button 
                          key={city.id} 
                          type="button"
                          onClick={() => { setSelectedCity(String(city.id)); setCityDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-800/40 transition-colors block truncate ${
                            selectedCity === String(city.id) 
                              ? 'text-red-400 font-bold bg-red-500/10' 
                              : 'text-zinc-200'
                          }`}
                        >
                          {city.nombre}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Botón Filtros Avanzados */}
              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  filtersOpen || selectedGenre || selectedLanguage || selectedDate
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : 'bg-[#1a1a1a] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtros</span>
              </button>
            </form>

            {/* Panel Desplegable de Filtros Especiales */}
            {filtersOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#121212]/95 backdrop-blur-xl border border-zinc-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl z-40">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-2 block uppercase tracking-wider">Género</label>
                  <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none text-white focus:border-red-500/50 cursor-pointer">
                    <option value="">Todos los géneros</option>
                    {genres.map((g) => <option key={g.id} value={String(g.id)}>{g.nombre}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-2 block uppercase tracking-wider">Idioma</label>
                  <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none text-white focus:border-red-500/50 cursor-pointer">
                    <option value="">Todos los idiomas</option>
                    {languages.map((l) => <option key={l.id} value={String(l.id)}>{l.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-2 block uppercase tracking-wider">Fecha</label>
                  <div className="relative flex items-center bg-[#1a1a1a] border border-zinc-800 rounded-lg px-3 py-2">
                    <Calendar className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none text-white cursor-pointer"
                      style={{ colorScheme: 'dark' }} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grilla de Películas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#0a0a0a]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <span className="inline-block w-1 h-6 bg-gradient-to-b from-red-500 to-red-700 rounded-full" />
            En Cartelera
          </h2>
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-red-500 transition-colors">
              <X className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-32 text-zinc-500 font-medium tracking-wide">Cargando películas...</div>
        ) : movies.length === 0 ? (
          <div className="text-center py-32 text-zinc-500 font-medium">
            No se encontraron películas que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {movies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}