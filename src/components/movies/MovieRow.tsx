import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../../data/movies';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onStartWatchParty: (movie: Movie) => void;
  onOpenInfo: (movie: Movie) => void;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  movies,
  onStartWatchParty,
  onOpenInfo,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-2 px-8 md:px-16 py-4 group/row">
      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight hover:text-[#E50914] transition cursor-pointer">
        {title}
      </h2>

      <div className="relative">
        {/* Scroll Left Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-10 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition backdrop-blur-sm"
          title="Scroll Left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          className="flex items-center gap-3 overflow-x-auto scrollbar-none py-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onStartWatchParty={onStartWatchParty}
              onOpenInfo={onOpenInfo}
            />
          ))}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-10 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition backdrop-blur-sm"
          title="Scroll Right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
