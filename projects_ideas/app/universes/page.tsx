'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Users, Sparkles, PlusCircle, Search, Film, Shield, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CreateUniverseModal from '@/components/CreateUniverseModal';
import CreateRoomModal from '@/components/CreateRoomModal';
import { MOCK_UNIVERSES } from '@/lib/mock-data';

export default function UniversesDirectoryPage() {
  const [isCreateUniverseOpen, setIsCreateUniverseOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredUniverses = MOCK_UNIVERSES.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-netflix-base text-white flex flex-col">
      <Navbar
        onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
        onOpenCreateUniverse={() => setIsCreateUniverseOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-netflix-red font-mono text-xs uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Discord-Style Communities</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Explore Universes & Orbits
            </h1>
            <p className="text-xs sm:text-sm text-netflix-gray mt-1">
              Join curated cinephile servers with dedicated synchronized watch rooms, text channels, and spatial audio lounges.
            </p>
          </div>

          <button
            onClick={() => setIsCreateUniverseOpen(true)}
            className="flex items-center space-x-2 bg-netflix-red hover:bg-netflix-redHover text-white px-4 py-2 rounded text-xs font-bold tracking-wide shadow-glow-red transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Universe</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-netflix-muted absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search universes by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-netflix-surface border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
            {['all', 'Film Festivals', 'Sci-Fi & Cyberpunk', 'Anime Simulcast', 'Classics'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-netflix-red text-white'
                    : 'bg-netflix-card text-netflix-gray hover:text-white border border-white/5'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Universe Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniverses.map((universe) => (
            <div
              key={universe.id}
              className="group relative rounded-xl overflow-hidden bg-netflix-surface border border-white/10 hover:border-netflix-red/50 hover:shadow-glow-red transition-all flex flex-col justify-between"
            >
              {/* Universe Banner */}
              <div className="relative h-36 w-full overflow-hidden bg-netflix-dark">
                <img
                  src={universe.banner_url}
                  alt={universe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-netflix-surface via-transparent to-black/40" />
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-green-400">
                  ● Active Orbits
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 pt-0 relative flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-end space-x-3 -mt-9 mb-3">
                    <img
                      src={universe.icon_url}
                      alt={universe.name}
                      className="w-16 h-16 rounded-xl border-2 border-netflix-surface object-cover shadow-cinema"
                    />
                    <div className="pb-1">
                      <h3 className="font-bold text-base text-white group-hover:text-netflix-red transition-colors">
                        {universe.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-[11px] text-netflix-muted font-mono">
                        <Users className="w-3.5 h-3.5 text-netflix-red" />
                        <span>{universe.member_count} Members</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-netflix-gray leading-relaxed mb-4">
                    {universe.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-netflix-muted">
                    Code: #{universe.invite_code}
                  </span>

                  <Link
                    href={`/universes/${universe.id}`}
                    className="flex items-center space-x-1.5 bg-netflix-red/20 hover:bg-netflix-red text-netflix-red hover:text-white px-3 py-1.5 rounded text-xs font-semibold border border-netflix-red/30 transition-all"
                  >
                    <span>Enter Universe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <CreateUniverseModal
        isOpen={isCreateUniverseOpen}
        onClose={() => setIsCreateUniverseOpen(false)}
      />
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
      />
    </div>
  );
}
