import { useState, useRef, useEffect, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, Html, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { Mesh, BoxGeometry } from 'three';
import { animated, useSpring } from '@react-spring/three';
import { Tool } from '../types';

interface ToolTheme {
  primaryHex: string;
  accentHex: string;
  edgeHex: string;
  textGlowHex: string;
  bodyColor: string;
  bodyActiveColor: string;
  iconGradient: string;
  iconBorder: string;
  iconShadow: string;
  iconText: string;
  spotlightHex: string;
  badgeLabel: string;
}

const TOOL_THEMES: Record<number, ToolTheme> = {
  1: {
    // Dark Mode - Celestial Indigo & Violet
    primaryHex: '#818cf8',
    accentHex: '#a855f7',
    edgeHex: '#c084fc',
    textGlowHex: '#e0e7ff',
    bodyColor: '#131124',
    bodyActiveColor: '#1e1b38',
    iconGradient: 'from-indigo-950/90 via-slate-900/90 to-purple-950/90',
    iconBorder: 'border-indigo-500/60',
    iconShadow: '0 0 35px rgba(129, 140, 248, 0.55)',
    iconText: 'text-indigo-300',
    spotlightHex: '#818cf8',
    badgeLabel: 'THEME CORE',
  },
  2: {
    // Merge PDFs - Radiant Cyan & Sky Blue
    primaryHex: '#06b6d4',
    accentHex: '#38bdf8',
    edgeHex: '#67e8f9',
    textGlowHex: '#cffafe',
    bodyColor: '#0c1a29',
    bodyActiveColor: '#11293d',
    iconGradient: 'from-cyan-950/90 via-slate-900/90 to-sky-950/90',
    iconBorder: 'border-cyan-500/60',
    iconShadow: '0 0 35px rgba(6, 182, 212, 0.55)',
    iconText: 'text-cyan-300',
    spotlightHex: '#06b6d4',
    badgeLabel: 'SYNTHESIS',
  },
  3: {
    // Split PDF - Cyber Emerald & Mint
    primaryHex: '#10b981',
    accentHex: '#34d399',
    edgeHex: '#6ee7b7',
    textGlowHex: '#d1fae5',
    bodyColor: '#0a1d18',
    bodyActiveColor: '#102d25',
    iconGradient: 'from-emerald-950/90 via-slate-900/90 to-teal-950/90',
    iconBorder: 'border-emerald-500/60',
    iconShadow: '0 0 35px rgba(16, 185, 129, 0.55)',
    iconText: 'text-emerald-300',
    spotlightHex: '#10b981',
    badgeLabel: 'FRAGMENT',
  },
  4: {
    // Rotate PDF - Solar Amber & Golden Tangerine
    primaryHex: '#f59e0b',
    accentHex: '#fbbf24',
    edgeHex: '#fde68a',
    textGlowHex: '#fef3c7',
    bodyColor: '#21180b',
    bodyActiveColor: '#33240e',
    iconGradient: 'from-amber-950/90 via-slate-900/90 to-orange-950/90',
    iconBorder: 'border-amber-500/60',
    iconShadow: '0 0 35px rgba(245, 158, 11, 0.55)',
    iconText: 'text-amber-300',
    spotlightHex: '#f59e0b',
    badgeLabel: 'ORIENTATION',
  },
  5: {
    // Optimize PDF - Neon Rose & Electric Pink
    primaryHex: '#f43f5e',
    accentHex: '#fb7185',
    edgeHex: '#fda4af',
    textGlowHex: '#ffe4e6',
    bodyColor: '#240d16',
    bodyActiveColor: '#36111f',
    iconGradient: 'from-rose-950/90 via-slate-900/90 to-pink-950/90',
    iconBorder: 'border-rose-500/60',
    iconShadow: '0 0 35px rgba(244, 63, 94, 0.55)',
    iconText: 'text-rose-300',
    spotlightHex: '#f43f5e',
    badgeLabel: 'COMPACTION',
  },
  6: {
    // Extract Pages - Electric Cobalt & Sapphire
    primaryHex: '#3b82f6',
    accentHex: '#60a5fa',
    edgeHex: '#93c5fd',
    textGlowHex: '#dbeafe',
    bodyColor: '#0e182e',
    bodyActiveColor: '#152547',
    iconGradient: 'from-blue-950/90 via-slate-900/90 to-indigo-950/90',
    iconBorder: 'border-blue-500/60',
    iconShadow: '0 0 35px rgba(59, 130, 246, 0.55)',
    iconText: 'text-blue-300',
    spotlightHex: '#3b82f6',
    badgeLabel: 'SELECTIVE',
  },
};

const DEFAULT_THEME: ToolTheme = {
  primaryHex: '#06b6d4',
  accentHex: '#38bdf8',
  edgeHex: '#67e8f9',
  textGlowHex: '#cffafe',
  bodyColor: '#0f172a',
  bodyActiveColor: '#1e293b',
  iconGradient: 'from-cyan-950/90 to-slate-900/90',
  iconBorder: 'border-cyan-500/50',
  iconShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
  iconText: 'text-cyan-400',
  spotlightHex: '#06b6d4',
  badgeLabel: 'TOOL',
};

interface ToolCardProps {
  position: [number, number, number];
  rotation: [number, number, number];
  tool: Tool;
  isActive: boolean;
  onClick: () => void;
  opacity?: any;
}

export default function ToolCard({
  position,
  rotation: initialRotation,
  tool,
  isActive,
  onClick,
  opacity,
}: ToolCardProps) {
  const meshRef = useRef<Mesh>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const theme = useMemo(() => TOOL_THEMES[tool.id] || DEFAULT_THEME, [tool.id]);

  const [springs, api] = useSpring(() => ({
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    color: theme.bodyColor,
    config: { mass: 1.1, tension: 240, friction: 30 },
  }));

  // Sync state transitions
  useEffect(() => {
    if (isActive) {
      api.start({
        scale: 1.08,
        color: theme.bodyActiveColor,
        position: [0, 0, 0.15],
        rotation: [0, 0, 0],
        config: { mass: 1.3, tension: 260, friction: 32 },
      });
    } else if (isInteracting) {
      api.start({
        scale: 1.05,
        color: theme.bodyActiveColor,
        position: [0, 0, 0.1],
        config: { mass: 1.0, tension: 280, friction: 28 },
      });
    } else {
      api.start({
        scale: 1,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        color: theme.bodyColor,
        config: { mass: 1.2, tension: 220, friction: 32 },
      });
    }
  }, [isActive, isInteracting, api, theme]);

  const contentRef = useRef<THREE.Group>(null);
  const isGlowing = isActive || isInteracting;

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (isActive) {
      // Dynamic pulsing glow when active
      mat.emissiveIntensity = 0.42 + Math.sin(state.clock.elapsedTime * 2.8) * 0.1;
    } else if (isInteracting) {
      // Steady bright glow when touched/hovered
      mat.emissiveIntensity = 0.32 + Math.sin(state.clock.elapsedTime * 4.0) * 0.05;
    } else {
      // Gentle ambient base glow
      mat.emissiveIntensity = 0.06;
    }
  });

  // Dynamic 3D pointer tilt calculation
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!meshRef.current || isActive) return;

    const localPoint = meshRef.current.worldToLocal(event.point.clone());
    const normX = Math.max(-1, Math.min(1, localPoint.x / 1.1));
    const normY = Math.max(-1, Math.min(1, localPoint.y / 1.6));

    const tiltX = -normY * 0.25;
    const tiltY = normX * 0.25;

    api.start({
      rotation: [tiltX, tiltY, 0],
      position: [0, 0, 0.12],
      scale: 1.05,
      config: { mass: 0.8, tension: 300, friction: 26 },
    });
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsInteracting(true);
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsInteracting(false);
    if (!isActive) {
      api.start({
        rotation: [0, 0, 0],
        position: [0, 0, 0],
        scale: 1,
        config: { mass: 1.2, tension: 220, friction: 32 },
      });
    }
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsInteracting(true);
    api.start({
      scale: 0.98,
      config: { mass: 0.5, tension: 400, friction: 20 },
    });
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    api.start({
      scale: 1.05,
      config: { mass: 0.8, tension: 300, friction: 24 },
    });
  };

  const handleWheel = (event: ThreeEvent<WheelEvent>) => {
    event.stopPropagation();
  };

  return (
    <group position={position} rotation={initialRotation} onWheel={handleWheel}>
      {/* 3D Atmospheric Halo Glow Plane (illuminates background behind the card) */}
      <mesh position={[0, 0, -0.07]}>
        <planeGeometry args={[2.7, 3.7]} />
        <meshBasicMaterial
          color={theme.primaryHex}
          transparent
          opacity={isGlowing ? 0.28 : 0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Main Interactive 3D Card Mesh */}
      <animated.mesh
        ref={meshRef}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        scale={springs.scale}
        position={springs.position as any}
        rotation={springs.rotation as any}
      >
        {/* Soft Drop Shadow Plane */}
        <mesh position={[0.04, -0.04, -0.05]}>
          <planeGeometry args={[2.25, 3.25]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.5} />
        </mesh>

        {/* Card Body with Themed Emissive Lighting */}
        <boxGeometry args={[2.2, 3.2, 0.1]} />
        <animated.meshStandardMaterial
          color={springs.color as any}
          roughness={0.25}
          metalness={0.4}
          emissive={theme.spotlightHex}
          transparent={true}
          opacity={opacity || 0.96}
          depthWrite={true}
          side={THREE.FrontSide}
        />

        {/* Dynamic Glowing Border Edges */}
        <Edges scale={1.0} threshold={15} color={isGlowing ? theme.edgeHex : '#334155'}>
          <meshBasicMaterial transparent opacity={isActive ? 1.0 : isInteracting ? 0.95 : 0.4} />
        </Edges>

        <group ref={contentRef}>
          {/* Floating Category Badge */}
          <group position={[0, 1.35, 0.16]}>
            <Text
              fontSize={0.075}
              color={isGlowing ? theme.edgeHex : '#64748b'}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.15}
            >
              {theme.badgeLabel}
            </Text>
          </group>

          {/* Floating Title with Neon Illumination */}
          <Text
            position={[0, 1.08, 0.16]}
            fontSize={0.19}
            color={isGlowing ? theme.textGlowHex : '#f8fafc'}
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
            {tool.name}
          </Text>

          {/* 3D Glass Icon Showcase with Glowing Aura */}
          <Html
            transform
            center
            position={[0, 0.1, 0.32]}
            style={{ pointerEvents: 'none' }}
            distanceFactor={6}
          >
            <div
              className={`transition-all duration-300 p-4 rounded-2xl flex items-center justify-center ${
                isGlowing
                  ? `bg-gradient-to-br ${theme.iconGradient} ${theme.iconText} scale-110 border ${theme.iconBorder}`
                  : 'bg-slate-900/70 text-slate-400 border border-slate-700/50'
              }`}
              style={{
                width: '92px',
                height: '92px',
                backdropFilter: 'blur(10px)',
                boxShadow: isGlowing ? theme.iconShadow : '0 4px 15px rgba(0,0,0,0.3)',
              }}
            >
              {tool.icon}
            </div>
          </Html>

          {/* Tool Description */}
          {tool.description && (
            <Text
              position={[0, -0.85, 0.16]}
              fontSize={0.105}
              color={isGlowing ? '#e2e8f0' : '#94a3b8'}
              anchorX="center"
              anchorY="middle"
              maxWidth={1.85}
              textAlign="center"
              lineHeight={1.4}
            >
              {tool.description}
            </Text>
          )}

          {/* Glowing Action Button */}
          <group position={[0, -1.32, 0.2]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <planeGeometry args={[1.35, 0.32]} />
              <meshBasicMaterial
                color={isGlowing ? theme.bodyColor : '#090d16'}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Button Border */}
            <lineSegments>
              <edgesGeometry args={[new BoxGeometry(1.35, 0.32, 0)]} />
              <lineBasicMaterial color={isGlowing ? theme.edgeHex : '#334155'} />
            </lineSegments>

            <Text
              position={[0, 0, 0.01]}
              fontSize={0.095}
              color={isGlowing ? theme.textGlowHex : '#64748b'}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.08}
            >
              {isActive ? 'OPENING...' : 'SELECT TOOL'}
            </Text>
          </group>
        </group>
      </animated.mesh>
    </group>
  );
}
