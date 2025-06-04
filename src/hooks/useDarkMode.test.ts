import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useDarkMode } from './useDarkMode';

// Mock pdf-lib
vi.mock('pdf-lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pdf-lib')>();
  return {
    ...actual,
    PDFDocument: {
      create: vi.fn().mockResolvedValue({
        addPage: vi.fn().mockReturnValue({
          drawRectangle: vi.fn(),
          drawText: vi.fn(),
          getSize: vi.fn().mockReturnValue({ width: 500, height: 700 }),
          getContentStream: vi.fn().mockReturnValue({ operators: [] }), // Mock basic content stream
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
      load: vi.fn().mockResolvedValue({ // Mock load to return a similar structure
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
    StandardFonts: { // Mock StandardFonts if they are used directly in the hook
        Helvetica: 'Helvetica', // Or mock specific fonts
    },
    rgb: actual.rgb, // Use actual rgb if it's just a color utility
    PDFOperator: actual.PDFOperator,
    PDFOperatorNames: actual.PDFOperatorNames,
  };
});

describe('useDarkMode', () => {
  let mockPdfDoc: PDFDocument;
  let mockPage: any;

  beforeEach(async () => {
    // Re-create mockPdfDoc before each test to ensure clean state
    mockPage = {
      drawRectangle: vi.fn(),
      drawText: vi.fn(),
      getSize: vi.fn().mockReturnValue({ width: 600, height: 800 }),
      getContentStream: vi.fn().mockReturnValue({ operators: [] }), // Mock basic content stream
    };
    mockPdfDoc = {
      getPages: vi.fn().mockReturnValue([mockPage]),
      embedFont: vi.fn().mockResolvedValue('mock-font'),
      // Add any other methods of PDFDocument that your hook might call
    } as unknown as PDFDocument; // Type assertion
  });

  it('should call drawRectangle for page background and drawText for watermark on each page', async () => {
    const { applyDarkMode } = useDarkMode();
    await applyDarkMode(mockPdfDoc);

    expect(mockPdfDoc.getPages).toHaveBeenCalled();
    expect(mockPage.drawRectangle).toHaveBeenCalledWith(expect.objectContaining({
      color: expect.objectContaining({ red: 0.08, green: 0.08, blue: 0.08 }), // darkThemeColors.pageBackground
    }));
    expect(mockPage.drawText).toHaveBeenCalledWith(
      'LitasDark Preview',
      expect.objectContaining({
        size: 10,
        color: expect.objectContaining({ red: 0.5, green: 0.5, blue: 0.5 }),
      })
    );
    expect(mockPdfDoc.embedFont).toHaveBeenCalledWith(StandardFonts.Helvetica);
  });

  // Add more tests if options are introduced and used, e.g. different themes
  it('should use default theme if no options provided', async () => {
    const { applyDarkMode } = useDarkMode();
    // This test primarily ensures it runs without error and calls expected functions
    // Specific color checks are in the test above.
    await expect(applyDarkMode(mockPdfDoc)).resolves.toBe(mockPdfDoc);
  });
});
