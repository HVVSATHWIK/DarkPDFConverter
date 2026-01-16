import { useState, useEffect, useRef, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { useProcessPDF, ProcessOptions } from '../hooks/useProcessPDF';
import { XCircleIcon, DocumentPlusIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
/* import { PDFDocument } from 'pdf-lib'; // Removed */
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
  onSelectionChange?: (files: File[]) => void;
  allowMultipleFiles: boolean;
  toolId: string | number;
  processActionName?: string;
  controls?: React.ReactNode;
  controlsLabel?: string;
  trustLabel?: string;
  autoProcess?: boolean;
  autoProcessDeps?: unknown[];
  autoProcessDebounceMs?: number;
  autoProcessOnSelect?: boolean;
  darkModePreviewOptions?: DarkModeOptions;
  splitPdfOptions?: SplitOptions;
  rotateOptions?: RotateOptions; // Added
  extractOptions?: ExtractOptions; // Added
  activeTool?: Tool | null;
}

function PDFProcessor({
  onComplete,
  onError,
  onSelectionChange,
  allowMultipleFiles,
  toolId,
  activeTool,
  controls,
  autoProcess = false,
  autoProcessDeps = [],
  autoProcessDebounceMs = 350,
  autoProcessOnSelect = false,
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idCounterRef = useRef(0);
  const lastAutoKeyRef = useRef<string>('');
  const didAutoOnceAfterSelectRef = useRef(false);
  const lastOptionsKeyRef = useRef<string>('');

  useEffect(() => {
    downloadUrlRef.current = downloadUrl;
  }, [downloadUrl]);

  useEffect(() => {
    setSelectedFiles([]);
    setProgress(0);
    // Removed setSelectedPdfPageCount(null);
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }
    setDownloadUrl(null);
  }, [toolId]);

  useEffect(() => {
    onSelectionChange?.(selectedFiles.map((s) => s.file));
  }, [onSelectionChange, selectedFiles]);

  const isProcessDisabled = useCallback(() => {
    if (isProcessing) return true;
    if (activeTool?.name === 'Split PDF' && !splitPdfOptions) return true;
    if (activeTool?.name === 'Rotate PDF' && !rotateOptions) return true;
    if (activeTool?.name === 'Extract Pages' && !extractOptions) return true;
    return false;
  }, [activeTool?.name, extractOptions, isProcessing, rotateOptions, splitPdfOptions]);

  const handleProcessClick = useCallback(async () => {
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
        rotateOptions: activeTool?.name === 'Rotate PDF' ? rotateOptions : undefined,
        extractOptions: activeTool?.name === 'Extract Pages' ? extractOptions : undefined,
      };

      let result;
      if (activeTool?.name === 'Merge PDFs' && allowMultipleFiles) {
        result = await processDocument(
          selectedFiles.map((s) => s.file),
          (p, msg) => {
            setProgress(Math.round(p * 100));
            console.log(`Progress: ${p * 100}%, Message: ${msg}`);
          },
          processOptions
        );
      } else if (selectedFiles.length > 0) {
        const fileToProcess = selectedFiles[0].file;
        result = await processDocument(
          fileToProcess,
          (p, msg) => {
            setProgress(Math.round(p * 100));
            console.log(`Progress: ${p * 100}%, Message: ${msg}`);
          },
          processOptions
        );
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
        onComplete({
          ...result,
          appliedOptions: processOptions,
        });
      }
    } catch (error) {
      onError(error as Error);
    }
  }, [
    activeTool?.name,
    allowMultipleFiles,
    darkModePreviewOptions,
    downloadUrl,
    extractOptions,
    onComplete,
    onError,
    processDocument,
    rotateOptions,
    selectedFiles,
    splitPdfOptions,
  ]);

  useEffect(() => {
    if (!autoProcess) return;
    if (isProcessing) return;
    if (selectedFiles.length === 0) return;
    if (isProcessDisabled()) return;

    const optionsKey = JSON.stringify(autoProcessDeps);
    if (!lastOptionsKeyRef.current) {
      // Initialize baseline options key.
      lastOptionsKeyRef.current = optionsKey;
      // If autoProcessOnSelect is enabled, we still allow the first run.
      if (!autoProcessOnSelect) return;
    }

    // If we haven't produced an output yet and options haven't changed, don't auto-run.
    if (!downloadUrl && !autoProcessOnSelect && optionsKey === lastOptionsKeyRef.current) return;

    // Run once right after file selection, and again on option changes.
    const depsKey = JSON.stringify({
      tool: activeTool?.name,
      fileIds: selectedFiles.map((s) => s.id),
      deps: autoProcessDeps,
    });

    // Avoid tight loops.
    if (depsKey === lastAutoKeyRef.current) return;
    lastAutoKeyRef.current = depsKey;

    // If the user already processed and a download exists, re-apply automatically on changes.
    // If not processed yet, auto-run once after a file is selected.
    // Mark that we have auto-applied at least once.
    if (!didAutoOnceAfterSelectRef.current) didAutoOnceAfterSelectRef.current = true;

    // Snapshot the options key that triggered this run.
    lastOptionsKeyRef.current = optionsKey;

    const handle = window.setTimeout(() => {
      void handleProcessClick();
    }, autoProcessDebounceMs);

    return () => window.clearTimeout(handle);
  }, [
    autoProcess,
    isProcessing,
    selectedFiles,
    downloadUrl,
    activeTool?.name,
    autoProcessDebounceMs,
    autoProcessOnSelect,
    autoProcessDeps,
    handleProcessClick,
    isProcessDisabled,
  ]);

  /* Removed Page Count Effect as it is unused in the new UI */

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

  /* Removed moveFile as reordering is not in compact UI */

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(item => item.id !== id));
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

  /* Removed unused variables: totalSizeKb, showMergeReorder, step2Hint */

  return (
    <div
      role="region"
      aria-label="PDF processing area"
      className="space-y-6"
    >
      {/* File Uploader Section */}
      <div className="space-y-3">
        {selectedFiles.length === 0 ? (
          // Empty State: Big Dropzone (refined)
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group flex flex-col items-center justify-center p-8 border border-dashed rounded-xl cursor-pointer
                        ${isDragging
                ? 'border-indigo-400/80 bg-indigo-500/10'
                : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'}
                        transition-all duration-200 ease-in-out`}
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
            <div className={`p-3 rounded-full mb-3 transition-colors ${isDragging ? 'bg-indigo-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
              <DocumentPlusIcon className={`w-6 h-6 ${isDragging ? 'text-indigo-300' : 'text-slate-400'}`} />
            </div>
            <p className="text-sm font-medium text-slate-300 group-hover:text-white">
              {allowMultipleFiles ? "Upload PDFs" : "Upload PDF"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Drag & drop or click</p>
          </div>
        ) : (
          // Compact File List
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Source</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1"
              >
                <DocumentPlusIcon className="w-3 h-3" />
                Add/Change
              </button>
            </div>

            {/* Hidden input for add/change */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple={allowMultipleFiles}
              onChange={handleFileChange}
              className="hidden"
            />

            <ul className="space-y-2">
              {selectedFiles.map((item) => (
                <li key={item.id} className="group flex items-center justify-between gap-3 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-rose-500/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-rose-400">PDF</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 truncate font-medium">{item.file.name}</p>
                      <p className="text-[10px] text-slate-500">{(item.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                    className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>

            {allowMultipleFiles && selectedFiles.length > 1 && (
              <button onClick={clearAllFiles} className="text-[10px] text-slate-500 hover:text-slate-300 underline">
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Controls Section */}
      {selectedFiles.length > 0 && controls && (
        <div className="space-y-3 py-4 border-t border-white/5">
          {/* <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{controlsLabel}</div> */}
          <div>{controls}</div>
        </div>
      )}

      {/* Action Section (Apply / Download) */}
      {selectedFiles.length > 0 && (
        <div className="pt-4 border-t border-white/5 space-y-3">
          {/* Processing Status */}
          {isProcessing && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] uppercase text-indigo-300 font-medium">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <motion.div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </motion.div>
            </div>
          )}

          {/* Download Button (Success State) */}
          {downloadUrl && !isProcessing ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <a
                href={downloadUrl}
                download={`processed-${activeTool?.name || 'file'}.pdf`}
                className="flex items-center justify-center gap-2 w-full p-3 bg-white text-black font-semibold rounded-lg hover:bg-slate-200 transition-colors shadow-lg shadow-white/5"
              >
                <ArrowUpOnSquareIcon className="w-4 h-4" />
                Download Result
              </a>
              <p className="text-center text-[10px] text-slate-500 mt-2">
                Ready to save. {autoProcess ? 'Updated automatically.' : ''}
              </p>
            </motion.div>
          ) : (
            // Apply Button (Only if NOT autoProcess or if explicitly needed)
            (!autoProcess || !isProcessing) && !downloadUrl && (
              <button
                onClick={handleProcessClick}
                disabled={isProcessDisabled()}
                className="w-full p-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {activeTool?.name === 'Merge PDFs' ? 'Merge Files' : 'Process PDF'}
              </button>
            )
          )}
        </div>
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