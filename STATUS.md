# Zoom Momentum — Project Status

Last updated: April 6, 2026

## Current State

The app builds and runs locally. All core features are code-complete and tested in DevPreview with real CS50 lecture data. One blocker remains: the app won't load inside a real Zoom meeting.

### Blocker

**SDK Config Timeout** — The app times out when loading inside the Zoom side panel (`config took longer than 10000ms`). It worked briefly with one ngrok URL, then broke after URL changes. Needs: verify all Marketplace settings match the static ngrok domain, re-add app via Local Test, check browser console inside Zoom for specific errors.

---

## Features

| Feature | Status | Notes |
|---|---|---|
| Professor's Pulse (AI Polls) | Complete, tested | Generate → edit → launch → collect → auto-dismiss → results |
| Arena (Quiz Game) | Complete, tested | AI generates from transcript, preview/edit, tailor, 10s timer, auto-advance, leaderboard |
| Live Anchor (Lecture Analysis) | Complete, tested | Real AI analysis of CS50 transcript, topic detection, glossary extraction |
| Auto-Bookmarks (Cue Detection) | Complete | AI detects emphasis cues, broadcasts to students |
| Student Bookmarks | Complete, tested | Mark for Review button, expandable bookmark list with metadata |
| Live Transcript Tab | Complete, tested | Real-time transcript with topic headers, glossary term highlighting |
| Recovery Pack (Post-Class) | Complete, tested | Student gets personalized review; Host gets engagement stats |
| OAuth PKCE | Complete | Full Zoom OAuth flow with session |
| RTMS Integration | Complete (untested) | Webhook + stream client. Needs live meeting test |
| SDK Events | Complete | Active speaker, late joiner, meeting end |
| Message Protocol | Complete | 15 types, sequence-numbered state sync |
| DevPreview | Complete, tested | Full browser simulation with real AI + CS50 transcript |
| Mock Transcript | Complete, tested | Fetches real CS50 Lecture 0 SRT (700 chunks) from Harvard CDN |

---

## Known Bugs

1. **[Critical] SDK config timeout** — App won't load inside Zoom meeting side panel.
2. **[Medium] Multiple PrismaClient instances** — transcript.ts, bookmarks.ts, auth.ts, rtms-ingest.ts, meeting-resolver.ts each create their own. Should be singleton.
3. **[Medium] AI topic-segment silent failure** — `ai.ts` returns a fake success response when the AI call fails.
4. **[Medium] Anchor topic dedup** — AI sometimes generates slightly different titles for the same topic across polls. Substring matching helps but isn't perfect.
5. **[Low] RTMS secret fallback** — `rtms.ts` falls back to `clientSecret` if `zoom_secret_token` is empty string.
6. **[Low] BigInt serialization** — `transcript.ts` returns segments without converting BigInt fields to strings.
7. **[Low] Startup race** — mock-transcript chunk #1 always fails with ECONNREFUSED (server not ready yet).

### Fixed This Session
- ~~Mock transcript FK violation~~ — transcript.ts now uses meeting-resolver + upsert
- ~~useLiveAnchor missing meetingId~~ — now passes meetingId param and reads `buffer` field
- ~~DevPreview not wired to real data~~ — Arena, Anchor, Transcript all use CS50 transcript
- ~~Duplicate "Live Anchor" title~~ — removed from Timeline component
- ~~"I'm Confused" button~~ — renamed to "Mark for Review"
- ~~No bookmark visibility~~ — expandable BookmarkList component added
- ~~Arena requires manual advance~~ — auto-advances after timer + leaderboard
- ~~No question preview~~ — host can review/edit/tailor questions before starting
- ~~Same end-class view for host and student~~ — host sees stats, student sees recovery pack
- ~~AI prompt too generic~~ — rewritten for specific, study-worthy bullets and glossary

---

## What's Left

### Priority 1 — Unblock Zoom Testing
- Debug SDK config timeout in Zoom meeting
- Verify Marketplace settings match static ngrok domain
- Re-add app via Local Test, test fresh

### Priority 2 — End-to-End in Zoom
- Test all features inside a real Zoom meeting (host + student)
- Test RTMS with live transcription
- Test guest mode with second Zoom account

### Priority 3 — Code Quality
- Create shared PrismaClient singleton
- Fix RTMS secret fallback logic
- Fix BigInt serialization in transcript route
- Fix AI silent failure in topic-segment
- Improve anchor topic dedup (fuzzy matching)
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
npm run dev:mock   # client + server + mock transcript (CS50 lecture)

# 3. Build
npm run build
```

---

## Changelog

### April 6, 2026
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
