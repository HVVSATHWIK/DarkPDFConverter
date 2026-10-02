import { PDFDocument } from 'pdf-lib';
import { pdfjs } from 'react-pdf';
import '../config/pdfWorker';

export type ThemeName = 'dark' | 'darker' | 'darkest' | 'sepia' | 'midnight' | 'slate';
export type DarkModeRenderMode = 'text-focused' | 'image-preserve' | 'invert';

export interface DarkModeOptions {
  theme?: ThemeName;
  mode?: DarkModeRenderMode;
  brightness?: number;
  contrast?: number;
  outputQuality?: 'low' | 'medium' | 'high';
  pageRange?: string;
  imageDimming?: number; // 0.0 to 1.0 (default: 0.0)
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



async function canvasToJpegBytes(canvas: HTMLCanvasElement, quality = 0.85): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to encode JPEG'))), 'image/jpeg', quality);
  });
  const ab = await blob.arrayBuffer();
  return new Uint8Array(ab);
}

/**
 * Parses a page range string (e.g., "1-5, 8, 11") into an array of 1-based page numbers.
 * If empty or 'all', returns all page numbers [1..totalPages].
 */
function parsePageRange(rangeStr: string | undefined, totalPages: number): number[] {
  if (!rangeStr || rangeStr.trim() === '' || rangeStr.trim().toLowerCase() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  const parts = rangeStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          pages.add(i);
        }
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        pages.add(p);
      }
    }
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  return sorted.length > 0 ? sorted : Array.from({ length: totalPages }, (_, i) => i + 1);
}

/**
 * Builds the CSS filter string corresponding to a selected dark mode theme and mode.
 * Uses the standard invert(1) hue-rotate(180deg) base to preserve natural hues,
 * with mode-specific adjustments ('text-focused', 'image-preserve', 'invert')
 * and theme adjustments for OLED black, Sepia, Midnight, and Slate.
 */
export function buildCssFilter(
  themeName: ThemeName = 'dark',
  brightness = 1.0,
  contrast = 1.0,
  mode: DarkModeRenderMode = 'text-focused'
): string {
  let filterStr = 'invert(1) hue-rotate(180deg)';

  // Mode-aware CSS filter approximation
  if (mode === 'image-preserve') {
    filterStr += ' brightness(0.9) contrast(0.95)';
  } else if (mode === 'invert') {
    filterStr += ' contrast(1.15)';
  }

  switch (themeName) {
    case 'sepia':
      filterStr += ' sepia(0.4) brightness(0.95)';
      break;
    case 'midnight':
      filterStr += ' hue-rotate(15deg) brightness(0.94)';
      break;
    case 'darkest':
      filterStr += ' contrast(1.15) brightness(0.92)';
      break;
    case 'darker':
      filterStr += ' contrast(1.05) brightness(0.95)';
      break;
    case 'slate':
      filterStr += ' contrast(0.95) brightness(0.97)';
      break;
    case 'dark':
    default:
      break;
  }

  if (brightness !== 1.0) {
    filterStr += ` brightness(${brightness})`;
  }
  if (contrast !== 1.0) {
    filterStr += ` contrast(${contrast})`;
  }

  return filterStr.trim();
}

