import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, Video, Sparkles } from 'lucide-react';

interface MovieNavbarProps {
  onSearchChange: (query: string) => void;
  onOpenCustomStream: () => void;
  onSelectCategory: (category: string) => void;
}

export const MovieNavbar: React.FC<MovieNavbarProps> = ({
  onSearchChange,
  onOpenCustomStream,
  onSelectCategory,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    onSearchChange(val);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 px-8 md:px-16 py-4 flex items-center justify-between transition-colors duration-300 ${
        isScrolled
          ? 'bg-[#141414]/95 backdrop-blur-md shadow-2xl border-b border-white/5'
          : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'
      }`}
    >
      {/* Brand & Category Navigation */}
      <div className="flex items-center gap-8">
        <a href="/" className="flex items-center gap-2 group">
          <span className="text-[#E50914] font-black tracking-widest text-2xl font-sans drop-shadow-md">
            NOT TOO FAR
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded">
            Cinema Sync
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
          <button
            onClick={() => onSelectCategory('all')}
            className="hover:text-white transition"
          >
            All Movies
          </button>
          <button
            onClick={() => onSelectCategory('trending')}
            className="hover:text-white transition"
          >
            Trending
          </button>
          <button
            onClick={() => onSelectCategory('scifi')}
            className="hover:text-white transition"
          >
            Sci-Fi
          </button>
          <button
            onClick={() => onSelectCategory('action')}
            className="hover:text-white transition"
          >
            Action
          </button>
          <button
            onClick={() => onSelectCategory('anime')}
            className="hover:text-white transition"
          >
            Animation
          </button>
        </div>
      </div>

      {/* Right Navigation Elements */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative flex items-center">
          {searchOpen ? (
            <div className="flex items-center bg-[#202020] border border-white/20 rounded-full px-3 py-1 text-xs">
              <Search className="w-3.5 h-3.5 text-gray-400 mr-2" />
              <input
                type="text"
                autoFocus
                placeholder="Search movies, genres..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onBlur={() => {
                  if (!searchTerm) setSearchOpen(false);
                }}
                className="bg-transparent text-white focus:outline-none w-32 md:w-48 placeholder-gray-500"
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="text-gray-300 hover:text-white transition p-1"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Custom Stream Watch Party Button */}
        <button
          onClick={onOpenCustomStream}
          className="flex items-center gap-1.5 bg-[#222222] hover:bg-[#2c2c2c] border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
          title="Watch your own custom movie or stream with friends"
        >
          <Plus className="w-3.5 h-3.5 text-[#E50914]" />
          <span>Custom Stream</span>
        </button>

        {/* User Avatar */}
        <div className="relative flex items-center">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80"
            alt="User"
            className="w-8 h-8 rounded object-cover border border-white/20 cursor-pointer"
          />
        </div>
      </div>
    </nav>
  );
};
