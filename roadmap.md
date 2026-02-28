# Zoom Momentum - Project Roadmap

**Project Lead:** Shitij Mathur  
**Timeline:** Feb 02, 2026 - Feb 28, 2026 (4-Week Sprint)  
**Platform:** Zoom Apps SDK + AI Companion API

---

## What We're Building

Zoom Momentum transforms passive virtual classrooms into active learning environments. We're solving two fundamental problems in online education:

1. **The Cold Start Problem:** Students join Zoom calls and sit in the waiting room doing nothing. By the time class starts, they're already mentally checked out.

2. **The Silent Failure Problem:** When students get confused during a lecture, they're too embarrassed to interrupt. They fall behind silently, and the professor has no idea.

Our solution is an engagement ecosystem with four integrated features that work together to keep students active from the moment they join, through the lecture, and even after class ends.

**Design Philosophy — Complement, Don't Compete with Zoom AI Companion:**
Zoom AI Companion 3.0 already handles reactive, private Q&A ("What did I miss?"). We don't rebuild that. Instead, our features are *proactive* and *shared* — pushing structured information to everyone simultaneously, creating shared context that the AI Companion doesn't provide.

---

## The Four Core Features

### Feature A: The Warm-Up Arena (Pre-Class Engagement)

**What it is:** A multiplayer trivia game that runs in the Zoom waiting room before class starts.

**Why it matters:** Instead of staring at "Please wait, the host will let you in soon," students compete in synchronized trivia. They enter the actual class energized, connected with classmates, and mentally present.

**The Vision:**
> Imagine joining your 9 AM lecture. Instead of scrolling Instagram while waiting, you see: "Question 1 of 5 - Starting in 3... 2... 1..." Suddenly you're racing against 30 classmates to answer "What was the main topic of last week's lecture?" You get it right, jump to 3rd place on the leaderboard. The host starts the meeting, and for 10 seconds you see "🥇 Sarah - 500pts, 🥈 Mike - 450pts, 🥉 YOU - 400pts" flash on screen. You're smiling. Class hasn't even started and you're already engaged.

**Question Types:**
- *Icebreakers:* "Coffee or tea?" / "What's your go-to study snack?" — builds community
- *Recall:* AI-generated questions from last lecture's transcript — primes the brain for learning

---

### Feature B: The Live Anchor (Shared Dynamic Summary)

**What it is:** A pinned, auto-updating card in the side panel that shows the "Current Topic" and a bulleted list of key takeaways from the last 15 minutes. As the professor moves to a new topic, the old summary collapses into history and a new empty card appears.

**Why it's different from Zoom AI Companion:**
- Zoom AI Companion is *reactive and private* — you have to ask it "What did I miss?" and it gives you a personal answer.
- The Live Anchor is *proactive and shared* — it pushes key takeaways to everyone simultaneously, creating a "Shared Source of Truth" for the entire class.

**Why it matters:**
- *Solves Silent Failure:* If a student zones out for 2 minutes, they don't need to panic or ask a friend. They glance at the Live Anchor to see exactly what concept is being discussed right now.
- *Solves Late Joiners:* A student joins 10 minutes late. Instead of interrupting ("What are we talking about?"), they see the summary of the first 10 minutes already pinned there.
- *Zero Friction:* Zero clicks for the student. Zero effort for the professor (once enabled).

**The Vision:**
> You're in a Linear Algebra lecture. You zoned out for a minute. Instead of panicking, you glance at the sidebar:
>
> **09:00 AM: Introduction to Linear Algebra** (Collapsed ✅)
> **09:15 AM: Matrix Multiplication Rules** (Collapsed ✅)
> **09:30 AM (Current Topic): Eigenvectors** (Active & Pulsing 🟢)
> - Definition: A vector that doesn't change direction during transformation
> - Key Formula: Av = λv
> - Real-world example: Google PageRank
>
> You're instantly caught up. No interruption. No embarrassment.

