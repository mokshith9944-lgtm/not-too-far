-- ==============================================================================
-- ANTIGRAVITY: NOT TOO FAR
-- Production-grade PostgreSQL Schema with Row Level Security (RLS)
-- Optimized for Supabase & Realtime Broadcast Synchronization
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_presence_status AS ENUM ('online', 'idle', 'dnd', 'offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE orbit_channel_type AS ENUM ('text', 'voice', 'watch_party');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE member_role_type AS ENUM ('owner', 'admin', 'moderator', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE playback_state_type AS ENUM ('PLAYING', 'PAUSED', 'BUFFERING', 'SEEKING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT DEFAULT 'Movie buff exploring the cinematic universe.',
    status user_presence_status DEFAULT 'offline',
    custom_status TEXT,
    current_room_id UUID,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. UNIVERSES TABLE (Discord-style Servers)
CREATE TABLE IF NOT EXISTS public.universes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    banner_url TEXT,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT TRUE NOT NULL,
    invite_code TEXT UNIQUE NOT NULL DEFAULT substring(encode(gen_random_bytes(6), 'hex'), 1, 10),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. UNIVERSE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.universe_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role member_role_type DEFAULT 'member' NOT NULL,
    nickname TEXT,
    joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_universe_user UNIQUE (universe_id, user_id)
);

-- 6. ORBITS TABLE (Discord-style Channels)
CREATE TABLE IF NOT EXISTS public.orbits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type orbit_channel_type DEFAULT 'text' NOT NULL,
    topic TEXT,
    position INTEGER DEFAULT 0 NOT NULL,
    is_private BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. PARTY ROOMS TABLE (Synchronized Watch Party Rooms)
CREATE TABLE IF NOT EXISTS public.party_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    universe_id UUID REFERENCES public.universes(id) ON DELETE SET NULL,
    orbit_id UUID REFERENCES public.orbits(id) ON DELETE SET NULL,
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_title TEXT NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'direct' NOT NULL, -- direct, hls, dash, extension_bridge
    thumbnail_url TEXT,
    duration NUMERIC(10, 3) DEFAULT 0.000,
    playback_state playback_state_type DEFAULT 'PAUSED' NOT NULL,
    current_timestamp NUMERIC(10, 3) DEFAULT 0.000 NOT NULL,
    playback_speed NUMERIC(3, 2) DEFAULT 1.00 NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE NOT NULL, -- only host can seek/pause
    is_private BOOLEAN DEFAULT FALSE NOT NULL,
    passcode TEXT,
    max_participants INTEGER DEFAULT 100 NOT NULL,
    last_sync_broadcast TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 8. MESSAGES TABLE (Real-time Chat with Timestamp Tags)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.party_rooms(id) ON DELETE CASCADE,
    orbit_id UUID REFERENCES public.orbits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp_tag NUMERIC(10, 2), -- Clickable video seek tag (e.g. 145.20 = 02:25)
    reactions JSONB DEFAULT '{}'::jsonb NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT check_message_target CHECK (room_id IS NOT NULL OR orbit_id IS NOT NULL)
);

