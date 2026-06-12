import React from 'react';

// Quick mock data for validation
const mockMovies = [
  { id: '1', title: 'Inception', genre: 'Sci-Fi', rating: '8.8' },
  { id: '2', title: 'The Dark Knight', genre: 'Action', rating: '9.0' },
  { id: '3', title: 'Interstellar', genre: 'Adventure', rating: '8.6' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Connection Success Indicator */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          Next.js Frontend Connected Successfully
        </div>

        {/* Project Header */}
        <header className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Cinema Pass Project
          </h1>
          <p className="text-slate-400 text-lg">
            Frontend test environment for the Movie Booking System.
          </p>
        </header>

        {/* Quick Component Render Test */}
        <div className="border border-slate-800 bg-slate-900/50 p-6 rounded-2xl space-y-4 text-left">
          <h2 className="text-xl font-semibold text-slate-200">Component & Data Map Test:</h2>
          
          <div className="grid gap-3">
            {mockMovies.map((movie) => (
              <div 
                key={movie.id} 
                className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-amber-500/50 transition-colors"
              >
                <div>
                  <h3 className="font-bold text-slate-100">{movie.title}</h3>
                  <p className="text-xs text-slate-500">{movie.genre}</p>
                </div>
                <span className="text-sm font-semibold bg-slate-800 px-2.5 py-1 rounded-md text-amber-400">
                  ★ {movie.rating}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <footer className="text-xs text-slate-600">
          Tailwind CSS • TypeScript • App Router Verified
        </footer>
        
      </div>
    </main>
  );
}