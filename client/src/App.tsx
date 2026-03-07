import { useCallback, useRef, useEffect } from 'react';
import { useZoomSdk } from './hooks/useZoomSdk';
import { useZoomAuth } from './hooks/useZoomAuth';
import { useMessaging } from './hooks/useMessaging';
import { usePulseHost, usePulseStudent } from './hooks/usePulse';
import { AuthView } from './views/AuthView';
import { HostDashboard } from './views/HostDashboard';
import { StudentView } from './views/StudentView';
import type { AppMessage, Poll } from './types/messages';

export default function App() {
  const zoom = useZoomSdk();
  const auth = useZoomAuth();

  // Stable ref-based handler so useMessaging doesn't re-subscribe
  const messageRouterRef = useRef<(msg: AppMessage) => void>(() => {});

  const handleMessage = useCallback((message: AppMessage) => {
    messageRouterRef.current(message);
  }, []);

  const messaging = useMessaging({
    isHost: zoom.isHost,
    participantId: zoom.participantId,
    onMessage: handleMessage,
  });

  const pulseHost = usePulseHost({ broadcast: messaging.broadcast });
  const pulseStudent = usePulseStudent({ send: messaging.send });

  // Update the message router when handlers change
  useEffect(() => {
    messageRouterRef.current = (message: AppMessage) => {
      if (zoom.isHost) {
        if (message.type === 'POLL_RESPONSE') {
          const payload = message.payload as { pollId: string; optionIndex: number };
          pulseHost.handleResponse(message.senderId, payload.optionIndex);
        }
      } else {
        if (message.type === 'POLL_START') {
          pulseStudent.handlePollStart(message.payload as Poll);
        } else if (message.type === 'POLL_RESULTS') {
          pulseStudent.handlePollResults(message.payload as Poll);
        }
      }
      console.log('[App] received message:', message.type, message);
    };
  }, [zoom.isHost, pulseHost.handleResponse, pulseStudent.handlePollStart, pulseStudent.handlePollResults]);

  // Loading state while SDK configures
  if (!zoom.isConfigured && !zoom.error) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading">Initializing Zoom SDK…</div>
      </div>
    );
  }

  // SDK error
  if (zoom.error) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 320 }}>
          <p style={{ color: 'var(--zoom-error)' }}>SDK Error: {zoom.error}</p>
          <p style={{ color: 'var(--zoom-text-secondary)', fontSize: 12, marginTop: 8 }}>
            Make sure you're running this inside a Zoom meeting.
          </p>
        </div>
      </div>
    );
  }

  // Auth required
  if (!auth.isAuthenticated) {
    return <AuthView onLogin={auth.login} isLoading={auth.isLoading} error={auth.error} />;
  }

  // Route based on role
  if (zoom.isHost) {
    return (
      <HostDashboard
        userName={zoom.userName}
        connected={messaging.connected}
        pulsePhase={pulseHost.phase}
        pulseDraft={pulseHost.draft}
        pulseResponseCount={pulseHost.responseCount}
        pulseActivePoll={pulseHost.activePoll}
        pulseError={pulseHost.error}
        onPulseGenerate={pulseHost.generatePoll}
        onPulseUpdateDraft={pulseHost.updateDraft}
        onPulseLaunch={pulseHost.launchPoll}
        onPulseEndPoll={pulseHost.endPoll}
        onPulseReset={pulseHost.resetPoll}
      />
    );
  }

  return (
    <StudentView
      userName={zoom.userName}
      connected={messaging.connected}
      activePoll={pulseStudent.activePoll}
      selectedOption={pulseStudent.selectedOption}
      hasAnswered={pulseStudent.hasAnswered}
      pollResults={pulseStudent.results}
      onSelectOption={pulseStudent.selectOption}
      onSubmitAnswer={pulseStudent.submitAnswer}
    />
  );
}
