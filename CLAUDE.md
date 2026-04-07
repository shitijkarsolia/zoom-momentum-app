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
npm run db:studio        # Open Prisma Studio GUI

npm run dev -w client    # Client dev server only
npm run dev -w server    # Server dev server only (tsx watch mode)
npm run build -w server  # Compile server TypeScript to dist/
```

No test framework or linter is currently configured.

## Running in Zoom (Production Build)

The app must be served as a production build through Express for Zoom to work:
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

## Architecture

### Client (`client/src/`)
- **App.tsx** — Entry point with role-based routing (host vs student via Zoom SDK role detection)
- **Hooks** — Core logic lives in hooks:
  - `useZoomSdk` — SDK init, role detection, meeting context
  - `useZoomAuth` — OAuth PKCE flow
  - `useMessaging` — `connect()`/`postMessage()`/`onMessage()` with sequence-numbered state sync (CURRENTLY BROKEN — see Known Issues)
  - `usePulse` / `useArena` / `useLiveAnchor` — Feature-specific state management
  - `useZoomEvents` — Active speaker, meeting end, late joiner detection
- **Views** — `HostDashboard` (Pulse/Arena/Anchor tabs), `StudentView` (Timeline/Glossary/Transcript tabs), `WelcomeView`, `AuthView`
- **Components** — `pulse/` (polls), `arena/` (trivia/leaderboard), `anchor/` (timeline, glossary, transcript, bookmarks), `recovery/` (post-class summary), `shared/` (feature info)
- **DevPreview.tsx** — Browser-only simulation mode with real AI + CS50 transcript data
- **Types** — `messages.ts` defines the full message protocol and state types

### Server (`server/src/`)
- **server.ts** — Express app with CORS, sessions, OWASP headers, route mounting, serves production client build
- **config.ts** — Env var validation (fails fast on missing vars)
- **Routes:**
  - `auth.ts` — OAuth PKCE (`/authorize`, `/callback`, `/me`)
  - `ai.ts` — AI endpoints (`/poll-generate`, `/quiz-generate`, `/topic-segment`, `/recovery-pack`, `/detect-cues`)
  - `transcript.ts` — Transcript storage with meeting-resolver (`POST /segment`, `GET /buffer`)
  - `bookmarks.ts` — Bookmark CRUD with meeting-resolver
  - `rtms.ts` — RTMS webhook receiver + stream client
- **Services:**
  - `meeting-resolver.ts` — Auto-creates Meeting records from Zoom UUIDs or mock IDs
  - `rtms-ingest.ts` — RTMS WebSocket client, transcript storage, session lifecycle
- **Database** — Prisma ORM with SQLite (dev) / PostgreSQL (prod). Schema in `server/prisma/schema.prisma`

### Mock Transcript (`mock-transcript/`)
- Fetches real CS50 Lecture 0 SRT from Harvard CDN, parses into ~700 chunks, POSTs to `/api/transcript/segment` every 3 seconds
- Falls back to hardcoded chunks if CDN fetch fails

### Product Page (`product-page/`)
- Static landing page (`index.html`), no build step
- Serve locally: `cd product-page && python3 -m http.server 8080`

### Message Protocol
All host↔student communication uses Zoom SDK `sendMessage()`/`onMessage()` with a standardized envelope containing `type`, `payload`, `seq` (sequence number), `timestamp`, `senderId`, and `senderRole`. **NOTE: This is currently broken — see Known Issues.**

## Key Config

- `client/vite.config.ts` — Proxies `/api/*` requests to `localhost:3001` (dev mode only)
- `client/index.html` — Must include `<script src="https://appssdk.zoom.us/sdk.js"></script>` before app bundle
- `.env` — Requires `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_REDIRECT_URL`, `ZOOM_SECRET_TOKEN`, `SESSION_SECRET`, `DATABASE_URL`, `AWS_REGION`, `PORT`, `CLIENT_URL` (see `.env.example`)

## AI Backend

- AWS Bedrock, region `us-east-1`
- Current model: `meta.llama3-70b-instruct-v1:0` (Llama 3 70B via Converse API)
- Also available: `us.anthropic.claude-sonnet-4-20250514-v1:0`, `us.anthropic.claude-haiku-4-5-20251001-v1:0`
- Cross-region inference profile IDs required (`us.` prefix)
- IAM role: `zoom-momentum-ec2-role`

## Zoom SDK Integration (CRITICAL)

- **Do NOT use `import zoomSdk from '@zoom/appssdk'`** — the npm package creates a separate SDK instance that lacks the native bridge in ZoomWebKit. This causes `config()` to timeout.
- **Use `(window as any).zoomSdk`** — the CDN script tag (`sdk.js`) in `index.html` creates the global `window.zoomSdk` which has the native bridge connected to the Zoom client.
- All four hooks (`useZoomSdk`, `useMessaging`, `useZoomAuth`, `useZoomEvents`) use `window.zoomSdk` with a guard for when running outside Zoom (DevPreview).
- Server must serve production build via Express (port 3001) with ngrok tunneling to 3001 — Vite dev server does NOT work inside Zoom.
- OWASP headers (Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, Content-Security-Policy) are REQUIRED — Zoom blocks rendering without all four.

## Known Issues (Priority Order)

### P0: Host↔Student Messaging Broken
- `zoomSdk.connect()` resolves, `onConnect` fires on both host and attendee
- `zoomSdk.postMessage()` resolves with `{"message":"Success"}` on both sides
- But `onMessage` NEVER fires — neither side receives messages
- The native bridge (`native2js`) shows no message delivery events
- **Root cause found:** The SDK docs state: *"Apps that first call the `connect` API will be able to broadcast messages to instances of the same app in the main client."* This means `postMessage`/`onMessage` is designed for communication between the **in-meeting** and **main client** instances of the SAME user's app — NOT between different participants' app instances. It was never meant for host↔student messaging.
- The reference app (Arlo at `/home/ubuntu/arlo`) confirms this — it uses WebSockets through the backend (`MeetingContext.js` connects to `/ws?meeting_id=...`) for all inter-participant communication.
- **Fix: Replace `useMessaging` with a WebSocket relay through Express.** Server manages rooms by meetingId, relays messages between all connected clients in the same meeting.

### P1: Other Bugs
1. **Multiple PrismaClient instances** — transcript.ts, bookmarks.ts, auth.ts, rtms-ingest.ts, meeting-resolver.ts each create their own. Should be singleton.
2. **AI topic-segment silent failure** — Returns fake success on AI error instead of surfacing the failure.
3. **AI topic dedup** — Similar titles sometimes create duplicate topics across polling cycles.
4. **RTMS secret fallback** — `config.zoom_secret_token` returns `''` from `optional()`, so `||` fallback silently uses `clientSecret`.
5. **BigInt serialization** — transcript.ts returns segments without converting BigInt to string.
6. **Participant count** — Hardcoded "Participants: --" in HostDashboard, never wired to `getMeetingParticipants()`.
7. **Sign-in button** — Does nothing on participant side in Zoom context (OAuth flow needs work).
8. **"Analyze Now" button** — Confusing alongside "Start AI" on Anchor tab. Should be removed.

## Git Config
- user.name: `shitijkarsolia`
- user.email: `shitijkarsolia@gmail.com`
- Do NOT add `Co-Authored-By` lines to commits
