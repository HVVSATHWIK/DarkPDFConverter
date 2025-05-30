import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);