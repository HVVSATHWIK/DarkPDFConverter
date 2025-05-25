import { useState, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { useDarkModePDF } from '../hooks/useDarkModePDF';
import { useSplitPDF } from '../hooks/useSplitPDF';
import { useMergePDF } from '../hooks/useMergePDF';
import { useRotatePDF } from '../hooks/useRotatePDF';
import { XCircleIcon, DocumentPlusIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';


interface PDFProcessorProps {
  onComplete: (result: { processedPdfBytes: Uint8Array, suggestedFileName: string }) => void;
  onError: (error: Error) => void;
  allowMultipleFiles: boolean;
  toolId: string; // Assuming toolId is the string name of the tool e.g. "Dark Mode"
  processActionName?: string; // e.g. "Apply Dark Mode", "Merge PDFs"
}

function PDFProcessor({ 
  onComplete, 
  onError, 
  allowMultipleFiles, 
  toolId, // Using this as the primary identifier for the tool's name
  processActionName = "Process PDF" 
}: PDFProcessorProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isComponentProcessing, setIsComponentProcessing] = useState(false);

  const { convertToDarkMode, isProcessing: isDarkModeProcessing } = useDarkModePDF();
  const { splitPDF, isProcessing: isSplitProcessing } = useSplitPDF();
  const { mergePDFs, isProcessing: isMergeProcessing } = useMergePDF();
  const { rotatePDFPage, isProcessing: isRotateProcessing } = useRotatePDF();

  // Effect to update isComponentProcessing based on individual hook processing states
  useEffect(() => {
    setIsComponentProcessing(isDarkModeProcessing || isSplitProcessing || isMergeProcessing || isRotateProcessing);
  }, [isDarkModeProcessing, isSplitProcessing, isMergeProcessing, isRotateProcessing]);
  

  // Reset state when tool changes or initial mount
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
      // Clear previous results if new files are selected
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      setProgress(0);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(event.target.files);
    // Reset input value to allow selecting the same file again
    if(event.target) event.target.value = ''; 
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const handleProcessClick = async () => {
    if (selectedFiles.length === 0) {
      onError(new Error("No files selected."));
      return;
    }

    // The toolId prop is assumed to be the string name of the tool.
    const currentToolName = toolId; 
    let processedPdfBytes: Uint8Array | null = null;

    setIsComponentProcessing(true);
    setProgress(0);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    try {
      switch (currentToolName) {
        case 'Dark Mode':
          if (!selectedFiles[0]) {
            onError(new Error("No file selected for Dark Mode."));
            return;
          }
          processedPdfBytes = await convertToDarkMode(
            selectedFiles[0],
            { theme: 'dark', brightness: 100, contrast: 100 }, // Hardcoded options
            (p) => setProgress(Math.round(p * 100))
          );
          break;
        case 'Merge PDFs':
          if (selectedFiles.length === 0) {
            onError(new Error("No files selected for Merge PDFs."));
            return;
          }
          processedPdfBytes = await mergePDFs(
            selectedFiles,
            (fileProgress, currentFile, overallProgress) => {
              console.log(`Merging ${currentFile}: ${Math.round(fileProgress * 100)}%`);
              setProgress(Math.round(overallProgress * 100));
            }
          );
          break;
        case 'Split PDF':
          if (!selectedFiles[0]) {
            onError(new Error("No file selected for Split PDF."));
            return;
          }
          // Basic validation for hardcoded options
          // In a real app, these would come from user input and be validated there.
          if (selectedFiles[0].size < 100) { // Very small PDF might not have a page
             // A more robust check would be to load the PDF and get page count if options are dynamic
          }
          processedPdfBytes = await splitPDF(
            selectedFiles[0],
            { startPage: 1, endPage: 1 }, // Hardcoded options
            (p) => setProgress(Math.round(p * 100))
          );
          break;
        case 'Rotate PDF':
          if (!selectedFiles[0]) {
            onError(new Error("No file selected for Rotate PDF."));
            return;
          }
          processedPdfBytes = await rotatePDFPage(
            selectedFiles[0],
            { pageNumber: 1, angle: 90 }, // Hardcoded options
            (p) => setProgress(Math.round(p * 100))
          );
          break;
        default:
          onError(new Error(`Processing for '${currentToolName}' is not yet implemented.`));
          return; // Exit the function
      }

      if (processedPdfBytes) {
        const blob = new Blob([processedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        onComplete({ 
          processedPdfBytes, 
          suggestedFileName: `${currentToolName.toLowerCase().replace(/\s+/g, '_')}_processed.pdf` 
        });
      }
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsComponentProcessing(false);
    }
  };
  
  // Drag and Drop handlers
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
          className="sr-only"
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
      
      {selectedFiles.length > 0 && !isComponentProcessing && (
        <button
          onClick={handleProcessClick}
          disabled={isComponentProcessing}
          className="btn-primary w-full p-3 rounded-lg flex items-center justify-center gap-2"
        >
          <ArrowUpOnSquareIcon className="w-5 h-5" />
          {isComponentProcessing ? 'Processing...' : processActionName}
        </button>
      )}

      {isComponentProcessing && (
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

      {downloadUrl && !isComponentProcessing && (
         <a
          href={downloadUrl}
          download={downloadUrl.endsWith('.pdf') ? downloadUrl.split('/').pop() : `processed-${toolId.replace(/\s+/g, '_')}.pdf`} // Use suggestedFileName logic
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
      <pre className="mt-2 text-sm bg-red-600 p-2 rounded break-words whitespace-pre-wrap">{error.message}</pre>
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
  // Ensure toolId is a string for resetKeys if it can be a number.
  // However, the interface now defines toolId as string.
  const resetKey = typeof props.toolId === 'string' ? props.toolId : String(props.toolId);
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} 
      onReset={() => { /* Specific reset logic if needed */ }}
      resetKeys={[resetKey]} 
    >
      <PDFProcessor {...props} />
    </ErrorBoundary>
  );
}