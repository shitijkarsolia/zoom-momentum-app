import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DevPreview } from './DevPreview';
import './index.css';

// Detect Zoom client: the SDK script sets window.zoomSdk when loaded inside Zoom
const isInsideZoom = !!(window as any).zoomSdk;

const params = new URLSearchParams(window.location.search);
const forceDevPreview = params.get('dev') === '1';

const RootComponent = (forceDevPreview || !isInsideZoom) ? DevPreview : App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>,
);
