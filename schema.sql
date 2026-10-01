-- ==============================================================================
-- ANTIGRAVITY - DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Platform: Netflix-grade Video Sync & Discord-style Universes Platform
-- Target: Supabase (PostgreSQL 15+)
-- ==============================================================================

-- 1. EXTENSIONS SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing schema if recreating (optional safe setup)
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. PROFILES (Extended user identity synced with auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    bio TEXT,
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'idle', 'dnd', 'offline', 'watching')),
    streaming_preferences JSONB DEFAULT '{
        "audio_enabled": true,
        "video_enabled": true,
        "auto_drift_correct": true,
        "drift_threshold": 1.5,
        "preferred_quality": "1080p",
        "theme": "netflix_dark"
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 32)
);

-- ------------------------------------------------------------------------------
-- B. UNIVERSES (Discord-style Servers / Communities)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.universes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT DEFAULT 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=256&h=256&q=80',
    banner_url TEXT DEFAULT 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&h=400&q=80',
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT false NOT NULL,
    invite_code VARCHAR(16) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- C. UNIVERSE MEMBERS (Roles & Membership Junction)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.universe_members (
    universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (universe_id, user_id)
);

-- ------------------------------------------------------------------------------
-- D. ORBITS (Discord-style Channels: Text, Audio Stage, or Watch Party)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orbits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'audio', 'watch_party')),
    topic TEXT,
    position INT DEFAULT 0 NOT NULL,
    is_private BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- E. PARTY ROOMS (Synchronized Video Player Session State)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.party_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orbit_id UUID REFERENCES public.orbits(id) ON DELETE SET NULL,
    universe_id UUID REFERENCES public.universes(id) ON DELETE SET NULL,
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Antigravity Watch Party',
    stream_type TEXT NOT NULL DEFAULT 'direct' CHECK (stream_type IN ('direct', 'extension_bridge')),
    media_url TEXT NOT NULL,
    media_title TEXT DEFAULT 'Cinematic Premiere',
    media_thumbnail TEXT DEFAULT 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1280&q=80',
    playback_state TEXT NOT NULL DEFAULT 'PAUSE' CHECK (playback_state IN ('PLAY', 'PAUSE', 'BUFFERING', 'SEEK')),
    current_timestamp NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
    last_synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    drift_threshold_sec NUMERIC(4, 2) DEFAULT 1.50 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    max_participants INT DEFAULT 100 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- F. MESSAGES (Rich text chat, timestamp bookmarks, and sync events)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orbit_id UUID REFERENCES public.orbits(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.party_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    timestamp_tag NUMERIC(10, 3), -- Optional jump-to video time tag in seconds
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'sync_event')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_destination CHECK (orbit_id IS NOT NULL OR room_id IS NOT NULL)
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH-CONCURRENCY QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_universes_slug ON public.universes(slug);
CREATE INDEX IF NOT EXISTS idx_universes_invite ON public.universes(invite_code);
CREATE INDEX IF NOT EXISTS idx_universe_members_user ON public.universe_members(user_id);
CREATE INDEX IF NOT EXISTS idx_orbits_universe ON public.orbits(universe_id, position);
CREATE INDEX IF NOT EXISTS idx_party_rooms_host ON public.party_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_party_rooms_active ON public.party_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_messages_room ON public.messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_orbit ON public.messages(orbit_id, created_at);

-- ==============================================================================
-- 4. DATABASE HELPER FUNCTIONS
-- ==============================================================================

-- Check if user is a member of the given universe
CREATE OR REPLACE FUNCTION public.is_universe_member(target_universe_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.universe_members
        WHERE universe_id = target_universe_id AND user_id = target_user_id
    );
$$;

-- Check if user is an admin or owner of the universe
CREATE OR REPLACE FUNCTION public.is_universe_admin(target_universe_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.universe_members
        WHERE universe_id = target_universe_id 
          AND user_id = target_user_id 
          AND role IN ('owner', 'admin')
    );
$$;

-- Check if user is the room host or universe admin
CREATE OR REPLACE FUNCTION public.can_control_room(target_room_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.party_rooms pr
        WHERE pr.id = target_room_id 
          AND (
              pr.host_id = target_user_id 
              OR (pr.universe_id IS NOT NULL AND public.is_universe_admin(pr.universe_id, target_user_id))
          )
    );
$$;

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_universes
BEFORE UPDATE ON public.universes
FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_party_rooms
BEFORE UPDATE ON public.party_rooms
FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

