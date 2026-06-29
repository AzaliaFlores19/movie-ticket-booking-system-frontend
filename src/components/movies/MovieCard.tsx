'use client';

import { useRouter } from 'next/navigation';
import { Calendar, PlayCircle } from 'lucide-react';

interface Movie {
  id: number;
  titulo: string;
  sinopsis?: string;
  poster_url?: string;
  fecha_estreno?: string;
  genero?: { nombre: string };
  idioma?: { nombre: string };
  tiene_funciones_disponibles?: boolean;
}

interface Props {
  movie: Movie;
  index?: number;
}

export default function MovieCard({ movie, index = 0 }: Props) {
  const router = useRouter();
  
  const handleCardClick = () => {
    router.push(`/movies/${movie.id}`);
  };

  const releaseYear = movie.fecha_estreno
    ? new Date(movie.fecha_estreno).getFullYear()
    : null;

  return (
    <div 
      onClick={handleCardClick}
      className="group block cursor-pointer"
    >
      <div className="movie-card-hover rounded-xl overflow-hidden bg-card border border-border/60">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.poster_url || '/placeholder-movie.jpg'}
            alt={movie.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Genre badge */}
          {movie.genero && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 bg-red-600/90 backdrop-blur-sm text-white text-[10px] rounded font-semibold uppercase tracking-wide">
                {movie.genero.nombre}
              </span>
            </div>
          )}

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 bg-red-600/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200">
              <PlayCircle className="w-7 h-7 text-white" />
            </div>
          </div>
          
          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-bold text-sm text-white leading-tight line-clamp-2 drop-shadow-md">
              {movie.titulo}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {releaseYear && (
                <span className="flex items-center gap-0.5 text-[10px] text-white/70">
                  <Calendar className="w-2.5 h-2.5" />
                  {releaseYear}
                </span>
              )}
              {movie.idioma && (
                <span className="text-[10px] text-white/70">
                  {movie.idioma.nombre}
                </span>
              )}
            </div>
          </div>
        </div>

       {/* Buy tickets CTA */}
        <div className="px-3 py-2.5 bg-black hidden group-hover:block border-t border-zinc-900/50 transition-all text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 group-hover:text-red-500 transition-colors">
            Ver Horarios &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}
