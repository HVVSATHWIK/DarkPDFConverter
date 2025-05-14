import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { showLoading, hideLoading, showError, showMessage } from './messageService';

interface CachedPdf {
  document: InstanceType<typeof PDFDocument> | null;
  arrayBuffer: ArrayBuffer | null;
  pdfjsDoc: any | null; // pdfjsLib.PDFDocumentProxy
}

let cachedPdf: CachedPdf = { document: null, arrayBuffer: null, pdfjsDoc: null };

/**
 * Clears the cached PDF to prevent memory leaks.
 */
function clearLoadedPdf(): void {
  cachedPdf = { document: null, arrayBuffer: null, pdfjsDoc: null };
}

/**
 * Wraps an async operation with loading state and error handling.
 * @param operation - The async operation to execute.
 * @param successMessage - Message to show on success.
 * @param errorMessage - Message to show on error.
 * @returns The operation's result or undefined on error.
 */
const withLoadingAndError = async <T>(
  operation: () => Promise<T>,
  successMessage: string,
  errorMessage: string
): Promise<T | undefined> => {
  try {
    showLoading();
    const result = await operation();
    hideLoading();
    showMessage(successMessage);
    return result;
  } catch (err) {
    hideLoading();
    showError(`${errorMessage}: ${(err as Error).message}`);
    return undefined;
  }
};

/**
 * Loads a PDF file into memory.
 * @param file - The PDF file to load.
 */
export async function loadPdf(file: File) {
  return withLoadingAndError(
    async () => {
      clearLoadedPdf();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Initialize PDF.js document properly
      const pdfjsDoc = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        disableFontFace: true,
        useSystemFonts: true
      }).promise;

      cachedPdf = {
        document: pdfDoc,
        arrayBuffer,
        pdfjsDoc
      };

      console.log('PDF initialized successfully');
      console.log('Total pages:', pdfDoc.getPageCount());
    },
    'PDF loaded successfully',
    'Failed to load PDF'
  );
}


/**
 * Renders a PDF page to a canvas.
 * @param pageNum - One-based page number (1 to page count).
 * @param canvas - The HTML canvas to render to.
 */
export const renderPage = async (pageNum: number, canvas: HTMLCanvasElement) => {
  return withLoadingAndError(
    async () => {
      if (!cachedPdf.document) throw new Error('No PDF loaded');
      const pageCount = cachedPdf.document.getPageCount();
      if (pageNum < 1 || pageNum > pageCount) {
        throw new Error(`Page number must be between 1 and ${pageCount}`);
      }
      if (!cachedPdf.pdfjsDoc) throw new Error('PDF.js document not initialized');
      const page = await cachedPdf.pdfjsDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get 2D canvas context');
      await page.render({ canvasContext: ctx, viewport }).promise;
    },
    'Page rendered',
    'Failed to render page'
  );
};

/**
 * Generates a preview by rendering the first page.
 * @param setCurrentPage - Function to set the current page.
 * @param canvas - The HTML canvas to render the preview to.
 */
export const generatePreview = async (
  setCurrentPage: (page: number) => void,
  canvas: HTMLCanvasElement
) => {
  return withLoadingAndError(
    async () => {
      setCurrentPage(1);
      await renderPage(1, canvas);
    },
    'Preview generated',
    'Failed to generate preview'
  );
};

/**
 * Converts the PDF to dark mode by adding a dark overlay to each page.
 */
// Fix dark mode conversion to properly invert colors
export const convertToDarkMode = async () => {
  return withLoadingAndError(
    async () => {
      if (!cachedPdf.document) throw new Error('No PDF loaded');
      
      const pages = cachedPdf.document.getPages();
      const [width, height] = pages[0].getSize();

      // Add type annotation for page
      pages.forEach((page: any) => {
        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(0.1, 0.1, 0.1),
          blendMode: 'Multiply',
        });

        // Rest of the dark mode implementation
      });

      // Fix array buffer conversion
      cachedPdf.arrayBuffer = await cachedPdf.document.save();
      cachedPdf.pdfjsDoc = await pdfjsLib.getDocument(
        new Uint8Array(cachedPdf.arrayBuffer || new ArrayBuffer(0))
      ).promise;
    },
    'Converted to dark mode',
    'Failed to convert to dark mode'
  );
};

/**
 * Splits the PDF into a new document containing pages from start to end (inclusive).
 * @param start - One-based start page number.
 * @param end - One-based end page number (inclusive).
 */
export const splitPdf = async (start: number, end: number) => {
  return withLoadingAndError(
    async () => {
      if (!cachedPdf.document) throw new Error('No PDF loaded');
      const pageCount = cachedPdf.document.getPageCount();
      if (start < 1 || end > pageCount || start > end) {
        throw new Error(
          `Start (1 to ${pageCount}) and end (up to ${pageCount}) must be valid and start <= end`
        );
      }
      const newPdf = await PDFDocument.create();
      const pageIndices = cachedPdf.document
        .getPageIndices()
        .slice(start - 1, end);
      const pages = await newPdf.copyPages(cachedPdf.document, pageIndices);
      pages.forEach((page: InstanceType<typeof PDFDocument>['getPage']) => newPdf.addPage(page));
      return newPdf.save();
    },
    'PDF split successfully',
    'Failed to split PDF'
  );
};

