# Zoom Momentum

A Zoom Apps SDK application that transforms passive virtual classrooms into active learning environments. Momentum runs as an in-meeting side panel, giving professors real-time engagement tools and giving students a dynamic topic timeline, glossary, and post-class review.

---

## How It Works

Zoom Momentum is a **single app** installed once on the Zoom Marketplace. When a participant opens it from the Apps panel during a meeting, the app detects their role automatically:

- **Host / Co-host** sees the **Host Dashboard** with controls to launch polls, start trivia games, and monitor the AI-powered live anchor.
- **Participants** see the **Student View** with a topic timeline, glossary, bookmark button, and receive polls/trivia from the host in real time.

Both views are served from the same URL. The Zoom SDK provides the user's role via `getUserContext()`, and the app renders the appropriate interface. There is no separate installation for students vs. professors.

### User Flow

```
Meeting starts
  -> Professor opens Momentum from the Apps panel
  -> OAuth login (first time only)
  -> Welcome screen (role-specific feature overview)
  -> Host Dashboard appears

Students open Momentum from the Apps panel
  -> OAuth login (first time only)
  -> Welcome screen (student feature overview)
  -> Student View appears
  -> Students automatically receive polls, trivia, and topic updates from the host
```

---

## Features

### Professor's Pulse (Host only)

Check-in polls that let the professor gauge student understanding at any point during the lecture.

- Enter optional context (e.g., "We just covered supply and demand")
- AI generates a relevant multiple-choice question
- Professor previews and can edit before launching
- Students see a modal overlay, select an answer, and submit
- Professor ends the poll and results are shown to everyone as a bar chart

### Warm-Up Arena (Host launches, students participate)

A timed trivia game for reviewing material at the start of class.

- Professor enters a topic and AI generates 5 quiz questions
- Each question has a 15-second countdown timer
- Students answer in real time and are scored (base points + speed bonus)
- Leaderboard updates after each question
- Final standings shown at the end

### Live Anchor (Automatic for all participants)

AI-powered real-time topic timeline and glossary built from the live lecture transcript.

- Host activates the AI analysis, which polls the transcript buffer every 30 seconds
- When the AI detects a topic change, a new topic card appears with bullet-point takeaways
- Technical terms and definitions are extracted into a searchable glossary
- Students see the same timeline and can switch between Timeline and Glossary tabs

### Recovery Agent (Post-class, student-facing)

Personalized post-class review based on moments the student bookmarked during the lecture.

- During the lecture, students can tap "I'm Confused" to bookmark the current topic
- When the class ends, the app generates a Recovery Pack with:
  - Plain-language explanation of each confusing topic
  - A practice problem
  - A suggested external resource
- A summary screen shows topics covered, key terms, and the recovery pack

---

## Host vs. Student View

| Capability | Host | Student |
|---|---|---|
| Launch polls | Yes | No (receives and answers) |
| Start trivia game | Yes | No (receives and plays) |
| Control AI anchor | Yes (start/stop/analyze now) | No (receives updates) |
| Topic timeline | Yes (read-only) | Yes (read-only) |
| Glossary | Yes (read-only) | Yes (searchable) |
| Bookmark confused moments | No | Yes |
| Post-class recovery pack | No | Yes |
| View poll/trivia results | Yes (aggregate) | Yes (own results) |

The host acts as the **source of truth** for all shared state. The host's app maintains the canonical state and broadcasts updates to all students via the Zoom SDK's `sendMessage` / `onMessage` API. Students never send data to each other directly.

---

## Architecture

```
Zoom Desktop Client
  └── Side Panel (Embedded Browser)
        └── React App
              ├── Host? → HostDashboard
              └── Student? → StudentView

Both connect to:
  Express Backend (port 3001)
    ├── /api/auth     → Zoom OAuth PKCE
    ├── /api/ai       → AI endpoints (poll, quiz, topic, recovery, cues)
    ├── /api/transcript → Transcript storage + buffer
    └── /api/bookmarks  → Bookmark CRUD

  AI Provider (OpenAI-compatible, configured via OPENAI_BASE_URL)
  SQLite Database (via Prisma ORM)
```

### Message Protocol

All real-time communication uses the Zoom SDK's `sendMessage` / `onMessage`:

| Message | Sender | Receiver | Purpose |
|---|---|---|---|
| `POLL_START` | Host | Students | Launch a poll |
| `POLL_RESPONSE` | Student | Host | Submit poll answer |
| `POLL_RESULTS` | Host | Students | Broadcast results |
| `ARENA_START` | Host | Students | Begin trivia |
| `ARENA_QUESTION` | Host | Students | Send next question |
| `ARENA_ANSWER` | Student | Host | Submit trivia answer |
| `ARENA_LEADERBOARD` | Host | Students | Show scores |
| `ARENA_END` | Host | Students | Final standings |
| `TOPIC_UPDATE` | Host | Students | New/updated topic |
| `GLOSSARY_UPDATE` | Host | Students | New terms |
| `FULL_STATE` | Host | Students | Late-joiner sync |
| `REQUEST_STATE` | Student | Host | Request full state |

