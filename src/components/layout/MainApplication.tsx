import { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CarouselScene from '../CarouselScene';
import LoadingSpinner from '../LoadingSpinner';
import WorkspacePanel from '../WorkspacePanel';
import MiniCarousel from '../MiniCarousel';
import type { Tool } from '../../types';

import {
  MoonIcon,
  Square2StackIcon,
  ScissorsIcon,
  ArrowPathIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const tools: Tool[] = [
  { id: 1, name: 'Dark Mode', icon: <MoonIcon className="w-8 h-8" />, description: 'Convert PDFs to dark mode' },
  { id: 2, name: 'Merge PDFs', icon: <Square2StackIcon className="w-8 h-8" />, description: 'Combine multiple PDFs' },
  { id: 3, name: 'Split PDF', icon: <ScissorsIcon className="w-8 h-8" />, description: 'Split PDF into multiple files' },
  { id: 4, name: 'Rotate PDF', icon: <ArrowPathIcon className="w-8 h-8" />, description: 'Rotate PDF pages' },
  { id: 5, name: 'Compress PDF', icon: <ArchiveBoxIcon className="w-8 h-8" />, description: 'Reduce PDF file size' },
  { id: 6, name: 'Extract Pages', icon: <DocumentDuplicateIcon className="w-8 h-8" />, description: 'Extract specific pages' },
];

export function MainApplication() {
  const [activeTool, setActiveToolState] = useState<Tool | null>(null);
  const [isCardCentered, setIsCardCentered] = useState<boolean>(false);
  const [pendingTool, setPendingTool] = useState<Tool | null>(null);

  const activeToolRef = useRef(activeTool);
  const pendingToolRef = useRef(pendingTool);
  const isCardCenteredRef = useRef(isCardCentered);

  useEffect(() => {
    activeToolRef.current = activeTool;
    pendingToolRef.current = pendingTool;
    isCardCenteredRef.current = isCardCentered;
  }, [activeTool, pendingTool, isCardCentered]);

  const handleToolSelect = useCallback((tool: Tool | null) => {
    const currentActiveTool = activeToolRef.current;
    const currentIsCardCentered = isCardCenteredRef.current;

    if (tool === null) {
      if (currentActiveTool) {
        setPendingTool(null);
        setIsCardCentered(false);
      }
    } else {
      if (currentActiveTool && currentIsCardCentered && tool.id !== currentActiveTool.id) {
        setPendingTool(tool);
        setIsCardCentered(false);
      } else if (tool.id !== currentActiveTool?.id || !currentIsCardCentered) {
        setPendingTool(null);
        setActiveToolState(tool);
        setIsCardCentered(true);
      }
    }
  }, []);

  const onCardReachedCenter = useCallback(() => {
    if (activeToolRef.current) {
      if (!isCardCenteredRef.current) setIsCardCentered(true);
    }
  }, []);

  const onCardReturnedToRing = useCallback((returnedToolId: number) => {
    const currentActiveTool = activeToolRef.current;
    const currentPendingTool = pendingToolRef.current;

    if (currentPendingTool && currentActiveTool && returnedToolId === currentActiveTool.id) {
      setActiveToolState(currentPendingTool);
      setPendingTool(null);
      setIsCardCentered(true);
    } else if (!currentPendingTool && currentActiveTool && returnedToolId === currentActiveTool.id) {
      setActiveToolState(null);
    }
  }, []);

  const handleCloseWorkspace = useCallback(() => {
    handleToolSelect(null);
    // FORCE RESET: Ensure state clears even if animation callback fails
    // This prevents the "stuck" state where arrows don't reappear
    setTimeout(() => {
      setActiveToolState(null);
      setIsCardCentered(false);
      setPendingTool(null);
    }, 800);
  }, [handleToolSelect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseWorkspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCloseWorkspace]);

  // Fix: Use state directly instead of refs to ensure re-render updates this value immediately
  const isAnyToolProcessActive = !!(activeTool || pendingTool);

  return (
    <div className="w-full h-full relative">
      <div className="fixed inset-0">
        <Canvas
          camera={{ position: [0, 0, 16], fov: 45 }}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }} // Force low power, no AA
          dpr={1} // Strict 1x resolution to prevent overheating on high-DPI screens
          performance={{ min: 0.1 }}
          shadows={false} // Disable shadows entirely
        >
          <Suspense fallback={<LoadingSpinner />}>
            <CarouselScene
              tools={tools}
              activeTool={activeTool}
              onToolSelect={handleToolSelect}
              onCardReachedCenter={onCardReachedCenter}
              onCardReturnedToRing={onCardReturnedToRing}
              isCardActuallyCentered={isCardCentered}
              isAnyToolProcessActive={isAnyToolProcessActive}
              pendingTool={pendingTool}
            />
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              enableRotate={false}
              minDistance={12}
              maxDistance={22}
              enabled={!isAnyToolProcessActive}
            />
            {/* Optimized Lighting - No Shadows, calculation cheapter */}
            <ambientLight intensity={0.4} color="#0f172a" />

            {/* Key Light */}
            <spotLight
              position={[10, 10, 10]}
              angle={0.5}
              penumbra={1}
              intensity={2}
              color="#3b82f6"
              castShadow={false}
            />

            {/* Rim Light 1 */}
            <spotLight
              position={[-10, 5, -10]}
              angle={0.5}
              penumbra={0.5}
              intensity={3} // Reduced intensity
              color="#00F0FF"
            />

            {/* Rim Light 2 (Electric Purple) - From behind-right */}
            <spotLight
              position={[10, 0, -10]}
              angle={0.5}
              penumbra={0.5}
              intensity={4}
              color="#8b5cf6"
            />

            {/* Fill Light (Soft White) */}
            <pointLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />
          </Suspense>
        </Canvas>
      </div>

      {/* Visual Navigation Controls */}
      {
        !isAnyToolProcessActive && !activeTool && (
          <>
            <button
              className="fixed left-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/10 hover:border-white/30"
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))}
              aria-label="Rotate Left"
            >
              <ChevronLeftIcon className="w-8 h-8" />
            </button>
            <button
              className="fixed right-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/10 hover:border-white/30"
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))}
              aria-label="Rotate Right"
            >
              <ChevronRightIcon className="w-8 h-8" />
            </button>
          </>
        )
      }

      {/* Replaced old LitasDark header with empty container if needed for spacing, else removed */}


      <WorkspacePanel
        activeTool={activeTool}
        isVisible={isCardCentered && !!activeTool}
        onClose={handleCloseWorkspace}
      />

      {
        activeTool && isCardCentered && (
          <MiniCarousel
            tools={tools}
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
          />
        )
      }
    </div >
  );
}