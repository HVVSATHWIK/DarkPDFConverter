import { Suspense, useState, useCallback, useRef, useEffect } from 'react'; // Added useEffect
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CarouselScene from './components/CarouselScene';
import LoadingSpinner from './components/LoadingSpinner';
import WorkspacePanel from './components/WorkspacePanel';
import MiniCarousel from './components/MiniCarousel';
import type { Tool } from './types';

const tools: Tool[] = [
  { id: 1, name: 'Dark Mode', icon: '🌙', description: 'Convert PDFs to dark mode' },
  { id: 2, name: 'Merge PDFs', icon: '🔄', description: 'Combine multiple PDFs' },
  { id: 3, name: 'Split PDF', icon: '✂️', description: 'Split PDF into multiple files' },
  { id: 4, name: 'Rotate PDF', icon: '🔄', description: 'Rotate PDF pages' },
  { id: 5, name: 'Compress PDF', icon: '📦', description: 'Reduce PDF file size' },
  { id: 6, name: 'Extract Pages', icon: '📄', description: 'Extract specific pages' },
];

function App() {
  // STATE VARIABLES:
  // `activeTool`: Stores the currently selected tool object, or null if no tool is active.
  // This determines which tool's UI and logic is presented in the WorkspacePanel.
  const [activeTool, setActiveToolState] = useState<Tool | null>(null);

  // `isCardCentered`: Boolean flag indicating if the `activeTool`'s card animation to the center is complete.
  // If true, WorkspacePanel and MiniCarousel are typically visible.
  // If false, it means the card is in the main carousel ring or animating.
  // This is also used as a "target state" signal for animations in CarouselScene.
  const [isCardCentered, setIsCardCentered] = useState<boolean>(false);

  // `pendingTool`: Stores a tool object that has been selected (e.g., from MiniCarousel)
  // while another tool is currently active and centered. The `pendingTool` will become
  // `activeTool` after the current `activeTool` finishes animating back to the ring.
  const [pendingTool, setPendingTool] = useState<Tool | null>(null);

  // REFS FOR STABLE CALLBACKS:
  // These refs store the latest values of state variables.
  // They are used in `useCallback` hooks to prevent frequent re-creation of callback functions,
  // which can optimize performance by reducing unnecessary re-renders of child components.
  const activeToolRef = useRef(activeTool);
  const pendingToolRef = useRef(pendingTool);
  const isCardCenteredRef = useRef(isCardCentered);

  // Effect to keep refs updated with the latest state values.
  useEffect(() => {
    activeToolRef.current = activeTool;
    pendingToolRef.current = pendingTool;
    isCardCenteredRef.current = isCardCentered;
  }, [activeTool, pendingTool, isCardCentered]);

  // CORE EVENT HANDLERS & ANIMATION LOGIC COORDINATION:

  /**
   * `handleToolSelect`: Central handler for selecting a tool or closing the workspace.
   * This function orchestrates the state changes that drive card animations.
   * @param tool The tool object to select, or `null` to close the current workspace.
   */
  const handleToolSelect = useCallback((tool: Tool | null) => {
    const currentActiveTool = activeToolRef.current; // Get latest value from ref
    const currentIsCardCentered = isCardCenteredRef.current; // Get latest value from ref

    if (tool === null) {
      // ACTION: Close workspace or deselect the current tool.
      if (currentActiveTool) { // Only if a tool is currently active.
        setPendingTool(null); // Ensure no tool is queued up next.
        // Signal the current active card to return to the ring.
        // `CarouselScene` will react to `isCardCentered: false` for the `activeTool`.
        setIsCardCentered(false);
      }
      // If no tool is active, selecting null does nothing further.
    } else {
      // ACTION: Select a new tool.
      if (currentActiveTool && currentIsCardCentered && tool.id !== currentActiveTool.id) {
        // CASE 1: Switching from an already centered tool (typically via MiniCarousel).
        setPendingTool(tool); // Queue the newly selected tool.
        // Signal the current `activeTool` (which is `currentActiveTool`) to return to the ring.
        setIsCardCentered(false);
        // `activeTool` state remains `currentActiveTool` until `onCardReturnedToRing` promotes `pendingTool`.
      } else if (tool.id !== currentActiveTool?.id || !currentIsCardCentered) {
        // CASE 2: Selecting a new tool from the main carousel,
        // OR re-selecting the current active tool that isn't centered (e.g., it was returning),
        // OR selecting a tool when no tool is active/centered.
        setPendingTool(null); // No pending operation; this is a direct activation.
        setActiveToolState(tool); // Set the new tool as active immediately.
        // Signal that this new `activeTool`'s TARGET destination is the center.
        // `CarouselScene` will see `activeTool` changed and `isCardActuallyCentered: true` (this component's `isCardCentered`).
        // `AnimatedToolCardWrapper` for this tool will then animate it to the center position.
        setIsCardCentered(true);
      }
      // CASE 3: Clicking the same tool in MiniCarousel that's already active and centered.
      // This case is implicitly handled because the button for the active tool in MiniCarousel is disabled.
    }
  }, []); // Empty dependency array because latest state is accessed via refs.

  /**
   * `onCardReachedCenter`: Callback triggered by `CarouselScene` when a card's animation
   * to the center position is complete.
   */
  const onCardReachedCenter = useCallback(() => {
    // If a tool is meant to be active and this callback is fired,
    // confirm/set `isCardCentered` to true. This is important if the `setIsCardCentered(true)`
    // in `handleToolSelect` was an optimistic update or if there are other paths.
    if (activeToolRef.current) { // Check against ref for the most current activeTool
      if(!isCardCenteredRef.current) setIsCardCentered(true); // Only update if not already true
    }
  }, []); // Empty dependency array.

  /**
   * `onCardReturnedToRing`: Callback triggered by `CarouselScene` when a card's animation
   * back to its position in the carousel ring is complete.
   * @param returnedToolId The ID of the tool whose card just returned to the ring.
   */
  const onCardReturnedToRing = useCallback((returnedToolId: number) => {
    const currentActiveTool = activeToolRef.current;
    const currentPendingTool = pendingToolRef.current;

    if (currentPendingTool && currentActiveTool && returnedToolId === currentActiveTool.id) {
      // CASE 1: A tool switch was in progress. The old `activeTool` (`currentActiveTool`) has returned.
      // Now, activate the `currentPendingTool`.
      setActiveToolState(currentPendingTool);
      setPendingTool(null);
      // Signal that this new `activeTool` (which was `currentPendingTool`) should animate to the center.
      setIsCardCentered(true);
    } else if (!currentPendingTool && currentActiveTool && returnedToolId === currentActiveTool.id) {
      // CASE 2: No tool switch was pending. The `currentActiveTool` returned to the ring
      // because the user closed the workspace (e.g., clicked "Back to All Tools").
      setActiveToolState(null); // Clear the active tool; workspace is now closed.
      // `isCardCentered` should already be false from the `handleToolSelect(null)` call.
    }
    // Other scenarios (e.g., stray callbacks if IDs don't match) are ignored.
  }, []); // Empty dependency array.

  /**
   * `handleCloseWorkspace`: Handler for the "Back to All Tools" button in `WorkspacePanel`.
   * Initiates the process of closing the workspace by deselecting the current tool.
   */
  const handleCloseWorkspace = () => {
    handleToolSelect(null);
  };

  // DERIVED STATE:
  // `isAnyToolProcessActive`: A boolean flag that is true if there's an `activeTool`
  // OR a `pendingTool`. This is used to:
  //  - Disable OrbitControls.
  //  - Signal `CarouselScene` to hide non-active cards and pause carousel rotation/breathing.
  const isAnyToolProcessActive = !!(activeToolRef.current || pendingToolRef.current);

  return (
    <div className="min-h-screen bg-dark">
      <div className="fixed inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <Suspense fallback={null}>
            <CarouselScene
              tools={tools}
              activeTool={activeTool} // Pass current state, not ref, for reactivity
              onToolSelect={handleToolSelect} 
              onCardReachedCenter={onCardReachedCenter}
              onCardReturnedToRing={onCardReturnedToRing}
              isCardActuallyCentered={isCardCentered} // Pass current state
              isAnyToolProcessActive={isAnyToolProcessActive} 
            />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enabled={!isAnyToolProcessActive} 
            />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pointer-events-none">
        <header className="text-center mb-8">
          {/* Responsive font size for main title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            LitasDark: PDF Tools Hub
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Your all-in-one PDF manipulation toolkit
          </p>
        </header>
      </div>

      <WorkspacePanel
        activeTool={activeTool} 
        isVisible={isCardCentered && !!activeTool} 
        onClose={handleCloseWorkspace}
      />

      {activeTool && isCardCentered && (
        <MiniCarousel
          tools={tools}
          activeTool={activeTool} 
          onToolSelect={handleToolSelect} 
        />
      )}
      
      <LoadingSpinner />
    </div>
  );
}

export default App;