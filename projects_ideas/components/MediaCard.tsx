'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Users, Lock, Unlock, Copy, Check, Radio, Clock } from 'lucide-react';
import { PartyRoom } from '@/lib/types';
import { formatTimecode } from '@/lib/sync-engine';

interface MediaCardProps {
  room: PartyRoom;
  onCopyLink?: (roomId: string) => void;
}

export default function MediaCard({ room, onCopyLink }: MediaCardProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/rooms/${room.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative group rounded-md overflow-hidden bg-netflix-surface border border-white/5 shadow-md transition-all duration-300 hover:scale-105 hover:z-30 hover:border-netflix-red/50 hover:shadow-glow-red"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/rooms/${room.id}`} className="block relative aspect-video w-full overflow-hidden bg-black/60">
        <img
          src={room.thumbnail_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80'}
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Live Status indicator */}
        <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-semibold">
          <span
            className={`w-2 h-2 rounded-full ${
              room.playback_state === 'PLAYING' ? 'bg-netflix-red animate-pulse' : 'bg-yellow-400'
            }`}
          />
          <span className="text-white uppercase">{room.playback_state}</span>
        </div>

        {/* Lock indicator */}
        <div className="absolute top-2.5 right-2.5 p-1 rounded bg-black/60 backdrop-blur-sm text-white/80">
          {room.is_locked ? <Lock className="w-3.5 h-3.5 text-yellow-400" /> : <Unlock className="w-3.5 h-3.5 text-green-400" />}
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-base via-transparent to-transparent opacity-80" />

        {/* Playhead progress bar at bottom */}
        {room.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-netflix-red"
              style={{
                width: `${Math.min(100, (room.current_timestamp / room.duration) * 100)}%`,
              }}
            />
          </div>
        )}
      </Link>

      {/* Card Info Details */}
      <div className="p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/rooms/${room.id}`}>
            <h3 className="font-bold text-sm text-white hover:text-netflix-red transition-colors line-clamp-1">
              {room.media_title}
            </h3>
          </Link>
          <button
            onClick={handleCopy}
            className="p-1 text-netflix-muted hover:text-white transition-colors"
            title="Copy Invite Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-xs text-netflix-gray line-clamp-2">
          {room.title}
        </p>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-netflix-muted font-mono">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimecode(room.current_timestamp)} / {formatTimecode(room.duration)}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-netflix-gray">
            <Users className="w-3 h-3 text-netflix-red" />
            <span>Active Party</span>
          </div>
        </div>

        {/* Hover action bar */}
        <div className="pt-2 flex items-center gap-2">
          <Link
            href={`/rooms/${room.id}`}
            className="flex-1 flex items-center justify-center space-x-1.5 bg-netflix-red hover:bg-netflix-redHover text-white py-1.5 px-3 rounded text-xs font-semibold shadow-glow-red transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Join Party</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