**The Smart Logic (How it works behind the scenes):**
1. The **Transcript Buffer** holds the last ~300 words of the transcript.
2. Every 2-3 minutes (or when a long pause is detected), the **Host App** sends the buffer to the AI with a specific prompt: *"Identify if the topic has changed. If yes, summarize the previous topic in 3 bullets. If no, extract any new key definitions or formulas from the current text."*
3. The Host App updates the **Zoom Shared State** object: `{ currentTopic: "Eigenvectors", bullets: [...] }`.
4. All 30 student apps simply **read** this state and render the UI instantly. Everyone sees the exact same summary.

**Why only the Host runs AI:** We don't want 30 students each making independent AI calls. The Host is the single source of truth — one AI call, shared to all via Shared State.

**Bonus — Private "Save" Button:**
A tiny bookmark icon next to each bullet point. If a student clicks it, that specific note saves to their private "Study List" in localStorage for after class. Private, lightweight, useful.

---

### Feature C: Professor's Pulse (Automated Intervention)

**What it is:** An automated engagement monitor that watches chat activity and audio patterns, then nudges the professor when the room goes quiet.

**Why it matters:** Professors can't see engagement through a screen. They lecture into the void, hoping someone is listening. This feature is their co-pilot — it watches the room so they don't have to.

**The Vision:**
> You're a professor 25 minutes into your lecture. You've been sharing your screen, explaining a complex diagram. What you don't realize: no one has typed in chat for 12 minutes. The room is dead silent. Suddenly, a gentle notification slides in: "Engagement is low. Launch a Check-In?" You click "Launch." Instantly, a poll appears for all students: "How clear was the explanation of [current topic]? A) Crystal clear B) Mostly got it C) Lost me D) Need a recap." Within seconds, you see 60% picked C or D. You pause, backtrack, explain differently. You just saved 30 students from silent failure.

**How it Detects Low Engagement:**
- Chat velocity drops to zero for 10+ minutes
- Host has been talking continuously (no student unmutes)
- Screen share is active (students are in "passive viewing" mode)

---

### Feature D: The Recovery Agent (Post-Class Action)

**What it is:** A post-class system that turns in-lecture "Bookmark" moments into a personalized remediation plan delivered minutes after class ends.

**The Insight:** If a student is lost, the best time to fix it isn't *during* class (where quizzing yourself means missing more content). It's *immediately after* class, when the material is still fresh and there's time to focus.

**Why it matters:** Instead of asking students to self-diagnose mid-lecture (which pulls attention away), we give them a single low-friction action — hit "Bookmark" — and handle the rest automatically after class.

**The Vision:**
> You're in a statistics lecture. The professor starts explaining eigenvalues and you're completely lost. You hit the 📌 Bookmark button in the sidebar. That's it. You go back to paying attention.
>
> 20 minutes later, the professor explains matrix multiplication and you miss a key step. You hit 📌 again.
>
> Class ends. 5 minutes later, you get a notification:
>
> *"You flagged 2 moments today. I've prepared a recovery pack:*
> *1. Explaining 'Eigenvalues' — 2 min summary*
> *2. A practice problem for 'Matrix Multiplication'*
> *3. Link to the textbook chapter covering this."*
>
> Your moment of confusion just became a structured study plan.

**How it works:**
1. **During Class:** Student hits the "📌 Bookmark" button whenever they feel lost. The app records the timestamp and the current topic from the Live Anchor's Shared State.
2. **Meeting Ends:** The Recovery Agent activates. It takes all bookmarked timestamps, retrieves the corresponding transcript segments, and sends them to the AI.
3. **AI Generates Recovery Pack:** For each bookmarked moment, the AI produces:
   - A concise explanation of the concept (2-3 sentences)
   - A practice problem or reflection question
   - (Optional) A reference link if the professor has provided course materials
4. **Delivery:** The recovery pack is rendered in the app or sent as a notification. All data stays client-side — the professor never sees which moments were bookmarked.

**Privacy:** Bookmarks and recovery packs are stored in localStorage only. The professor has zero visibility into who bookmarked what.

**Spaced Repetition Principle:** By delivering the recovery pack immediately after class (not days later), we catch students while the material is still fresh — maximizing retention.

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

**Task: Study Zoom AI Companion API 3.0**

Our app generates summaries, quiz questions, polls, and recovery packs using AI. Critically, we need to understand what AI Companion already does out of the box so we don't duplicate it.

