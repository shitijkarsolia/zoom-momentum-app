# Zoom Momentum - Developer Task Breakdown

This document breaks down the high-level features of Zoom Momentum into specific, actionable developer tasks. It provides context and explicit steps to help the team understand what needs to be built.

---

## Phase 0: Prerequisites & Approvals
*Goal: Unblock production deployment by getting necessary access and approvals early.*

- [ ] **Task 1: Request RTMS Access (Live Transcripts)**
  - **Context:** Our "Live Anchor" feature needs to read the transcript as the professor speaks. That requires Zoom's RTMS stream.
  - **Action Items:**
    - [ ] Request permission from Zoom to receive RTMS streams and webhooks (`meeting.rtms_started`).
- [ ] **Task 2: Clarify AI Companion API Status**
  - **Context:** We need to know if Zoom's native AI Companion allows custom, real-time prompt responses.
  - **Action Items:**
    - [ ] Verify if Zoom AI Companion 3.0 supports custom generation or if we should rely entirely on external LLMs.
- [ ] **Task 3: Confirm Next Lab AWS Access**
  - **Context:** The Next Lab might have AWS resources available. We need to check what is available before finalizing the stack.
  - **Action Items:**
    - [ ] Check if the Next Lab provides access to an AWS account.
    - [ ] Check if we have access to AWS Bedrock (specifically for Claude models).

---

## Phase 1: Tech Stack Research & Decisions (Pre-Code)
*Goal: Decide on the foundational tools we will use.*

- [ ] **Task 4: Evaluate Backend Language (Node.js vs. Python)**
  - **Context:** We need a server to process transcripts, call AI APIs, and handle Zoom OAuth.
  - **Action Items:**
    - [ ] Review Zoom's official Node.js server template to see what we get "for free."
    - [ ] Evaluate Python's AI library ecosystem (e.g., Langchain, simpler LLM API wrappers) versus Node.js.
    - [ ] Document a recommendation based on our team's skills and the project timeline.
- [ ] **Task 5: Evaluate Database & ORM**
  - **Context:** We must store user data, generated quizzes, and private student bookmarks.
  - **Action Items:**
    - [ ] Compare SQLite (easiest for local dev) vs. PostgreSQL.
    - [ ] Evaluate if we need an ORM like Prisma or SQLAlchemy, or if basic SQL queries are sufficient.
    - [ ] Draft a preliminary schema (Tables: Users, Meetings, Transcripts, Bookmarks, Quizzes).
- [ ] **Task 6: Evaluate Frontend Framework**
  - **Context:** The Zoom App UI runs inside Zoom's embedded web browser.
  - **Action Items:**
    - [ ] Test the vanilla React template provided by Zoom.
    - [ ] Evaluate if Next.js adds unnecessary complexity or required features (like SSR).
    
---

## Phase 1.5: AWS Infrastructure Exploration
*Goal: If Next Lab provides AWS access, determine the easiest way to deploy our backend, database, and AI.*

- [ ] **Task 7: Explore AWS Hosting Options (Backend & Database)**
  - **Context:** We need to know the easiest way for our team to deploy code.
  - **Action Items:**
    - [ ] Evaluate server deployment: EC2 (virtual machine, simple) vs. App Runner/Elastic Beanstalk.
    - [ ] Evaluate database deployment: RDS (managed PostgreSQL) vs. DynamoDB. Let's pick the fastest path.
- [ ] **Task 8: Explore AWS Bedrock (LLMs)**
  - **Context:** Bedrock gives us access to Claude 3 without needing separate API keys.
  - **Action Items:**
    - [ ] Test generating a 3-bullet summary using Claude 3 on Bedrock.
    - [ ] Compare the output quality and speed against OpenAI (GPT-4o-mini).

---

## Phase 2: App Foundation (Hello World)
*Goal: Get a basic app loading in the Zoom client with working auth.*

- [ ] **Task 9: Initialize the Frontend Repository**
  - **Context:** Create the actual UI shell.
  - **Action Items:**
    - [ ] Bootstrap the project using the chosen framework (e.g., `npx create-react-app` or Vite).
    - [ ] Install the `@zoom/appssdk` package.
    - [ ] Configure `zoomSdk.config()` with basic capabilities (`connect`).
    - [ ] Display a "Hello World from Zoom" screen.
- [ ] **Task 10: Initialize the Backend Repository**
  - **Context:** Create the backend server to serve the frontend and handle logic.
  - **Action Items:**
    - [ ] Setup the server (Node/Express or Python/FastAPI) locally.
    - [ ] Set up ngrok to expose the local server to the public internet (required by Zoom).
    - [ ] Configure Zoom Marketplace App credentials (Client ID, Secret, Redirect URL).
