# Zoom Momentum - Project Roadmap

**Project Lead:** Shitij Mathur  
**Timeline:** Feb 02, 2026 - Feb 28, 2026 (4-Week Sprint)  
**Platform:** Zoom Apps SDK + AI Companion API

---

## What We're Building

Zoom Momentum transforms passive virtual classrooms into active learning environments. We're solving two fundamental problems in online education:

1. **The Cold Start Problem:** Students join Zoom calls and sit in the waiting room doing nothing. By the time class starts, they're already mentally checked out.

2. **The Silent Failure Problem:** When students get confused during a lecture, they're too embarrassed to interrupt. They fall behind silently, and the professor has no idea.

Our solution is an engagement ecosystem with three integrated features that work together to keep students active from the moment they join until the class ends.

---

## The Three Core Features

### Feature A: The Warm-Up Arena

**What it is:** A multiplayer trivia game that runs in the Zoom waiting room before class starts.

**Why it matters:** Instead of staring at "Please wait, the host will let you in soon," students compete in synchronized trivia. They enter the actual class energized, connected with classmates, and mentally present.

**The Vision:**
> Imagine joining your 9 AM lecture. Instead of scrolling Instagram while waiting, you see: "Question 1 of 5 - Starting in 3... 2... 1..." Suddenly you're racing against 30 classmates to answer "What was the main topic of last week's lecture?" You get it right, jump to 3rd place on the leaderboard. The host starts the meeting, and for 10 seconds you see "🥇 Sarah - 500pts, 🥈 Mike - 450pts, 🥉 YOU - 400pts" flash on screen. You're smiling. Class hasn't even started and you're already engaged.

**Question Types:**
- *Icebreakers:* "Coffee or tea?" / "What's your go-to study snack?" — builds community
- *Recall:* AI-generated questions from last lecture's transcript — primes the brain for learning

---

### Feature B: The Self-Check

**What it is:** A private "Quiz Me" button in the student sidebar that generates questions from the last 5 minutes of lecture.

**Why it matters:** Students can secretly test themselves when confused. No one knows they're struggling — not the professor, not their classmates. It's a safety net for the embarrassed learner.

**The Vision:**
> You're 20 minutes into a statistics lecture. The professor just explained p-values, but you zoned out for a minute and now you're lost. You see the 🔒 Quiz Me button in your sidebar. You click it. Three questions appear based on what was just said. You get 1 out of 3 right. Now you know exactly what you missed. You rewind mentally, pay closer attention. The professor never knew you were struggling. Your classmates never knew. But you caught yourself before falling too far behind.

**The Recovery Summary:**
After completing the quiz, students see a personalized summary showing what they missed and why. This isn't just a score — it's a mini-lesson that gets them back on track.

> You finish the 3-question quiz. You got 2 right, 1 wrong. Instead of just "66% — try again," you see:
> 
> "📊 Your Results: 2/3"
> 
> "❌ You missed: Question about p-values"
> "The p-value represents the probability of observing results at least as extreme as the measured results, assuming the null hypothesis is true. In simpler terms: a low p-value (< 0.05) means your result is statistically significant."
> 
> "✅ You nailed: Hypothesis testing basics, Sample size concepts"
> 
> Now you know exactly what to focus on. You're back on track.

**Privacy is Sacred:**
- Quiz results are stored in your browser's localStorage only
- Zero data goes to the professor or any server
- Visual cues (padlock icons, grey backgrounds) constantly remind students this is their private space

---

### Feature C: Professor's Pulse

**What it is:** An automated engagement monitor that watches chat activity and audio patterns, then nudges the professor when the room goes quiet.

**Why it matters:** Professors can't see engagement through a screen. They lecture into the void, hoping someone is listening. This feature is their co-pilot — it watches the room so they don't have to.

**The Vision:**
> You're a professor 25 minutes into your lecture. You've been sharing your screen, explaining a complex diagram. What you don't realize: no one has typed in chat for 12 minutes. The room is dead silent. Suddenly, a gentle notification slides in: "Engagement is low. Launch a Check-In?" You click "Launch." Instantly, a poll appears for all students: "How clear was the explanation of [current topic]? A) Crystal clear B) Mostly got it C) Lost me D) Need a recap." Within seconds, you see 60% picked C or D. You pause, backtrack, explain differently. You just saved 30 students from silent failure.