---

## Quick Start

### Prerequisites

- Node.js 18+
- A Zoom App registered on the [Zoom Marketplace](https://marketplace.zoom.us)
- An OpenAI-compatible API key

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in: ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_REDIRECT_URL,
#          SESSION_SECRET, OPENAI_API_KEY, OPENAI_BASE_URL (optional)

# 3. Copy env to server directory (server reads from its own cwd)
cp .env server/.env

# 4. Initialize the database
cd server && npx prisma migrate dev --name init && cd ..

# 5. Start development servers
npm run dev
```

### Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start client (port 5173) + server (port 3001) |
| `npm run dev:mock` | Same + mock transcript service |
| `npm run build` | Production build |
| `npm run db:migrate -w server` | Run Prisma migrations |
| `npm run db:studio -w server` | Open Prisma Studio |

### Testing in Zoom

Zoom requires HTTPS for OAuth and webhooks. Use a tunnel:

```bash
ngrok http 3001 --domain your-domain.ngrok-free.app
```

Then configure your Zoom App:
- **Home URL:** `https://your-domain.ngrok-free.app`
- **Redirect URL:** `https://your-domain.ngrok-free.app/api/auth/callback`

### DevPreview (Browser Testing)

When accessed outside of Zoom, the app automatically renders a **DevPreview** that simulates both Host and Student views with mock data. This lets you test UI flows without a live Zoom meeting. The DevPreview includes:

- Host/Student view toggle
- All three feature tabs (Pulse, Arena, Anchor)
- Mock topic generation for Anchor
- End Class flow with Recovery Pack
- Real AI integration for poll/quiz generation

---

## Project Structure

```
zoom-momentum/
  client/                          # React frontend (Zoom App)
    src/
      App.tsx                      # SDK init, auth, role routing
      DevPreview.tsx               # Browser-only testing UI
      views/
        WelcomeView.tsx            # Post-auth onboarding screen
        HostDashboard.tsx          # Host: Pulse + Arena + Anchor
        StudentView.tsx            # Student: Timeline + Glossary
        AuthView.tsx               # OAuth login
      components/
        pulse/                     # Poll creator, card, results
        arena/                     # Quiz host, student, leaderboard
        anchor/                    # Topic card, timeline, glossary
        recovery/                  # Recovery pack, post-class summary
        shared/                    # FeatureInfo tooltip
      hooks/
        useZoomSdk.ts              # SDK config + role detection
        useZoomAuth.ts             # OAuth PKCE flow
        useMessaging.ts            # sendMessage / onMessage abstraction
        usePulse.ts                # Poll state (host + student)
        useArena.ts                # Trivia state (host + student)
        useLiveAnchor.ts           # Topic timeline state (host + student)
      types/
        messages.ts                # Message types + app state types

  server/                          # Express backend
    src/
      server.ts                    # Express app + middleware
      config.ts                    # Environment variable validation
      routes/
        auth.ts                    # Zoom OAuth PKCE
        ai.ts                      # AI endpoints (subject-agnostic)
        transcript.ts              # Transcript storage + buffer
        bookmarks.ts               # Bookmark CRUD
    prisma/
      schema.prisma                # Database schema

  mock-transcript/                 # Dev-only mock RTMS service
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + @zoom/appssdk |
| Backend | Express + TypeScript + Prisma |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI | OpenAI-compatible API (configurable via `OPENAI_BASE_URL`) |
| Tunnel | ngrok or Cloudflare Tunnel |

---

## What's Done

- [x] Zoom OAuth PKCE authentication
- [x] Host/student role detection and routing
- [x] Welcome/onboarding screen with role-specific feature descriptions
- [x] Feature info tooltips on every tab
- [x] Professor's Pulse (polls) with AI generation, preview/edit, launch, results
- [x] Warm-Up Arena (trivia) with AI quiz generation, countdown, scoring, leaderboard
- [x] Live Anchor (topic timeline + glossary) with AI transcript analysis
- [x] Recovery Agent (bookmarks + post-class summary + recovery pack)
- [x] Detect Cues endpoint (AI detection of professor emphasis phrases)
- [x] Messaging layer with sequence numbers and late-joiner sync
- [x] DevPreview for browser-based testing
- [x] Subject-agnostic AI prompts (works for any academic discipline)
- [x] Mock transcript service for development

## What's Pending

- [ ] **RTMS integration** — Real-time transcript ingestion from Zoom (webhook + WebSocket)
- [ ] **Auto-bookmark** — Host broadcasts bookmarks when professor cues are detected
- [ ] **Smart Spotlight** — Auto-spotlight students who ask questions (requires `onActiveSpeakerChange`)
- [ ] **Late Joiner catch-up** — Send `FULL_STATE` when new participant joins (requires `onParticipantChange`)
- [ ] **Post-meeting context** — Detect meeting end via `onRunningContextChange` to trigger recovery pack
- [ ] **Production deployment** — PostgreSQL, proper session store, environment hardening
