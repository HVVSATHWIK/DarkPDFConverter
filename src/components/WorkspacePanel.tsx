import { useState, useEffect } from 'react'; // React default import removed
// import React, { useState, useEffect } from 'react'; // Removed duplicate import
import { motion, AnimatePresence } from 'framer-motion';
import { Tool } from '../types';
import PDFProcessorWithErrorBoundary from './PDFProcessor';
// import { useState, useEffect } from 'react'; // This specific line was commented out in original, but the duplicate React import was the main issue
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import DarkModeControls from './tools/DarkModeControls';
import { DarkModeOptions } from '@/hooks/useDarkMode';
import SplitPDFControls from './tools/SplitPDFControls';
import { SplitOptions } from '@/hooks/useSplitPDF';

interface WorkspacePanelProps {
  activeTool: Tool | null;
  isVisible: boolean;
  onClose: () => void;
}

export default function WorkspacePanel({ activeTool, isVisible, onClose }: WorkspacePanelProps) {
  const [processedData, setProcessedData] = useState<any>(null);
  const [darkModeSettings, setDarkModeSettings] = useState<DarkModeOptions>({ theme: 'dark' });
  const [splitPdfSettings, setSplitPdfSettings] = useState<SplitOptions | null>(null);

  useEffect(() => {
    if (!isVisible || !activeTool) {
      setProcessedData(null);
    }
    if (!isVisible || (activeTool && activeTool.name !== 'Dark Mode')) {
      setDarkModeSettings({ theme: 'dark' });
    }
    if (!isVisible || (activeTool && activeTool.name !== 'Split PDF')) {
      setSplitPdfSettings(null);
    }
  }, [activeTool, isVisible]);

  if (!isVisible || !activeTool) return null;

  const handleComplete = (result: any) => {
    console.log(`Processing complete for ${activeTool.name}:`, result);
    setProcessedData(result);
  };

  const handleError = (error: Error) => {
    console.error(`Error during processing for ${activeTool.name}:`, error);
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
              splitPdfOptions={splitPdfSettings || undefined} // Changed here: null to undefined
            />
            <SplitPDFControls
              onSettingsChange={setSplitPdfSettings}
              currentOptions={splitPdfSettings}
            />
          </>
        );
      case 'Merge PDFs':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id}
              activeTool={activeTool}
              allowMultipleFiles={true}
              onComplete={handleComplete}
              onError={handleError}
              processActionName="Merge Selected PDFs"
            />
          </>
        );
      default:
        return <p className="text-gray-400">Tool UI for '{activeTool.name}' not implemented yet.</p>;
    }
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 30, scale: 0.98, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {isVisible && activeTool && (
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-30 flex items-center justify-center p-4 backdrop-blur-sm bg-black bg-opacity-30"
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
          <motion.div
            className="relative bg-gray-800 text-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <header className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
              <button
                onClick={onClose}
                className="group flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-all px-4 py-2 rounded-full hover:bg-white/10 self-start md:self-center"
                aria-label="Back to all tools"
              >
                <ArrowUturnLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back</span>
              </button>

              <div className="flex-grow flex flex-col items-center justify-center md:-ml-20 mt-4 md:mt-0">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 p-2 bg-cyan-400/10 rounded-xl">
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
                <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">Preview / Output</h3>
                <div className="w-full min-h-[200px] md:min-h-[300px] h-full bg-gray-900 rounded-lg flex flex-col items-center justify-center text-gray-500 p-4 shadow-inner">
                  {processedData ? (
                    <div className="text-sm text-left w-full">
                      {processedData.error && <p className="text-red-400">Error: {processedData.error}</p>}
                      {processedData.title && <p><strong>Title:</strong> {processedData.title}</p>}
                      {processedData.pageCount && <p><strong>Pages:</strong> {processedData.pageCount}</p>}
                      {processedData.isMerged && <p className="text-green-400">Successfully merged {processedData.title.match(/\((\d+) files\)/)?.[1] || 'multiple'} files.</p>}
                      {processedData.message && !processedData.isMerged && <p>{processedData.message}</p>}
                      {!processedData.error && !processedData.title && !processedData.pageCount && !processedData.message && (
                        <p>Processing completed. Result details will appear here.</p>
                      )}
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
    </AnimatePresence>
  );
}