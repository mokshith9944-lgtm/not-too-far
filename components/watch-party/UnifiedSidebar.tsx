'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { WebRTCGrid } from './WebRTCGrid';
import { ChatMessagePayload, ParticipantPresence } from '../../lib/supabase';

interface UnifiedSidebarProps {
  messages: ChatMessagePayload[];
  participants: ParticipantPresence[];
  currentUserId: string;
  isHost: boolean;
  currentPlayhead: number;
  onSendMessage: (content: string, timestampTag?: number) => void;
  onSeekToTimestamp: (timestampSeconds: number) => void;
}

export const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
  messages,
  participants,
  currentUserId,
  isHost,
  currentPlayhead,
  onSendMessage,
  onSeekToTimestamp,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'stage'>('chat');

  return (
    <>
      {/* Floating Expand Pill when Sidebar is Collapsed */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => setIsCollapsed(false)}
            className="absolute top-20 right-4 z-40 bg-[#181818]/90 hover:bg-[#252525] border border-white/10 text-white p-3 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 group transition"
            title="Open Watch Party Dock"
          >
            <ChevronLeft className="w-5 h-5 text-[#E50914] group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-semibold pr-1">Community Dock</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Collapsible Dock */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 0 : 360,
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="h-full bg-[#181818] border-l border-white/5 flex flex-col z-30 overflow-hidden flex-shrink-0 select-none"
      >
        {/* Dock Header Tabs */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#101010] border-b border-white/10">
          <div className="flex items-center gap-1 bg-[#1f1f1f] p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'chat'
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
              <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full font-mono">
                {messages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('stage')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'stage'
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Voice & Stage
              <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full font-mono">
                {participants.length || 3}
              </span>
            </button>
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-gray-400 hover:text-white p-1.5 hover:bg-white/5 rounded transition"
            title="Collapse Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-hidden relative">
          <div
            className={`w-full h-full ${
              activeTab === 'chat' ? 'block' : 'hidden'
            }`}
          >
            <ChatPanel
              messages={messages}
              currentPlayhead={currentPlayhead}
              onSendMessage={onSendMessage}
              onSeekToTimestamp={onSeekToTimestamp}
            />
          </div>

          <div
            className={`w-full h-full ${
              activeTab === 'stage' ? 'block' : 'hidden'
            }`}
          >
            <WebRTCGrid
              participants={participants}
              currentUserId={currentUserId}
              isHost={isHost}
            />
          </div>
        </div>
      </motion.aside>
    </>
  );
};
