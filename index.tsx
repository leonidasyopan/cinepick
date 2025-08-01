
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
