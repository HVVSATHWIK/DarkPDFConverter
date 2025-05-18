import { motion } from 'framer-motion';
import { Tool } from '../types';

interface MiniCarouselProps {
  tools: Tool[];
  activeTool: Tool | null;
  onToolSelect: (tool: Tool) => void;
}

export default function MiniCarousel({ tools, activeTool, onToolSelect }: MiniCarouselProps) {
  if (!activeTool) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30"
    >
      <div className="flex gap-4 p-4 bg-darker rounded-full shadow-xl">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            onClick={() => onToolSelect(tool)}
            className={`p-3 rounded-full transition-colors ${
              tool.id === activeTool.id
                ? 'bg-primary text-white'
                : 'bg-darkest text-gray-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl">{tool.icon}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}