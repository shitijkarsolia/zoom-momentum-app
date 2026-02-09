This document serves as the single source of truth for **Zoom Momentum**. Use this to onboard AI agents or team members. It contains the product vision, technical specifications, and execution roadmap, stripped of historical references to focus purely on the build.

---

# Project Memory: Zoom Momentum

**Project Lead:** Shitij Mathur (Zoom Fellow, ASU NEXT Lab)
**Project Timeline:** 4-Week Sprint
**Target Platform:** Zoom Apps SDK + AI Companion API

---

## 1. Product Vision & Philosophy

**The Problem:**
Virtual education has two structural flaws:

1. **The Cold Start:** The Waiting Room is dead digital real estate. Students enter the class passive, bored, and mentally checking out before the lecture begins.
2. **The Passive Learner Effect:** Engagement creates a "Mid-Class Slump." When students get confused, they are too embarrassed to interrupt the lecture, leading to silent failure.

**The Solution:**
**Zoom Momentum** is an engagement ecosystem that gamifies the *start* of class and creates a privacy safety net *during* class. It moves the Zoom experience from **Passive Viewing** to **Active Participation**.

**Core Value Proposition:**

* **For Students:** A fun, competitive start to class and a safe, private way to catch up if they get lost.
* **For Professors:** An automated co-pilot that monitors the room and writes polls for them, requiring zero manual effort.

---

## 2. Feature Specifications (Detailed)

### Feature A: The Warm-Up Arena (Synchronous Engagement)

* **Location:** Zoom Waiting Room (Context: `waitingRoom`).
* **Trigger:** Activates automatically 5-10 minutes before the scheduled meeting start time.
* **The Experience:** A multiplayer, synchronized trivia layer.
* **Sync Logic:** A shared timer ensures every student sees "Question 1" appear at the exact same millisecond. This creates a "Live Event" feeling.
* **Question Types:**
1. *Icebreakers:* Social questions to build community (e.g., "Coffee or Tea?").
2. *Recall:* AI generates questions based on the *previous* lecture's transcript/summary.


* **The Handoff:** When the host starts the meeting, the App transitions to the `sidePanel` and flashes a "Top 3 Leaderboard" for 10 seconds to transfer energy into the main room.



### Feature B: The Self-Check (Private Recovery)

* **Location:** Student Sidebar (Context: `sidePanel`).
* **Trigger:** Student clicks the "Quiz Me" button (UI must feature a Lock Icon 🔒).
* **The Mechanism:**
1. App captures the last 300 words of the live transcript buffer.
2. Sends text to AI Companion API with a prompt to generate 3 Multiple Choice Questions.
3. Renders quiz locally in the sidebar.
4. **Privacy Protocol:** Results are stored in `localStorage` (Client-Side). **Zero data** is sent to the host. The professor never knows the student failed the quiz.



### Feature C: Professor’s Pulse (Automated Intervention)

* **Location:** Host Sidebar (Context: `sidePanel`).
* **Trigger:** Automated or Manual.
* **The Mechanism:**
1. **Passive Monitoring:** The app listens to Meeting SDK signals (Chat velocity, Audio activity).
2. **Threshold Logic:** If `chat_messages == 0` for > 10 mins AND `host_audio == continuous`, trigger alert.
3. **The Nudge:** A Toast Notification appears: *"Engagement is low. Launch a Check-In?"*
4. **One-Click Action:** Professor clicks "Launch." The AI generates a poll based on the *current* topic and deploys it immediately to the class.



---

## 3. Technical Architecture

### Tech Stack

* **Frontend:** React.js (hosted on Node.js/Express).
* **Platform:** Zoom Apps SDK.
* **AI:** Zoom AI Companion API (or OpenAI API for dev/prototype phase).
* **State Management:** Zoom Apps Shared State API (Critical for Warm-Up Sync).

### Data Flow & Logic

**1. The Transcript Pipeline**