/**
 * Merges multiple PDF files into a single document.
 * @param files - List of PDF files to merge.
 */
export const mergePdfs = async (files: FileList) => {
  return withLoadingAndError(
    async () => {
      if (files.length === 0) throw new Error('No files provided');
      const mergedPdf = await PDFDocument.create();
      for (const file of Array.from(files)) {
        if (!file.type.includes('pdf')) {
          throw new Error(`File ${file.name} is not a PDF`);
        }
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page: InstanceType<typeof PDFDocument>['getPage']) => mergedPdf.addPage(page));
      }
      clearLoadedPdf();
      cachedPdf = {
        document: mergedPdf,
        arrayBuffer: await mergedPdf.save(),
        pdfjsDoc: await pdfjsLib.getDocument(await mergedPdf.save()).promise,
      };
      return cachedPdf.arrayBuffer;
    },
    'PDFs merged successfully',
    'Failed to merge PDFs'
  );
};

/**
 * Rotates a specific page by the given angle.
 * @param pageNum - One-based page number.
 * @param angle - Angle to rotate (in degrees, added to current rotation).
 */
export const rotatePage = async (pageNum: number, angle: number) => {
  return withLoadingAndError(
    async () => {
      if (!cachedPdf.document) throw new Error('No PDF loaded');
      const pageCount = cachedPdf.document.getPageCount();
      if (pageNum < 1 || pageNum > pageCount) {
        throw new Error(`Page number must be between 1 and ${pageCount}`);
      }
      const page: InstanceType<typeof PDFDocument>['getPage'] = cachedPdf.document.getPage(pageNum - 1);
      page.setRotation((page.getRotation().angle + angle) % 360);
      cachedPdf.arrayBuffer = await cachedPdf.document.save();
      cachedPdf.pdfjsDoc = await pdfjsLib.getDocument(cachedPdf.arrayBuffer).promise;
    },
    'Page rotated successfully',
    'Failed to rotate page'
  );
};

/**
 * Retrieves links from a specific page.
 * @param pageNum - One-based page number.
 * @returns Array of link annotations.
 */
export const getPageLinks = async (pageNum: number) => {
  return withLoadingAndError(
    async () => {
      if (!cachedPdf.document) throw new Error('No PDF loaded');
      const pageCount = cachedPdf.document.getPageCount();
      if (pageNum < 1 || pageNum > pageCount) {
        throw new Error(`Page number must be between 1 and ${pageCount}`);
      }
      if (!cachedPdf.pdfjsDoc) throw new Error('PDF.js document not initialized');
      const page = await cachedPdf.pdfjsDoc.getPage(pageNum);
      const annotations = await page.getAnnotations();
      return annotations.filter(
        (ann: { subtype: string }) => ann.subtype === 'Link'
      );
    },
    'Page links retrieved',
    'Failed to retrieve page links'
  );
};

/**
 * Retrieves image references from a specific page (may not capture all images).
 * @param pageNum - One-based page number.
 * @returns Array of image references.
 */
export const getPageImages = async (pageNum: number) => {
  return withLoadingAndError(
    async () => {
      if (!cachedPdf.document) throw new Error('No PDF loaded');
      const pageCount = cachedPdf.document.getPageCount();
      if (pageNum < 1 || pageNum > pageCount) {
        throw new Error(`Page number must be between 1 and ${pageCount}`);
      }
      if (!cachedPdf.pdfjsDoc) throw new Error('PDF.js document not initialized');
      const page = await cachedPdf.pdfjsDoc.getPage(pageNum);
      const ops = await page.getOperatorList();
      const images = ops.fnArray
        .map((fn: number, i: number) =>
          fn === pdfjsLib.OPS.paintImageXObject ? ops.argsArray[i][0] : null
        )
        .filter(Boolean);
      return images; // Note: This may not capture all images; consider pdf-lib alternatives
    },
    'Page images retrieved',
    'Failed to retrieve page images'
  );
};

/**
 * Retrieves form fields from a specific page.
 * @param pageNum - One-based page number.
 * @returns Array of form field annotations.
 */
export const getPageForms = async (pageNum: number) => {
  return withLoadingAndError(
    async () => {
      if (!cachedPdf.document) throw new Error('No PDF loaded');
      const pageCount = cachedPdf.document.getPageCount();
      if (pageNum < 1 || pageNum > pageCount) {
        throw new Error(`Page number must be between 1 and ${pageCount}`);
      }
      if (!cachedPdf.pdfjsDoc) throw new Error('PDF.js document not initialized');
      const page = await cachedPdf.pdfjsDoc.getPage(pageNum);
      const annotations = await page.getAnnotations();
      return annotations.filter(
        (ann: { subtype: string }) => ann.subtype === 'Widget'
      );
    },
    'Page forms retrieved',
    'Failed to retrieve page forms'
  );
};

/**
 * Retrieves document metadata.
 */
export const getPageMetadata = async () => {
  return withLoadingAndError(
    async () => {
      if (!cachedPdf.document) throw new Error('No PDF loaded');
      const metadata = await cachedPdf.document.getMetadata();
      return metadata.info;
    },
    'Document metadata retrieved',
    'Failed to retrieve document metadata'
  );
};

