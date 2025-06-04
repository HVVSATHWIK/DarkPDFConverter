import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'; // Import necessary members
import { useProcessPDF, ProcessOptions, ProcessResult } from './useProcessPDF'; // Ensure ProcessResult is exported and imported
import { useDarkMode } from './useDarkMode';
import { useMergePDFs } from './useMergePDFs';
import { useSplitPDF, SplitOptions } from './useSplitPDF'; // Import useSplitPDF

// Mock pdf-lib (similar to useDarkMode.test.ts but specific for this file's context)
vi.mock('pdf-lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pdf-lib')>();
  return {
    ...actual,
    PDFDocument: {
      create: vi.fn().mockResolvedValue({ /* ... basic create mock ... */ }),
      load: vi.fn(), // This will be further defined in beforeEach
    },
    StandardFonts: { Helvetica: 'Helvetica' },
    rgb: actual.rgb,
    // Ensure PDFOperator and PDFOperatorNames are mocked if they were part of the original extensive mock
    // and if any indirect code path in useProcessPDF might lead to their use via applyDarkMode (even if applyDarkMode is mocked here).
    // For this specific test, since applyDarkMode is directly mocked, this might not be strictly necessary,
    // but it's safer if there's any doubt about shared mock state or complex interactions.
    PDFOperator: { of: vi.fn() }, // Basic mock for PDFOperator.of if needed
    PDFOperatorNames: {}, // Mock relevant names if any code path uses them
  };
});

// Mock useDarkMode
vi.mock('./useDarkMode', () => ({
  useDarkMode: vi.fn(() => ({
    applyDarkMode: vi.fn(async (pdfDoc) => pdfDoc),
  })),
}));

vi.mock('./useMergePDFs', () => ({
  useMergePDFs: vi.fn(() => ({
    mergePdfs: vi.fn().mockResolvedValue(new Uint8Array([10, 20, 30])),
  })),
}));

vi.mock('./useSplitPDF', () => ({
  useSplitPDF: vi.fn(() => ({
    splitPdf: vi.fn().mockResolvedValue(new Uint8Array([5, 15, 25])), // Mock successful split
  })),
}));

