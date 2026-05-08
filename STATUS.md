# Zoom Momentum — Project Status

Last updated: April 7, 2026

## Current State

The app builds, runs locally, and **loads inside a real Zoom meeting**. All core features are code-complete. RTMS live transcription tested and working. **Host↔student messaging now works via WebSocket relay.** AI backend uses CREATE AI (claude4_5_sonnet → gpt5) with Bedrock fallback. Demo mode auto-enables outside Zoom for browser testing.

### Resolved Blockers

1. ~~**SDK Config Timeout**~~ — Fixed. Use `window.zoomSdk` from CDN, not npm import.
2. ~~**Mock Transcript FK Bug**~~ — Fixed. `transcript.ts` uses `meeting-resolver` + upsert.
3. ~~**Host↔Student Messaging**~~ — Fixed. Replaced Zoom SDK `postMessage`/`onMessage` with WebSocket relay through Express. SDK messaging was designed for same-user instances only.

---

## Features

| Feature | Status | Notes |
|---|---|---|
| Professor's Pulse (AI Polls) | Complete, tested | Generate → edit → launch → auto-dismiss → results |
| Arena (Quiz Game) | Complete, tested | AI generates from CS50 transcript, preview/edit/tailor, 10s timer, auto-advance, leaderboard |
| Live Anchor (Lecture Analysis) | Complete, tested | Real AI analysis of CS50 transcript, topic detection, glossary extraction |
| Auto-Bookmarks (Cue Detection) | Complete | AI detects emphasis cues, broadcasts to students |
| Student Bookmarks | Complete, tested | Mark for Review button, expandable bookmark list with metadata |
| Live Transcript Tab | Complete, tested | Host + student both see real-time transcript with glossary highlighting |
| Recovery Pack (Post-Class) | Complete, tested | Student gets personalized review; Host gets engagement stats |
| OAuth PKCE | Complete | Full Zoom OAuth flow with session |
| RTMS Integration | Complete, tested | Start AI button triggers `startRTMS()`, webhook + stream client, live-tested |
| SDK Events | Complete | Active speaker, late joiner, meeting end |
| WebSocket Messaging | Complete, tested | Server relay with rooms by meetingId, auto-reconnect, state sync. Tested in Zoom with host + student. |
| Demo Mode | Complete, tested | Auto-enabled outside Zoom, role switcher, sim buttons, transcript toggle |
| Mock Transcript | Complete, tested | Fetches real CS50 Lecture 0 SRT (700 chunks) from Harvard CDN |
| SDK Config | Fixed | Uses `window.zoomSdk` from CDN, not npm import |
| AI Backend | Complete | CREATE AI (claude4_5_sonnet/gpt5) with Bedrock fallback |

---

## Known Bugs

1. ~~**[Critical] SDK config timeout**~~ — FIXED.
2. ~~**[Critical] Messaging broken**~~ — FIXED. WebSocket relay.
3. ~~**[Medium] Multiple PrismaClient instances**~~ — FIXED. Singleton in `server/src/db.ts`.
4. ~~**[Medium] AI topic-segment silent failure**~~ — FIXED. Returns 500.
5. ~~**[Medium] Anchor topic dedup**~~ — FIXED. Fuzzy title matching.
6. ~~**[Low] RTMS secret fallback**~~ — FIXED.
7. ~~**[Low] BigInt serialization**~~ — FIXED. `transcript.ts` returns timestamp/seqNo as Numbers.
8. ~~**[Low] Startup race**~~ — FIXED. Mock-transcript retries with backoff (3 attempts).
9. ~~**[Low] Participant count**~~ — FIXED. Filters out app's own participantUUID from count.
10. ~~**[Low] Sign-in button**~~ — FIXED. Guards against missing SDK in demo mode with clear error.
11. ~~**[Low] "Analyze Now" button**~~ — FIXED. Removed.

---

## What's Left

### Priority 0 — DONE
- ~~Switch messaging to WebSocket relay~~ — DONE. Server relay + client rewrite.
- ~~RTMS integration~~ — DONE. Start AI triggers `startRTMS()`, live-tested.
- ~~Demo mode~~ — DONE. Auto-enabled outside Zoom, DevPreview removed.

### Priority 1 — End-to-End in Zoom
- ~~Test all features inside a real Zoom meeting (host + student) with WebSocket messaging~~ — DONE. Tested April 7.
- ~~Test RTMS with live transcription~~ — DONE
- Test guest mode with second Zoom account

### Priority 2 — Code Quality
- ~~Create shared PrismaClient singleton~~ — DONE
- ~~Fix AI silent failure in topic-segment~~ — DONE
- ~~Improve anchor topic dedup (fuzzy matching)~~ — DONE
- ~~Wire participant count to `getMeetingParticipants()`~~ — DONE (live updates via onParticipantChange)
- ~~Fix BigInt serialization in transcript route~~ — DONE
- ~~Add test framework (Vitest)~~ — DONE (11 tests: ai-client failover + meeting-resolver)
- ~~Add linter (ESLint)~~ — DONE (TypeScript + React plugins, 0 errors)
- ~~WebSocket auth hardening~~ — DONE (session cookie parsed on WS handshake)

### Priority 3 — Production
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
- App type: General app, User-managed, Development mode
- Static ngrok domain: `your-tunnel.ngrok-free.dev`
- All Marketplace URLs must match the static domain (Home URL, OAuth redirect, Domain Allow List, RTMS webhook)
- 250 SDK APIs selected in Marketplace
- Second Zoom account added as member of same org for testing

