import { usePDFEngine } from './usePDFEngine';

export interface RotateOptions {
    degrees: 90 | 180 | 270 | 0;
    rotationType: 'all' | 'portrait' | 'landscape'; // Future expansion
}

export function useRotatePDF() {
    const { rotatePDF: workerRotate } = usePDFEngine();

    const rotatePdf = async (
        file: File,
        options: RotateOptions,
        onProgress?: (progress: number, message: string) => void
    ): Promise<Uint8Array | null> => {
        if (!file) throw new Error("No file provided.");

        onProgress?.(0.1, "Offloading to Secure Engine...");
        const arrayBuffer = await file.arrayBuffer();

        try {
            const result = await workerRotate(new Uint8Array(arrayBuffer), options.degrees);
            onProgress?.(1, "Done!");
            return result;
        } catch (e) {
            console.error(e);
            throw new Error("Engine Rotation Failed");
        }
    };

    return { rotatePdf };
}
