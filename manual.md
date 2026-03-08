# Zoom Momentum -- Manual Setup Guide

Follow these steps to get the app running and testable inside a Zoom meeting.

---

## 1. Install Dependencies

```bash
npm install
```

This installs all three workspaces: `client`, `server`, and `mock-transcript`.

---

## 2. Run Prisma Migration

```bash
cd server && npx prisma migrate dev --name init && cd ..
```

This creates the SQLite database at `server/prisma/dev.db` with all required tables.

---

## 3. Fill In Environment Variables

Copy the template and fill in real values:

```bash
cp .env.example .env
cp .env server/.env
```

Required values in `.env`:

| Variable | Where to get it |
|---|---|
| `ZOOM_CLIENT_ID` | Zoom Marketplace -> your app -> App Credentials |
| `ZOOM_CLIENT_SECRET` | Zoom Marketplace -> your app -> App Credentials |
| `ZOOM_REDIRECT_URL` | `https://your-domain.example/api/auth/callback` |
| `SESSION_SECRET` | Any random string. Generate one: `openssl rand -hex 32` |
| `OPENAI_API_KEY` | Your AI provider API key |
| `OPENAI_BASE_URL` | `https://your-domain.example/v1` (or omit for OpenAI default) |
| `DATABASE_URL` | `file:./dev.db` (already set) |
| `PORT` | `3001` (already set) |
| `CLIENT_URL` | `http://localhost:5173` (already set) |

---

## 4. Zoom Marketplace App Configuration

The app is registered at [marketplace.zoom.us](https://marketplace.zoom.us) and deployed to EC2 at `your-domain.example`.

### OAuth Settings
- **Redirect URL:** `https://your-domain.example/api/auth/callback`
- **Allow List:** `your-domain.example`, `appssdk.zoom.us`

### Scopes
- `zoomapp:inmeeting` -- required for in-meeting side panel

### Surface Settings
- **Home URL:** `https://your-domain.example`
- **In-Meeting:** Enable side panel

### RTMS (Real-Time Media Streams)
RTMS access has been granted (1-year trial through Feb 2027). Configuration:
- **Webhook subscriptions:** `meeting.rtms_started` and `meeting.rtms_stopped` events
- **Webhook URL:** `https://your-domain.example/api/rtms/webhook`
- Transcript streaming scope enabled

### Zoom Client Requirement
- Host and app users must be on Zoom client **v6.5.5+** for RTMS to work

---

## 5. Start the Dev Server

```bash
# Client (port 5173) + Server (port 3001)
npm run dev

# With mock transcript feed (adds fake lecture data every 3s)
npm run dev:mock
```

---

## 6. Test in Zoom

1. Make sure the dev server is running (`npm run dev`)
2. Open a Zoom meeting
3. Go to **Apps** and find Zoom Momentum
4. The app loads in the side panel
5. As the meeting host, you see the **Host Dashboard**
6. Other participants see the **Student View**

### Testing with Mock Transcript
Run `npm run dev:mock` instead of `npm run dev`. This starts a mock transcript service that sends fake lecture chunks to the server every 3 seconds, simulating a live lecture without needing real RTMS.

---

## Troubleshooting

- **"Cannot find module" errors after clone:** Run `npm install` from the root.
- **Prisma errors:** Make sure `server/.env` has `DATABASE_URL=file:./dev.db` and run the migration.
- **OAuth redirect fails:** Check that `ZOOM_REDIRECT_URL` in `.env` matches exactly what is configured in Zoom Marketplace.
- **App doesn't load in Zoom:** Verify the Home URL in Marketplace matches `your-domain.example`. Check browser console for SDK errors.
- **CORS errors:** The Vite dev server proxies `/api/*` to `localhost:3001`. Make sure the server is running.
