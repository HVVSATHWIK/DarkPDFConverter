import { usePDFEngine } from './usePDFEngine';

export interface ExtractOptions {
    pageNumbers: number[]; // 1-based page numbers
}

export function useExtractPages() {
    const { extractPages: workerExtract } = usePDFEngine();

    const extractPages = async (
        file: File,
        options: ExtractOptions,
        onProgress?: (progress: number, message: string) => void
    ): Promise<Uint8Array | null> => {

        if (!file) throw new Error("No file provided.");
        if (!options.pageNumbers || options.pageNumbers.length === 0) throw new Error("No pages selected.");

        // ... inside function
        onProgress?.(0.1, "Secure Processing...");
        const arrayBuffer = await file.arrayBuffer();

        try {
            // 0-based index for backend?
            const indices = options.pageNumbers.map(p => p - 1);
            const result = await workerExtract(new Uint8Array(arrayBuffer), indices);
            onProgress?.(1, "Done!");
            return result;
        } catch (e) {
            console.error(e);
            throw new Error("Engine Extraction Failed");
        }
    };

    return { extractPages };
}