- [ ] **Task 11: Implement Zoom OAuth (Login Flow)**
  - **Context:** The app needs to know who is opening it.
  - **Action Items:**
    - [ ] Build the `/api/auth/login` and `/api/auth/callback` routes.
    - [ ] Exchange the OAuth code for an access token.
    - [ ] Fetch the user's Zoom Profile to get their name and ID.
    - [ ] Create a `Users` record in the database if they are new.

---

## Phase 3: The "Multiplayer" Engine (Shared State)
*Goal: Allow the Host app to send real-time UI updates to Student apps.*

- [ ] **Task 12: Define the Messaging Protocol**
  - **Context:** We need a strict format for messages sent between Host and Students.
  - **Action Items:**
    - [ ] Create a JSON schema for standard messages.
    - [ ] Example: Decide exactly what a `{"type": "START_TRIVIA", "data": {...}}` packet looks like.
- [ ] **Task 13: Build the `useMessaging` React Hook**
  - **Context:** A reusable piece of code to make sending/receiving messages easy across the app.
  - **Action Items:**
    - [ ] Wrap `zoomSdk.postMessage()` for sending.
    - [ ] Wrap `zoomSdk.onMessage()` for receiving.
    - [ ] Add error handling (e.g., what if the message fails to send?).
- [ ] **Task 14: Implement the "Late Joiner" Catch-Up Flow (Enhancement 1)**
  - **Context:** Students who join late automatically receive a full sync state and a personalized summary of what they missed.
  - **Action Items:**
    - [ ] Use `zoomSdk.onParticipantChange()` to detect new participants joining.
    - [ ] Student App Action: On load, send a `REQUEST_FULL_STATE` message to the Host.
    - [ ] Host App Action: Listen for `REQUEST_FULL_STATE` and reply with the entire current App State, including `topicHistory`.
    - [ ] Student App Action: Display a brief "Here's what you missed" notification based on the `topicHistory`.

---

## Phase 4: Mocking the Transcript
*Goal: Fake a live transcript so frontend devs can build the AI features without waiting for Zoom's RTMS approval.*

- [ ] **Task 15: Build a Static Transcript JSON File**
  - **Action Items:**
    - [ ] Find a 5-minute transcript of a real lecture (math, history, etc.).
    - [ ] Format it as an array of JSON objects: `[{"text": "So let's talk about...", "speaker": "Host", "time": "0:01"}]`
- [ ] **Task 16: Build the "Mock RTMS Service"**
  - **Context:** A small script that pretends to be Zoom sending live text.
  - **Action Items:**
    - [ ] Write a function that reads the JSON file.
    - [ ] Emit one line of text over a local WebSocket to the Backend every 3 seconds.
- [ ] **Task 17: Build the Rolling Buffer Logic (Backend)**
  - **Context:** We only want to send the *recent* context to the AI, not the entire hour-long meeting.
  - **Action Items:**
    - [ ] Accept WebSocket transcript chunks.
    - [ ] Maintain an array of the last ~300 words spoken.

---

## Phase 5: Real RTMS Integration (The Production Transcript)
*Goal: Replace the mocked WebSocket feed from Phase 4 with the actual live transcript data from Zoom.*

- [ ] **Task 18: Build the RTMS Webhook Handler**
  - **Context:** When the Host starts RTMS, Zoom sends a webhook to our backend to say "The stream is ready."
  - **Action Items:**
    - [ ] Build a `/api/rtms/webhook` route to receive the `meeting.rtms_started` event.
    - [ ] Extract the WebSocket connection URLs and session keys from the webhook payload.
- [ ] **Task 19: Build the RTMS Ingestion Service**
  - **Context:** A background process on our backend that maintains a persistent WebSocket connection to Zoom's servers to receive live chunked audio/text data as the participants speak.
  - **Action Items:**
    - [ ] Integrate the `@zoom/rtms` JS SDK into our backend.
    - [ ] Use the session keys from the webhook to connect to the Zoom WebSocket server.
    - [ ] Process incoming transcript chunks and funnel them into the rolling buffer from Task 17 (replacing the mock data feed).

---

## Phase 6: AI Prompts & Real Features
*Goal: Connect the fake transcript to LLMs to build the actual product features.*

