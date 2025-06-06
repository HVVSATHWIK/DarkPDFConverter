import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { useMergePDFs } from './useMergePDFs';

vi.mock('pdf-lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pdf-lib')>();
  const mockPageMethods = {};
  const mockPdfDocInstance = {
    addPage: vi.fn(),
    copyPages: vi.fn().mockImplementation(async (_, pageIndices) => { // Changed sourceDoc to _
      return pageIndices.map(() => mockPageMethods);
    }),
    getPageIndices: vi.fn().mockReturnValue([0]),
    save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5])),
  };

  return {
    ...actual,
    PDFDocument: {
      create: vi.fn().mockResolvedValue(mockPdfDocInstance),
      load: vi.fn().mockResolvedValue({
        ...mockPdfDocInstance,
        getPageCount: vi.fn().mockReturnValue(1),
      }),
    },
  };
});

const createMockFile = (name: string, content: string = 'dummy content') => {
  const blob = new Blob([content], { type: 'application/pdf' });
  const file = new File([blob], name, { type: 'application/pdf' });
  // Corrected: Assign mock to instance, not spyOn non-existent method
  (file as any).arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(content.length));
  return file;
};

describe('useMergePDFs', () => {
  const mockOnProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (PDFDocument.create as vi.Mock).mockClear().mockResolvedValue({
        addPage: vi.fn(),
        copyPages: vi.fn().mockImplementation(async (_, pageIndices) => pageIndices.map(() => ({}))), // Changed sourceDoc to _
        getPageIndices: vi.fn().mockReturnValue([0]),
        save: vi.fn().mockResolvedValue(new Uint8Array([1,2,3,4,5])),
    });
    (PDFDocument.load as vi.Mock).mockClear().mockResolvedValue({
        addPage: vi.fn(),
        copyPages: vi.fn().mockImplementation(async (_, pageIndices) => pageIndices.map(() => ({}))), // Changed sourceDoc to _
        getPageIndices: vi.fn().mockReturnValue([0]),
        save: vi.fn(),
        getPageCount: vi.fn().mockReturnValue(1),
    });
  });

  it('should return null if no files are provided', async () => {
    const { mergePdfs } = useMergePDFs();
    const result = await mergePdfs([], mockOnProgress);
    expect(result).toBeNull();
    expect(mockOnProgress).not.toHaveBeenCalled();
  });

  it('should return a Uint8Array of a single file if only one file is provided', async () => {
    const { mergePdfs } = useMergePDFs();
    const mockFile1 = createMockFile('file1.pdf');
    const expectedArrayBuffer = await mockFile1.arrayBuffer(); // Get the ArrayBuffer
    const result = await mergePdfs([mockFile1], mockOnProgress);

    expect(result).toBeInstanceOf(Uint8Array); // Check if it's Uint8Array
    expect(result).toEqual(new Uint8Array(expectedArrayBuffer)); // Compare content
    expect(mockFile1.arrayBuffer).toHaveBeenCalled();
    expect(PDFDocument.create).not.toHaveBeenCalled();
    expect(mockOnProgress).not.toHaveBeenCalled();
  });

  it('should merge multiple PDF files successfully', async () => {
    const { mergePdfs } = useMergePDFs();
    const mockFile1 = createMockFile('file1.pdf', 'pdf1 content');
    const mockFile2 = createMockFile('file2.pdf', 'pdf2 content');

    const mockPdfDocInstance1 = {
        getPageIndices: vi.fn().mockReturnValue([0, 1]),
    };
    const mockPdfDocInstance2 = {
        getPageIndices: vi.fn().mockReturnValue([0]),
    };
    (PDFDocument.load as vi.Mock)
        .mockResolvedValueOnce(mockPdfDocInstance1)
        .mockResolvedValueOnce(mockPdfDocInstance2);

    const createdDocMock = {
        addPage: vi.fn(),
        copyPages: vi.fn().mockImplementation(async (_, pageIndices) => pageIndices.map(() => ({}))), // Changed sourceDoc to _
        save: vi.fn().mockResolvedValue(new Uint8Array([1,2,3,4,5])),
    };
    (PDFDocument.create as vi.Mock).mockResolvedValue(createdDocMock);

    await mergePdfs([mockFile1, mockFile2], mockOnProgress);

    expect(PDFDocument.create).toHaveBeenCalledTimes(1);
    expect(PDFDocument.load).toHaveBeenCalledTimes(2);
    expect(PDFDocument.load).toHaveBeenCalledWith(await mockFile1.arrayBuffer());
    expect(PDFDocument.load).toHaveBeenCalledWith(await mockFile2.arrayBuffer());

    expect(createdDocMock.copyPages).toHaveBeenCalledTimes(2);
    expect(createdDocMock.copyPages).toHaveBeenCalledWith(mockPdfDocInstance1, [0, 1]);
    expect(createdDocMock.copyPages).toHaveBeenCalledWith(mockPdfDocInstance2, [0]);
    expect(createdDocMock.addPage).toHaveBeenCalledTimes(3);
    expect(createdDocMock.save).toHaveBeenCalledTimes(1);

    expect(mockOnProgress).toHaveBeenCalledTimes(3);
    expect(mockOnProgress).toHaveBeenCalledWith(0.5, 1, 2);
    expect(mockOnProgress).toHaveBeenCalledWith(1, 2, 2);
    expect(mockOnProgress).toHaveBeenLastCalledWith(1, 2, 2);
  });

  it('should throw an error if PDFDocument.load fails for a file', async () => {
    const { mergePdfs } = useMergePDFs();
    const mockFile1 = createMockFile('valid.pdf');
    const mockFile2 = createMockFile('invalid.pdf');

    (PDFDocument.load as vi.Mock)
      .mockResolvedValueOnce({ getPageIndices: vi.fn().mockReturnValue([0]) })
      .mockRejectedValueOnce(new Error('Failed to load invalid.pdf'));

    await expect(mergePdfs([mockFile1, mockFile2], mockOnProgress))
      .rejects
      .toThrow('Failed to merge invalid.pdf. Please ensure all files are valid PDFs.');

    expect(mockOnProgress).toHaveBeenCalledOnce();
    expect(mockOnProgress).toHaveBeenCalledWith(0.5, 1, 2);
  });
});
