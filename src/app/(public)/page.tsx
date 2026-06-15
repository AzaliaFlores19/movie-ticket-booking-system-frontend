'use client';

import { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MovieCard from '@/components/movies/MovieCard';
import { Search, MapPin, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { MOCK_MOVIES, MOCK_CITIES, MOCK_GENRES, MOCK_LANGUAGES } from '@/lib/mock-data';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtramos los datos mock localmente
  const filteredMovies = useMemo(() => {
    return MOCK_MOVIES.filter((movie) => {
      const matchesSearch = movie.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre ? String(movie.genero_id) === selectedGenre : true;
      const matchesLanguage = selectedLanguage ? String(movie.idioma_id) === selectedLanguage : true;
      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }, [searchTerm, selectedGenre, selectedLanguage]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedGenre('');
    setSelectedLanguage('');
  };

  const hasFilters = searchTerm || selectedCity || selectedGenre || selectedLanguage;
  const selectedCityName = MOCK_CITIES.find((c) => String(c.id) === selectedCity)?.nombre;

  return (
    <MainLayout>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-red-950/50 via-background to-background pt-10 pb-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(220,38,38,0.2),transparent)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-600/30 rounded-full text-red-400 text-xs font-semibold mb-4 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Cartelera Actual
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 leading-tight text-foreground">
              Encuentra Horarios{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
                &amp; Compra Boletos
              </span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              Explora las últimas películas, descubre cines cercanos y reserva tus asientos en segundos.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-3xl mx-auto">
            <form className="flex flex-col sm:flex-row gap-2 bg-card border border-border rounded-2xl p-2.5 shadow-2xl shadow-black/30">
              {/* Search input */}
              <div className="flex-1 flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar películas..."
                  className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground"
                />
                {searchTerm && (
                  <button type="button" onClick={() => setSearchTerm('')}>
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* City picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5 text-sm min-w-[150px] w-full sm:w-auto"
                >
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="flex-1 text-left text-muted-foreground truncate">
                    {selectedCityName || 'Todas las Ciudades'}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {cityDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full min-w-[180px] bg-card border border-border rounded-xl shadow-xl z-50 py-1 max-h-56 overflow-y-auto">
                    <button type="button" onClick={() => { setSelectedCity(''); setCityDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors text-muted-foreground">
                      Todas las Ciudades
                    </button>
                    {MOCK_CITIES.map((city) => (
                      <button key={city.id} type="button"
                        onClick={() => { setSelectedCity(String(city.id)); setCityDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors ${selectedCity === String(city.id) ? 'text-red-400 font-medium' : ''}`}>
                        {city.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  filtersOpen || selectedGenre || selectedLanguage
                    ? 'bg-red-600/20 text-red-400'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
              </button>
            </form>

            {/* Extended filters */}
            {filtersOpen && (
              <div className="mt-2 bg-card border border-border rounded-xl p-3 flex flex-wrap gap-3">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs text-muted-foreground mb-1 block">Género</label>
                  <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500 text-foreground">
                    <option value="">Todos los géneros</option>
                    {MOCK_GENRES.map((g) => <option key={g.id} value={String(g.id)}>{g.nombre}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs text-muted-foreground mb-1 block">Idioma</label>
                  <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500 text-foreground">
                    <option value="">Todos los idiomas</option>
                    {MOCK_LANGUAGES.map((l) => <option key={l.id} value={String(l.id)}>{l.nombre}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Movie Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-gradient-to-b from-red-500 to-red-800 rounded-full" />
            En Cartelera
          </h2>
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors">
              <X className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            No se encontraron películas.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie as any} index={i} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
