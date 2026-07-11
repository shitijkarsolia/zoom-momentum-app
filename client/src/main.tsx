import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PublicDemoApp from './PublicDemoApp';
import './index.css';

const params = new URLSearchParams(window.location.search);
const forceRealApp = params.get('app') === '1';
const forcePublicDemo = params.get('demo') === '1';
const isInsideZoom = navigator.userAgent.includes('ZoomApps') || params.has('zoomapp');
const RootApp = forcePublicDemo || (!forceRealApp && !isInsideZoom) ? PublicDemoApp : App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>,
);