async function rasterizeDarkMode(
  sourcePdf: PDFDocument,
  options: DarkModeOptions,
  themeConfig: ThemeConfig,
  onProgress?: (progress: number, message?: string) => void
): Promise<PDFDocument> {
  const srcBytes = await sourcePdf.save();
  const loadingTask = pdfjs.getDocument({ data: srcBytes });
  const pdf = await loadingTask.promise;

  const outDoc = await PDFDocument.create();

  const brightness = Math.max(0.5, Math.min(1.8, options.brightness ?? 1.0));
  const contrast = Math.max(0.5, Math.min(1.8, options.contrast ?? 1.0));
  const currentThemeName = options.theme || 'dark';
  const mode: DarkModeRenderMode = options.mode || 'text-focused';

  const rawDimming = options.imageDimming ?? 0.0;
  const imageDimming = Math.max(0.0, Math.min(1.0, rawDimming));

  const bgR = Math.round(themeConfig.backgroundColor.r * 255);
  const bgG = Math.round(themeConfig.backgroundColor.g * 255);
  const bgB = Math.round(themeConfig.backgroundColor.b * 255);

  const fgR = Math.round(themeConfig.overlayColor.r * 255);
  const fgG = Math.round(themeConfig.overlayColor.g * 255);
  const fgB = Math.round(themeConfig.overlayColor.b * 255);

  // Dynamically configure renderScale and jpegQuality based on outputQuality
  const quality = options.outputQuality || 'medium';
  let renderScale = 1.5;
  let jpegQuality = 0.85;

  if (quality === 'low') {
    renderScale = 1.0;
    jpegQuality = 0.6;
  } else if (quality === 'high') {
    renderScale = 2.0;
    jpegQuality = 0.95;
  }

  // Parse page range ("1-5, 8, 11" or empty/'all' for all pages)
  const targetPages = parsePageRange(options.pageRange, pdf.numPages);
  const totalTargetPages = targetPages.length;

  // Build the CSS filter for 'text-focused' mode
  const cssFilter = buildCssFilter(currentThemeName, brightness, contrast, mode);

  for (let idx = 0; idx < totalTargetPages; idx++) {
    const pageNumber = targetPages[idx];
    if (onProgress) {
      const startFraction = idx / totalTargetPages;
      onProgress(
        startFraction,
        `Processing page ${idx + 1} of ${totalTargetPages}...`
      );
    }

    const page = await pdf.getPage(pageNumber);
    const view = ((page as any).view as number[]) || [0, 0, 612, 792];
    const pageWidth = view[2] - view[0];
    const pageHeight = view[3] - view[1];

    const viewport = page.getViewport({ scale: renderScale });

    // Step 1: Render the original PDF page onto firstCanvas
    const firstCanvas = document.createElement('canvas');
    firstCanvas.width = Math.ceil(viewport.width);
    firstCanvas.height = Math.ceil(viewport.height);
    const firstCtx = firstCanvas.getContext('2d', { willReadFrequently: true });
    if (!firstCtx) throw new Error('Canvas 2D context not available');

    firstCtx.fillStyle = '#ffffff';
    firstCtx.fillRect(0, 0, firstCanvas.width, firstCanvas.height);

    await (page as any).render({ canvasContext: firstCtx, viewport }).promise;

    let finalCanvas: HTMLCanvasElement;

    if (mode === 'text-focused') {
      // -----------------------------------------------------------------
      // MODE 1: 'text-focused' (Fastest, best for text-only PDFs)
      // Skips manual pixel loops. Uses GPU CSS filter on a second canvas.
      // -----------------------------------------------------------------
      const secondCanvas = document.createElement('canvas');
      secondCanvas.width = firstCanvas.width;
      secondCanvas.height = firstCanvas.height;
      const secondCtx = secondCanvas.getContext('2d', { willReadFrequently: true });
      if (!secondCtx) throw new Error('Second canvas 2D context not available');

      secondCtx.filter = cssFilter;
      secondCtx.drawImage(firstCanvas, 0, 0);

      // Apply imageDimming to any illustrations if requested
      if (imageDimming > 0) {
        const dimFactor = 1.0 - Math.min(0.5, imageDimming);
        const secImgData = secondCtx.getImageData(0, 0, secondCanvas.width, secondCanvas.height);
        const secData = secImgData.data;
        const len = secData.length;

        for (let i = 0; i < len; i += 4) {
          const r = secData[i];
          const g = secData[i + 1];
          const b = secData[i + 2];
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const chroma = maxC - minC;

          const isBackground = r < 18 && g < 18 && b < 18;
          const isText = chroma <= 8 && r > 235 && g > 235 && b > 235;

          if (!isBackground && !isText) {
            secData[i] = Math.round(r * dimFactor);
            secData[i + 1] = Math.round(g * dimFactor);
            secData[i + 2] = Math.round(b * dimFactor);
          }
        }
        secondCtx.putImageData(secImgData, 0, 0);
      }

      finalCanvas = secondCanvas;
    } else if (mode === 'image-preserve') {
      // -----------------------------------------------------------------
      // MODE 2: 'image-preserve' (Best for PDFs with diagrams/photos)
      // Conservative pixel inversion: preserves colored pixels (chroma > 8),
      // widens preservation band for mid-tones (0.15 <= lum <= 0.95),
      // and inverts true background (lum > 0.95) & dark text (lum < 0.15).
      // -----------------------------------------------------------------
      const imgData = firstCtx.getImageData(0, 0, firstCanvas.width, firstCanvas.height);
      const data = imgData.data;
      const len = data.length;
      const dimFactor = 1.0 - imageDimming;

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

        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const chroma = maxC - minC;

        if (chroma > 8) {
          // Colored pixels: preserve natural colors without inverting hue
          if (imageDimming > 0) {
            data[i] = Math.round(r * dimFactor);
            data[i + 1] = Math.round(g * dimFactor);
            data[i + 2] = Math.round(b * dimFactor);
          }
          continue;
        }

        // Grayscale / text (chroma <= 8): Conservative luminance inversion
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Widen preservation band: leave mid-tones (0.15 <= lum <= 0.95) untouched
        if (lum >= 0.15 && lum <= 0.95) {
          continue;
        }

        let t = 1.0 - lum;
        if (contrast !== 1.0 || brightness !== 1.0) {
          t = (t - 0.5) * contrast + 0.5 + (brightness - 1.0);
          t = Math.max(0, Math.min(1, t));
        }

        data[i] = Math.round(bgR + t * (fgR - bgR));
        data[i + 1] = Math.round(bgG + t * (fgG - bgG));
        data[i + 2] = Math.round(bgB + t * (fgB - bgB));
        data[i + 3] = 255;
      }

      firstCtx.putImageData(imgData, 0, 0);
      finalCanvas = firstCanvas;
    } else {
      // -----------------------------------------------------------------
      // MODE 3: 'invert' (Legacy, aggressive high-contrast inversion)
      // Skips only high chroma (> 24); full luminance inversion for grayscale.
      // -----------------------------------------------------------------
      const imgData = firstCtx.getImageData(0, 0, firstCanvas.width, firstCanvas.height);
      const data = imgData.data;
      const len = data.length;
      const dimFactor = 1.0 - imageDimming;

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

        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const chroma = maxC - minC;

        if (chroma > 24) {
          if (imageDimming > 0) {
            data[i] = Math.round(r * dimFactor);
            data[i + 1] = Math.round(g * dimFactor);
            data[i + 2] = Math.round(b * dimFactor);
          }
          continue;
        }

        // Full grayscale luminance inversion
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        let t = 1.0 - lum;

        if (contrast !== 1.0 || brightness !== 1.0) {
          t = (t - 0.5) * contrast + 0.5 + (brightness - 1.0);
          t = Math.max(0, Math.min(1, t));
        }

        data[i] = Math.round(bgR + t * (fgR - bgR));
        data[i + 1] = Math.round(bgG + t * (fgG - bgG));
        data[i + 2] = Math.round(bgB + t * (fgB - bgB));
        data[i + 3] = 255;
      }

      firstCtx.putImageData(imgData, 0, 0);
      finalCanvas = firstCanvas;
    }

    // Step 3: Encode the chosen canvas to JPEG at dynamic quality and embed using pdf-lib embedJpg
    const jpgBytes = await canvasToJpegBytes(finalCanvas, jpegQuality);
    const jpg = await outDoc.embedJpg(jpgBytes);
    const outPage = outDoc.addPage([pageWidth, pageHeight]);
    outPage.drawImage(jpg, { x: 0, y: 0, width: pageWidth, height: pageHeight });

    if (onProgress) {
      const finishFraction = (idx + 1) / totalTargetPages;
      const modeLabel =
        mode === 'text-focused'
          ? 'Text Focused'
          : mode === 'image-preserve'
          ? 'Image Preserve'
          : 'High Contrast';
      onProgress(
        finishFraction,
        `Processed page ${idx + 1} of ${totalTargetPages} [${modeLabel}] (${Math.round(finishFraction * 100)}%)`
      );
    }
  }

  return outDoc;
}

export function useDarkMode() {
  const applyDarkMode = async (
    pdfDoc: PDFDocument,
    options: DarkModeOptions = {},
    onProgress?: (progress: number, message?: string) => void
  ): Promise<PDFDocument> => {
    const currentThemeName = options.theme || 'dark';
    const brightness = options.brightness ?? 1.0;
    const contrast = options.contrast ?? 1.0;
    const mode = options.mode || 'text-focused';

    console.log('Applying dark mode:', { theme: currentThemeName, brightness, contrast, mode });

    const themeConfig = THEME_CONFIGS[currentThemeName];
    try {
      const out = await rasterizeDarkMode(
        pdfDoc,
        {
          theme: currentThemeName,
          brightness,
          contrast,
          mode,
          outputQuality: options.outputQuality,
          pageRange: options.pageRange,
          imageDimming: options.imageDimming,
        },
        themeConfig,
        onProgress
      );
      console.log(`Dark mode applied (${mode}): ${themeConfig.name} theme`);
      return out;
    } catch (error) {
      console.warn('Dark mode rasterization failed, returning original PDF.', error);
      return pdfDoc;
    }
  };

  return { applyDarkMode, THEME_CONFIGS };
}

export { THEME_CONFIGS };
