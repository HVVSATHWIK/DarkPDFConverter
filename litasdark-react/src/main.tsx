import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Make sure this file exists
import './App.css';   // Make sure this file exists
import App from './App';
import { PdfSettingsProvider } from './hooks/usePdfSettings';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PdfSettingsProvider>
      <App />
    </PdfSettingsProvider>
  </React.StrictMode>
);

if (import.meta.hot) {
  import.meta.hot.accept();
}