import { useCallback } from 'react';
import { useZoomSdk } from './hooks/useZoomSdk';
import { useZoomAuth } from './hooks/useZoomAuth';
import { useMessaging } from './hooks/useMessaging';
import { AuthView } from './views/AuthView';
import { HostDashboard } from './views/HostDashboard';
import { StudentView } from './views/StudentView';
import type { AppMessage } from './types/messages';

export default function App() {
  const zoom = useZoomSdk();
  const auth = useZoomAuth();

  const handleMessage = useCallback((message: AppMessage) => {
    // Feature-specific message handling will be added here
    console.log('[App] received message:', message.type, message);
  }, []);

  const messaging = useMessaging({
    isHost: zoom.isHost,
    participantId: zoom.participantId,
    onMessage: handleMessage,
  });

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
    return <HostDashboard userName={zoom.userName} connected={messaging.connected} />;
  }

  return <StudentView userName={zoom.userName} connected={messaging.connected} />;
}
