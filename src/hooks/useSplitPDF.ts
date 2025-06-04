import { PDFDocument } from 'pdf-lib';

export interface SplitOptions {
  startPage: number;
  endPage: number;
}

export function useSplitPDF() {
  const splitPdf = async (
    file: File,
    options: SplitOptions,
    onProgress?: (progress: number, message: string) => void // Optional progress callback
  ): Promise<Uint8Array | null> => {
    if (!file) {
      console.error('No file provided for splitting.');
      throw new Error('No file provided.');
    }
    if (!options || options.startPage === undefined || options.endPage === undefined) {
      console.error('Split options (startPage, endPage) not provided.');
      throw new Error('Page range not specified.');
    }

    let { startPage, endPage } = options;

    // Adjust to 0-based indexing for pdf-lib
    startPage = Math.max(0, startPage - 1);
    endPage = Math.max(0, endPage - 1);

    if (startPage > endPage) {
      console.error('Start page cannot be greater than end page.');
      throw new Error('Start page cannot be greater than end page.');
    }

    onProgress?.(0.05, 'Loading PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();

    if (startPage >= totalPages) {
      console.error('Start page is out of bounds.');
      throw new Error(`Start page is out of bounds. PDF has ${totalPages} pages.`);
    }
    // endPage can be >= totalPages, we'll cap it.
    endPage = Math.min(endPage, totalPages - 1);

    if (startPage > endPage) { // Re-check after capping endPage
        throw new Error(`Adjusted page range is invalid. PDF has ${totalPages} pages.`);
    }

    onProgress?.(0.2, 'Creating new PDF...');
    const newPdfDoc = await PDFDocument.create();
    const pagesToCopyIndices = [];
    for (let i = startPage; i <= endPage; i++) {
      pagesToCopyIndices.push(i);
    }

    if (pagesToCopyIndices.length === 0) {
        throw new Error('No pages selected for splitting based on the provided range.');
    }

    onProgress?.(0.3, `Copying ${pagesToCopyIndices.length} pages...`);
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToCopyIndices);
    copiedPages.forEach(page => newPdfDoc.addPage(page));
    onProgress?.(0.8, 'Pages copied.');

    const newPdfBytes = await newPdfDoc.save();
    onProgress?.(1, 'Split PDF saved.');
    return newPdfBytes;
  };

  return { splitPdf };
}
