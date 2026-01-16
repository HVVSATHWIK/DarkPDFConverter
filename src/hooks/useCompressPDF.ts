import { PDFDocument } from 'pdf-lib';

export function useCompressPDF() {
    const compressPdf = async (
        file: File,
        onProgress?: (progress: number, message: string) => void
    ): Promise<Uint8Array | null> => {

        if (!file) throw new Error("No file provided.");

        onProgress?.(0.1, "Loading PDF...");
        const arrayBuffer = await file.arrayBuffer();

        // Structural Compression Strategy:
        // 1. Load original document.
        // 2. Create a NEW empty document.
        // 3. Copy pages from original to new.
        // 4. Save new document with useObjectStreams: true (PDF 1.5 compression).
        // This ensures unused objects (garbage) from the original are left behind, 
        // and the new structure is serialized efficiently.

        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();

        onProgress?.(0.3, "Analyzing structure...");

        // Create fresh document
        const newPdfDoc = await PDFDocument.create();

        // Copy all pages
        const pageIndices = Array.from({ length: totalPages }, (_, i) => i);

        onProgress?.(0.5, "Rebuilding document...");
        const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => newPdfDoc.addPage(page));

        onProgress?.(0.8, "Compressing streams...");

        // useObjectStreams: true forces PDF 1.5 object stream compression.
        // limit: false allows unconstrained stream size for better ratio? (default is fine)
        const compressedPdfBytes = await newPdfDoc.save({ useObjectStreams: true });

        onProgress?.(1, "Done!");
        return compressedPdfBytes;
    };

    return { compressPdf };
}
