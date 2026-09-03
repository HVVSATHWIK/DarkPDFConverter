import { useState, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { usePdfBuffer } from '../../hooks/usePdfBuffer';
import {
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

// Initialize PDF.js worker using local Vite asset URL
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

interface PDFPreviewProps {
  file: string | File | Blob | { data: Uint8Array } | null;
}

export default function PDFPreview({ file }: PDFPreviewProps) {
  const bufferState = usePdfBuffer(file);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSizes, setPageSizes] = useState<{ height: number; width: number }[]>([]);
  const [scale, setScale] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<'single' | 'scroll'>('single');
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalizing file buffer for react-pdf Document component
  const documentFile = useMemo(() => {
    if (bufferState.status !== 'ready') return null;
    return { data: new Uint8Array(bufferState.buffer as ArrayBufferLike).slice(0) };
  }, [bufferState]);

  // Pre-load document metadata (dimensions and page count)
  useEffect(() => {
    if (bufferState.status !== 'ready') return;

    let isMounted = true;
    const loadMetadata = async () => {
      try {
        const finalBuffer = new Uint8Array(bufferState.buffer as ArrayBufferLike).slice(0);
        const loadingTask = pdfjs.getDocument({ data: finalBuffer });
        const pdfDoc = await loadingTask.promise;

        if (!isMounted) return;
        setNumPages(pdfDoc.numPages);
        setCurrentPage(1);

        const sizes: { height: number; width: number }[] = [];
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 1.0 });
          sizes.push({ height: viewport.height, width: viewport.width });
        }
        if (isMounted) {
          setPageSizes(sizes);
        }
      } catch (err) {
        console.error('Metadata Load Failed in PDFPreview:', err);
      }
    };

    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, [bufferState]);

  // Fit Width handler
  const handleFitWidth = () => {
    const activePageSize = pageSizes[currentPage - 1] || pageSizes[0];
    const clientWidth = containerRef.current?.clientWidth || 800;
    if (activePageSize && activePageSize.width > 0) {
      const padding = 48; // Horizontal spacing
      const availableWidth = Math.max(150, clientWidth - padding);
      const computedScale = +(availableWidth / activePageSize.width).toFixed(2);
      setScale(Math.max(0.2, Math.min(computedScale, 3.0)));
    } else {
      setScale(1.2);
    }
  };

  // Fit to Page handler
  const handleFitPage = () => {
    const activePageSize = pageSizes[currentPage - 1] || pageSizes[0];
    const clientWidth = containerRef.current?.clientWidth || 800;
    const clientHeight = containerRef.current?.clientHeight || 600;
    if (activePageSize && activePageSize.width > 0 && activePageSize.height > 0) {
      const padX = 48;
      const padY = 48;
      const availableWidth = Math.max(150, clientWidth - padX);
      const availableHeight = Math.max(150, clientHeight - padY);
      const computedScale = +(
        Math.min(availableWidth / activePageSize.width, availableHeight / activePageSize.height)
      ).toFixed(2);
      setScale(Math.max(0.2, Math.min(computedScale, 3.0)));
    } else {
      setScale(0.85);
    }
  };

  const zoomIn = () => setScale((s) => Math.min(3.0, +(s + 0.15).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.2, +(s - 0.15).toFixed(2)));
  const resetZoom = () => setScale(1.0);

  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(numPages || 1, p + 1));

  if (bufferState.status === 'loading') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-slate-300 gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Buffering PDF...</span>
      </div>
    );
  }

  if (bufferState.status === 'error') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-rose-300 gap-2">
        <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/20">
          <DocumentIcon className="w-6 h-6 text-rose-400" />
        </div>
        <p className="text-sm font-semibold">Error loading PDF buffer.</p>
        <p className="text-xs text-rose-400/80">{bufferState.error.message}</p>
      </div>
    );
  }

  if (!documentFile || bufferState.status !== 'ready') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading document metadata...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#080b12] text-slate-100 overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="h-12 shrink-0 border-b border-white/10 px-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md z-20">
        {/* Pagination & Mode Controls */}
        <div className="flex items-center gap-2">
          {numPages > 1 && viewMode === 'single' && (
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
              <button
                type="button"
                onClick={prevPage}
                disabled={currentPage <= 1}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-200"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-medium text-slate-300 font-mono">
                {currentPage} / {numPages}
              </span>
              <button
                type="button"
                onClick={nextPage}
                disabled={currentPage >= numPages}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-200"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {numPages > 1 && (
            <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2 py-1 rounded transition-colors ${
                  viewMode === 'single'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Single
              </button>
              <button
                type="button"
                onClick={() => setViewMode('scroll')}
                className={`px-2 py-1 rounded transition-colors ${
                  viewMode === 'scroll'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({numPages})
              </button>
            </div>
          )}
          {numPages === 1 && (
            <span className="text-xs text-slate-400 font-mono px-2.5 py-1 bg-white/5 rounded-md border border-white/5">
              1 Page
            </span>
          )}
        </div>

        {/* Zoom & Fit Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              type="button"
              onClick={zoomOut}
              className="p-1.5 rounded hover:bg-white/10 active:bg-white/20 transition-colors text-slate-300 hover:text-white"
              title="Zoom out (-15%)"
              aria-label="Zoom out"
            >
              <MagnifyingGlassMinusIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="px-2 py-0.5 text-xs font-semibold text-slate-300 hover:text-white font-mono hover:bg-white/10 rounded transition-colors"
              title="Reset Zoom to 100%"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              className="p-1.5 rounded hover:bg-white/10 active:bg-white/20 transition-colors text-slate-300 hover:text-white"
              title="Zoom in (+15%)"
              aria-label="Zoom in"
            >
              <MagnifyingGlassPlusIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleFitPage}
            className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/20 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Fit to Page"
            aria-label="Fit to Page"
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleFitWidth}
            className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/20 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Fit to Width"
          >
            Fit Width
          </button>
        </div>
      </div>

      {/* Main PDF Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 w-full overflow-auto p-4 sm:p-6 flex flex-col items-center bg-[#040711]"
      >
        <Document
          file={documentFile}
          onLoadSuccess={({ numPages: count }) => setNumPages(count)}
          loading={
            <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Rendering PDF pages...</span>
            </div>
          }
          error={
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-center">
              <p className="text-sm font-semibold">Failed to render PDF</p>
              <p className="text-xs text-rose-400/80 mt-1">
                The PDF file structure could not be parsed by the viewer.
              </p>
            </div>
          }
          className="flex flex-col items-center gap-6 max-w-full my-4"
        >
          {viewMode === 'single' ? (
            <div className="relative shadow-2xl shadow-black/90 rounded-xl overflow-hidden border border-white/15 bg-slate-950">
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                devicePixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1}
                loading={
                  <div className="w-[450px] h-[600px] bg-slate-900/60 animate-pulse flex items-center justify-center text-slate-500 rounded-lg">
                    <span className="text-xs font-mono">Loading Page {currentPage}...</span>
                  </div>
                }
                className="overflow-hidden"
              />
            </div>
          ) : (
            Array.from({ length: numPages || 1 }, (_, index) => (
              <div
                key={`page_${index + 1}`}
                className="relative shadow-2xl shadow-black/90 rounded-xl overflow-hidden border border-white/15 bg-slate-950 flex flex-col items-center"
              >
                <div className="absolute top-2 left-2 z-10 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 border border-white/10">
                  Page {index + 1}
                </div>
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  devicePixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1}
                  loading={
                    <div className="w-[450px] h-[600px] bg-slate-900/60 animate-pulse flex items-center justify-center text-slate-500 rounded-lg">
                      <span className="text-xs font-mono">Loading Page {index + 1}...</span>
                    </div>
                  }
                  className="overflow-hidden"
                />
              </div>
            ))
          )}
        </Document>
      </div>
    </div>
  );
}