**How it Detects Low Engagement:**
- Chat velocity drops to zero for 10+ minutes
- Host has been talking continuously (no student unmutes)
- Screen share is active (students are in "passive viewing" mode)

---

## Pre-Sprint: Onboarding & Familiarization

**Feb 02 - Feb 04 (3 days)**

**Goal:** Every team member understands the platform, the tools, and the vision before writing production code.

This phase is critical. Zoom Apps development has quirks that aren't obvious from general web development experience. Taking time to learn now prevents painful debugging later.

### Understanding the Platform

**Task: Set Up Zoom Developer Environment**

Before writing any code, you need access to Zoom's developer ecosystem.

- Create a Zoom Developer account at marketplace.zoom.us
- Understand the difference between "Development" and "Production" apps
- Learn how to create a Zoom App and get your Client ID/Secret
- Install the Zoom client and enable Developer Mode for testing

**Task: Study Zoom Apps SDK Documentation**

The Zoom Apps SDK is how our app communicates with Zoom. Focus on:

- **Contexts:** Our app runs in two places — `waitingRoom` (before meeting starts) and `sidePanel` (during meeting). These are completely different environments with different capabilities.
- **Lifecycle:** When does our app load? When does it unload? What happens when the meeting starts?
- **Available APIs:** What can we access? (Transcript, chat events, participant list, etc.)

*Example to understand:* When a student is in the waiting room, they can't see the main meeting. Our app loads in `waitingRoom` context. When the host admits them, our app transitions to `sidePanel` context. This transition is where the leaderboard "handoff" happens.

### Understanding the AI Layer

**Task: Study AI Companion API (or OpenAI Fallback)**

Our app generates quiz questions and polls using AI. You need to understand:

- How to authenticate with the API
- Request/response formats
- Rate limits and timeout handling
- The difference between Zoom's AI Companion API and using OpenAI as a fallback during development

*Example prompt we'll use:*
```
You are a teaching assistant. Based on the following lecture transcript, create 3 multiple choice questions to test student understanding. Return as JSON array with format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0}]

Transcript: [last 300 words of lecture]
```

### Understanding the Sync Challenge

**Task: Deep Dive into Shared State API**

The Warm-Up Arena requires all students to see the same question at the same millisecond. This "live event" feeling is what makes it engaging. The Zoom Shared State API makes this possible.

Understand:
- How state propagates across clients
- Latency expectations (should be <100ms)
- What happens when someone joins late (they need to sync to current state)
- Conflict resolution (what if two clients update simultaneously?)

*Example scenario:* 30 students are in the waiting room. The timer hits zero. All 30 must see "Question 1" appear simultaneously. If Student A sees it 2 seconds before Student B, the competitive magic is broken.

---

## Week 1: Infrastructure & Skeleton

**Feb 05 - Feb 11**

**Goal:** Get a "Hello World" running in both Zoom contexts with basic state synchronization working.

This week is about building the foundation. No fancy features yet — just proving that our app can exist in Zoom's ecosystem and that clients can talk to each other.

### Project Initialization

**Task: Create the React + Express Project Structure**

Set up the monorepo or project structure that will house our entire application.

*What this looks like:*
```
zoom-momentum/
├── client/           # React frontend
│   ├── src/
│   │   ├── contexts/     # waitingRoom vs sidePanel components
│   │   ├── components/   # Shared UI components
│   │   └── hooks/        # Custom React hooks for Zoom SDK
├── server/           # Express backend
│   ├── routes/
│   └── services/     # AI integration, etc.
├── manifest.json     # Zoom App configuration
└── .env.example      # Environment variables template
```

**Task: Configure the Zoom App Manifest**

The `manifest.json` tells Zoom everything about our app — where it runs, what permissions it needs, what URLs to load.

*Key configurations:*
```json
{
  "contexts": {
    "waitingRoom": {
      "url": "https://our-app.com/waiting-room"
    },
    "sidePanel": {
      "url": "https://our-app.com/side-panel"
    }
  },
  "scopes": ["zoomapp:inmeeting:transcript", "zoomapp:sharestate"]
}
```