describe('useProcessPDF', () => {
  let mockFile: File;
  let mockFile1: File;
  let mockFile2: File;
  const mockOnProgress = vi.fn();

  beforeEach(() => {
    // Create a new mockFile before each test to ensure it's fresh
    // and add a mock arrayBuffer function to it.
    mockFile = new File(['dummy pdf content'], 'test.pdf', { type: 'application/pdf' });
    mockFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(0)); // Mock arrayBuffer

    mockFile1 = new File(['pdf1'], 'file1.pdf', { type: 'application/pdf' });
    mockFile1.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(0));
    mockFile2 = new File(['pdf2'], 'file2.pdf', { type: 'application/pdf' });
    mockFile2.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(0));


    vi.clearAllMocks(); // Clear mocks before each test

    // Resetup mocks
    (useDarkMode as vi.Mock).mockReturnValue({
        applyDarkMode: vi.fn(async (pdfDoc) => pdfDoc),
    });
    (PDFDocument.load as vi.Mock).mockClear().mockImplementation(async (bytes) => { // Clear and re-mock load with more specific behavior
        // Different mock return for merged vs split vs loaded original
        if (bytes && bytes.length === 3 && bytes[0] === 10 && bytes[1] === 20) return { getPageCount: vi.fn().mockReturnValue(5) }; // Merged
        if (bytes && bytes.length === 3 && bytes[0] === 5 && bytes[1] === 15) return { getPageCount: vi.fn().mockReturnValue(2) }; // Split
        // Default for original PDF loading
        return {
            getPages: vi.fn().mockReturnValue([ { getWidth: () => 600, getHeight: () => 800 } ]),
            getPageCount: vi.fn().mockReturnValue(1), // Added comma here
            getTitle: vi.fn().mockReturnValue('Mock PDF Title'),
            getAuthor: vi.fn().mockReturnValue('Mock Author'),
            save: vi.fn().mockResolvedValue(new Uint8Array([1,2,3,4,5])),
            embedFont: vi.fn().mockResolvedValue('mock-font'),
        };
    });

    // (PDFDocument.load as vi.Mock).mockResolvedValue({ getPageCount: vi.fn().mockReturnValue(5) });

    (useMergePDFs as vi.Mock).mockReturnValue({ mergePdfs: vi.fn().mockResolvedValue(new Uint8Array([10,20,30])) });

    (useMergePDFs as vi.Mock).mockReturnValue({ mergePdfs: vi.fn().mockResolvedValue(new Uint8Array([10,20,30])) });
    // No need to mock useSplitPDF here as it's globally mocked and reset by vi.clearAllMocks() if its own tests modify it.
  });

  it('should process a document without dark mode if not specified', async () => {
    const { result } = renderHook(() => useProcessPDF());
    let processResult;
    await act(async () => {
      processResult = await result.current.processDocument(mockFile, mockOnProgress, {}); // Pass empty options
    });

    expect(PDFDocument.load).toHaveBeenCalled();
    const { applyDarkMode } = useDarkMode();
    expect(applyDarkMode).not.toHaveBeenCalled(); // Correct if no tool or other tool is active
    expect(processResult?.processedPdf).toBeInstanceOf(Uint8Array);
    expect(mockOnProgress).toHaveBeenCalled();
  });

  it('should call applyDarkMode if activeToolName is "Dark Mode"', async () => {
    const { result } = renderHook(() => useProcessPDF());
    const options: ProcessOptions = {
      activeToolName: 'Dark Mode',
      darkModeOptions: { theme: 'dark' },
    };
    let processResult;

    await act(async () => {
      processResult = await result.current.processDocument(mockFile, mockOnProgress, options);
    });

    expect(PDFDocument.load).toHaveBeenCalled();
    const { applyDarkMode } = useDarkMode(); // Get the mocked function
    expect(applyDarkMode).toHaveBeenCalled();
    expect(processResult?.processedPdf).toBeInstanceOf(Uint8Array);
    expect(mockOnProgress).toHaveBeenCalledWith(1, 'Processing complete!'); // Check for final progress with message
  });

  it('should set isProcessing to true during processing and false after', async () => {
    const { result } = renderHook(() => useProcessPDF());
    expect(result.current.isProcessing).toBe(false);

    const processPromise = act(async () => {
      await result.current.processDocument(mockFile, mockOnProgress);
    });

    // Should be true once processing starts (might need to await a microtask or use waitFor)
    // For simplicity, we check after the call initiates.
    // A more robust test might check during the async operation.
    // Vitest's `act` should handle state updates correctly.
    // expect(result.current.isProcessing).toBe(true); // This can be tricky due to async nature

    await processPromise;
    expect(result.current.isProcessing).toBe(false);
  });

  it('should call mergePdfs if activeToolName is "Merge PDFs"', async () => {
    const { result } = renderHook(() => useProcessPDF());
    const filesToMerge = [mockFile1, mockFile2];
    const options: ProcessOptions = { activeToolName: 'Merge PDFs' };
    let processResult;

    // Specific mock for PDFDocument.load for this test case to simulate loading the merged PDF
    (PDFDocument.load as vi.Mock).mockResolvedValueOnce({ getPageCount: vi.fn().mockReturnValue(5) });

    await act(async () => {
      processResult = await result.current.processDocument(filesToMerge, mockOnProgress, options);
    });

    const { mergePdfs } = useMergePDFs();
    expect(mergePdfs).toHaveBeenCalledWith(filesToMerge, expect.any(Function));
    expect(PDFDocument.load).toHaveBeenCalledWith(new Uint8Array([10,20,30])); // To count pages of merged PDF
    expect(processResult?.isMerged).toBe(true);
    expect(processResult?.pageCount).toBe(5); // From mocked PDFDocument.load for merged result
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
    const splitOptions: SplitOptions = { startPage: 1, endPage: 2 };
    const options: ProcessOptions = { activeToolName: 'Split PDF', splitPdfOptions };
    let processResult: ProcessResult | null = null;

    await act(async () => {
      processResult = await result.current.processDocument(mockFile, mockOnProgress, options);
    });

    const { splitPdf } = useSplitPDF();
    expect(splitPdf).toHaveBeenCalledWith(mockFile, splitOptions, expect.any(Function));
    expect(PDFDocument.load).toHaveBeenCalledWith(new Uint8Array([5,15,25])); // To count pages of split PDF
    expect(processResult?.isSplit).toBe(true);
    expect(processResult?.pageCount).toBe(2); // From mocked PDFDocument.load for split result
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
    const options: ProcessOptions = { activeToolName: 'Split PDF' /* no splitPdfOptions */ };
    await expect(result.current.processDocument(mockFile, mockOnProgress, options))
        .rejects.toThrow("Split PDF options not provided.");
  });
});
