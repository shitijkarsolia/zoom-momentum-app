# Requirements Document

## Introduction

Zoom Momentum is an engagement ecosystem for virtual education built on the Zoom Apps SDK. The system transforms passive virtual learning into active participation through three integrated features: a gamified waiting room experience (Warm-Up Arena), a private self-assessment tool (Self-Check), and an automated engagement monitoring system (Professor's Pulse).

This project follows a 4-week sprint timeline with clear weekly milestones. Tasks are organized by week rather than by role to ensure focused, incremental delivery.

## Glossary

- **Zoom_App**: The React.js application running within the Zoom client using the Zoom Apps SDK
- **Waiting_Room_Context**: The Zoom Apps SDK context (`waitingRoom`) where students wait before a meeting starts
- **Side_Panel_Context**: The Zoom Apps SDK context (`sidePanel`) displayed alongside the main meeting view
- **Shared_State_API**: Zoom Apps API for synchronizing state across all participants in a meeting
- **Transcript_Buffer**: A rolling FIFO buffer storing the last ~5 minutes (~300 words) of live meeting transcript
- **AI_Companion_API**: Zoom's AI API (or OpenAI fallback) used for generating quiz questions and polls
- **Engagement_Algorithm**: Logic that monitors chat velocity, audio activity, and screen share status to detect low engagement
- **Quiz_Generator**: Component that creates multiple choice questions from transcript text using AI
- **Leaderboard**: Ranked display of top-scoring participants in the Warm-Up Arena
- **Privacy_Lock**: Client-side storage mechanism ensuring student quiz results never leave the browser
- **Warm_Up_Arena**: The multiplayer trivia game displayed in the waiting room context
- **Self_Check**: The private quiz feature for students in the side panel
- **Professor_Pulse**: The engagement monitoring and alert system for hosts

## Requirements

### Requirement 1: Week 1 - Project Infrastructure Setup

**User Story:** As a developer, I want a properly configured Zoom App project with working contexts, so that I can build features on a solid foundation.

**Week 1 Goal:** "Hello World" in two contexts (waitingRoom and sidePanel) with shared state foundation.

#### Acceptance Criteria

1. THE Zoom_App SHALL be initialized as a React.js application with Node.js/Express backend
2. THE Zoom_App manifest SHALL configure both `waitingRoom` and `sidePanel` contexts
3. THE Zoom_App SHALL establish connection to the Zoom Apps SDK on initialization
4. WHEN the Zoom_App loads in waitingRoom context, THE Zoom_App SHALL render a basic UI component
5. WHEN the Zoom_App loads in sidePanel context, THE Zoom_App SHALL render a basic UI component
6. THE Zoom_App SHALL implement environment configuration for development and production modes

### Requirement 2: Week 1 - Shared State Foundation

**User Story:** As a developer, I want reliable state synchronization across all participants, so that multiplayer experiences feel simultaneous.

**Week 1 Goal:** Basic shared state working with timer synchronization proof-of-concept.

#### Acceptance Criteria

1. WHEN the Zoom_App initializes in any context, THE Shared_State_API SHALL establish a connection for real-time sync
2. WHEN state changes occur, THE Shared_State_API SHALL propagate updates to all connected participants within 100ms
3. THE Zoom_App SHALL implement a shared timer mechanism that displays identical countdown values across all clients
4. IF the Shared_State_API connection fails, THEN THE Zoom_App SHALL attempt reconnection with exponential backoff
5. WHEN a participant joins mid-session, THE Zoom_App SHALL sync them to the current shared state immediately

### Requirement 3: Week 2 - AI Integration and Quiz Generation

**User Story:** As a system, I want to generate contextually relevant quiz questions using AI, so that students engage with meaningful content.

**Week 2 Goal:** Content generation works (even with mock text).

#### Acceptance Criteria

1. THE Quiz_Generator SHALL connect to the AI_Companion_API (with OpenAI fallback for development)
2. WHEN generating questions, THE Quiz_Generator SHALL send a prompt requesting 3 multiple choice questions in JSON format
3. THE Quiz_Generator SHALL parse AI responses into a structured question format with question text, options array, and correct answer index
4. THE Quiz_Generator SHALL produce questions with appropriate difficulty (not too hard, not too easy)
5. IF the AI_Companion_API times out after 5 seconds, THEN THE Quiz_Generator SHALL fall back to pre-defined generic questions
6. THE Quiz_Generator SHALL validate AI responses and reject malformed JSON

### Requirement 4: Week 2 - Quiz UI Component

**User Story:** As a student, I want to interact with quiz questions through a clear interface, so that I can answer and receive feedback.

**Week 2 Goal:** Quiz UI component renders questions and handles answer selection.

#### Acceptance Criteria

1. THE Quiz_UI SHALL display one question at a time with all answer options visible
2. WHEN a student selects an answer, THE Quiz_UI SHALL highlight the selected option
3. WHEN a student submits an answer, THE Quiz_UI SHALL display immediate correct/incorrect feedback
4. WHEN an answer is correct, THE Quiz_UI SHALL display a green indicator and celebratory visual
5. WHEN an answer is incorrect, THE Quiz_UI SHALL display a red indicator and show the correct answer
6. THE Quiz_UI SHALL provide a "Next Question" button to advance through the quiz

### Requirement 5: Week 2 - Transcript Buffer Pipeline

**User Story:** As a developer, I want a reliable transcript buffer, so that AI-generated content is always relevant to the current lecture.

**Week 2 Goal:** Transcript capture working and feeding into quiz generation.

#### Acceptance Criteria

1. THE Transcript_Buffer SHALL subscribe to `zoomSdk.onTranscriptUpdate` events
2. THE Transcript_Buffer SHALL maintain a rolling FIFO buffer of approximately 5 minutes of transcript text
3. WHEN the buffer exceeds 300 words, THE Transcript_Buffer SHALL remove the oldest content first
4. THE Transcript_Buffer SHALL provide the last 300 words on demand for quiz generation
5. IF transcript updates stop for more than 30 seconds, THEN THE Transcript_Buffer SHALL retain existing content without clearing
6. THE Transcript_Buffer SHALL expose a method to retrieve current buffer contents as a string

### Requirement 6: Week 3 - Warm-Up Arena Complete Flow

**User Story:** As a student, I want an engaging trivia game while waiting for class to start, so that I enter the lecture energized and connected with classmates.

**Week 3 Goal:** Full Warm-Up Arena flow working end-to-end.

#### Acceptance Criteria

1. WHEN a student enters the waiting room, THE Warm_Up_Arena SHALL activate and display the trivia interface
2. THE Warm_Up_Arena SHALL display synchronized trivia questions to all waiting participants simultaneously using Shared_State_API
3. THE Warm_Up_Arena SHALL support two question types: Icebreaker (social) and Recall (previous lecture content)
4. WHEN a student submits an answer, THE Warm_Up_Arena SHALL update their score in the shared leaderboard
5. THE Warm_Up_Arena SHALL maintain and display a real-time leaderboard ranking participants by score
6. WHEN the host starts the meeting, THE Warm_Up_Arena SHALL transition to the sidePanel context
7. WHEN transitioning to sidePanel, THE Zoom_App SHALL display the Top 3 Leaderboard for 10 seconds with Gold/Silver/Bronze icons

### Requirement 7: Week 3 - Self-Check Private Quiz

**User Story:** As a student, I want to privately test my understanding during class, so that I can catch up without embarrassment if I'm confused.

**Week 3 Goal:** Self-Check feature working with privacy controls in place.

#### Acceptance Criteria

1. THE Self_Check feature SHALL be accessible via a "Quiz Me" button with a visible Lock Icon (🔒) in the sidePanel
2. WHEN a student clicks "Quiz Me", THE Self_Check SHALL capture the last 300 words from the Transcript_Buffer
3. THE Self_Check SHALL send captured text to the Quiz_Generator and display 3 multiple choice questions
4. WHEN a student answers a question, THE Self_Check SHALL show immediate correct/incorrect feedback
5. THE Self_Check SHALL store all quiz results exclusively in browser localStorage (Privacy_Lock)
6. THE Self_Check SHALL NEVER transmit student quiz results to the host or any external server
7. THE Self_Check UI SHALL include visual privacy indicators (padlock icon, muted grey colors) to reassure students

### Requirement 8: Week 3 - Professor's Pulse Engagement Monitoring

**User Story:** As a professor, I want automated engagement alerts, so that I can intervene when students are disengaging without manual monitoring.

**Week 3 Goal:** Engagement monitoring and alert system working.

#### Acceptance Criteria

1. THE Engagement_Algorithm SHALL monitor chat velocity (messages per minute) via Zoom SDK chat events
2. THE Engagement_Algorithm SHALL monitor audio activity (host speaking, participant unmutes) via Zoom SDK audio events
3. THE Engagement_Algorithm SHALL monitor screen share status via Zoom SDK share events
4. WHEN chat_messages equals 0 for more than 10 minutes AND host_audio is continuous, THE Engagement_Algorithm SHALL trigger an engagement alert
5. WHEN engagement is low, THE Professor_Pulse SHALL display a non-intrusive toast notification to the host
6. THE toast notification SHALL display the message "Engagement is low. Launch a Check-In?" with a "Launch" button
7. WHEN the professor clicks "Launch", THE Professor_Pulse SHALL generate an AI poll based on current transcript and deploy to participants

### Requirement 9: Week 4 - UI Polish and Animations

**User Story:** As a user, I want a polished and engaging visual experience, so that the app feels professional and trustworthy.

**Week 4 Goal:** Presentation-ready UI with animations and visual polish.

#### Acceptance Criteria

1. THE Warm_Up_Arena UI SHALL use high-energy colors (Zoom Blue #0B5CFF with bright accents) and large bold typography
2. THE Leaderboard SHALL display animated Gold, Silver, and Bronze icons for top 3 positions
3. WHEN a student answers correctly, THE UI SHALL display celebratory confetti animation
4. THE Side_Panel UI SHALL use a clean, minimal "study tool" aesthetic with consistent spacing
5. THE Self_Check UI SHALL include prominent privacy indicators with padlock icons and grey backgrounds
6. THE Professor_Pulse notifications SHALL use standard toast styling that slides in from the top-right
7. THE Zoom_App SHALL include smooth transitions between contexts (waitingRoom to sidePanel)

### Requirement 10: Week 4 - Error Handling and Resilience

**User Story:** As a user, I want the app to handle errors gracefully, so that my experience isn't disrupted by technical issues.

**Week 4 Goal:** Robust error handling for all failure scenarios.

#### Acceptance Criteria

1. IF the AI_Companion_API is unavailable, THEN THE Zoom_App SHALL fall back to cached or generic questions
2. IF the Shared_State_API disconnects, THEN THE Zoom_App SHALL display a "Reconnecting..." indicator and retry with exponential backoff
3. IF transcript capture fails, THEN THE Self_Check SHALL display a message "Transcript unavailable. Try again in a moment."
4. THE Zoom_App SHALL log errors to console for debugging without exposing technical details to users
5. THE Zoom_App SHALL maintain core functionality in degraded mode when non-critical services fail
6. IF poll deployment fails, THEN THE Professor_Pulse SHALL display an error message with a "Retry" option

### Requirement 11: Privacy and Compliance

**User Story:** As a student, I want assurance that my quiz performance is private, so that I feel safe using the self-check feature.

**Week 4 Goal:** Privacy compliance verified and documented.

#### Acceptance Criteria

1. THE Zoom_App SHALL NOT implement facial recognition or camera stream analysis
2. THE Zoom_App SHALL NOT implement gaze tracking or eye movement detection
3. THE Self_Check SHALL store quiz results exclusively in client-side localStorage
4. THE Zoom_App SHALL NOT transmit student quiz scores over WebSocket or any network connection to the host
5. THE Engagement_Algorithm SHALL rely strictly on system metadata (chat, audio, screen share status)
6. THE Zoom_App SHALL display a privacy notice explaining data handling on first use

### Requirement 12: Demo and Documentation

**User Story:** As a stakeholder, I want a recorded demo showing the complete flow, so that I can evaluate the project's success.

**Week 4 Goal:** Deliverable demo video and documentation complete.

#### Acceptance Criteria

1. THE Demo SHALL show the complete flow from Waiting Room trivia to Class to Self-Check
2. THE Demo SHALL demonstrate the Professor's Pulse engagement alert and one-click poll deployment
3. THE Demo SHALL highlight privacy features with visible lock icons and local storage demonstration
4. THE Documentation SHALL include setup instructions for running the app locally
5. THE Documentation SHALL include the JSON schema for AI input/output formats
