# Zoom Momentum

Transform passive virtual classrooms into active learning environments.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Fill in your Zoom credentials, OpenAI key, and session secret

# 3. Initialize the database
npm run db:migrate -w server

# 4. Start development servers (frontend + backend)
npm run dev

# 5. (Optional) Start mock transcript service
npm run dev:mock
```

## Project Structure

```
zoom-momentum/
  client/                     # React frontend (Zoom App)
    src/
      App.tsx                 # SDK init + role-based routing
      hooks/
        useZoomSdk.ts         # SDK config + context detection
        useZoomAuth.ts        # In-client OAuth PKCE flow
        useMessaging.ts       # connect/sendMessage/onMessage + seq numbers
      views/
        HostDashboard.tsx     # Host: Pulse + Arena + Anchor tabs
        StudentView.tsx       # Student: Timeline + Glossary tabs
        AuthView.tsx          # OAuth login screen
      types/
        messages.ts           # Message protocol + state types

  server/                     # Express backend
    src/
      server.ts               # Express app + middleware
      config.ts               # Env var validation
      routes/
        auth.ts               # Zoom OAuth PKCE
        ai.ts                 # AI proxy routes (stubs)
        transcript.ts         # Transcript storage + buffer
        bookmarks.ts          # Bookmark CRUD
    prisma/
      schema.prisma           # Database schema

  mock-transcript/            # Mock transcript service (dev)
    src/
      index.ts                # Simulates RTMS transcript chunks
```

## Development

- Frontend runs on `http://localhost:5173` (Vite)
- Backend runs on `http://localhost:3001` (Express)
- Frontend proxies `/api/*` requests to the backend

### ngrok Setup

Zoom requires HTTPS for OAuth and webhooks:

```bash
ngrok http 3001 --domain your-domain.ngrok-free.app
```

Update your Zoom Marketplace app settings:
- Home URL: `https://your-domain.ngrok-free.app`
- Redirect URL: `https://your-domain.ngrok-free.app/api/auth/callback`
- Webhook URL: `https://your-domain.ngrok-free.app/api/rtms/webhook`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + @zoom/appssdk |
| Backend | Express + TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma |
| AI | OpenAI API (gpt-4o-mini) |
| Tunnel | ngrok |
