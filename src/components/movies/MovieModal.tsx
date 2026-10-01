import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Sparkles, Clock, Calendar, Star, Users } from 'lucide-react';
import { Movie } from '../../data/movies';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  onStartWatchParty: (movie: Movie) => void;
}

export const MovieModal: React.FC<MovieModalProps> = ({
  movie,
  onClose,
  onStartWatchParty,
}) => {
  if (!movie) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-[#181818] border border-white/10 rounded-2xl overflow-hidden shadow-2xl text-white select-none max-h-[90vh] flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-gray-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Banner Image with Gradient */}
          <div className="relative aspect-[16/9] w-full overflow-hidden flex-shrink-0">
            <img
              src={movie.backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover filter brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-3xl font-extrabold text-white drop-shadow-md">
                {movie.title}
              </h2>
              <p className="text-sm text-red-400 font-semibold mt-1">
                {movie.tagline}
              </p>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-medium">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Star className="w-4 h-4 fill-current" /> {movie.matchScore}% Match
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {movie.year}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {movie.duration}
                </span>
                <span className="border border-gray-600 px-1.5 py-0.5 rounded text-[11px]">
                  {movie.rating}
                </span>
              </div>

              {/* Start Watch Party Primary CTA */}
              <button
                onClick={() => {
                  onClose();
                  onStartWatchParty(movie);
                }}
                className="flex items-center gap-2 bg-[#E50914] hover:bg-[#b80710] text-white font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-[#E50914]/30 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch Watch Party Room
              </button>
            </div>

            {/* Synopsis */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">
                Overview
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Genres */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
                Genres & Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs bg-[#242424] text-gray-200 px-3 py-1 rounded-full border border-white/5"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Feature Note */}
            <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl flex items-center gap-3 text-xs text-gray-300">
              <Users className="w-5 h-5 text-[#E50914] flex-shrink-0" />
              <span>
                Invite up to 50 friends with a single link. Audio/Video calls, live chat, and sub-second playhead sync are included automatically.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
