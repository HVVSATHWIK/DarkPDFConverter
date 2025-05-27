import { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CarouselScene from '../CarouselScene'; // Adjusted path
import LoadingSpinner from '../LoadingSpinner'; // Adjusted path
import WorkspacePanel from '../WorkspacePanel';   // Adjusted path
import MiniCarousel from '../MiniCarousel';     // Adjusted path
import type { Tool } from '../../types'; // Adjusted path

const tools: Tool[] = [
  { id: 1, name: 'Dark Mode', icon: '🌙', description: 'Convert PDFs to dark mode' },
  { id: 2, name: 'Merge PDFs', icon: '🔄', description: 'Combine multiple PDFs' },
  { id: 3, name: 'Split PDF', icon: '✂️', description: 'Split PDF into multiple files' },
  { id: 4, name: 'Rotate PDF', icon: '🔄', description: 'Rotate PDF pages' },
  { id: 5, name: 'Compress PDF', icon: '📦', description: 'Reduce PDF file size' },
  { id: 6, name: 'Extract Pages', icon: '📄', description: 'Extract specific pages' },
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
      if(!isCardCenteredRef.current) setIsCardCentered(true);
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
  };

  const isAnyToolProcessActive = !!(activeToolRef.current || pendingToolRef.current);

  return (
    // This div might be redundant if App.tsx (the router host) already provides min-h-screen bg-dark
    // For now, keep it to ensure visual consistency with original design.
    // The parent div in App.tsx already has min-h-screen bg-dark.
    // We might not need it here, or ensure it doesn't conflict (e.g. by using 'h-full w-full' if parent has fixed size).
    // For now, let's keep it simple and assume the App.tsx wrapper handles global background and sizing.
    // Adding 'relative' for z-indexing context if needed for children.
    <div className="w-full h-full relative"> 
      <div className="fixed inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <Suspense fallback={null}>
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
            />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
          </Suspense>
        </Canvas>
      </div>

      {/* Header might be better in a shared layout component later, or part of App.tsx shell */}
      <div className="relative z-10 container mx-auto px-4 py-8 pointer-events-none">
        <header className="text-center mb-8">
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
