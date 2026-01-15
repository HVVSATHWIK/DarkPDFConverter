import { useState, useRef, useEffect } from 'react';
import { Page, pdfjs } from 'react-pdf';
import { VariableSizeList as List } from 'react-window';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { usePdfBuffer } from '../../hooks/usePdfBuffer';
import { MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import { TiltCard } from './TiltCard';

// Fix 10 (Refined): Use Vite's explicit explicit URL import to guarantee version match
// This resolves directly to the installed 'pdfjs-dist@5.4.296' file.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface PDFPreviewProps {
    file: string | File | Blob | { data: Uint8Array } | null;
}

export default function PDFPreview({ file }: PDFPreviewProps) {
    const bufferState = usePdfBuffer(file);
    const [pdfDocument, setPdfDocument] = useState<any>(null);
    const [pageSizes, setPageSizes] = useState<{ height: number; width: number }[]>([]);
    const [scale, setScale] = useState<number>(1.0);
    const listRef = useRef<List>(null);
    const listHostRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [listHostHeight, setListHostHeight] = useState<number>(0);

    // Metadata Pre-flight
    useEffect(() => {
        if (bufferState.status !== 'ready') return;

        const loadMetadata = async () => {
            try {
                // Fix: Wrapper + Copy. pdfjs-dist expects TypedArray/ArrayBuffer.
                // If the buffer is a SAB (isShared), we MUST copy it to a standard ArrayBuffer (via slice)
                // because pdf.worker cannot transfer SABs and will throw DataCloneError.
                let finalBuffer: Uint8Array;
                if (bufferState.isShared) {
                    finalBuffer = new Uint8Array(bufferState.buffer as ArrayBufferLike).slice(0); // Copy to standard AB
                } else {
                    finalBuffer = new Uint8Array(bufferState.buffer as ArrayBufferLike); // Just wrap
                }

                const loadingTask = pdfjs.getDocument({ data: finalBuffer });
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

    // Measure the actual scroll host (the box that contains the virtualized list).
    // This avoids feedback loops where the outer container height depends on the list height.
    useEffect(() => {
        if (!listHostRef.current) return;

        const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            if (!entry) return;
            setContainerWidth(entry.contentRect.width);
            setListHostHeight(entry.contentRect.height);
        });

        observer.observe(listHostRef.current);
        return () => observer.disconnect();
    }, []);

    // Auto-Scale Logic: Fit Page (prevents the "only half visible" first impression).
    useEffect(() => {
        const first = pageSizes[0];
        if (!first) return;
        if (!containerWidth || !listHostHeight) return;

        const availableWidth = Math.max(0, containerWidth - 24); // padding + borders
        const availableHeight = Math.max(0, listHostHeight - 16); // breathing room
        if (!availableWidth || !availableHeight) return;

        const widthScale = availableWidth / first.width;
        const heightScale = availableHeight / first.height;
        const targetScale = Math.min(widthScale, heightScale);

        // Let the preview fill the available viewport while keeping the full page visible.
        // Clamp defensively to avoid extreme values.
        setScale(Math.max(0.1, Math.min(targetScale, 3.0)));
    }, [containerWidth, listHostHeight, pageSizes]);

    // Recalculate list heights when scale changes
    useEffect(() => {
        // Fix 3: Force update (true) to ensure cached measurements are cleared
        listRef.current?.resetAfterIndex(0, true);
    }, [scale]);

    const getItemSize = (index: number) => {
        if (!pageSizes[index]) return 800;
        // Fix 2: Virtualized height exactly matches rendered height
        // Page renders at (originalHeight * scale)
        // Add 24px vertical padding/margin
        return (pageSizes[index].height * scale) + 24;
    };

    // Fix 7: Normalize zoom clamping
    function zoomIn() { setScale(s => Math.min(2.5, s + 0.1)); } // Increased max zoom slightly
    function zoomOut() { setScale(s => Math.max(0.2, s - 0.1)); }

    if (bufferState.status === 'loading') return <div className="text-slate-200 font-medium p-4">Buffering PDF...</div>;
    if (bufferState.status === 'error') return <div className="text-rose-300 font-medium p-4">Error loading PDF buffer.</div>;
    if (!pdfDocument || pageSizes.length === 0 || bufferState.status !== 'ready') return <div className="text-slate-200 font-medium p-4">Loading Metadata...</div>;

    const computedHostHeight = listHostHeight || 220;
    const isSinglePage = pdfDocument.numPages === 1;

    return (
        <div className="w-full h-full min-h-0 flex flex-col overflow-hidden">
            <TiltCard className="w-full h-full flex flex-col overflow-hidden">
                <div className="h-full min-h-0 flex flex-col p-3 overflow-hidden">
                    {/* Controls */}
                    <div className="flex items-center justify-center pb-3">
                        <div className="flex items-center gap-4 text-slate-100 bg-slate-950/55 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full shadow-lg shadow-black/20">
                            <button onClick={zoomOut} className="p-1 hover:bg-white/10 text-slate-100 rounded-full transition-colors" aria-label="Zoom out"><MagnifyingGlassMinusIcon className="w-5 h-5" /></button>
                            <span className="text-xs font-semibold tracking-wide">{Math.round(scale * 100)}%</span>
                            <button onClick={zoomIn} className="p-1 hover:bg-white/10 text-slate-100 rounded-full transition-colors" aria-label="Zoom in"><MagnifyingGlassPlusIcon className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Virtualized List Container */}
                    <div
                        ref={listHostRef}
                        className={
                            "flex-1 min-h-[220px] w-full overflow-hidden rounded-[20px] bg-black/20 relative border border-white/10 " +
                            (isSinglePage ? 'flex items-center justify-center' : '')
                        }
                    >
                        <List
                            height={computedHostHeight}
                            itemCount={pdfDocument.numPages}
                            itemSize={getItemSize}
                            width="100%"
                            ref={listRef}
                            className="no-scrollbar"
                        >
                            {({ index, style }: { index: number, style: React.CSSProperties }) => (
                                <div style={{ ...style, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px' }}>
                                    <Page
                                        pdf={pdfDocument}
                                        pageIndex={index}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        scale={scale}
                                        devicePixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1}
                                        loading={<div className="h-full w-full bg-slate-100 animate-pulse rounded-lg" />}
                                        className="shadow-xl shadow-indigo-900/10 rounded-lg"
                                    />
                                </div>
                            )}
                        </List>
                    </div>
                </div>
            </TiltCard>
        </div>
    );
}
