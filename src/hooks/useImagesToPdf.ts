import { PDFDocument } from 'pdf-lib';

export interface ImageToPdfOptions {
  pageSize?: 'fit' | 'a4' | 'letter';
  margin?: number; // margin in points (0, 18, 36)
}

async function fileToEmbeddableBuffer(file: File): Promise<{ buffer: ArrayBuffer; isPng: boolean }> {
  const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
  const isJpg = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');

  if (isPng || isJpg) {
    try {
      const buffer = await file.arrayBuffer();
      return { buffer, isPng };
    } catch {
      // Fallback to canvas
    }
  }

  // Convert WEBP or other browser-supported image formats to PNG ArrayBuffer via canvas
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      if (canvas.width === 0 || canvas.height === 0) {
        reject(new Error(`Invalid image dimensions (0x0) for ${file.name}`));
        return;
      }
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error(`Failed to process image ${file.name}`));
          return;
        }
        const buffer = await blob.arrayBuffer();
        resolve({ buffer, isPng: true });
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image format for ${file.name}`));
    };

    img.src = objectUrl;
  });
}

export function useImagesToPdf() {
  const convertImagesToPdf = async (
    files: File[],
    options: ImageToPdfOptions = {},
    onProgress?: (progress: number, message: string) => void
  ): Promise<Uint8Array | null> => {
    if (!files || files.length === 0) throw new Error('No image files provided.');

    onProgress?.(0.05, 'Initializing in-browser PDF compiler...');
    const pdfDoc = await PDFDocument.create();

    const margin = options.margin ?? 0;
    const pageSize = options.pageSize ?? 'fit';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      onProgress?.(
        0.1 + (i / files.length) * 0.8,
        `Compiling image ${i + 1} of ${files.length} (${file.name})...`
      );

      const { buffer, isPng } = await fileToEmbeddableBuffer(file);
      
      let embeddedImage;
      try {
        if (isPng) {
          embeddedImage = await pdfDoc.embedPng(buffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(buffer);
        }
      } catch {
        // If JPG parsing failed due to color profiles/progressive encoding, fallback to PNG canvas
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        const pngBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas 2D error'));
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (b) => {
              if (b) resolve(await b.arrayBuffer());
              else reject(new Error('toBlob error'));
            }, 'image/png');
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error(`Unable to decode ${file.name}`));
          };
          img.src = objectUrl;
        });
        embeddedImage = await pdfDoc.embedPng(pngBuffer);
      }

      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      let pageWidth: number;
      let pageHeight: number;
      let drawWidth: number;
      let drawHeight: number;
      let drawX: number;
      let drawY: number;

      if (pageSize === 'a4') {
        pageWidth = 595.28;
        pageHeight = 841.89;
        const availableW = pageWidth - margin * 2;
        const availableH = pageHeight - margin * 2;
        const scale = Math.min(availableW / imgWidth, availableH / imgHeight, 1.0);
        drawWidth = imgWidth * scale;
        drawHeight = imgHeight * scale;
        drawX = (pageWidth - drawWidth) / 2;
        drawY = (pageHeight - drawHeight) / 2;
      } else if (pageSize === 'letter') {
        pageWidth = 612.0;
        pageHeight = 792.0;
        const availableW = pageWidth - margin * 2;
        const availableH = pageHeight - margin * 2;
        const scale = Math.min(availableW / imgWidth, availableH / imgHeight, 1.0);
        drawWidth = imgWidth * scale;
        drawHeight = imgHeight * scale;
        drawX = (pageWidth - drawWidth) / 2;
        drawY = (pageHeight - drawHeight) / 2;
      } else {
        // 'fit' exact original resolution
        pageWidth = imgWidth + margin * 2;
        pageHeight = imgHeight + margin * 2;
        drawWidth = imgWidth;
        drawHeight = imgHeight;
        drawX = margin;
        drawY = margin;
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImage, {
        x: drawX,
        y: drawY,
        width: drawWidth,
        height: drawHeight,
      });
    }

    onProgress?.(0.95, 'Finalizing PDF compilation...');
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    onProgress?.(1.0, 'Compilation complete!');

    return pdfBytes;
  };

  return { convertImagesToPdf };
}
