import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Link, Video } from 'lucide-react';
import { Movie } from '../../data/movies';

interface CustomStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomParty: (customMovie: Movie) => void;
}

export const CustomStreamModal: React.FC<CustomStreamModalProps> = ({
  isOpen,
  onClose,
  onStartCustomParty,
}) => {
  const [title, setTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) return;

    const customMovie: Movie = {
      id: 'custom_' + Math.random().toString(36).substring(2, 9),
      title: title.trim() || 'Custom Stream Party',
      tagline: 'Custom video stream hosted with friends',
      description: 'Synchronized live session streaming from ' + streamUrl,
      year: new Date().getFullYear(),
      rating: 'NR',
      matchScore: 100,
      duration: 'Live',
      category: 'trending',
      genres: ['Custom Stream', 'Direct MP4 / HLS'],
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85',
      videoUrl: streamUrl.trim(),
    };

    onStartCustomParty(customMovie);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#181818] border border-white/10 rounded-2xl p-6 shadow-2xl text-white select-none"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#E50914]/20 border border-[#E50914] flex items-center justify-center text-[#E50914]">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Watch Any Movie or Stream</h3>
              <p className="text-xs text-gray-400">
                Paste any MP4, WebM, HLS, or direct movie URL to sync with friends
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                Movie / Video Title
              </label>
              <input
                type="text"
                placeholder="e.g. Interstellar, Inception, Dune Part 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#242424] border border-white/10 text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E50914] placeholder-gray-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                Video Stream URL (MP4 / WebM / HLS) *
              </label>
              <div className="relative">
                <Link className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  required
                  placeholder="https://example.com/movie.mp4"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full bg-[#242424] border border-white/10 text-white text-sm pl-10 pr-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E50914] placeholder-gray-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-[#202020] rounded-lg border border-white/5 text-[11px] text-gray-400 space-y-1">
              <span className="font-semibold text-gray-300 block">💡 Quick Sample Stream:</span>
              <p className="truncate font-mono text-[10px] text-gray-400">
                https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4
              </p>
              <button
                type="button"
                onClick={() => {
                  setTitle('Tears of Steel (Sci-Fi 4K)');
                  setStreamUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
                }}
                className="text-[#E50914] hover:underline font-semibold text-xs"
              >
                Use Sample Stream
              </button>
            </div>

            <button
              type="submit"
              disabled={!streamUrl.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#b80710] disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg shadow-[#E50914]/25 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              Create Watch Party Room
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
