import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export function useMergePDF(): {
  mergePDFs: (
    pdfFiles: File[],
    onProgress?: (progress: number, currentFile: string, overallProgress: number) => void
  ) => Promise<Uint8Array>;
  isProcessing: boolean;
} {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const mergePDFs = async (
    pdfFiles: File[],
    onProgress?: (progress: number, currentFile: string, overallProgress: number) => void
  ): Promise<Uint8Array> => {
    setIsProcessing(true);
    try {
      if (!pdfFiles || pdfFiles.length === 0) {
        throw new Error('No PDF files provided to merge.');
      }

      if (pdfFiles.length === 1) {
        const file = pdfFiles[0];
        if (onProgress) {
          onProgress(0, file.name, 0); // Starting the single file
        }
        const arrayBuffer = await file.arrayBuffer();
        // No actual merging needed, just return the bytes of the single file
        // However, to be consistent with return type of PDFDocument operations,
        // it might be better to load and save it, or adjust caller expectations.
        // For now, just return its bytes.
        if (onProgress) {
          onProgress(1, file.name, 1); // Finished the single file
        }
        return new Uint8Array(arrayBuffer);
      }

      const mergedPdfDoc = await PDFDocument.create();
      const totalFiles = pdfFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = pdfFiles[i];
        const overallProgressBeforeFile = i / totalFiles;

        if (onProgress) {
          onProgress(0, file.name, overallProgressBeforeFile);
        }

        const arrayBuffer = await file.arrayBuffer();
        const currentPdfDoc = await PDFDocument.load(arrayBuffer);

        const pageIndices = currentPdfDoc.getPageIndices();
        const copiedPages = await mergedPdfDoc.copyPages(currentPdfDoc, pageIndices);
        copiedPages.forEach(page => mergedPdfDoc.addPage(page));

        const overallProgressAfterFile = (i + 1) / totalFiles;
        if (onProgress) {
          onProgress(1, file.name, overallProgressAfterFile);
        }
      }

      // The loop's final onProgress call already signals overall completion if it was the last file.
      // An explicit call like onProgress(1, 'all files', 1) might be redundant if totalFiles > 1
      // but good for clarity if desired. Let's ensure it's called if onProgress is defined.
      if (onProgress && totalFiles > 1) { // Only if actual merging happened
         // The last call inside the loop onProgress(1, file.name, 1) would have already set this.
         // This can be an optional final signal.
         // For consistency, the `overallProgressAfterFile` for the last file will be 1.
      }


      const pdfBytes = await mergedPdfDoc.save();
      return pdfBytes;
    } finally {
      setIsProcessing(false);
    }
  };

  return { mergePDFs, isProcessing };
}
