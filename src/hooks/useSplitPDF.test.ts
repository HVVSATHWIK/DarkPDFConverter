import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { useSplitPDF, SplitOptions } from './useSplitPDF';

vi.mock('pdf-lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pdf-lib')>();
  const mockPageMethods = {};
  const mockPdfDocInstance = {
    addPage: vi.fn(),
    copyPages: vi.fn().mockImplementation(async (_, pageIndices) => // Changed sourceDoc to _
      pageIndices.map(() => mockPageMethods)
    ),
    getPageIndices: vi.fn().mockReturnValue([]),
    getPageCount: vi.fn().mockReturnValue(0),
    save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  };

  return {
    ...actual,
    PDFDocument: {
      create: vi.fn().mockResolvedValue({ ...mockPdfDocInstance, getPageCount: vi.fn().mockReturnValue(0) }),
      load: vi.fn().mockResolvedValue({ ...mockPdfDocInstance }),
    },
  };
});

const createMockFile = (name: string = 'test.pdf', content: string = 'dummy content') => {
  const blob = new Blob([content], { type: 'application/pdf' });
  const file = new File([blob], name, { type: 'application/pdf' });
  // Corrected: Assign mock to instance, not spyOn non-existent method
  (file as any).arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(content.length));
  return file;
};

describe('useSplitPDF', () => {
  const mockOnProgress = vi.fn();
  let mockLoadedPdfDoc: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadedPdfDoc = {
      addPage: vi.fn(),
      copyPages: vi.fn().mockImplementation(async (_, pageIndices) => pageIndices.map(() => ({}))), // Changed sourceDoc to _
      getPageCount: vi.fn().mockReturnValue(10),
      getPageIndices: vi.fn().mockImplementation(() => Array.from({length: 10}, (_, i) => i)),
      save: vi.fn(),
    };
    (PDFDocument.load as vi.Mock).mockResolvedValue(mockLoadedPdfDoc);

    const mockNewPdfDoc = {
        addPage: vi.fn(),
        copyPages: vi.fn().mockImplementation(async (_, pageIndices) => pageIndices.map(() => ({}))), // Changed sourceDoc to _
        save: vi.fn().mockResolvedValue(new Uint8Array([1,2,3,4,5])),
        getPageCount: vi.fn().mockImplementation(() => mockNewPdfDoc.addPage.mock.calls.length),
    };
    (PDFDocument.create as vi.Mock).mockResolvedValue(mockNewPdfDoc);
  });

  it('should split a PDF successfully with valid page range', async () => {
    const { splitPdf } = useSplitPDF();
    const mockFile = createMockFile();
    const options: SplitOptions = { startPage: 2, endPage: 4 };

    await splitPdf(mockFile, options, mockOnProgress);

    expect(PDFDocument.load).toHaveBeenCalledWith(await mockFile.arrayBuffer());
    expect(PDFDocument.create).toHaveBeenCalledTimes(1);

    const newPdfInstance = await (PDFDocument.create as vi.Mock).mock.results[0].value;
    expect(newPdfInstance.copyPages).toHaveBeenCalledWith(mockLoadedPdfDoc, [1, 2, 3]);
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
    mockLoadedPdfDoc.getPageCount.mockReturnValue(5);
    const options: SplitOptions = { startPage: 7, endPage: 8 };
    await expect(splitPdf(createMockFile(), options, mockOnProgress))
      .rejects.toThrow('Start page is out of bounds. PDF has 5 pages.');
  });

  it('should cap endPage if it is out of bounds (too high)', async () => {
    const { splitPdf } = useSplitPDF();
    mockLoadedPdfDoc.getPageCount.mockReturnValue(5);
    const options: SplitOptions = { startPage: 3, endPage: 10 };

    await splitPdf(createMockFile(), options, mockOnProgress);
    const newPdfInstance = await (PDFDocument.create as vi.Mock).mock.results[0].value;
    expect(newPdfInstance.copyPages).toHaveBeenCalledWith(mockLoadedPdfDoc, [2, 3, 4]);
    expect(newPdfInstance.addPage).toHaveBeenCalledTimes(3);
  });

  it('should throw error if no pages are selected after validation', async () => {
    const { splitPdf } = useSplitPDF();
    mockLoadedPdfDoc.getPageCount.mockReturnValue(2);
    const options: SplitOptions = { startPage: 3, endPage: 3 };
    await expect(splitPdf(createMockFile(), options, mockOnProgress))
      .rejects.toThrow('Start page is out of bounds. PDF has 2 pages.');
  });

  it('should throw error if no file is provided', async () => {
    const { splitPdf } = useSplitPDF();
    await expect(splitPdf(null as any, { startPage: 1, endPage: 1 }, mockOnProgress))
      .rejects.toThrow('No file provided.');
  });

  it('should throw error if options are not provided', async () => {
    const { splitPdf } = useSplitPDF();
    await expect(splitPdf(createMockFile(), null as any, mockOnProgress))
      .rejects.toThrow('Page range not specified.');
  });
});
