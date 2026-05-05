#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "=== Stopping existing processes ==="
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:4040 | xargs kill -9 2>/dev/null || true
pkill -f mock-transcript 2>/dev/null || true
sleep 1

echo "=== Building client ==="
npm run build -w client

echo "=== Starting server ==="
npm run dev -w server > /tmp/server.log 2>&1 &
sleep 2
if lsof -ti:3001 > /dev/null 2>&1; then
  echo "  Server running on http://localhost:3001"
else
  echo "  ERROR: Server failed to start. Check /tmp/server.log"
  exit 1
fi

echo "=== Starting ngrok ==="
ngrok http 3001 --url=your-tunnel.ngrok-free.dev > /tmp/ngrok.log 2>&1 &
sleep 4
if lsof -ti:4040 > /dev/null 2>&1; then
  echo "  ngrok running at https://your-tunnel.ngrok-free.dev"
else
  echo "  ERROR: ngrok failed to start. Check /tmp/ngrok.log"
  exit 1
fi

if [ "$1" = "--mock" ]; then
  echo "=== Starting mock transcript ==="
  npm run dev -w mock-transcript > /tmp/mock.log 2>&1 &
  sleep 3
  echo "  Mock transcript running (CS50 chunks every 3s)"
fi

echo ""
echo "=== Ready ==="
echo "  Server:  http://localhost:3001"
echo "  ngrok:   https://your-tunnel.ngrok-free.dev"
echo "  Logs:    /tmp/server.log, /tmp/ngrok.log"
[ "$1" = "--mock" ] && echo "  Mock:    /tmp/mock.log"
echo ""
echo "  To stop: lsof -ti:3001 | xargs kill -9; lsof -ti:4040 | xargs kill -9"
