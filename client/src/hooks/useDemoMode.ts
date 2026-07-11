const params = new URLSearchParams(window.location.search);
const forceRealApp = params.get('app') === '1';
const forceDemo = params.get('demo') === '1';
const isInsideZoom = !forceDemo && (
  navigator.userAgent.includes('ZoomApps') || params.has('zoomapp')
);

const DEMO_MODE = forceDemo || (!forceRealApp && !isInsideZoom);
const DEMO_MEETING_ID = 'mock-meeting-001';

export function useDemoMode() {
  return {
    isDemoMode: DEMO_MODE,
    isInZoom: isInsideZoom,
    meetingId: DEMO_MODE ? DEMO_MEETING_ID : '',
  };
}
