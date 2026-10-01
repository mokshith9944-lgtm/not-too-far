'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play,
  Users,
  Compass,
  Radio,
  Tv,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Flame,
  Volume2,
} from 'lucide-react';

interface UniverseCard {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  membersCount: number;
  activeParties: number;
  orbits: string[];
}

const FEATURED_UNIVERSES: UniverseCard[] = [
  {
    id: 'cinephile-hub',
    name: 'Cinephile Orbit Universe',
    slug: 'cinephiles',
    description: 'Anime premieres, 4K film clubs, and late-night retro sci-fi screenings.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    membersCount: 1420,
    activeParties: 4,
    orbits: ['#cinema-main', '#anime-lounge', '#retro-vault'],
  },
  {
    id: 'cyberpunk-cult',
    name: 'Neo-Tokyo Stream Hub',
    slug: 'neotokyo',
    description: 'Cyberpunk anime marathons with live synchronized WebRTC voice stages.',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    membersCount: 890,
    activeParties: 2,
    orbits: ['#edgerunners-watch', '#synthwave-stage', '#general-chat'],
  },
  {
    id: 'docu-explorers',
    name: 'Cosmos & Documentary Society',
    slug: 'cosmos',
    description: 'Deep-dive science and nature docuseries synchronized frame-for-frame.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    membersCount: 650,
    activeParties: 1,
    orbits: ['#james-webb-stream', '#nature-stage', '#discussions'],
  },
];

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white">
      {/* Netflix-Style Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/50 to-transparent px-8 py-5 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-8">
          <span className="text-[#E50914] font-black tracking-widest text-2xl font-sans drop-shadow-md">
            ANTIGRAVITY
          </span>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <a href="#universes" className="hover:text-white transition">
              Universes
            </a>
            <a href="#features" className="hover:text-white transition">
              Ultra-Sync
            </a>
            <a href="#bridge" className="hover:text-white transition">
              Extension Bridge
            </a>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Shield className="w-3.5 h-3.5" /> Supabase RLS Protected
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/rooms/universe-alpha-cinema"
            className="flex items-center gap-2 bg-[#E50914] hover:bg-[#b80710] text-white text-sm font-semibold px-4 py-2 rounded-md shadow-lg shadow-[#E50914]/25 transition transform hover:scale-105"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch Live Party
          </Link>
        </div>
      </nav>

      {/* Hero Showcase Section */}
      <section className="relative h-[85vh] w-full flex items-center justify-start px-8 md:px-16 overflow-hidden">
        {/* Background Backdrop with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85"
            alt="Hero Backdrop"
            className="w-full h-full object-cover filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent" />
        </div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-200">
            <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
            Teleparty + Discord Redefined
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Cinematic Sync. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] to-red-400">
              Community Powered.
            </span>
          </h1>

          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            Watch Netflix, Disney+ Hotstar, and direct 4K streams in frame-perfect lockstep.
            Create Discord-style <strong>Universes</strong> with text channels, live audio stages, and sub-second drift correction.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              href="/rooms/universe-alpha-cinema"
              className="flex items-center gap-2 bg-[#E50914] hover:bg-[#b80710] text-white font-bold px-6 py-3 rounded-md shadow-xl shadow-[#E50914]/30 transition transform hover:scale-105 text-base"
            >
              <Play className="w-5 h-5 fill-current" />
              Enter Premiere Room
            </Link>

            <a
              href="#universes"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-md backdrop-blur-md transition border border-white/10 text-base"
            >
              <Compass className="w-5 h-5" />
              Explore Universes
            </a>
          </div>

          {/* Supported Streaming Ecosystem */}
          <div className="pt-6 flex items-center gap-6 text-xs text-gray-400">
            <span className="uppercase tracking-widest font-mono text-[11px] text-gray-500">
              Sync Compatible:
            </span>
            <span className="flex items-center gap-1 font-semibold text-gray-300">
              <Tv className="w-3.5 h-3.5 text-[#E50914]" /> Netflix
            </span>
            <span className="flex items-center gap-1 font-semibold text-gray-300">
              <Tv className="w-3.5 h-3.5 text-blue-400" /> Prime Video
            </span>
            <span className="flex items-center gap-1 font-semibold text-gray-300">
              <Tv className="w-3.5 h-3.5 text-blue-500" /> Hotstar
            </span>
            <span className="flex items-center gap-1 font-semibold text-gray-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400" /> Direct 4K HLS
            </span>
          </div>
        </motion.div>
      </section>

      {/* Featured Universes & Orbits Row (Netflix Card Scale Style) */}
      <section id="universes" className="py-12 px-8 md:px-16 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-[#E50914]" />
            <h2 className="text-2xl font-bold tracking-tight">Active Universes</h2>
          </div>
          <span className="text-sm text-gray-400">Showing top community hubs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_UNIVERSES.map((universe) => (
            <motion.div
              key={universe.id}
              onMouseEnter={() => setHoveredCard(universe.id)}
              onMouseLeave={() => setHoveredCard(null)}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="relative rounded-xl overflow-hidden bg-[#181818] border border-white/5 shadow-2xl flex flex-col group cursor-pointer"
            >
              {/* Card Banner Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={universe.image}
                  alt={universe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/30" />

                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {universe.activeParties} Active Rooms
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#E50914] transition">
                    {universe.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {universe.description}
                  </p>
                </div>

                {/* Orbits Chips */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Orbits
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {universe.orbits.map((orbit) => (
                      <span
                        key={orbit}
                        className="text-[11px] font-mono bg-[#242424] text-gray-300 px-2 py-0.5 rounded border border-white/5"
                      >
                        {orbit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {universe.membersCount} members
                  </span>

                  <Link
                    href={`/rooms/${universe.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-[#E50914] group-hover:translate-x-1 transition-transform"
                  >
                    Join Orbit <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Architecture Matrix */}
      <section id="features" className="py-16 px-8 md:px-16 bg-[#0f0f0f] border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <span className="text-[#E50914] text-xs font-bold uppercase tracking-widest">
            ENGINEERING HIGHLIGHTS
          </span>
          <h2 className="text-3xl font-extrabold">Engineered for Sub-Second Precision</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Combining Supabase Realtime broadcast channels with intelligent drift-seeking and LiveKit WebRTC media stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="p-6 bg-[#181818] rounded-xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#E50914]/20 border border-[#E50914] flex items-center justify-center text-[#E50914]">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">1.5s Drift-Correction</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Playheads are actively compared against the host broadcast. Any divergence over 1.5 seconds triggers smooth seek interpolation with RTT/2 latency compensation.
            </p>
          </div>

          <div className="p-6 bg-[#181818] rounded-xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500 flex items-center justify-center text-blue-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Unified WebRTC Stage</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Integrated audio and video call grid directly alongside the player. Low-latency multi-user mic, camera, deafen, and screen sharing.
            </p>
          </div>

          <div className="p-6 bg-[#181818] rounded-xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Universes & Orbits</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Discord-style communities protected with granular PostgreSQL Row Level Security (RLS) policies, invite tokens, and automated email invites.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-white/5 text-center text-xs text-gray-500">
        <p>© 2026 Antigravity. Built with Next.js, Supabase Realtime, and Tailwind CSS. Vercel-optimized.</p>
      </footer>
    </div>
  );
}
