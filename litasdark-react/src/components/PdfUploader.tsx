import React, { useRef } from 'react';
import { loadPdf } from '../services/pdfService';
import { usePdfSettings } from '../hooks/usePdfSettings';

const PdfUploader: React.FC = () => {
  const { setMessages } = usePdfSettings();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Clear previous messages
      setMessages([]);

      if (file.type !== 'application/pdf') {
        throw new Error('Please upload a PDF file');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB');
      }

      await loadPdf(file);
      
      // Reset input after successful upload
      if (inputRef.current) inputRef.current.value = '';
      
    } catch (err) {
      const error = err as Error;
      setMessages([{
        id: Date.now().toString(),
        type: 'error',
        text: error.message
      }]);
    }
  };

  return (
    <section className="upload-section">
      <label htmlFor="pdfUpload" className="upload-label">
        📁 Upload PDF
        <input
          type="file"
          id="pdfUpload"
          accept="application/pdf"
          onChange={handleChange}
          ref={inputRef}
          className="upload-input"
        />
      </label>
    </section>
  );
};

export default PdfUploader;