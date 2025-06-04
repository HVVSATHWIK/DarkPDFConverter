import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useDarkMode, DarkModeOptions } from './useDarkMode';
import { useMergePDFs } from './useMergePDFs';
import { useSplitPDF, SplitOptions } from './useSplitPDF'; // Import useSplitPDF

export interface ProcessResult {
  metadata?: any;
  pageCount: number;
  title: string;
  processedPdf?: Uint8Array;
  isMerged?: boolean;
  isSplit?: boolean; // Flag for split operation
}

export interface ProcessOptions {
  activeToolName?: string;
  darkModeOptions?: DarkModeOptions;
  splitPdfOptions?: SplitOptions; // Add split options
}

export function useProcessPDF() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { applyDarkMode } = useDarkMode();
  const { mergePdfs } = useMergePDFs();
  const { splitPdf } = useSplitPDF(); // Get the split function

  const processDocument = useCallback(async (
    filesOrFile: File | File[],
    onProgress: (progress: number, message?: string) => void, // Progress callback
    options: ProcessOptions = {}
  ): Promise<ProcessResult> => {
    setIsProcessing(true);
    try {
      onProgress(0.01, 'Starting processing...'); // Initial progress

      if (options.activeToolName === 'Merge PDFs') {
        if (!Array.isArray(filesOrFile) || filesOrFile.length === 0) {
          throw new Error("No files provided for merging or input is not an array.");
        }
        console.log(`useProcessPDF: Merge PDFs tool identified. Merging ${filesOrFile.length} files...`);

        const mergedPdfBytes = await mergePdfs(filesOrFile as File[], (perc, current, total) => {
            onProgress(perc * 0.95, `Merging file ${current} of ${total}...`); // Scale merge progress to 95%
        });

        if (!mergedPdfBytes) {
            throw new Error("Merging returned no data.");
        }

        // For merged PDFs, metadata like title/author of a single doc is not directly applicable.
        // We can count pages of the merged PDF.
        const tempMergedDoc = await PDFDocument.load(mergedPdfBytes);

        onProgress(1, 'Merge complete!');
        return {
          pageCount: tempMergedDoc.getPageCount(),
          title: `Merged Document (${filesOrFile.length} files)`,
          processedPdf: mergedPdfBytes,
          isMerged: true,
        };

      } else if (options.activeToolName === 'Split PDF') {
        if (Array.isArray(filesOrFile) || !filesOrFile) {
          throw new Error("A single file must be provided for splitting.");
        }
        if (!options.splitPdfOptions) {
          throw new Error("Split PDF options not provided.");
        }
        console.log(`useProcessPDF: Split PDF tool identified. Splitting file ${filesOrFile.name}...`);

        const splitPdfBytes = await splitPdf(filesOrFile as File, options.splitPdfOptions, (perc, message) => {
            onProgress(perc * 0.95, message); // Scale split progress
        });

        if (!splitPdfBytes) {
            throw new Error("Splitting PDF returned no data.");
        }
        // Determine page count of the new PDF for the result
        const newSplitDoc = await PDFDocument.load(splitPdfBytes);
        onProgress(1, 'Split complete!');
        return {
            pageCount: newSplitDoc.getPageCount(),
            title: `${filesOrFile.name} (pages ${options.splitPdfOptions.startPage}-${options.splitPdfOptions.endPage})`,
            processedPdf: splitPdfBytes,
            isSplit: true,
        };

      } else if (Array.isArray(filesOrFile)) {
        throw new Error("Multiple files provided for a single file operation.");
      } else { // Single file processing (e.g., Dark Mode)
        const file = filesOrFile as File;
        const arrayBuffer = await file.arrayBuffer();
        let pdfDoc = await PDFDocument.load(arrayBuffer);
        const initialPageCount = pdfDoc.getPageCount();
        onProgress(0.1, 'PDF loaded.');

        if (options.activeToolName === 'Dark Mode') {
          console.log("useProcessPDF: Dark Mode tool identified. Applying dark mode...");
          pdfDoc = await applyDarkMode(pdfDoc, options.darkModeOptions || {});
          onProgress(0.5, 'Dark mode applied.');
        }

        // Simulate other processing / metadata extraction for single doc
        const metadata = {
          title: pdfDoc.getTitle(),
          author: pdfDoc.getAuthor(),
        };

        // Simulate finalization progress
        // This loop is more for showing progress than actual work here
        for (let i = 0; i < initialPageCount; i++) {
          if (i % 5 === 0 || i === initialPageCount - 1) {
            const baseProgress = options.activeToolName === 'Dark Mode' ? 0.5 : 0.1;
            const remainingProgress = 0.9 - baseProgress; // Save last 10% for saving
            onProgress(baseProgress + ((i + 1) / initialPageCount) * remainingProgress, 'Processing pages...');
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }

        const processedPdf = await pdfDoc.save();
        onProgress(1, 'Processing complete!');

        return {
          metadata,
          pageCount: pdfDoc.getPageCount(),
          title: metadata.title || file.name,
          processedPdf,
          isMerged: false,
          isSplit: false,
        };
      }
    } finally {
      setIsProcessing(false);
    }
  }, [applyDarkMode, mergePdfs, splitPdf]); // Add splitPdf to dependencies

  return { processDocument, isProcessing };
}

// Keep extractMetadata function if it was here, or ensure it's defined/imported if used.
// async function extractMetadata(pdfDoc: PDFDocument) { ... }