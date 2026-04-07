import { useEffect, useCallback, useRef, useState } from 'react';
import type { AppMessage, AppState, MessageType } from '../types/messages';

const zoomSdk = (window as any).zoomSdk as any | undefined;

interface UseMessagingOptions {
  isHost: boolean;
  participantId: string;
  onMessage: (message: AppMessage) => void;
}

export function useMessaging({ isHost, participantId, onMessage }: UseMessagingOptions) {
  const [connected, setConnected] = useState(false);
  const seqRef = useRef(0);
  const stateRef = useRef<AppState | null>(null);
  const onMessageRef = useRef(onMessage);

  // Keep callback ref fresh without re-subscribing
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!zoomSdk) return;
    let mounted = true;

    const init = async () => {
      try {
        console.log('[useMessaging] calling connect()...');
        await zoomSdk.connect();
        console.log('[useMessaging] connected!');
        if (mounted) {
          setConnected(true);
        }

        // If student, request current state on connect
        if (!isHost) {
          const requestMsg: AppMessage = {
            type: 'REQUEST_STATE',
            payload: null,
            seq: 0,
            timestamp: Date.now(),
            senderId: participantId,
            senderRole: 'student',
          };
          await zoomSdk.postMessage({ payload: JSON.stringify(requestMsg) });
          console.log('[useMessaging] sent REQUEST_STATE');
        }
      } catch (err) {
        console.error('[useMessaging] connect failed:', err);
      }
    };

    // Listen for incoming messages
    try {
      zoomSdk.onMessage((message: any) => {
        try {
          const raw = typeof message.payload === 'string' ? message.payload : JSON.stringify(message.payload);
          const parsed: AppMessage = JSON.parse(raw);
          console.log('[useMessaging] received:', parsed.type);

          // Host auto-responds to state requests
          if (isHost && parsed.type === 'REQUEST_STATE' && stateRef.current) {
            const fullState: AppMessage = {
              type: 'FULL_STATE',
              payload: stateRef.current,
              seq: ++seqRef.current,
              timestamp: Date.now(),
              senderId: participantId,
              senderRole: 'host',
            };
            zoomSdk.postMessage({ payload: JSON.stringify(fullState) });
            console.log('[useMessaging] sent FULL_STATE');
            return;
          }

          onMessageRef.current(parsed);
        } catch (err) {
          console.error('[useMessaging] failed to parse message:', err);
        }
      });
      console.log('[useMessaging] onMessage listener registered');
    } catch (err) {
      console.error('[useMessaging] onMessage registration failed:', err);
    }

    // Host: detect new participants and auto-send state
    if (isHost) {
      try {
        zoomSdk.onParticipantChange(() => {
          console.log('[useMessaging] participant changed');
          if (stateRef.current) {
            const fullState: AppMessage = {
              type: 'FULL_STATE',
              payload: stateRef.current,
              seq: ++seqRef.current,
              timestamp: Date.now(),
              senderId: participantId,
              senderRole: 'host',
            };
            zoomSdk.postMessage({ payload: JSON.stringify(fullState) });
          }
        });
      } catch (err) {
        console.error('[useMessaging] onParticipantChange failed:', err);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [isHost, participantId]);

  // Send a message (used by students for answers/responses)
  const send = useCallback(
    (type: MessageType, payload: unknown) => {
      const msg: AppMessage = {
        type,
        payload,
        seq: 0, // students don't sequence
        timestamp: Date.now(),
        senderId: participantId,
        senderRole: isHost ? 'host' : 'student',
      };
      zoomSdk.postMessage({ payload: JSON.stringify(msg) });
    },
    [isHost, participantId],
  );

  // Host-only: broadcast with sequence number
  const broadcast = useCallback(
    (type: MessageType, payload: unknown) => {
      seqRef.current += 1;
      const msg: AppMessage = {
        type,
        payload,
        seq: seqRef.current,
        timestamp: Date.now(),
        senderId: participantId,
        senderRole: 'host',
      };
      zoomSdk.postMessage({ payload: JSON.stringify(msg) });
    },
    [participantId],
  );

  // Host: update canonical state reference
  const setState = useCallback((newState: AppState) => {
    stateRef.current = newState;
  }, []);

  return { connected, send, broadcast, setState };
}