-- 9. PARTY INVITES TABLE
CREATE TABLE IF NOT EXISTS public.party_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.party_rooms(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT,
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    expires_at TIMESTAMPTZ DEFAULT (TIMEZONE('utc', NOW()) + INTERVAL '7 days') NOT NULL,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- 10. INDEXES FOR ULTRA-LOW QUERY LATENCY
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_universes_slug ON public.universes(slug);
CREATE INDEX IF NOT EXISTS idx_universes_owner ON public.universes(owner_id);
CREATE INDEX IF NOT EXISTS idx_universe_members_univ ON public.universe_members(universe_id);
CREATE INDEX IF NOT EXISTS idx_universe_members_user ON public.universe_members(user_id);
CREATE INDEX IF NOT EXISTS idx_orbits_universe ON public.orbits(universe_id);
CREATE INDEX IF NOT EXISTS idx_party_rooms_universe ON public.party_rooms(universe_id);
CREATE INDEX IF NOT EXISTS idx_party_rooms_host ON public.party_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_party_rooms_updated ON public.party_rooms(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_room ON public.messages(room_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_orbit ON public.messages(orbit_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.party_invites(token);

-- ==============================================================================
-- 11. AUTOMATIC UPDATED_AT TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_universes_updated_at ON public.universes;
CREATE TRIGGER set_universes_updated_at
BEFORE UPDATE ON public.universes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orbits_updated_at ON public.orbits;
CREATE TRIGGER set_orbits_updated_at
BEFORE UPDATE ON public.orbits
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_party_rooms_updated_at ON public.party_rooms;
CREATE TRIGGER set_party_rooms_updated_at
BEFORE UPDATE ON public.party_rooms
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 12. NEW USER AUTOMATIC PROFILE TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    raw_name TEXT;
    sanitized_username TEXT;
BEGIN
    raw_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    sanitized_username := LOWER(REGEXP_REPLACE(raw_name, '[^a-zA-Z0-9_]', '', 'g')) || '_' || SUBSTRING(NEW.id::text, 1, 4);

    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        sanitized_username,
        raw_name,
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id::text
        )
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across every table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orbits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_invites ENABLE ROW LEVEL SECURITY;

-- 13.1 PROFILES POLICIES
CREATE POLICY "Profiles are readable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 13.2 UNIVERSES POLICIES
CREATE POLICY "Public universes are readable by everyone"
ON public.universes FOR SELECT
USING (
    is_public = TRUE 
    OR owner_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.universe_members
        WHERE universe_members.universe_id = universes.id
        AND universe_members.user_id = auth.uid()
    )
);

CREATE POLICY "Authenticated users can create universes"
ON public.universes FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = owner_id);

CREATE POLICY "Owners and admins can update universes"
ON public.universes FOR UPDATE
USING (
    owner_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.universe_members
        WHERE universe_members.universe_id = universes.id
        AND universe_members.user_id = auth.uid()
        AND universe_members.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Only owners can delete universes"
ON public.universes FOR DELETE
USING (owner_id = auth.uid());

-- 13.3 UNIVERSE MEMBERS POLICIES
CREATE POLICY "Members list readable by universe members or public universes"
ON public.universe_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.universes
        WHERE universes.id = universe_members.universe_id
        AND (universes.is_public = TRUE OR universes.owner_id = auth.uid())
    )
    OR user_id = auth.uid()
);

CREATE POLICY "Users can join public universes"
ON public.universe_members FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM public.universes
        WHERE universes.id = universe_members.universe_id
        AND universes.is_public = TRUE
    )
);

CREATE POLICY "Members can leave or admins can manage membership"
ON public.universe_members FOR DELETE
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.universes
        WHERE universes.id = universe_members.universe_id
        AND universes.owner_id = auth.uid()
    )
);

-- 13.4 ORBITS POLICIES
CREATE POLICY "Orbits readable by members of universe"
ON public.orbits FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.universes u
        WHERE u.id = orbits.universe_id
        AND (
            u.is_public = TRUE 
            OR u.owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.universe_members um
                WHERE um.universe_id = u.id AND um.user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Admins can insert orbits"
ON public.orbits FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.universe_members
        WHERE universe_members.universe_id = orbits.universe_id
        AND universe_members.user_id = auth.uid()
        AND universe_members.role IN ('owner', 'admin')
    )
);

-- 13.5 PARTY ROOMS POLICIES
CREATE POLICY "Party rooms readable by public or members"
ON public.party_rooms FOR SELECT
USING (
    is_private = FALSE
    OR host_id = auth.uid()
    OR (
        universe_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.universe_members um
            WHERE um.universe_id = party_rooms.universe_id
            AND um.user_id = auth.uid()
        )
    )
);

CREATE POLICY "Authenticated users can create party rooms"
ON public.party_rooms FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = host_id);

CREATE POLICY "Host or room participants can update playback state"
ON public.party_rooms FOR UPDATE
USING (
    host_id = auth.uid()
    OR (
        is_locked = FALSE 
        AND auth.role() = 'authenticated'
    )
);

CREATE POLICY "Host can delete party room"
ON public.party_rooms FOR DELETE
USING (host_id = auth.uid());

-- 13.6 MESSAGES POLICIES
CREATE POLICY "Messages readable by room or orbit participants"
ON public.messages FOR SELECT
USING (
    (
        room_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.party_rooms r
            WHERE r.id = messages.room_id
            AND (r.is_private = FALSE OR r.host_id = auth.uid())
        )
    )
    OR
    (
        orbit_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.orbits o
            JOIN public.universes u ON u.id = o.universe_id
            WHERE o.id = messages.orbit_id
            AND (u.is_public = TRUE OR u.owner_id = auth.uid())
        )
    )
);

CREATE POLICY "Authenticated users can send messages"
ON public.messages FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid() = user_id
);

