'use client';

import Link from 'next/link';
import { Calendar, PlayCircle } from 'lucide-react';
import { getPosterByIndex } from '@/lib/mock-data';

interface Movie {
  id: number;
  titulo: string;
  sinopsis?: string;
  poster_url?: string;
  fecha_estreno?: string;
  genero?: { nombre: string };
  idioma?: { nombre: string };
}

interface Props {
  movie: Movie;
  index?: number;
}

export default function MovieCard({ movie, index = 0 }: Props) {
  const releaseYear = movie.fecha_estreno
    ? new Date(movie.fecha_estreno).getFullYear()
    : null;

  const posterSrc = movie.poster_url || getPosterByIndex(index);

  return (
    <Link href={`/movies/${movie.id}`} className="group block">
      <div className="movie-card-hover rounded-xl overflow-hidden bg-card border border-border/60">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={posterSrc}
            alt={movie.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPosterByIndex(index + 1);
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Genre badge */}
          {movie.genero && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 bg-red-600/90 backdrop-blur-sm text-white text-[10px] rounded font-semibold uppercase tracking-wide">
                {movie.genero.nombre}
              </span>
            </div>
          )}

          {/* Play button on hover */}
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

       {/* Buy tickets CTA - visible on hover */}
        <div className="px-3 py-2.5 bg-black hidden group-hover:block border-t border-zinc-900/50 transition-all text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 group-hover:text-red-500 transition-colors">
            Ver Horarios &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
