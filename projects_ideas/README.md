# 🎬 Not Too Far — Video Synchronization & Community Watch Platform

**Not Too Far** is a production-grade, highly secure, full-stack streaming synchronization and community platform engineered with a **Netflix-inspired cinematic visual identity** (`#141414` deep blacks, `#E50914` crimson accents, fluid Framer Motion transitions) and hybrid **Teleparty + Discord** collaboration dynamics.

---

## ⚡ Tech Stack & Architecture (Vercel-Optimized)

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion, Lucide React Icons, Canvas Confetti.
- **Backend / API:** Next.js Server Actions, Edge Route Handlers (`runtime = 'edge'`).
- **Real-Time Engine:** Supabase Realtime broadcast channels (`watch_room_{id}`) for ultra-low latency playhead state, presence, and chat + WebRTC spatial audio/video stage.
- **Database:** PostgreSQL on Supabase with strict **Row Level Security (RLS)** across all tables.
- **Authentication:** Supabase Auth supporting Google OAuth, Apple Sign-In, and Passwordless Magic Links with session cookies.
- **Email Automation:** Resend API for watch party invite dispatch.
- **Browser Extension Bridge:** Manifest V3 companion extension relaying `window.postMessage` playback sync commands across Netflix, Disney+ Hotstar, Amazon Prime Video, YouTube, and direct HTML5 streams.

---

## 📂 Core Architecture & Deliverables

### 1. Database Schema (`schema.sql`)
The PostgreSQL schema defines:
- `profiles`: Synced with `auth.users` via trigger `handle_new_user()`.
- `universes`: Discord-style servers with customizable slugs, banners, and invite codes.
- `universe_members`: Role-based membership (`owner`, `admin`, `moderator`, `member`).
- `orbits`: Discord-style channels categorized as `watch_party`, `text`, or `voice`.
- `party_rooms`: Authoritative synchronization rooms tracking `playback_state` (`PLAYING`, `PAUSED`, `SEEKING`, `BUFFERING`), `current_timestamp`, `playback_speed`, `is_locked`, and `last_sync_broadcast`.
- `messages`: Real-time chat messages featuring **clickable timestamp tags** (seeking video playheads directly) and emoji reactions.
- `party_invites`: Token-signed invite links with expiration and Resend email dispatch.
- **RLS Policies:** Explicit granular policies safeguarding member privacy, room access, and host control locks.

### 2. Ultra-Sync Drift-Correction Engine (`lib/sync-engine.ts`)
- **Latency Compensation:** Forward predicts host playhead accounting for one-way network latency:
  $$\text{targetTime} = \text{broadcastTime} + \left(\Delta t + \frac{\text{RTT}}{2}\right) \times \text{playbackSpeed}$$
- **Thresholding Strategy:**
  - $\Delta > 1.5\,\text{s}$: Triggers smooth hard seek to immediately eliminate drift.
  - $0.3\,\text{s} < \Delta \le 1.5\,\text{s}$: Smooth micro-rate catch-up ($1.05\times$ or $0.95\times$) preventing audio clipping.
  - $\Delta \le 0.3\,\text{s}$: Locked in sync.

### 3. Dynamic Watch Room (`app/rooms/[id]/page.tsx`)
- Integrated HTML5 cinema video player with Netflix-style controls (custom scrub bar, hover timecode tooltip, playback speed picker, host lock toggle, and theater mode).
- Supabase Realtime broadcast listener handling `SYNC_ACTION` (PLAY, PAUSE, SEEK, SPEED_CHANGE, CHANGE_MEDIA), periodic 1-second host heartbeats, and chat messages.
- Real-time HUD showing measured drift in milliseconds (e.g. `Drift: ±18ms`).

### 4. Unified Communication Dock (`components/dock/UnifiedDock.tsx`)
- **Live Chat:** Real-time messages with timestamp tags, quick reaction bar, confetti explosions, and @mentions.
- **WebRTC Stage:** Multi-user video grid with active speaker detection, mic mute/unmute, camera toggle, screen sharing, and audio deafen switch.
- **Sync Telemetry:** Live diagnostics panel displaying round-trip time and host authority status.

### 5. Discord-Style Universes & Orbits (`app/universes/[id]/page.tsx`)
- Multi-server navigation rail.
- Grouped channels: Live Watch Parties, Text Channels, and Voice Lounges.
- Real-time online member directory with roles.

### 6. Browser Extension Companion (`public/extension/`)
- Manifest V3 architecture (`manifest.json`).
- `extension-bridge.js`: High-precision video DOM hook and `window.postMessage` bridge.
- `background.js`: Cross-tab service worker relay.

---

## 🚀 Quick Start & Development

### Prerequisites
- Node.js 18+ or Bun 1.0+

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/mokshith9944-lgtm/not-too-far.git
cd not-too-far

# Install dependencies
bun install   # or: npm install

# Run development server
bun run dev   # or: npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to enter the cinema lounge.

### Building for Production (Vercel)
```bash
bun run build # or: npm run build
bun run start # or: npm start
```

---

## 🔐 Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Not Too Far"

# Supabase (PostgreSQL, Auth & Realtime)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Resend API (Email invites)
RESEND_API_KEY=re_123456789
EMAIL_FROM="Not Too Far <no-reply@nottoofar.app>"
```

*Note: The platform features an intelligent fallback event bus so all real-time sync, WebRTC stage, chat, and room controls work immediately in local multi-tab environments even before linking external credentials!*

---

## 🛡️ Security Features
- **Strict HTTPS / HSTS:** 2-year Strict-Transport-Security preload header.
- **XSS & Injection Protection:** Content-Type nosniff, sanitization of chat messages and SVG payloads.
- **Row Level Security (RLS):** Host-locked party controls and membership authentication enforced at database engine level.
- **HTTP-Only Cookies:** Auth token management via `@supabase/ssr`.
