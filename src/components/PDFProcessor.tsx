import { useState, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { useProcessPDF } from '../hooks/useProcessPDF';

interface PDFProcessorProps {
  onComplete: (result: any) => void;
  onError: (error: Error) => void;
}

function PDFProcessor({ onComplete, onError }: PDFProcessorProps) {
  const [progress, setProgress] = useState(0);
  const { processDocument, isProcessing } = useProcessPDF();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await processDocument(file, (progress) => {
        setProgress(Math.round(progress * 100));
      });

      if (result.processedPdf) {
        const blob = new Blob([result.processedPdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      }

      onComplete(result);
    } catch (error) {
      onError(error as Error);
    }
  }, [onComplete, onError, processDocument]);

  return (
    <div role="region" aria-label="PDF processing area" className="space-y-4">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        aria-label="Choose PDF file"
        className="sr-only"
        id="pdf-upload"
      />
      <label
        htmlFor="pdf-upload"
        className="btn-primary block w-full text-center p-4 rounded-lg cursor-pointer"
      >
        {isProcessing ? 'Processing...' : 'Select PDF'}
      </label>
      
      {isProcessing && (
        <motion.div
          className="w-full h-2 bg-gray-200 rounded-full mt-4"
          aria-label={`Processing progress: ${progress}%`}
        >
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}

      {downloadUrl && (
        <a
          href={downloadUrl}
          download="processed.pdf"
          className="btn-primary block w-full text-center mt-4 p-4 rounded-lg"
          onClick={() => URL.revokeObjectURL(downloadUrl)}
        >
          Download Processed PDF
        </a>
      )}
    </div>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert" className="p-4 bg-red-100 text-red-700 rounded-lg">
      <h2 className="text-lg font-semibold">Something went wrong:</h2>
      <pre className="mt-2 text-sm">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}

export default function PDFProcessorWithErrorBoundary(props: PDFProcessorProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PDFProcessor {...props} />
    </ErrorBoundary>
  );
}