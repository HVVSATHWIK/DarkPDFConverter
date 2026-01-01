import { useState, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { useProcessPDF, ProcessOptions } from '../hooks/useProcessPDF';
import { XCircleIcon, DocumentPlusIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { DarkModeOptions } from '@/hooks/useDarkMode';
import { SplitOptions } from '@/hooks/useSplitPDF';
import { RotateOptions } from '@/hooks/useRotatePDF'; // Added
import { ExtractOptions } from '@/hooks/useExtractPages'; // Added
import type { Tool } from '../types';

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const { processDocument, isProcessing } = useProcessPDF();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedFiles([]);
    setProgress(0);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(null);
  }, [toolId]);

  const handleFilesSelected = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
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

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
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
        result = await processDocument(selectedFiles, (p, msg) => {
          setProgress(Math.round(p * 100));
          console.log(`Progress: ${p * 100}%, Message: ${msg}`);
        }, processOptions);
      } else if (selectedFiles.length > 0) { // For single file tools
        const fileToProcess = selectedFiles[0];
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

  return (
    <div role="region" aria-label="PDF processing area" className="space-y-6 p-4 bg-gray-700 rounded-lg">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer
                    ${isDragging ? 'border-blue-500 bg-gray-600' : 'border-gray-500 hover:border-blue-400'}
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
        <DocumentPlusIcon className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-gray-300 text-center">
          Drag & drop {allowMultipleFiles ? "PDFs" : "a PDF"} here, or click to select.
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-200">Selected file(s):</h3>
          <ul className="space-y-1">
            {selectedFiles.map(file => (
              <li key={file.name} className="flex items-center justify-between p-2 bg-gray-600 rounded text-sm text-gray-50">
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                <button onClick={() => removeFile(file.name)} className="text-red-400 hover:text-red-300">
                  <XCircleIcon className="w-5 h-5" />
                </button>
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
          <p className="text-sm text-gray-300 text-center">Processing: {progress}%</p>
          <motion.div
            className="w-full h-2 bg-gray-500 rounded-full"
            aria-label={`Processing progress: ${progress}%`}
          >
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
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
    <div role="alert" className="p-4 bg-red-700 text-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Oops! Something went wrong.</h2>
      <pre className="mt-2 text-sm bg-red-600 p-2 rounded">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-white text-red-700 rounded hover:bg-red-100 font-semibold"
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