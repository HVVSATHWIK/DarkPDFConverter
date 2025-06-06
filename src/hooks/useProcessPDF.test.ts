/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PDFDocument } from 'pdf-lib'; // StandardFonts, rgb removed
import { useProcessPDF, ProcessOptions, ProcessResult } from './useProcessPDF';
import { useDarkMode } from './useDarkMode';
import { useMergePDFs } from './useMergePDFs';
import { useSplitPDF, SplitOptions } from './useSplitPDF';

vi.mock('./useDarkMode', () => ({
  useDarkMode: vi.fn(() => ({
    applyDarkMode: vi.fn(async (pdfDoc) => pdfDoc), // Returns PDFDocument
  })),
}));

// Mock return for mergePdfs should align with ProcessResult structure indirectly (it returns Uint8Array)
vi.mock('./useMergePDFs', () => ({
  useMergePDFs: vi.fn(() => ({
    // mergePdfs itself returns Uint8Array | null. The hook useProcessPDF constructs ProcessResult from it.
    mergePdfs: vi.fn().mockResolvedValue(new Uint8Array([10, 20, 30])),
  })),
}));

vi.mock('./useSplitPDF', () => ({
  useSplitPDF: vi.fn(() => ({
    // splitPdf itself returns Uint8Array | null.
    splitPdf: vi.fn().mockResolvedValue(new Uint8Array([5, 15, 25])),
  })),
}));

// Define a more complete mock for PDFDocument instance, especially for single file processing
const mockPdfDocInstanceDefaults = {
    getPages: vi.fn().mockReturnValue([ { getWidth: () => 600, getHeight: () => 800 } ]),
    getPageCount: vi.fn().mockReturnValue(1),
    getTitle: vi.fn().mockReturnValue('Mock PDF Title'),
    getAuthor: vi.fn().mockReturnValue('Mock Author'),
    save: vi.fn().mockResolvedValue(new Uint8Array([1,2,3,4,5])), // This is crucial for processedPdf
    embedFont: vi.fn().mockResolvedValue('mock-font'),
};


