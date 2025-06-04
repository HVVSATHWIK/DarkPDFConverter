import { PDFDocument, rgb, StandardFonts, Color } from 'pdf-lib';

export type ThemeName = 'dark' | 'darker' | 'darkest';

interface ThemeColors {
  text: Color; // Retained for potential future use (e.g., watermark, or if a simple text add is needed)
  pageBackground: Color;
  watermark: Color;
}

const themes: Record<ThemeName, ThemeColors> = {
  dark: {
    text: rgb(0.85, 0.85, 0.85),
    pageBackground: rgb(0.08, 0.08, 0.08),
    watermark: rgb(0.5, 0.5, 0.5),
  },
  darker: {
    text: rgb(0.9, 0.9, 0.9),
    pageBackground: rgb(0.04, 0.04, 0.04),
    watermark: rgb(0.4, 0.4, 0.4),
  },
  darkest: {
    text: rgb(0.95, 0.95, 0.95),
    pageBackground: rgb(0.01, 0.01, 0.01),
    watermark: rgb(0.3, 0.3, 0.3),
  },
};

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
    const currentColors = themes[currentThemeName];
    console.log('Applying dark mode with theme:', currentThemeName);

    const pages = pdfDoc.getPages();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const page of pages) {
      const { width, height } = page.getSize();

      // 1. Draw a dark background for the entire page
      // This is the primary method for the dark mode effect in this version.
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: currentColors.pageBackground,
        // Ensure this is drawn first so it's in the background
      });

      // 2. Add a watermark style text
      page.drawText('LitasDark Preview', {
        x: width / 2 - 60, // Centered based on approximate text width
        y: 20, // Positioned at the bottom
        font: helveticaFont,
        size: 10,
        color: currentColors.watermark,
        opacity: 0.5,
      });
    }
    console.log(`Dark mode theme '${currentThemeName}' applied (background and watermark).`);
    return pdfDoc;
  };

  return { applyDarkMode };
}
