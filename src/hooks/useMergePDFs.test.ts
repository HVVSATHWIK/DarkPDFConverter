import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PDFDocument } from 'pdf-lib'; // Will be mocked
import { useMergePDFs } from './useMergePDFs';

// Mock pdf-lib
vi.mock('pdf-lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pdf-lib')>();
  const mockPageMethods = {
    // mock any methods used on a page if necessary
  };
  const mockPdfDocInstance = {
    addPage: vi.fn(),
    copyPages: vi.fn().mockImplementation(async (sourceDoc, pageIndices) => {
      // Return an array of mock pages based on pageIndices length
      return pageIndices.map(() => mockPageMethods);
    }),
    getPageIndices: vi.fn().mockReturnValue([0]), // Default to one page
    save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5])),
    // Add other methods used by mergePdfs if any
  };

  return {
    ...actual,
    PDFDocument: {
      create: vi.fn().mockResolvedValue(mockPdfDocInstance),
      load: vi.fn().mockResolvedValue({
        ...mockPdfDocInstance, // Loaded docs should also have these methods
        getPageCount: vi.fn().mockReturnValue(1), // Example
      }),
    },
  };
});

// Mock File and ArrayBuffer
const createMockFile = (name: string, content: string = 'dummy content') => {
  const blob = new Blob([content], { type: 'application/pdf' });
  const file = new File([blob], name, { type: 'application/pdf' });
  // Directly assign the mock function for arrayBuffer
  (file as any).arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(content.length));
  return file;
};


describe('useMergePDFs', () => {
  const mockOnProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the PDFDocument mocks for create and load to return fresh instances if necessary
    // This helps ensure that expect(PDFDocument.create()).toHaveBeenCalledTimes(1) works as expected.
    (PDFDocument.create as vi.Mock).mockClear().mockResolvedValue({
        addPage: vi.fn(),
        copyPages: vi.fn().mockImplementation(async (sourceDoc, pageIndices) => pageIndices.map(() => ({}))),
        getPageIndices: vi.fn().mockReturnValue([0]),
        save: vi.fn().mockResolvedValue(new Uint8Array([1,2,3,4,5])),
    });
    (PDFDocument.load as vi.Mock).mockClear().mockResolvedValue({
        addPage: vi.fn(), // Should not be called on loaded docs directly by merge
        copyPages: vi.fn().mockImplementation(async (sourceDoc, pageIndices) => pageIndices.map(() => ({}))),
        getPageIndices: vi.fn().mockReturnValue([0]),
        save: vi.fn(), // Should not be called on loaded docs directly by merge
        getPageCount: vi.fn().mockReturnValue(1),
    });
  });

  it('should return null if no files are provided', async () => {
    const { mergePdfs } = useMergePDFs();
    const result = await mergePdfs([], mockOnProgress);
    expect(result).toBeNull();
    expect(mockOnProgress).not.toHaveBeenCalled();
  });

  it('should return the array buffer of a single file if only one file is provided', async () => {
    const { mergePdfs } = useMergePDFs();
    const mockFile1 = createMockFile('file1.pdf');
    const result = await mergePdfs([mockFile1], mockOnProgress);

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(mockFile1.arrayBuffer).toHaveBeenCalled();
    expect(PDFDocument.create).not.toHaveBeenCalled();
    expect(mockOnProgress).not.toHaveBeenCalled(); // No progress for single file passthrough
  });

  it('should merge multiple PDF files successfully', async () => {
    const { mergePdfs } = useMergePDFs();
    const mockFile1 = createMockFile('file1.pdf', 'pdf1 content');
    const mockFile2 = createMockFile('file2.pdf', 'pdf2 content');

    // Mock getPageIndices for each loaded document
    const mockPdfDocInstance1 = {
        getPageIndices: vi.fn().mockReturnValue([0, 1]), // file1 has 2 pages
        // ... other necessary mocks for a loaded PDFDocument
    };
    const mockPdfDocInstance2 = {
        getPageIndices: vi.fn().mockReturnValue([0]),    // file2 has 1 page
        // ... other necessary mocks
    };
    (PDFDocument.load as vi.Mock)
        .mockResolvedValueOnce(mockPdfDocInstance1)
        .mockResolvedValueOnce(mockPdfDocInstance2);

    // Mock the created document to spy on addPage and copyPages
    const createdDocMock = {
        addPage: vi.fn(),
        copyPages: vi.fn().mockImplementation(async (sourceDoc, pageIndices) => pageIndices.map(() => ({}))),
        save: vi.fn().mockResolvedValue(new Uint8Array([1,2,3,4,5])),
    };
    (PDFDocument.create as vi.Mock).mockResolvedValue(createdDocMock);


    await mergePdfs([mockFile1, mockFile2], mockOnProgress);

    expect(PDFDocument.create).toHaveBeenCalledTimes(1);
    expect(PDFDocument.load).toHaveBeenCalledTimes(2);
    expect(PDFDocument.load).toHaveBeenCalledWith(await mockFile1.arrayBuffer());
    expect(PDFDocument.load).toHaveBeenCalledWith(await mockFile2.arrayBuffer());

    expect(createdDocMock.copyPages).toHaveBeenCalledTimes(2);
    // Check copyPages calls with the correct source documents and their page indices
    expect(createdDocMock.copyPages).toHaveBeenCalledWith(mockPdfDocInstance1, [0, 1]);
    expect(createdDocMock.copyPages).toHaveBeenCalledWith(mockPdfDocInstance2, [0]);

    // addPage should be called for each page returned by copyPages
    // Since copyPages is mocked to return an array based on indices length: 2 pages from file1, 1 from file2
    expect(createdDocMock.addPage).toHaveBeenCalledTimes(3);

    expect(createdDocMock.save).toHaveBeenCalledTimes(1);
    expect(mockOnProgress).toHaveBeenCalledTimes(3); // Once per file + final
    expect(mockOnProgress).toHaveBeenCalledWith(0.5, 1, 2); // After first file
    expect(mockOnProgress).toHaveBeenCalledWith(1, 2, 2);   // After second file
    expect(mockOnProgress).toHaveBeenCalledWith(1, 2, 2);   // Final call
  });

  it('should throw an error if PDFDocument.load fails for a file', async () => {
    const { mergePdfs } = useMergePDFs();
    const mockFile1 = createMockFile('valid.pdf');
    const mockFile2 = createMockFile('invalid.pdf'); // This one will fail

    (PDFDocument.load as vi.Mock)
      .mockResolvedValueOnce({ getPageIndices: vi.fn().mockReturnValue([0]) }) // valid.pdf
      .mockRejectedValueOnce(new Error('Failed to load invalid.pdf'));

    await expect(mergePdfs([mockFile1, mockFile2], mockOnProgress))
      .rejects
      .toThrow('Failed to merge invalid.pdf. Please ensure all files are valid PDFs.');

    expect(mockOnProgress).toHaveBeenCalledOnce(); // Progress for the first successful file
    expect(mockOnProgress).toHaveBeenCalledWith(0.5, 1, 2);
  });
});
