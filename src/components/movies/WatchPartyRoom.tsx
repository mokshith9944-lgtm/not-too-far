import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Users,
  ShieldCheck,
  Check,
  Copy,
  Clock,
  Send,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  CheckCircle2,
  AlertTriangle,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Crown,
  Monitor,
} from 'lucide-react';
import { Movie } from '../../data/movies';

interface WatchPartyRoomProps {
  movie: Movie;
  roomId: string;
  onLeaveRoom: () => void;
  onSelectOtherMovie: (movie: Movie) => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  timestampTag?: number;
  time: string;
  isHost?: boolean;
}

interface StagePeer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isAudioOn: boolean;
  isVideoOn: boolean;
  speaking: boolean;
}

const QUICK_EMOJIS = ['🍿', '🔥', '😱', '👏', '😂', '❤️', '🤯'];

export const WatchPartyRoom: React.FC<WatchPartyRoomProps> = ({
  movie,
  roomId,
  onLeaveRoom,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // User state
  const [currentUsername] = useState<string>(() => 'User_' + Math.random().toString(36).substring(2, 6));
  const [currentUserAvatar] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
  );
  const [isHost] = useState(true);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDriftCorrecting, setIsDriftCorrecting] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sidebar & tabs
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'stage'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [tagTimestamp, setTagTimestamp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Voice/Video stage media controls
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [deafened, setDeafened] = useState(false);

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'Not Too Far Bot',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&q=80',
      content: `Welcome to the watch party for "${movie.title}"! Ultra-Sync is active.`,
      time: 'Just now',
    },
  ]);

  // Stage participants
  const [stagePeers] = useState<StagePeer[]>([
    {
      id: 'self',
      name: 'You (Host)',
      avatar: currentUserAvatar,
      isHost: true,
      isAudioOn: true,
      isVideoOn: true,
      speaking: false,
    },
    {
      id: 'p1',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
      isHost: false,
      isAudioOn: true,
      isVideoOn: true,
      speaking: true,
    },
    {
      id: 'p2',
      name: 'Elena Vance',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
      isHost: false,
      isAudioOn: false,
      isVideoOn: false,
      speaking: false,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mouse activity controls fading
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(console.warn);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.warn);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.warn);
      setIsFullscreen(false);
    }
  };

  const copyRoomLink = () => {
    const url = `${window.location.origin}/?room=${roomId}&movie=${movie.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      sender: currentUsername,
      avatar: currentUserAvatar,
      content: chatInput.trim(),
      timestampTag: tagTimestamp ? Math.floor(currentTime) : undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHost,
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setTagTimestamp(false);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 flex flex-col bg-[#141414] text-white select-none overflow-hidden"
    >
      {/* Top Header */}
      <header className="h-14 bg-[#141414]/95 border-b border-white/10 px-6 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-[#222222] hover:bg-[#2e2e2e] px-3 py-1.5 rounded-md transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit to Movies
          </button>

          <span className="text-[#E50914] font-black tracking-widest text-lg font-sans">
            NOT TOO FAR
          </span>

          <span className="text-gray-500">|</span>

          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white truncate max-w-sm">
              {movie.title}
            </h1>
            <span className="text-[10px] bg-red-600/30 text-red-400 font-mono font-semibold px-2 py-0.5 rounded border border-red-500/30">
              Room #{roomId.substring(0, 8)}
            </span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ultra-Sync Active (12ms RTT)</span>
          </div>

          <button
            onClick={copyRoomLink}
            className="flex items-center gap-1.5 bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-lg shadow-[#E50914]/20 transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Link Copied!' : 'Invite Friends'}
          </button>
        </div>
      </header>

      {/* Main Split: Video Player + Collapsible Dock */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Video Viewport */}
        <main className="flex-1 relative h-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={movie.videoUrl}
            playsInline
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={() => {
              if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) setDuration(videoRef.current.duration);
            }}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Top Video Overlay Badge */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-4 left-6 right-6 flex items-center justify-between z-20 pointer-events-none"
              >
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 pointer-events-auto">
                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-semibold text-white">
                    Host: {currentUsername} (Synced Playback)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isDriftCorrecting ? (
                    <div className="flex items-center gap-1.5 bg-[#E50914] text-white text-xs font-semibold px-3 py-1 rounded-full animate-pulse shadow-lg">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Aligning Playhead...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Synced with Friends</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Player Overlay Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 pointer-events-auto"
              >
                {/* Scrubber */}
                <div className="mb-3 flex items-center cursor-pointer">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-700/60 rounded-lg appearance-none cursor-pointer accent-[#E50914] hover:h-2 transition-all"
                  />
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-[#E50914] transition p-1"
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7 fill-current" />
                      ) : (
                        <Play className="w-7 h-7 fill-current" />
                      )}
                    </button>

                    <button
                      onClick={() => handleSkip(-10)}
                      className="text-gray-300 hover:text-white transition p-1"
                      title="Rewind 10s"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleSkip(10)}
                      className="text-gray-300 hover:text-white transition p-1"
                      title="Forward 10s"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.muted = !isMuted;
                            setIsMuted(!isMuted);
                          }
                        }}
                        className="text-gray-300 hover:text-white transition"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setVolume(v);
                          if (videoRef.current) {
                            videoRef.current.volume = v;
                            videoRef.current.muted = v === 0;
                            setIsMuted(v === 0);
                          }
                        }}
                        className="w-16 h-1 bg-gray-600 rounded appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    <span className="text-xs text-gray-300 font-mono tracking-tight">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right: Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="text-gray-300 hover:text-white transition p-1"
                    title="Fullscreen"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5" />
                    ) : (
                      <Maximize className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Collapsed Sidebar Pill */}
        <AnimatePresence>
          {isSidebarCollapsed && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => setIsSidebarCollapsed(false)}
              className="absolute top-4 right-4 z-40 bg-[#181818]/90 hover:bg-[#252525] border border-white/10 text-white p-3 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 group transition"
            >
              <ChevronLeft className="w-5 h-5 text-[#E50914]" />
              <span className="text-xs font-semibold pr-1">Open Dock</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Unified Sidebar Dock */}
        <motion.aside
          initial={false}
          animate={{
            width: isSidebarCollapsed ? 0 : 360,
            opacity: isSidebarCollapsed ? 0 : 1,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full bg-[#181818] border-l border-white/10 flex flex-col z-30 overflow-hidden flex-shrink-0"
        >
          {/* Dock Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#121212] border-b border-white/10">
            <div className="flex items-center gap-1 bg-[#1f1f1f] p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  activeTab === 'chat'
                    ? 'bg-[#E50914] text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Live Chat
                <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full font-mono">
                  {messages.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('stage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  activeTab === 'stage'
                    ? 'bg-[#E50914] text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Voice & Calls
                <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full font-mono">
                  {stagePeers.length}
                </span>
              </button>
            </div>

            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="text-gray-400 hover:text-white p-1.5 hover:bg-white/5 rounded transition"
              title="Collapse Dock"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative">
            {/* Tab 1: Live Chat */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full bg-[#141414]">
                {/* Messages list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {messages.map((m) => (
                    <div key={m.id} className="flex items-start gap-2.5">
                      <img
                        src={m.avatar}
                        alt={m.sender}
                        className="w-7 h-7 rounded object-cover flex-shrink-0 border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">
                            {m.sender}
                          </span>
                          {m.isHost && (
                            <span className="text-[9px] bg-red-600/40 text-red-400 font-bold px-1 rounded">
                              Host
                            </span>
                          )}
                          <span className="text-[10px] text-gray-500">{m.time}</span>

                          {m.timestampTag !== undefined && (
                            <button
                              onClick={() => handleSeek(m.timestampTag!)}
                              className="flex items-center gap-0.5 text-[10px] font-mono text-[#E50914] bg-[#E50914]/15 hover:bg-[#E50914]/30 px-1.5 py-0.5 rounded transition"
                              title="Jump video to this time"
                            >
                              <Clock className="w-2.5 h-2.5" />
                              {formatTime(m.timestampTag)}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-300 break-words mt-0.5 leading-relaxed">
                          {m.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick emoji reactions */}
                <div className="px-3 py-1.5 bg-[#181818] border-t border-white/5 flex items-center gap-1 overflow-x-auto">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setChatInput((prev) => prev + emoji)}
                      className="hover:scale-125 transition transform p-1 text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Input form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-[#181818] border-t border-white/10 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <button
                      type="button"
                      onClick={() => setTagTimestamp(!tagTimestamp)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition ${
                        tagTimestamp
                          ? 'bg-[#E50914] text-white font-semibold'
                          : 'bg-[#242424] text-gray-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      Tag Time ({formatTime(currentTime)})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Comment or react..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-[#242424] text-white text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#E50914] placeholder-gray-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2 bg-[#E50914] hover:bg-[#b80710] disabled:opacity-40 text-white rounded transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 2: Voice & Video Call Stage */}
            {activeTab === 'stage' && (
              <div className="flex flex-col h-full bg-[#141414]">
                <div className="flex-1 p-3 grid grid-cols-2 gap-2 overflow-y-auto auto-rows-fr">
                  {stagePeers.map((peer) => {
                    const isSelf = peer.id === 'self';
                    const hasAudio = isSelf ? micActive : peer.isAudioOn;
                    const hasVideo = isSelf ? videoActive : peer.isVideoOn;

                    return (
                      <div
                        key={peer.id}
                        className={`relative rounded-lg overflow-hidden bg-[#1c1c1c] aspect-video flex items-center justify-center border transition-all ${
                          hasAudio && peer.speaking
                            ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'border-white/5'
                        }`}
                      >
                        {hasVideo ? (
                          <img
                            src={peer.avatar}
                            alt={peer.name}
                            className="w-full h-full object-cover filter brightness-90"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <img
                              src={peer.avatar}
                              alt={peer.name}
                              className="w-9 h-9 rounded-full border border-white/20 mb-1"
                            />
                            <span className="text-[10px] text-gray-400">Cam Off</span>
                          </div>
                        )}

                        {peer.isHost && (
                          <div className="absolute top-1 left-1 bg-[#E50914] text-white p-0.5 rounded">
                            <Crown className="w-2.5 h-2.5" />
                          </div>
                        )}

                        <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px]">
                          <span className="truncate max-w-[80px] text-white font-medium">
                            {peer.name}
                          </span>
                          {hasAudio ? (
                            <Mic className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <MicOff className="w-2.5 h-2.5 text-[#E50914]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Media toggles dock */}
                <div className="p-3 bg-[#181818] border-t border-white/10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setMicActive(!micActive)}
                    className={`p-2.5 rounded-full transition ${
                      micActive
                        ? 'bg-[#2b2b2b] text-white hover:bg-[#383838]'
                        : 'bg-[#E50914] text-white hover:bg-[#b80710]'
                    }`}
                    title={micActive ? 'Mute Mic' : 'Unmute Mic'}
                  >
                    {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setVideoActive(!videoActive)}
                    className={`p-2.5 rounded-full transition ${
                      videoActive
                        ? 'bg-[#2b2b2b] text-white hover:bg-[#383838]'
                        : 'bg-[#E50914] text-white hover:bg-[#b80710]'
                    }`}
                    title={videoActive ? 'Turn Off Cam' : 'Turn On Cam'}
                  >
                    {videoActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setDeafened(!deafened)}
                    className={`p-2.5 rounded-full transition ${
                      deafened
                        ? 'bg-[#E50914] text-white hover:bg-[#b80710]'
                        : 'bg-[#2b2b2b] text-white hover:bg-[#383838]'
                    }`}
                    title={deafened ? 'Undeafen' : 'Deafen'}
                  >
                    {deafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setScreenShareActive(!screenShareActive)}
                    className={`p-2.5 rounded-full transition ${
                      screenShareActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#2b2b2b] text-white hover:bg-[#383838]'
                    }`}
                    title="Share Screen"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      </div>
    </div>
  );
};
