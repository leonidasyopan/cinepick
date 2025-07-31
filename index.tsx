import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './src/i18n/i18n';
import { AuthProvider } from './features/auth/AuthContext';
import { TrendingMoviesProvider } from './features/trending/TrendingMoviesContext';
import { HistoryProvider } from './features/history/HistoryContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nProvider>
      <AuthProvider>
        <HistoryProvider>
          <TrendingMoviesProvider>
            <App />
          </TrendingMoviesProvider>
        </HistoryProvider>
      </AuthProvider>
    </I18nProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Construct the full URL to the service worker to avoid cross-origin issues
    // in complex hosting environments. The script must be on the same origin.
    const swUrl = `${window.location.origin}/sw.js`;
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}