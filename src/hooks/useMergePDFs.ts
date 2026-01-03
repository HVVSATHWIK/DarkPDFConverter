import { usePDFEngine } from './usePDFEngine';

export function useMergePDFs() {
  const { mergePDFs: mergePDFsViaWorker, isReady } = usePDFEngine();

  const mergePdfs = async (
    files: File[],
    onProgress: (percentage: number, currentFile: number, totalFiles: number) => void
  ): Promise<Uint8Array | null> => {
    if (!files || files.length === 0) {
      console.error('No files provided for merging.');
      return null;
    }

    // Safety check for engine readiness
    if (!isReady) {
      console.warn('PDF Engine worker not ready yet, waiting...');
      // Should ideally wait or fallback, but for now we expect it to be ready fast.
    }

    try {
      onProgress(0.1, 0, files.length); // Start indicator

      // Convert Files to Uint8Arrays for Zero-Copy transfer
      const fileBuffers = await Promise.all(
        files.map(async (file, index) => {
          onProgress((0.1 + (index / files.length) * 0.4), index + 1, files.length); // Reading progress
          const buffer = await file.arrayBuffer();
          return new Uint8Array(buffer);
        })
      );

      console.log('Sending buffers to Rust Worker...');
      // The heavy work happens off-thread now!
      const mergedPdfBytes = await mergePDFsViaWorker(fileBuffers);

      onProgress(1, files.length, files.length);
      return mergedPdfBytes;

    } catch (error) {
      console.error(`Error merging files via WASM:`, error);
      throw new Error(`Failed to merge files. High-Performance engine reported error.`);
    }
  };

  return { mergePdfs };
}
