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
    description: 'Classic dark blue theme',
    overlayColor: { r: 0.95, g: 0.93, b: 0.88 },
    backgroundColor: { r: 0.05, g: 0.07, b: 0.12 }
  },
  darker: {
    name: 'Darker',
    description: 'Deep charcoal theme',
    overlayColor: { r: 0.97, g: 0.97, b: 0.95 },
    backgroundColor: { r: 0.03, g: 0.03, b: 0.05 }
  },
  darkest: {
    name: 'Darkest',
    description: 'Pure black for OLED',
    overlayColor: { r: 1.0, g: 1.0, b: 1.0 },
    backgroundColor: { r: 0.0, g: 0.0, b: 0.0 }
  },
  sepia: {
    name: 'Sepia',
    description: 'Warm sepia tones',
    overlayColor: { r: 0.88, g: 0.92, b: 0.98 },
    backgroundColor: { r: 0.12, g: 0.08, b: 0.02 }
  },
  midnight: {
    name: 'Midnight',
    description: 'Deep navy blue',
    overlayColor: { r: 0.94, g: 0.92, b: 0.85 },
    backgroundColor: { r: 0.06, g: 0.08, b: 0.15 }
  },
  slate: {
    name: 'Slate',
    description: 'Cool gray theme',
    overlayColor: { r: 0.95, g: 0.95, b: 0.96 },
    backgroundColor: { r: 0.05, g: 0.05, b: 0.04 }
  }
};

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

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
  // Render via pdf.js, apply filters/tint in canvas, and rebuild a new PDF.
  // This is the most compatible approach across PDF viewers.
  const srcBytes = await sourcePdf.save();
  const loadingTask = pdfjs.getDocument({ data: srcBytes });
  const pdf = await loadingTask.promise;

  const outDoc = await PDFDocument.create();

  const invertAmount = options.mode === 'invert' ? 1 : 0.92;
  const brightness = clamp(options.brightness ?? 1.0, 0.5, 1.8);
  const contrast = clamp(options.contrast ?? 1.0, 0.5, 1.8);

  const bg = themeConfig.backgroundColor;
  const tint = themeConfig.overlayColor;
  const bgCss = `rgb(${Math.round(bg.r * 255)}, ${Math.round(bg.g * 255)}, ${Math.round(bg.b * 255)})`;
  const tintCss = `rgb(${Math.round(tint.r * 255)}, ${Math.round(tint.g * 255)}, ${Math.round(tint.b * 255)})`;

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
    const srcCtx = srcCanvas.getContext('2d');
    if (!srcCtx) throw new Error('Canvas 2D context not available');

    // Render PDF page into source canvas
    await (page as any).render({ canvasContext: srcCtx, viewport }).promise;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = srcCanvas.width;
    outCanvas.height = srcCanvas.height;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) throw new Error('Canvas 2D context not available');

    // Background
    outCtx.fillStyle = bgCss;
    outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    // Invert + tune
    outCtx.filter = `invert(${invertAmount}) brightness(${brightness}) contrast(${contrast})`;
    outCtx.drawImage(srcCanvas, 0, 0);
    outCtx.filter = 'none';

    // Theme tint: make the chosen theme clearly visible.
    // Use the theme's overlayColor as the tint layer.
    outCtx.globalCompositeOperation = 'soft-light';
    outCtx.fillStyle = tintCss;
    outCtx.globalAlpha = options.mode === 'invert' ? 0.48 : 0.38;
    outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    // Theme colorize: push the overall hue toward the selected theme.
    // This is intentionally stronger than the subtle multiply pass so users can
    // clearly see the theme difference in the preview and output.
    outCtx.globalCompositeOperation = 'color';
    outCtx.fillStyle = bgCss;
    outCtx.globalAlpha = options.mode === 'invert' ? 0.20 : 0.18;
    outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    // A subtle multiply pass helps push backgrounds toward the theme without flattening text.
    outCtx.globalCompositeOperation = 'multiply';
    outCtx.fillStyle = bgCss;
    outCtx.globalAlpha = 0.16;
    outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    outCtx.globalAlpha = 1;
    outCtx.globalCompositeOperation = 'source-over';

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
    const out = await rasterizeDarkMode(pdfDoc, { theme: currentThemeName, brightness, contrast, mode }, themeConfig);
    console.log(`Dark mode applied (raster): ${themeConfig.name} theme`);
    return out;
  };

  return { applyDarkMode, THEME_CONFIGS };
}

export { THEME_CONFIGS };
