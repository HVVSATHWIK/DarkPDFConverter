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
      return new Uint8Array(await files[0].arrayBuffer()); // Corrected here
    }

    const newPdfDoc = await PDFDocument.create();
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfToMerge = await PDFDocument.load(arrayBuffer);
        const pages = await newPdfDoc.copyPages(pdfToMerge, pdfToMerge.getPageIndices());

        pages.forEach((page, pageIndex) => {
          // Context-Aware Sizing:
          // If this is the VERY first page of the new document, set the standard.
          // If it's a subsequent page, check if it matches the standard.
          if (newPdfDoc.getPageCount() === 0 && pageIndex === 0) {
            // This page sets the standard.
            // No action needed, it defines the size.
          } else if (newPdfDoc.getPageCount() > 0) {
            const firstPage = newPdfDoc.getPages()[0];
            const { width: targetWidth, height: targetHeight } = firstPage.getSize();
            const { width: currentWidth, height: currentHeight } = page.getSize();

            // Tolerance for floating point differences
            if (Math.abs(currentWidth - targetWidth) > 1 || Math.abs(currentHeight - targetHeight) > 1) {
              // Scale the page content to fit the target
              page.scale(targetWidth / currentWidth, targetHeight / currentHeight);
            }
          }
          newPdfDoc.addPage(page);
        });

        onProgress((i + 1) / totalFiles, i + 1, totalFiles);
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.error(`Error processing file ${file.name} for merging:`, error);
        throw new Error(`Failed to merge ${file.name}. Please ensure all files are valid PDFs.`);
      }
    }

    try {
      const mergedPdfBytes = await newPdfDoc.save();
      onProgress(1, totalFiles, totalFiles);
      return mergedPdfBytes;
    } catch (error) {
      console.error('Error saving merged PDF:', error);
      throw new Error('Failed to save the merged PDF.');
    }
  };

  return { mergePdfs };
}
