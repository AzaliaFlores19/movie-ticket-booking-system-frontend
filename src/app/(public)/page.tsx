// 'use client';

// import { useState, useMemo, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import MainLayout from '@/components/layout/MainLayout';
// import MovieCard from '@/components/movies/MovieCard';
// import ModalSinFunciones from '@/components/ui/ModalSinFunciones';
// import { Search, MapPin, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
// import { peliculasService } from '@/services/peliculas.service';
// import { MOCK_CITIES, MOCK_GENRES, MOCK_LANGUAGES } from '@/lib/mock-data';

// export default function HomePage() {
//   const router = useRouter();
//   const [movies, setMovies] = useState<any[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCity, setSelectedCity] = useState('');
//   const [selectedGenre, setSelectedGenre] = useState('');
//   const [selectedLanguage, setSelectedLanguage] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
//   const [filtersOpen, setFiltersOpen] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);

//   useEffect(() => {
//     peliculasService.findAll().then((res) => setMovies(res.data));
//   }, []);

//   const filteredMovies = useMemo(() => {
//     return movies.filter((movie) => {
//       const matchesSearch = movie.titulo.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesGenre = selectedGenre ? String(movie.genero?.id) === selectedGenre : true;
//       const matchesLanguage = selectedLanguage ? String(movie.idioma?.id) === selectedLanguage : true;
      
//       const movieDate = movie.fecha_estreno ? new Date(movie.fecha_estreno) : null;
//       const start = startDate ? new Date(startDate) : null;
//       const end = endDate ? new Date(endDate) : null;
      
//       const matchesDate = 
//         (!start || (movieDate && movieDate >= start)) &&
//         (!end || (movieDate && movieDate <= end));

//       return matchesSearch && matchesGenre && matchesLanguage && matchesDate;
//     });
//   }, [movies, searchTerm, selectedGenre, selectedLanguage, startDate, endDate]);

//   const handleMovieClick = (movie: any) => {
//     if (!movie.tiene_funciones_disponibles) {
//       setModalOpen(true);
//     }
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setSelectedCity('');
//     setSelectedGenre('');
//     setSelectedLanguage('');
//   };

//   const hasFilters = searchTerm || selectedCity || selectedGenre || selectedLanguage;
//   const selectedCityName = MOCK_CITIES.find((c) => String(c.id) === selectedCity)?.nombre;

//   return (
//     <MainLayout>
//       <ModalSinFunciones isOpen={modalOpen} onClose={() => setModalOpen(false)} />
//       {/* ... (Hero section y filtros igual que antes) ... */}
      
//       {/* Search bar simplified for brevity in this response */}
//       {/* ... (rest of the component structure) ... */}

//         {filteredMovies.length === 0 ? (
//           <div className="text-center py-24 text-muted-foreground">
//             No se encontraron películas.
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
//             {filteredMovies.map((movie, i) => (
//               <MovieCard 
//                 key={movie.id} 
//                 movie={movie} 
//                 index={i} 
//               />
//             ))}
//           </div>
//         )}
//       {/* ... */}
//     </MainLayout>
//   );
// }
