import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export interface SplitOptions {
  startPage: number;
  endPage: number;
}

export function useSplitPDF(): {
  splitPDF: (
    originalPdfFile: File,
    options: SplitOptions,
    onProgress?: (progress: number) => void // Progress from 0 to 1
  ) => Promise<Uint8Array>;
  isProcessing: boolean;
} {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const splitPDF = async (
    originalPdfFile: File,
    options: SplitOptions,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> => {
    setIsProcessing(true);
    try {
      const { startPage, endPage } = options;

      if (startPage <= 0 || endPage <= 0) {
        throw new Error('Page numbers must be positive.');
      }
      if (startPage > endPage) {
        throw new Error('Start page cannot be greater than end page.');
      }

      const arrayBuffer = await originalPdfFile.arrayBuffer();
      const originalPdfDoc = await PDFDocument.load(arrayBuffer);

      const totalPages = originalPdfDoc.getPageCount();

      if (startPage > totalPages || endPage > totalPages) {
        throw new Error(
          `Page range (${startPage}-${endPage}) is out of bounds. The document has ${totalPages} pages.`
        );
      }

      const newPdfDoc = await PDFDocument.create();

      // Create an array of page indices to copy (0-based)
      const indicesToCopy = [];
      for (let i = startPage - 1; i < endPage; i++) {
        indicesToCopy.push(i);
      }

      const copiedPages = await newPdfDoc.copyPages(originalPdfDoc, indicesToCopy);
      copiedPages.forEach(page => newPdfDoc.addPage(page));

      if (onProgress) {
        // For splitting, the main work is done by copyPages, which is a single step.
        // More granular progress might be overkill unless copying a very large number of pages.
        onProgress(1.0); // Indicate completion
      }

      const pdfBytes = await newPdfDoc.save();
      return pdfBytes;
    } finally {
      setIsProcessing(false);
    }
  };

  return { splitPDF, isProcessing };
}
