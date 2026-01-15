import { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CarouselScene from '../CarouselScene';
import LoadingSpinner from '../LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import type { Tool } from '../../types';
import { TOOL_DEFINITIONS, type ToolDefinition } from '@/config/tools';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export function MainApplication() {
  const navigate = useNavigate();

  const [activeTool, setActiveToolState] = useState<Tool | null>(null);
  const [isCardCentered, setIsCardCentered] = useState<boolean>(false);

  const activeToolRef = useRef(activeTool);
  const isCardCenteredRef = useRef(isCardCentered);

  useEffect(() => {
    activeToolRef.current = activeTool;
    isCardCenteredRef.current = isCardCentered;
  }, [activeTool, isCardCentered]);

  const handleToolSelect = useCallback((tool: Tool | null) => {
    if (!tool) return;
    setActiveToolState(tool);
    setIsCardCentered(true);
  }, []);

  const onCardReachedCenter = useCallback(() => {
    const current = activeToolRef.current as ToolDefinition | null;
    if (!current) return;
    const match = TOOL_DEFINITIONS.find((t) => t.id === current.id);
    if (match) navigate(match.path);
  }, [navigate]);

  const onCardReturnedToRing = useCallback((_returnedToolId: number) => {
    // No-op: explore view doesn't open an in-place workspace anymore.
  }, []);

  const handleCloseWorkspace = useCallback(() => {
    setActiveToolState(null);
    setIsCardCentered(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseWorkspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCloseWorkspace]);

  const isAnyToolProcessActive = !!activeTool;

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
              tools={TOOL_DEFINITIONS}
              activeTool={activeTool}
              onToolSelect={handleToolSelect}
              onCardReachedCenter={onCardReachedCenter}
              onCardReturnedToRing={onCardReturnedToRing}
              isCardActuallyCentered={isCardCentered}
              isAnyToolProcessActive={isAnyToolProcessActive}
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

        {/* 2D "4D" aurora overlay (CSS-only, low-cost) */}
        <div className="bg-aurora" aria-hidden="true" />
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

      {/* Experimental Visualization Caption */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-40 mix-blend-screen">
        <p className="text-[10px] tracking-[0.25em] font-mono text-cyan-200/80 uppercase">
          Engine Visualization / Experimental
        </p>
      </div>

      {/* Replaced old LitasDark header with empty container if needed for spacing, else removed */}

      {/* Explore view does not open the tool workspace in-place anymore. */}
    </div >
  );
}