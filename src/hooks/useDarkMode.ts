import { PDFDocument, rgb, StandardFonts, BlendMode } from 'pdf-lib';

// Themes removed as we are using unified Smart Inversion.
export type ThemeName = 'dark' | 'darker' | 'darkest'; // Kept for interface compatibility

export interface DarkModeOptions {
  theme?: ThemeName;
  // Brightness and contrast are not implemented in this version
}

export function useDarkMode() {
  const applyDarkMode = async (
    pdfDoc: PDFDocument,
    options: DarkModeOptions = {}
  ): Promise<PDFDocument> => {
    const currentThemeName = options.theme || 'dark';
    // const currentColors = themes[currentThemeName]; // Themes are currently unified under Smart Inversion
    console.log('Applying dark mode with theme:', currentThemeName);

    const pages = pdfDoc.getPages();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const page of pages) {
      const { width, height } = page.getSize();

      // 1. Draw a dark background for the entire page
      // This is the primary method for the dark mode effect in this version.
      // 1. Smart Inversion using BlendMode.Difference
      // This subtracts the page content (usually white) from the overlay (white).
      // |1 - 1| = 0 (Black Background). |1 - 0| = 1 (White Text).
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(1, 1, 1), // White
        blendMode: BlendMode.Difference,
      });

      // 2. Add a watermark style text (Optional, adjusted for visibility)
      page.drawText('LitasDark Preview', {
        x: width / 2 - 60,
        y: 20,
        font: helveticaFont,
        size: 10,
        color: rgb(0.8, 0.8, 0.8), // Light gray to show up on black default
        opacity: 0.3,
      });
    }
    console.log(`Dark mode theme '${currentThemeName}' applied (background and watermark).`);
    return pdfDoc;
  };

  return { applyDarkMode };
}
