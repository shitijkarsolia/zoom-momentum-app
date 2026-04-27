# Manual Testing Checklist — Zoom Momentum

Use this to verify all features after each deployment. Test in a real Zoom meeting with two accounts (host + student).

## Setup
1. Build client: `npm run build -w client`
2. Start server: `npm run dev -w server`
3. Start ngrok: `ngrok http 3001 --url=your-tunnel.ngrok-free.dev`
4. Open Zoom meeting, open app from Apps panel on both host and student

---

## Connection & Status Bar

- [ ] Host sees "Momentum — Host" with "Connected" status
- [ ] Student sees "Momentum" with "Connected" status
- [ ] Host "Students" count shows correct number (excludes host, excludes app)
- [ ] Student count updates when a new participant joins/leaves
- [ ] No "Sign in to save bookmarks" button on student side

## Professor's Pulse (Polls)

- [ ] Host: enter context, click "Generate" → AI generates a poll
- [ ] Host: preview poll, edit question/options if needed
- [ ] Host: click "Launch" → poll appears on student side as overlay
- [ ] Student: select an option, click "Submit"
- [ ] Student: poll auto-dismisses ~2s after submitting
- [ ] Host: sees response count increment
- [ ] Host: click "End Poll" → results bar chart shown to both
- [ ] Student: results auto-dismiss after ~8s
- [ ] Host: click "New Poll" to reset

## Arena (Trivia Quiz)

- [ ] Host: enter topic (or leave blank), click "Generate Quiz"
- [ ] If no transcript: info text says "No transcript available — questions will be general trivia"
- [ ] If transcript active: questions are based on lecture content
- [ ] Host: preview questions, edit if needed
- [ ] Host: click "Start Game" → student sees arena overlay
- [ ] Student: 10-second countdown per question
- [ ] Student: select answer → locks in, shows "Locked in — waiting for results…"
- [ ] After timer: leaderboard shown with correct answer + explanation
- [ ] Tied scores show same rank number
- [ ] Auto-advances to next question after leaderboard
- [ ] Student overlay stays visible between questions ("Next question coming up…")
- [ ] Host: can click "End Quiz" at any time → final standings shown
- [ ] Student: "Back to Class" button dismisses overlay

## Live Anchor (AI Transcript Analysis)

- [ ] Host: click "Start AI" → RTMS starts, transcript begins flowing
- [ ] AI analysis runs every ~10 seconds (check server logs for TOPIC_UPDATE)
- [ ] Topic cards appear on both host and student Timeline tab
- [ ] Glossary terms extracted and shown in Glossary tab
- [ ] No "Live/Mock" toggle button visible inside Zoom

## Transcript Tab

- [ ] Both host and student see Transcript tab
- [ ] Transcript shows speaker names (e.g., "Shitij Mathur") with timestamps
- [ ] Consecutive segments from same speaker are grouped together
- [ ] Glossary terms highlighted in blue bold
- [ ] Transcript auto-scrolls to bottom on new content
- [ ] Updates every ~5 seconds
- [ ] Current topic shown at top of transcript

## Bookmarks (Student)

- [ ] Student: click "Mark for Review" → toast shows "Bookmarked"
- [ ] Bookmark appears in bookmark list below timeline
- [ ] Bookmark shows topic name, time, "manual" tag
- [ ] Click bookmark to expand → shows time, topic, type
- [ ] Auto-bookmarks from AI cues show "auto" tag with sparkle icon
- [ ] Bookmarks work without sign-in (local state only)

## End Class

- [ ] Host: scroll to bottom, click "End Class"
- [ ] Host: sees post-class summary (engagement stats)
- [ ] Student: sees post-class recovery pack (if bookmarks exist)
- [ ] Recovery pack shows explanation, practice question, resource per bookmark
- [ ] If no bookmarks: shows "No bookmarks" message

## Late Joiner

- [ ] Student joins after topics already exist
- [ ] Late join banner appears: "You joined late. X topics covered so far."
- [ ] Banner auto-dismisses after 8 seconds (or click "Dismiss")
- [ ] Student receives full state (topics, glossary, active poll/arena)

## Speaker Spotlight

- [ ] When someone speaks, student sees "Speaking: [name]" in status bar

## Demo Mode (Browser)

- [ ] Open `http://localhost:3001` in browser → demo mode auto-enables
- [ ] Blue banner shows "Demo — Host" with role switcher
- [ ] Sim buttons: Speaker, Late Join, End Class
- [ ] Switch to Student view → all student features work
- [ ] Open second tab → host↔student messaging works between tabs

---

## Known Limitations
- Participant count may take a moment to update after join
- RTMS transcript requires speaking clearly for accurate transcription
- AI analysis quality depends on transcript length (needs ~20 words minimum)
- Bookmarks are session-local — lost when app is closed
