import { PDFDocument, rgb, StandardFonts, BlendMode } from 'pdf-lib';

// Themes removed as we are using unified Smart Inversion.
export type ThemeName = 'dark' | 'darker' | 'darkest'; // Kept for interface compatibility

export type DarkModeRenderMode = 'preserve-images' | 'invert';

export interface DarkModeOptions {
  theme?: ThemeName;
  /**
   * `preserve-images` reduces the “weird inverted photo colors” issue by avoiding full inversion.
   * `invert` keeps the classic Difference inversion (text becomes light, but images invert).
   */
  mode?: DarkModeRenderMode;
  // Brightness and contrast are not implemented in this version
}

export function useDarkMode() {
  const applyDarkMode = async (
    pdfDoc: PDFDocument,
    options: DarkModeOptions = {}
  ): Promise<PDFDocument> => {
    const currentThemeName = options.theme || 'dark';
    const mode: DarkModeRenderMode = options.mode || 'preserve-images';
    // const currentColors = themes[currentThemeName]; // Themes are currently unified under Smart Inversion
    console.log('Applying dark mode with theme:', currentThemeName, 'mode:', mode);

    const pages = pdfDoc.getPages();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const page of pages) {
      const { width, height } = page.getSize();

      if (mode === 'invert') {
        // Classic smart inversion using BlendMode.Difference.
        // Great for text, but tends to invert photos (often undesirable).
        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(1, 1, 1),
          blendMode: BlendMode.Difference,
          opacity: 1,
        });
      } else {
        // Image-preserving mode (default):
        // Step 1: Darken the page without fully inverting colors.
        // Step 2: Lighten “ink” via a *partial* Difference pass.
        // This avoids the most extreme photo color shifts while still making text readable.

        const themeTuning: Record<ThemeName, { darkenOpacity: number; invertOpacity: number }> = {
          dark: { darkenOpacity: 0.86, invertOpacity: 0.55 },
          darker: { darkenOpacity: 0.90, invertOpacity: 0.60 },
          darkest: { darkenOpacity: 0.93, invertOpacity: 0.65 },
        };

        const { darkenOpacity, invertOpacity } = themeTuning[currentThemeName];

        // Darken pass: keeps images closer to original (just darker) instead of hue-inverting.
        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(0.10, 0.11, 0.13),
          blendMode: BlendMode.Multiply,
          opacity: darkenOpacity,
        });

        // Partial inversion pass: brightens dark text and linework without fully inverting images.
        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(1, 1, 1),
          blendMode: BlendMode.Difference,
          opacity: invertOpacity,
        });
      }

      // 2. Add a watermark style text (Optional, adjusted for visibility)
      page.drawText('LitasDark Preview', {
        x: width / 2 - 60,
        y: 20,
        font: helveticaFont,
        size: 10,
        color: rgb(0.8, 0.8, 0.8), // Light gray to show up on black default
        opacity: 0.22,
      });
    }
    console.log(`Dark mode theme '${currentThemeName}' applied (mode: ${mode}).`);
    return pdfDoc;
  };

  return { applyDarkMode };
}
