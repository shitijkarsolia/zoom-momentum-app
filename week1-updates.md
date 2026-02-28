## Week 1 Updates – Zoom Momentum

### What I researched

- **Zoom Apps SDK**
  - I confirmed that there is **no `waitingRoom` context** for Zoom Apps. Apps can run in `inMeeting`, `inMainClient`, etc., but **not in the waiting room**.
  - I confirmed there is **no `onTranscriptUpdate` event** in the Apps SDK. The client cannot directly subscribe to the live transcript.
  - I mapped out the key capabilities I can actually use: `connect`, `postMessage`, `onMessage`, `onParticipantChange`, `getUserContext`, `getMeetingContext`, `onActiveSpeakerChange`, reactions/emoji, `authorize`, and `callZoomApi` for RTMS.

- **RTMS (Real-Time Media Streams)**
  - I learned that **RTMS is the only supported way to get live transcripts** for a Zoom App.
  - The flow is: host (or backend) starts RTMS → Zoom sends a webhook (`meeting.rtms_started`) with server URLs → my RTMS service connects via WebSocket and receives transcript chunks → my backend stores and processes them.

- **Zoom AI Companion**
  - I confirmed that the **AI Companion API is not a general-purpose “LLM endpoint”** for third-party Zoom Apps.
  - It mostly lets you **retrieve Zoom-generated artifacts after the meeting** (e.g., smart recap), and there is no exposed API where my app can send arbitrary prompts and get custom answers.
  - Because of this, for my features (topic segmentation, running glossary, recovery packs, auto-bookmarks, etc.) I will use an **external LLM** (e.g., OpenAI / Gemini) from my backend.

- **“Shared state” / Collaborate Mode**
  - I clarified that there is no magical “Shared State API”. Instead, shared state is built on **Collaborate Mode + `connect`/`postMessage`/`onMessage`**.
  - The **host app holds the source of truth** for state (current question, topic cards, glossary, etc.).
  - Student apps **send events to the host**, and the host **broadcasts state** to everyone, including late joiners.

---

### How I updated the plan

- **Warm-Up Arena**
  - Moved from the imagined “waiting room app” to an **in-meeting side panel experience** at the start of class.
  - Uses **Collaborate Mode** and messaging to keep the quiz questions and leaderboard in sync for everyone.

- **Live Anchor / Running Glossary / Recovery Agent**
  - All **live transcript–driven features now go through RTMS** (not a client `onTranscriptUpdate` that doesn’t exist).
  - The backend stores transcript segments, keeps a rolling buffer, and calls an **external LLM** for:
    - topic segmentation (`Live Anchor`)
    - glossary extraction (`Running Glossary`)
    - recovery packs and post-class summaries (`Recovery Agent` / Post-Class Summary Card)
    - auto-bookmarking on professor cues.

- **Shared State Layer**
  - I added a **clear shared state implementation plan**:
    - a small message protocol (e.g. `FULL_STATE`, `REQUEST_STATE`, `ARENA_QUESTION`, `TOPIC_UPDATE`, `GLOSSARY_UPDATE`, etc.),
    - a `useMessaging` hook wrapping `connect`/`postMessage`/`onMessage`,
    - a **late-joiner flow** where new participants request `FULL_STATE` and are synced to the current quiz/topic.

- **Low-friction student features**
  - Integrated new, low-friction features into the plan, all built on the same RTMS + shared-state + LLM stack:
    - **Late Joiner Auto-Catch-Up**
    - **Auto-Bookmark on Professor Cues**
    - **Running Glossary / Formula Sheet**
    - **Post-Class Summary Card**
    - **Smart Spotlight for Student Questions**
    - **Emoji Pulse (aggregate emoji reactions for the professor)**

---

### Next steps (what I plan to build next)

- **1. App skeleton + auth**
  - Bootstrap a Zoom App using the React sample.
  - Implement in-client OAuth (PKCE) so I can identify host vs student and tie data to Zoom users.

- **2. Shared state / messaging layer**
  - Implement the `useMessaging` abstraction on top of `connect`/`postMessage`/`onMessage`.
  - Prove:
    - host can switch phases (e.g., “Arena” → “Lecture”) and everyone’s UI updates,
    - a late-joining student can request state and immediately see the correct screen.

- **3. RTMS mock and then real RTMS**
  - First, build a **mock transcript feed** so I can test the Live Anchor + glossary + auto-bookmark flows without waiting.
  - Once RTMS access is approved, wire up the real RTMS service and plug it into the same pipeline.

- **4. First AI endpoint**
  - Implement a single backend route like `/api/ai/topic-segment` that:
    - takes a transcript buffer,
    - calls an external LLM,
    - returns a **strict JSON shape** for topic cards and glossary entries.

---

### Accesses / approvals I need from Zoom to proceed

For this plan to work in a real environment (not just mocks), I need:

- **RTMS access** for my Zoom App:
  - Permission to receive **live transcript RTMS streams** (and ideally chat if possible).
  - Webhook events:
    - `meeting.rtms_started`
    - `meeting.rtms_stopped`
  - Clarification that my app is allowed to call `startRTMS` via **`callZoomApi`** from the Zoom App client (or guidance if this must be initiated server-side).

- **Zoom Apps SDK capabilities and flags**
  - Confirmation that my app can use:
    - **Collaborate Mode** for shared experiences,
    - `connect`, `postMessage`, `onMessage`, `onParticipantChange`,
    - `onActiveSpeakerChange`, reaction/emoji events,
    - `addParticipantSpotlight` / `removeParticipantSpotlight` (for Smart Spotlight), if available for Apps.
  - Any **extra approvals or flags** required to use these features in production.

- **(Optional) Guidance on AI Companion**
  - Confirmation that there is currently **no supported way** for a Zoom App to send arbitrary prompts to AI Companion and receive real-time generated responses, and that external LLMs (OpenAI/Gemini) are the right approach for my use case.

This is the context I’ll be sharing so we can confirm I’m using the APIs as intended and get RTMS + any needed capabilities unlocked.

