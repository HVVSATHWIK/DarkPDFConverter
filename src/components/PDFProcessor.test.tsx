/// <reference types="vitest/globals" />
// src/components/PDFProcessor.test.tsx
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import PDFProcessorWithErrorBoundary, { PDFProcessorProps } from './PDFProcessor';
import { useProcessPDF } from '@/hooks/useProcessPDF'; // Import the hook itself
import { Tool } from '@/types';
import { SplitOptions } from '@/hooks/useSplitPDF';

// Mock the hook module
const mockProcessDocumentGlobal = vi.fn(); // This will be our controllable mock function
vi.mock('@/hooks/useProcessPDF', () => ({
  // Default export: no, named export: yes
  useProcessPDF: vi.fn(() => ({ // The function useProcessPDF itself is a vi.fn() after this
    processDocument: mockProcessDocumentGlobal,
    isProcessing: false, // Default mock state
  })),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

const createMockFile = (name: string, type: string = 'application/pdf', size: number = 1024) => {
  const file = new File(['dummy content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  (file as any).arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(10));
  return file;
};

describe('PDFProcessor', () => {
  const mockOnComplete = vi.fn();
  const mockOnError = vi.fn();
  let defaultProps: PDFProcessorProps;

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'mock-url'); // Reset global mocks too
    global.URL.revokeObjectURL = vi.fn();

    defaultProps = {
      onComplete: mockOnComplete,
      onError: mockOnError,
      allowMultipleFiles: false,
      toolId: 'test-tool',
      activeTool: { id: 99, name: 'Test Tool', description: 'A test tool', icon: 'T' },
      processActionName: 'Process Test File',
    };

    // Default behavior for the global mock function for most tests
    mockProcessDocumentGlobal.mockResolvedValue({
      pageCount: 1,
      title: 'processed.pdf',
      processedPdf: new Uint8Array([1, 2, 3]),
      metadata: {},
      isMerged: false,
      isSplit: false,
    });
    // Default behavior for the hook itself
     vi.mocked(useProcessPDF).mockReturnValue({
        processDocument: mockProcessDocumentGlobal,
        isProcessing: false,
    });
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
      isSplit: false,
    };
    mockProcessDocumentGlobal.mockResolvedValue(specificMockSuccessResult);

    const { container } = render(<PDFProcessorWithErrorBoundary {...defaultProps} />);
    const fileInput = container.querySelector(`#pdf-upload-${defaultProps.toolId}`) as HTMLInputElement;
    const file = createMockFile('single.pdf');

    await act(async () => { fireEvent.change(fileInput, { target: { files: [file] } }); });
    await screen.findByText('single.pdf (1.0 KB)');

    const processButton = screen.getByRole('button', { name: defaultProps.processActionName });
    expect(processButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(processButton);
      // await new Promise(setImmediate); // May not be needed if waitFor is used correctly
    });

    await waitFor(() =>
      expect(mockProcessDocumentGlobal).toHaveBeenCalledWith(file, expect.any(Function), expect.objectContaining({ activeToolName: 'Test Tool' }))
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
    mockProcessDocumentGlobal.mockImplementation(async (_, onProgressCallback) => { // selectedFile changed to _
      if (onProgressCallback) {
        onProgressCbCaptor.push(onProgressCallback);
      }
      return new Promise(() => {});
    });

    vi.mocked(useProcessPDF).mockReturnValue({ // Initial state: not processing
      processDocument: mockProcessDocumentGlobal,
      isProcessing: false,
    });

    const { container, rerender } = render(<PDFProcessorWithErrorBoundary {...defaultProps} />);
    const fileInput = container.querySelector(`#pdf-upload-${defaultProps.toolId}`) as HTMLInputElement;
    const file = createMockFile('test.pdf');
    await act(async () => { fireEvent.change(fileInput, { target: { files: [file] } }); });
    await screen.findByText('test.pdf (1.0 KB)');

    const processButton = screen.getByRole('button', { name: defaultProps.processActionName });
    await act(async () => { fireEvent.click(processButton); });

    vi.mocked(useProcessPDF).mockReturnValue({ // Simulate hook update: now processing
      processDocument: mockProcessDocumentGlobal,
      isProcessing: true,
    });

    if (onProgressCbCaptor.length > 0) {
      await act(async () => { onProgressCbCaptor[0](0.5, "progress update"); });
    } else {
      throw new Error("onProgress callback was not captured by mockProcessDocumentGlobal");
    }

    rerender(<PDFProcessorWithErrorBoundary {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Processing: 50%/i)).toBeInTheDocument();
      const progressBarFill = screen.getByLabelText('Processing progress: 50%').firstChild as HTMLElement;
      expect(progressBarFill.style.width).toBe('50%');
    });
  });

  it('handles processing error and calls onError', async () => {
    const errorMessage = "Something went wrong during processing";
    mockProcessDocumentGlobal.mockRejectedValue(new Error(errorMessage));

    const { container } = render(<PDFProcessorWithErrorBoundary {...defaultProps} />);
    const fileInput = container.querySelector(`#pdf-upload-${defaultProps.toolId}`) as HTMLInputElement;
    const file = createMockFile('error.pdf');
    await act(async () => { fireEvent.change(fileInput, { target: { files: [file] } }); });
    await screen.findByText('error.pdf (1.0 KB)');

    const processButton = screen.getByRole('button', { name: defaultProps.processActionName });
    await act(async () => { fireEvent.click(processButton); });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
      if (mockOnError.mock.calls.length > 0) {
        expect(mockOnError.mock.calls[0][0].message).toBe(errorMessage);
      }
    });
    await waitFor(() =>
      expect(mockProcessDocumentGlobal).toHaveBeenCalledWith(file, expect.any(Function), expect.anything())
    );
  });

  it('calls processDocument with multiple files when Merge PDFs tool is active', async () => {
    const mockMergeResult = {
        isMerged: true, pageCount: 2, title: 'merged.pdf', processedPdf: new Uint8Array([1,2,3,4,5])
    };
    mockProcessDocumentGlobal.mockResolvedValue(mockMergeResult);
    vi.mocked(useProcessPDF).mockReturnValue({ processDocument: mockProcessDocumentGlobal, isProcessing: false });


    const mergeTool: Tool = { id: 2, name: 'Merge PDFs', description: 'Merge multiple PDFs', icon: ' M ' };
    const { container } = render(
      <PDFProcessorWithErrorBoundary {...defaultProps} activeTool={mergeTool} allowMultipleFiles={true} processActionName="Apply Merge PDFs" toolId={mergeTool.id} />
    );

    const fileInput = container.querySelector(`#pdf-upload-${mergeTool.id}`) as HTMLInputElement;
    const file1 = createMockFile('file1.pdf');
    const file2 = createMockFile('file2.pdf');

    await act(async () => { fireEvent.change(fileInput, { target: { files: [file1, file2] } }); });
    await screen.findByText('file1.pdf (1.0 KB)');
    await screen.findByText('file2.pdf (1.0 KB)');

    const processButton = screen.getByRole('button', { name: "Apply Merge PDFs" });
    expect(processButton).not.toBeDisabled();

    await act(async () => { fireEvent.click(processButton); });

    await waitFor(() => {
        expect(mockProcessDocumentGlobal).toHaveBeenCalledWith(
            [file1, file2], expect.any(Function), expect.objectContaining({ activeToolName: 'Merge PDFs' })
        );
    });
    await waitFor(() => { expect(mockOnComplete).toHaveBeenCalledWith(mockMergeResult); });
  });

  it('calls processDocument with splitPdfOptions when Split PDF tool is active', async () => {
    const splitOptions: SplitOptions = { startPage: 1, endPage: 3 };
    const mockSplitResult = {
        isSplit: true, pageCount: 3, title: 'split.pdf', processedPdf: new Uint8Array([5,6,7])
    };
    mockProcessDocumentGlobal.mockResolvedValue(mockSplitResult);
    vi.mocked(useProcessPDF).mockReturnValue({ processDocument: mockProcessDocumentGlobal, isProcessing: false });


    const splitTool: Tool = { id: 3, name: 'Split PDF', description: 'Split a PDF', icon: 'S' };
    const { container } = render( // Capture container
        <PDFProcessorWithErrorBoundary
            {...defaultProps}
            activeTool={splitTool}
            splitPdfOptions={splitOptions}
            processActionName="Apply Split PDF"
            toolId={splitTool.id}
        />
    );

    const fileInput = container.querySelector(`#pdf-upload-${splitTool.id}`) as HTMLInputElement;
    const file = createMockFile('tosplit.pdf');
    await act(async () => { fireEvent.change(fileInput, { target: { files: [file] } }); });
    await screen.findByText('tosplit.pdf (1.0 KB)');

    const processButton = screen.getByRole('button', { name: "Apply Split PDF" });
    expect(processButton).not.toBeDisabled();

    await act(async () => { fireEvent.click(processButton); });

    await waitFor(() => {
        expect(mockProcessDocumentGlobal).toHaveBeenCalledWith(
            file, expect.any(Function), expect.objectContaining({ activeToolName: 'Split PDF', splitPdfOptions: splitOptions })
        );
    });
    await waitFor(() => { expect(mockOnComplete).toHaveBeenCalledWith(mockSplitResult); });
  });
});

vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));
