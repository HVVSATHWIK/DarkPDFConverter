import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFDocument } from 'pdf-lib'; // Will be mocked
import { useSplitPDF, SplitOptions } from './useSplitPDF';

// Mock pdf-lib
vi.mock('pdf-lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pdf-lib')>();
  const mockPageMethods = {}; // Mock page methods if needed
  const mockPdfDocInstance = {
    addPage: vi.fn(),
    copyPages: vi.fn().mockImplementation(async (sourceDoc, pageIndices) =>
      pageIndices.map(() => mockPageMethods) // Return array of mock pages
    ),
    getPageIndices: vi.fn().mockReturnValue([]), // Default to no pages for a source doc
    getPageCount: vi.fn().mockReturnValue(0),   // Default page count
    save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  };

  return {
    ...actual,
    PDFDocument: {
      create: vi.fn().mockResolvedValue({ ...mockPdfDocInstance, getPageCount: vi.fn().mockReturnValue(0) }), // For new docs
      load: vi.fn().mockResolvedValue({ ...mockPdfDocInstance }), // For loaded docs
    },
  };
});

const createMockFile = (name: string = 'test.pdf', content: string = 'dummy content') => {
  const blob = new Blob([content], { type: 'application/pdf' });
  const file = new File([blob], name, { type: 'application/pdf' });
  // Directly assign the mock function for arrayBuffer
  (file as any).arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(content.length));
  return file;
};

describe('useSplitPDF', () => {
  const mockOnProgress = vi.fn();
  let mockLoadedPdfDoc: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup for a loaded PDF document mock that PDFDocument.load will resolve to
    mockLoadedPdfDoc = {
      addPage: vi.fn(), // Should not be called on source doc
      copyPages: vi.fn().mockImplementation(async (sourceDoc, pageIndices) => pageIndices.map(() => ({}))),
      getPageCount: vi.fn().mockReturnValue(10), // Default: PDF has 10 pages
      getPageIndices: vi.fn().mockImplementation(() => Array.from({length: 10}, (_, i) => i)),
      save: vi.fn(), // Should not be called on source doc
    };
    (PDFDocument.load as vi.Mock).mockResolvedValue(mockLoadedPdfDoc);

    // Setup for the newly created PDF document mock
    const mockNewPdfDoc = {
        addPage: vi.fn(),
        copyPages: vi.fn().mockImplementation(async (sourceDoc, pageIndices) => pageIndices.map(() => ({}))),
        save: vi.fn().mockResolvedValue(new Uint8Array([1,2,3,4,5])),
        getPageCount: vi.fn().mockImplementation(() => mockNewPdfDoc.addPage.mock.calls.length), // Dynamic page count
    };
    (PDFDocument.create as vi.Mock).mockResolvedValue(mockNewPdfDoc);
  });

  it('should split a PDF successfully with valid page range', async () => {
    const { splitPdf } = useSplitPDF();
    const mockFile = createMockFile();
    const options: SplitOptions = { startPage: 2, endPage: 4 }; // 0-indexed: 1, 2, 3

    await splitPdf(mockFile, options, mockOnProgress);

    expect(PDFDocument.load).toHaveBeenCalledWith(await mockFile.arrayBuffer());
    expect(PDFDocument.create).toHaveBeenCalledTimes(1);

    const newPdfInstance = await (PDFDocument.create as vi.Mock).mock.results[0].value;
    expect(newPdfInstance.copyPages).toHaveBeenCalledWith(mockLoadedPdfDoc, [1, 2, 3]); // 0-indexed
    expect(newPdfInstance.addPage).toHaveBeenCalledTimes(3);
    expect(newPdfInstance.save).toHaveBeenCalledTimes(1);

    expect(mockOnProgress).toHaveBeenCalledWith(1, 'Split PDF saved.');
  });

  it('should throw error if startPage > endPage', async () => {
    const { splitPdf } = useSplitPDF();
    const options: SplitOptions = { startPage: 5, endPage: 2 };
    await expect(splitPdf(createMockFile(), options, mockOnProgress))
      .rejects.toThrow('Start page cannot be greater than end page.');
  });

  it('should throw error if startPage is out of bounds (too high)', async () => {
    const { splitPdf } = useSplitPDF();
    mockLoadedPdfDoc.getPageCount.mockReturnValue(5); // PDF has 5 pages
    const options: SplitOptions = { startPage: 7, endPage: 8 };
    await expect(splitPdf(createMockFile(), options, mockOnProgress))
      .rejects.toThrow('Start page is out of bounds. PDF has 5 pages.');
  });

  it('should cap endPage if it is out of bounds (too high)', async () => {
    const { splitPdf } = useSplitPDF();
    mockLoadedPdfDoc.getPageCount.mockReturnValue(5); // PDF has 5 pages (0-4)
    const options: SplitOptions = { startPage: 3, endPage: 10 }; // User inputs 3-10
                                                              // 0-indexed: 2 to 9 (capped to 4)
    await splitPdf(createMockFile(), options, mockOnProgress);
    const newPdfInstance = await (PDFDocument.create as vi.Mock).mock.results[0].value;
    expect(newPdfInstance.copyPages).toHaveBeenCalledWith(mockLoadedPdfDoc, [2, 3, 4]); // Pages 3, 4, 5
    expect(newPdfInstance.addPage).toHaveBeenCalledTimes(3);
  });

  it('should throw error if no pages are selected after validation', async () => {
    const { splitPdf } = useSplitPDF();
    mockLoadedPdfDoc.getPageCount.mockReturnValue(2); // PDF has 2 pages (0-1)
    // User inputs startPage 3, endPage 3. Start page adjusted to 2 (0-indexed).
    // Start page 2 is out of bounds for a 2-page PDF.
    const options: SplitOptions = { startPage: 3, endPage: 3 };
    await expect(splitPdf(createMockFile(), options, mockOnProgress))
      .rejects.toThrow('Start page is out of bounds. PDF has 2 pages.');
  });

  it('should throw error if no file is provided', async () => {
    const { splitPdf } = useSplitPDF();
    // @ts-expect-error testing invalid input
    await expect(splitPdf(null, { startPage: 1, endPage: 1 }, mockOnProgress))
      .rejects.toThrow('No file provided.');
  });

  it('should throw error if options are not provided', async () => {
    const { splitPdf } = useSplitPDF();
    // @ts-expect-error testing invalid input
    await expect(splitPdf(createMockFile(), null, mockOnProgress))
      .rejects.toThrow('Page range not specified.');
  });
});
