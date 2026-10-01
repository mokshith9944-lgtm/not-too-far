'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Compass,
  Hash,
  Volume2,
  Tv,
  Users,
  Settings,
  Plus,
  Send,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  Crown,
  Shield,
  Smile,
  Radio
} from 'lucide-react';
import { MOCK_UNIVERSES, MOCK_ORBITS, MOCK_PARTICIPANTS, CURRENT_USER, MOCK_ROOMS } from '@/lib/mock-data';
import { Orbit, ChatMessage } from '@/lib/types';
import CreateRoomModal from '@/components/CreateRoomModal';

interface UniversePageProps {
  params: {
    id: string;
  };
}

export default function UniverseDetailPage({ params }: UniversePageProps) {
  const universeId = params.id;
  const universe = MOCK_UNIVERSES.find((u) => u.id === universeId) || MOCK_UNIVERSES[0];

  const [activeOrbitId, setActiveOrbitId] = useState<string>(MOCK_ORBITS[0].id);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [orbitMessages, setOrbitMessages] = useState<Record<string, ChatMessage[]>>({
    [MOCK_ORBITS[1].id]: [
      {
        id: 'orbit-msg-1',
        orbit_id: MOCK_ORBITS[1].id,
        user_id: MOCK_PARTICIPANTS[0].id,
        content: 'Welcome to the Universe general channel! What film are we syncing tonight?',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        sender: MOCK_PARTICIPANTS[0],
      },
      {
        id: 'orbit-msg-2',
        orbit_id: MOCK_ORBITS[1].id,
        user_id: CURRENT_USER.id,
        content: 'The 4K remaster of Tears of Steel was incredible. Zero latency on WebRTC.',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        sender: CURRENT_USER,
      },
    ],
  });

  const activeOrbit = MOCK_ORBITS.find((o) => o.id === activeOrbitId) || MOCK_ORBITS[0];
  const watchRoomsInUniverse = MOCK_ROOMS.filter((r) => r.universe_id === universe.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      orbit_id: activeOrbitId,
      user_id: CURRENT_USER.id,
      content: inputText.trim(),
      created_at: new Date().toISOString(),
      sender: CURRENT_USER,
    };

    setOrbitMessages((prev) => ({
      ...prev,
      [activeOrbitId]: [...(prev[activeOrbitId] || []), newMsg],
    }));
    setInputText('');
  };

  return (
    <div className="w-screen h-screen bg-netflix-dark flex overflow-hidden select-none">
      {/* 1. DISCORD-STYLE SERVER NAVIGATION RAIL (Leftmost bar) */}
      <nav className="w-16 bg-[#0c0c0c] border-r border-white/5 flex flex-col items-center py-3 space-y-3 z-30">
        <Link
          href="/"
          className="w-12 h-12 rounded-2xl bg-netflix-surface hover:bg-netflix-red flex items-center justify-center text-white transition-all hover:scale-105 group"
          title="Return to Home"
        >
          <Film className="w-6 h-6 text-netflix-red group-hover:text-white" />
        </Link>

        <div className="w-8 h-0.5 bg-white/10 rounded-full" />

        {/* Server Icons */}
        <div className="flex-1 space-y-2 overflow-y-auto w-full flex flex-col items-center">
          {MOCK_UNIVERSES.map((u) => {
            const isActive = u.id === universe.id;
            return (
              <Link
                key={u.id}
                href={`/universes/${u.id}`}
                className={`relative group w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'rounded-xl ring-2 ring-netflix-red scale-105'
                    : 'hover:rounded-xl hover:scale-105'
                }`}
                title={u.name}
              >
                <img
                  src={u.icon_url}
                  alt={u.name}
                  className="w-full h-full object-cover rounded-[inherit]"
                />
                {isActive && (
                  <span className="absolute -left-1 w-1.5 h-7 bg-netflix-red rounded-r-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom profile pill */}
        <div className="relative">
          <img
            src={CURRENT_USER.avatar_url}
            alt={CURRENT_USER.display_name}
            className="w-10 h-10 rounded-full object-cover border border-white/20"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black" />
        </div>
      </nav>

      {/* 2. ORBITS SIDEBAR (Channels list within universe) */}
      <aside className="w-60 bg-netflix-surface border-r border-white/10 flex flex-col z-20">
        {/* Universe Header Banner */}
        <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center space-x-2 truncate">
            <h2 className="font-extrabold text-sm text-white tracking-wide truncate">
              {universe.name}
            </h2>
          </div>
          <ChevronDown className="w-4 h-4 text-netflix-gray" />
        </div>

        {/* Orbit Channel Groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Watch Party Rooms Group */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-netflix-muted uppercase tracking-wider px-2 mb-1">
              <span>Watch Parties (Cinema)</span>
              <button
                onClick={() => setIsCreateRoomOpen(true)}
                className="hover:text-white"
                title="Create Synced Room"
              >
                <Plus className="w-3.5 h-3.5 text-netflix-red" />
              </button>
            </div>
            <div className="space-y-0.5">
              {MOCK_ORBITS.filter((o) => o.type === 'watch_party').map((orbit) => (
                <button
                  key={orbit.id}
                  onClick={() => setActiveOrbitId(orbit.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
                    activeOrbitId === orbit.id
                      ? 'bg-netflix-red/20 text-white font-semibold border-l-2 border-netflix-red'
                      : 'text-netflix-gray hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Tv className="w-3.5 h-3.5 text-netflix-red" />
                    <span>{orbit.name}</span>
                  </div>
                  <Radio className="w-3 h-3 text-netflix-red animate-pulse" />
                </button>
              ))}
            </div>
          </div>

          {/* Text Channels Group */}
          <div>
            <div className="text-[11px] font-bold text-netflix-muted uppercase tracking-wider px-2 mb-1">
              <span>Text Channels</span>
            </div>
            <div className="space-y-0.5">
              {MOCK_ORBITS.filter((o) => o.type === 'text').map((orbit) => (
                <button
                  key={orbit.id}
                  onClick={() => setActiveOrbitId(orbit.id)}
                  className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs transition-colors ${
                    activeOrbitId === orbit.id
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-netflix-gray hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5 text-netflix-muted" />
                  <span>{orbit.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Lounges Group */}
          <div>
            <div className="text-[11px] font-bold text-netflix-muted uppercase tracking-wider px-2 mb-1">
              <span>Voice Lounges</span>
            </div>
            <div className="space-y-0.5">
              {MOCK_ORBITS.filter((o) => o.type === 'voice').map((orbit) => (
                <button
                  key={orbit.id}
                  onClick={() => setActiveOrbitId(orbit.id)}
                  className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs transition-colors ${
                    activeOrbitId === orbit.id
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-netflix-gray hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5 text-green-400" />
                  <span>{orbit.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current user bottom dock */}
        <div className="p-3 bg-[#0d0d0d] border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <img
              src={CURRENT_USER.avatar_url}
              alt={CURRENT_USER.display_name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{CURRENT_USER.display_name}</p>
              <p className="text-[10px] text-green-400 truncate">● Online</p>
            </div>
          </div>
          <Link href="/login" className="text-netflix-muted hover:text-white">
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* 3. CENTER ACTIVE ORBIT CONTENT */}
      <main className="flex-1 flex flex-col bg-netflix-dark relative">
        {/* Top Channel Header */}
        <header className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-netflix-surface/40 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            {activeOrbit.type === 'watch_party' ? (
              <Tv className="w-5 h-5 text-netflix-red" />
            ) : activeOrbit.type === 'voice' ? (
              <Volume2 className="w-5 h-5 text-green-400" />
            ) : (
              <Hash className="w-5 h-5 text-netflix-gray" />
            )}
            <div>
              <h3 className="font-bold text-sm text-white tracking-wide">{activeOrbit.name}</h3>
              <p className="text-[11px] text-netflix-muted">{activeOrbit.topic}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCreateRoomOpen(true)}
              className="flex items-center space-x-1.5 bg-netflix-red hover:bg-netflix-redHover text-white px-3 py-1.5 rounded text-xs font-semibold shadow-glow-red transition-all"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Launch Room</span>
            </button>
          </div>
        </header>

        {/* Orbit Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeOrbit.type === 'watch_party' ? (
            /* Watch party orbit mode: show cinema screen status */
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-netflix-surface border border-white/10 space-y-4">
                <div className="flex items-center space-x-2 text-netflix-red text-xs font-mono font-semibold uppercase">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Synchronized Cinema Screen Live</span>
                </div>
                <h2 className="text-2xl font-black text-white">
                  Active Screen: {watchRoomsInUniverse[0]?.title || 'Main Cinema Stage'}
                </h2>
                <p className="text-xs text-netflix-gray max-w-xl">
                  {watchRoomsInUniverse[0]?.description ||
                    'Zero-drift synchronized playback room for universe members.'}
                </p>

                <div className="pt-2">
                  <Link
                    href={`/rooms/${watchRoomsInUniverse[0]?.id || MOCK_ROOMS[0].id}`}
                    className="inline-flex items-center space-x-2 bg-netflix-red hover:bg-netflix-redHover text-white px-5 py-2.5 rounded text-xs font-bold shadow-glow-red hover:scale-105 transition-all"
                  >
                    <Tv className="w-4 h-4" />
                    <span>Enter Synchronized Watch Room</span>
                  </Link>
                </div>
              </div>

              {/* Sample Watch Room Media */}
              <div>
                <h4 className="text-xs font-bold text-netflix-muted uppercase tracking-wider mb-3">
                  Watch Parties in this Universe
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {watchRoomsInUniverse.map((room) => (
                    <div
                      key={room.id}
                      className="p-4 rounded-lg bg-netflix-card border border-white/5 flex items-center justify-between"
                    >
                      <div>
                        <h5 className="font-bold text-sm text-white">{room.media_title}</h5>
                        <p className="text-xs text-netflix-muted">{room.title}</p>
                      </div>
                      <Link
                        href={`/rooms/${room.id}`}
                        className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
                      >
                        Join
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Text Orbit Mode */
            <div className="space-y-4">
              {(orbitMessages[activeOrbit.id] || []).map((msg) => (
                <div key={msg.id} className="flex items-start space-x-3 group">
                  <img
                    src={msg.sender?.avatar_url}
                    alt={msg.sender?.display_name}
                    className="w-9 h-9 rounded-full object-cover mt-0.5"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">
                        {msg.sender?.display_name}
                      </span>
                      <span className="text-[10px] text-netflix-muted">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 mt-1 select-text leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Text Orbit Message Input Bar */}
        {activeOrbit.type === 'text' && (
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-netflix-surface/60 border-t border-white/10"
          >
            <div className="flex items-center space-x-2 bg-netflix-card border border-white/10 rounded-lg px-4 py-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message #${activeOrbit.name}...`}
                className="flex-1 bg-transparent text-xs text-white placeholder-netflix-muted focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-1.5 rounded bg-netflix-red hover:bg-netflix-redHover text-white transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </main>

      {/* 4. RIGHT MEMBERS LIST */}
      <aside className="w-56 bg-netflix-surface border-l border-white/10 p-4 space-y-4 hidden lg:block overflow-y-auto">
        <h4 className="text-[11px] font-bold text-netflix-muted uppercase tracking-wider">
          Members — {MOCK_PARTICIPANTS.length}
        </h4>

        <div className="space-y-3">
          {MOCK_PARTICIPANTS.map((participant, index) => (
            <div key={participant.id} className="flex items-center space-x-2.5">
              <div className="relative">
                <img
                  src={participant.avatar_url}
                  alt={participant.display_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-black" />
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-semibold text-white truncate">
                    {participant.display_name}
                  </span>
                  {index === 0 && <Crown className="w-3 h-3 text-netflix-gold shrink-0" />}
                </div>
                <p className="text-[10px] text-netflix-muted truncate">
                  {index === 0 ? 'Director / Owner' : 'Cinephile'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        universeId={universe.id}
      />
    </div>
  );
}
