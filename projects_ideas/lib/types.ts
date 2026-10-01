export type PlaybackState = 'PLAYING' | 'PAUSED' | 'BUFFERING' | 'SEEKING';
export type PresenceStatus = 'online' | 'idle' | 'dnd' | 'offline';
export type OrbitType = 'text' | 'voice' | 'watch_party';
export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member';
export type MediaType = 'direct' | 'hls' | 'dash' | 'extension_bridge';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  status: PresenceStatus;
  custom_status?: string;
  current_room_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Universe {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  banner_url?: string;
  owner_id: string;
  is_public: boolean;
  invite_code: string;
  member_count?: number;
  created_at: string;
  updated_at: string;
}

export interface UniverseMember {
  id: string;
  universe_id: string;
  user_id: string;
  role: MemberRole;
  nickname?: string;
  joined_at: string;
  profile?: Profile;
}

export interface Orbit {
  id: string;
  universe_id: string;
  name: string;
  type: OrbitType;
  topic?: string;
  position: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartyRoom {
  id: string;
  title: string;
  description?: string;
  universe_id?: string;
  orbit_id?: string;
  host_id: string;
  media_title: string;
  media_url: string;
  media_type: MediaType;
  thumbnail_url?: string;
  duration: number;
  playback_state: PlaybackState;
  current_timestamp: number;
  playback_speed: number;
  is_locked: boolean;
  is_private: boolean;
  passcode?: string;
  max_participants: number;
  last_sync_broadcast: string;
  created_at: string;
  updated_at: string;
  host_profile?: Profile;
}

export interface ChatMessage {
  id: string;
  room_id?: string;
  orbit_id?: string;
  user_id: string;
  content: string;
  timestamp_tag?: number; // In seconds (e.g. 145.2 = 02:25)
  reactions?: Record<string, string[]>; // emoji -> array of user_ids
  attachments?: string[];
  is_pinned?: boolean;
  created_at: string;
  sender?: Profile;
}

export interface RoomParticipant {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  isHost: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  currentPlayhead: number;
  latencyMs: number;
  joinedAt: number;
}

export interface SyncStateBroadcast {
  type: 'SYNC_STATE_BROADCAST';
  roomId: string;
  senderId: string;
  playbackState: PlaybackState;
  currentTime: number;
  playbackSpeed: number;
  timestamp: number; // UTC ms epoch of transmission
  mediaUrl: string;
  mediaTitle: string;
}

export interface SyncActionBroadcast {
  type: 'SYNC_ACTION';
  roomId: string;
  senderId: string;
  action: 'PLAY' | 'PAUSE' | 'SEEK' | 'SPEED_CHANGE' | 'CHANGE_MEDIA';
  targetTime?: number;
  speed?: number;
  mediaUrl?: string;
  mediaTitle?: string;
  timestamp: number;
}

export interface PingPacket {
  type: 'PING';
  clientTimestamp: number;
  senderId: string;
}

export interface PongPacket {
  type: 'PONG';
  clientTimestamp: number;
  serverTimestamp: number;
}