- How to authenticate with the API
- Request/response formats
- Rate limits and timeout handling
- What AI Companion 3.0 handles natively (meeting summaries, Q&A, smart recap) — we build *around* these, not *over* them
- Using OpenAI as a fallback during development

*Key prompts we'll use:*
```
// Live Anchor — Topic Segmentation
"Identify if the topic has changed from the previous context. If yes, 
summarize the previous topic in 3 bullets. If no, extract any new key 
definitions or formulas. Return as JSON."

// Recovery Agent — Post-Class Remediation
"Based on this transcript segment, create a concise explanation (2-3 sentences), 
one practice problem, and suggest a study resource. Return as JSON."

// Warm-Up Arena — Recall Questions
"Create 3 multiple choice questions a student should be able to answer 
if they attended last week's lecture. Focus on main ideas, not minor details."
```

### Understanding the Sync Challenge

**Task: Deep Dive into Shared State API**

The Warm-Up Arena and Live Anchor both depend on synchronized state across all clients. The Zoom Shared State API makes this possible.

Understand:
- How state propagates across clients
- Latency expectations (should be <100ms)
- What happens when someone joins late (they need to sync to current state)
- Conflict resolution (what if two clients update simultaneously?)

*Example scenario:* 30 students are in the waiting room. The timer hits zero. All 30 must see "Question 1" appear simultaneously. If Student A sees it 2 seconds before Student B, the competitive magic is broken.

*Live Anchor scenario:* The professor moves to a new topic. The Host App updates Shared State. All 30 student sidebars must reflect the new topic card within milliseconds.

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
- Placeholder for the Live Anchor timeline
- Placeholder for the Bookmark button
- Role detection: show different UI for Host vs Participant

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

Connect to Zoom's Shared State API. This is the backbone of our multiplayer features (Arena sync + Live Anchor).

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

If a student joins the waiting room after trivia has started, or joins the meeting late, they need to sync to the current state immediately.

*Arena example:* Trivia is on Question 3. A new student joins. They should immediately see Question 3, not start from Question 1.

*Live Anchor example:* Student joins 15 minutes late. They should immediately see the collapsed topic history and the current active topic card.

### Documentation Tasks

**Task: Define AI Input/Output JSON Schemas**

Document exactly what we send to the AI and what we expect back for each feature. This contract ensures frontend and backend developers are aligned.

*Live Anchor — Topic Segmentation:*
```json
// Input
{
  "type": "topic_segmentation",
  "transcript_buffer": "string (last 300 words)",
  "previous_topic": "string (current topic name)"
}

// Output
{
  "topic_changed": true,
  "previous_summary": {
    "topic": "Matrix Multiplication",
    "bullets": ["Rule 1...", "Rule 2...", "Rule 3..."]
  },
  "current_topic": "Eigenvectors",
  "new_bullets": ["Definition: A vector that..."]
}
```

*Recovery Agent — Remediation Pack:*
```json
// Input
{
  "type": "recovery_pack",
  "bookmarks": [
    { "timestamp": "09:32:15", "topic": "Eigenvectors", "transcript_segment": "..." },
    { "timestamp": "09:48:30", "topic": "Matrix Multiplication", "transcript_segment": "..." }
  ]
}

// Output
{
  "recovery_items": [
    {
      "topic": "Eigenvectors",
      "explanation": "An eigenvector is a vector that...",
      "practice_problem": "Given matrix A = [[2,1],[0,3]], find...",
      "resource_hint": "Chapter 5, Section 3"
    }
  ]
}
```

