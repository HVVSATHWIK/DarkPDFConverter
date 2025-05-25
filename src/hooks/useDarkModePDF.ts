import { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface DarkModeOptions {
  theme: 'dark' | 'darker' | 'darkest' | string;
  brightness: number; // e.g., 100 for 100%
  contrast: number;   // e.g., 100 for 100%
}

export function useDarkModePDF(): {
  convertToDarkMode: (
    originalPdfFile: File,
    options: DarkModeOptions,
    onProgress?: (progress: number) => void // Progress from 0 to 1
  ) => Promise<Uint8Array>;
  isProcessing: boolean;
} {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const getFillColor = (theme: string): string => {
    switch (theme) {
      case 'dark':
        return 'white';
      case 'darker':
        return 'rgb(230, 230, 230)'; // Lighter gray for "darker"
      case 'darkest':
        return 'rgb(200, 200, 200)'; // Even lighter gray for "darkest"
      default:
        // Allow custom hex colors
        if (/^#[0-9A-F]{6}$/i.test(theme)) {
          return theme;
        }
        return 'white'; // Default
    }
  };

  const convertToDarkMode = async (
    originalPdfFile: File,
    options: DarkModeOptions,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> => {
    setIsProcessing(true);
    try {
      const { theme, brightness, contrast } = options;

      // Clamp brightness and contrast values
      const clampedBrightness = Math.max(50, Math.min(brightness, 150));
      const clampedContrast = Math.max(50, Math.min(contrast, 200));

      const arrayBuffer = await originalPdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      const newPdfDoc = await PDFDocument.create();
      const totalPages = pdfDoc.numPages;

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2.5 }); // Scale for quality

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Could not get canvas context');
        }

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // Render the page to a clean canvas first (pageCanvas)
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = viewport.width;
        pageCanvas.height = viewport.height;
        const pageContext = pageCanvas.getContext('2d');
        if (!pageContext) {
            throw new Error('Could not get page canvas context');
        }
        await page.render({ canvasContext: pageContext, viewport: viewport }).promise;

        // Now, prepare the main canvas (context) for applying filters and theme
        
        // Apply brightness and contrast filters to the main canvas context
        context.filter = `brightness(${clampedBrightness}%) contrast(${clampedContrast}%)`;

        // Apply the theme inversion using globalCompositeOperation
        // Important: Draw the *original* page content (from pageCanvas) first,
        // then apply the 'difference' operation.

        // Draw the original page content onto the main canvas.
        // The filter (brightness/contrast) will be applied during this draw operation.
        context.drawImage(pageCanvas, 0, 0);

        // Now apply the color inversion for the dark theme
        context.globalCompositeOperation = 'difference';
        context.fillStyle = getFillColor(theme);
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Reset globalCompositeOperation to avoid affecting future drawing operations if any
        context.globalCompositeOperation = 'source-over';
        
        // At this point, 'canvas' contains the dark mode version of the page.
        // Convert it to PNG.
        const pngDataUrl = canvas.toDataURL('image/png');
        const pngImage = await newPdfDoc.embedPng(pngDataUrl);

        const newPage = newPdfDoc.addPage([canvas.width, canvas.height]);
        newPage.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
        });

        if (onProgress) {
          onProgress(i / totalPages);
        }
      }

      const pdfBytes = await newPdfDoc.save();
      return pdfBytes;
    } finally {
      setIsProcessing(false);
    }
  };

  return { convertToDarkMode, isProcessing };
}
