# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Zoom Momentum is a Zoom Apps SDK in-meeting side panel app that transforms passive virtual classrooms into active learning environments. It's a monorepo with three npm workspaces: `client` (React + Vite), `server` (Express + Prisma), and `mock-transcript` (dev utility).

## Commands

```bash
npm run dev              # Run client (port 5173) + server (port 3001) concurrently
npm run dev:mock         # Same as above + mock-transcript service (CS50 lecture chunks)
npm run build            # Build both client and server
npm run db:migrate       # Run Prisma migrations (server workspace)
npm run db:generate      # Regenerate the Prisma client (also runs on npm install)
npm run db:studio        # Open Prisma Studio GUI

npm run dev -w client    # Client dev server only
npm run dev -w server    # Server dev server only (tsx watch mode)
npm run build -w server  # Compile server TypeScript to dist/
npm run build:site       # Public site: website at /, interactive demo at /demo (Vercel build)
```

Testing: Vitest (`npm test`). Linting: ESLint (`npm run lint`).

## Running in Zoom (Production Build)

The app must be served as a production build through Express for Zoom to work:
```bash
# Quick start (kills old processes, builds, starts server + ngrok)
./start.sh

# Or with mock transcript fallback
./start.sh --mock
```

Manual steps:
```bash
# 1. Build client
npm run build -w client

# 2. Start ngrok pointing to Express (port 3001, NOT 5173)
ngrok http 3001 --url=your-tunnel.ngrok-free.dev

# 3. Start server (serves both API + static client build)
npm run dev -w server

# 4. Optionally start mock transcript
npm run dev -w mock-transcript
```

The server and ngrok also run as systemd user services (auto-restart, survive reboots):
```bash
systemctl --user status zoom-momentum.service
systemctl --user status zoom-ngrok.service
systemctl --user restart zoom-momentum.service
```

## Architecture

### Client (`client/src/`)
- **App.tsx** — Entry point with role-based routing (host vs student via Zoom SDK role detection)
- **Hooks** — Core logic lives in hooks:
  - `useZoomSdk` — SDK init, role detection, meeting context (uses `getMeetingUUID()` for consistent ID across host/attendee), RTMS start/stop, participant count
  - `useZoomAuth` — OAuth PKCE flow
  - `useMessaging` — WebSocket relay client with auto-reconnect, sequence-numbered state sync
  - `usePulse` / `useArena` / `useLiveAnchor` — Feature-specific state management
  - `useZoomEvents` — Active speaker, meeting end, late joiner detection
  - `useDemoMode` — Auto-detects demo mode (outside Zoom), provides mock meetingId
- **Views** — `HostDashboard` (Pulse/Arena/Anchor tabs + TranscriptTab), `StudentView` (Timeline/Glossary/Transcript tabs + language dropdown), `WelcomeView`, `AuthView`
- **Components** — `pulse/` (polls), `arena/` (trivia/leaderboard), `anchor/` (timeline, glossary, transcript, bookmarks), `recovery/` (post-class summary), `notes/` (smart notes panel), `shared/` (feature info)
- **DevPreview.tsx** — REMOVED. Replaced by demo mode in App.tsx
- **Demo Mode** — Auto-enabled when running outside Zoom. Role switcher + simulation buttons (late join, meeting end, speaker). Transcript source toggle (Live/Mock) available inside Zoom only.
- **Types** — `messages.ts` defines the full message protocol and state types

### Server (`server/src/`)
- **server.ts** — Express app with CORS, sessions, OWASP headers, route mounting, serves production client build
- **config.ts** — Env var validation (fails fast on missing vars)
- **Routes:**
  - `auth.ts` — OAuth PKCE (`/authorize`, `/callback`, `/me`)
  - `ai.ts` — AI endpoints (`/poll-generate`, `/quiz-generate`, `/topic-segment`, `/recovery-pack`, `/detect-cues`)
  - `transcript.ts` — Transcript storage with meeting-resolver and RTMS UUID fallback (`POST /segment`, `GET /segments`, `GET /buffer`, `POST /translate-glossary`)
  - `bookmarks.ts` — Bookmark CRUD with meeting-resolver
  - `rtms.ts` — RTMS webhook receiver, stream client, meeting ID registration (`POST /start`)
