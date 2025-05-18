import { motion, AnimatePresence } from 'framer-motion';
import { Tool } from '../types';

interface WorkspacePanelProps {
  activeTool: Tool | null;
  onClose: () => void;
}

export default function WorkspacePanel({ activeTool, onClose }: WorkspacePanelProps) {
  if (!activeTool) return null;

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
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <p className="text-lg mb-4">Drop your PDF here or click to upload</p>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="btn-primary inline-block"
              >
                Select PDF
              </label>
            </div>
          </div>
          
          <div className="mt-4 space-y-4">
            <div className="flex gap-4">
              <button className="btn-primary flex-1">Process</button>
              <button className="btn-primary flex-1">Download</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}