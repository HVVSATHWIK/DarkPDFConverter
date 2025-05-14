import React, { useRef, useEffect } from 'react';
import { renderPage } from '../services/pdfService';
import { usePdfSettings } from '../hooks/usePdfSettings';

const PreviewCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    currentPage, 
    pageCount,
    loading,
    brightness, 
    contrast,
    setCurrentPage,
    setMessages
  } = usePdfSettings();

  useEffect(() => {
    const updatePreview = async () => {
      try {
        if (!canvasRef.current || !currentPage) return;
        
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');
        
        await renderPage(currentPage, canvasRef.current);
        
        canvasRef.current.style.filter = `
          brightness(${brightness}%)
          contrast(${contrast}%)
        `;
      } catch (err) {
        setMessages([{
          id: Date.now().toString(),
          type: 'error',
          text: `Rendering failed: ${(err as Error).message}`
        }]);
      }
    };

    updatePreview();
  }, [currentPage, brightness, contrast, setMessages]);

  return (
    <div className="preview-container">
      <div className="page-nav">
        <button 
          className="nav-button"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ← Previous
        </button>
        <span className="page-indicator">
          Page {currentPage} of {pageCount}
        </span>
        <button 
          className="nav-button"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === pageCount}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
      
      <div className="preview-content">
        {loading ? (
          <div className="loading-overlay">
            <div className="spinner" />
            <p>Loading PDF...</p>
          </div>
        ) : currentPage ? (
          <canvas 
            ref={canvasRef} 
            aria-label="PDF Preview" 
            className="pdf-canvas"
          />
        ) : (
          <div className="empty-state">
            <p>No PDF loaded</p>
            <p>Upload a PDF to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewCanvas;