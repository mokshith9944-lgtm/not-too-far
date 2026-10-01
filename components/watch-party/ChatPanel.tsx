'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Clock } from 'lucide-react';
import { ChatMessagePayload } from '../../lib/supabase';
import { formatVideoTime } from '../../lib/sync-engine';

interface ChatPanelProps {
  messages: ChatMessagePayload[];
  currentPlayhead: number;
  onSendMessage: (content: string, timestampTag?: number) => void;
  onSeekToTimestamp: (timestampSeconds: number) => void;
}

const QUICK_EMOJIS = ['🍿', '🔥', '😱', '👏', '😂', '❤️', '🤯'];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentPlayhead,
  onSendMessage,
  onSeekToTimestamp,
}) => {
  const [inputText, setInputText] = useState('');
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(
      inputText.trim(),
      includeTimestamp ? Math.floor(currentPlayhead) : undefined
    );

    setInputText('');
    setIncludeTimestamp(false);
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-gray-200">
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-6">
            <span className="text-3xl mb-2">🍿</span>
            <p className="text-sm font-medium">Watch Party Chat Ready</p>
            <p className="text-xs text-gray-600 mt-1">
              Share your thoughts, reactions, and timestamped highlights!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 group">
              <img
                src={msg.avatarUrl}
                alt={msg.username}
                className="w-8 h-8 rounded object-cover flex-shrink-0 border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white truncate">
                    {msg.username}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {/* Clickable Timestamp Tag */}
                  {msg.timestampTag !== undefined && (
                    <button
                      onClick={() => onSeekToTimestamp(msg.timestampTag!)}
                      className="flex items-center gap-1 text-[11px] font-mono font-medium text-[#E50914] bg-[#E50914]/10 hover:bg-[#E50914]/20 border border-[#E50914]/30 px-1.5 py-0.5 rounded transition"
                      title="Jump video to this timestamp"
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {formatVideoTime(msg.timestampTag)}
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-300 break-words mt-0.5 leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Reaction Bar */}
      <div className="px-4 py-2 bg-[#181818]/60 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleAddEmoji(emoji)}
            className="hover:scale-125 transition transform p-1 text-base"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Dock */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-[#181818] border-t border-white/10 flex flex-col gap-2"
      >
        <div className="flex items-center justify-between text-xs text-gray-400">
          <button
            type="button"
            onClick={() => setIncludeTimestamp(!includeTimestamp)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition ${
              includeTimestamp
                ? 'bg-[#E50914] text-white font-semibold'
                : 'bg-[#262626] text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            Tag Time ({formatVideoTime(currentPlayhead)})
          </button>
          <span className="text-[10px] text-gray-500">Press Enter to send</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message or react..."
            className="flex-1 bg-[#262626] text-white text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#E50914] placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-[#E50914] hover:bg-[#b80710] disabled:bg-[#333333] disabled:text-gray-500 text-white rounded transition flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