### Dev Setup
```bash
# For Zoom testing (production build):
npm run build -w client
ngrok http 3001 --url=your-tunnel.ngrok-free.dev
npm run dev -w server
npm run dev -w mock-transcript  # optional, for mock CS50 transcript data

# For browser testing (demo mode — auto-enabled outside Zoom):
npm run dev -w server
npm run dev -w mock-transcript
# Open http://localhost:3001
```

---

## Changelog

### April 14-15, 2026
- Fixed BigInt serialization in transcript route (return as Numbers)
- Fixed participant count off-by-one (filter out app's own UUID)
- Fixed mock-transcript startup race (retry with backoff)
- Fixed sign-in button in demo mode (guard against missing SDK)
- Added ESLint with TypeScript + React plugins (0 errors)
- Added Vitest with 11 tests (AI failover chain + meeting resolver)
- WebSocket auth hardening (session cookie parsed on handshake)
- Simplified README attribution
- Committed experimental AI eval scripts (server/scripts/)
- Security: CORS restricted, WS rate limiting (20 msg/sec) + 64KB max payload, AI input sanitization
- Security: bookmarks use session userId, JSON body limit 16KB
- Fixed WebSocket rejecting real Zoom meeting UUIDs (auto-create meeting on connect)
- Fixed RTMS segment storage (upsert + seqCounter initialized from DB)
- UX: participant count shows students only, removed sign-in button
- UX: bookmarks are local-only (no server POST required)
- UX: End Class button broadcasts CLASS_END to students, stops AI polling
- UX: host and student both see blue-themed "Class Complete" summary
- UX: green "Live" indicator in status bar when AI is active
- Transcript: per-segment display with speaker names, HH:MM:SS timestamps
- Transcript: fixed RTMS microsecond timestamps, auto-scroll only when at bottom
- Transcript: host has separate Transcript tab, removed glossary from Anchor
- Timeline: AI ignores small talk/setup/personal remarks, returns null for non-academic content
- Timeline: dedup threshold raised to 0.7, skip short titles (<3 words)
- Timeline: skip re-analysis when transcript buffer unchanged
- Bookmarks: per-topic state (shows "Bookmarked" when already saved, prevents re-bookmark)
- Bookmarks: own tab with remove/unpin, removed manual/auto labels
- Arena: cancel button on quiz preview, host can abandon before starting
- Arena: leaderboard ties get same rank
- Removed dead message types (BULLET_UPDATE, LATE_JOIN_SUMMARY), added CLASS_END
- Added TESTING.md manual testing checklist

### April 13-14, 2026
- Arena: host can end quiz anytime (End Quiz button), student overlay stays visible between questions
- Removed mock transcript fallback in Zoom — Anchor only uses real RTMS data inside Zoom
- Participant count updates live via `onParticipantChange` listener
- Updated docs to reflect all resolved P2 bugs

### April 6-7, 2026
- **SDK config timeout FIXED** — Root cause: npm `@zoom/appssdk` creates separate instance without native bridge. Switched all hooks to `window.zoomSdk` from CDN script tag.
- **Server serves production build** — Express serves `client/dist` + API on port 3001. Ngrok tunnels to 3001.
- **Messaging debugging** — Confirmed `connect()`, `onConnect`, `postMessage` all work. `onMessage` never fires. Arlo reference app uses WebSockets instead of SDK messaging.
- Fixed mock transcript FK bug — transcript.ts uses meeting-resolver + upsert
- Fixed useLiveAnchor missing meetingId param and wrong response field
- Switched mock transcript from 16 hardcoded math chunks to real CS50 Lecture 0 (700 chunks from Harvard CDN)
- UI/UX overhaul:
  - Poll auto-dismisses 2s after student submits, results fade in/out after 8s
  - Arena: 10s timer, auto-advance (timer → leaderboard → next question), question preview/edit, tailor input, host navigation
  - New BookmarkList component (expandable with metadata)
  - Renamed "I'm Confused" to "Mark for Review"
  - New Transcript tab for students (topic headers, glossary highlighting, auto-scroll)
  - Separate end-class views (host: stats, student: recovery pack)
- Improved AI topic-segment prompt for specific, study-worthy content
- Fixed duplicate topics in anchor (title-based dedup)
- DevPreview wired to real CS50 transcript for Arena, Anchor, and Transcript
- Consolidated docs: STATUS.md, merged spec docs, removed old update files
- Removed all zoom.shitijmathur.tech references

### March 16, 2026
- Switched AI from OpenAI to AWS Bedrock (Llama 3 70B). All 5 AI endpoints verified.
- Built RTMS integration (webhook + ingest service + session lifecycle).
- Added Zoom SDK events: late joiner catch-up, speaker spotlight, meeting end detection, auto-bookmarks.
- Wired recovery flow end-to-end (meeting end → recovery pack → PostClassSummary).
- UI/UX polish: animations, accessibility, empty states, notification dots.
- Enhanced DevPreview with simulation buttons.
- EC2 deployed and running. DCV remote desktop working.

### March 9, 2026
- Core app built: client + server running locally.
- Role-based routing (host vs student) working.
- Three features implemented end-to-end: Pulse, Arena, Live Anchor.
- Zoom Apps SDK integrated, app runs inside Zoom meeting.
- OAuth PKCE flow working.
- Mock transcript service running for local dev.
- Database set up (Prisma + SQLite) with all models.

### Pre-March 9
- Initial project setup, product page (PR #4), development environment (PR #5).
