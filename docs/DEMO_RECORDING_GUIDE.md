# Demo Video Recording Guide

Recording guide for the Zoom Momentum demo — Next Lab Zoom Fellowship submission + portfolio website.

---

## Software

| Tool | Purpose | Platform | Cost |
|------|---------|----------|------|
| [OpenScreen](https://github.com/siddharthvaddem/openscreen) | Screen recording with auto-zoom, per-segment speed control, annotations | Mac, Windows, Linux | Free |
| [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve) | Combine recordings, voiceover, face cam PiP, final export | Mac, Windows | Free |

**Why both?** OpenScreen gives you polished per-screen recordings (zoom effects on UI elements, speed ramps). DaVinci Resolve stitches the two screens together and layers in your voiceover + webcam.

---

## Hardware Setup

- **MacBook** — Host/Professor side (runs HostDashboard)
- **Windows laptop** — Student side (runs StudentView)
- Both machines record their own screen with OpenScreen simultaneously

---

## Technical Setup

### 1. Build and serve the app

```bash
# Build client
npm run build -w client

# Start ngrok (must point to Express, NOT Vite)
ngrok http 3001 --url=your-tunnel.ngrok-free.dev

# Start server
npm run dev -w server
```

### 2. Transcript source: RTMS (live) vs Mock

**Primary — RTMS (recommended for demo):**
Screen share a recorded CS50 lecture video with audio in Zoom. Zoom's RTMS service performs speech-to-text and sends transcript text to the app automatically. This is the most authentic setup — real audio in, real transcript out.

Start RTMS from the host side panel before playing the lecture video.

**Fallback — Mock transcript:**
If RTMS doesn't pick up screen share audio, run the mock service alongside:

```bash
npm run dev -w mock-transcript
```

This POSTs CS50 Lecture 0 chunks every 3 seconds. Less authentic but guaranteed to work.

**Test RTMS first** in a dry run before recording day.

### 3. Lecture video

Use [CS50 Lecture 0 (2024)](https://www.youtube.com/watch?v=3LPJfIKxwWc) — the mock transcript content is from this lecture, so if you need to fall back to mock, the content still matches.

Skip past the intro/housekeeping to a section with dense academic content so the AI generates meaningful topics and glossary terms.

---

## Demo Script

Target length: 4-5 minutes. You'll narrate over this in post.

### Scene 1 — Welcome + Setup (~10 sec)
- **Host:** Show the Welcome screen — personalized greeting, "You are the host of this session", tap "Open Dashboard"
- **Student:** Brief flash of student Welcome screen, tap "Join Session"

### Scene 2 — Lecture + Live Transcript (~20 sec)
- **Host:** Screen share the CS50 lecture video in Zoom
- **Host:** Go to Anchor tab, hit "Start AI" — green dot + "AI Active" appears
- Show the lecture playing for 10-15 seconds
- **Student:** Switch to Transcript tab — segments appearing in real time with speaker names, timestamps, and glossary terms highlighted in blue
- Show the "Live" indicator in the status bar

### Scene 3 — Timeline + Glossary (~30 sec)
- **Student:** Switch to Timeline tab — topic cards building up with key takeaways and "Just now" / "Xm ago" timestamps
- Show a topic expanding to reveal bullet points
- **Student:** Switch to Glossary tab — terms and definitions populating, formulas in code blocks
- Use the search bar to filter a specific term

### Scene 4 — Bookmarks (~15 sec)
- **Student:** Tap "Bookmark" on a topic in the Timeline tab — toast notification "Bookmarked" appears
- Switch to Bookmarks tab — show the expandable bookmark card with topic name, timestamp, and transcript context
- Show that already-bookmarked topics show "Bookmarked" (can't re-bookmark)

### Scene 5 — Pulse (AI Poll) (~30 sec)
- **Host:** Switch to Pulse tab, optionally type context like "We just covered binary", hit "Generate Check-In"
- Show the AI-generated poll preview — editable question and 4 editable options
- Hit "Launch Poll"
- **Student:** Poll card overlays the current tab with pulsing "Live Poll" indicator — select an answer, hit "Submit Answer"
- **Host:** Show live response count updating, hit "End Poll & Show Results"
- **Host:** Show results bar chart — option letters, percentages, response counts

### Scene 6 — Arena (Timed Quiz) (~45 sec)
- **Host:** Switch to Arena tab, type a topic like "Binary and ASCII encoding", hit "Generate Quiz"
- Show the question review screen — click a question to edit it, show the inline editor with options and "Set correct" buttons
- Optionally show "Add more questions on a specific topic" input
- Hit "Start Game"
- **Student:** "Get ready" screen with bouncing dots, then first question appears with countdown timer
- Student selects an answer, locks in
- Show correct answer reveal — green "Correct" or red "Incorrect" with explanation
- Show the leaderboard between questions (rank, name, score — top 3 highlighted)
- Let it run through 2-3 questions, then show "Game Over" with final leaderboard

### Scene 7 — Late Join (Optional, ~10 sec)
- If using demo mode: hit "Late Join" button to simulate
- **Student:** Show the blue late-join alert banner: "You joined late. X topic(s) covered so far. Latest: [topic]"
- Tap "Dismiss"

### Scene 8 — End Class + Recovery Pack (~30 sec)
- **Host:** Hit the red "End Class" button at the bottom
- **Student:** Show the "Class Complete" screen with stats cards:
  - Topics Covered, Terms Learned, Bookmarks count, Duration
- Scroll down to see Topics Covered summary and Key Terms
- Show "Generating your personalized review..." spinner
- Recovery Pack loads — expandable items based on bookmarked moments with explanation, practice questions, and resources
- Tap through one recovery item to show the full content

### Bonus — Host Controls (weave in throughout)
- Status bar: student count updating, connection status dot
- Anchor tab: "Pause AI" / "Start AI" toggle
- Settings gear: "Reset Meeting" option (just show it exists, don't tap it)
- Active speaker: "Speaking: [name]" appearing on student status bar

---

## Recording Workflow

### Step 1 — Dry run
Run through the full script once without recording. Verify:
- RTMS produces transcript from screen-shared audio (or switch to mock)
- AI generates topics and glossary within a reasonable time
- Pulse and Arena work end-to-end between host and student
- Note any wait times you'll need to speed up in editing

### Step 2 — Record raw footage
- Open OpenScreen on both laptops
- Start recording on both machines
- Walk through the script — don't worry about pacing or mistakes, you'll fix in post
- Let AI processing run (you'll speed these parts up later)
- Stop recording on both machines

### Step 3 — Polish in OpenScreen
For each recording separately:
- **Trim** dead air and mistakes
- **Speed up** slow parts (AI generating topics, waiting for quiz results)
- **Add zoom effects** on key UI moments (poll appearing, leaderboard updating, timeline building)
- **Annotations** (optional) — label UI elements like "AI-Generated Timeline" if helpful
- Export both polished recordings

### Step 4 — Combine in DaVinci Resolve
- Import both polished recordings
- Arrange on the timeline — cut between host and student views, or use side-by-side for simultaneous moments (like Pulse voting)
- **Record voiceover** — narrate each scene, explaining what's happening and why it matters
- **Face cam** — record a webcam intro ("Hi, I'm [name], and this is Zoom Momentum...") and overlay as PiP in the corner for the first 10-15 seconds
- Speed up / slow down as needed — you have full control
- Export final video

---

## Voiceover Tips

- **Post-recorded** — record narration after the screen footage is edited. You can pause, re-record, and match pacing to the visuals.
- Keep it conversational, not scripted-sounding. You're showing something you built — let that come through.
- Call out the "why" not just the "what" — "Students can bookmark topics so they can review later" beats "Here's the bookmark button."
- Narrate transitions: "Now let's see what happens on the student side..."

## Feature Checklist

Make sure the demo covers all of these. Check off during your dry run:

**Host Features:**
- [ ] Welcome screen with personalized greeting + "Open Dashboard"
- [ ] Status bar: student count, connection status, "Live" indicator
- [ ] Anchor tab: Start/Pause AI toggle, green "AI Active" dot
- [ ] Pulse tab: Generate poll → preview/edit → launch → live responses → results bar chart
- [ ] Arena tab: Generate quiz → review/edit questions → start game → leaderboard → game over
- [ ] Transcript tab: live segments with speaker names + timestamps
- [ ] End Class button (red, bottom)
- [ ] Settings gear with Reset Meeting option

**Student Features:**
- [ ] Welcome screen + "Join Session"
- [ ] Timeline tab: topic cards with key points, timestamps, bookmark buttons
- [ ] Glossary tab: terms, definitions, formulas, search bar
- [ ] Transcript tab: live segments with glossary terms highlighted in blue
- [ ] Bookmarks tab: expandable cards with topic, time, context, remove button
- [ ] Pulse overlay: live poll card, select + submit, auto-dismiss
- [ ] Arena overlay: countdown timer, answer lock-in, correct/incorrect reveal, leaderboard
- [ ] Late join alert banner (if applicable)
- [ ] Active speaker display in status bar
- [ ] Post-class summary: stats cards, topics, terms
- [ ] Recovery Pack: personalized review items based on bookmarks

## General Tips

- Keep the final video under 5 minutes — attention drops fast
- Speed up any AI wait time to 2-3 seconds in the edit
- Use OpenScreen's zoom effects to draw attention to small UI elements in the side panel
- Pick a clean desktop wallpaper / hide desktop icons before recording
- Close notifications on both machines
- If using side-by-side, label which screen is "Professor" and which is "Student"
- Export at 1080p minimum for portfolio quality
- Let the mock/RTMS transcript run for at least 60 seconds before showing Timeline/Glossary — AI needs content to work with
- The Arena countdown is 15 seconds per question — speed this up in editing
- Recovery Pack generation takes a few seconds — speed up the spinner in editing
- Toast notifications (bookmarks, poll submission) last ~2 seconds — don't cut too fast or you'll miss them