- **Services:**
  - `meeting-resolver.ts` — Auto-creates Meeting records from Zoom UUIDs or mock IDs
  - `rtms-ingest.ts` — RTMS WebSocket client, transcript storage, session lifecycle, active session lookup
  - `websocket.ts` — WebSocket relay server for host↔student messaging (rooms by meetingId)
  - `translator.ts` — Server-side translation with DB caching (batch AI calls, concurrency locks, English fallback)
  - `ai-client.ts` — Tiered AI client with failover (CREATE AI claude4_5_sonnet → gpt5 → Bedrock)
- **Database** — Prisma ORM with SQLite (dev) / PostgreSQL (prod). Schema in `server/prisma/schema.prisma`
  - Models: User, Meeting, TranscriptSegment, Bookmark, QuizSet, RecoveryPack, TranslatedSegment, TranslatedGlossary

### Mock Transcript (`mock-transcript/`)
- Fetches real CS50 Lecture 0 SRT from Harvard CDN, parses into ~700 chunks, POSTs to `/api/transcript/segment` every 3 seconds
- Falls back to hardcoded chunks if CDN fetch fails

### Website (`website/`)
- Static public site (`index.html` + `styles.css` + `script.js`), no build step
- Serve locally: `cd website && python3 -m http.server 8080`
- Deployed together with the interactive demo: `npm run build:site` builds the
  client with `VITE_BASE=/demo/` and assembles `dist/` with the website at `/`
  and the demo at `/demo` (see `scripts/build-site.mjs`). Vercel uses this via
  `vercel.json`. The Express-served build for Zoom (`npm run build -w client`)
  keeps base `/` and is unaffected.

### Message Protocol
All host↔student communication uses WebSocket relay through Express (`/ws` endpoint). The server manages rooms by meetingId and relays messages between all connected clients. Message envelope contains `type`, `payload`, `seq` (sequence number), `timestamp`, `senderId`, and `senderRole`.

- Server: `server/src/services/websocket.ts` — room management, message relay, heartbeat
- Client: `client/src/hooks/useMessaging.ts` — WebSocket client with auto-reconnect
- Vite proxy: `client/vite.config.ts` proxies `/ws` to `ws://localhost:3001`

## Key Config

- `client/vite.config.ts` — Proxies `/api/*` requests to `localhost:3001` (dev mode only)
- `client/index.html` — Must include `<script src="https://appssdk.zoom.us/sdk.js"></script>` before app bundle
- `.env` — Requires `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_REDIRECT_URL`, `ZOOM_SECRET_TOKEN`, `SESSION_SECRET`, `DATABASE_URL`, `AWS_REGION`, `PORT`, `CLIENT_URL` (see `.env.example`)

## AI Backend

- **Primary:** ASU CREATE AI platform (`https://api-main.aiml.asu.edu/query`)
  - Model 1: `claude4_5_sonnet` via `aws` (primary)
  - Model 2: `gpt5` via `openai` (backup)
- **Fallback:** AWS Bedrock, region `us-east-1`
  - Model: `meta.llama3-70b-instruct-v1:0` (Llama 3 70B via Converse API)
  - Auth: EC2 instance role (no static keys)
- Failover chain: claude4_5_sonnet → gpt5 → Bedrock (automatic, per-request)
- Tiered logic lives in `server/src/ai-client.ts`
- CREATE AI config is optional — if env vars are missing, falls back to Bedrock
- CREATE AI requires `request_source: "override_params"` with `model_name` + `model_provider` to override project defaults (service tokens use project defaults otherwise)
- Env vars: `CREATE_AI_API_URL`, `CREATE_AI_TOKEN`, `CREATE_AI_PRIMARY_MODEL`, `CREATE_AI_PRIMARY_PROVIDER`, `CREATE_AI_BACKUP_MODEL`, `CREATE_AI_BACKUP_PROVIDER`
- Available models list: https://api-main.aiml.asu.edu docs (requires admin token) or CREATE AI documentation portal

## Zoom SDK Integration (CRITICAL)

