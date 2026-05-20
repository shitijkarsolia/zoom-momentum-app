# Building Zoom Momentum: a real-time AI layer on top of live Zoom lectures

> **Draft.** Screenshots and a demo clip still to be added. Also to do before publishing: fill in the real "Try it" links (repo, product page, Marketplace listing).

## The problem

Virtual lectures are easy to attend and easy to tune out. Students sit muted with cameras off, professors talk into a wall of black rectangles, and nobody knows who is following along until the exam. The small signals that make an in-person room work, like a show of hands or a confused look or a quick question, just don't survive over video.

Momentum is an AI companion for virtual classes that tries to put those signals back. It installs once from the Zoom Marketplace, opens inside the meeting, and checks whether you are the host or a participant so it can show the right interface.

I built it during the Zoom Fellowship, and I picked the classroom problem on purpose. I wanted a project that would force me to wire real AI into a live product, not a toy with a chat box bolted on, and a live lecture is about as demanding as it gets: audio is streaming in, two sides of the call need different views of the same state, and the AI has to keep up without stalling the room. I started from Zoom's Arlo reference app to get the SDK basics working, then rebuilt around the features I actually wanted. Most of what follows is the part that reference apps skip.

## What it does

Four features, each aimed at a different moment in a class.

### Professor's Pulse

A check-in poll the professor can fire off at any point. They type a bit of context, AI drafts a multiple-choice question, they edit it if needed and launch. Students answer in an overlay and results come back as a live bar chart, so the professor gets a read on the room in seconds.

### Arena

A timed trivia game for review. AI generates questions from the lecture transcript, each with a countdown. Students score on correctness plus speed, and a leaderboard updates after every question.

### Live Anchor

The always-on one. Once the host starts it, Zoom's RTMS live transcription streams in and AI builds a running topic timeline: topic cards with bullet takeaways, a searchable glossary of technical terms, and a live transcript that highlights those terms. Students can read it in six languages.

### Recovery Pack

The after-class piece. Students bookmark confusing moments during the lecture (and AI auto-bookmarks when it detects emphasis cues). When class ends, each student gets a personalized pack: a plain-language explanation of each topic, a practice problem, and a resource to go deeper.

## How it is built

Momentum is a monorepo with three workspaces:

- **client** — React + Vite, role-based routing between the Host Dashboard and Student View
- **server** — Express + Prisma, the WebSocket relay, transcript pipeline, and AI endpoints
- **mock-transcript** — a dev utility that replays a real CS50 lecture so you can build without a live meeting

Host and student stay in sync over a WebSocket relay with sequence-numbered messages. The transcript pipeline ingests Zoom RTMS, and a tiered AI client fails over across providers so a single outage does not take the class down. The full engineering write-up, with architecture diagrams, is in [`../technical-deep-dive.md`](../technical-deep-dive.md).

## What I learned

Two problems taught me the most, and both were about identity and ordering rather than anything flashy.

The first was real-time sync. My instinct was that messaging between the host and students would be the easy part and the AI would be the hard part. It was the other way around. Once messages cross a flaky classroom connection, "send a poll and show the results" stops being one step and becomes a question of what happens when packets arrive late, twice, or out of order. The sequence-numbered envelope and the relay-through-the-server model came out of watching state flicker and chasing down why. The lesson that stuck: in a distributed UI, decide up front how state converges, because every feature you add afterward inherits that decision.

The second was the RTMS UUID bug. I lost a full day to a transcript that was silently empty, with no error anywhere, because the Zoom SDK and the RTMS webhook refer to the same meeting by two different identifiers. Nothing in the docs warned me, and nothing in the logs pointed at it. Once I understood it, the fix was small. Getting there meant adding logging at every hop until the two IDs sat side by side and the mismatch was obvious. The lesson: when a system spans two services that are supposed to agree on an identifier, verify that they actually do before you trust anything downstream of it.

If I kept building, the clearest next step is the Live Anchor loop. It polls the transcript buffer every ten seconds, which is simple and predictable and was the right call for shipping. But the data is genuinely a stream, and an event-driven version that reacts as transcript arrives would feel sharper and waste fewer cycles. I chose the boring, working version on purpose. I just know where the seam is.

## Try it

The code is open source, and if you want the full engineering breakdown — the architecture, the transcript pipeline, the AI failover, and how it all runs on one EC2 box — it is in the [technical deep-dive](../technical-deep-dive.md). <!-- TODO: add the actual links once they exist — repo URL, the live product page, and the Zoom Marketplace listing if/when it's published. -->

---

*Built as part of the Zoom Fellowship at ASU Next Lab.*