*Warm-Up Arena — Quiz Generation:*
```json
// Input
{
  "type": "quiz_generation",
  "transcript": "string (last lecture summary)",
  "question_count": 3,
  "difficulty": "medium"
}

// Output
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

## Week 2: The Brain — AI Logic & Transcript Pipeline

**Feb 12 - Feb 18**

**Goal:** AI-powered content generation works for all features (even with mock transcript text). Core UI components are functional.

This week we build the "intelligence" of the app. By the end, we should be able to paste any text and get back topic summaries, quiz questions, and recovery explanations.

### AI Integration

**Task: Connect to AI Companion API**

Implement the service that communicates with Zoom's AI Companion API (or OpenAI during development).

*What this involves:*
- Setting up authentication (API keys, tokens)
- Building the HTTP client with proper headers
- Handling rate limits gracefully

**Task: Build Topic Segmentation Prompt (Live Anchor)**

Craft the prompt that analyzes transcript chunks and detects topic changes.

*The challenge:*
- Too sensitive → topics change every 30 seconds (noisy, useless)
- Too insensitive → misses real topic shifts
- Just right → detects when the professor genuinely moves to a new concept

*Example prompt iteration:*
```
Version 1: "Summarize this text"
→ Too generic, no topic detection

Version 2: "Has the topic changed? If yes, summarize the old one."
→ Better, but triggers on minor tangents

Version 3: "You are monitoring a live lecture. The current topic is [X]. 
Based on the new transcript, determine if the professor has moved to a 
fundamentally new concept (not just an example or tangent). If yes, 
summarize the previous topic in exactly 3 bullet points and name the new topic. 
If no, extract any new key definitions, formulas, or examples mentioned."
→ This is the sweet spot
```

**Task: Build Quiz Generation Prompt (Warm-Up Arena)**

Craft the prompt that turns last lecture's transcript into trivia questions.

```
"Create 3 multiple choice questions a student should be able to answer 
if they attended last week's lecture. Focus on main ideas, not minor details. 
Make wrong answers plausible but clearly incorrect to someone who understood."
```

**Task: Build Recovery Pack Prompt (Recovery Agent)**

Craft the prompt that turns bookmarked transcript segments into study material.

```
"A student was confused during these moments in today's lecture. 
For each moment, provide:
1. A clear 2-3 sentence explanation of the concept
2. One practice problem to test understanding
3. A suggested study approach
Keep it encouraging and concise."
```

**Task: Build Response Parser and Validator**

The AI returns JSON (hopefully). We need to:
- Parse the JSON safely (handle malformed responses)
- Validate the structure matches our schemas
- Reject responses that don't have exactly the fields we need

*Edge cases to handle:*
- AI returns incomplete JSON
- AI returns wrong number of items
- AI returns valid JSON but nonsensical content

**Task: Implement Timeout and Fallback**

AI APIs can be slow or unavailable. We need graceful degradation.

*The flow:*
1. Send request to AI
2. Wait up to 5 seconds
3. If timeout or error → fall back to graceful defaults
4. Never leave the user staring at a loading spinner forever

*Fallback strategies per feature:*
- Live Anchor: Show "Summary updating..." and retry on next cycle
- Warm-Up Arena: Use pre-loaded generic icebreaker questions
- Recovery Agent: Queue for retry, notify student of delay

**Task: Create Fallback Question Bank (Warm-Up Arena)**

Build a set of 20-30 generic icebreaker/engagement questions that work for any class.

*Examples:*
- "What was the most interesting point from last week?"
- "Coffee or tea?"
- "How would you rate your understanding so far: Confident / Mostly there / Need help"

These aren't as good as AI-generated recall questions, but they're infinitely better than a broken feature.

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
- 300 words is enough to generate relevant summaries

*Implementation:*
```javascript
class TranscriptBuffer {
  constructor(maxWords = 300) {
    this.words = [];
    this.maxWords = maxWords;
    this.timestamps = []; // Track timestamps for bookmark correlation
  }
  
  add(text, timestamp) {
    const newWords = text.split(' ');
    this.words.push(...newWords);
    this.timestamps.push({ wordIndex: this.words.length - newWords.length, timestamp });
    // Trim from the front if over limit
    while (this.words.length > this.maxWords) {
      this.words.shift();
    }
  }
  
  getText() {
    return this.words.join(' ');
  }
  
