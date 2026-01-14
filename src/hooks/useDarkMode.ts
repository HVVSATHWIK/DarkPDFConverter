import { PDFDocument, rgb, BlendMode } from 'pdf-lib';

export type ThemeName = 'dark' | 'darker' | 'darkest';
export type DarkModeRenderMode = 'preserve-images' | 'invert';

export interface DarkModeOptions {
  theme?: ThemeName;
  mode?: DarkModeRenderMode;
}

export function useDarkMode() {
  const applyDarkMode = async (
    pdfDoc: PDFDocument,
    options: DarkModeOptions = {}
  ): Promise<PDFDocument> => {
    const currentThemeName = options.theme || 'dark';
    console.log('Applying dark mode with theme:', currentThemeName);

    const pages = pdfDoc.getPages();

    // Strategy: Single-Pass Difference Blend
    // We want White (1,1,1) -> Deep Dark Blue (0.05, 0.07, 0.12)
    // Formula: |Source - Overlay| = Target
    // Since Source is 1.0, |1.0 - Overlay| = Target => Overlay = 1.0 - Target
    // R: 1.0 - 0.05 = 0.95
    // G: 1.0 - 0.07 = 0.93
    // B: 1.0 - 0.12 = 0.88
    // Result for Black Text (0,0,0): |0 - 0.95| = 0.95 (Off-White/Beige). Excellent contrast.

    const overlayColor = rgb(0.95, 0.93, 0.88);

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();

      page.drawRectangle({
        x: -100,
        y: -100,
        width: width + 200,
        height: height + 200,
        color: overlayColor,
        blendMode: BlendMode.Difference,
        opacity: 1,
      });
    }

    console.log(`Dark mode applied (Single-Pass Difference Strategy).`);
    return pdfDoc;
  };

  return { applyDarkMode };
}
