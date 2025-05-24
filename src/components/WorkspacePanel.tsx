import { motion, AnimatePresence } from 'framer-motion';
import { Tool } from '../types';
import PDFProcessorWithErrorBoundary from './PDFProcessor';
import { useState, useEffect } from 'react';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

/**
 * Props for the WorkspacePanel component.
 */
interface WorkspacePanelProps {
  activeTool: Tool | null; // The currently selected tool, or null if no tool is active.
  isVisible: boolean;      // Flag controlled by App.tsx to manage panel visibility,
                           // ensuring it appears only after 3D card animation is complete.
  onClose: () => void;     // Callback function to close the workspace panel.
}

/**
 * `DarkModeTogglePlaceholder` is a static placeholder component demonstrating
 * where tool-specific UI controls (like a dark mode toggle) would appear.
 */
const DarkModeTogglePlaceholder = () => (
  <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow">
    <label className="flex items-center justify-between text-white cursor-pointer">
      <span className="font-medium">Enable Dark Mode Enhancement:</span>
      {/* This is a visual placeholder for a toggle switch. */}
      <span className="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-600 hover:bg-gray-500 transition-colors">
        <span className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform translate-x-1 group-hover:translate-x-6" />
      </span>
    </label>
    <p className="text-xs text-gray-400 mt-2">Further customize dark mode intensity (future feature).</p>
  </div>
);

/**
 * `WorkspacePanel` is a modal-like component that displays the UI for the selected tool.
 * It includes areas for file input (via `PDFProcessor`), tool-specific controls,
 * and a preview of the processed output.
 * Its appearance is animated using `framer-motion`.
 */
export default function WorkspacePanel({ activeTool, isVisible, onClose }: WorkspacePanelProps) {
  // STATE VARIABLES:
  // `processedData`: Stores the result from `PDFProcessor` (e.g., metadata, file info)
  // or any error messages to be displayed in the preview area.
  const [processedData, setProcessedData] = useState<any>(null);

  // EFFECT HOOKS:
  // Resets `processedData` when the `activeTool` changes or when the panel becomes hidden.
  // This ensures that old processing results are cleared when switching tools or closing the panel.
  useEffect(() => {
    if (!isVisible || !activeTool) {
      setProcessedData(null);
    }
  }, [activeTool, isVisible]); // Dependencies: effect runs if `activeTool` or `isVisible` changes.

  // Conditional rendering: If not visible or no active tool, render nothing.
  if (!isVisible || !activeTool) return null;

  // EVENT HANDLERS for PDFProcessor callbacks:
  /**
   * `handleComplete`: Called when `PDFProcessor` successfully processes a file/files.
   * Updates `processedData` state with the result from the processor.
   * @param result The data returned by `PDFProcessor.onComplete`.
   */
  const handleComplete = (result: any) => {
    console.log(`Processing complete for ${activeTool.name}:`, result); // Logging for debug.
    setProcessedData(result);
    // Future: Could trigger display of a preview or download options based on `result`.
  };

  /**
   * `handleError`: Called when `PDFProcessor` encounters an error during processing.
   * Updates `processedData` state with the error message for display.
   * @param error The error object from `PDFProcessor.onError`.
   */
  const handleError = (error: Error) => {
    console.error(`Error during processing for ${activeTool.name}:`, error); // Logging for debug.
    setProcessedData({ error: error.message }); // Store error message for display.
  };

  /**
   * `renderToolSpecificUI`: Dynamically renders the UI elements specific to the `activeTool`.
   * This includes configuring `PDFProcessor` (e.g., `allowMultipleFiles`) and any
   * additional controls like toggles or options.
   * @returns JSX elements for the current tool, or a placeholder message.
   */
  const renderToolSpecificUI = () => {
    if (!activeTool) return null; // Should not happen due to the check at the start of WorkspacePanel.

    switch (activeTool.name) {
      case 'Dark Mode':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id} // Key for resetting PDFProcessor state when tool changes.
              allowMultipleFiles={false} // Dark Mode tool likely processes one file at a time.
              onComplete={handleComplete}
              onError={handleError}
              processActionName="Apply Dark Mode" // Custom label for the process button.
            />
            <DarkModeTogglePlaceholder /> {/* Example of a tool-specific control. */}
          </>
        );
      case 'Merge PDFs':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id}
              allowMultipleFiles={true} // Merge tool requires multiple files.
              onComplete={handleComplete}
              onError={handleError}
              processActionName="Merge Selected PDFs"
            />
            {/* PDFProcessor itself lists selected files. Additional merge-specific controls could go here. */}
          </>
        );
      // Add more cases here for other tools as they are implemented.
      default:
        return <p className="text-gray-400">Tool UI for '{activeTool.name}' not implemented yet.</p>;
    }
  };
  
  // Framer Motion variants for panel animation (appear/disappear).
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
            // layoutId removed as it might conflict with complex internal animations or visibility toggling
            // layoutId={`tool-card-${activeTool.id}`} 
          >
            {/* Header */}
            {/* Header */}
            <header className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 border-b border-gray-700 gap-3 md:gap-0">
              {/* Back Button */}
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors p-2 rounded-md hover:bg-gray-700 self-start md:self-center"
                aria-label="Back to all tools"
              >
                <ArrowUturnLeftIcon className="w-5 h-5" />
                <span>Back to All Tools</span>
              </button>
              
              {/* Tool Title Area */}
              <div className="flex-grow text-center md:ml-4"> {/* Allow title to take space, center it */}
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                  {activeTool.icon} {activeTool.name}
                </h2>
                {activeTool.description && (
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 hidden md:block">
                    {activeTool.description}
                  </p>
                )}
              </div>
              {/* Spacer to help with centering when the back button is present on md+ screens. Width approx equal to back button */}
              <div className="hidden md:flex md:w-[150px] lg:w-[180px] flex-shrink-0"></div>
            </header>

            {/* Main Content Area */}
            <div className="flex-grow p-4 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: File Input & Tool Controls */}
              <section className="space-y-6">
                {renderToolSpecificUI()}
              </section>

              {/* Right Column: Preview Area */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">Preview / Output</h3>
                <div className="w-full min-h-[200px] md:min-h-[300px] h-full bg-gray-900 rounded-lg flex flex-col items-center justify-center text-gray-500 p-4 shadow-inner">
                  {processedData ? (
                    <div className="text-sm text-left w-full">
                      {processedData.error && <p className="text-red-400">Error: {processedData.error}</p>}
                      {processedData.title && <p><strong>Title:</strong> {processedData.title}</p>}
                      {processedData.pageCount && <p><strong>Pages:</strong> {processedData.pageCount}</p>}
                      {processedData.message && <p>{processedData.message}</p>}
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
            
            {/* Footer (Optional, for global actions if needed later) */}
            {/*
            <footer className="p-4 border-t border-gray-700">
              Global action buttons can go here if not part of PDFProcessor
            </footer>
            */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}