* Use `zoomSdk.onTranscriptUpdate` to maintain a **Rolling Buffer**.
* *Buffer Logic:* Keep a First-In-First-Out (FIFO) string of the last ~5 minutes of text. This ensures the "Self-Check" quiz is always relevant to *right now*.

**2. The Engagement Algorithm (Professor's Pulse)**

* *Inputs:*
* `getChatStatus()`: Volume of messages/minute.
* `getAudioStatus()`: Is the host speaking? Are participants unmuted?
* `getShareStatus()`: Is a screen being shared?


* *Algorithm:*
```javascript
IF (ScreenShare == Active) AND (ChatVelocity < Threshold) AND (TimeSinceLastPoll > 15mins)
THEN trigger "Engagement Alert"

```



**3. Privacy & Compliance (Critical)**

* **NO Facial Recognition:** We explicitly do not use camera stream analysis (eye tracking/gaze detection).
* **NO Gaze Tracking:** We rely strictly on system metadata.
* **Data Isolation:** Student quiz scores are never transmitted over the WebSocket to the host.

---

## 4. Execution Roadmap (4-Week Sprint)

**Role: Project Lead (Shitij)**

* *Responsibilities:* AI Prompt Engineering, Engagement Algorithm Logic, Overall Project Management.

**Role: Dev 1 (Frontend/UI)**

* *Responsibilities:* React Components, CSS/Styling (Gamification feel), Zoom UI consistency.

**Role: Dev 2 (Backend/Sync)**

* *Responsibilities:* WebSocket/Shared State implementation, API integrations.

### Week 1: Infrastructure & Skeleton

* **Goal:** "Hello World" in two contexts.
* **Tasks:**
* Initialize Zoom App project.
* Configure `manifest.json` for `waitingRoom` and `sidePanel` contexts.
* Implement Shared State (Timer Sync) basics.
* **Lead Task:** Define the exact JSON schema for the AI input/output.



### Week 2: The Brain (AI Logic)

* **Goal:** Content generation works (even with mock text).
* **Tasks:**
* Connect the AI Companion API.
* **Lead Task (Prompt Engineering):** Refine prompts to ensure questions aren't too hard or too easy.
* *Prompt Draft:* "You are a teaching assistant. Create 3 multiple choice questions based on this text. Format as JSON array."


* Build the Quiz UI component (Select answer -> Show Correct/Incorrect).



### Week 3: Integration & Privacy

* **Goal:** The Loop works.
* **Tasks:**
* Connect the Transcript Buffer to the AI Trigger.
* Implement the "Privacy Lock" (Local storage logic) for Self-Check.
* Connect the "Engagement Algorithm" to the Professor Notification UI.



### Week 4: Polish & Demo

* **Goal:** Presentation Ready.
* **Tasks:**
* UI Polish: Animations for correct answers (Confetti).
* Error Handling: What if AI times out? (Fallback to generic questions).
* **Deliverable:** A recorded demo video showing the flow from Waiting Room -> Class -> Self-Check.



---

## 5. UI/UX Design Guidelines

* **The Warm-Up (Student View):**
* High energy colors (Zoom Blue + bright accents).
* Large, bold typography for the Timer.
* Leaderboard should feel rewarding (Gold/Silver/Bronze icons).


* **The Sidebar (Student View):**
* Clean, minimal, "Study Tool" aesthetic.
* **Privacy Indicators:** Use visual cues (Padlock icon, grey background) to reassure the student that this view is private.


* **The Notification (Professor View):**
* Non-intrusive. Standard Toast style.
* "Launch" button must be the primary call to action.



---

## 6. Strategic Defense (FAQ)

* **Q: Doesn't Zoom already have polls?**
* **A:** Yes, but they are manual. Professors rarely stop mid-sentence to type out a poll. Momentum is **automated**. The AI writes the poll for you, and the System tells you *when* to use it.


* **Q: Is this surveillance?**
* **A:** Absolutely not. We do not track eyes or faces. We only look at metadata (chat volume), and student quiz performance is never shared with the instructor.



---

**End of Project Memory.**