import { useEffect, useState, useCallback } from 'react';

// Use the global zoomSdk from the CDN script tag (sdk.js) which has the native bridge.
// The npm @zoom/appssdk package creates a separate instance without the bridge in ZoomWebKit.
// Falls back to undefined outside Zoom (DevPreview handles this via main.tsx routing).
const zoomSdk = (window as any).zoomSdk as any | undefined;

interface ZoomContext {
  isHost: boolean;
  userName: string;
  participantId: string;
  meetingId: string;
  runningContext: string;
  isConfigured: boolean;
  participantCount: number;
  error: string | null;
}

const SDK_CAPABILITIES = [
  'connect',
  'postMessage',
  'onConnect',
  'onMessage',
  'getUserContext',
  'getMeetingContext',
  'getMeetingUUID',
  'getMeetingParticipants',
  'onParticipantChange',
  'onActiveSpeakerChange',
  'onMeeting',
  'onRunningContextChange',
  'authorize',
  'onAuthorized',
  'promptAuthorize',
  'showNotification',
  'sendMessageToChat',
  'startRTMS',
  'stopRTMS',
  'getRTMSStatus',
  'onRTMSStatusChange',
] as const;

export function useZoomSdk(): ZoomContext {
  const [context, setContext] = useState<ZoomContext>({
    isHost: false,
    userName: '',
    participantId: '',
    meetingId: '',
    runningContext: '',
    isConfigured: false,
    participantCount: 0,
    error: null,
  });

  const configure = useCallback(async () => {
    if (!zoomSdk) {
      setContext((prev) => ({ ...prev, error: 'Zoom SDK not available (running outside Zoom)' }));
      return;
    }
    try {
      const configResponse = await zoomSdk.config({
        capabilities: [...SDK_CAPABILITIES],
        version: '0.16.0',
      });

      const userContext = await zoomSdk.getUserContext();

      // Get meeting ID — follow Arlo's pattern: getMeetingUUID first, then getMeetingContext
      // getMeetingUUID returns the same value for both host and attendee
      let meetingUUID = '';
      try {
        const uuidResponse = await zoomSdk.getMeetingUUID();
        console.log('[useZoomSdk] getMeetingUUID response:', JSON.stringify(uuidResponse));
        meetingUUID = uuidResponse?.meetingUUID ?? uuidResponse?.uuid ?? (typeof uuidResponse === 'string' ? uuidResponse : '');
      } catch (e) {
        console.log('[useZoomSdk] getMeetingUUID failed:', e);
      }

      if (!meetingUUID) {
        try {
          const meetingContext = await zoomSdk.getMeetingContext();
          console.log('[useZoomSdk] getMeetingContext response:', JSON.stringify(meetingContext));
          meetingUUID = meetingContext?.meetingUUID ?? meetingContext?.meetingID ?? '';
        } catch (e) {
          console.log('[useZoomSdk] getMeetingContext failed:', e);
        }
      }

      if (!meetingUUID) {
        meetingUUID = (configResponse as any).meetingUUID ?? '';
        console.log('[useZoomSdk] fallback to configResponse.meetingUUID:', meetingUUID);
      }
      console.log('[useZoomSdk] final meetingId:', meetingUUID, '| role:', userContext.role);

      // Get participant count (exclude the app's own participant entry)
      let participantCount = 0;
      try {
        const participants = await zoomSdk.getMeetingParticipants();
        const list = participants?.participants ?? [];
        participantCount = list.filter(
          (p: any) => p.participantUUID !== userContext.participantUUID
        ).length;
      } catch {
        // getMeetingParticipants may not be available
      }

      setContext({
        isHost: userContext.role === 'host' || userContext.role === 'coHost',
        userName: userContext.screenName ?? '',
        participantId: userContext.participantUUID ?? '',
        meetingId: meetingUUID,
        runningContext: configResponse.runningContext ?? 'inMeeting',
        isConfigured: true,
        participantCount,
        error: null,
      });

      // Listen for participant changes to keep count updated
      const ownUUID = userContext.participantUUID;
      try {
        zoomSdk.onParticipantChange(async () => {
          try {
            const updated = await zoomSdk.getMeetingParticipants();
            const list = updated?.participants ?? [];
            const count = list.filter(
              (p: any) => p.participantUUID !== ownUUID
            ).length;
            setContext(prev => ({ ...prev, participantCount: count }));
          } catch { /* ignore */ }
        });
      } catch { /* onParticipantChange may not be available */ }

    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Failed to configure Zoom SDK';
      const isAppNotSupport = /80004|app_not_support/i.test(rawMessage);
      const message = isAppNotSupport
        ? 'APP_NOT_SUPPORT: Your Marketplace app must be a Zoom App (In-Meeting App) with the In-Meeting side panel enabled. Meeting SDK and Video SDK app types cannot use the Zoom Apps SDK.'
        : rawMessage;
      setContext((prev) => ({ ...prev, error: message }));
    }
  }, []);

  useEffect(() => {
    configure();
  }, [configure]);

  return context;
}

/** Start RTMS transcript stream (only works inside Zoom) */
// Note: We use callZoomApi('startRTMS', options) instead of zoomSdk.startRTMS()
// because the direct method accepts no arguments — we need to pass transcriptOptions.
// This matches the Arlo reference app's pattern.
export async function startRTMS(): Promise<boolean> {
  if (!zoomSdk) return false;
  try {
    const result = await Promise.race([
      zoomSdk.callZoomApi('startRTMS', {
        audioOptions: { rawAudio: false },
        transcriptOptions: { caption: true },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
    ]);
    console.log('[useZoomSdk] RTMS started', result);
    return true;
  } catch (err: any) {
    if (err?.code === '10308' || err?.message === 'timeout') {
      console.log(`[useZoomSdk] RTMS ${err?.message === 'timeout' ? 'timed out (may already be running)' : 'already running'}`);
      return true;
    }
    console.error('[useZoomSdk] startRTMS failed:', err);
    return false;
  }
}

/** Stop RTMS transcript stream (only works inside Zoom) */
export async function stopRTMS(): Promise<boolean> {
  if (!zoomSdk) return false;
  try {
    await zoomSdk.callZoomApi('stopRTMS', {});
    console.log('[useZoomSdk] RTMS stopped');
    return true;
  } catch (err) {
    console.error('[useZoomSdk] stopRTMS failed:', err);
    return false;
  }
}
