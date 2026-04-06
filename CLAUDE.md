# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Zoom Momentum is a Zoom Apps SDK in-meeting side panel app that transforms passive virtual classrooms into active learning environments. It's a monorepo with three npm workspaces: `client` (React + Vite), `server` (Express + Prisma), and `mock-transcript` (dev utility).

## Commands

```bash
npm run dev              # Run client (port 5173) + server (port 3001) concurrently
npm run dev:mock         # Same as above + mock-transcript service (fake lecture chunks)
npm run build            # Build both client and server
npm run db:migrate       # Run Prisma migrations (server workspace)
npm run db:studio        # Open Prisma Studio GUI

npm run dev -w client    # Client dev server only
npm run dev -w server    # Server dev server only (tsx watch mode)
npm run build -w server  # Compile server TypeScript to dist/
```

No test framework or linter is currently configured.

## Architecture

### Client (`client/src/`)
- **App.tsx** — Entry point with role-based routing (host vs student via Zoom SDK role detection)
- **Hooks** — Core logic lives in hooks:
  - `useZoomSdk` — SDK init, role detection
  - `useZoomAuth` — OAuth PKCE flow
  - `useMessaging` — `connect()`/`postMessage()`/`onMessage()` with sequence-numbered state sync
  - `usePulse` / `useArena` — Feature-specific state management
- **Views** — `HostDashboard` (Pulse/Arena/Anchor tabs), `StudentView` (Timeline/Glossary/Transcript tabs), `AuthView`
- **Components** — `pulse/` (polls), `arena/` (trivia/leaderboard), `anchor/` (timeline, glossary, transcript, bookmarks), `recovery/` (post-class summary)
- **Types** — `messages.ts` defines the full message protocol and state types

### Server (`server/src/`)
- **server.ts** — Express app with CORS, sessions, route mounting
- **config.ts** — Env var validation (fails fast on missing vars)
- **Routes:**
  - `auth.ts` — OAuth PKCE (`/authorize`, `/callback`, `/me`)
  - `ai.ts` — AI endpoints (`/poll-generate`, `/quiz-generate`, `/topic-segment`, `/recovery-pack`, `/detect-cues`)
  - `transcript.ts` — Transcript storage (`POST /segment`, `GET /buffer`)
  - `bookmarks.ts` — Bookmark CRUD
- **Database** — Prisma ORM with SQLite (dev) / PostgreSQL (prod). Schema in `server/prisma/schema.prisma` with models: User, Meeting, TranscriptSegment, Bookmark, QuizSet, RecoveryPack

### Mock Transcript (`mock-transcript/`)
- Fetches real CS50 Lecture 0 SRT from Harvard CDN, parses into ~700 chunks, POSTs to `/api/transcript/segment` every 3 seconds

### Product Page (`product-page/`)
- **index.html** — Static landing page (single file, no build step)
- Fonts: Playfair Display (headings), Plus Jakarta Sans (body), Space Mono (decorative)
- Color scheme: `#0044CC` (blue bg), `#d4b84a` (gold accents), white text
- Sections: Hero, Features, Demo (video placeholder), How It Works, For Who, About (NEXT Lab + Zoom Fellows), Tech Stack, CTA, Footer
- Assets: `assets/` folder with ASU and Zoom logos
- Serve locally: `cd product-page && python3 -m http.server 8080`
- Glassmorphism cards, scroll-reveal animations, always-sticky nav

### Message Protocol
All host↔student communication uses Zoom SDK `sendMessage()`/`onMessage()` with a standardized envelope containing `type`, `payload`, `seq` (sequence number), `timestamp`, `senderId`, and `senderRole`.

## Key Config

- `client/vite.config.ts` — Proxies `/api/*` requests to `localhost:3001`
- `.env` — Requires `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_REDIRECT_URL`, `ZOOM_SECRET_TOKEN`, `SESSION_SECRET`, `DATABASE_URL`, `AWS_REGION`, `PORT`, `CLIENT_URL` (see `.env.example`)

## AI Backend

- AWS Bedrock, region `us-east-1`
- Current model: `meta.llama3-70b-instruct-v1:0` (Llama 3 70B via Converse API)
- Also available: `us.anthropic.claude-sonnet-4-20250514-v1:0`, `us.anthropic.claude-haiku-4-5-20251001-v1:0`
- Cross-region inference profile IDs required (`us.` prefix)
- IAM role: `zoom-momentum-ec2-role`

## Known Bugs

1. **Multiple PrismaClient instances** — transcript.ts, bookmarks.ts, auth.ts, rtms-ingest.ts, meeting-resolver.ts each create their own. Should be singleton.
2. **AI topic-segment silent failure** — Returns fake success on AI error instead of surfacing the failure.
3. **RTMS secret fallback** — `config.zoom_secret_token` returns `''` from `optional()`, so `||` fallback silently uses `clientSecret`.
4. **BigInt serialization** — transcript.ts returns segments without converting BigInt to string.
