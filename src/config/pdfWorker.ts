import { pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker using standard Vite asset URL
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
}

export function setupPdfWorker() {
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
  }
}
