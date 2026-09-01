import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { useProcessPDF, ProcessOptions } from '../hooks/useProcessPDF';
import { XCircleIcon, DocumentPlusIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { DarkModeOptions } from '@/hooks/useDarkMode';
import { SplitOptions } from '@/hooks/useSplitPDF';
import { RotateOptions } from '@/hooks/useRotatePDF';
import { ExtractOptions } from '@/hooks/useExtractPages';
import { ImageToPdfOptions } from '@/hooks/useImagesToPdf';
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
  rotateOptions?: RotateOptions;
  extractOptions?: ExtractOptions;
  imageToPdfOptions?: ImageToPdfOptions;
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
  processActionName,
  autoProcess = false,
  autoProcessDeps = [],
  autoProcessDebounceMs = 350,
  autoProcessOnSelect = false,
  darkModePreviewOptions,
  splitPdfOptions,
  rotateOptions,
  extractOptions,
  imageToPdfOptions,
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

  const isImageTool = activeTool?.name === 'Images to PDF';
  const acceptedFileExtensions = isImageTool ? '.png,.jpg,.jpeg,.webp' : '.pdf';

  useEffect(() => {
    downloadUrlRef.current = downloadUrl;
  }, [downloadUrl]);

  useEffect(() => {
    setSelectedFiles([]);
    setProgress(0);
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
      onError(new Error('No files selected.'));
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
        imageToPdfOptions: activeTool?.name === 'Images to PDF' ? imageToPdfOptions : undefined,
      };

      let result;
      if ((activeTool?.name === 'Merge PDFs' || activeTool?.name === 'Images to PDF') && allowMultipleFiles) {
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
        onError(new Error('No file selected or invalid state for processing.'));
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
    imageToPdfOptions,
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
      lastOptionsKeyRef.current = optionsKey;
      if (!autoProcessOnSelect) return;
    }

    if (!downloadUrl && !autoProcessOnSelect && optionsKey === lastOptionsKeyRef.current) return;

    const depsKey = JSON.stringify({
      tool: activeTool?.name,
      fileIds: selectedFiles.map((s) => s.id),
      deps: autoProcessDeps,
    });

    if (depsKey === lastAutoKeyRef.current) return;
    lastAutoKeyRef.current = depsKey;

    if (!didAutoOnceAfterSelectRef.current) didAutoOnceAfterSelectRef.current = true;
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

  const handleFilesSelected = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).map((file) => {
        const nextCounter = idCounterRef.current++;
        const id = `${file.name}:${file.lastModified}:${file.size}:${nextCounter}`;
        return { id, file };
      });
      if (allowMultipleFiles) {
        setSelectedFiles((prev) => [...prev, ...newFiles]);
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

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
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

  return (
    <div
      role="region"
      aria-label="PDF processing area"
      className="space-y-6"
    >
      {/* File Uploader Section */}
      <div className="space-y-3">
        {selectedFiles.length === 0 ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group flex flex-col items-center justify-center p-8 border border-dashed rounded-xl cursor-pointer
                        ${
                          isDragging
                            ? 'border-indigo-400/80 bg-indigo-500/10'
                            : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                        }
                        transition-all duration-200 ease-in-out`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFileExtensions}
              multiple={allowMultipleFiles}
              onChange={handleFileChange}
              className="hidden"
              id={`pdf-upload-${toolId}`}
            />
            <div
              className={`p-3 rounded-full mb-3 transition-colors ${
                isDragging ? 'bg-indigo-500/20' : 'bg-white/5 group-hover:bg-white/10'
              }`}
            >
              <DocumentPlusIcon
                className={`w-6 h-6 ${isDragging ? 'text-indigo-300' : 'text-slate-400'}`}
              />
            </div>
            <p className="text-sm font-medium text-slate-300 group-hover:text-white">
              {isImageTool
                ? allowMultipleFiles
                  ? 'Upload Images (PNG / JPG)'
                  : 'Upload Image'
                : allowMultipleFiles
                ? 'Upload PDFs'
                : 'Upload PDF'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Drag &amp; drop or click to select</p>
          </div>
        ) : (
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

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFileExtensions}
              multiple={allowMultipleFiles}
              onChange={handleFileChange}
              className="hidden"
            />

            <ul className="space-y-2">
              {selectedFiles.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-center justify-between gap-3 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-cyan-500/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-cyan-400">
                        {item.file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 truncate font-medium">{item.file.name}</p>
                      <p className="text-[10px] text-slate-500">{(item.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(item.id);
                    }}
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

        {/* Interaction Zone Agreement Notice */}
        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          By selecting a file or utilizing this utility, you acknowledge that all processing occurs locally on your device and you agree to our{' '}
          <Link to="/terms" className="text-slate-400 hover:text-cyan-400 underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-slate-400 hover:text-cyan-400 underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Controls Section */}
      {selectedFiles.length > 0 && controls && (
        <div className="space-y-3 py-4 border-t border-white/5">
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
              className="space-y-2"
            >
              <a
                href={downloadUrl}
                download={`processed-${activeTool?.name || 'file'}.pdf`}
                className="flex items-center justify-center gap-2 w-full p-3 bg-white text-black font-semibold rounded-lg hover:bg-slate-200 transition-colors shadow-lg shadow-white/5"
              >
                <ArrowUpOnSquareIcon className="w-4 h-4" />
                Download Result
              </a>
              <button
                type="button"
                onClick={handleProcessClick}
                disabled={isProcessDisabled()}
                className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-white/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span>{processActionName ? `Re-run ${processActionName}` : 'Re-apply Changes'}</span>
              </button>
              <p className="text-center text-[10px] text-slate-500 mt-1">
                Ready to save. {autoProcess ? 'Updated automatically on setting change.' : ''}
              </p>
            </motion.div>
          ) : (
            !isProcessing && (
              <button
                type="button"
                onClick={handleProcessClick}
                disabled={isProcessDisabled()}
                className="w-full p-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processActionName || (activeTool?.name === 'Merge PDFs' ? 'Merge Files' : 'Process PDF')}
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
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      resetKeys={[
        props.activeTool?.id || props.toolId,
        props.splitPdfOptions?.startPage,
        props.splitPdfOptions?.endPage,
      ]}
    >
      <PDFProcessor {...props} />
    </ErrorBoundary>
  );
}
