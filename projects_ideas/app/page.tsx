'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Radio,
  Compass,
  Users,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Tv,
  MessageSquare,
  Lock
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import MediaCard from '@/components/MediaCard';
import CreateRoomModal from '@/components/CreateRoomModal';
import CreateUniverseModal from '@/components/CreateUniverseModal';
import { MOCK_ROOMS, MOCK_UNIVERSES } from '@/lib/mock-data';

export default function HomePage() {
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isCreateUniverseOpen, setIsCreateUniverseOpen] = useState(false);

  return (
    <div className="min-h-screen bg-netflix-base text-white flex flex-col">
      {/* Top Netflix Floating Navbar */}
      <Navbar
        onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
        onOpenCreateUniverse={() => setIsCreateUniverseOpen(true)}
      />

      {/* Main Hero Cinematic Banner */}
      <main className="flex-1">
        <HeroBanner />

        {/* SHELF 1: Live Synchronized Watch Parties */}
        <section id="live-rooms" className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-1.5 h-5 bg-netflix-red rounded-full" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Live Watch Parties</span>
                <span className="flex items-center gap-1 text-xs font-mono text-netflix-red px-2 py-0.5 rounded-full bg-netflix-red/10 border border-netflix-red/30">
                  <Radio className="w-3 h-3 animate-pulse" /> SYNCED NOW
                </span>
              </h2>
            </div>

            <button
              onClick={() => setIsCreateRoomOpen(true)}
              className="text-xs font-semibold text-netflix-red hover:text-netflix-redHover flex items-center space-x-1"
            >
              <span>+ Launch New Room</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MOCK_ROOMS.map((room) => (
              <MediaCard key={room.id} room={room} />
            ))}
          </div>
        </section>

        {/* SHELF 2: Explore Discord-Style Universes */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-1.5 h-5 bg-netflix-red rounded-full" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Featured Universes & Communities
              </h2>
            </div>

            <Link
              href="/universes"
              className="text-xs font-semibold text-netflix-gray hover:text-white flex items-center space-x-1"
            >
              <span>View All Universes</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MOCK_UNIVERSES.map((universe) => (
              <Link
                key={universe.id}
                href={`/universes/${universe.id}`}
                className="group relative rounded-lg overflow-hidden bg-netflix-surface border border-white/10 hover:border-netflix-red/50 transition-all hover:scale-[1.02] hover:shadow-glow-red flex flex-col justify-between"
              >
                {/* Banner */}
                <div className="relative h-32 w-full overflow-hidden bg-netflix-card">
                  <img
                    src={universe.banner_url}
                    alt={universe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-netflix-surface to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5 pt-0 relative flex-1 flex flex-col justify-between">
                  <div className="flex items-end space-x-3 -mt-8 mb-3">
                    <img
                      src={universe.icon_url}
                      alt={universe.name}
                      className="w-14 h-14 rounded-xl border-2 border-netflix-surface object-cover shadow-lg"
                    />
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-netflix-red transition-colors">
                        {universe.name}
                      </h3>
                      <p className="text-[11px] text-netflix-muted font-mono flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{universe.member_count} Members</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-netflix-gray line-clamp-2 mb-4">
                    {universe.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                    <span className="text-netflix-red font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Enter Orbits
                    </span>
                    <span className="text-[10px] text-netflix-muted font-mono">
                      Invite: #{universe.invite_code}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PLATFORM ARCHITECTURE & CAPABILITIES (Netflix + Teleparty + Discord Hybrid) */}
        <section className="border-t border-white/10 bg-netflix-dark/60 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <span className="text-xs uppercase tracking-widest text-netflix-red font-mono font-bold">
                Synchronous Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Cinema-Grade Co-Watching. Zero Drift.
              </h2>
              <p className="text-sm text-netflix-gray">
                Engineered with Supabase Realtime broadcast channels and WebRTC spatial audio for high-fidelity communal streaming.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-lg bg-netflix-surface border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded bg-netflix-red/10 border border-netflix-red/30 flex items-center justify-center text-netflix-red">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">
                  Sub-Second Drift Correction
                </h3>
                <p className="text-xs text-netflix-gray leading-relaxed">
                  Calculates network latency (RTT/2) on every broadcast update. If participant playhead drifts &gt;1.5 seconds from host, smooth seek realignment executes seamlessly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-lg bg-netflix-surface border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded bg-netflix-red/10 border border-netflix-red/30 flex items-center justify-center text-netflix-red">
                  <Tv className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">
                  Multi-User WebRTC Stage
                </h3>
                <p className="text-xs text-netflix-gray leading-relaxed">
                  Multi-user video and audio stage overlay with active speaker detection, hardware mute/deafen switches, and camera grid alongside cinema playback.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-lg bg-netflix-surface border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded bg-netflix-red/10 border border-netflix-red/30 flex items-center justify-center text-netflix-red">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">
                  Extension Sync Bridge
                </h3>
                <p className="text-xs text-netflix-gray leading-relaxed">
                  Full Manifest V3 companion extension relaying play/pause/seek events via postMessage across Netflix, Disney+ Hotstar, Prime Video, and custom direct streams.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Netflix-style Footer */}
      <footer className="border-t border-white/10 bg-netflix-base py-10 text-xs text-netflix-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-netflix-red flex items-center justify-center text-white">
              <Film className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white tracking-wider">NOT TOO FAR</span>
            <span>— Antigravity Streaming Architecture</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <Link href="/extension-bridge" className="hover:text-white transition-colors">
              Extension Bridge
            </Link>
            <Link href="/universes" className="hover:text-white transition-colors">
              Universes Directory
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Supabase Auth
            </Link>
            <span className="text-green-400 flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
      />
      <CreateUniverseModal
        isOpen={isCreateUniverseOpen}
        onClose={() => setIsCreateUniverseOpen(false)}
      />
    </div>
  );
}
