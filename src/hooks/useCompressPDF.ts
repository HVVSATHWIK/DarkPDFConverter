import { useRef, useEffect, useCallback } from 'react';

export type CompressionLevel = 'recommended' | 'extreme' | 'low' | 'custom';
export type CompressionEngine = 'vector' | 'raster';

export interface CompressOptions {
  level?: CompressionLevel;
  engine?: CompressionEngine;
  jpegQuality?: number;
  maxDpi?: number;
  stripMetadata?: boolean;
}

export interface CompressResult {
  pdfBytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  wasOptimized?: boolean;
}

type WorkerJob = {
  resolve: (data: Uint8Array) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: number, message: string) => void;
};

export function useCompressPDF() {
  const workerRef = useRef<Worker | null>(null);
  const jobsRef = useRef<Map<string, WorkerJob>>(new Map());

  useEffect(() => {
    const worker = new Worker(new URL('../workers/optimizer.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (e) => {
      const { type, id, data, originalSize, compressedSize, wasOptimized, progress, message, error } = e.data;
      const job = jobsRef.current.get(id);

      if (job) {
        if (type === 'PROGRESS') {
          job.onProgress?.(progress, message || 'Optimizing PDF in Web Worker...');
        } else if (type === 'SUCCESS') {
          const result = new Uint8Array(data);
          (result as any).originalSize = originalSize;
          (result as any).compressedSize = compressedSize;
          (result as any).wasOptimized = wasOptimized;
          job.resolve(result);
          jobsRef.current.delete(id);
        } else if (type === 'ERROR') {
          job.reject(new Error(error || 'Worker optimization failed'));
          jobsRef.current.delete(id);
        }
      }
    };

    workerRef.current = worker;

    const activeJobs = jobsRef.current;
    return () => {
      activeJobs.forEach((job) => {
        job.reject(new Error('Optimizer worker terminated'));
      });
      activeJobs.clear();
      worker.terminate();
    };
  }, []);

  const compressPdf = useCallback(
    async (
      file: File,
      options?: CompressOptions,
      onProgress?: (progress: number, message: string) => void
    ): Promise<Uint8Array | null> => {
      if (!file) throw new Error('No file provided.');

      if (!workerRef.current) {
        throw new Error('Optimizer worker is not ready.');
      }

      onProgress?.(0.02, 'Transferring PDF buffer to Web Worker...');
      const arrayBuffer = await file.arrayBuffer();

      const id = crypto.randomUUID();

      return new Promise<Uint8Array>((resolve, reject) => {
        jobsRef.current.set(id, { resolve, reject, onProgress });

        // Zero-copy transfer of file buffer to Web Worker
        workerRef.current!.postMessage(
          {
            type: 'OPTIMIZE_PDF',
            id,
            fileBuffer: arrayBuffer,
            options,
          },
          [arrayBuffer]
        );
      });
    },
    []
  );

  return { compressPdf };
}