**Feature A: Live Anchor (The Pinned Timeline) & Running Glossary**
- [ ] **Task 20: The AI Topic Endpoint (`/api/ai/topic-segment`)**
  - **Action Items:**
    - [ ] Build a route that takes the 300-word buffer.
    - [ ] Write the prompt: "Did the topic change? Summarize previous topic in 3 bullets. Extract definitions or formulas."
    - [ ] Parse the AI response into strict JSON.
- [ ] **Task 21: The Host Broadcast Logic**
  - **Action Items:**
    - [ ] Host App: Call the AI endpoint every 2 minutes or when a pause is detected via `zoomSdk.onActiveSpeakerChange()`.
    - [ ] Host App: If the AI says the topic changed, use `postMessage` to broadcast `TOPIC_UPDATE` to all students.
- [ ] **Task 22: The Student Timeline & Glossary UI (Enhancement 3)**
  - **Action Items:**
    - [ ] Build a React component for a "Topic Card". Sliding animation for older cards.
    - [ ] Listen for `GLOSSARY_UPDATE` messages broadcasted by the Host.
    - [ ] Build a separate searchable "Glossary / Formula Sheet" tab that accumulates terms dynamically during the lecture.

**Feature B: Warm-Up Arena (Pre-class Trivia)**
- [ ] **Task 23: The AI Quiz Endpoint (`/api/ai/quiz-generate`)**
  - **Action Items:**
    - [ ] Write a prompt that takes previous class transcripts and generates 5 multiple choice questions.
- [ ] **Task 24: Trivia Game UI & Logic**
  - **Action Items:**
    - [ ] Host UI: A "Start Game" button that fetches questions.
    - [ ] Student UI: A clean, large countdown timer.
    - [ ] Logic: Host computes scores as students reply with `ARENA_ANSWER` messages, and broadcasts a Top 3 Leaderboard.

**Feature C: Professor's Pulse (Check-in Polls)**
- [ ] **Task 25: Poll Generation UI (Host)**
  - **Action Items:**
    - [ ] Build a dashboard for the host to click "Generate Question", with an optional context input text box.
    - [ ] Add an editable preview screen allowing the host to edit the question text and options before broadcasting.
- [ ] **Task 26: Poll Display & Results UI (Student & Host)**
  - **Action Items:**
    - [ ] Student UI: A modal overlay that appears when Host launches `POLL_START`.
    - [ ] Send `POLL_RESPONSE` answers back.
    - [ ] Host UI: Aggregate scores and broadcast `POLL_RESULTS` bar chart to everyone.

**Feature D: Recovery Agent (Post-Class) & Enhancements**
- [ ] **Task 27: The Manual Bookmark Button**
  - **Action Items:**
    - [ ] Add a `📌 I'm Confused` button to the Live Anchor UI saving the current timestamp to the DB.
- [ ] **Task 28: Auto-Bookmark on Professor Cues (Enhancement 2)**
  - **Context:** Automatically bookmark moments when the professor indicates importance.
  - **Action Items:**
    - [ ] Build `/api/ai/detect-cues` endpoint to scan transcript buffer for emphasis phrases (e.g., "This is critical").
    - [ ] When detected, trigger the Host app to secretly log bookmarks for all students.
- [ ] **Task 29: Smart Spotlight for Student Questions (Enhancement 4)**
  - **Context:** Emphasize students asking questions automatically.
  - **Action Items:**
    - [ ] Use `zoomSdk.onActiveSpeakerChange()` to detect when a Student unmutes and speaks.
    - [ ] Host App Action: Call `zoomSdk.addParticipantSpotlight(studentID)` automatically.
    - [ ] Host App Action: Automatically annotate the Live Anchor timeline with "Student Question at [Time]".
    - [ ] Host App Action: Auto-remove the spotlight when the Host resumes speaking using `zoomSdk.removeParticipantSpotlights()`.
- [ ] **Task 30: The AI Recovery Endpoint**
  - **Action Items:**
    - [ ] Prompt: "Explain this transcript segment simply and provide a practice problem."
    - [ ] Endpoint runs this prompt for all bookmarks (manual + auto) after class.
- [ ] **Task 31: Post-Class Summary Card UI (Enhancement 5)**
  - **Context:** A final deliverable given to the student immediately after the Zoom call ends.
  - **Action Items:**
    - [ ] Detect `onRunningContextChange` transitioning from `inMeeting` to `inMainClient` (meeting ended).
    - [ ] Build a Summary Card UI summarizing key topics and links to the Glossary.
    - [ ] Display the personalized Recovery Pack generated in Task 30 on this card.
