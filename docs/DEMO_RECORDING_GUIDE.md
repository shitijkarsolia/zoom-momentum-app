# Demo Video Recording Guide

Recording guide for the Zoom Momentum demo.

---

## Software

| Tool | Purpose | Platform | Cost |
|------|---------|----------|------|
| [Cap](https://cap.so/) | Screen recording with cursor effects, backgrounds, 4K/60fps | Mac, Windows | Free, open source |
| [Kdenlive](https://kdenlive.org/) | Video editing, trimming, speed ramps, titles | Mac, Windows, Linux | Free, open source |

**Why Cap?** Native, lightweight, records in 4K@60fps with hardware acceleration. Has built-in cursor effects, customizable backgrounds, and rounded corners — polished output without post-processing. Open source (Tauri + Rust). Export to MP4 or share instantly.

---

## Hardware Setup

- **One MacBook** — runs both Zoom desktop apps side by side (host + student)
- **External mic** (optional) — built-in mic works, but a USB mic or AirPods give cleaner voiceover
- Tile both Zoom windows so the side panels are visible simultaneously

---

## Technical Setup

### 1. Build and serve the app

```bash
# Quick start (kills old processes, builds, starts server + ngrok)
./start.sh

# Or manually:
npm run build -w client
ngrok http 3001 --url=your-tunnel.ngrok-free.dev
npm run dev -w server
```

### 2. Transcript source: RTMS (live)

Screen share a recorded lecture video (e.g., https://www.youtube.com/watch?v=qYNweeDHiyU) with audio in Zoom. Zoom's RTMS service performs speech-to-text and sends transcript text to the app automatically.

Start RTMS from the host side panel before playing the lecture video.

### 3. Start mock student bots

After opening the host side panel in Zoom:

```bash
curl -X POST http://localhost:3001/api/demo/start-bots
```

This spawns 8 simulated students that trickle in over ~40 seconds. They auto-respond to polls and arena questions with realistic timing and smart answers. The host dashboard student count updates as they join.

Stop bots after recording:
```bash
curl -X POST http://localhost:3001/api/demo/stop-bots
```

### 4. Pre-warm translation cache

Before recording, open the student Transcript tab and switch to Spanish and Chinese once each. The first translation takes 5-10s per language. After that, cached languages switch instantly on camera.

---

## Cap Setup

1. Download from [cap.so](https://cap.so/) and install
2. Select screen recording mode — capture the full desktop (both Zoom windows tiled side by side)
3. Enable mic input for live narration
4. Optional: enable webcam for a face cam overlay during intro
5. Use Studio Mode for local editing before export

Record at highest quality (4K if your display supports it).

---

## Demo Script

Target length: ~5-7 minutes in one take. You're recording both screens simultaneously on one display and narrating live. Keep it conversational — you're showing something you built.

### Intro — Who You Are + What This Is (0:00 – 0:40)

**Show**: Full desktop with both Zoom windows visible, lecture not yet playing

**Narrate**:
> "Hey, I'm [Your Name] — I'm a [your role, e.g., CS student at ASU / software engineer]. This is Zoom Momentum, a project I built for the Next Lab Zoom Fellowship."

> "The problem: virtual lectures are passive. Students zone out, miss key terms, and have no way to catch up. Professors can't tell if anyone's following along."

> "Zoom Momentum is a side panel app built with the Zoom Apps SDK that turns passive lectures into active learning — in real time. Let me show you how it works."

*[Pause 2s]*

### Scene 1 — Starting the Lecture (0:40 – 1:20)

**Show**: Professor side (switch to Professor scene or keep full desktop)

*[Show the Welcome screen briefly — "You are the host of this session"]*
*[Click "Open Dashboard"]*

**Narrate**:
> "On the professor side, you get three tools: Pulse for live polls, Arena for trivia games, and Anchor for AI-powered lecture analysis."

*[Click the Anchor tab, click Start AI]*
*[Start screen sharing the lecture video with audio]*

> "I'm sharing a lecture video with audio. Zoom's RTMS captures the speech and sends it to our app. The AI processes the transcript every 10 seconds — extracting topics, key terms, and glossary entries automatically."

*[Wait for transcript to flow and a topic to appear — speed up in post if needed]*

**Timing note**: Let the lecture run for at least 60-90 seconds before moving to Scene 2. The AI needs enough transcript content to extract meaningful topics and glossary terms. Skip past the CS50 intro music to where Malan starts talking about binary/representation — that's where the dense academic content begins.

### Scene 2 — Student Timeline + Glossary (1:20 – 2:30)

**Show**: Student side

**Narrate**:
> "On the student side, topics appear automatically as the lecture progresses. Each one has bullet-point takeaways."

*[Show Timeline tab with topics, click one to expand]*

> "The Glossary tab collects every technical term mentioned. Students can search and add terms to their notes."

*[Switch to Glossary tab, type a search, click "+ Note" on an entry]*

### Scene 3 — Live Transcript + Multilingual Translation (2:30 – 3:30)

**Show**: Student side — Transcript tab

**Narrate**:
> "The transcript streams live with glossary terms highlighted. But here's where it gets powerful for international students."

*[Click language dropdown]*

> "Pick a language — the entire transcript translates live."

*[Select Español, pause 3s]*

> "Every segment is translated once on the server and cached. Thirty students on Spanish means one AI call, not thirty."

*[Switch to 中文, pause 3s]*
*[Switch to العربية, pause 3s]*

> "Arabic renders right-to-left automatically."

*[Switch back to English — instant]*

> "English is instant — no AI call needed."

### Scene 4 — Pulse: AI-Powered Polls (3:30 – 4:30)

**Show**: Full desktop (both sides visible)

**Narrate**:
> "When the professor wants to check understanding, they open Pulse."

*[Professor side: click Pulse tab, type context, click "Generate Check-In"]*

**Poll context to type**: `"Did students understand how binary represents numbers and letters?"`

Other good options depending on where the lecture is:
- `"Check if students understand the difference between ASCII and Unicode"`
- `"Are students clear on how RGB values create colors?"`

> "AI generates a contextual poll. The professor reviews it and launches."

*[Click "Launch Poll"]*
*[Student side: show poll appearing, select an option, submit]*
*[Professor side: show bar chart filling in live as bots + you respond]*

> "Results come in real time — the professor sees exactly where students are."

### Scene 5 — Arena: Timed Trivia Game (4:30 – 5:40)

**Show**: Full desktop

**Narrate**:
> "Arena turns review into a competitive game."

*[Professor side: click Arena tab, enter topic, generate quiz]*

**Arena topic to type**: `"Binary, ASCII, and number representation"`

Other good options:
- `"How computers represent text and images"`
- `"Algorithms and computational thinking"`

*[Show question review screen briefly, click "Start Game"]*

*[Student side: show countdown, answer questions]*

> "Students get timed questions. Speed and accuracy both matter."

*[Show leaderboard after final question — bot names competing with you]*

> "A live leaderboard ranks everyone. It's competitive, fun, and reinforces the material."

### Scene 6 — Bookmarks + Notes (5:40 – 6:20)

**Show**: Student side

*[Switch to Timeline, click Bookmark on a topic]*

**Narrate**:
> "Students can bookmark topics. The AI also auto-bookmarks moments when the professor says 'this is important.'"

*[Show Bookmarks tab]*
*[Switch to Notes tab]*

> "Everything captured goes into Notes — downloadable as Markdown."

### Scene 7 — End of Class + Recovery Pack (6:20 – 7:00)

**Show**: Full desktop

*[Professor side: click "End Class"]*

**Narrate**:
> "When the professor ends the session, students get a personalized Recovery Pack."

*[Student side: show stats cards, then recovery pack generating]*

> "AI generates a study guide based on what each student bookmarked — explanations, practice problems, and resources. Every student gets a different pack."

*[Scroll through recovery pack items]*

### Closing (7:00 – 7:20)

**Narrate**:
> "Zoom Momentum — real-time AI analysis, live multilingual support, interactive polls and games, personalized study materials. All inside the Zoom meeting, no extra apps needed. Built with the Zoom Apps SDK, React, Express, and Claude AI."

*[Pause 2s, fade out or stop recording]*

---

## Recording Workflow (Single Take)

1. Tile both Zoom desktop apps side by side on your screen
2. Start the Zoom meeting on both apps (host first, then student joins)
3. Open the Momentum side panel on the **host** app
4. Start mock bots:
   ```bash
   curl -X POST http://localhost:3001/api/demo/start-bots
   ```
5. Wait ~40s for bots to trickle in (student count rises on host dashboard)
6. Open the Momentum side panel on the **student** app
7. Pre-warm translation cache (switch to Spanish/Chinese once on student side)
8. Hit **Record** in Cap
9. Start narrating — follow the script above
10. When done, stop recording
11. Stop bots:
    ```bash
    curl -X POST http://localhost:3001/api/demo/stop-bots
    ```

### Post-Recording (Cap Studio Mode or Kdenlive)

Minimal editing since you recorded in one take:
- **Trim** the start/end dead air
- **Speed up** AI wait times (topic generation, translation loading, recovery pack) to 2-3s
- **Cut** any flubs — re-record just that section if needed and splice in
- **Add** a title card at the start: project name, your name, fellowship name
- **Add** a brief end card with GitHub link / contact
- Export at 1080p+

---

## Feature Checklist

Make sure the demo covers all of these:

**Host Features:**
- [ ] Welcome screen with personalized greeting + "Open Dashboard"
- [ ] Status bar: student count updating (bots joining), connection status
- [ ] Anchor tab: Start AI, transcript flowing, topics extracted
- [ ] Pulse tab: Generate poll → launch → live responses → results bar chart
- [ ] Arena tab: Generate quiz → start game → leaderboard with bot names
- [ ] End Class button

**Student Features:**
- [ ] Welcome screen + "Join Session"
- [ ] Timeline tab: topic cards with key points, bookmark buttons
- [ ] Glossary tab: terms, definitions, search, + Note
- [ ] Transcript tab: live segments with highlighted terms
- [ ] Language dropdown: switch between English, Español, 中文, العربية
- [ ] Translated transcript with fade-in effect, RTL for Arabic
- [ ] Bookmarks tab: manual + auto bookmarks
- [ ] Notes tab: captured content, Markdown download
- [ ] Pulse overlay: poll card, select + submit
- [ ] Arena overlay: countdown, answer, leaderboard
- [ ] Post-class summary + Recovery Pack

---

## Tips

- Keep the final video under 5 minutes if possible — attention drops fast
- Speed up any AI wait time to 2-3s in the edit
- Close all notifications and menu bar clutter before recording
- Use a clean desktop wallpaper
- Let RTMS run for at least 60 seconds before showing Timeline/Glossary — AI needs content
- The Arena countdown is 15 seconds per question — speed this up in editing
- Recovery Pack generation takes a few seconds — speed up in editing
- If you flub a line, pause 3 seconds and re-say it — easy to cut in post
- Reference video for style/pacing: https://www.youtube.com/watch?v=qYNweeDHiyU

---

## Timing Guide (CS50 Lecture 0)

The lecture covers: binary, ASCII, Unicode, RGB colors, algorithms, pseudocode, Scratch.

**When to trigger each feature:**

| Time into lecture | What's happened | What to demo |
|---|---|---|
| 0:00 – 1:00 | Malan introduces CS50, mentions binary | Start AI, let transcript flow |
| 1:00 – 2:00 | Binary representation, bits, bytes | Show Timeline + Glossary (terms like "binary", "bit", "byte" appear) |
| 2:00 – 3:00 | ASCII, Unicode, emoji representation | Show Transcript tab + language switching |
| 3:00+ | Enough content accumulated | Launch Pulse poll and Arena quiz |

**Key**: Don't launch Pulse or Arena too early. The AI needs 60-90 seconds of transcript to generate contextual questions. If you launch too early, the generated questions will be generic.

**Suggested lecture skip point**: Jump to ~5:00 in the CS50 video (past intro/housekeeping) where Malan starts explaining binary with light bulbs. This gives dense academic content immediately.
