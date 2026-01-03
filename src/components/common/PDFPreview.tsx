import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { VariableSizeList as List } from 'react-window';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { usePdfBuffer } from '../../hooks/usePdfBuffer';
import { MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import { TiltCard } from './TiltCard';

// Configure worker dynamically
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewProps {
    file: string | File | Blob | { data: Uint8Array } | null;
}

export default function PDFPreview({ file }: PDFPreviewProps) {
    const bufferState = usePdfBuffer(file);
    const [pdfDocument, setPdfDocument] = useState<any>(null);
    const [pageSizes, setPageSizes] = useState<{ height: number; width: number }[]>([]);
    const [scale, setScale] = useState<number>(1.0);
    const listRef = useRef<List>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);

    // Metadata Pre-flight
    useEffect(() => {
        if (bufferState.status !== 'ready') return;

        const loadMetadata = async () => {
            try {
                // Cast to any because pdfjs-dist types might not explicitly support SharedArrayBuffer yet, 
                // even though the worker does.
                const loadingTask = pdfjs.getDocument(bufferState.buffer as any);
                const pdfDoc = await loadingTask.promise;
                setPdfDocument(pdfDoc);

                const sizes: { height: number; width: number }[] = [];
                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    const page = await pdfDoc.getPage(i);
                    const viewport = page.getViewport({ scale: 1.0 });
                    sizes.push({ height: viewport.height, width: viewport.width });
                }
                setPageSizes(sizes);
            } catch (err) {
                console.error("Metadata Load Failed", err);
            }
        };

        loadMetadata();
    }, [bufferState]);

    // Container Resize Observer
    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                setContainerWidth(entries[0].contentRect.width);
            }
        });
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Auto-Scale Logic: Fit Width
    useEffect(() => {
        if (containerWidth && pageSizes.length > 0) {
            // Base on first page
            const firstPageWidth = pageSizes[0].width;
            const targetScale = (containerWidth - 40) / firstPageWidth;
            // Cap at 1.2 to avoid getting huge
            setScale(Math.min(targetScale, 1.2));
        }
    }, [containerWidth, pageSizes.length]); // Ensure dependencies are correct

    // Recalculate list heights when scale changes
    useEffect(() => {
        listRef.current?.resetAfterIndex(0);
    }, [scale]);

    const getItemSize = (index: number) => {
        if (!pageSizes[index]) return 800;
        return (pageSizes[index].height * scale) + 20;
    };

    function zoomIn() { setScale(s => s + 0.1); }
    function zoomOut() { setScale(s => Math.max(0.2, s - 0.1)); }

    if (bufferState.status === 'loading') return <div className="text-indigo-900 font-medium p-4">Buffering PDF...</div>;
    if (bufferState.status === 'error') return <div className="text-red-500 font-medium p-4">Error loading PDF buffer.</div>;
    if (!pdfDocument || pageSizes.length === 0 || bufferState.status !== 'ready') return <div className="text-indigo-900 font-medium p-4">Loading Metadata...</div>;

    return (
        <div className="w-full h-full flex flex-col" ref={containerRef}>
            <TiltCard className="w-full h-full flex flex-col">
                {/* Controls */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 text-indigo-950 mb-2 bg-white/80 backdrop-blur-md border border-white/50 px-6 py-2 rounded-full shadow-lg shadow-indigo-500/10 z-30 transition-all hover:scale-105">
                    <button onClick={zoomOut} className="p-1 hover:bg-indigo-50 text-indigo-600 rounded-full transition-colors"><MagnifyingGlassMinusIcon className="w-5 h-5" /></button>
                    <span className="text-xs font-semibold tracking-wide">{Math.round(scale * 100)}%</span>
                    <button onClick={zoomIn} className="p-1 hover:bg-indigo-50 text-indigo-600 rounded-full transition-colors"><MagnifyingGlassPlusIcon className="w-5 h-5" /></button>
                </div>

                {/* Virtualized List Container */}
                {/* We need p-6 to account for the card padding and give space */}
                <div className="flex-1 w-full overflow-hidden rounded-[20px] bg-white/40 mt-16 mb-4 mx-4 relative border border-white/30 inner-shadow">
                    <Document file={bufferState.buffer as any} className="hidden" />

                    <List
                        height={550} // Approximate static height, dynamic sizing is tough inside Tilt without ResizeObserver on the inner container
                        itemCount={pdfDocument.numPages}
                        itemSize={getItemSize}
                        width="100%"
                        ref={listRef}
                        className="no-scrollbar"
                    >
                        {({ index, style }: { index: number, style: React.CSSProperties }) => (
                            <div style={{ ...style, display: 'flex', justifyContent: 'center' }}>
                                <Page
                                    pdf={pdfDocument}
                                    pageIndex={index}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    scale={scale}
                                    width={pageSizes[index]?.width}
                                    loading={<div className="h-full w-full bg-slate-100 animate-pulse rounded-lg" />}
                                    className="shadow-xl shadow-indigo-900/10 rounded-lg"
                                />
                            </div>
                        )}
                    </List>
                </div>
            </TiltCard>
        </div>
    );
}
