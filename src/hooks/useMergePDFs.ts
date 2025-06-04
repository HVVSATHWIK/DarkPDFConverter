import { PDFDocument } from 'pdf-lib';

export function useMergePDFs() {
  const mergePdfs = async (
    files: File[],
    onProgress: (percentage: number, currentFile: number, totalFiles: number) => void
  ): Promise<Uint8Array | null> => {
    if (!files || files.length === 0) {
      console.error('No files provided for merging.');
      return null;
    }
    if (files.length === 1) {
      console.warn('Only one file provided for merging. Returning the original file.');
      return await files[0].arrayBuffer();
    }

    const newPdfDoc = await PDFDocument.create();
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfToMerge = await PDFDocument.load(arrayBuffer);
        const pages = await newPdfDoc.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
        pages.forEach(page => newPdfDoc.addPage(page));

        // Report progress: (current file number / total files)
        onProgress( (i + 1) / totalFiles, i + 1, totalFiles);
        // Add a small delay to allow UI to update if needed, simulates work
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.error(`Error processing file ${file.name} for merging:`, error);
        // Optionally, re-throw the error or return null to indicate failure
        throw new Error(`Failed to merge ${file.name}. Please ensure all files are valid PDFs.`);
      }
    }

    try {
      const mergedPdfBytes = await newPdfDoc.save();
      onProgress(1, totalFiles, totalFiles); // Final progress update
      return mergedPdfBytes;
    } catch (error) {
      console.error('Error saving merged PDF:', error);
      throw new Error('Failed to save the merged PDF.');
    }
  };

  return { mergePdfs };
}
