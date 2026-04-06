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
  error: string | null;
}

const SDK_CAPABILITIES = [
  'connect',
  'postMessage',
  'onConnect',
  'onMessage',
  'getUserContext',
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
] as const;

export function useZoomSdk(): ZoomContext {
  const [context, setContext] = useState<ZoomContext>({
    isHost: false,
    userName: '',
    participantId: '',
    meetingId: '',
    runningContext: '',
    isConfigured: false,
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

      // configResponse may contain meetingUUID at runtime even if not in the TS type
      const meetingUUID = (configResponse as any).meetingUUID ?? '';

      setContext({
        isHost: userContext.role === 'host' || userContext.role === 'coHost',
        userName: userContext.screenName ?? '',
        participantId: userContext.participantUUID ?? '',
        meetingId: meetingUUID,
        runningContext: configResponse.runningContext ?? 'inMeeting',
        isConfigured: true,
        error: null,
      });
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
