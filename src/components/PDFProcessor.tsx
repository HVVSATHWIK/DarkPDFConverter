import { useState, useEffect, useRef, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { useProcessPDF, ProcessOptions } from '../hooks/useProcessPDF';
import {
  XCircleIcon,
  DocumentPlusIcon,
  ArrowDownTrayIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const idCounterRef = useRef(0);
  const lastAutoKeyRef = useRef<string>('');
  const didAutoOnceAfterSelectRef = useRef(false);
  const lastOptionsKeyRef = useRef<string>('');

  const isImageTool = activeTool?.name === 'Images to PDF';
  const isMergeTool = activeTool?.name === 'Merge PDFs';
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
    if (selectedFiles.length === 0) return true;
    if (isMergeTool && selectedFiles.length < 2) return true;
    if (activeTool?.name === 'Split PDF' && !splitPdfOptions) return true;
    if (activeTool?.name === 'Rotate PDF' && !rotateOptions) return true;
    if (activeTool?.name === 'Extract Pages' && !extractOptions) return true;
    return false;
  }, [activeTool?.name, extractOptions, isMergeTool, isProcessing, rotateOptions, selectedFiles.length, splitPdfOptions]);

  const handleProcessClick = useCallback(async () => {
    if (selectedFiles.length === 0) {
      onError(new Error('No files selected.'));
      return;
    }
    if (isMergeTool && selectedFiles.length < 2) {
      onError(new Error('Please select at least 2 PDF files to merge.'));
      return;
    }

    try {
      setProgress(0);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);

      const processOptions: ProcessOptions = {
        activeToolName: activeTool?.name,
        darkModeOptions:
          activeTool?.name === 'Dark Mode' || activeTool?.name === 'Dark Mode PDF'
            ? darkModePreviewOptions
            : undefined,
        splitPdfOptions: activeTool?.name === 'Split PDF' ? splitPdfOptions : undefined,
        rotateOptions: activeTool?.name === 'Rotate PDF' ? rotateOptions : undefined,
        extractOptions: activeTool?.name === 'Extract Pages' ? extractOptions : undefined,
        imageToPdfOptions: activeTool?.name === 'Images to PDF' ? imageToPdfOptions : undefined,
      };

      let result;
      if ((isMergeTool || isImageTool) && allowMultipleFiles) {
        result = await processDocument(
          selectedFiles.map((s) => s.file),
          (p) => {
            setProgress(Math.round(p * 100));
          },
          processOptions
        );
      } else if (selectedFiles.length > 0) {
        const fileToProcess = selectedFiles[0].file;
        result = await processDocument(
          fileToProcess,
          (p) => {
            setProgress(Math.round(p * 100));
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
      const err = error as Error;
      const msg = err.message || '';
      if (/encrypt|password|cipher/i.test(msg)) {
        onError(new Error('This PDF is password-protected or encrypted. Please remove the password before processing.'));
      } else {
        onError(err);
      }
    }
  }, [
    activeTool?.name,
    allowMultipleFiles,
    darkModePreviewOptions,
    downloadUrl,
    extractOptions,
    imageToPdfOptions,
    isImageTool,
    isMergeTool,
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
    if (files && files.length > 0) {
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];
      const emptyFiles: string[] = [];

      Array.from(files).forEach((file) => {
        if (file.size === 0) {
          emptyFiles.push(file.name);
          return;
        }

        if (isImageTool) {
          const isValidType =
            file.type.startsWith('image/') ||
            /\.(jpg|jpeg|png|webp|gif|bmp|tiff)$/i.test(file.name);
          if (isValidType) {
            validFiles.push(file);
          } else {
            invalidFiles.push(file.name);
          }
        } else {
          const isValidType =
            file.type === 'application/pdf' ||
            file.name.toLowerCase().endsWith('.pdf');
          if (isValidType) {
            validFiles.push(file);
          } else {
            invalidFiles.push(file.name);
          }
        }
      });

      if (invalidFiles.length > 0) {
        const expected = isImageTool ? 'image files (JPG, PNG, WEBP)' : 'PDF files (.pdf)';
        onError(
          new Error(`Invalid file format: ${invalidFiles.join(', ')}. Please upload valid ${expected}.`)
        );
      }

      if (emptyFiles.length > 0) {
        onError(
          new Error(`Empty file detected (0 bytes): ${emptyFiles.join(', ')}. Please select a valid document.`)
        );
      }

      if (validFiles.length > 0) {
        const newFiles = validFiles.map((file) => {
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
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setSelectedFiles((prev) => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
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

  const defaultActionName = () => {
    if (processActionName) return processActionName;
    switch (activeTool?.name) {
      case 'Merge PDFs':
        return 'Merge PDFs';
      case 'Split PDF':
        return 'Split PDF';
      case 'Rotate PDF':
        return 'Rotate PDF';
      case 'Extract Pages':
        return 'Extract Pages';
      case 'Optimize PDF':
        return 'Optimize PDF';
      case 'Dark Mode PDF':
      case 'Dark Mode':
        return 'Apply Dark Mode';
      case 'Images to PDF':
        return 'Convert to PDF';
      case 'Cleanse Metadata':
        return 'Cleanse Metadata';
      default:
        return 'Process PDF';
    }
  };

  const downloadFileName = () => {
    const firstFile = selectedFiles[0]?.file;
    if (!firstFile) {
      const slugName = (activeTool?.name || 'processed')
        .toLowerCase()
        .replace(/\s+/g, '-');
      return `${slugName}-result.pdf`;
    }

    const baseName = firstFile.name.replace(/\.[^/.]+$/, '');
    const toolName = activeTool?.name || '';

    if (toolName === 'Dark Mode PDF' || toolName === 'Dark Mode') {
      return `${baseName}_DarkMode.pdf`;
    } else if (toolName === 'Merge PDFs') {
      return `${baseName}_Merged.pdf`;
    } else if (toolName === 'Split PDF') {
      return `${baseName}_Split.pdf`;
    } else if (toolName === 'Rotate PDF') {
      return `${baseName}_Rotated.pdf`;
    } else if (toolName === 'Extract Pages') {
      return `${baseName}_Extracted.pdf`;
    } else if (toolName === 'Optimize PDF') {
      return `${baseName}_Optimized.pdf`;
    } else if (toolName === 'Cleanse Metadata' || toolName === 'Clean Metadata') {
      return `${baseName}_Cleaned.pdf`;
    } else if (toolName === 'Images to PDF') {
      return `${baseName}_Converted.pdf`;
    }

    return `${baseName}_Processed.pdf`;
  };

  return (
    <div role="region" aria-label="PDF processing workspace" className="space-y-5">
      {/* 1. Uploader Drop Zone */}
      <div className="space-y-3">
        {selectedFiles.length === 0 ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ease-in-out text-center ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90'
            }`}
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
              className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center transition-colors ${
                isDragging
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'bg-slate-800/80 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950'
              }`}
            >
              <DocumentPlusIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
            </div>
            <p className="text-sm font-bold text-slate-100 group-hover:text-white">
              {isImageTool
                ? 'Drop images here or choose files from your device'
                : 'Drop PDF files here or choose files from your device'}
            </p>
            <p className="text-xs text-slate-400 mt-1.5">
              {isImageTool
                ? 'Supports PNG, JPG, JPEG, WebP format'
                : allowMultipleFiles
                ? 'Select multiple PDF files to organize and merge'
                : 'Select a PDF document to process'}
            </p>
          </div>
        ) : (
          /* 2. Selected File Workspace */
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-300">
                Selected {isImageTool ? 'Images' : 'Files'} ({selectedFiles.length})
              </span>
              <div className="flex items-center gap-2">
                {allowMultipleFiles && (
                  <>
                    <input
                      ref={addMoreInputRef}
                      type="file"
                      accept={acceptedFileExtensions}
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => addMoreInputRef.current?.click()}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <DocumentPlusIcon className="w-3.5 h-3.5" />
                      Add More
                    </button>
                  </>
                )}
                {selectedFiles.length > 1 && (
                  <button
                    type="button"
                    onClick={clearAllFiles}
                    className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <ul className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
              {selectedFiles.map((item, index) => (
                <li
                  key={item.id}
                  className="group flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 text-cyan-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                        {item.file.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatFileSize(item.file.size)}
                      </p>
                    </div>
                  </div>

                  {/* Controls: Reorder buttons for multi-file tools */}
                  <div className="flex items-center gap-1 shrink-0">
                    {allowMultipleFiles && selectedFiles.length > 1 && (
                      <div className="flex items-center gap-0.5 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/50">
                        <button
                          type="button"
                          onClick={() => moveFile(index, 'up')}
                          disabled={index === 0}
                          title="Move Up"
                          className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                        >
                          <ChevronUpIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFile(index, 'down')}
                          disabled={index === selectedFiles.length - 1}
                          title="Move Down"
                          className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                        >
                          <ChevronDownIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      title="Remove File"
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Hint for Merge PDFs */}
            {isMergeTool && selectedFiles.length === 1 && (
              <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg text-center">
                Add at least 1 more PDF file to perform a merge.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Tool Specific Controls */}
      {selectedFiles.length > 0 && controls && (
        <div className="py-2 border-t border-slate-800/80 space-y-2">
          {controls}
        </div>
      )}

      {/* 4. Primary CTA & Result State */}
      {selectedFiles.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          {/* Active Processing State */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                <span className="flex items-center gap-2">
                  <ArrowPathIcon className="w-4 h-4 animate-spin text-cyan-400" />
                  Processing document...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Download / Success State */}
          {downloadUrl && !isProcessing ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-3 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold text-sm">
                <CheckCircleIcon className="w-5 h-5 text-cyan-400" />
                <span>PDF Ready for Download</span>
              </div>

              <a
                href={downloadUrl}
                download={downloadFileName()}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors shadow-lg shadow-cyan-500/20 text-sm"
              >
                <ArrowDownTrayIcon className="w-4 h-4 stroke-[2.5]" />
                <span>Download {isMergeTool ? 'Merged PDF' : 'Processed PDF'}</span>
              </a>

              <button
                type="button"
                onClick={clearAllFiles}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
              >
                {isMergeTool ? 'Start Another Merge' : 'Process Another File'}
              </button>
            </motion.div>
          ) : (
            /* Primary CTA Button */
            !isProcessing && (
              <button
                type="button"
                onClick={handleProcessClick}
                disabled={isProcessDisabled()}
                className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-800 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-cyan-500/10 text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>{defaultActionName()}</span>
              </button>
            )
          )}
        </div>
      )}

      {/* 5. Short Factual Privacy Note */}
      <p className="text-[11px] text-slate-400 text-center leading-normal">
        Files are processed locally in your browser.
      </p>
    </div>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert" className="p-4 bg-rose-950/40 text-white rounded-xl border border-rose-500/40 space-y-3">
      <h3 className="text-sm font-bold text-rose-300">Processing Error</h3>
      <p className="text-xs text-rose-200/90">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-3.5 py-1.5 bg-slate-900 text-xs font-semibold text-white rounded-lg border border-slate-700 hover:bg-slate-800"
      >
        Try Again
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
