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

### 4. Pre-warm translation cache (for multilingual demo)

Before recording, open the student Transcript tab and switch to Spanish and Chinese once each. The first translation takes 5-10s per language (AI call). After that, cached languages switch instantly on camera.

---

## Demo Script

Target length: ~8-10 minutes raw, cut to 4-5 minutes in post. Record professor and student screens simultaneously. You'll narrate over this in post.

### Scene 1 — The Problem (0:00 – 0:40)
**Show**: Student laptop, Zoom meeting with lecture playing, no side panel yet

**Voiceover**:
> "Virtual lectures have a problem. Students sit passively, miss key terms, zone out, and have no way to catch up. Professors can't tell if anyone's following along. Zoom Momentum changes that."

*[Pause 3s on the Zoom meeting view]*

> "It's a Zoom Apps SDK side panel that turns passive lectures into active learning — in real time."

*[Open the Momentum side panel on both laptops]*

### Scene 2 — Professor Dashboard Overview (0:40 – 1:20)
**Show**: Professor laptop — Host Dashboard

*[Show the Welcome screen briefly — personalized greeting, "You are the host of this session"]*
*[Click "Open Dashboard"]*

**Voiceover**:
> "The professor gets three tools: Pulse for live polls, Arena for trivia games, and Anchor for AI-powered lecture analysis. Let's start with what happens automatically."

*[Click the Anchor tab]*
*[Pause 3s — show the transcript flowing in the Transcript sub-tab]*

> "As the professor lectures, Momentum captures the transcript in real time and sends it to AI every 10 seconds. The AI extracts topics, key terms, and glossary entries — no manual input needed."

*[Wait for a topic to appear in the Anchor tab, ~10-15s — speed up in post]*

### Scene 3 — Student Timeline + Glossary (1:20 – 2:30)
**Show**: Student laptop — Student View, Timeline tab

**Voiceover**:
> "On the student side, topics appear automatically as the lecture progresses."

*[Show Timeline tab with topics populating]*
*[Pause 3s]*

> "Each topic has bullet-point takeaways extracted by AI."

*[Click on a topic to expand it]*
*[Pause 2s]*

*[Switch to Glossary tab]*

> "The Glossary tab collects every technical term and definition mentioned in the lecture. Students can search and filter."

*[Type a search term in the glossary search box]*
*[Pause 2s]*

> "Tap '+ Note' to capture any term directly into your personal notes."

*[Click "+ Note" on a glossary entry]*

### Scene 4 — Live Transcript + Multilingual Translation (2:30 – 4:00)
**Show**: Student laptop — Transcript tab

**Voiceover**:
> "The Transcript tab shows the live lecture transcript with glossary terms highlighted."

*[Show transcript scrolling with highlighted terms]*
*[Pause 3s — let it auto-scroll]*

> "But here's where it gets powerful for international students."

*[Click the language dropdown in the status bar]*
*[Pause 2s on the dropdown open, showing all 6 languages]*

> "Pick a language — the entire transcript translates live, powered by AI with server-side caching."

*[Select "Español"]*
*[Pause 3-4s — show the fade effect as English dims and Spanish appears]*

> "Every segment is translated once on the server and cached. Thirty students on Spanish means one AI call, not thirty."

*[Let it settle for 2-3s showing Spanish transcript]*

*[Switch to "中文"]*
*[Pause 3-4s — show Chinese rendering]*

> "Chinese, Hindi, Arabic, French — all supported."

*[Switch to "العربية"]*
*[Pause 3s — show RTL layout]*

> "Arabic even renders right-to-left automatically."

*[Switch back to "English"]*
*[Pause 1s — instant, no AI call needed]*

> "And switching back to English is instant."

*[Switch to Glossary tab, select Español from dropdown]*
*[Pause 3s — glossary terms translate]*

> "Glossary terms translate too."

### Scene 5 — Pulse: AI-Powered Polls (4:00 – 5:20)
**Show**: Split — Professor on left, Student on right

**Professor side**:
*[Click Pulse tab]*

**Voiceover**:
> "When the professor wants to check understanding, they open Pulse."

*[Type context like "Did everyone understand binary representation?"]*
*[Click "Generate Check-In"]*
*[Pause 3s — AI generates the poll]*

> "AI generates a contextual poll based on what was just discussed. The professor can edit the question before launching."

*[Review the generated poll, then click "Launch Poll"]*

**Student side**:
*[Show the poll card appearing on the student view]*
*[Pause 2s]*

> "Students see the poll immediately and tap their answer."

*[Select an option and submit]*
*[Pause 2s]*

**Professor side**:
*[Show results coming in with the bar chart]*

> "The professor sees results in real time — instant feedback on comprehension."

*[Pause 3s on the results view]*

### Scene 6 — Arena: Timed Trivia Game (5:20 – 6:40)
**Show**: Split — Professor left, Student right

**Professor side**:
*[Click Arena tab]*

**Voiceover**:
> "Arena turns review into a game. The professor picks a topic and number of questions."

*[Enter a topic like "Binary and ASCII encoding", set question count to 3]*
*[Click "Generate Quiz"]*
*[Show the question review screen — click a question to edit, show inline editor with options and "Set correct" buttons]*
*[Hit "Start Game"]*

**Student side**:
*[Show "Get ready" screen with bouncing dots, then first question with countdown timer]*

> "Students get timed multiple-choice questions. Speed and accuracy both matter."

