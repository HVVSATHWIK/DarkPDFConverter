global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
} as any;

import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';


import PDFPreview from './PDFPreview';
import * as usePdfBufferModule from '../../hooks/usePdfBuffer';
import { pdfjs } from 'react-pdf';

// Mock react-pdf
// We need to attach the mock function to the specific pdfjs object export
const mockGetDocument = vi.fn();
vi.mock('react-pdf', () => {
    return {
        pdfjs: {
            GlobalWorkerOptions: { workerSrc: '' },
            getDocument: vi.fn(),
            version: '5.4.296'
        },
        Document: ({ children }: any) => <div data-testid="document-mock">{children}</div>,
        Page: (props: any) => <div data-testid="page-mock" data-scale={props.scale} data-width={props.width}>Page Rendered</div>,
    };
});

// Mock react-window to just render something simple
vi.mock('react-window', () => ({
    VariableSizeList: ({ children }: any) => (
        <div data-testid="list-mock">
            {/* Render just one item to trigger the children render prop */}
            {children({ index: 0, style: {} })}
        </div>
    )
}));

// Mock the usePdfBuffer hook
vi.mock('../../hooks/usePdfBuffer', () => ({
    usePdfBuffer: vi.fn(),
}));

describe('PDFPreview Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset getDocument mock implementation
        (pdfjs.getDocument as any) = mockGetDocument;
        mockGetDocument.mockReturnValue({
            promise: Promise.resolve({
                numPages: 1,
                getPage: () => Promise.resolve({
                    getViewport: () => ({ height: 500, width: 400 })
                })
            })
        });
    });

    it('shows loading state when buffering', () => {
        vi.mocked(usePdfBufferModule.usePdfBuffer).mockReturnValue({ status: 'loading' });
        render(<PDFPreview file={null} />);
        expect(screen.getByText('Buffering PDF...')).toBeInTheDocument();
    });

    it('shows error state when buffer fails', () => {
        vi.mocked(usePdfBufferModule.usePdfBuffer).mockReturnValue({
            status: 'error',
            error: new Error('Test Error')
        });
        render(<PDFPreview file={null} />);
        expect(screen.getByText('Error loading PDF buffer.')).toBeInTheDocument();
    });

    it('initializes PDF worker with local source', () => {
        // Just importing the component triggers the top-level code? 
        // We might need to check if the file execution sets it.
        // Since the component is already imported, we check the global object.
        expect(pdfjs.GlobalWorkerOptions.workerSrc).toContain('pdf.worker.min.mjs');
    });

    it('loads document with standard buffer handling (non-shared)', async () => {
        const mockBuffer = new ArrayBuffer(10);
        vi.mocked(usePdfBufferModule.usePdfBuffer).mockReturnValue({
            status: 'ready',
            buffer: mockBuffer,
            isShared: false
        });

        render(<PDFPreview file={new Blob([])} />);

        await waitFor(() => {
            expect(mockGetDocument).toHaveBeenCalled();
        });

        // Check argument was wrapped in Uint8Array
        const args = mockGetDocument.mock.calls[0][0];
        expect(args).toHaveProperty('data');
        expect(args.data).toBeInstanceOf(Uint8Array);
        // Should effectively be the same length
        expect(args.data.byteLength).toBe(10);
    });

    it('clones buffer when using SharedArrayBuffer', async () => {
        // Simulate SAB environment if possible, or just trust the mock state
        // Since we mock usePdfBuffer, we can just say isShared: true
        const mockSAB = new ArrayBuffer(20); // Using AB to simulate SAB in Node environment if SAB not avail
        vi.mocked(usePdfBufferModule.usePdfBuffer).mockReturnValue({
            status: 'ready',
            buffer: mockSAB, // In code it's cast, so this is fine for test
            isShared: true
        });

        render(<PDFPreview file={new Blob([])} />);

        await waitFor(() => {
            expect(mockGetDocument).toHaveBeenCalled();
        });

        const args = mockGetDocument.mock.calls[0][0];
        expect(args).toHaveProperty('data');
        expect(args.data).toBeInstanceOf(Uint8Array);

        // The key logic: it should be a COPY.
        // In the code: new Uint8Array(buffer).slice(0)
        // This creates a new buffer. 
        // We can verify it's not the exact same buffer reference if we could access the backing buffer
        // standard Uint8Array(buffer) shares the buffer. .slice(0) creates a new one.

        expect(args.data.buffer).not.toBe(mockSAB);
    });
    it('passes correct props to Page (no double scaling)', async () => {
        const mockBuffer = new ArrayBuffer(10);
        vi.mocked(usePdfBufferModule.usePdfBuffer).mockReturnValue({
            status: 'ready',
            buffer: mockBuffer,
            isShared: false
        });

        render(<PDFPreview file={new Blob([])} />);

        await waitFor(() => {
            expect(screen.getByTestId('page-mock')).toBeInTheDocument();
        });

        const pageMock = screen.getByTestId('page-mock');
        expect(pageMock).toHaveAttribute('data-scale', '1');
        expect(pageMock).not.toHaveAttribute('data-width');
    });
});