describe('useProcessPDF', () => {
  const mockFile = new File(['dummy pdf content'], 'test.pdf', { type: 'application/pdf' });
  (mockFile as any).arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(10));

  const mockFile1 = new File(['pdf1'], 'file1.pdf', { type: 'application/pdf' });
  (mockFile1 as any).arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(10));
  const mockFile2 = new File(['pdf2'], 'file2.pdf', { type: 'application/pdf' });
  (mockFile2 as any).arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(10));

  const mockOnProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useDarkMode as vi.Mock).mockReturnValue({
        applyDarkMode: vi.fn(async (pdfDoc) => pdfDoc), // Returns PDFDocument
    });

    (PDFDocument.load as vi.Mock).mockImplementation(async (bytes: ArrayBuffer | Uint8Array | string) => {
        // Type guard for byteLength
        if (typeof bytes !== 'string') {
            if (bytes && bytes.byteLength === 3 && (bytes as Uint8Array)[0] === 10) { // Merged PDF check
                 return { getPageCount: vi.fn().mockReturnValue(5) };
            }
            if (bytes && bytes.byteLength === 3 && (bytes as Uint8Array)[0] === 5) { // Split PDF check
                return { getPageCount: vi.fn().mockReturnValue(2) };
            }
        }
        // Default mock for original PDF loading in single file processing
        return { ...mockPdfDocInstanceDefaults };
    });

    // Ensure mergePdfs and splitPdf mocks are reset and return values that allow ProcessResult construction
    (useMergePDFs as vi.Mock).mockReturnValue({
        mergePdfs: vi.fn().mockResolvedValue(new Uint8Array([10,20,30]))
    });
    (useSplitPDF as vi.Mock).mockReturnValue({
        splitPdf: vi.fn().mockResolvedValue(new Uint8Array([5,15,25]))
    });
  });

  it('should process a document without dark mode if not specified', async () => {
    const { result } = renderHook(() => useProcessPDF());
    let processResult: ProcessResult | null = null; // Typed processResult
    await act(async () => {
      processResult = await result.current.processDocument(mockFile, mockOnProgress);
    });

    expect(PDFDocument.load).toHaveBeenCalled();
    // Check properties on processResult safely
    expect(processResult?.processedPdf).toBeInstanceOf(Uint8Array);
    expect(processResult?.title).toBe('Mock PDF Title'); // From mockPdfDocInstanceDefaults
    expect(mockOnProgress).toHaveBeenCalled();
  });

  it('should call applyDarkMode if activeToolName is "Dark Mode"', async () => {
    const { result } = renderHook(() => useProcessPDF());
    const options: ProcessOptions = {
      activeToolName: 'Dark Mode',
      darkModeOptions: { theme: 'dark' },
    };
    let processResult: ProcessResult | null = null; // Typed processResult

    await act(async () => {
      processResult = await result.current.processDocument(mockFile, mockOnProgress, options);
    });

    expect(PDFDocument.load).toHaveBeenCalled();
    const { applyDarkMode } = useDarkMode();
    expect(applyDarkMode).toHaveBeenCalled();
    expect(processResult?.processedPdf).toBeInstanceOf(Uint8Array);
    expect(mockOnProgress).toHaveBeenCalledWith(1, 'Processing complete!');
  });

  it('should set isProcessing to true during processing and false after', async () => {
    const { result } = renderHook(() => useProcessPDF());
    expect(result.current.isProcessing).toBe(false);

    const processPromise = act(async () => { // processPromise will be Promise<void>
      await result.current.processDocument(mockFile, mockOnProgress);
    });
    // Check isProcessing becomes true during the call if possible, or rely on final state.
    // For this test, we check final state after await.
    await processPromise;
    expect(result.current.isProcessing).toBe(false);
  });

  it('should call mergePdfs if activeToolName is "Merge PDFs"', async () => {
    const { result } = renderHook(() => useProcessPDF());
    const filesToMerge = [mockFile1, mockFile2];
    const options: ProcessOptions = { activeToolName: 'Merge PDFs' };
    let processResult: ProcessResult | null = null; // Typed processResult

    await act(async () => {
      processResult = await result.current.processDocument(filesToMerge, mockOnProgress, options);
    });

    const { mergePdfs } = useMergePDFs();
    expect(mergePdfs).toHaveBeenCalledWith(filesToMerge, expect.any(Function));
    expect(PDFDocument.load).toHaveBeenCalledWith(new Uint8Array([10,20,30]));
    expect(processResult?.isMerged).toBe(true);
    expect(processResult?.pageCount).toBe(5);
    expect(processResult?.title).toContain('Merged Document');
    expect(processResult?.processedPdf).toBeInstanceOf(Uint8Array);
    expect(mockOnProgress).toHaveBeenCalledWith(1, 'Merge complete!');
  });

  it('should throw error if non-array passed for Merge PDFs tool', async () => {
    const { result } = renderHook(() => useProcessPDF());
    const options: ProcessOptions = { activeToolName: 'Merge PDFs' };

    await act(async () => {
        await expect(result.current.processDocument(mockFile, mockOnProgress, options))
            .rejects.toThrow("No files provided for merging or input is not an array.");
    });
  });

  it('should call splitPdf if activeToolName is "Split PDF"', async () => {
    const { result } = renderHook(() => useProcessPDF());
    const splitOptions: SplitOptions = { startPage: 1, endPage: 2 }; // Defined variable
    const options: ProcessOptions = { activeToolName: 'Split PDF', splitPdfOptions: splitOptions }; // Used variable
    let processResult: ProcessResult | null = null; // Typed processResult

    await act(async () => {
      processResult = await result.current.processDocument(mockFile, mockOnProgress, options);
    });

    const { splitPdf } = useSplitPDF();
    expect(splitPdf).toHaveBeenCalledWith(mockFile, splitOptions, expect.any(Function));
    expect(PDFDocument.load).toHaveBeenCalledWith(new Uint8Array([5,15,25]));
    expect(processResult?.isSplit).toBe(true);
    expect(processResult?.pageCount).toBe(2);
    expect(processResult?.title).toContain(`(pages ${splitOptions.startPage}-${splitOptions.endPage})`);
    expect(processResult?.processedPdf).toBeInstanceOf(Uint8Array);
    expect(mockOnProgress).toHaveBeenCalledWith(1, 'Split complete!');
  });

  it('should throw error if non-single file passed for Split PDF tool', async () => {
    const { result } = renderHook(() => useProcessPDF());
    const options: ProcessOptions = { activeToolName: 'Split PDF', splitPdfOptions: {startPage:1, endPage:1} };
    await expect(result.current.processDocument([mockFile1, mockFile2], mockOnProgress, options))
        .rejects.toThrow("A single file must be provided for splitting.");
  });

  it('should throw error if splitPdfOptions not provided for Split PDF tool', async () => {
    const { result } = renderHook(() => useProcessPDF());
    const options: ProcessOptions = { activeToolName: 'Split PDF' };
    await expect(result.current.processDocument(mockFile, mockOnProgress, options))
        .rejects.toThrow("Split PDF options not provided.");
  });
});
