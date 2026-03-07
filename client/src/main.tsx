import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DevPreview } from './DevPreview';
import ProductPage from './ProductPage';
import './index.css';

const isInsideZoom = window.location.search.includes('zoomapp') ||
  navigator.userAgent.includes('ZoomApps');

const params = new URLSearchParams(window.location.search);
const forceDevPreview = params.get('dev') === '1';
const showProductPage = params.get('page') === 'product';

const RootComponent = showProductPage
  ? ProductPage
  : (forceDevPreview || !isInsideZoom) ? DevPreview : App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>,
);
