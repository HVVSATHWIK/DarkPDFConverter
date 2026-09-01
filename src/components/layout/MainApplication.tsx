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
    if (match) {
      navigate(match.path, { state: { from: '/explore' } });
    }
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

  // Touch gesture swipe handling for mobile & tablet navigation
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - (touchStartY.current || 0);

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 0.8) {
      if (diffX < 0) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      } else {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const isAnyToolProcessActive = !!activeTool;

  return (
    <div
      className="w-full h-full relative select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="fixed inset-0">
        <Canvas
          camera={{ position: [0, 0, 16], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
          performance={{ min: 0.2 }}
          shadows={false}
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
            {/* Ambient Base Light */}
            <ambientLight intensity={0.5} color="#0f172a" />

            {/* Key Lighting */}
            <spotLight
              position={[10, 12, 12]}
              angle={0.6}
              penumbra={0.8}
              intensity={2.5}
              color="#38bdf8"
              castShadow={false}
            />

            {/* Cyan Rim Accent */}
            <spotLight
              position={[-12, 6, -10]}
              angle={0.5}
              penumbra={0.5}
              intensity={3.2}
              color="#06b6d4"
            />

            {/* Electric Violet Rim Accent */}
            <spotLight
              position={[12, -2, -10]}
              angle={0.5}
              penumbra={0.5}
              intensity={3.8}
              color="#818cf8"
            />

            {/* Soft Fill Light */}
            <pointLight position={[0, 0, 6]} intensity={0.6} color="#ffffff" />
          </Suspense>
        </Canvas>

        {/* 2D aurora overlay */}
        <div className="bg-aurora" aria-hidden="true" />
      </div>

      {/* Visual Carousel Navigation Arrows */}
      {!isAnyToolProcessActive && !activeTool && (
        <>
          <button
            className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 rounded-full bg-slate-900/60 hover:bg-slate-800/80 text-cyan-300 hover:text-white transition-all backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-95"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))}
            aria-label="Rotate Left"
          >
            <ChevronLeftIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <button
            className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 rounded-full bg-slate-900/60 hover:bg-slate-800/80 text-cyan-300 hover:text-white transition-all backdrop-blur-md border border-cyan-500/20 hover:border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-95"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))}
            aria-label="Rotate Right"
          >
            <ChevronRightIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        </>
      )}

      {/* Quick Access Tool Pills at Bottom */}
      {!isAnyToolProcessActive && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 max-w-[95vw]">
          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 shadow-2xl overflow-x-auto max-w-full">
            {TOOL_DEFINITIONS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
              >
                <span className="w-4 h-4 text-cyan-400 flex items-center justify-center">
                  {tool.icon}
                </span>
                <span>{tool.name}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] tracking-[0.2em] font-mono text-cyan-300/70 uppercase">
            Touch or click card to open • Swipe or arrow keys to rotate
          </p>
        </div>
      )}
    </div>
  );
}