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
  DocumentDuplicateIcon
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

  const handleCloseWorkspace = () => {
    handleToolSelect(null);
    // Failsafe: Ensure active tool is cleared even if animation callback hangs
    setTimeout(() => {
      if (activeToolRef.current) {
        setActiveToolState(null);
      }
    }, 1000);
  };

  // Fix: Use state directly instead of refs to ensure re-render updates this value immediately
  const isAnyToolProcessActive = !!(activeTool || pendingTool);

  return (
    <div className="w-full h-full relative">
      <div className="fixed inset-0">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
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
            />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enabled={!isAnyToolProcessActive}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
            />
            {/* Super Bright Energetic Lighting Setup to make cards glow */}
            <ambientLight intensity={1.5} color="#06b6d4" />
            <spotLight position={[10, 10, 10]} angle={0.4} penumbra={1} intensity={5} color="#3b82f6" castShadow />
            <pointLight position={[-10, 0, -5]} intensity={3} color="#8b5cf6" />
            <pointLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
          </Suspense>
        </Canvas>
      </div>

      {/* Replaced old LitasDark header with empty container if needed for spacing, else removed */}


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
    </div>
  );
}