  getSegmentAt(timestamp) {
    // Retrieve ~100 words around a specific timestamp (for Recovery Agent)
  }
}
```

**Task: Handle Transcript Gaps**

What if the professor stops talking for a while? Or mutes? Or the transcript service hiccups?

- Don't clear the buffer on silence — retain what we have
- If no new text for 30+ seconds, keep existing content
- Only clear on explicit reset (new meeting, etc.)

### Core UI Components

**Task: Build Live Anchor Timeline Component**

Create the vertical timeline UI that shows topic cards.

*States to handle:*
- Collapsed topic (past) — shows topic name + timestamp, expandable
- Active topic (current) — shows topic name + live bullet points, pulsing indicator
- Empty state — "Waiting for lecture to begin..."

**Task: Build Bookmark Button Component**

Create the 📌 Bookmark button for the student sidebar.

*Design:*
- Single tap to bookmark the current moment
- Brief visual confirmation (pulse animation, "Bookmarked!")
- Counter showing how many bookmarks this session ("📌 3")
- Non-distracting — should not pull focus from the lecture

**Task: Build Quiz UI Component (Warm-Up Arena)**

Create the UI that shows a single quiz question with its options.

*Design considerations:*
- Question text should be prominent and readable
- Options should be clearly labeled (A, B, C, D)
- Touch targets should be large enough for easy clicking
- Visual hierarchy guides the eye naturally

**Task: Implement Answer Selection and Feedback**

When a student clicks an option:
- Highlight their selection
- On submit: show correct/incorrect with brief feedback
- Green highlight + checkmark for correct
- Red highlight + show correct answer for incorrect
- "Next Question" button for multi-question flows

---

## Week 3: Integration & Full Feature Flows

**Feb 19 - Feb 25**

**Goal:** All four features work end-to-end. The complete user journey is functional.

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
5. Fade to normal side panel view (Live Anchor + Bookmark)

### Live Anchor (Complete Flow)

**Task: Implement Host-Side AI Loop**

Build the logic that runs on the professor's client to generate topic summaries.

*The loop:*
```javascript
// Runs every 2-3 minutes on the Host app
async function updateLiveAnchor() {
  const transcript = transcriptBuffer.getText();
  const currentTopic = sharedState.get('currentTopic');
  
  const analysis = await aiService.analyzeTopicSegment({
    transcript,
    previousTopic: currentTopic
  });
  
  if (analysis.topic_changed) {
    // Archive old topic, start new one
    sharedState.update({
      topicHistory: [...history, { topic: currentTopic, bullets: currentBullets }],
      currentTopic: analysis.current_topic,
      currentBullets: analysis.new_bullets,
      lastUpdated: Date.now()
    });
  } else {
    // Update bullets for current topic
    sharedState.update({
      currentBullets: [...currentBullets, ...analysis.new_bullets],
      lastUpdated: Date.now()
    });
  }
}
```

**Task: Build Student-Side Live Anchor Renderer**

All student apps read from Shared State and render the timeline.

*Key behaviors:*
- New topic card appears with a subtle animation
- New bullets slide in as they're added
- Collapsed topics are expandable (click to see bullets)
- Active topic has a pulsing 🟢 indicator
- Late joiners see full history immediately

**Task: Implement Pause Detection**

Detect when the professor pauses (long silence) as a trigger for topic analysis.

*Logic:*
- If no new transcript text for 10+ seconds → likely a pause or transition
- Trigger an AI analysis cycle immediately (don't wait for the 2-3 minute timer)
- This catches topic changes more naturally

**Task: Implement "Save" Button for Bullets**

Add a small bookmark icon next to each bullet point.

*Behavior:*
- Click → saves that bullet to localStorage under "Study List"
- Visual confirmation (icon fills in, brief "Saved!" tooltip)
- Study List is accessible from a small tab in the sidebar
- Completely private — stored in localStorage only

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
1. Grab current transcript context (reuse the Live Anchor's current topic for relevance)
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

### Recovery Agent (Post-Class Flow)

**Task: Implement Bookmark Storage**

Build the system that records bookmarks during class.

*Data structure:*
```javascript
// Stored in localStorage
{
  meetingId: "abc123",
  date: "2026-02-20",
  bookmarks: [
    { 
      timestamp: "09:32:15", 
      topic: "Eigenvectors",           // From Live Anchor's current topic
      transcriptSnippet: "..."          // ~100 words around the bookmark moment
    },
    { 
      timestamp: "09:48:30", 
      topic: "Matrix Multiplication",
      transcriptSnippet: "..."
    }
  ]
}
```

**Task: Implement Meeting End Detection**

Detect when the meeting ends to trigger the Recovery Agent.

*Triggers:*
- `zoomSdk.onMeetingEnd` event
- Host ends the meeting
- Student leaves the meeting

**Task: Build Recovery Pack Generator**

When the meeting ends and bookmarks exist:
1. Collect all bookmarked moments with their transcript segments
2. Send to AI with the recovery pack prompt
3. Parse and validate the response
4. Store the recovery pack in localStorage

**Task: Build Recovery Pack UI**

Display the personalized study plan after class.

*Layout:*
```
┌─────────────────────────────────────────┐
│  📚 Your Recovery Pack — Feb 20 Lecture  │
│                                         │
│  You flagged 2 moments today.           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📌 09:32 — Eigenvectors         │    │
│  │                                 │    │
│  │ 💡 An eigenvector is a special  │    │
│  │ vector that, when a linear      │    │
│  │ transformation is applied,      │    │
│  │ only changes in scale (not      │    │
│  │ direction). The formula Av = λv │    │
│  │ means...                        │    │
│  │                                 │    │
│  │ 🧪 Practice: Given A=[[2,1],   │    │
│  │ [0,3]], find the eigenvectors.  │    │
│  │                                 │    │
│  │ 📖 Suggested: Chapter 5, Sec 3 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📌 09:48 — Matrix Multiplication│    │
│  │ ...                             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Save for Later]  [Clear]              │
└─────────────────────────────────────────┘
```

**Task: Implement Recovery Pack History**

Students should be able to access past recovery packs.

*Storage:*
- Each meeting's recovery pack is stored separately in localStorage
- A "History" tab shows past packs organized by date
- Students can delete old packs to free space

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
- Keep it brief (1-2 seconds) so it doesn't get annoying

**Task: Polish Live Anchor Aesthetic**

Make the timeline feel like a premium study tool.

*Design principles:*
- Clean vertical timeline with subtle connecting lines
- Smooth expand/collapse animations for topic cards
- Pulsing green dot for active topic
- Muted colors for collapsed topics
- Bullet points with clean typography

**Task: Polish Recovery Pack UI**

Make the post-class experience feel like a personalized tutor.

*Design principles:*
- Warm, encouraging tone
- Clear visual separation between bookmarked moments
- Practice problems in a distinct "exercise" card style
- Easy to scan, easy to study from

**Task: Add Smooth Transitions**

Make context switches feel seamless.

*Transitions to polish:*
- Waiting room → Side panel (fade + slide)
- Question to question (subtle slide)
- New topic card appearing in Live Anchor (slide down)
- Bookmark confirmation (pulse + fade)

### Error Handling & Resilience

**Task: Implement AI Fallback Gracefully**

When AI fails, users shouldn't notice (much).

*Fallback per feature:*
- Live Anchor: Show "Summary updating..." — retry on next cycle
- Warm-Up Arena: Seamlessly switch to fallback icebreaker questions
- Professor's Pulse: Generate a generic "How's everyone doing?" poll
- Recovery Agent: Queue for retry, show "Your recovery pack is being prepared..."

**Task: Handle Disconnection States**

Network issues happen. Handle them gracefully.

*Shared State disconnect:*
- Show subtle "Reconnecting..." indicator
- Continue showing last known state (Live Anchor keeps displaying last topic)
- Auto-reconnect in background
- Sync state when connection restored

**Task: Handle Transcript Unavailability**

Sometimes transcript isn't available (permissions, technical issues).

*User experience:*
- Live Anchor shows: "Waiting for transcript..."
- Bookmark button still works (records timestamp, but transcript snippet will be empty)
- Recovery Agent generates what it can from available data

**Task: Implement Comprehensive Logging**

Log everything important for debugging, but keep it invisible to users.

```javascript
logger.info('Topic change detected', { from: 'Matrix Mult', to: 'Eigenvectors' });
logger.info('Bookmark recorded', { timestamp: '09:32:15', topic: 'Eigenvectors' });
logger.warn('AI timeout, using fallback', { feature: 'arena', timeout: 5000 });
logger.error('Shared state sync failed', { error: e.message });
```

**Task: Test Degraded Mode**

Verify the app works (partially) even when things fail.

*Test scenarios:*
- AI unavailable → fallback questions work, Live Anchor shows "updating..."
- Shared state down → Bookmark still records locally, Arena pauses gracefully
- Transcript unavailable → Live Anchor waits, Bookmark records timestamp only
- Network slow → loading states appear, nothing crashes

### Privacy Compliance

**Task: Final Privacy Audit**

Verify we meet all privacy commitments.

*Checklist:*
- [ ] No facial recognition code anywhere
- [ ] No gaze tracking or eye detection
- [ ] Bookmarks stored only in localStorage
- [ ] Recovery packs stored only in localStorage
- [ ] Saved bullets stored only in localStorage
- [ ] No student data transmitted to host
- [ ] Engagement algorithm uses only metadata (chat, audio, screen share)
- [ ] Live Anchor summaries are shared (by design) but contain no student-specific data

**Task: Add First-Use Privacy Notice**

On first launch, explain our privacy approach.

*Content:*
```
Welcome to Zoom Momentum!

