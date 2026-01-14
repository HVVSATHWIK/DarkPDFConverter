import { useState, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { useProcessPDF, ProcessOptions } from '../hooks/useProcessPDF';
import { XCircleIcon, DocumentPlusIcon, ArrowUpOnSquareIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { PDFDocument } from 'pdf-lib';
import { DarkModeOptions } from '@/hooks/useDarkMode';
import { SplitOptions } from '@/hooks/useSplitPDF';
import { RotateOptions } from '@/hooks/useRotatePDF'; // Added
import { ExtractOptions } from '@/hooks/useExtractPages'; // Added
import type { Tool } from '../types';

type SelectedFileItem = {
  id: string;
  file: File;
};

export interface PDFProcessorProps {
  onComplete: (result: any) => void;
  onError: (error: Error) => void;
  allowMultipleFiles: boolean;
  toolId: string | number;
  processActionName?: string;
  darkModePreviewOptions?: DarkModeOptions;
  splitPdfOptions?: SplitOptions;
  rotateOptions?: RotateOptions; // Added
  extractOptions?: ExtractOptions; // Added
  activeTool?: Tool | null;
}

function PDFProcessor({
  onComplete,
  onError,
  allowMultipleFiles,
  toolId,
  activeTool,
  processActionName = "Process PDF",
  darkModePreviewOptions,
  splitPdfOptions,
  rotateOptions, // Destructured
  extractOptions // Destructured
}: PDFProcessorProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);
  const [progress, setProgress] = useState(0);
  const { processDocument, isProcessing } = useProcessPDF();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const downloadUrlRef = useRef<string | null>(null);
  const [selectedPdfPageCount, setSelectedPdfPageCount] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idCounterRef = useRef(0);

  useEffect(() => {
    downloadUrlRef.current = downloadUrl;
  }, [downloadUrl]);

  useEffect(() => {
    setSelectedFiles([]);
    setProgress(0);
    setSelectedPdfPageCount(null);
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }
    setDownloadUrl(null);
  }, [toolId]);

  useEffect(() => {
    let cancelled = false;

    async function computePageCount() {
      setSelectedPdfPageCount(null);

      // Only compute for single-file workflows.
      if (allowMultipleFiles) return;
      if (selectedFiles.length !== 1) return;

      // Only show where it matters most.
      const name = activeTool?.name;
      const shouldShow = name === 'Split PDF' || name === 'Extract Pages';
      if (!shouldShow) return;

      try {
        const buffer = await selectedFiles[0].file.arrayBuffer();
        const doc = await PDFDocument.load(buffer);
        if (!cancelled) setSelectedPdfPageCount(doc.getPageCount());
      } catch {
        if (!cancelled) setSelectedPdfPageCount(null);
      }
    }

    computePageCount();
    return () => {
      cancelled = true;
    };
  }, [activeTool?.name, allowMultipleFiles, selectedFiles]);

  const handleFilesSelected = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).map((file) => {
        // Stable-enough per session, and unique even when names collide.
        // (We avoid relying only on `file.name` because duplicates are common.)
        const nextCounter = idCounterRef.current++;
        const id = `${file.name}:${file.lastModified}:${file.size}:${nextCounter}`;
        return { id, file };
      });
      if (allowMultipleFiles) {
        setSelectedFiles(prev => [...prev, ...newFiles]);
      } else {
        setSelectedFiles(newFiles.length > 0 ? [newFiles[0]] : []);
      }
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      setProgress(0);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(event.target.files);
    if (event.target) event.target.value = '';
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setProgress(0);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    setSelectedFiles((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[index];
      next[index] = next[nextIndex];
      next[nextIndex] = tmp;
      return next;
    });
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(item => item.id !== id));
  };

  const handleProcessClick = async () => {
    if (selectedFiles.length === 0) {
      onError(new Error("No files selected."));
      return;
    }

    try {
      setProgress(0);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);

      const processOptions: ProcessOptions = {
        activeToolName: activeTool?.name,
        darkModeOptions: activeTool?.name === 'Dark Mode' ? darkModePreviewOptions : undefined,
        splitPdfOptions: activeTool?.name === 'Split PDF' ? splitPdfOptions : undefined,
        rotateOptions: activeTool?.name === 'Rotate PDF' ? rotateOptions : undefined, // Passed options
        extractOptions: activeTool?.name === 'Extract Pages' ? extractOptions : undefined, // Passed options
      };

      let result;
      if (activeTool?.name === 'Merge PDFs' && allowMultipleFiles) {
        result = await processDocument(selectedFiles.map((s) => s.file), (p, msg) => {
          setProgress(Math.round(p * 100));
          console.log(`Progress: ${p * 100}%, Message: ${msg}`);
        }, processOptions);
      } else if (selectedFiles.length > 0) { // For single file tools
        const fileToProcess = selectedFiles[0].file;
        result = await processDocument(fileToProcess, (p, msg) => {
          setProgress(Math.round(p * 100));
          console.log(`Progress: ${p * 100}%, Message: ${msg}`);
        }, processOptions);
      } else {
        onError(new Error("No file selected or invalid state for processing."));
        return;
      }

      if (result && result.processedPdf) {
        const blob = new Blob([result.processedPdf as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      }
      if (result) {
        onComplete(result);
      }

    } catch (error) {
      onError(error as Error);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFilesSelected(event.dataTransfer.files);
  };

  // Validation logic for button disabling
  const isProcessDisabled = () => {
    if (isProcessing) return true;
    if (activeTool?.name === 'Split PDF' && !splitPdfOptions) return true;
    if (activeTool?.name === 'Rotate PDF' && !rotateOptions) return true; // Validate rotate
    if (activeTool?.name === 'Extract Pages' && !extractOptions) return true; // Validate extract
    return false;
  };

  const totalSizeKb = selectedFiles.reduce((acc, item) => acc + item.file.size, 0) / 1024;
  const showMergeReorder = allowMultipleFiles && activeTool?.name === 'Merge PDFs' && selectedFiles.length > 1;

  return (
    <div
      role="region"
      aria-label="PDF processing area"
      className="space-y-6 p-4 panel-surface"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer
                    ${isDragging
            ? 'border-indigo-400/80 bg-indigo-500/10'
            : 'border-white/15 hover:border-white/25 bg-black/10'}
                    transition-colors duration-200 ease-in-out`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple={allowMultipleFiles}
          onChange={handleFileChange}
          className="hidden"
          id={`pdf-upload-${toolId}`}
        />
        <DocumentPlusIcon className="w-12 h-12 text-slate-300 mb-2" />
        <p className="text-slate-200 text-center">
          Drag & drop {allowMultipleFiles ? "PDFs" : "a PDF"} here, or click to select.
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-200">Selected file(s)</h3>
              {allowMultipleFiles && (
                <p className="text-xs text-slate-300/70">
                  {selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'} • {totalSizeKb.toFixed(1)} KB total
                </p>
              )}
              {!allowMultipleFiles && selectedPdfPageCount && (
                <p className="text-xs text-slate-300/70">
                  PDF has {selectedPdfPageCount} page{selectedPdfPageCount === 1 ? '' : 's'}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={clearAllFiles}
              className="shrink-0 text-xs font-semibold text-slate-200/90 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors"
            >
              Clear all
            </button>
          </div>
          <ul className="space-y-1">
            {selectedFiles.map((item, index) => (
              <li key={item.id} className="flex items-center justify-between gap-3 p-3 bg-slate-950/45 rounded-lg text-sm text-slate-100 border border-white/10">
                <span className="truncate">{item.file.name} ({(item.file.size / 1024).toFixed(1)} KB)</span>
                <div className="flex items-center gap-2">
                  {showMergeReorder && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveFile(index, -1)}
                        className="p-1.5 rounded-md bg-slate-950/45 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors"
                        aria-label={`Move ${item.file.name} up`}
                      >
                        <ChevronUpIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFile(index, 1)}
                        className="p-1.5 rounded-md bg-slate-950/45 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors"
                        aria-label={`Move ${item.file.name} down`}
                      >
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="text-rose-300 hover:text-rose-200 transition-colors"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedFiles.length > 0 && !isProcessing && (
        <button
          onClick={handleProcessClick}
          disabled={isProcessDisabled()}
          className="btn-primary w-full p-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowUpOnSquareIcon className="w-5 h-5" />
          {isProcessing ? 'Processing...' : processActionName}
        </button>
      )}

      {isProcessing && (
        <div className="space-y-2">
          <p className="text-sm text-slate-200 text-center">Processing: {progress}%</p>
          <motion.div
            className="w-full h-2 bg-white/10 rounded-full overflow-hidden"
            aria-label={`Processing progress: ${progress}%`}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'tween', duration: 0.18, ease: 'easeOut' }}
            />
          </motion.div>
        </div>
      )}

      {downloadUrl && !isProcessing && (
        <a
          href={downloadUrl}
          download={`processed-${activeTool?.name || 'file'}.pdf`}
          className="btn-success block w-full text-center p-3 rounded-lg"
        >
          Download Processed PDF
        </a>
      )}
    </div>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert" className="p-4 bg-rose-500/15 text-white rounded-xl shadow-md border border-rose-400/20">
      <h2 className="text-lg font-semibold mb-2">Oops! Something went wrong.</h2>
      <pre className="mt-2 text-sm bg-black/25 p-2 rounded-lg border border-white/10 overflow-auto">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/15 font-semibold border border-white/10"
      >
        Try again
      </button>
    </div>
  );
}

export default function PDFProcessorWithErrorBoundary(props: PDFProcessorProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}
      onReset={() => { /* Consider if any specific reset logic is needed here */ }}
      resetKeys={[props.activeTool?.id || props.toolId, props.splitPdfOptions?.startPage, props.splitPdfOptions?.endPage]}
    >
      <PDFProcessor {...props} />
    </ErrorBoundary>
  );
}