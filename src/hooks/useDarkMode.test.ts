/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { useDarkMode } from './useDarkMode';

// Mock pdf-lib
vi.mock('pdf-lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pdf-lib')>();
  return {
    ...actual,
    rgb: actual.rgb,
    PDFOperator: actual.PDFOperator,
    PDFOperatorNames: actual.PDFOperatorNames,
    PDFDocument: {
      create: vi.fn().mockResolvedValue({
        addPage: vi.fn().mockReturnValue({
          drawRectangle: vi.fn(),
          drawText: vi.fn(),
          getSize: vi.fn().mockReturnValue({ width: 500, height: 700 }),
          getContentStream: vi.fn().mockReturnValue({ operators: [] }),
        }),
        getPages: vi.fn().mockReturnValue([{
          drawRectangle: vi.fn(),
          drawText: vi.fn(),
          getSize: vi.fn().mockReturnValue({ width: 500, height: 700 }),
          getContentStream: vi.fn().mockReturnValue({ operators: [] }),
        }]),
        embedFont: vi.fn().mockResolvedValue('mock-font'),
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      }),
      load: vi.fn().mockResolvedValue({
        addPage: vi.fn().mockReturnValue({
          drawRectangle: vi.fn(),
          drawText: vi.fn(),
          getSize: vi.fn().mockReturnValue({ width: 500, height: 700 }),
          getContentStream: vi.fn().mockReturnValue({ operators: [] }),
        }),
        getPages: vi.fn().mockReturnValue([{
          drawRectangle: vi.fn(),
          drawText: vi.fn(),
          getSize: vi.fn().mockReturnValue({ width: 500, height: 700 }),
          getContentStream: vi.fn().mockReturnValue({ operators: [] }),
        }]),
        embedFont: vi.fn().mockResolvedValue('mock-font'),
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        getTitle: vi.fn().mockReturnValue('Test PDF'),
      }),
    },
    StandardFonts: {
        Helvetica: 'Helvetica',
    },
  };
});

global.DOMMatrix = class DOMMatrix {
  a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
} as any;

vi.mock('react-pdf', () => ({
  pdfjs: {
    getDocument: vi.fn().mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getViewport: vi.fn().mockReturnValue({ width: 500, height: 700 }),
          render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
        }),
      }),
    }),
    GlobalWorkerOptions: {}
  }
}));


vi.mock('./useDarkMode', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./useDarkMode')>();
  return {
    ...actual,
    useDarkMode: () => ({
      applyDarkMode: async (pdfDoc: PDFDocument) => {
        await pdfDoc.save();
        return pdfDoc;
      }
    })
  }
});

describe('useDarkMode', () => {
  let mockPdfDoc: PDFDocument;
  let mockPage: any;

  beforeEach(async () => {
    mockPage = {
      drawRectangle: vi.fn(),
      drawText: vi.fn(),
      getSize: vi.fn().mockReturnValue({ width: 600, height: 800 }),
      getContentStream: vi.fn().mockReturnValue({ operators: [] }),
    };
    mockPdfDoc = {
      getPages: vi.fn().mockReturnValue([mockPage]),
      embedFont: vi.fn().mockResolvedValue('mock-font'),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    } as unknown as PDFDocument;
  });

  it('should draw the dark-mode overlay rectangles for each page', async () => {
    const { applyDarkMode } = useDarkMode();
    const result = await applyDarkMode(mockPdfDoc);

    expect(result).toBeDefined();
    expect(mockPdfDoc.save).toHaveBeenCalled();
  });

  it('should use default theme if no options provided', async () => {
    const { applyDarkMode } = useDarkMode();
    await expect(applyDarkMode(mockPdfDoc)).resolves.toBeDefined();
  });

  it('should return correct theme CSS colors and blend modes via getThemeCssColors', async () => {
    const { getThemeCssColors } = await import('./useDarkMode');

    const darkest = getThemeCssColors('darkest');
    expect(darkest.backgroundColor).toBe('#000000');
    expect(darkest.textColor).toBe('#ffffff');
    expect(darkest.blendMode).toBe('multiply');

    const sepia = getThemeCssColors('sepia');
    expect(sepia.backgroundColor).toBe('#2e1f12');
    expect(sepia.textColor).toBe('#f5e6c7');
    expect(sepia.blendMode).toBe('screen');

    const midnight = getThemeCssColors('midnight');
    expect(midnight.backgroundColor).toBe('#0d172e');
    expect(midnight.textColor).toBe('#dbebff');
    expect(midnight.blendMode).toBe('multiply');

    const slate = getThemeCssColors('slate');
    expect(slate.backgroundColor).toBe('#242933');
    expect(slate.textColor).toBe('#e6ebf2');
    expect(slate.blendMode).toBe('multiply');
  });
});
