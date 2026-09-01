import { PDFDocument } from 'pdf-lib';
import { pdfjs } from 'react-pdf';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export type ThemeName = 'dark' | 'darker' | 'darkest' | 'sepia' | 'midnight' | 'slate';
export type DarkModeRenderMode = 'preserve-images' | 'invert';

export interface DarkModeOptions {
  theme?: ThemeName;
  mode?: DarkModeRenderMode;
  brightness?: number;
  contrast?: number;
}

interface ThemeConfig {
  name: string;
  description: string;
  overlayColor: { r: number; g: number; b: number };
  backgroundColor: { r: number; g: number; b: number };
}

const THEME_CONFIGS: Record<ThemeName, ThemeConfig> = {
  dark: {
    name: 'Dark',
    description: 'Classic dark slate theme with balanced contrast',
    overlayColor: { r: 0.94, g: 0.96, b: 0.98 },
    backgroundColor: { r: 0.09, g: 0.11, b: 0.15 }
  },
  darker: {
    name: 'Darker',
    description: 'Deep charcoal modern theme',
    overlayColor: { r: 0.97, g: 0.98, b: 0.99 },
    backgroundColor: { r: 0.06, g: 0.06, b: 0.08 }
  },
  darkest: {
    name: 'Darkest',
    description: 'Pure OLED black for maximum contrast and battery saving',
    overlayColor: { r: 1.0, g: 1.0, b: 1.0 },
    backgroundColor: { r: 0.0, g: 0.0, b: 0.0 }
  },
  sepia: {
    name: 'Sepia',
    description: 'Warm amber and parchment tone for relaxed reading',
    overlayColor: { r: 0.96, g: 0.90, b: 0.78 },
    backgroundColor: { r: 0.18, g: 0.12, b: 0.07 }
  },
  midnight: {
    name: 'Midnight',
    description: 'Deep navy blue with moonlight accents for night reading',
    overlayColor: { r: 0.86, g: 0.92, b: 1.0 },
    backgroundColor: { r: 0.05, g: 0.09, b: 0.18 }
  },
  slate: {
    name: 'Slate',
    description: 'Cool graphite gray theme with gentle contrast',
    overlayColor: { r: 0.90, g: 0.92, b: 0.95 },
    backgroundColor: { r: 0.14, g: 0.16, b: 0.20 }
  }
};

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to encode PNG'))), 'image/png');
  });
  const ab = await blob.arrayBuffer();
  return new Uint8Array(ab);
}

