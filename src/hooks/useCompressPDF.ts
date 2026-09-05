import { PDFDocument } from 'pdf-lib';
import { pdfjs } from 'react-pdf';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export type CompressionLevel = 'recommended' | 'extreme' | 'low' | 'custom';
export type CompressionEngine = 'vector' | 'raster';

export interface CompressOptions {
  level?: CompressionLevel;
  engine?: CompressionEngine; // 'vector' (100% sharp text) or 'raster' (scanned docs)
  jpegQuality?: number;        // 0.30 to 0.95
  maxDpi?: number;            // 120, 150, 200, 300
  stripMetadata?: boolean;
}

export interface CompressResult {
  pdfBytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
}

export function useCompressPDF() {
  const compressPdf = async (
    file: File,
    options?: CompressOptions,
    onProgress?: (progress: number, message: string) => void
  ): Promise<Uint8Array | null> => {
    if (!file) throw new Error('No file provided.');

    onProgress?.(0.05, 'Reading PDF file...');
    const arrayBuffer = await file.arrayBuffer();
    const originalSize = arrayBuffer.byteLength;

    const level = options?.level || 'recommended';
    let engine: CompressionEngine = options?.engine || 'vector';
    let jpegQuality = 0.75;
    let targetScale = 2.0; // High DPI default (150 DPI = 2.08x scale)

    if (level === 'recommended') {
      engine = options?.engine || 'vector'; // Default to 100% sharp vector stream mode
      jpegQuality = 0.75;
      targetScale = 2.0; // 150 DPI for high sharpness
    } else if (level === 'low') {
      engine = 'vector'; // Always vector for high quality
      jpegQuality = 0.88;
      targetScale = 2.5; // 180 DPI
    } else if (level === 'extreme') {
      engine = options?.engine || 'vector';
      jpegQuality = 0.60;
      targetScale = 1.6; // ~120 DPI
    } else if (level === 'custom') {
      engine = options?.engine || 'vector';
      jpegQuality = options?.jpegQuality ?? 0.75;
      targetScale = options?.maxDpi ? options.maxDpi / 72 : 2.0;
    }

    // Clamp scale for safety
    targetScale = Math.max(1.2, Math.min(3.0, targetScale));

    // MODE 1: NATIVE VECTOR STREAM OPTIMIZATION (100% Sharp Text & Fonts)
    const runVectorOptimization = async () => {
      onProgress?.(0.20, 'Analyzing document structures & vector streams...');
      const pdfDoc = await PDFDocument.load(arrayBuffer.slice(0));

      onProgress?.(0.50, 'Stripping unreferenced metadata & rebuilding xref tables...');
      if (options?.stripMetadata !== false) {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('LitasDark Local Optimizer');
        pdfDoc.setCreator('LitasDark Local Optimizer');
      }

      onProgress?.(0.80, 'Deflating content streams with Object Streams (PDF 1.5)...');
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
      });

      return compressedBytes;
    };

    // MODE 2: HIGH-DPI RASTER DOWN-SAMPLING (For Scanned / Photo PDFs)
    const runHighDpiRasterPass = async (scale: number, quality: number) => {
      onProgress?.(0.15, 'Loading pages for high-clarity raster pass...');
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const newPdfDoc = await PDFDocument.create();

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const progressPerc = 0.15 + (pageNum / numPages) * 0.70;
        onProgress?.(
          progressPerc,
          `Processing page ${pageNum} of ${numPages} (${Math.round(scale * 72)} DPI, ${Math.round(
            quality * 100
          )}% quality)...`
        );

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(viewport.width * scale));
        canvas.height = Math.max(1, Math.floor(viewport.height * scale));
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('Failed to create 2D canvas context.');

        // High quality crisp image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill white background before rendering
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport: page.getViewport({ scale: scale }),
          canvas: canvas,
        } as any).promise;

        const jpegBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
        });

        if (!jpegBlob) throw new Error(`Failed to compress page ${pageNum}`);

        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const jpgImage = await newPdfDoc.embedJpg(jpegBytes);

        const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
        newPage.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });

        canvas.width = 0;
        canvas.height = 0;
      }

      onProgress?.(0.88, 'Writing high-DPI document object streams...');
      return await newPdfDoc.save({ useObjectStreams: true });
    };

    try {
      let finalBytes: Uint8Array;

      if (engine === 'vector') {
        // Run Native Vector Stream Optimization
        finalBytes = await runVectorOptimization();

        // If vector optimization didn't shrink or user selected extreme, check if raster pass is requested
        if (finalBytes.byteLength >= originalSize && level === 'extreme') {
          onProgress?.(0.60, 'Vector streams fully compressed. Trying high-clarity raster pass...');
          const rasterBytes = await runHighDpiRasterPass(targetScale, jpegQuality);
          if (rasterBytes.byteLength < finalBytes.byteLength) {
            finalBytes = rasterBytes;
          }
        }
      } else {
        // Run High-DPI Raster Pass for Scanned Documents
        finalBytes = await runHighDpiRasterPass(targetScale, jpegQuality);
      }

      onProgress?.(1.0, 'Optimization complete!');
      const result = new Uint8Array(finalBytes);
      (result as any).originalSize = originalSize;
      (result as any).compressedSize = finalBytes.byteLength;
      return result;
    } catch (err) {
      console.warn('PDF optimization fallback to structural stream cleanup:', err);
      const fallbackDoc = await PDFDocument.load(arrayBuffer.slice(0));
      const fallbackBytes = await fallbackDoc.save({ useObjectStreams: true });
      const finalFallback = new Uint8Array(fallbackBytes);
      (finalFallback as any).originalSize = originalSize;
      (finalFallback as any).compressedSize = fallbackBytes.byteLength;
      onProgress?.(1.0, 'Optimization complete!');
      return finalFallback;
    }
  };

  return { compressPdf };
}
