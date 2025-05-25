import { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';

export interface RotateOptions {
  pageNumber: number; // The 1-based page number to rotate
  angle: number;      // Angle in degrees (e.g., 90, 180, 270)
}

export function useRotatePDF(): {
  rotatePDFPage: (
    originalPdfFile: File,
    options: RotateOptions,
    onProgress?: (progress: number) => void // Progress from 0 to 1
  ) => Promise<Uint8Array>;
  isProcessing: boolean;
} {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const rotatePDFPage = async (
    originalPdfFile: File,
    options: RotateOptions,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> => {
    setIsProcessing(true);
    try {
      const { pageNumber, angle } = options;

      if (pageNumber <= 0) {
        throw new Error('Page number must be positive.');
      }

      // While pdf-lib can handle any angle, for user clarity, multiples of 90 are standard.
      // No explicit validation here as per instruction "initially just accept any number".

      const arrayBuffer = await originalPdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const totalPages = pdfDoc.getPageCount();
      if (pageNumber > totalPages) {
        throw new Error(
          `Page number ${pageNumber} is out of bounds. The document has ${totalPages} pages.`
        );
      }

      if (onProgress) {
        onProgress(0.25); // Progress after loading
      }

      const pageToRotate = pdfDoc.getPage(pageNumber - 1); // 0-indexed
      const currentRotation = pageToRotate.getRotation().angle;
      pageToRotate.setRotation(degrees(currentRotation + angle));

      if (onProgress) {
        onProgress(0.75); // Progress after rotation, before save
      }

      const pdfBytes = await pdfDoc.save();

      if (onProgress) {
        onProgress(1.0); // Progress after save
      }

      return pdfBytes;
    } finally {
      setIsProcessing(false);
    }
  };

  return { rotatePDFPage, isProcessing };
}