- **Do NOT use `import zoomSdk from '@zoom/appssdk'`** — the npm package creates a separate SDK instance that lacks the native bridge in ZoomWebKit. This causes `config()` to timeout.
- **Use `(window as any).zoomSdk`** — the CDN script tag (`sdk.js`) in `index.html` creates the global `window.zoomSdk` which has the native bridge connected to the Zoom client.
- All four hooks (`useZoomSdk`, `useMessaging`, `useZoomAuth`, `useZoomEvents`) use `window.zoomSdk` with a guard for when running outside Zoom (demo mode).
- `useMessaging` uses WebSocket relay (not SDK messaging) — works both inside and outside Zoom.
- Server must serve production build via Express (port 3001) with ngrok tunneling to 3001 — Vite dev server does NOT work inside Zoom.
- OWASP headers (Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, Content-Security-Policy) are REQUIRED — Zoom blocks rendering without all four.

## Known Issues (Priority Order)

### Resolved
- ~~**P0: Host↔Student Messaging**~~ — FIXED. Replaced Zoom SDK `postMessage`/`onMessage` with WebSocket relay through Express.
- ~~**RTMS secret fallback**~~ — FIXED. Proper empty-string check before falling back to clientSecret.
- ~~**RTMS UUID mismatch**~~ — FIXED. Zoom SDK UUID differs from RTMS webhook UUID. Server-side fallback in transcript routes checks active RTMS sessions when SDK UUID doesn't resolve.
- ~~**"Analyze Now" button**~~ — FIXED. Removed from Anchor tab.
- ~~**PrismaClient instances**~~ — FIXED. Singleton in `server/src/db.ts`.
- ~~**AI topic-segment silent failure**~~ — FIXED. Returns null for non-academic content, 500 on real errors.
- ~~**AI topic dedup**~~ — FIXED. Fuzzy title matching (0.7 threshold), skip short titles, ignore small talk.
- ~~**BigInt serialization**~~ — FIXED. transcript.ts returns timestamp/seqNo as Numbers.
- ~~**Participant count**~~ — FIXED. Filters out app's own participantUUID + host. Shows students only.
- ~~**Sign-in button**~~ — REMOVED. Bookmarks are local-only now.
- ~~**Mock transcript startup race**~~ — FIXED. Retry with backoff (3 attempts).
- ~~**RTMS segment overwrite**~~ — FIXED. Upsert + seqCounter initialized from DB.
- ~~**RTMS timestamps**~~ — FIXED. Microsecond detection and conversion to milliseconds.
- ~~**WebSocket rejecting Zoom UUIDs**~~ — FIXED. Auto-create meeting on connect.
- ~~**End Class not notifying students**~~ — FIXED. CLASS_END broadcast + stops AI polling.

### Open Bugs
None currently tracked.

## RTMS Integration (CRITICAL)

The Zoom SDK meeting UUID and the RTMS webhook `meeting_uuid` are different identifiers for the same meeting. This is handled transparently:

1. Client calls `POST /api/rtms/start` with its SDK meeting UUID before calling `startRTMS()`
2. Server stores this as `pendingMeetingId`
3. When `meeting.rtms_started` webhook arrives, server maps the webhook UUID to the pending client UUID
4. Transcript segments are stored under the RTMS UUID (as provided by the webhook)
5. When client polls `GET /segments?meetingId=SDK_UUID`, the server falls back to checking active RTMS sessions if the SDK UUID doesn't resolve — transparently returning data from the RTMS UUID

Key files: `server/src/routes/rtms.ts`, `server/src/services/rtms-ingest.ts`, `server/src/routes/transcript.ts`

## Live Multilingual Transcript

Students can switch between 6 languages (English, Spanish, Chinese, Hindi, Arabic, French) via a dropdown in the status bar. Translation is server-side with DB caching:

- One AI call per (segment, language) pair — shared across all students
- `TranslatedSegment` and `TranslatedGlossary` models cache results
- `GET /segments?lang=es` returns translated segments transparently
- `POST /translate-glossary` translates glossary terms on demand
- Arabic renders RTL automatically
- Fade-in UX on language switch

Key files: `server/src/services/translator.ts`, `client/src/views/StudentView.tsx` (dropdown), `client/src/components/anchor/TranscriptTab.tsx`, `client/src/components/anchor/GlossaryTab.tsx`

## Git Config
- user.name: `shitijkarsolia`
- Do NOT add `Co-Authored-By` lines to commits