**Task: Implement SDK Connection**

When our app loads, it needs to "handshake" with Zoom. This involves:
- Calling `zoomSdk.config()` with our app credentials
- Handling the async initialization
- Detecting which context we're running in
- Setting up error handling for failed connections

*Example flow:*
```javascript
// On app load
const configResponse = await zoomSdk.config({
  capabilities: ['shareState', 'getTranscript', 'onTranscriptUpdate']
});
const context = configResponse.runningContext; // 'waitingRoom' or 'sidePanel'
```

### Context-Specific UIs

**Task: Build Waiting Room Skeleton**

Create a basic React component that renders when `context === 'waitingRoom'`.

For now, just display:
- "Welcome to Zoom Momentum"
- "Trivia starting soon..."
- A placeholder for where the timer will go

This proves our app loads correctly in the waiting room context.

**Task: Build Side Panel Skeleton**

Create a basic React component that renders when `context === 'sidePanel'`.

For now, just display:
- "Zoom Momentum - Active"
- Placeholder buttons for "Quiz Me" and other features

This proves our app loads correctly during the meeting.

**Task: Implement Context Detection and Routing**

Build the logic that detects which context we're in and renders the appropriate component.

```javascript
function App() {
  const [context, setContext] = useState(null);
  
  useEffect(() => {
    // Detect context from SDK
  }, []);
  
  if (context === 'waitingRoom') return <WaitingRoom />;
  if (context === 'sidePanel') return <SidePanel />;
  return <Loading />;
}
```

### Shared State Foundation

**Task: Implement Shared State Connection**

Connect to Zoom's Shared State API. This is the backbone of our multiplayer features.

*What we're proving:*
- We can write to shared state from one client
- Other clients receive the update in real-time
- State persists across the session

**Task: Build Synchronized Timer Proof-of-Concept**

Create a countdown timer that displays the same value on all connected clients.

*The test:*
1. Open the app in two browser windows (simulating two students)
2. Start a 10-second countdown
3. Both windows should show "10... 9... 8..." in perfect sync

This is the foundation for synchronized trivia questions.

**Task: Handle Connection Failures**

What happens when the Shared State connection drops? Implement:
- Automatic reconnection with exponential backoff (wait 1s, then 2s, then 4s...)
- Visual indicator showing "Reconnecting..."
- State recovery when connection is restored

**Task: Handle Late Joiners**

If a student joins the waiting room after trivia has started, they need to sync to the current state immediately.

*Example:* Trivia is on Question 3. A new student joins. They should immediately see Question 3, not start from Question 1.

### Documentation Tasks

**Task: Define AI Input/Output JSON Schema**

Document exactly what we send to the AI and what we expect back. This contract ensures frontend and backend developers are aligned.

*Input schema:*
```json
{
  "type": "quiz_generation",
  "transcript": "string (last 300 words)",
  "question_count": 3,
  "difficulty": "medium"
}
```

*Output schema:*
```json
{
  "questions": [
    {
      "question": "What is the main purpose of...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_index": 2,
      "explanation": "The correct answer is C because..."
    }
  ]
}
```

---

## Week 2: The Brain — AI Logic

**Feb 12 - Feb 18**

**Goal:** AI-powered content generation works, even with mock transcript text. Quiz UI is functional.

This week we build the "intelligence" of the app. By the end, we should be able to paste any text and get back quiz questions that display in a working UI.

### AI Integration

**Task: Connect to AI Companion API**

Implement the service that communicates with Zoom's AI Companion API (or OpenAI during development).

*What this involves:*
- Setting up authentication (API keys, tokens)
- Building the HTTP client with proper headers
- Handling rate limits gracefully

**Task: Build Quiz Generation Prompt**

Craft the prompt that turns transcript text into quiz questions.

*The art of prompt engineering:*
- Too vague → questions are generic and unhelpful
- Too specific → questions are impossibly hard
- Just right → questions test understanding without being tricky

*Example prompt iteration:*
```
Version 1: "Create questions from this text"
→ Too vague, questions are random

Version 2: "Create 3 multiple choice questions testing comprehension of key concepts"
→ Better, but sometimes too hard

Version 3: "Create 3 multiple choice questions a student should be able to answer 
if they were paying attention. Focus on main ideas, not minor details. 
Make wrong answers plausible but clearly incorrect to someone who understood."
→ This is the sweet spot
```

