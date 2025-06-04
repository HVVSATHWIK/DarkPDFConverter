// src/components/PDFProcessor.test.tsx
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import PDFProcessorWithErrorBoundary, { PDFProcessorProps } from './PDFProcessor';
import { useProcessPDF } from '@/hooks/useProcessPDF';
import { Tool } from '@/types';
import { SplitOptions } from '@/hooks/useSplitPDF';

// Mock the hook
const mockReturnedProcessDocument = vi.fn();
vi.mock('@/hooks/useProcessPDF', () => ({
  useProcessPDF: () => ({
    processDocument: mockReturnedProcessDocument,
    isProcessing: false, // Default mock value
  }),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL as they are used in handleProcessClick
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();


const createMockFile = (name: string, type: string = 'application/pdf', size: number = 1024) => {
  const file = new File(['dummy content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  (file as any).arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(10)); // Mock arrayBuffer
  return file;
};

describe('PDFProcessor', () => {
  const mockOnComplete = vi.fn();
  const mockOnError = vi.fn();
  let defaultProps: PDFProcessorProps;

  beforeEach(() => {
    vi.clearAllMocks();

    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();

    defaultProps = {
      onComplete: mockOnComplete,
      onError: mockOnError,
      allowMultipleFiles: false,
      toolId: 'test-tool',
      activeTool: { id: 'test', name: 'Test Tool', description: 'A test tool', icon: 'T' },
      processActionName: 'Process Test File',
      // splitPdfOptions is optional, so not needed in defaultProps unless specifically testing its absence/presence effect
    };

    mockReturnedProcessDocument.mockResolvedValue({ // Default resolution
      pageCount: 1,
      title: 'processed.pdf',
      processedPdf: new Uint8Array([1, 2, 3]),
      metadata: {},
      isMerged: false,
    });

    // Ensure the mock implementation is reset for useProcessPDF itself too
    (useProcessPDF as vi.Mock).mockImplementation(() => ({
        processDocument: mockReturnedProcessDocument,
        isProcessing: false,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders file input and allows file selection', async () => {
    const { container } = render(<PDFProcessorWithErrorBoundary {...defaultProps} />);
    const fileInput = container.querySelector(`#pdf-upload-${defaultProps.toolId}`) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const file = createMockFile('test.pdf');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(screen.getByText('test.pdf (1.0 KB)')).toBeInTheDocument();
  });


  it('calls processDocument on button click with a single file and calls onComplete', async () => {
    const specificMockSuccessResult = {
      pageCount: 1,
      title: 'singlefile.pdf',
      processedPdf: new Uint8Array([1, 2, 3, 4, 5]),
      metadata: { author: 'Test Author' },
      isMerged: false,
    };
    mockReturnedProcessDocument.mockImplementation(async () => { // Explicit async implementation
      return Promise.resolve(specificMockSuccessResult);
    });

    const { container } = render(<PDFProcessorWithErrorBoundary {...defaultProps} />);
    const fileInput = container.querySelector(`#pdf-upload-${defaultProps.toolId}`) as HTMLInputElement;
    const file = createMockFile('single.pdf');

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    await screen.findByText('single.pdf (1.0 KB)');

    const processButton = screen.getByRole('button', { name: defaultProps.processActionName });
    expect(processButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(processButton);
      await new Promise(setImmediate); // Flush microtasks
    });

    await waitFor(() =>
      expect(mockReturnedProcessDocument).toHaveBeenCalledWith(file, expect.any(Function), expect.objectContaining({ activeToolName: 'Test Tool' }))
    );
    await waitFor(() =>
      expect(mockOnComplete).toHaveBeenCalledWith(specificMockSuccessResult)
    );
    await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
        expect(screen.getByRole('link', { name: /Download Processed PDF/i })).toBeInTheDocument();
    });
  });

  it('displays progress bar when processing', async () => {
    const onProgressCbCaptor: ((p: number, m?: string) => void)[] = [];
    mockReturnedProcessDocument.mockImplementation(async (selectedFile, onProgressCallback) => {
      if (onProgressCallback) {
        onProgressCbCaptor.push(onProgressCallback);
      }
      return new Promise(() => {}); // Keep promise pending
    });

    (useProcessPDF as vi.Mock).mockImplementation(() => ({
      processDocument: mockReturnedProcessDocument,
      isProcessing: false, // Start with false
    }));

    const { container, rerender } = render(<PDFProcessorWithErrorBoundary {...defaultProps} />);
    const fileInput = container.querySelector(`#pdf-upload-${defaultProps.toolId}`) as HTMLInputElement;
    const file = createMockFile('test.pdf');
    await act(async () => { fireEvent.change(fileInput, { target: { files: [file] } }); });
    await screen.findByText('test.pdf (1.0 KB)');

    const processButton = screen.getByRole('button', { name: defaultProps.processActionName });

    await act(async () => { fireEvent.click(processButton); }); // This calls mockReturnedProcessDocument, which captures onProgressCb

    // Now, change the mock to simulate processing having started
    (useProcessPDF as vi.Mock).mockImplementation(() => ({
      processDocument: mockReturnedProcessDocument,
      isProcessing: true, // Now it's processing
    }));

    if (onProgressCbCaptor.length > 0) {
      await act(async () => { onProgressCbCaptor[0](0.5, "progress update"); });
    } else {
      throw new Error("onProgress callback was not captured");
    }

    rerender(<PDFProcessorWithErrorBoundary {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Processing: 50%/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    });
  });

  it('handles processing error and calls onError', async () => {
    const errorMessage = "Something went wrong during processing";
    mockReturnedProcessDocument.mockRejectedValue(new Error(errorMessage));

    const { container } = render(<PDFProcessorWithErrorBoundary {...defaultProps} />);
    const fileInput = container.querySelector(`#pdf-upload-${defaultProps.toolId}`) as HTMLInputElement;
    const file = createMockFile('error.pdf');
    await act(async () => { fireEvent.change(fileInput, { target: { files: [file] } }); });
    await screen.findByText('error.pdf (1.0 KB)');

    const processButton = screen.getByRole('button', { name: defaultProps.processActionName });
    await act(async () => { fireEvent.click(processButton); });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
      if (mockOnError.mock.calls.length > 0) { // Ensure it was called before accessing calls[0]
        expect(mockOnError.mock.calls[0][0].message).toBe(errorMessage);
      }
    });
    await waitFor(() =>
      expect(mockReturnedProcessDocument).toHaveBeenCalledWith(file, expect.any(Function), expect.anything())
    );
  });

  it('calls processDocument with multiple files when Merge PDFs tool is active', async () => {
    const mockMergeResult = {
        isMerged: true,
        pageCount: 2,
        title: 'merged.pdf',
        processedPdf: new Uint8Array([1,2,3,4,5])
    };
    mockReturnedProcessDocument.mockResolvedValue(mockMergeResult);

    const mergeTool: Tool = { id: 'merge', name: 'Merge PDFs', description: 'Merge multiple PDFs', icon: ' M ' };
    const { container } = render(
      <PDFProcessorWithErrorBoundary
        {...defaultProps}
        activeTool={mergeTool}
        allowMultipleFiles={true}
        processActionName="Apply Merge PDFs" // Explicitly set for this test
        toolId={mergeTool.id} // Ensure toolId is for merge tool
      />
    );

    const fileInput = container.querySelector(`#pdf-upload-${mergeTool.id}`) as HTMLInputElement;
    const file1 = createMockFile('file1.pdf');
    const file2 = createMockFile('file2.pdf');

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file1, file2] } });
    });

    await screen.findByText('file1.pdf (1.0 KB)');
    await screen.findByText('file2.pdf (1.0 KB)');

    const processButton = screen.getByRole('button', { name: "Apply Merge PDFs" });
    expect(processButton).not.toBeDisabled();

    await act(async () => { fireEvent.click(processButton); });

    await waitFor(() => {
        expect(mockReturnedProcessDocument).toHaveBeenCalledWith(
            [file1, file2],
            expect.any(Function),
            expect.objectContaining({ activeToolName: 'Merge PDFs' })
        );
    });
    await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(mockMergeResult);
    });
  });

  it('calls processDocument with splitPdfOptions when Split PDF tool is active', async () => {
    const splitOptions: SplitOptions = { startPage: 1, endPage: 3 };
    const mockSplitResult = {
        isSplit: true,
        pageCount: 3,
        title: 'split.pdf',
        processedPdf: new Uint8Array([5,6,7])
    };
    mockReturnedProcessDocument.mockResolvedValue(mockSplitResult);

    const splitTool: Tool = { id: 'split', name: 'Split PDF', description: 'Split a PDF', icon: 'S' };
    render(
        <PDFProcessorWithErrorBoundary
            {...defaultProps}
            activeTool={splitTool}
            splitPdfOptions={splitOptions} // Pass valid options
            processActionName="Apply Split PDF"
            toolId={splitTool.id} // Ensure toolId is for split tool
        />
    );

    const fileInput = screen.getByLabelText(/Drag & drop a PDF here/i) as HTMLInputElement;
    const file = createMockFile('tosplit.pdf');
    await act(async () => { fireEvent.change(fileInput, { target: { files: [file] } }); });
    await screen.findByText('tosplit.pdf (1.0 KB)');

    const processButton = screen.getByRole('button', { name: "Apply Split PDF" });
    expect(processButton).not.toBeDisabled();

    await act(async () => { fireEvent.click(processButton); });

    await waitFor(() => {
        expect(mockReturnedProcessDocument).toHaveBeenCalledWith(
            file,
            expect.any(Function),
            expect.objectContaining({ activeToolName: 'Split PDF', splitPdfOptions })
        );
    });
    await waitFor(() => { expect(mockOnComplete).toHaveBeenCalledWith(mockSplitResult); });
  });
});

// Minimal mock for ErrorBoundary
vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));
