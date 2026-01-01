import { PDFDocument } from 'pdf-lib';

export interface ExtractOptions {
    pageNumbers: number[]; // 1-based page numbers
}

export function useExtractPages() {
    const extractPages = async (
        file: File,
        options: ExtractOptions,
        onProgress?: (progress: number, message: string) => void
    ): Promise<Uint8Array | null> => {

        if (!file) throw new Error("No file provided.");
        if (!options.pageNumbers || options.pageNumbers.length === 0) throw new Error("No pages selected.");

        onProgress?.(0.1, "Loading PDF...");
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();

        // Validate pages
        const validPages = options.pageNumbers
            .map(p => p - 1) // Convert to 0-based
            .filter(p => p >= 0 && p < totalPages);

        if (validPages.length === 0) throw new Error("No valid pages to extract.");

        onProgress?.(0.3, `Extracting ${validPages.length} pages...`);
        const newPdfDoc = await PDFDocument.create();
        const copiedPages = await newPdfDoc.copyPages(pdfDoc, validPages);

        copiedPages.forEach(page => newPdfDoc.addPage(page));

        onProgress?.(0.8, "Saving extracted PDF...");
        const newPdfBytes = await newPdfDoc.save();

        onProgress?.(1, "Done!");
        return newPdfBytes;
    };

    return { extractPages };
}