**Task: Build Response Parser and Validator**

The AI returns JSON (hopefully). We need to:
- Parse the JSON safely (handle malformed responses)
- Validate the structure matches our schema
- Reject responses that don't have exactly the fields we need

*Edge cases to handle:*
- AI returns 2 questions instead of 3
- AI returns options without a correct answer marked
- AI returns valid JSON but nonsensical content

**Task: Implement Timeout and Fallback**

AI APIs can be slow or unavailable. We need graceful degradation.

*The flow:*
1. Send request to AI
2. Wait up to 5 seconds
3. If timeout or error → fall back to generic questions
4. Never leave the user staring at a loading spinner forever

**Task: Create Fallback Question Bank**

Build a set of 20-30 generic questions that work for any class.

*Examples:*
- "What was the most interesting point so far?"
- "Which topic would you like more explanation on?"
- "How would you rate your understanding: Confident / Mostly there / Need help"

These aren't as good as AI-generated questions, but they're infinitely better than a broken feature.

### Quiz UI Component

**Task: Build Question Display Component**

Create the UI that shows a single quiz question with its options.

*Design considerations:*
- Question text should be prominent and readable
- Options should be clearly labeled (A, B, C, D)
- Touch targets should be large enough for easy clicking
- Visual hierarchy guides the eye naturally

**Task: Implement Answer Selection**

When a student clicks an option:
- Highlight their selection
- Enable the "Submit" button
- Allow them to change their mind before submitting

*UX detail:* Don't auto-submit on click. Students should be able to reconsider.

**Task: Build Feedback Display**

After submission, show whether they got it right or wrong.

*Correct answer:*
- Green highlight on their selection
- Checkmark icon
- Brief positive message ("Nice!" / "Correct!")

*Incorrect answer:*
- Red highlight on their selection
- Show which answer was correct (green highlight)
- Brief encouraging message ("Not quite — the answer was B")

**Task: Implement Question Navigation**

For multi-question quizzes, build the flow between questions.

- "Next Question" button appears after answering
- Progress indicator ("Question 2 of 3")
- Summary screen at the end ("You got 2 out of 3!")

### Transcript Buffer Pipeline

**Task: Subscribe to Transcript Updates**

Hook into Zoom's live transcript stream using `zoomSdk.onTranscriptUpdate`.

*What we receive:*
- Real-time text as the professor speaks
- Speaker identification
- Timestamps

**Task: Implement Rolling Buffer**

Maintain a "sliding window" of the last ~5 minutes of transcript.

*Why a buffer?*
- We don't need the entire lecture — just recent context
- Sending too much text to the AI is slow and expensive
- 300 words is enough to generate relevant questions

*Implementation:*
```javascript
class TranscriptBuffer {
  constructor(maxWords = 300) {
    this.words = [];
    this.maxWords = maxWords;
  }
  
  add(text) {
    const newWords = text.split(' ');
    this.words.push(...newWords);
    // Trim from the front if over limit
    while (this.words.length > this.maxWords) {
      this.words.shift();
    }
  }
  
  getText() {
    return this.words.join(' ');
  }
}
```

**Task: Handle Transcript Gaps**

What if the professor stops talking for a while? Or mutes? Or the transcript service hiccups?

- Don't clear the buffer on silence — retain what we have
- If no new text for 30+ seconds, keep existing content
- Only clear on explicit reset (new meeting, etc.)

---

## Week 3: Integration & Privacy

**Feb 19 - Feb 25**

**Goal:** All three features work end-to-end. The complete user journey is functional.

This is the "make it real" week. We connect all the pieces built in Weeks 1-2 into working features.

### Warm-Up Arena (Complete Flow)

**Task: Build Arena Main Interface**

Create the full waiting room trivia experience.

