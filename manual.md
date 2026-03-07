# Zoom Momentum — Manual Setup Guide

Follow these steps to get the app running locally and testable inside a Zoom meeting.

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

This creates the SQLite database at `server/dev.db` with all required tables.

Note: `server/.env` must contain `DATABASE_URL=file:./dev.db` for Prisma CLI to work. This file should already exist.

---

## 3. Fill In Environment Variables

Copy the template and fill in real values:

```bash
cp .env.example .env
```

Required values in `.env`:

| Variable | Where to get it |
|---|---|
| `ZOOM_CLIENT_ID` | Zoom Marketplace → your app → App Credentials |
| `ZOOM_CLIENT_SECRET` | Zoom Marketplace → your app → App Credentials |
| `ZOOM_REDIRECT_URL` | `https://<your-ngrok-domain>.ngrok-free.app/api/auth/callback` |
| `SESSION_SECRET` | Any random string. Generate one: `openssl rand -hex 32` |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| `DATABASE_URL` | `file:./dev.db` (already set) |
| `PORT` | `3001` (already set) |
| `CLIENT_URL` | `http://localhost:5173` (already set) |
| `NGROK_DOMAIN` | Your ngrok static domain (e.g. `your-name.ngrok-free.app`) |

---

## 4. Set Up ngrok

ngrok tunnels your local server so Zoom can reach it.

```bash
ngrok http 3001
```

If you have a static ngrok domain:
```bash
ngrok http --domain=your-name.ngrok-free.app 3001
```

After starting ngrok, update `ZOOM_REDIRECT_URL` and `NGROK_DOMAIN` in `.env` with the ngrok URL.

---

## 5. Configure Zoom Marketplace App

Go to [marketplace.zoom.us](https://marketplace.zoom.us) and configure your app:

### OAuth Settings
- **Redirect URL:** `https://<your-ngrok-domain>.ngrok-free.app/api/auth/callback`
- **Allow List:** Add your ngrok domain

### Scopes
- `zoomapp:inmeeting` — required for in-meeting side panel

### Surface Settings
- **Home URL:** `https://<your-ngrok-domain>.ngrok-free.app`
- **In-Meeting:** Enable side panel

### RTMS (Real-Time Media Streams)
RTMS access has been granted to the developer account. Configure:
- **Webhook subscriptions:** Add `meeting.rtms_started` and `meeting.rtms_stopped` events
- **Webhook URL:** `https://<your-ngrok-domain>.ngrok-free.app/api/rtms/webhook`
- Ensure transcript streaming scope is enabled on the account

### Zoom Client Requirement
- Host and app users must be on Zoom client **v6.5.5+** for RTMS to work

---

## 6. Start the Dev Server

```bash
# Client (port 5173) + Server (port 3001)
npm run dev

# With mock transcript feed (adds fake lecture data every 3s)
npm run dev:mock
```

Other commands:
```bash
npm run dev:client   # Just the frontend
npm run dev:server   # Just the backend
```

---

## 7. Test in Zoom

1. Make sure ngrok is running (`ngrok http 3001`)
2. Make sure dev server is running (`npm run dev`)
3. Open a Zoom meeting
4. Go to **Apps** → find your app → open it
5. The app loads in the side panel
6. As the meeting host, you'll see the **Host Dashboard**
7. Other participants see the **Student View**

### Testing with Mock Transcript
Run `npm run dev:mock` instead of `npm run dev`. This starts a mock transcript service that sends fake lecture chunks to the server every 3 seconds, simulating a live lecture without needing real RTMS.

---

## Troubleshooting

- **"Cannot find module" errors after clone:** Run `npm install` from the root.
- **Prisma errors:** Make sure `server/.env` has `DATABASE_URL=file:./dev.db` and run the migration.
- **OAuth redirect fails:** Check that `ZOOM_REDIRECT_URL` in `.env` matches exactly what's configured in Zoom Marketplace.
- **App doesn't load in Zoom:** Verify the Home URL in Marketplace matches your ngrok domain. Check browser console for SDK errors.
- **CORS errors:** The Vite dev server proxies `/api/*` to `localhost:3001`. Make sure the server is running.
