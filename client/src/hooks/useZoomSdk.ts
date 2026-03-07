import { useEffect, useState, useCallback } from 'react';
import zoomSdk from '@zoom/appssdk';

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
      const message = err instanceof Error ? err.message : 'Failed to configure Zoom SDK';
      setContext((prev) => ({ ...prev, error: message }));
    }
  }, []);

  useEffect(() => {
    configure();
  }, [configure]);

  return context;
}
