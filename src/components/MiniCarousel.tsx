import { motion } from 'framer-motion';
import { Tool } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react'; // Removed useEffect as it's not used in the final commented version

/**
 * Props for the MiniCarousel component.
 */
interface MiniCarouselProps {
  tools: Tool[]; // Array of all available tools.
  activeTool: Tool | null; // The currently active tool, used to highlight it in the carousel.
  onToolSelect: (tool: Tool) => void; // Callback function when a tool icon is clicked.
                                     // This triggers the tool switching logic in App.tsx.
}

/**
 * `MiniCarousel` is a horizontal scrollable bar displayed at the bottom of the screen
 * when a tool's workspace is active. It allows users to quickly switch between tools
 * without returning to the main 3D carousel.
 * Animation is handled by `framer-motion`.
 */
export default function MiniCarousel({ tools, activeTool, onToolSelect }: MiniCarouselProps) {
  // Ref for the scrollable div containing the tool icons.
  // Used by the scroll buttons to programmatically scroll the content.
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Handles scrolling the carousel content left or right.
   * @param direction The direction to scroll ('left' or 'right').
   */
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150; // Scroll by 150px.
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // --- Future Enhancement Placeholders ---
  // Placeholder for future keyboard navigation integration:
  // This would involve adding an effect hook to listen for ArrowLeft/ArrowRight keys
  // to scroll, and potentially Enter/Space to select a focused tool.
  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.key === 'ArrowLeft') scroll('left');
  //     if (event.key === 'ArrowRight') scroll('right');
  //     // Additional logic would be needed for focusing items and selecting with Enter/Space.
  //   };
  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => window.removeEventListener('keydown', handleKeyDown);
  // }, []); // Empty dependency array: runs once on mount.

  // Placeholder for future swipe gesture integration:
  // This could be implemented using framer-motion's `drag` prop and `useDragControls`,
  // or a dedicated touch gesture library.
  // const dragControls = useDragControls();
  // Example: <motion.div ref={scrollContainerRef} drag="x" dragControls={dragControls} ... >
  // --- End Future Enhancement Placeholders ---

  // This component should not be rendered if `activeTool` is null.
  // Visibility is typically controlled by `App.tsx` based on `activeTool && isCardCentered`.
  if (!activeTool) return null; 

  return (
    // Main container for the MiniCarousel, animated with Framer Motion.
    <motion.div
      initial={{ opacity: 0, y: 60 }} // Initial state: transparent and off-screen (bottom).
      animate={{ opacity: 1, y: 0, transition: { delay: 0.3, type: 'spring', stiffness: 80 } }} // Animate to visible and on-screen.
      exit={{ opacity: 0, y: 60, transition: { duration: 0.2 } }} // Animate out when unmounted.
      className="fixed bottom-0 left-0 right-0 z-30 flex justify-center p-3 bg-gray-900 bg-opacity-70 backdrop-blur-md shadow-top-lg"
      // `shadow-top-lg` is a custom utility class for a shadow on the top edge.
    >
      {/* Left scroll button */}
      <button 
        onClick={() => scroll('left')} 
        className="p-2 m-1 rounded-full bg-gray-700 hover:bg-gray-600 text-white self-center disabled:opacity-50"
        aria-label="Scroll left"
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </button>

      {/* Scrollable container for tool icons */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar px-2" // `no-scrollbar` hides the browser's default scrollbar.
        style={{ maxWidth: 'calc(100vw - 120px)' }} // Limits width to prevent overflow, leaving space for scroll buttons.
      >
        {tools.map((tool) => {
          // Determine if the current tool in the map is the globally active tool.
          const isCurrentToolActive = tool.id === activeTool?.id;
          return (
            <motion.button
              key={tool.id}
              onClick={() => {
                // Allow selection only if this tool is not already the active one.
                if (!isCurrentToolActive) { 
                  onToolSelect(tool); // Calls App.tsx's handleToolSelect to switch tools.
                }
              }}
              // Dynamic classes for styling based on whether the tool is active.
              className={`flex flex-col items-center justify-center p-3 rounded-lg min-w-[70px] h-[70px] transition-all duration-200 ease-in-out
                ${
                  isCurrentToolActive
                    ? 'bg-blue-600 text-white shadow-blue-500/50 shadow-lg scale-105 ring-2 ring-blue-400' // Highlighted style for active tool.
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:shadow-md' // Default style for other tools.
                }
                ${isCurrentToolActive ? '' : 'hover:scale-105'} // Hover scale effect for non-active tools.
              `}
              // Framer Motion animation props for hover and tap effects.
              whileHover={{ scale: isCurrentToolActive ? 1.05 : 1.1 }} // Active tool scales less on hover.
              whileTap={{ scale: isCurrentToolActive ? 1.05 : 0.95 }}  // Tap effect.
              disabled={isCurrentToolActive} // Disable button if it's the currently active tool.
              aria-pressed={isCurrentToolActive} // ARIA attribute for accessibility.
              title={tool.name} // Tooltip for tool name.
            >
              <span className="text-2xl">{tool.icon}</span> {/* Tool icon */}
              <span className="text-xs mt-1 truncate">{tool.name}</span> {/* Tool name (truncated if too long) */}
            </motion.button>
          );
        })}
      </div>

      {/* Right scroll button */}
      <button 
        onClick={() => scroll('right')} 
        className="p-2 m-1 rounded-full bg-gray-700 hover:bg-gray-600 text-white self-center disabled:opacity-50"
        aria-label="Scroll right"
      >
        <ChevronRightIcon className="h-6 w-6" />
      </button>
    </motion.div>
  );
}

// Note on Helper CSS classes (assumed to be in a global CSS file like src/index.css):
/*
.no-scrollbar::-webkit-scrollbar {
  display: none; // Hide scrollbar for WebKit browsers (Chrome, Safari).
}
.no-scrollbar {
  -ms-overflow-style: none;  // Hide scrollbar for IE and Edge.
  scrollbar-width: none;     // Hide scrollbar for Firefox.
}
.shadow-top-lg { // Custom shadow applied to the top of the MiniCarousel.
  box-shadow: 0 -10px 15px -3px rgba(0,0,0,0.1), 0 -4px 6px -2px rgba(0,0,0,0.05);
}
*/
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; 
  scrollbar-width: none;  
}
.shadow-top-lg {
  box-shadow: 0 -10px 15px -3px rgba(0,0,0,0.1), 0 -4px 6px -2px rgba(0,0,0,0.05);
}
*/