-- ==============================================================================
-- 5. AUTOMATED USER REGISTRATION TRIGGER
-- Automatically copies newly registered auth.users into public.profiles
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    clean_username TEXT;
BEGIN
    clean_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)
    );

    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        clean_username,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', clean_username),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
        )
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Automatically assign universe creator as 'owner'
CREATE OR REPLACE FUNCTION public.handle_new_universe()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.universe_members (universe_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner')
    ON CONFLICT (universe_id, user_id) DO NOTHING;
    
    -- Auto-seed default general text and watch party orbits
    INSERT INTO public.orbits (universe_id, name, type, topic, position)
    VALUES 
        (NEW.id, 'welcome-lounge', 'text', 'Welcome and introductions', 0),
        (NEW.id, 'cinema-main', 'watch_party', 'Main Premiere Watch Party', 1),
        (NEW.id, 'voice-stage', 'audio', 'Community live voice and video stage', 2);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_universe_created ON public.universes;
CREATE TRIGGER on_universe_created
AFTER INSERT ON public.universes
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_universe();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orbits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone authenticated can view public profiles
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- B. UNIVERSES POLICIES
-- ------------------------------------------------------------------------------
-- Public universes viewable by all; private universes viewable only by members
CREATE POLICY "Public universes viewable by all; private by members"
ON public.universes FOR SELECT
TO authenticated
USING (
    NOT is_private OR public.is_universe_member(id, auth.uid())
);

-- Any authenticated user can create a universe
CREATE POLICY "Authenticated users can create universes"
ON public.universes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Owners and admins can update universe settings
CREATE POLICY "Universe owners and admins can update"
ON public.universes FOR UPDATE
TO authenticated
USING (public.is_universe_admin(id, auth.uid()))
WITH CHECK (public.is_universe_admin(id, auth.uid()));

-- Only owner can delete the universe
CREATE POLICY "Only owner can delete universe"
ON public.universes FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- ------------------------------------------------------------------------------
-- C. UNIVERSE MEMBERS POLICIES
-- ------------------------------------------------------------------------------
-- Members of a universe can see other members
CREATE POLICY "Members can view membership in accessible universes"
ON public.universe_members FOR SELECT
TO authenticated
USING (
    public.is_universe_member(universe_id, auth.uid()) OR
    EXISTS (SELECT 1 FROM public.universes u WHERE u.id = universe_id AND NOT u.is_private)
);

-- Users can join public universes or admins can add members
CREATE POLICY "Users can join public universes or by invite"
ON public.universe_members FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() OR public.is_universe_admin(universe_id, auth.uid())
);

-- Admins can update roles; members cannot modify their own role
CREATE POLICY "Admins can update member roles"
ON public.universe_members FOR UPDATE
TO authenticated
USING (public.is_universe_admin(universe_id, auth.uid()))
WITH CHECK (public.is_universe_admin(universe_id, auth.uid()));

-- Members can leave (delete own record) or admins can kick members
CREATE POLICY "Users can leave or admins can kick members"
ON public.universe_members FOR DELETE
TO authenticated
USING (
    user_id = auth.uid() OR public.is_universe_admin(universe_id, auth.uid())
);

-- ------------------------------------------------------------------------------
-- D. ORBITS POLICIES
-- ------------------------------------------------------------------------------
-- View orbits if user has access to parent universe
CREATE POLICY "Orbits viewable by universe members"
ON public.orbits FOR SELECT
TO authenticated
USING (
    public.is_universe_member(universe_id, auth.uid()) OR
    EXISTS (SELECT 1 FROM public.universes u WHERE u.id = universe_id AND NOT u.is_private)
);

-- Admins can create orbits
CREATE POLICY "Admins can create orbits"
ON public.orbits FOR INSERT
TO authenticated
WITH CHECK (public.is_universe_admin(universe_id, auth.uid()));

-- Admins can update orbits
CREATE POLICY "Admins can update orbits"
ON public.orbits FOR UPDATE
TO authenticated
USING (public.is_universe_admin(universe_id, auth.uid()))
WITH CHECK (public.is_universe_admin(universe_id, auth.uid()));

-- Admins can delete orbits
CREATE POLICY "Admins can delete orbits"
ON public.orbits FOR DELETE
TO authenticated
USING (public.is_universe_admin(universe_id, auth.uid()));

-- ------------------------------------------------------------------------------
-- E. PARTY ROOMS POLICIES
-- ------------------------------------------------------------------------------
-- Viewable by anyone if public, or members of the attached universe
CREATE POLICY "Party rooms viewable by universe members or public"
ON public.party_rooms FOR SELECT
TO authenticated
USING (
    universe_id IS NULL OR
    public.is_universe_member(universe_id, auth.uid()) OR
    EXISTS (SELECT 1 FROM public.universes u WHERE u.id = universe_id AND NOT u.is_private)
);

-- Authenticated users can create party rooms
CREATE POLICY "Authenticated users can create party rooms"
ON public.party_rooms FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = host_id);

-- Room host or universe admins can update room state (play/pause/seek)
CREATE POLICY "Room host or admins can update playback state"
ON public.party_rooms FOR UPDATE
TO authenticated
USING (public.can_control_room(id, auth.uid()))
WITH CHECK (public.can_control_room(id, auth.uid()));

-- Room host or admins can delete/close room
CREATE POLICY "Room host or admins can delete room"
ON public.party_rooms FOR DELETE
TO authenticated
USING (public.can_control_room(id, auth.uid()));

-- ------------------------------------------------------------------------------
-- F. MESSAGES POLICIES
-- ------------------------------------------------------------------------------
-- Messages are viewable by members of the orbit or active room participants
CREATE POLICY "Messages viewable by channel or room participants"
ON public.messages FOR SELECT
TO authenticated
USING (
    (room_id IS NOT NULL) OR
    (orbit_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.orbits o 
        WHERE o.id = orbit_id AND public.is_universe_member(o.universe_id, auth.uid())
    ))
);

-- Users can insert messages as themselves
CREATE POLICY "Authenticated users can post messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages, or admins can moderate
CREATE POLICY "Users can delete own messages or admins moderate"
ON public.messages FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id OR
    (orbit_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.orbits o 
        WHERE o.id = orbit_id AND public.is_universe_admin(o.universe_id, auth.uid())
    ))
);

-- ==============================================================================
-- 7. SUPABASE REALTIME REPLICATION CONFIGURATION
-- ==============================================================================
-- Enable Realtime publication for dynamic sync state and chat
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.party_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
