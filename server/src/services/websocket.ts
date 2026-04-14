import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { IncomingMessage, ServerResponse } from 'http';
import type { RequestHandler } from 'express';
import { prisma } from '../db.js';

interface ClientSocket extends WebSocket {
  meetingId?: string;
  role?: string;
  participantId?: string;
  isAlive?: boolean;
}

// Room management: meetingId → Set of connected sockets
const rooms = new Map<string, Set<ClientSocket>>();

function addToRoom(meetingId: string, ws: ClientSocket) {
  if (!rooms.has(meetingId)) {
    rooms.set(meetingId, new Set());
  }
  rooms.get(meetingId)!.add(ws);
  console.log(`[ws] Client joined room ${meetingId} (${rooms.get(meetingId)!.size} clients)`);
}

function removeFromRoom(ws: ClientSocket) {
  if (!ws.meetingId) return;
  const room = rooms.get(ws.meetingId);
  if (room) {
    room.delete(ws);
    console.log(`[ws] Client left room ${ws.meetingId} (${room.size} clients)`);
    if (room.size === 0) {
      rooms.delete(ws.meetingId);
    }
  }
}

function relayToRoom(senderWs: ClientSocket, message: string) {
  if (!senderWs.meetingId) return;
  const room = rooms.get(senderWs.meetingId);
  if (!room) return;

  let relayed = 0;
  for (const client of room) {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(message);
      relayed++;
    }
  }
  return relayed;
}

function broadcastToRoom(meetingId: string, message: string) {
  const room = rooms.get(meetingId);
  if (!room) return;
  for (const client of room) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

export function initWebSocketServer(server: Server, sessionParser: RequestHandler) {
  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 64 * 1024 });

  // Per-client rate limiting: max 20 messages per second
  const rateLimits = new Map<ClientSocket, { count: number; resetTime: number }>();

  // Heartbeat: ping every 30s, terminate dead connections
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients as Set<ClientSocket>) {
      if (ws.isAlive === false) {
        removeFromRoom(ws);
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30_000);

  wss.on('close', () => clearInterval(heartbeat));

  wss.on('connection', async (ws: ClientSocket, req: IncomingMessage) => {
    // Parse session from cookie to validate the connection
    const res = {} as ServerResponse;
    await new Promise<void>((resolve) => {
      sessionParser(req as any, res as any, () => resolve());
    });
    const sess = (req as any).session;

    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const meetingId = url.searchParams.get('meetingId') ?? '';
    const role = url.searchParams.get('role') ?? 'student';
    const participantId = url.searchParams.get('participantId') ?? '';

    // Reject connections without a meetingId
    if (!meetingId) {
      console.warn('[ws] Rejected connection: no meetingId');
      ws.close(1008, 'meetingId required');
      return;
    }

    // Validate meetingId: must be a known mock ID or exist in the database
    const isMock = meetingId === 'mock-meeting-001';
    if (!isMock) {
      try {
        const meeting = await prisma.meeting.findFirst({
          where: { OR: [{ id: meetingId }, { zoomMeetingId: meetingId }] },
          select: { id: true },
        });
        if (!meeting) {
          console.warn(`[ws] Rejected connection: unknown meetingId ${meetingId}`);
          ws.close(1008, 'Unknown meeting');
          return;
        }
      } catch {
        // DB check failed — allow connection (don't block on transient DB errors)
      }
    }

    // Log session status (auth is advisory for now — don't block unauthenticated
    // users since OAuth is optional for students)
    if (sess?.userId) {
      console.log(`[ws] Authenticated session: userId=${sess.userId}`);
    } else {
      console.log(`[ws] Unauthenticated connection (session exists: ${!!sess})`);
    }

    ws.meetingId = meetingId;
    ws.role = role;
    ws.participantId = participantId;
    ws.isAlive = true;

    if (meetingId) {
      addToRoom(meetingId, ws);

      // Notify others in the room about the new participant
      broadcastToRoom(meetingId, JSON.stringify({
        type: 'PARTICIPANT_JOINED',
        payload: { participantId, role },
        seq: 0,
        timestamp: Date.now(),
        senderId: 'server',
        senderRole: 'server',
      }));
    }

    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', (data) => {
      // Rate limiting
      const now = Date.now();
      const limit = rateLimits.get(ws) ?? { count: 0, resetTime: now + 1000 };
      if (now > limit.resetTime) {
        limit.count = 0;
        limit.resetTime = now + 1000;
      }
      if (++limit.count > 20) {
        console.warn(`[ws] Rate limit exceeded for ${ws.participantId}`);
        return;
      }
      rateLimits.set(ws, limit);

      try {
        const raw = data.toString();
        const relayed = relayToRoom(ws, raw);
        const parsed = JSON.parse(raw);
        console.log(`[ws] ${ws.role}→room(${ws.meetingId}): ${parsed.type} (relayed to ${relayed} clients)`);
      } catch (err) {
        console.error('[ws] Failed to relay message:', err);
      }
    });

    ws.on('close', () => {
      removeFromRoom(ws);
    });

    ws.on('error', (err) => {
      console.error('[ws] Socket error:', err);
      removeFromRoom(ws);
    });

    console.log(`[ws] New connection: role=${role}, meetingId=${meetingId}, participantId=${participantId}`);
  });

  console.log('[ws] WebSocket server initialized on /ws');
  return wss;
}
