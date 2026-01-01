import { PDFDocument, degrees } from 'pdf-lib';

export interface RotateOptions {
    degrees: 90 | 180 | 270 | 0;
    rotationType: 'all' | 'portrait' | 'landscape'; // Future expansion
}

export function useRotatePDF() {
    const rotatePdf = async (
        file: File,
        options: RotateOptions,
        onProgress?: (progress: number, message: string) => void
    ): Promise<Uint8Array | null> => {

        if (!file) throw new Error("No file provided.");

        onProgress?.(0.1, "Loading PDF...");
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();

        onProgress?.(0.3, `Rotating ${pages.length} pages...`);

        pages.forEach((page) => {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees(currentRotation + options.degrees));
        });

        onProgress?.(0.8, "Saving...");
        const rotatedPdfBytes = await pdfDoc.save();

        onProgress?.(1, "Done!");
        return rotatedPdfBytes;
    };

    return { rotatePdf };
}
