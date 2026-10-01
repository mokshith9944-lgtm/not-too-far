import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Info, Check } from 'lucide-react';
import { Movie } from '../../data/movies';

interface MovieCardProps {
  movie: Movie;
  onStartWatchParty: (movie: Movie) => void;
  onOpenInfo: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onStartWatchParty,
  onOpenInfo,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddedToList, setIsAddedToList] = useState(false);

  return (
    <div
      className="relative flex-none w-56 md:w-64 cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base Poster Card */}
      <div className="relative aspect-[16/9] w-full rounded-md overflow-hidden bg-[#222222] shadow-md border border-white/5">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {movie.badge && (
          <div className="absolute top-2 left-2 bg-[#E50914] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
            {movie.badge}
          </div>
        )}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs font-semibold drop-shadow">
          <span className="truncate">{movie.title}</span>
        </div>
      </div>

      {/* Expanded Hover Card (Netflix-style delay zoom) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1.15, y: -20 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="absolute top-0 left-0 right-0 z-30 bg-[#181818] rounded-lg shadow-2xl border border-white/10 overflow-hidden"
            style={{ width: '100%' }}
          >
            {/* Top Media Thumbnail */}
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={movie.backdropUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartWatchParty(movie);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition group"
              >
                <div className="w-12 h-12 rounded-full bg-[#E50914] flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 transition">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </button>
            </div>

            {/* Hover Body */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStartWatchParty(movie)}
                    className="p-1.5 bg-white text-black hover:bg-gray-200 rounded-full transition"
                    title="Watch with Friends"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>

                  <button
                    onClick={() => setIsAddedToList(!isAddedToList)}
                    className="p-1.5 bg-[#2a2a2a] hover:bg-[#383838] text-white rounded-full border border-white/10 transition"
                    title={isAddedToList ? 'Remove from List' : 'Add to List'}
                  >
                    {isAddedToList ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onOpenInfo(movie)}
                    className="p-1.5 bg-[#2a2a2a] hover:bg-[#383838] text-white rounded-full border border-white/10 transition"
                    title="More Info"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[11px] font-bold text-emerald-400">
                  {movie.matchScore}% Match
                </span>
              </div>

              {/* Title & Metadata */}
              <h4 className="text-white text-xs font-bold truncate">{movie.title}</h4>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold">
                <span className="border border-gray-600 px-1 py-0.2 rounded text-[9px]">
                  {movie.rating}
                </span>
                <span>{movie.duration}</span>
                <span className="text-white font-mono text-[9px] bg-red-600/30 px-1 rounded border border-red-500/30">
                  Ultra-Sync
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-1 text-[10px] text-gray-400">
                {movie.genres.slice(0, 2).map((g) => (
                  <span key={g} className="text-gray-300">
                    • {g}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
