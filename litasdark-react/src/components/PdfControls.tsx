import React, { useRef, useState } from 'react';
import { generatePreview, convertToDarkMode, splitPdf, mergePdfs, rotatePage } from '../services/pdfService';
import { usePdfSettings } from '../hooks/usePdfSettings';

const PdfControls: React.FC = () => {
  const { setCurrentPage, setMessages } = usePdfSettings();
  const [splitError, setSplitError] = useState('');
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pageNumRef = useRef<HTMLInputElement>(null);
  const angleRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSplitPdf = async () => {
    if (!startRef.current || !endRef.current) {
      setMessages([{ id: Date.now().toString(), type: 'error', text: 'Please provide start and end page numbers' }]);
      return;
    }
    
    const start = +startRef.current.value;
    const end = +endRef.current.value;
    
    try {
      const result = await splitPdf(start, end);
      if (result) {
        const blob = new Blob([result], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `split-pages-${start}-${end}.pdf`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err) {
      setSplitError((err as Error).message);
      setMessages([{ id: Date.now().toString(), type: 'error', text: (err as Error).message }]);
    }
  };

  const handleMergePdfs = async () => {
    if (!fileRef.current?.files?.length) {
      setMessages([{ id: Date.now().toString(), type: 'error', text: 'Please select at least one PDF file' }]);
      return;
    }
    
    try {
      await mergePdfs(fileRef.current.files);
      setMessages([{ id: Date.now().toString(), type: 'info', text: 'PDFs merged successfully' }]);
    } catch (err) {
      setMessages([{ id: Date.now().toString(), type: 'error', text: (err as Error).message }]);
    }
  };

  const handleRotatePage = async () => {
    if (!pageNumRef.current || !angleRef.current) {
      setMessages([{ id: Date.now().toString(), type: 'error', text: 'Please provide page number and angle' }]);
      return;
    }
    
    const pageNum = +pageNumRef.current.value;
    const angle = +angleRef.current.value;
    
    try {
      await rotatePage(pageNum, angle);
      setMessages([{ id: Date.now().toString(), type: 'info', text: `Page ${pageNum} rotated by ${angle}°` }]);
    } catch (err) {
      setMessages([{ id: Date.now().toString(), type: 'error', text: (err as Error).message }]);
    }
  };

  const handleGeneratePreview = async () => {
    if (!canvasRef.current) {
      setMessages([{ id: Date.now().toString(), type: 'error', text: 'Preview canvas not available' }]);
      return;
    }
    
    try {
      await generatePreview(setCurrentPage, canvasRef.current);
    } catch (err) {
      setMessages([{ id: Date.now().toString(), type: 'error', text: (err as Error).message }]);
    }
  };

  return (
    <section className="pdf-controls">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="control-group">
        <button className="btn-primary" onClick={handleGeneratePreview}>
          Generate Preview
        </button>
        <button className="btn-primary" onClick={() => convertToDarkMode()}>
          Convert to Dark Mode
        </button>
      </div>

      <div className="control-group">
        <div className="input-group">
          <label>Split Pages:</label>
          <input ref={startRef} type="number" placeholder="Start" min="1" />
          <span className="range-separator">-</span>
          <input ref={endRef} type="number" placeholder="End" min="1" />
          <button className="btn-secondary" onClick={handleSplitPdf}>
            Split PDF
          </button>
        </div>
        {splitError && <div className="error-message">{splitError}</div>}
      </div>

      <div className="control-group">
        <div className="input-group">
          <label>Merge PDFs:</label>
          <input ref={fileRef} type="file" multiple accept="application/pdf" />
          <button className="btn-secondary" onClick={handleMergePdfs}>
            Merge PDFs
          </button>
        </div>
      </div>

      <div className="control-group">
        <div className="input-group">
          <label>Rotate Page:</label>
          <input ref={pageNumRef} type="number" placeholder="Page" min="1" />
          <input ref={angleRef} type="number" placeholder="Degrees" />
          <button className="btn-secondary" onClick={handleRotatePage}>
            Rotate
          </button>
        </div>
      </div>
    </section>
  );
};

export default PdfControls;