🔒 Your Privacy Matters

- Your bookmarks and recovery packs are 100% private
- Saved notes are stored only on your device
- Your professor cannot see what you bookmark
- We don't track your face or eyes
- The Live Anchor shows the same summary to everyone — no individual tracking

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

- AI input/output JSON schemas (topic segmentation, quiz generation, recovery pack)
- Shared state data structures (arena state, live anchor state)
- Event payloads

**Task: Record Demo Video**

Create a polished video showing the complete flow.

*Demo script:*
1. Show student joining waiting room → Warm-Up Arena trivia
2. Show leaderboard transition when meeting starts
3. Demonstrate Live Anchor updating in real-time during "lecture"
4. Show student bookmarking a confusing moment
5. Show Professor's Pulse alert and one-click poll
6. Show Recovery Pack appearing after class ends
7. Highlight privacy features throughout

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
| Pre-Sprint | Onboarding | Team is set up and familiar with Zoom Apps SDK + AI Companion 3.0 |
| Week 1 | Infrastructure | App loads in both contexts with synchronized timer + JSON schemas defined |
| Week 2 | AI Logic | Topic segmentation, quiz generation, recovery prompts all working + core UI components |
| Week 3 | Integration | All four features work end-to-end (Arena → Live Anchor → Pulse → Recovery Agent) |
| Week 4 | Polish | Presentation-ready app with demo video |

