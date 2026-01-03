/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib'; // PDFOperator, PDFOperatorNames, Color removed
import { useDarkMode } from './useDarkMode';

// Mock pdf-lib
vi.mock('pdf-lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pdf-lib')>();
  return {
    ...actual,
    rgb: actual.rgb, // Hook useDarkMode uses rgb
    PDFOperator: actual.PDFOperator, // Hook useDarkMode uses PDFOperator
    PDFOperatorNames: actual.PDFOperatorNames, // Hook useDarkMode uses PDFOperatorNames
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
    } as unknown as PDFDocument;
  });

  it('should call drawRectangle for page background and drawText for watermark on each page', async () => {
    const { applyDarkMode } = useDarkMode();
    await applyDarkMode(mockPdfDoc);

    expect(mockPdfDoc.getPages).toHaveBeenCalled();
    expect(mockPage.drawRectangle).toHaveBeenCalledWith(expect.objectContaining({
      color: { red: 1, green: 1, blue: 1, type: 'RGB' },
      blendMode: 'Difference',
    }));
    expect(mockPage.drawText).toHaveBeenCalledWith(
      'LitasDark Preview',
      expect.objectContaining({
        size: 10,
        color: { red: 0.8, green: 0.8, blue: 0.8, type: 'RGB' },
      })
    );
    expect(mockPdfDoc.embedFont).toHaveBeenCalledWith(StandardFonts.Helvetica);
  });

  it('should use default theme if no options provided', async () => {
    const { applyDarkMode } = useDarkMode();
    await expect(applyDarkMode(mockPdfDoc)).resolves.toBe(mockPdfDoc);
  });
});
