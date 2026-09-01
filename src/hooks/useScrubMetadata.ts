import { PDFDocument } from 'pdf-lib';

export interface MetadataScrubResult {
  pdfBytes: Uint8Array;
  cleanedFields: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    producer?: string;
    creator?: string;
    creationDate?: string;
    modificationDate?: string;
  };
}

export function useScrubMetadata() {
  const scrubMetadata = async (
    file: File,
    onProgress?: (progress: number, message: string) => void
  ): Promise<Uint8Array | null> => {
    if (!file) throw new Error('No file provided for metadata cleansing.');

    onProgress?.(0.1, 'Reading document in local memory...');
    const arrayBuffer = await file.arrayBuffer();

    onProgress?.(0.3, 'Parsing PDF metadata streams...');
    const sourceDoc = await PDFDocument.load(arrayBuffer);

    const totalPages = sourceDoc.getPageCount();
    onProgress?.(0.5, `Extracting ${totalPages} clean page vectors...`);

    // Create a pristine, zero-metadata document
    const cleanDoc = await PDFDocument.create();

    // Copy all pages cleanly into the new document container
    const pageIndices = Array.from({ length: totalPages }, (_, i) => i);
    const copiedPages = await cleanDoc.copyPages(sourceDoc, pageIndices);
    copiedPages.forEach((page) => cleanDoc.addPage(page));

    onProgress?.(0.8, 'Purging creation stamps, author tags & Producer streams...');
    
    // Explicitly wipe all standard document info dictionary keys
    cleanDoc.setTitle('');
    cleanDoc.setAuthor('');
    cleanDoc.setSubject('');
    cleanDoc.setKeywords([]);
    cleanDoc.setProducer('LitasDark In-Browser Sanitizer');
    cleanDoc.setCreator('LitasDark (Client-Side WASM)');
    cleanDoc.setCreationDate(new Date(0));
    cleanDoc.setModificationDate(new Date(0));

    onProgress?.(0.95, 'Serializing sanitized PDF document...');
    const cleanPdfBytes = await cleanDoc.save({ useObjectStreams: true });

    onProgress?.(1.0, 'Sanitization complete!');
    return cleanPdfBytes;
  };

  return { scrubMetadata };
}