---

## Feature Dependency Map

Understanding how features share infrastructure:

```
Shared State API ──────┬──── Warm-Up Arena (sync questions + leaderboard)
                       └──── Live Anchor (sync topic cards to all students)

Transcript Buffer ─────┬──── Live Anchor (topic segmentation input)
                       ├──── Professor's Pulse (poll generation context)
                       └──── Recovery Agent (bookmark transcript snippets)

AI Service ────────────┬──── Warm-Up Arena (recall question generation)
                       ├──── Live Anchor (topic segmentation + bullet extraction)
                       ├──── Professor's Pulse (poll question generation)
                       └──── Recovery Agent (remediation pack generation)

localStorage ──────────┬──── Recovery Agent (bookmarks + recovery packs)
                       └──── Live Anchor "Save" button (private study list)
```

This is why Week 1 (infrastructure) and Week 2 (AI + transcript) are so critical — they build the shared foundation that all four features depend on.

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
| AI API slow or unavailable | Quiz + summary features broken | Fallback strategies per feature |
| Shared State sync issues | Arena + Live Anchor feel broken | Extensive testing, reconnection logic |
| Transcript not available | Live Anchor + Recovery Agent degraded | Graceful error messages, partial functionality |
| Topic segmentation too noisy | Live Anchor changes topics too often | Tune AI prompt sensitivity, add debounce |
| Scope creep | Miss deadline | Strict weekly milestones, defer nice-to-haves |
| Zoom SDK quirks | Unexpected bugs | Extra time in Week 1 for learning |
| AI Companion API limitations | Can't do what we need | OpenAI fallback ready from day 1 |

---

*This roadmap is a living document. Update it as we learn and adapt.*

*Last Updated: Feb 09, 2026*