async function rasterizeDarkMode(
  sourcePdf: PDFDocument,
  options: DarkModeOptions,
  themeConfig: ThemeConfig
): Promise<PDFDocument> {
  // Render via pdf.js, apply pixel-accurate theme color mapping, and rebuild a new PDF.
  const srcBytes = await sourcePdf.save();
  const loadingTask = pdfjs.getDocument({ data: srcBytes });
  const pdf = await loadingTask.promise;

  const outDoc = await PDFDocument.create();

  const brightness = Math.max(0.5, Math.min(1.8, options.brightness ?? 1.0));
  const contrast = Math.max(0.5, Math.min(1.8, options.contrast ?? 1.0));

  const bgR = Math.round(themeConfig.backgroundColor.r * 255);
  const bgG = Math.round(themeConfig.backgroundColor.g * 255);
  const bgB = Math.round(themeConfig.backgroundColor.b * 255);

  const fgR = Math.round(themeConfig.overlayColor.r * 255);
  const fgG = Math.round(themeConfig.overlayColor.g * 255);
  const fgB = Math.round(themeConfig.overlayColor.b * 255);

  const isPreserve = options.mode !== 'invert';

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const view = ((page as any).view as number[]) || [0, 0, 612, 792];
    const pageWidth = view[2] - view[0];
    const pageHeight = view[3] - view[1];

    const renderScale = 2.0;
    const viewport = page.getViewport({ scale: renderScale });

    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = Math.ceil(viewport.width);
    srcCanvas.height = Math.ceil(viewport.height);
    const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
    if (!srcCtx) throw new Error('Canvas 2D context not available');

    // Render PDF page into source canvas
    await (page as any).render({ canvasContext: srcCtx, viewport }).promise;

    const imgData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    const data = imgData.data;
    const len = data.length;

    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) {
        data[i] = bgR;
        data[i + 1] = bgG;
        data[i + 2] = bgB;
        data[i + 3] = 255;
        continue;
      }

      // Check if pixel is colored (photos, color logos, colored charts)
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const chroma = maxC - minC;

      if (isPreserve && chroma > 24) {
        // Preserve vivid colors for charts and images while adapting to dark mode
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const boost = lum < 0.3 ? 1.35 : lum > 0.85 ? 0.92 : 1.0;
        data[i] = Math.min(255, Math.max(0, Math.round(r * boost)));
        data[i + 1] = Math.min(255, Math.max(0, Math.round(g * boost)));
        data[i + 2] = Math.min(255, Math.max(0, Math.round(b * boost)));
      } else {
        // Grayscale / Text / Page background:
        // Original page brightness (0 = black ink, 1 = white paper)
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Inverted factor:
        // lum == 1 (white paper) -> t = 0 -> output = bgR, bgG, bgB (e.g. rich warm sepia or midnight navy)
        // lum == 0 (black ink) -> t = 1 -> output = fgR, fgG, fgB (e.g. warm parchment cream or moonlight blue)
        let t = 1.0 - lum;

        if (contrast !== 1.0 || brightness !== 1.0) {
          t = (t - 0.5) * contrast + 0.5 + (brightness - 1.0);
          t = Math.max(0, Math.min(1, t));
        }

        data[i] = Math.round(bgR + t * (fgR - bgR));
        data[i + 1] = Math.round(bgG + t * (fgG - bgG));
        data[i + 2] = Math.round(bgB + t * (fgB - bgB));
      }
    }

    const outCanvas = document.createElement('canvas');
    outCanvas.width = srcCanvas.width;
    outCanvas.height = srcCanvas.height;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) throw new Error('Canvas 2D context not available');

    outCtx.putImageData(imgData, 0, 0);

    const pngBytes = await canvasToPngBytes(outCanvas);
    const png = await outDoc.embedPng(pngBytes);
    const outPage = outDoc.addPage([pageWidth, pageHeight]);
    outPage.drawImage(png, { x: 0, y: 0, width: pageWidth, height: pageHeight });
  }

  return outDoc;
}

export function useDarkMode() {
  const applyDarkMode = async (
    pdfDoc: PDFDocument,
    options: DarkModeOptions = {}
  ): Promise<PDFDocument> => {
    const currentThemeName = options.theme || 'dark';
    const brightness = options.brightness ?? 1.0;
    const contrast = options.contrast ?? 1.0;
    const mode = options.mode || 'preserve-images';

    console.log('Applying dark mode:', { theme: currentThemeName, brightness, contrast, mode });

    const themeConfig = THEME_CONFIGS[currentThemeName];
    // In the real app, use a rasterized pipeline for consistent output
    // across viewers (including pdf.js). In tests, keep a lightweight vector
    // overlay path to avoid heavy canvas/pdfjs work.
    // Always use rasterization for consistent reliable dark mode
    // (Vector overlay with BlendMode.Difference is flaky in many viewers including pdf.js)
    try {
      const out = await rasterizeDarkMode(pdfDoc, { theme: currentThemeName, brightness, contrast, mode }, themeConfig);
      console.log(`Dark mode applied (raster): ${themeConfig.name} theme`);
      return out;
    } catch (error) {
      console.warn('Dark mode rasterization failed, returning original PDF.', error);
      return pdfDoc;
    }
  };

  return { applyDarkMode, THEME_CONFIGS };
}

export { THEME_CONFIGS };
