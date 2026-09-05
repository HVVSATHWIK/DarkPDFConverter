import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PDFDocument } from 'pdf-lib';

// Set up pdf.worker.min.mjs in worker context using Vite asset URL
if (typeof self !== 'undefined' && (pdfjsLib as any).GlobalWorkerOptions) {
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;
}

export interface CompressOptions {
  level?: 'recommended' | 'extreme' | 'low' | 'custom';
  engine?: 'vector' | 'raster';
  jpegQuality?: number;
  maxDpi?: number;
  stripMetadata?: boolean;
}

export type PdfTypeClassification = 'VECTOR_TEXT' | 'IMAGE_HEAVY' | 'SCANNED';

export type WorkerOptimizeMessage = {
  type: 'OPTIMIZE_PDF';
  id: string;
  fileBuffer: ArrayBuffer;
  options?: CompressOptions;
};

self.addEventListener('message', async (e: Event) => {
  const msgEvent = e as MessageEvent<WorkerOptimizeMessage>;
  if (!msgEvent.data || msgEvent.data.type !== 'OPTIMIZE_PDF') return;

  const { id, fileBuffer, options } = msgEvent.data;
  const originalSize = fileBuffer.byteLength;

  const postProgress = (progress: number, message: string) => {
    self.postMessage({
      type: 'PROGRESS',
      id,
      progress: Math.max(0, Math.min(0.99, progress)),
      message,
    });
  };

  try {
    postProgress(0.05, 'Worker initialized. Analyzing PDF structure...');

    const level = options?.level || 'recommended';
    const userEnginePreference = options?.engine;
    let jpegQuality = 0.72;
    let targetScale = 1.75; // ~125 DPI

    if (level === 'recommended') {
      jpegQuality = 0.72;
      targetScale = 1.75;
    } else if (level === 'low') {
      jpegQuality = 0.82;
      targetScale = 2.0;
    } else if (level === 'extreme') {
      jpegQuality = 0.58;
      targetScale = 1.35;
    } else if (level === 'custom') {
      jpegQuality = options?.jpegQuality ?? 0.75;
      targetScale = options?.maxDpi ? options.maxDpi / 72 : 1.75;
    }

    targetScale = Math.max(1.0, Math.min(2.5, targetScale));

    // -------------------------------------------------------------
    // PHASE 1: HYBRID CLASSIFICATION
    // -------------------------------------------------------------
    const classifyPdfContent = async (): Promise<PdfTypeClassification> => {
      postProgress(0.12, 'Analyzing operator streams & text layers...');
      try {
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer.slice(0)) });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        let totalTextOps = 0;
        let totalImageOps = 0;

        const pagesToSample = Math.min(10, totalPages);
        const step = Math.max(1, Math.floor(totalPages / pagesToSample));

        for (let i = 1; i <= totalPages; i += step) {
          try {
            const page = await pdf.getPage(i);
            const opList = await page.getOperatorList();

            if (opList && opList.fnArray) {
              for (let j = 0; j < opList.fnArray.length; j++) {
                const fn = opList.fnArray[j];
                const fnName = String(fn);
                if (/text|show/i.test(fnName) || fn === 42 || fn === 43 || fn === 44 || fn === 45) {
                  totalTextOps++;
                } else if (/image|paint/i.test(fnName) || fn === 82 || fn === 83 || fn === 84) {
                  totalImageOps++;
                }
              }
            }
            page.cleanup();
          } catch {
            // Ignore single page error
          }
        }

        await pdf.destroy();

        if (totalTextOps === 0 && totalImageOps > 0) {
          return 'SCANNED';
        } else if (totalImageOps > totalTextOps) {
          return 'IMAGE_HEAVY';
        } else {
          return 'VECTOR_TEXT';
        }
      } catch {
        return 'VECTOR_TEXT';
      }
    };

    // -------------------------------------------------------------
    // MODE A: STRUCTURAL STREAM DEFLATION (Preserves 100% Vector Text & Links)
    // -------------------------------------------------------------
    const runVectorOptimization = async (): Promise<Uint8Array> => {
      postProgress(0.30, 'Deflating PDF object streams & cleaning metadata...');
      const pdfDoc = await PDFDocument.load(fileBuffer.slice(0));

      if (options?.stripMetadata !== false) {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('LitasDark Worker Engine');
        pdfDoc.setCreator('LitasDark Worker Engine');
      }

      postProgress(0.60, 'Rebuilding cross-reference tables...');
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
      });

      return compressedBytes;
    };

    // -------------------------------------------------------------
    // MODE B: CONTROLLED RASTERIZATION FOR SCANNED DOCUMENTS
    // -------------------------------------------------------------
    const runControlledRasterPass = async (
      scale: number,
      quality: number
    ): Promise<Uint8Array> => {
      postProgress(0.25, 'Loading pages for offscreen canvas re-encoding...');
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer.slice(0)) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const newPdfDoc = await PDFDocument.create();
      const MAX_PIXELS = 12_000_000; // 12M pixel cap safety limit

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const pageRatio = pageNum / numPages;
        const currentProg = 0.25 + pageRatio * 0.65;
        postProgress(
          currentProg,
          `Optimizing page ${pageNum} of ${numPages} (${Math.round(scale * 72)} DPI)...`
        );

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });

        let renderScale = scale;
        let canvasWidth = Math.max(1, Math.floor(viewport.width * renderScale));
        let canvasHeight = Math.max(1, Math.floor(viewport.height * renderScale));

        const totalPixels = canvasWidth * canvasHeight;
        if (totalPixels > MAX_PIXELS) {
          const factor = Math.sqrt(MAX_PIXELS / totalPixels);
          renderScale *= factor;
          canvasWidth = Math.max(1, Math.floor(viewport.width * renderScale));
          canvasHeight = Math.max(1, Math.floor(viewport.height * renderScale));
        }

        let canvas: OffscreenCanvas | HTMLCanvasElement;
        let ctx2d: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null = null;

        if (typeof OffscreenCanvas !== 'undefined') {
          canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
          ctx2d = canvas.getContext('2d');
        } else {
          canvas = document.createElement('canvas');
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          ctx2d = canvas.getContext('2d');
        }

        if (!ctx2d) throw new Error('Failed to create worker canvas context.');

        ctx2d.imageSmoothingEnabled = true;
        ctx2d.imageSmoothingQuality = 'high';
        ctx2d.fillStyle = '#ffffff';
        ctx2d.fillRect(0, 0, canvasWidth, canvasHeight);

        await page.render({
          canvasContext: ctx2d as any,
          viewport: page.getViewport({ scale: renderScale }),
          canvas: canvas as any,
        }).promise;

        let jpegBytes: Uint8Array;

        if ('convertToBlob' in canvas) {
          const blob = await (canvas as OffscreenCanvas).convertToBlob({
            type: 'image/jpeg',
            quality,
          });
          jpegBytes = new Uint8Array(await blob.arrayBuffer());
        } else {
          const blob = await new Promise<Blob | null>((resolve) => {
            (canvas as HTMLCanvasElement).toBlob((b) => resolve(b), 'image/jpeg', quality);
          });
          if (!blob) throw new Error(`Failed to encode page ${pageNum} image`);
          jpegBytes = new Uint8Array(await blob.arrayBuffer());
        }

        const jpgImage = await newPdfDoc.embedJpg(jpegBytes);
        const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
        newPage.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });

        // Instant Memory Cleanup
        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();
      }

      await pdf.destroy();
      return await newPdfDoc.save({ useObjectStreams: true });
    };

    // -------------------------------------------------------------
    // EXECUTION
    // -------------------------------------------------------------
    const pdfType = await classifyPdfContent();

    let finalBytes: Uint8Array;

    if (userEnginePreference === 'raster' || (pdfType === 'SCANNED' && userEnginePreference !== 'vector')) {
      postProgress(0.20, 'Scanned image document detected. Re-encoding pages in Web Worker...');
      finalBytes = await runControlledRasterPass(targetScale, jpegQuality);
    } else {
      postProgress(0.20, 'Vector/Text PDF detected. Preserving 100% sharp text layers and fonts...');
      finalBytes = await runVectorOptimization();
    }

    // -------------------------------------------------------------
    // STRICT SIZE GUARD
    // -------------------------------------------------------------
    const finalSize = finalBytes.byteLength;

    if (finalSize >= originalSize) {
      postProgress(1.0, 'This PDF is already efficiently compressed.');
      const resultData = new Uint8Array(fileBuffer);
      self.postMessage(
        {
          type: 'SUCCESS',
          id,
          data: resultData,
          originalSize,
          compressedSize: originalSize,
          wasOptimized: false,
          message: 'This PDF is already efficiently compressed.',
        },
        [resultData.buffer] as any
      );
      return;
    }

    postProgress(1.0, 'Optimization complete!');
    self.postMessage(
      {
        type: 'SUCCESS',
        id,
        data: finalBytes,
        originalSize,
        compressedSize: finalSize,
        wasOptimized: true,
      },
      [finalBytes.buffer] as any
    );

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown optimization error';
    self.postMessage({ type: 'ERROR', id, error: errorMsg });
  }
});

export {};
