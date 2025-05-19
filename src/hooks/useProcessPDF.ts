import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';

interface ProcessResult {
  metadata: any;
  pageCount: number;
  title: string;
  processedPdf?: Uint8Array;
}

export function useProcessPDF() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processDocument = useCallback(async (
    file: File,
    onProgress: (progress: number) => void
  ): Promise<ProcessResult> => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pageCount = pdfDoc.getPageCount();
      const metadata = await extractMetadata(pdfDoc);
      
      // Process pages with throttled progress updates
      for (let i = 0; i < pageCount; i++) {
        if (i % 5 === 0 || i === pageCount - 1) { // Update progress every 5 pages
          onProgress((i + 1) / pageCount);
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      const processedPdf = await pdfDoc.save();

      return {
        metadata,
        pageCount,
        title: metadata.title || file.name,
        processedPdf
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { processDocument, isProcessing };
}

async function extractMetadata(pdfDoc: PDFDocument) {
  return {
    title: pdfDoc.getTitle(),
    author: pdfDoc.getAuthor(),
    subject: pdfDoc.getSubject(),
    keywords: pdfDoc.getKeywords(),
    creator: pdfDoc.getCreator(),
    producer: pdfDoc.getProducer(),
    creationDate: pdfDoc.getCreationDate(),
    modificationDate: pdfDoc.getModificationDate(),
  };
}