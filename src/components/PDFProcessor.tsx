import { useState, useCallback, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { useProcessPDF } from '../hooks/useProcessPDF';
import { XCircleIcon, DocumentPlusIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';


interface PDFProcessorProps {
  onComplete: (result: any) => void; // Result could be single or multiple for merge
  onError: (error: Error) => void;
  allowMultipleFiles: boolean;
  toolId: string | number; // Used for resetting state when tool changes
  processActionName?: string; // e.g. "Apply Dark Mode", "Merge PDFs"
}

function PDFProcessor({ 
  onComplete, 
  onError, 
  allowMultipleFiles, 
  toolId,
  processActionName = "Process PDF" 
}: PDFProcessorProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const { processDocument, isProcessing } = useProcessPDF(); // processDocument is for single PDF
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when tool changes or initial mount
  useEffect(() => {
    setSelectedFiles([]);
    setProgress(0);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(null);
  }, [toolId]); // downloadUrl dependency removed to avoid loop on its own reset

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

    // For this subtask, processDocument (single file) is used.
    // Actual multi-file processing (e.g. merge) would need different logic here or in useProcessPDF.
    // For "Merge PDFs", this button would trigger a merge-specific function.
    // For "Dark Mode", it processes the first (and only) selected file.
    const fileToProcess = selectedFiles[0]; 

    try {
      setProgress(0); // Reset progress before processing
      if (downloadUrl) URL.revokeObjectURL(downloadUrl); // Revoke old URL
      setDownloadUrl(null);

      // Example: Dark Mode just processes the first file
      // Example: Merge PDFs would have a different function here
      if (toolId === 'Dark Mode' || !allowMultipleFiles) {
         const result = await processDocument(fileToProcess, (p) => {
          setProgress(Math.round(p * 100));
        });

        if (result.processedPdf) {
          const blob = new Blob([result.processedPdf], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
        }
        onComplete(result); // For Dark Mode, this is fine
      } else if (toolId === 'Merge PDFs' && allowMultipleFiles) {
        // Placeholder for merge logic
        // For now, let's simulate processing multiple files by "processing" the first one
        // and returning info about all selected files.
        // In a real scenario, you'd pass all selectedFiles to a merge-specific hook/function.
        console.log("Simulating merge for files:", selectedFiles.map(f => f.name));
        const resultStub = {
          message: `Merge operation for ${selectedFiles.length} files would happen here.`,
          processedPdf: null, // No single PDF download for merge yet in this stub
          pageCount: selectedFiles.reduce((acc, f) => acc + (f.size/1000),0), // dummy page count
          title: `Merged Document (${selectedFiles.map(f=>f.name).join(', ')})`
        };
        // Simulate a delay and progress for demo
        setProgress(0);
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(100);
        
        // No download URL for merge in this basic stub
        setDownloadUrl(null); 
        onComplete(resultStub);
      } else {
        // Generic processing for other tools if not specified
         const result = await processDocument(fileToProcess, (p) => {
          setProgress(Math.round(p * 100));
        });
        if (result.processedPdf) {
          const blob = new Blob([result.processedPdf], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
        }
        onComplete(result);
      }

    } catch (error) {
      onError(error as Error);
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
      
      {selectedFiles.length > 0 && !isProcessing && (
        <button
          onClick={handleProcessClick}
          disabled={isProcessing}
          className="btn-primary w-full p-3 rounded-lg flex items-center justify-center gap-2"
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
          download={`processed-${toolId}.pdf`} // Customize download name based on tool
          className="btn-success block w-full text-center p-3 rounded-lg"
          // Consider revoking URL on unmount or new file selection instead of click for better UX
          // onClick={() => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); setDownloadUrl(null); }}
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
      // resetKeys can be used to automatically reset if certain props change, e.g. props.toolId
      resetKeys={[props.toolId]} 
    >
      <PDFProcessor {...props} />
    </ErrorBoundary>
  );
}