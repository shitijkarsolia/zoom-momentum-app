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

Screen share the lecture video (https://www.youtube.com/watch?v=qYNweeDHiyU) with audio in Zoom. Zoom's RTMS service performs speech-to-text and sends transcript text to the app automatically.

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

Target length: ~5-7 minutes in one take. You're recording both screens simultaneously on one display and narrating live. Talk like you're showing a friend what you built — not presenting to a panel.

### Intro — The Problem + What You Built (0:00 – 0:50)

**Show**: Full desktop with both Zoom windows visible, lecture not yet playing

**Narrate**:
> "Hey, I'm [Your Name], and this is Zoom Momentum — something I built for the Next Lab Zoom Fellowship."

> "Here's the situation: you're a student in a Zoom lecture. The professor's talking, you're trying to keep up, but you miss a term, you zone out for 30 seconds, and now you're lost. There's no rewind button. There's no one to ask 'what did I miss?' And the professor has no idea that half the class stopped following 10 minutes ago."

> "Zoom Momentum fixes that. It's a side panel that lives right inside the Zoom meeting — it listens to the lecture, pulls out the key topics and terms in real time, translates everything for international students, and gives the professor tools to actually check if people are keeping up. Let me show you."

*[Pause 2s]*

### Scene 1 — Starting the Lecture (0:50 – 1:30)

**Show**: Professor side

*[Show the Welcome screen briefly — "You are the host of this session"]*
*[Click "Open Dashboard"]*

**Narrate**:
> "So this is what the professor sees. Three tabs — Pulse for quick polls, Arena for trivia games, and Anchor which is the AI engine that does the heavy lifting."

*[Click the Anchor tab, click Start AI]*
*[Start screen sharing the lecture video with audio]*

> "Once I start the AI and share the lecture audio, it starts transcribing and analyzing everything being said. Every 10 seconds it looks at what was just discussed and pulls out topics, definitions, and key terms — completely automatically."

*[Wait for transcript to flow and a topic to appear — speed up in post if needed]*

**Timing note**: Let the lecture run for at least 60-90 seconds before moving to Scene 2. The AI needs enough transcript content to extract meaningful topics and glossary terms. Skip to a section with dense academic content for best results.

### Scene 2 — Student Timeline + Glossary (1:30 – 2:30)

**Show**: Student side

**Narrate**:
> "Now here's what the student sees. As the professor talks, these topic cards just appear — each one is a summary of what was just covered, with bullet points."

*[Show Timeline tab with topics, click one to expand]*

> "And over here in the Glossary — every technical term the professor mentions gets defined automatically. If I want to save one for later, I just hit '+ Note' and it goes into my personal notes."

*[Switch to Glossary tab, type a search, click "+ Note" on an entry]*

### Scene 3 — Live Transcript + Multilingual Translation (2:30 – 3:30)

**Show**: Student side — Transcript tab

**Narrate**:
> "This is the live transcript — everything the professor says, streaming in real time. Glossary terms are highlighted so you can spot them."

*[Show transcript scrolling with highlighted terms]*

> "Now imagine you're an international student and English isn't your first language. Watch this."

*[Click language dropdown]*
*[Select Español, pause 3s]*

> "The whole transcript just switched to Spanish. And this isn't running a separate AI call for every student — it translates each segment once on the server and caches it. So if 30 students pick Spanish, it's still just one AI call."

*[Switch to 中文, pause 3s]*
*[Switch to العربية, pause 3s]*

> "Chinese, Arabic — and notice Arabic flips to right-to-left automatically."

*[Switch back to English — instant]*

> "Switching back to English is instant since it's the original."

### Scene 4 — Pulse: AI-Powered Polls (3:30 – 4:30)

**Show**: Full desktop (both sides visible)

**Narrate**:
> "Okay so the professor's been lecturing for a few minutes. They want to know — did people actually get that? They open Pulse."

*[Professor side: click Pulse tab, type context, click "Generate Check-In"]*

**Poll context to type**: `"Did students understand the key concepts just discussed?"`

Other good options depending on where the lecture is:
- `"Check if students can explain the main topic covered"`
- `"Are students clear on the terminology introduced?"`

> "They type a quick note about what to check, hit generate, and the AI creates a poll based on what was actually just said in the lecture. They can edit it, then launch."

*[Click "Launch Poll"]*
*[Student side: show poll appearing, select an option, submit]*
*[Professor side: show bar chart filling in live as bots + you respond]*

> "Students get the poll instantly, tap their answer, and the professor sees results filling in live. No more 'does everyone understand?' followed by silence."

### Scene 5 — Arena: Timed Trivia Game (4:30 – 5:40)

**Show**: Full desktop

**Narrate**:
> "Now if the professor wants to make review actually fun — there's Arena. It's basically a timed quiz game."

*[Professor side: click Arena tab, enter topic, generate quiz]*

**Arena topic to type**: Leave blank or type a topic based on what the AI has extracted so far (check the Anchor tab for topics)

Other good options:
- Use the latest topic title from the Timeline
- `"Key concepts from the lecture so far"`

> "Pick a topic, generate questions — the AI writes them based on the lecture content. The professor can review and edit, then start the game."

*[Show question review screen briefly, click "Start Game"]*

*[Student side: show countdown, answer questions]*

> "Students get a countdown timer, they lock in their answer, and they're scored on both accuracy and speed."

*[Show leaderboard after final question — bot names competing with you]*

> "After each round there's a leaderboard. It's competitive, people actually pay attention, and it reinforces what was just taught."

### Scene 6 — Bookmarks + Notes (5:40 – 6:20)

**Show**: Student side

*[Switch to Timeline, click Bookmark on a topic]*

**Narrate**:
> "Students can bookmark any topic they want to come back to. And the AI also auto-bookmarks moments where the professor says things like 'this will be on the exam' or 'pay attention to this.'"

*[Show Bookmarks tab]*
*[Switch to Notes tab]*

> "Everything you've saved — bookmarks, glossary terms, your own typed notes — it's all here. You can download it as Markdown when you're done."

### Scene 7 — End of Class + Recovery Pack (6:20 – 7:00)

**Show**: Full desktop

*[Professor side: click "End Class"]*

**Narrate**:
> "When the professor ends the session, every student gets a personalized Recovery Pack."

*[Student side: show stats cards, then recovery pack generating]*

> "It looks at what you bookmarked, what topics were covered, and generates a custom study guide — explanations, practice questions, suggested resources. Two students who bookmarked different things get completely different packs."

*[Scroll through recovery pack items]*

### Closing (7:00 – 7:15)

**Narrate**:
> "That's Zoom Momentum — it lives inside the meeting, no extra apps, no extra tabs. The professor gets real-time feedback, students get real-time support, and everyone walks away with something useful. Thanks for watching."

*[Stop recording]*

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

---

## Timing Guide

**When to trigger each feature:**

| Time into lecture | What to demo |
|---|---|
| 0:00 – 1:00 | Start AI, let transcript flow |
| 1:00 – 2:00 | Show Timeline + Glossary (terms start appearing) |
| 2:00 – 3:00 | Show Transcript tab + language switching |
| 3:00+ | Launch Pulse poll and Arena quiz (AI has enough content) |

**Key**: Don't launch Pulse or Arena too early. The AI needs 60-90 seconds of transcript to generate contextual questions. If you launch too early, the generated questions will be generic.

---

## Mock Student Bots — Quick Reference

**Start bots** (after opening host side panel in Zoom):
```bash
curl -X POST http://localhost:3001/api/demo/start-bots
```

**Custom bot count** (default is 8, max 13):
```bash
curl -X POST http://localhost:3001/api/demo/start-bots \
  -H "Content-Type: application/json" -d '{"count": 12}'
```

**Check status**:
```bash
curl http://localhost:3001/api/demo/status
```

**Stop bots**:
```bash
curl -X POST http://localhost:3001/api/demo/stop-bots
```

**What bots do:**
- Trickle in over ~40 seconds (host student count rises in real time)
- Auto-respond to Pulse polls in 2-5 seconds with clustered answers
- Auto-answer Arena questions in 0.8-4 seconds using skill-based accuracy
- Show on leaderboard as: Liam Wirth, Advikaa Kapil, Shitij Mathur, Yash Sawant, Neha Kashyap, Amanda Federico, Jesus Franco Yescas, etc.

**Troubleshooting:**
- "No active host meeting found" → open the host side panel first, then retry
- Bots not responding to arena → make sure you started the game AFTER bots connected (check status endpoint)