*Visual layout:*
```
┌─────────────────────────────────┐
│     🎯 WARM-UP ARENA 🎯         │
│                                 │
│   Question 2 of 5               │
│   ⏱️ 0:08                       │
│                                 │
│   "What was the main topic      │
│    of last week's lecture?"     │
│                                 │
│   [A] Machine Learning          │
│   [B] Data Structures    ← ✓    │
│   [C] Web Development           │
│   [D] Databases                 │
│                                 │
│   ─────────────────────────     │
│   🏆 LEADERBOARD                │
│   1. Sarah      500 pts         │
│   2. Mike       450 pts         │
│   3. You        400 pts         │
└─────────────────────────────────┘
```

**Task: Implement Synchronized Questions**

Use Shared State to ensure all students see questions simultaneously.

*The sync mechanism:*
1. One client (or server) is the "game master"
2. Game master writes `{ currentQuestion: 1, startTime: timestamp }` to shared state
3. All clients read this and display Question 1
4. Timer counts down from `startTime`
5. When timer hits zero, game master advances to Question 2

**Task: Support Question Types**

Implement both icebreaker and recall questions.

*Icebreakers (pre-loaded):*
- "Coffee or tea?"
- "Early bird or night owl?"
- "Favorite study spot: Library, café, or home?"

*Recall (AI-generated):*
- Pull from previous lecture's transcript/summary
- Generate before students arrive (not real-time)

**Task: Build Real-Time Leaderboard**

Show rankings that update as students answer.

*Scoring logic:*
- Correct answer = 100 points
- Speed bonus = up to 50 extra points (faster = more)
- Wrong answer = 0 points (no penalty)

*Sync challenge:* Leaderboard must update across all clients when anyone scores.

**Task: Implement Meeting Start Transition**

When the host starts the meeting, gracefully transition from Arena to Side Panel.

*The handoff sequence:*
1. Host clicks "Start Meeting"
2. Zoom transitions all participants from waiting room to meeting
3. Our app detects context change (`waitingRoom` → `sidePanel`)
4. Display "Top 3 Leaderboard" overlay for 10 seconds
5. Fade to normal side panel view

### Self-Check (Private Quiz)

**Task: Build "Quiz Me" Button**

Create the entry point for private quizzing.

*Design requirements:*
- Prominent but not distracting
- Lock icon (🔒) clearly visible
- Tooltip: "Test yourself privately — only you see results"

**Task: Connect to Transcript Buffer**

When student clicks "Quiz Me":
1. Grab last 300 words from transcript buffer
2. Send to AI for question generation
3. Display loading state while waiting
4. Render quiz when ready

**Task: Implement Privacy Lock (localStorage)**

Quiz results must never leave the browser.

```javascript
// Save result
localStorage.setItem('selfcheck_results', JSON.stringify({
  date: new Date().toISOString(),
  score: 2,
  total: 3
}));

// This data is ONLY accessible to this browser
// It is NOT sent anywhere
// The professor cannot see it
// Our servers cannot see it
```

**Task: Build Recovery Summary Screen**

After completing the quiz, show students what they missed and help them understand it.

*Summary screen layout:*
```
┌─────────────────────────────────────┐
│  📊 Your Results: 2/3               │
│                                     │
│  ❌ You missed:                     │
│  ─────────────────────────────────  │
│  Q2: "What does a p-value indicate?"│
│                                     │
│  💡 The p-value represents the      │
│  probability of observing results   │
│  at least as extreme as measured,   │
│  assuming the null hypothesis is    │
│  true. A low p-value (< 0.05) means │
│  statistical significance.          │
│                                     │
│  ✅ You nailed:                     │
│  • Hypothesis testing basics        │
│  • Sample size concepts             │
│                                     │
│  [Try Another Quiz]  [Back to Class]│
└─────────────────────────────────────┘
```

