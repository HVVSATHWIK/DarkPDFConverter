import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useDarkMode, DarkModeOptions } from './useDarkMode';
import { useMergePDFs } from './useMergePDFs';
import { useSplitPDF, SplitOptions } from './useSplitPDF';
import { useRotatePDF, RotateOptions } from './useRotatePDF';
import { useCompressPDF } from './useCompressPDF';
import { useExtractPages, ExtractOptions } from './useExtractPages';

export interface ProcessResult {
  metadata?: any;
  pageCount: number;
  title: string;
  processedPdf?: Uint8Array;
  isMerged?: boolean;
  isSplit?: boolean;
}

export interface ProcessOptions {
  activeToolName?: string;
  darkModeOptions?: DarkModeOptions;
  splitPdfOptions?: SplitOptions;
  rotateOptions?: RotateOptions;
  extractOptions?: ExtractOptions;
}

export function useProcessPDF() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { applyDarkMode } = useDarkMode();
  const { mergePdfs } = useMergePDFs();
  const { splitPdf } = useSplitPDF();
  const { rotatePdf } = useRotatePDF();
  const { compressPdf } = useCompressPDF();
  const { extractPages } = useExtractPages();

  const processDocument = useCallback(async (
    filesOrFile: File | File[],
    onProgress: (progress: number, message?: string) => void,
    options: ProcessOptions = {}
  ): Promise<ProcessResult> => {
    setIsProcessing(true);
    try {
      onProgress(0.01, 'Starting processing...');

      if (options.activeToolName === 'Merge PDFs') {
        if (!Array.isArray(filesOrFile) || filesOrFile.length === 0) {
          throw new Error("No files provided for merging.");
        }
        console.log(`useProcessPDF: Merge PDFs tool identified. Merging ${filesOrFile.length} files...`);

        const mergedPdfBytes = await mergePdfs(filesOrFile as File[], (perc, current, total) => {
          onProgress(perc * 0.95, `Merging file ${current} of ${total}...`);
        });

        if (!mergedPdfBytes) throw new Error("Merging returned no data.");

        const tempMergedDoc = await PDFDocument.load(mergedPdfBytes);
        onProgress(1, 'Merge complete!');
        return {
          pageCount: tempMergedDoc.getPageCount(),
          title: `Merged Document (${filesOrFile.length} files)`,
          processedPdf: mergedPdfBytes,
          isMerged: true,
        };

      } else if (options.activeToolName === 'Split PDF') {
        if (Array.isArray(filesOrFile) || !filesOrFile) throw new Error("A single file must be provided for splitting.");
        if (!options.splitPdfOptions) throw new Error("Split PDF options not provided.");

        console.log(`useProcessPDF: Split PDF tool identified.`);
        const splitPdfBytes = await splitPdf(filesOrFile as File, options.splitPdfOptions, (perc, message) => {
          onProgress(perc * 0.95, message);
        });

        if (!splitPdfBytes) throw new Error("Splitting PDF returned no data.");

        const newSplitDoc = await PDFDocument.load(splitPdfBytes);
        onProgress(1, 'Split complete!');
        return {
          pageCount: newSplitDoc.getPageCount(),
          title: `${filesOrFile.name} (Split)`,
          processedPdf: splitPdfBytes,
          isSplit: true,
        };

      } else if (Array.isArray(filesOrFile)) {
        throw new Error("Multiple files provided for a single file operation.");
      } else {
        // Single File Tools
        const file = filesOrFile as File;
        let processedPdf: Uint8Array | null = null;
        let titlePrefix = "";

        if (options.activeToolName === 'Dark Mode') {
          console.log("useProcessPDF: Dark Mode - Smart Inversion...");
          titlePrefix = "Dark Mode";
          const arrayBuffer = await file.arrayBuffer();
          let pdfDoc = await PDFDocument.load(arrayBuffer);
          onProgress(0.2, "Applying Smart Dark Mode...");
          pdfDoc = await applyDarkMode(pdfDoc, options.darkModeOptions || {});
          processedPdf = await pdfDoc.save();

        } else if (options.activeToolName === 'Rotate PDF') {
          if (!options.rotateOptions) throw new Error("Rotate options missing.");
          titlePrefix = "Rotated";
          processedPdf = await rotatePdf(file, options.rotateOptions, (p, m) => onProgress(p, m));

        } else if (options.activeToolName === 'Optimize PDF') {
          titlePrefix = "Optimized";
          processedPdf = await compressPdf(file, (p, m) => onProgress(p, m));

        } else if (options.activeToolName === 'Extract Pages') {
          if (!options.extractOptions) throw new Error("Extract options missing.");
          titlePrefix = "Extracted";
          processedPdf = await extractPages(file, options.extractOptions, (p, m) => onProgress(p, m));

        } else {
          // Fallback logic
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          processedPdf = await pdfDoc.save();
          titlePrefix = "Processed";
        }

        if (!processedPdf) throw new Error("Processing failed to return data.");

        const tempDoc = await PDFDocument.load(processedPdf);
        onProgress(1, 'Processing complete!');
        return {
          pageCount: tempDoc.getPageCount(),
          title: `${titlePrefix} - ${file.name}`,
          processedPdf,
        };
      }
    } finally {
      setIsProcessing(false);
    }
  }, [applyDarkMode, mergePdfs, splitPdf, rotatePdf, compressPdf, extractPages]);

  return { processDocument, isProcessing };
}