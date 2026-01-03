import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { Tool } from '../types';
import PDFProcessorWithErrorBoundary from './PDFProcessor';
import DarkModeControls from './tools/DarkModeControls';
import { DarkModeOptions } from '@/hooks/useDarkMode';
import SplitPDFControls from './tools/SplitPDFControls';
import { SplitOptions } from '@/hooks/useSplitPDF';
import RotatePDFControls from './tools/RotatePDFControls';
import { RotateOptions } from '@/hooks/useRotatePDF';
import ExtractPagesControls from './tools/ExtractPagesControls';
import { ExtractOptions } from '@/hooks/useExtractPages';
import PDFPreview from './common/PDFPreview';
// ...

interface WorkspacePanelProps {
  activeTool: Tool | null;
  isVisible: boolean;
  onClose: () => void;
}

export default function WorkspacePanel({ activeTool, isVisible, onClose }: WorkspacePanelProps) {
  const [processedData, setProcessedData] = useState<any>(null);
  const [darkModeSettings, setDarkModeSettings] = useState<DarkModeOptions>({ theme: 'dark' });
  const [splitPdfSettings, setSplitPdfSettings] = useState<SplitOptions | null>(null);
  const [rotateSettings, setRotateSettings] = useState<RotateOptions | null>(null);
  const [extractSettings, setExtractSettings] = useState<ExtractOptions | null>(null);

  useEffect(() => {
    if (!isVisible || !activeTool) {
      setProcessedData(null);
    }
    // Cleanup settings when switching tools
    if (!isVisible || (activeTool && activeTool.name !== 'Dark Mode')) setDarkModeSettings({ theme: 'dark' });
    if (!isVisible || (activeTool && activeTool.name !== 'Split PDF')) setSplitPdfSettings(null);
    if (!isVisible || (activeTool && activeTool.name !== 'Rotate PDF')) setRotateSettings(null);
    if (!isVisible || (activeTool && activeTool.name !== 'Extract Pages')) setExtractSettings(null);
  }, [activeTool, isVisible]);

  const handleComplete = (result: any) => {
    console.log(`Processing complete for ${activeTool?.name}:`, result);

    // Deep clone the buffer to prevent "ArrayBuffer detached" errors if 
    // downstream components (like react-pdf workers) transfer/consume it.
    // Use Blob Wrapper Pattern (Architecture Strategy A)
    // Convert ArrayBuffer/Uint8Array to Blob to prevent detachment errors and improve memory efficiency.
    // Blobs are immutable and act as stable file references for react-pdf.
    if (result.processedPdf && !(result.processedPdf instanceof Blob)) {
      result.processedPdf = new Blob([result.processedPdf], { type: 'application/pdf' });
    }

    setProcessedData(result);
  };

  const handleError = (error: Error) => {
    console.error(`Error during processing for ${activeTool?.name}:`, error);
    setProcessedData({ error: error.message });
  };

  const renderToolSpecificUI = () => {
    if (!activeTool) return null;

    switch (activeTool.name) {
      case 'Dark Mode':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id}
              activeTool={activeTool}
              allowMultipleFiles={false}
              onComplete={handleComplete}
              onError={handleError}
              processActionName="Apply Dark Mode"
              darkModePreviewOptions={darkModeSettings}
            />
            <DarkModeControls
              onSettingsChange={setDarkModeSettings}
              currentOptions={darkModeSettings}
            />
          </>
        );
      case 'Split PDF':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id}
              activeTool={activeTool}
              allowMultipleFiles={false}
              onComplete={handleComplete}
              onError={handleError}
              processActionName="Split PDF"
              splitPdfOptions={splitPdfSettings || undefined}
            />
            <SplitPDFControls
              onSettingsChange={setSplitPdfSettings}
              currentOptions={splitPdfSettings}
            />
          </>
        );
      case 'Merge PDFs':
        return (
          <PDFProcessorWithErrorBoundary
            toolId={activeTool.id}
            activeTool={activeTool}
            allowMultipleFiles={true}
            onComplete={handleComplete}
            onError={handleError}
            processActionName="Merge Selected PDFs"
          />
        );
      case 'Rotate PDF':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id}
              activeTool={activeTool}
              allowMultipleFiles={false}
              onComplete={handleComplete}
              onError={handleError}
              processActionName="Rotate PDF"
              rotateOptions={rotateSettings || undefined}
            />
            <RotatePDFControls
              onSettingsChange={setRotateSettings}
              currentOptions={rotateSettings}
            />
          </>
        );
      case 'Extract Pages':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id}
              activeTool={activeTool}
              allowMultipleFiles={false}
              onComplete={handleComplete}
              onError={handleError}
              processActionName="Extract Pages"
              extractOptions={extractSettings || undefined}
            />
            <ExtractPagesControls
              onSettingsChange={setExtractSettings}
              currentOptions={extractSettings}
            />
          </>
        );
      case 'Compress PDF': // Phase 1: Auto structural compression
        return (
          <PDFProcessorWithErrorBoundary
            toolId={activeTool.id}
            activeTool={activeTool}
            allowMultipleFiles={false}
            onComplete={handleComplete}
            onError={handleError}
            processActionName="Compress PDF"
          />
        );
      default:
        return <p className="text-gray-400">Tool UI for '{activeTool.name}' not implemented yet.</p>;
    }
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'tween', duration: 0.18, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      y: 8,
      scale: 0.99,
      transition: { type: 'tween', duration: 0.12, ease: 'easeIn' }
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isVisible && activeTool && (
        <motion.div
          key={activeTool.id}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[45] flex items-center justify-center p-4 backdrop-blur-md bg-black/40"
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

          {/* Main Panel Container */}
          <motion.div
            className="relative bg-slate-900/70 text-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden pointer-events-auto origin-center border border-white/10"
          >
            <header className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
              <button
                onClick={onClose}
                className="group relative z-50 cursor-pointer flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-all px-4 py-2 rounded-full hover:bg-white/10 self-start md:self-center"
                aria-label="Back to all tools"
              >
                <ArrowUturnLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back</span>
              </button>

              <div className="flex-grow flex flex-col items-center justify-center md:-ml-20 mt-4 md:mt-0">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-300 p-2 bg-cyan-400/10 rounded-xl ring-1 ring-cyan-400/20">
                    {activeTool.icon}
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {activeTool.name}
                  </h2>
                </div>
                {activeTool.description && (
                  <p className="text-sm text-slate-400 mt-1 hidden md:block">
                    {activeTool.description}
                  </p>
                )}
              </div>
              <div className="hidden md:block w-20"></div> {/* Spacer for visual centering */}
            </header>

            <div className="flex-grow p-4 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-6">
                {renderToolSpecificUI()}
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 border-b border-white/10 pb-2">Preview / Output</h3>
                <div className="w-full min-h-[200px] md:min-h-[300px] h-full bg-black/30 rounded-xl flex flex-col items-center justify-center text-slate-300 p-4 shadow-inner border border-white/10">
                  {processedData ? (
                    <div className="w-full flex flex-col items-center gap-4">
                      {/* Try rendering preview if we have PDF data */}
                      {(processedData.processedPdf || processedData instanceof Uint8Array || processedData instanceof Blob) && (
                        <PDFPreview file={processedData.processedPdf || processedData} />
                      )}

                      <div className="text-sm text-left w-full">
                        {processedData.error && <p className="text-red-400">Error: {processedData.error}</p>}
                        {processedData.title && <p><strong>Title:</strong> {processedData.title}</p>}
                        {processedData.pageCount && <p><strong>Pages:</strong> {processedData.pageCount}</p>}
                        {processedData.isMerged && <p className="text-green-400">Successfully merged {processedData.title?.match(/\((\d+) files\)/)?.[1] || 'multiple'} files.</p>}
                        {processedData.message && !processedData.isMerged && <p>{processedData.message}</p>}
                        {!processedData.error && !processedData.title && !processedData.pageCount && !processedData.message && !processedData.processedPdf && (
                          <p>Processing completed. Details unavailable.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>PDF preview or processing results will appear here.</p>
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence >
  );
}