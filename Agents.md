# Project Memory: Zoom Momentum

Use `zoom-momentum-tasks.md` as the source of truth for tasks and context.

---

## What Is This Project?

Zoom Momentum is a **Zoom Apps SDK** in-meeting side panel app for live college lectures. It gives professors real-time engagement tools (polls, quizzes, live summaries) and gives students a dynamic timeline, glossary, and bookmarks — all powered by live transcript AI.

**Key docs:**
- [`feature-specification.md`](feature-specification.md) — Full feature specs and architecture diagrams
- [`zoom-momentum-implementation.md`](zoom-momentum-implementation.md) — Architectural decisions, message protocol, build order
- [`api-verification.md`](api-verification.md) — Zoom SDK API verification report
- [`zoom-momentum-tasks.md`](zoom-momentum-tasks.md) — Task breakdown with completion status

---

## What Has Been Done

### Completed (Phases 1–4)

**Monorepo scaffolding** — npm workspaces with `client`, `server`, `mock-transcript` packages.

**Frontend (Vite + React 18 + TypeScript):**
- Zoom SDK initialization ([`useZoomSdk.ts`](client/src/hooks/useZoomSdk.ts)) — calls `zoomSdk.config()`, detects host vs participant role
- OAuth PKCE flow ([`useZoomAuth.ts`](client/src/hooks/useZoomAuth.ts)) — full authorize → callback → session flow
- Messaging layer ([`useMessaging.ts`](client/src/hooks/useMessaging.ts)) — `connect()` + `sendMessage()` + `onMessage()` with sequence-numbered state sync, late joiner catch-up
- Message types ([`messages.ts`](client/src/types/messages.ts)) — full type system for all message types (FULL_STATE, REQUEST_STATE, ARENA_*, TOPIC_*, GLOSSARY_*, POLL_*)
- Role-based routing ([`App.tsx`](client/src/App.tsx)) — SDK init → auth check → HostDashboard or StudentView
- Shell views ([`HostDashboard.tsx`](client/src/views/HostDashboard.tsx), [`StudentView.tsx`](client/src/views/StudentView.tsx)) — tabbed layouts with placeholders
- Zoom-branded CSS ([`index.css`](client/src/index.css))

**Backend (Express + TypeScript + Prisma/SQLite):**
- OAuth routes ([`auth.ts`](server/src/routes/auth.ts)) — `/authorize`, `/callback`, `/me`
- AI stub routes ([`ai.ts`](server/src/routes/ai.ts)) — `/topic-segment`, `/quiz-generate`, `/poll-generate`, `/recovery-pack`, `/detect-cues`
- Transcript routes ([`transcript.ts`](server/src/routes/transcript.ts)) — POST `/segment`, GET `/buffer`
- Bookmark routes ([`bookmarks.ts`](server/src/routes/bookmarks.ts)) — POST `/`, GET `/`
- Prisma schema ([`schema.prisma`](server/prisma/schema.prisma)) — User, Meeting, TranscriptSegment, Bookmark, QuizSet, RecoveryPack
- Config validation ([`config.ts`](server/src/config.ts)) — fails fast on missing env vars

**Mock transcript** ([`mock-transcript/src/index.ts`](mock-transcript/src/index.ts)) — 16 sample math lecture chunks, POSTs to `/api/transcript/segment` every 3 seconds.

**Database** — Prisma migration applied, SQLite `dev.db` ready.

---

## What Needs To Be Done Next

### Immediate Next Task: Professor's Pulse (Feature C)

This is the recommended next feature because it has **zero RTMS dependency** — it uses only `sendMessage`/`onMessage` which are already wired up.

**What to build:**
1. Host creates a quick poll (free-text question or multiple choice)
2. Poll is broadcast to all students via `sendMessage`
3. Students see the poll and submit answers
4. Host sees live response aggregation
5. Host can close the poll and optionally share results

**Files to create/modify:**
- `client/src/components/pulse/` — PollCreator, PollCard, PollResults components
- `client/src/hooks/usePulse.ts` — poll state management using useMessaging
- Update [`HostDashboard.tsx`](client/src/views/HostDashboard.tsx) Pulse tab with real UI
- Update [`StudentView.tsx`](client/src/views/StudentView.tsx) to show active polls
- Message types already defined: `POLL_START`, `POLL_RESPONSE`, `POLL_END`

### Full Build Order (from [`zoom-momentum-implementation.md`](zoom-momentum-implementation.md:724))

1. **Professor's Pulse** ← START HERE (no RTMS needed)
2. **Warm-Up Arena** (no RTMS needed, uses sendMessage for trivia)
3. **Live Anchor** (needs transcript — use mock transcript first)
4. **Recovery Agent** (needs transcript data accumulated over a session)
5. **Enhancements** (glossary, auto-bookmark, smart spotlight, post-class summary)

### Phase 5: Real RTMS Integration
- **RTMS access has been granted** to the developer account.
- Not yet implemented. See [`zoom-momentum-tasks.md`](zoom-momentum-tasks.md) tasks 18–19.
- Can now be built in parallel with or after Professor's Pulse.

---

## How To Run

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
```bash
# Install all workspace dependencies
npm install

# Copy env template and fill in values
cp .env.example .env

# Run Prisma migration (if not already done)
cd server && npx prisma migrate dev --name init && cd ..
```

### Environment Variables (`.env` at root)
```
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_REDIRECT_URL=https://your-ngrok-url.ngrok-free.app/api/auth/callback
SESSION_SECRET=any-random-string
DATABASE_URL=file:./dev.db
OPENAI_API_KEY=your_openai_key
PORT=3001
CLIENT_URL=http://localhost:5173
```

Note: `server/.env` also needs `DATABASE_URL=file:./dev.db` for Prisma CLI commands.

### Dev Commands
```bash
# Start client (port 5173) + server (port 3001) concurrently
npm run dev

# Start with mock transcript feed included
npm run dev:mock

# Run just the client
npm run dev:client

# Run just the server
npm run dev:server
```

### Testing in Zoom
1. Start ngrok: `ngrok http 3001`
2. Update `ZOOM_REDIRECT_URL` in `.env` with ngrok URL
3. Configure Zoom App on marketplace.zoom.us with the ngrok URL
4. Open a Zoom meeting → Apps → find your app

---

## Architecture Quick Reference

### Host-as-Source-of-Truth Pattern
- Host maintains the canonical `AppState` object
- Students request state via `REQUEST_STATE` message
- Host responds with `FULL_STATE` containing the entire state
- All state mutations happen on host, then broadcast to students
- Sequence numbers prevent race conditions

### Message Flow
```
Student joins → connect() → sends REQUEST_STATE
Host receives → responds with FULL_STATE (seq N)
Host action → broadcasts delta message (seq N+1)
Students apply delta to local state
```

### Key Architectural Decisions
1. **`connect()` + `sendMessage()`** over Collaborate Mode (Collaborate is deprecated)
2. **All detection events are host-only** (`onParticipantChange`, `onActiveSpeakerChange`)
3. **Sequence-numbered messages** to prevent race conditions
4. **Build non-RTMS features first** for velocity
5. **Mock transcript pipeline** uses same HTTP endpoint as real RTMS will
6. **`sendMessage` payload budget** — keep under 1KB per message

### Tech Stack
- **Client:** Vite + React 18 + TypeScript + @zoom/appssdk
- **Server:** Express + TypeScript + Prisma + SQLite (dev) / PostgreSQL (prod)
- **AI:** OpenAI GPT-4 (via server-side API calls)
- **Monorepo:** npm workspaces

---

## Project Structure
```
zoom-momentum/
├── client/                  # Vite + React frontend
│   └── src/
│       ├── App.tsx          # Entry: SDK init → auth → role routing
│       ├── hooks/           # useZoomSdk, useZoomAuth, useMessaging
│       ├── types/           # Message types and AppState
│       └── views/           # HostDashboard, StudentView, AuthView
├── server/                  # Express backend
│   ├── prisma/              # Schema + migrations + dev.db
│   └── src/
│       ├── server.ts        # Express app setup
│       ├── config.ts        # Env validation
│       └── routes/          # auth, ai, transcript, bookmarks
├── mock-transcript/         # Fake transcript feed for dev
├── package.json             # Root monorepo config
├── .env.example             # Env template
└── *.md                     # Planning & spec docs
```

## Cursor Cloud specific instructions

### Services overview
- **Client** (Vite + React): `npm run dev -w client` → port 5173. Proxies `/api/*` to backend.
- **Server** (Express + TypeScript): `npm run dev -w server` → port 3001. Requires env vars in `server/.env`.
- **Mock Transcript** (optional): `npm run dev -w mock-transcript`. Simulates RTMS transcript chunks.
- Combined: `npm run dev` (client + server) or `npm run dev:mock` (all three).

### Environment variables
The server uses `dotenv/config` which loads `.env` from `process.cwd()`. When using npm workspaces (`npm run dev -w server`), the cwd is the **server directory**, so the `.env` with all variables (ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_REDIRECT_URL, SESSION_SECRET, OPENAI_API_KEY) must be in `server/.env`, not just the root `.env`. The root `.env` is only used if you run commands from the root directory directly. Prisma also needs `DATABASE_URL=file:./dev.db` in `server/.env`.

### Database
SQLite via Prisma. After install, run `cd server && npx prisma migrate dev --name init` to set up. The `dev.db` file lives in `server/prisma/dev.db`.

### Build and type-check
- No dedicated lint or test scripts are configured in this repo.
- `tsc --noEmit` in `server/` passes cleanly; in `client/` there are 2 pre-existing TS errors from Zoom SDK type incompatibilities — these do not block Vite dev or build.
- `npx vite build` in `client/` and `npx tsc` in `server/` both succeed.

### Running outside Zoom
The frontend is a Zoom Apps SDK side-panel app. When loaded in a regular browser, it will show "SDK Error: The Zoom Apps SDK is not supported by this browser" — this is expected. Full testing requires running inside a Zoom meeting with ngrok.

### Transcript foreign key caveat
The mock transcript service POSTs to `/api/transcript/segment` with `meetingId: "mock-meeting-001"`. This requires a matching `Meeting` record in the DB, or it will 500 due to a Prisma foreign key constraint. A meeting must be created first (e.g., via the auth/OAuth flow which creates user and meeting records).