*[Answer the first question quickly]*
*[Pause 2s — show correct/incorrect feedback with explanation]*

*[Answer second and third questions]*

> "After each question, students see if they got it right and the explanation."

*[Show the leaderboard appearing after the final question]*
*[Pause 3s]*

> "A live leaderboard ranks everyone. It's competitive, it's fun, and it reinforces the material."

### Scene 7 — Bookmarks + Notes (6:40 – 7:30)
**Show**: Student laptop

*[Switch to Timeline tab]*

**Voiceover**:
> "Students can bookmark any topic for later review."

*[Click "Bookmark" on a topic]*
*[Show the toast notification]*
*[Pause 2s]*

*[Switch to Bookmarks tab]*

> "All bookmarks — both manual and AI-detected — are collected here. The AI automatically bookmarks moments when the professor says things like 'this is important' or 'remember this.'"

*[Show a mix of manual and auto bookmarks]*
*[Pause 2s]*

*[Switch to Notes tab]*

> "The Notes tab is a personal scratchpad. Everything you captured with '+ Note' is here, plus your own typed notes. Download as Markdown anytime."

*[Show notes with captured glossary terms and topics]*
*[Pause 2s]*

### Scene 8 — End of Class + Recovery Pack (7:30 – 8:30)
**Show**: Split — Professor clicks "End Class", Student sees transition

**Professor side**:
*[Click the red "End Class" button]*

**Voiceover**:
> "When the professor ends the session, students get a personalized Recovery Pack."

**Student side**:
*[Show the "Class Complete" screen with stats cards: Topics Covered, Terms Learned, Bookmarks, Duration]*
*[Scroll down to Topics Covered summary and Key Terms]*
*[Show "Generating your personalized review..." spinner]*
*[Pause 3s — let it generate, speed up in post]*

> "Based on their bookmarks and the topics covered, AI generates a study guide: explanations, practice problems, and resource suggestions — tailored to what each student flagged as important."

*[Scroll through the recovery pack items, tap one to expand]*
*[Pause 3s]*

> "Every student gets a different pack based on what they bookmarked."

### Scene 9 — Closing (8:30 – 9:00)
**Show**: Side-by-side of professor and student views

**Voiceover**:
> "Zoom Momentum transforms passive virtual classrooms into active learning environments. Real-time AI analysis, live multilingual support, interactive polls and games, and personalized study materials — all inside the Zoom meeting, no extra apps needed."

*[Pause 2s]*

> "Built with the Zoom Apps SDK, React, Express, and AI."

*[Fade out]*

---

## Bonus Shots (weave in throughout)

- **Host status bar**: student count updating, connection status dot
- **Anchor tab**: "Pause AI" / "Start AI" toggle, green "AI Active" dot
- **Settings gear**: "Reset Meeting" option (just show it exists, don't tap it)
- **Active speaker**: "Speaking: [name]" appearing on student status bar
- **Late join** (optional): hit "Late Join" button in demo mode to show the blue alert banner

---

## Recording Workflow

### Step 1 — Dry run
Run through the full script once without recording. Verify:
- RTMS produces transcript from screen-shared audio (or switch to mock)
- AI generates topics and glossary within a reasonable time
- Pulse and Arena work end-to-end between host and student
- Language switching works (pre-warm the cache)
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
- **Speed up** slow parts (AI generating topics, waiting for quiz results, translation loading)
- **Add zoom effects** on key UI moments (poll appearing, leaderboard updating, language switching, timeline building)
- **Annotations** (optional) — label UI elements like "AI-Generated Timeline" if helpful
- Export both polished recordings

### Step 4 — Combine in DaVinci Resolve
- Import both polished recordings
- Arrange on the timeline — cut between host and student views, or use side-by-side for simultaneous moments (Pulse voting, Arena gameplay)
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

---

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
- [ ] **Language dropdown**: switch between English, Español, 中文, हिन्दी, العربية, Français
- [ ] **Translated transcript**: fade-in effect, RTL for Arabic
- [ ] **Translated glossary**: terms and definitions in selected language
- [ ] Bookmarks tab: expandable cards with topic, time, context, remove button
- [ ] Notes tab: captured terms/topics, typed notes, Markdown download
- [ ] Pulse overlay: live poll card, select + submit, auto-dismiss
- [ ] Arena overlay: countdown timer, answer lock-in, correct/incorrect reveal, leaderboard
- [ ] Late join alert banner (if applicable)
- [ ] Active speaker display in status bar
- [ ] Post-class summary: stats cards, topics, terms
- [ ] Recovery Pack: personalized review items based on bookmarks

---

## General Tips

- Keep the final video under 5 minutes — attention drops fast
- Speed up any AI wait time to 2-3 seconds in the edit
- Use OpenScreen's zoom effects to draw attention to small UI elements in the side panel
- Pick a clean desktop wallpaper / hide desktop icons before recording
- Close notifications on both machines
- If using side-by-side, label which screen is "Professor" and which is "Student"
- Export at 1080p minimum for portfolio quality
- Let the RTMS/mock transcript run for at least 60 seconds before showing Timeline/Glossary — AI needs content to work with
- Pre-warm translation cache for Spanish and Chinese before recording for instant switches on camera
- The Arena countdown is 15 seconds per question — speed this up in editing
- Recovery Pack generation takes a few seconds — speed up the spinner in editing
- Toast notifications (bookmarks, poll submission) last ~2 seconds — don't cut too fast or you'll miss them
