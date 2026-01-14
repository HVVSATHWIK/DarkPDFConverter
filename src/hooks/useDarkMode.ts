import { PDFDocument, rgb, BlendMode } from 'pdf-lib';

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
    const pages = pdfDoc.getPages();

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();

      // Apply brightness adjustment to overlay color
      let overlayR = themeConfig.overlayColor.r * brightness;
      let overlayG = themeConfig.overlayColor.g * brightness;
      let overlayB = themeConfig.overlayColor.b * brightness;

      // Apply contrast adjustment (adjust toward 0.5 for lower contrast, away for higher)
      const adjustContrast = (value: number, contrastFactor: number) => {
        return 0.5 + (value - 0.5) * contrastFactor;
      };

      overlayR = Math.max(0, Math.min(1, adjustContrast(overlayR, contrast)));
      overlayG = Math.max(0, Math.min(1, adjustContrast(overlayG, contrast)));
      overlayB = Math.max(0, Math.min(1, adjustContrast(overlayB, contrast)));

      const overlayColor = rgb(overlayR, overlayG, overlayB);

      // Main difference blend for color inversion
      page.drawRectangle({
        x: -100,
        y: -100,
        width: width + 200,
        height: height + 200,
        color: overlayColor,
        blendMode: BlendMode.Difference,
        opacity: 1,
      });

      // For preserve-images mode, add a subtle overlay to reduce image inversion
      if (mode === 'preserve-images') {
        const preserveOverlay = rgb(
          themeConfig.backgroundColor.r * 0.3,
          themeConfig.backgroundColor.g * 0.3,
          themeConfig.backgroundColor.b * 0.3
        );

        page.drawRectangle({
          x: -100,
          y: -100,
          width: width + 200,
          height: height + 200,
          color: preserveOverlay,
          blendMode: BlendMode.Multiply,
          opacity: 0.15,
        });
      }
    }

    console.log(`Dark mode applied: ${themeConfig.name} theme`);
    return pdfDoc;
  };

  return { applyDarkMode, THEME_CONFIGS };
}

export { THEME_CONFIGS };
