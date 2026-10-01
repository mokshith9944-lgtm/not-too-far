'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Info, Volume2, VolumeX, Users, Radio, Sparkles, ShieldCheck } from 'lucide-react';
import { MOCK_ROOMS } from '@/lib/mock-data';

interface HeroBannerProps {
  onQuickJoin?: (roomId: string) => void;
}

export default function HeroBanner({ onQuickJoin }: HeroBannerProps) {
  const [isMuted, setIsMuted] = useState(true);
  const featured = MOCK_ROOMS[0];

  return (
    <div className="relative w-full h-[75vh] min-h-[500px] max-h-[780px] bg-netflix-dark overflow-hidden flex items-center">
      {/* Background Image / Cinema Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={featured.thumbnail_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80'}
          alt={featured.title}
          className="w-full h-full object-cover object-center filter brightness-60 scale-105 transform duration-1000"
        />
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-base via-netflix-base/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-base via-netflix-base/60 to-transparent w-2/3" />
        <div className="absolute -inset-x-20 -bottom-20 h-40 bg-radial-gradient from-netflix-red/10 to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="max-w-2xl space-y-4">
          {/* Status pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-netflix-red/20 border border-netflix-red/40 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-netflix-red animate-pulse" />
            <span>Featured Live Synced Room</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="text-netflix-gray font-mono">14 Watching</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg leading-tight">
            {featured.media_title}
          </h1>

          {/* Badges / Tech Specs */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-netflix-gray font-medium">
            <span className="text-green-400 font-bold">99% Match</span>
            <span className="border border-white/30 px-1.5 py-0.5 rounded text-[10px] text-white">4K ULTRA HD</span>
            <span className="border border-white/30 px-1.5 py-0.5 rounded text-[10px] text-white">SPATIAL WEBRTC</span>
            <span className="text-netflix-red font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero-Drift Sync
            </span>
            <span>9m 56s Duration</span>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed line-clamp-3 max-w-xl drop-shadow">
            {featured.description}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href={`/rooms/${featured.id}`}
              className="flex items-center space-x-2 bg-white text-black hover:bg-white/90 px-6 py-2.5 rounded-md font-bold text-sm tracking-wide shadow-lg hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 fill-black text-black" />
              <span>Join Watch Party</span>
            </Link>

            <Link
              href="/universes/11111111-1111-1111-1111-111111111111"
              className="flex items-center space-x-2 bg-netflix-card/80 hover:bg-netflix-card border border-white/20 text-white px-5 py-2.5 rounded-md font-semibold text-sm backdrop-blur-md transition-all hover:border-white/40"
            >
              <Users className="w-4 h-4 text-netflix-red" />
              <span>Enter Universe</span>
            </Link>

            <Link
              href="/extension-bridge"
              className="hidden sm:flex items-center space-x-1.5 text-xs text-netflix-gray hover:text-white px-3 py-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-netflix-gold" />
              <span>External Stream Bridge</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Audio & Age Rating tags (Right side) */}
      <div className="absolute right-6 bottom-16 z-20 hidden md:flex items-center space-x-3">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 hover:scale-105 transition-all"
          title={isMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <div className="bg-black/60 border-l-2 border-netflix-red px-3 py-1 text-xs text-gray-300 font-semibold uppercase tracking-wider backdrop-blur-sm">
          PG-13 • Sync Room #1
        </div>
      </div>
    </div>
  );
}
