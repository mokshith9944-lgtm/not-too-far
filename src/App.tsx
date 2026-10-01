import React, { useState, useEffect } from 'react';
import { MovieNavbar } from './components/movies/MovieNavbar';
import { MovieHero } from './components/movies/MovieHero';
import { MovieRow } from './components/movies/MovieRow';
import { MovieModal } from './components/movies/MovieModal';
import { CustomStreamModal } from './components/movies/CustomStreamModal';
import { WatchPartyRoom } from './components/movies/WatchPartyRoom';
import { MOVIES, Movie } from './data/movies';
import { Sparkles, Users, Tv, Radio, Shield } from 'lucide-react';

export const App: React.FC = () => {
  // Current active watch party room (null = movie browsing mode)
  const [activePartyMovie, setActivePartyMovie] = useState<Movie | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string>('');

  // Modals state
  const [selectedInfoMovie, setSelectedInfoMovie] = useState<Movie | null>(null);
  const [isCustomStreamModalOpen, setIsCustomStreamModalOpen] = useState(false);

  // Search & category filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Check URL query parameters on load to auto-join watch party if link was shared
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const movieParam = params.get('movie');

    if (roomParam) {
      setActiveRoomId(roomParam);
      const targetMovie = MOVIES.find((m) => m.id === movieParam) || MOVIES[0];
      setActivePartyMovie(targetMovie);
    }
  }, []);

  const handleStartWatchParty = (movie: Movie) => {
    const newRoomId = 'room_' + Math.random().toString(36).substring(2, 9);
    setActiveRoomId(newRoomId);
    setActivePartyMovie(movie);

    // Update browser URL query without reloading
    const newUrl = `${window.location.pathname}?room=${newRoomId}&movie=${movie.id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleLeaveRoom = () => {
    setActivePartyMovie(null);
    setActiveRoomId('');
    window.history.pushState({}, '', window.location.pathname);
  };

  // Filter movies based on search or category
  const filteredMovies = MOVIES.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || m.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Category subsets
  const trendingMovies = MOVIES.filter((m) => m.category === 'trending' || m.category === 'scifi');
  const actionMovies = MOVIES.filter((m) => m.category === 'action');
  const scifiMovies = MOVIES.filter((m) => m.category === 'scifi');
  const animeMovies = MOVIES.filter((m) => m.category === 'anime');
  const classicMovies = MOVIES.filter((m) => m.category === 'classics');

  // If inside an active Watch Party Room, render the cinema sync experience
  if (activePartyMovie) {
    return (
      <WatchPartyRoom
        movie={activePartyMovie}
        roomId={activeRoomId}
        onLeaveRoom={handleLeaveRoom}
        onSelectOtherMovie={(movie) => handleStartWatchParty(movie)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white">
      {/* Navigation Header */}
      <MovieNavbar
        onSearchChange={setSearchQuery}
        onOpenCustomStream={() => setIsCustomStreamModalOpen(true)}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Billboard Hero */}
      {!searchQuery && selectedCategory === 'all' && (
        <MovieHero
          movie={MOVIES[0]}
          onStartWatchParty={handleStartWatchParty}
          onOpenInfo={setSelectedInfoMovie}
          onOpenCustomStream={() => setIsCustomStreamModalOpen(true)}
        />
      )}

      {/* Content Feed */}
      <div className={`space-y-6 pb-20 ${searchQuery || selectedCategory !== 'all' ? 'pt-24' : '-mt-16 relative z-20'}`}>
        {/* If searching or filtering, show direct grid */}
        {searchQuery || selectedCategory !== 'all' ? (
          <div className="px-8 md:px-16 space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              {searchQuery ? `Search Results for "${searchQuery}"` : `Category: ${selectedCategory.toUpperCase()}`}
            </h2>
            {filteredMovies.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <p className="text-lg">No movies found matching your query.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-3 text-[#E50914] hover:underline font-semibold"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => handleStartWatchParty(movie)}
                    className="group relative aspect-[16/9] rounded-lg overflow-hidden bg-[#202020] cursor-pointer border border-white/5 hover:border-red-500/50 transition-all hover:scale-105"
                  >
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-xs font-bold text-white block truncate">
                        {movie.title}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        {movie.matchScore}% Match • {movie.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Standard Netflix-style Category Rows */
          <>
            <MovieRow
              title="🔥 Trending Now & Premieres"
              movies={trendingMovies}
              onStartWatchParty={handleStartWatchParty}
              onOpenInfo={setSelectedInfoMovie}
            />

            <MovieRow
              title="🚀 Sci-Fi & Cyberpunk Universes"
              movies={scifiMovies}
              onStartWatchParty={handleStartWatchParty}
              onOpenInfo={setSelectedInfoMovie}
            />

            <MovieRow
              title="⚡ Action & High Adrenaline"
              movies={actionMovies}
              onStartWatchParty={handleStartWatchParty}
              onOpenInfo={setSelectedInfoMovie}
            />

            <MovieRow
              title="✨ Animation & Fantasy"
              movies={animeMovies}
              onStartWatchParty={handleStartWatchParty}
              onOpenInfo={setSelectedInfoMovie}
            />

            <MovieRow
              title="🌲 Nature, Expedition & Classics"
              movies={classicMovies}
              onStartWatchParty={handleStartWatchParty}
              onOpenInfo={setSelectedInfoMovie}
            />
          </>
        )}
      </div>

      {/* Engineering Highlights Banner */}
      <section className="py-12 px-8 md:px-16 border-t border-white/5 bg-[#101010]">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E50914]/20 border border-[#E50914] flex items-center justify-center text-[#E50914]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Watch Any Movie with Friends Online</h3>
              <p className="text-xs text-gray-400">
                1-Click Room Creation • Sub-second Video Sync • Live WebRTC Call Stage • Timestamp Chat
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCustomStreamModalOpen(true)}
            className="flex items-center gap-2 bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-lg shadow-[#E50914]/25 transition"
          >
            <Tv className="w-4 h-4" />
            Paste Custom Movie Link
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-white/5 text-center text-xs text-gray-600">
        <p>© 2026 Not Too Far. Watch movies and streams online with friends in perfect synchronization.</p>
      </footer>

      {/* Movie Details Modal */}
      <MovieModal
        movie={selectedInfoMovie}
        onClose={() => setSelectedInfoMovie(null)}
        onStartWatchParty={handleStartWatchParty}
      />

      {/* Custom Stream URL Modal */}
      <CustomStreamModal
        isOpen={isCustomStreamModalOpen}
        onClose={() => setIsCustomStreamModalOpen(false)}
        onStartCustomParty={handleStartWatchParty}
      />
    </div>
  );
};

export default App;