*Implementation notes:*
- AI should generate explanations along with questions
- Store explanations in the question schema
- Only show explanations for wrong answers (right answers don't need review)
- Keep explanations concise — 2-3 sentences max

**Task: Add Privacy Visual Indicators**

Students need constant reassurance that this is private.

*Visual cues:*
- 🔒 Padlock icon next to "Quiz Me"
- Grey/muted background (feels "hidden")
- Text: "Private mode — only you can see this"
- No "share" or "submit" buttons anywhere

**Task: Verify Zero Data Transmission**

Audit the code to ensure quiz results are never sent over the network.

*Verification steps:*
1. Open browser DevTools → Network tab
2. Complete a Self-Check quiz
3. Verify NO requests contain quiz answers or scores
4. Document this verification for privacy compliance

### Professor's Pulse (Engagement Monitoring)

**Task: Implement Chat Monitoring**

Track chat activity using Zoom SDK events.

```javascript
zoomSdk.onChat((message) => {
  engagementTracker.recordChatMessage(message.timestamp);
});
```

*Metrics to track:*
- Messages per minute
- Time since last message
- Number of unique participants chatting

**Task: Implement Audio Monitoring**

Track who's speaking and for how long.

*Signals:*
- Is the host speaking? (continuous = lecture mode)
- Are participants unmuting? (interaction = engagement)
- Long silence from everyone? (confusion or disengagement)

**Task: Implement Screen Share Detection**

Know when the professor is sharing their screen.

*Why it matters:*
- Screen share + silence = passive viewing mode
- This is when engagement typically drops
- It's the right time to suggest a check-in

**Task: Build Engagement Algorithm**

Combine signals into an "engagement score" and trigger alerts.

*Algorithm logic:*
```javascript
function checkEngagement() {
  const chatVelocity = getChatMessagesPerMinute();
  const timeSinceLastChat = getMinutesSinceLastChat();
  const isScreenSharing = getScreenShareStatus();
  const timeSinceLastPoll = getMinutesSinceLastPoll();
  
  if (isScreenSharing && 
      timeSinceLastChat > 10 && 
      timeSinceLastPoll > 15) {
    triggerEngagementAlert();
  }
}
```

**Task: Build Host Notification Toast**

Create the non-intrusive alert that appears for professors.

*Design:*
```
┌────────────────────────────────────┐
│ 📊 Engagement is low.              │
│    Launch a Check-In?              │
│                                    │
│    [Launch]  [Dismiss]             │
└────────────────────────────────────┘
```

*Behavior:*
- Slides in from top-right
- Stays for 10 seconds, then auto-dismisses
- "Launch" triggers poll generation
- "Dismiss" snoozes for 10 minutes

**Task: Implement One-Click Poll Deployment**

When professor clicks "Launch":
1. Grab current transcript context
2. Generate poll question via AI
3. Deploy poll to all participants via Zoom SDK
4. Show confirmation to professor

*Example generated poll:*
```
"How clear was the explanation of regression analysis?"
A) Crystal clear
B) Mostly understood  
C) A bit confused
D) Completely lost
```

---

## Week 4: Polish & Demo

**Feb 26 - Feb 28**

**Goal:** Presentation-ready application with polished UI, robust error handling, and recorded demo.

This is the final push. No new features — just making everything we built look and feel professional.

### UI Polish & Animations

**Task: Apply Zoom Brand Colors**

Align our visual design with Zoom's aesthetic.

*Color palette:*
- Primary: Zoom Blue (#0B5CFF)
- Success: Green (#4CAF50)
- Error: Red (#F44336)
- Background: Light grey (#F5F5F5)
- Text: Dark grey (#333333)

**Task: Add Leaderboard Medals**

Make the top 3 feel special.

*Visual treatment:*
- 🥇 Gold medal + golden glow for 1st place
- 🥈 Silver medal for 2nd place
- 🥉 Bronze medal for 3rd place
- Subtle animation when rankings change

**Task: Implement Confetti Animation**

Celebrate correct answers with visual delight.

*When to trigger:*
- Correct answer in Warm-Up Arena
- Perfect score (3/3) in Self-Check
- Keep it brief (1-2 seconds) so it doesn't get annoying

**Task: Polish Side Panel Aesthetic**

Make the in-meeting experience feel like a professional study tool.

*Design principles:*
- Clean, minimal, focused
- Plenty of whitespace
- Clear visual hierarchy
- Nothing flashy or distracting during lecture

**Task: Add Smooth Transitions**

Make context switches feel seamless.

*Transitions to polish:*
- Waiting room → Side panel (fade + slide)
- Question to question (subtle slide)
- Quiz start → Quiz end (smooth flow)

### Error Handling & Resilience

**Task: Implement AI Fallback Gracefully**

When AI fails, users shouldn't notice (much).

*User experience:*
- Show brief loading state
- If AI times out, seamlessly show fallback questions
- Never show error messages like "AI_TIMEOUT_ERROR"
- Log errors for debugging, but hide from users

**Task: Handle Disconnection States**

Network issues happen. Handle them gracefully.

*Shared State disconnect:*
- Show subtle "Reconnecting..." indicator
- Continue showing last known state
- Auto-reconnect in background
- Sync state when connection restored

**Task: Handle Transcript Unavailability**

Sometimes transcript isn't available (permissions, technical issues).

*User experience:*
- "Quiz Me" button shows: "Transcript unavailable right now. Try again in a moment."
- Don't break the entire app — other features should still work

**Task: Implement Comprehensive Logging**

Log everything important for debugging, but keep it invisible to users.

```javascript
logger.info('Quiz generated', { questionCount: 3, source: 'ai' });
logger.warn('AI timeout, using fallback', { timeout: 5000 });
logger.error('Shared state sync failed', { error: e.message });
```

**Task: Test Degraded Mode**

Verify the app works (partially) even when things fail.

*Test scenarios:*
- AI unavailable → fallback questions work
- Shared state down → individual features still work
- Transcript unavailable → Self-Check shows helpful message
- Network slow → loading states appear, nothing crashes

### Privacy Compliance

**Task: Final Privacy Audit**

Verify we meet all privacy commitments.

*Checklist:*
- [ ] No facial recognition code anywhere
- [ ] No gaze tracking or eye detection
- [ ] Self-Check results only in localStorage
- [ ] No quiz scores transmitted to host
- [ ] Engagement algorithm uses only metadata (chat, audio, screen share)

**Task: Add First-Use Privacy Notice**

On first launch, explain our privacy approach.

*Content:*
```
Welcome to Zoom Momentum!

🔒 Your Privacy Matters

- Self-Check quizzes are 100% private
- Your quiz scores are stored only on your device
- Your professor cannot see your Self-Check results
- We don't track your face or eyes

[Got it, let's go!]
```

**Task: Document Privacy Compliance**

Add a PRIVACY.md file explaining our data practices for anyone who asks.

### Demo & Documentation

**Task: Write Setup Instructions**

Create clear documentation for running the app locally.

*README.md should include:*
- Prerequisites (Node.js version, Zoom developer account)
- Environment setup (.env configuration)
- How to run locally
- How to test in Zoom
- Troubleshooting common issues

**Task: Document API Schemas**

Ensure all data contracts are documented.

- AI input/output JSON schemas
- Shared state data structures
- Event payloads

**Task: Record Demo Video**

Create a polished video showing the complete flow.

*Demo script:*
1. Show student joining waiting room
2. Play through Warm-Up Arena trivia
3. Show leaderboard transition when meeting starts
4. Demonstrate Self-Check during "lecture"
5. Show Professor's Pulse alert and one-click poll
6. Highlight privacy features throughout

**Task: Final Code Review**

Clean up before delivery.

- Remove console.logs and debug code
- Ensure consistent code style
- Add comments for complex logic
- Remove unused dependencies
- Update all documentation

---

## Weekly Milestones Summary

| Week | Theme | Key Deliverable |
|------|-------|-----------------|
| Pre-Sprint | Onboarding | Team is set up and familiar with Zoom Apps SDK |
| Week 1 | Infrastructure | App loads in both contexts with synchronized timer |
| Week 2 | AI Logic | Quiz generation works with functional UI |
| Week 3 | Integration | All three features work end-to-end |
| Week 4 | Polish | Presentation-ready app with demo video |

---

## Definition of Done

A task is complete when:
- Code works as described
- Edge cases are handled
- No console errors or warnings
- Code is reviewed by a teammate
- Feature is tested in actual Zoom client (not just browser)

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI API slow or unavailable | Quiz features broken | Fallback question bank ready |
| Shared State sync issues | Multiplayer feels broken | Extensive testing, reconnection logic |
| Transcript not available | Self-Check unusable | Graceful error message, retry option |
| Scope creep | Miss deadline | Strict weekly milestones, defer nice-to-haves |
| Zoom SDK quirks | Unexpected bugs | Extra time in Week 1 for learning |

---

*This roadmap is a living document. Update it as we learn and adapt.*

*Last Updated: Feb 02, 2026*
