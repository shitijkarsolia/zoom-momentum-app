# Zoom Momentum — Project Status

Last updated: April 6, 2026

## Current State

The app builds and runs locally. All core features are code-complete. Two blockers prevent end-to-end testing inside a real Zoom meeting.

### Blockers

1. **SDK Config Timeout** — The app times out when loading inside the Zoom side panel (`config took longer than 10000ms`). It worked briefly with one ngrok URL, then broke after URL changes. Needs: verify all Marketplace settings match the static ngrok domain, re-add app via Local Test, check browser console inside Zoom for specific errors.

2. **Mock Transcript FK Bug** — `transcript.ts` inserts segments with the raw `meetingId` from the request body, but no Meeting record exists for `mock-meeting-001`. Every insert fails with Prisma P2003 (foreign key constraint). The `meeting-resolver.ts` service that auto-creates meetings exists but is only used by `bookmarks.ts` and `rtms-ingest.ts` — not by `transcript.ts`. This means Live Anchor, Glossary, and Auto-Bookmarks have never been tested with real data flowing through.

---

## Features

| Feature | Status | Notes |
|---|---|---|
| Professor's Pulse (AI Polls) | Complete | Generate → edit → launch → collect → results |
| Warm-Up Arena (Trivia) | Complete | 5 timed questions, speed scoring, leaderboard |
| Live Anchor (Lecture Analysis) | Complete (untested) | 30s polling, topic detection, glossary. Blocked by FK bug |
| Auto-Bookmarks (Cue Detection) | Complete (untested) | AI detects emphasis cues. Blocked by FK bug |
| Recovery Pack (Post-Class) | Complete | Meeting end → recovery pack → PostClassSummary |
| OAuth PKCE | Complete | Full Zoom OAuth flow with session |
| RTMS Integration | Complete (untested) | Webhook + stream client. Needs live meeting test |
| SDK Events | Complete | Active speaker, late joiner, meeting end |
| Message Protocol | Complete | 15 types, sequence-numbered state sync |
| DevPreview | Complete | Full browser simulation mode |

---

## Known Bugs

1. **[Critical] Mock transcript FK violation** — See blocker #2 above.
2. **[Critical] SDK config timeout** — See blocker #1 above.
3. **[Medium] useLiveAnchor missing meetingId** — `useLiveAnchor.ts` fetches `/api/transcript/buffer` without passing a `meetingId` query param. Backend returns 400.
4. **[Medium] Multiple PrismaClient instances** — `transcript.ts`, `bookmarks.ts`, `auth.ts`, `rtms-ingest.ts`, `meeting-resolver.ts` each create their own `new PrismaClient()`. Should be a singleton.
5. **[Medium] AI topic-segment silent failure** — `ai.ts` returns a fake success response when the AI call fails, masking real errors.
6. **[Low] RTMS secret fallback** — `rtms.ts` falls back to `clientSecret` if `zoom_secret_token` is empty string (which `optional()` returns as `''`).
7. **[Low] BigInt serialization** — `transcript.ts` returns segments without converting BigInt fields to strings.
8. **[Low] Startup race** — mock-transcript posts before Express is ready; chunk #1 always fails with ECONNREFUSED.

---

## What's Left

### Priority 1 — Unblock Testing
- Fix transcript.ts to use meeting-resolver (fixes FK bug)
- Fix useLiveAnchor to pass meetingId to buffer endpoint
- Debug SDK config timeout in Zoom meeting

### Priority 2 — End-to-End Validation
- Test full anchor pipeline locally (mock transcript → DB → buffer → AI → topics → students)
- Test inside a real Zoom meeting (host + student)
- Test RTMS with live transcription
- Test guest mode with second Zoom account

### Priority 3 — Code Quality
- Create shared PrismaClient singleton
- Fix RTMS secret fallback logic
- Fix BigInt serialization in transcript route
- Fix AI silent failure in topic-segment
- Add test framework (Vitest)
- Add linter (ESLint)

### Priority 4 — Production
- PostgreSQL setup (replace SQLite)
- HTTPS on EC2 (Let's Encrypt)
- Persistent session store (Redis or DB-backed)
- Point Zoom Marketplace URLs to EC2 domain
- Transcript buffer cleanup for long meetings
- CI/CD pipeline

---

## Infrastructure

### EC2
- Instance running with DCV remote desktop
- IAM role: `zoom-momentum-ec2-role` (account `741448917297`)
- S3 + Bedrock invoke access

### AI (AWS Bedrock)
- Region: `us-east-1`
- Current model: `meta.llama3-70b-instruct-v1:0` (Llama 3 70B via Converse API)
- Also available: `us.anthropic.claude-sonnet-4-20250514-v1:0`, `us.anthropic.claude-haiku-4-5-20251001-v1:0`
- Cross-region inference profile IDs required (us. prefix)
- Budget guard: $100/month Bedrock spend limit with auto-deny

### Zoom Marketplace
- App ID: `e2Tvu18-QVug7tGJm7LMWg`
- Client ID: `BKOHt7vISimMYkz_2ML7Q`
- App type: User-managed, Development mode
- Static ngrok domain: `your-tunnel.ngrok-free.dev`
- All Marketplace URLs must match the static domain (Home URL, OAuth redirect, Domain Allow List, RTMS webhook)

### Dev Setup
```bash
# 1. Start ngrok
ngrok http 5173 --url=your-tunnel.ngrok-free.dev

# 2. Start dev server
npm run dev:mock   # client + server + mock transcript

# 3. Build
npm run build
```

---

## Changelog

### March 16, 2026
- Switched AI from OpenAI to AWS Bedrock (Llama 3 70B). All 5 AI endpoints verified.
- Built RTMS integration (webhook + ingest service + session lifecycle).
- Added Zoom SDK events: late joiner catch-up, speaker spotlight, meeting end detection, auto-bookmarks.
- Wired recovery flow end-to-end (meeting end → recovery pack → PostClassSummary).
- UI/UX polish: animations, accessibility, empty states, notification dots.
- Enhanced DevPreview with simulation buttons.
- EC2 deployed and running. DCV remote desktop working.
- PR #7 merged (RTMS, state sync, bookmark recovery feedback).

### March 9, 2026
- Core app built: client + server running locally.
- Role-based routing (host vs student) working.
- Three features implemented end-to-end: Pulse, Arena, Live Anchor.
- Zoom Apps SDK integrated, app runs inside Zoom meeting.
- OAuth PKCE flow working.
- Mock transcript service running for local dev.
- Database set up (Prisma + SQLite) with all models.
- RTMS access granted for three team members.

### Pre-March 9
- Initial project setup, product page (PR #4), development environment (PR #5).
