'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Clock, Smile, Sparkles, Hash, Flame, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChatMessage, Profile } from '@/lib/types';
import { formatTimecode } from '@/lib/sync-engine';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUser: Profile;
  currentVideoTime: number;
  onSendMessage: (content: string, timestampTag?: number) => void;
  onSeekToTimestamp: (seconds: number) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
}

const QUICK_EMOJIS = ['🍿', '🔥', '😱', '❤️', '👏', '🎬'];

export default function ChatPanel({
  messages,
  currentUser,
  currentVideoTime,
  onSendMessage,
  onSeekToTimestamp,
  onAddReaction,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const tag = includeTimestamp ? Math.floor(currentVideoTime) : undefined;
    onSendMessage(inputText.trim(), tag);
    setInputText('');
    setIncludeTimestamp(false);
  };

  const handleConfetti = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#E50914', '#ffffff', '#FFD700'],
    });
  };

  return (
    <div className="flex flex-col h-full bg-netflix-surface text-white">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text">
        {messages.map((msg) => {
          const isMe = msg.user_id === currentUser.id;
          const sender = msg.sender || {
            display_name: 'Member',
            username: 'member',
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          };

          return (
            <div key={msg.id} className="group relative flex items-start space-x-2.5">
              <img
                src={sender.avatar_url}
                alt={sender.display_name}
                className="w-7 h-7 rounded object-cover border border-white/10 mt-0.5"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-semibold ${isMe ? 'text-netflix-red' : 'text-white'}`}>
                    {sender.display_name}
                  </span>

                  {/* Clickable timestamp tag */}
                  {msg.timestamp_tag !== undefined && (
                    <button
                      onClick={() => onSeekToTimestamp(msg.timestamp_tag!)}
                      className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-netflix-red/20 hover:bg-netflix-red/30 border border-netflix-red/40 text-[10px] font-mono text-netflix-red transition-colors"
                      title="Click to seek video to this moment"
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatTimecode(msg.timestamp_tag)}</span>
                    </button>
                  )}

                  <span className="text-[10px] text-netflix-muted font-mono">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-gray-200 mt-0.5 break-words leading-relaxed">
                  {msg.content}
                </p>

                {/* Reactions badge bar */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                      <button
                        key={emoji}
                        onClick={() => onAddReaction && onAddReaction(msg.id, emoji)}
                        className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[11px] border ${
                          userIds.includes(currentUser.id)
                            ? 'bg-netflix-red/20 border-netflix-red text-white'
                            : 'bg-white/5 border-white/10 text-netflix-gray hover:bg-white/10'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="font-mono text-[10px]">{userIds.length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Bar */}
      <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between bg-black/40">
        <div className="flex items-center space-x-1.5">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={(e) => {
                onSendMessage(emoji, includeTimestamp ? Math.floor(currentVideoTime) : undefined);
                if (emoji === '🍿' || emoji === '🔥') handleConfetti(e);
              }}
              className="p-1 rounded hover:bg-white/10 text-sm hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>

        <button
          onClick={handleConfetti}
          className="p-1 rounded hover:bg-white/10 text-netflix-gold hover:scale-110 transition-transform"
          title="Blast Confetti"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Input Dock */}
      <form onSubmit={handleSend} className="p-3 bg-netflix-dark border-t border-white/10 space-y-2">
        {/* Timestamp tag switch */}
        <div className="flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setIncludeTimestamp(!includeTimestamp)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-all ${
              includeTimestamp
                ? 'bg-netflix-red text-white font-semibold shadow-glow-red'
                : 'text-netflix-muted hover:text-white bg-white/5'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Tag at {formatTimecode(currentVideoTime)}</span>
          </button>
          <span className="text-netflix-muted font-mono text-[10px]">Markdown / @mentions</span>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              includeTimestamp
                ? `Discuss timestamp ${formatTimecode(currentVideoTime)}...`
                : 'Chat with room participants...'
            }
            className="flex-1 bg-netflix-card border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded bg-netflix-red hover:bg-netflix-redHover disabled:opacity-40 disabled:hover:bg-netflix-red text-white transition-all shadow-glow-red"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
