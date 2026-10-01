import React from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Movie } from '../../data/movies';

interface MovieHeroProps {
  movie: Movie;
  onStartWatchParty: (movie: Movie) => void;
  onOpenInfo: (movie: Movie) => void;
  onOpenCustomStream: () => void;
}

export const MovieHero: React.FC<MovieHeroProps> = ({
  movie,
  onStartWatchParty,
  onOpenInfo,
  onOpenCustomStream,
}) => {
  return (
    <div className="relative w-full h-[78vh] min-h-[500px] max-h-[720px] flex items-center select-none overflow-hidden">
      {/* Background Backdrop Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover filter brightness-[0.55]"
        />
        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-8 md:px-16 max-w-2xl space-y-4">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-600/40 text-xs font-bold uppercase tracking-wider text-red-400">
          <Sparkles className="w-3.5 h-3.5" />
          Featured Premiere • Frame-Synced
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white drop-shadow-lg">
          {movie.title}
        </h1>

        {/* Metadata row */}
        <div className="flex items-center gap-3 text-xs md:text-sm font-semibold text-gray-300">
          <span className="text-emerald-400">{movie.matchScore}% Match</span>
          <span className="text-gray-500">•</span>
          <span className="border border-gray-600 px-1.5 py-0.5 rounded text-[11px]">
            {movie.rating}
          </span>
          <span className="text-gray-500">•</span>
          <span>{movie.duration}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">{movie.year}</span>
        </div>

        {/* Synopsis */}
        <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3 max-w-xl">
          {movie.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStartWatchParty(movie)}
            className="flex items-center gap-2 bg-[#E50914] hover:bg-[#b80710] text-white font-bold px-6 py-3 rounded-md shadow-xl shadow-[#E50914]/30 transition text-sm md:text-base"
          >
            <Play className="w-5 h-5 fill-current" />
            Watch with Friends
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onOpenInfo(movie)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-5 py-3 rounded-md backdrop-blur-md border border-white/20 transition text-sm md:text-base"
          >
            <Info className="w-5 h-5" />
            Movie Info
          </motion.button>

          <button
            onClick={onOpenCustomStream}
            className="flex items-center gap-2 bg-[#222222]/80 hover:bg-[#333333] text-gray-300 hover:text-white px-4 py-3 rounded-md border border-white/10 text-xs md:text-sm transition ml-1"
            title="Paste your own video or movie stream link"
          >
            <LinkIcon className="w-4 h-4 text-[#E50914]" />
            Watch Any Custom URL
          </button>
        </div>
      </div>
    </div>
  );
};