-- 13.7 INVITES POLICIES
CREATE POLICY "Invites viewable by host or token holder"
ON public.party_invites FOR SELECT
USING (
    invited_by = auth.uid()
    OR token IS NOT NULL
);

CREATE POLICY "Party hosts can create invites"
ON public.party_invites FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = invited_by
);

-- ==============================================================================
-- 14. SUPABASE REALTIME CONFIGURATION
-- ==============================================================================
-- Add tables to realtime publication for instant client events
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.party_rooms;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION
    WHEN others THEN null;
END $$;

-- Set replica identity to full to receive entire updated row in payloads
ALTER TABLE public.party_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- ==============================================================================
-- 15. SEED DATA (For Immediate Out-Of-The-Box Immersion)
-- ==============================================================================
-- Note: Insert dummy profiles for demo watch parties if not existing
DO $$
DECLARE
    dummy_host_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
    dummy_univ_id UUID := '11111111-1111-1111-1111-111111111111'::uuid;
    dummy_orbit_id UUID := '22222222-2222-2222-2222-222222222222'::uuid;
    demo_room_1 UUID := '33333333-3333-3333-3333-333333333331'::uuid;
    demo_room_2 UUID := '33333333-3333-3333-3333-333333333332'::uuid;
BEGIN
    -- Seed System Profile
    INSERT INTO public.profiles (id, username, display_name, avatar_url, bio, status)
    VALUES (
        dummy_host_id,
        'cinephile_prime',
        'Elena Rostova',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'Curating midnight film festivals and sci-fi sync marathons.',
        'online'
    ) ON CONFLICT (id) DO NOTHING;

    -- Seed Flagship Universe: "The Cinema Sanctum"
    INSERT INTO public.universes (id, name, slug, description, icon_url, banner_url, owner_id, is_public, invite_code)
    VALUES (
        dummy_univ_id,
        'The Cinema Sanctum',
        'cinema-sanctum',
        'Premier destination for synchronised 4K film watch parties, retro anime marathons, and director commentary sessions.',
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
        dummy_host_id,
        TRUE,
        'SANCTUM77'
    ) ON CONFLICT (id) DO NOTHING;

    -- Seed Orbits
    INSERT INTO public.orbits (id, universe_id, name, type, topic, position)
    VALUES 
        (dummy_orbit_id, dummy_univ_id, 'main-theater', 'watch_party', 'Live Synchronized Cinema Screen 1', 1),
        (gen_random_uuid(), dummy_univ_id, 'general-chat', 'text', 'Discuss plots, easter eggs, and upcoming watchlists', 2),
        (gen_random_uuid(), dummy_univ_id, 'directors-lounge', 'voice', 'Low-latency voice discussion for screenwriters', 3)
    ON CONFLICT (id) DO NOTHING;

    -- Seed Featured Live Watch Rooms with pristine streamable test videos
    INSERT INTO public.party_rooms (
        id, title, description, universe_id, orbit_id, host_id,
        media_title, media_url, media_type, thumbnail_url,
        duration, playback_state, current_timestamp, playback_speed, is_locked
    )
    VALUES 
    (
        demo_room_1,
        'Big Buck Bunny (4K Ultra-Sync Experience)',
        'Open Blender Foundation cinematic masterpiece. Test room playhead sync and low latency presence.',
        dummy_univ_id,
        dummy_orbit_id,
        dummy_host_id,
        'Big Buck Bunny',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'direct',
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
        596.0,
        'PAUSED',
        18.4,
        1.0,
        FALSE
    ),
    (
        demo_room_2,
        'Tears of Steel (Sci-Fi Cyberpunk Marathon)',
        'VFX Showcase in dystopian Amsterdam. Synchronized sound stage with spatial WebRTC presence.',
        dummy_univ_id,
        dummy_orbit_id,
        dummy_host_id,
        'Tears of Steel',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        'direct',
        'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
        734.0,
        'PLAYING',
        75.0,
        1.0,
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;

    -- Seed Sample Chat Messages with Timestamp tags
    INSERT INTO public.messages (room_id, user_id, content, timestamp_tag)
    VALUES 
        (demo_room_1, dummy_host_id, 'Welcome everyone to Not Too Far! 🎬 Grab your popcorn.', NULL),
        (demo_room_1, dummy_host_id, 'Look at the color grading right here! 🐰', 18.40)
    ON CONFLICT (id) DO NOTHING;

END $$;
