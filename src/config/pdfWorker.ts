import { pdfjs } from 'react-pdf';

// Configure PDF.js worker using same-origin static asset to prevent Vite ?import errors
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export function setupPdfWorker() {
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
}

