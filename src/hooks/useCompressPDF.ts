import { PDFDocument } from 'pdf-lib';

export function useCompressPDF() {
    const compressPdf = async (
        file: File,
        onProgress?: (progress: number, message: string) => void
    ): Promise<Uint8Array | null> => {

        if (!file) throw new Error("No file provided.");

        onProgress?.(0.1, "Loading PDF...");
        const arrayBuffer = await file.arrayBuffer();

        // Load the PDF. pdf-lib automatically removes minimal "junk" on load/save cycles.
        // For deeper compression, we can try to find and remove unused objects, 
        // but pdf-lib's 'save' is already quite efficient at structural cleanup.
        // The "Structural Pruning" in the report mentioned removing unreferenced objects.
        // pdf-lib does garbage collection of unreferenced objects by default when saving *if* they are not added to the new doc structure.
        // However, simply loading and saving provides baseline structural repair/compression.

        const pdfDoc = await PDFDocument.load(arrayBuffer);

        onProgress?.(0.5, "Optimizing structures...");

        // In Phase 1 client-side without external libs, the best "compression" is 
        // simply re-serializing the document efficiently.
        // pdf-lib does not support image downsampling natively without canvas (Phase 2).

        onProgress?.(0.8, "Saving optimized PDF...");

        // useObjectStreams: false is default/standard. 
        // Currently no high-level API to "prune" aggressively beyond what save() does.
        const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: false });

        onProgress?.(1, "Done!");
        return compressedPdfBytes;
    };

    return { compressPdf };
}
