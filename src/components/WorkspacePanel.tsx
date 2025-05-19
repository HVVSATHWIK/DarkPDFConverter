import { motion, AnimatePresence } from 'framer-motion';
import { Tool } from '../types';
import PDFProcessorWithErrorBoundary from './PDFProcessor';

interface WorkspacePanelProps {
  activeTool: Tool | null;
  onClose: () => void;
}

export default function WorkspacePanel({ activeTool, onClose }: WorkspacePanelProps) {
  if (!activeTool) return null;

  const handleComplete = async (result: any) => {
    // Process the PDF based on the active tool
    console.log(`Processing complete for ${activeTool.name}:`, result);
  };

  const handleError = (error: Error) => {
    console.error('PDF processing error:', error);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed inset-0 z-20 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <motion.div 
          className="relative bg-darker rounded-xl p-6 w-full max-w-4xl"
          layoutId={`tool-card-${activeTool.id}`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            ✕
          </button>
          
          <h2 className="text-2xl font-bold mb-4">{activeTool.name}</h2>
          
          <div className="bg-darkest rounded-lg p-4">
            <PDFProcessorWithErrorBoundary
              onComplete={handleComplete}
              onError={handleError}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}