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

Target length: 3-4 minutes. You'll narrate over this in post.

### Scene 1 — Lecture Context (~15 sec)
- Show the Zoom meeting with the lecture video screen shared
- Let it play for 10-15 seconds so viewers understand the setting
- Transcript starts populating in the side panel

### Scene 2 — Live Transcript (~15 sec)
- Focus on the student side panel
- Show transcript segments appearing in real time
- AI-generated timeline topics start building

### Scene 3 — Pulse (Poll) (~30 sec)
- **Host:** Create a poll from the Pulse tab
- **Student:** Poll appears, student answers
- **Host:** Show live results

### Scene 4 — Arena (Quiz) (~45 sec)
- **Host:** Launch a quiz from the Arena tab
- **Student:** Play through the quiz questions
- **Host/Student:** Show the leaderboard

### Scene 5 — Timeline + Glossary (~30 sec)
- **Student:** Show the AI-generated timeline with topic segments
- **Student:** Switch to Glossary tab, show auto-generated terms

### Scene 6 — Bookmarks (~15 sec)
- **Student:** Bookmark a topic from the timeline
- **Student:** Switch to Bookmarks tab, show saved bookmarks

### Scene 7 — End Class (~20 sec)
- **Host:** Hit End Class
- **Student:** Show the class-end notification and recovery summary

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

## General Tips

- Keep the final video under 4 minutes — attention drops fast
- Speed up any AI wait time to 2-3 seconds in the edit
- Use OpenScreen's zoom effects to draw attention to small UI elements in the side panel
- Pick a clean desktop wallpaper / hide desktop icons before recording
- Close notifications on both machines
- If using side-by-side, label which screen is "Professor" and which is "Student"
- Export at 1080p minimum for portfolio quality
