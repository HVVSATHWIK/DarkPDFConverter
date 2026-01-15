import { useState, useRef, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, Html, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { Mesh, BoxGeometry } from 'three';
import { animated, useSpring } from '@react-spring/three';
import { Tool } from '../types';

interface ToolCardProps {
  position: [number, number, number];
  rotation: [number, number, number];
  tool: Tool;
  isActive: boolean;
  onClick: () => void;

}

export default function ToolCard({
  position,
  rotation: initialRotation,
  tool,
  isActive,
  onClick

}: ToolCardProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const [springs, api] = useSpring(() => ({
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    // Base: slate-800 (less "black", still dark-theme friendly)
    color: '#1e293b',
    config: { mass: 1.2, tension: 220, friction: 34 }
  }));

  // Update springs based on state
  useEffect(() => {
    if (isActive) {
      api.start({
        scale: 1.06,
        // Keep base dark; glow handles active emphasis.
        color: '#1e293b',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        config: { mass: 1.4, tension: 240, friction: 36 }
      });
    } else if (hovered) {
      api.start({
        scale: 1.03,
        color: '#334155',
        rotation: [0, 0, 0],
        position: [0, 0, 0.05],
        config: { mass: 1.1, tension: 260, friction: 36 }
      });
    } else {
      // Idle return
      api.start({
        scale: 1,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        color: '#1e293b',
        config: { mass: 1.2, tension: 220, friction: 34 }
      });
    }
  }, [isActive, hovered, api]);

  // Ref for the content group to flip
  const contentRef = useRef<THREE.Group>(null);
  const worldPos = new THREE.Vector3();

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.getWorldPosition(worldPos);

    // Low-cost "alive" effect: subtle emissive pulse on active card only.
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (isActive) {
      mat.emissiveIntensity = 0.16 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03; // Reduced active pulse
    } else if (hovered) {
      mat.emissiveIntensity = 0.10; // Reduced hover glow
    } else {
      mat.emissiveIntensity = 0.04;
    }
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(false);
    if (!isActive) {
      // Reset tilt on exit
      api.start({
        rotation: [0, 0, 0],
        position: [0, 0, 0],
        config: { mass: 1.2, tension: 220, friction: 34 }
      });
    }
  };

  const handleWheel = (event: ThreeEvent<WheelEvent>) => {
    event.stopPropagation();
  };

  return (
    <group position={position} rotation={initialRotation} onWheel={handleWheel}>
      <animated.mesh
        ref={meshRef}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={springs.scale}
        position={springs.position as any}
        rotation={springs.rotation as any}
      >
        {/* Drop Shadow Mesh - Anchors the card */}
        <mesh position={[0.05, -0.05, -0.06]}>
          <planeGeometry args={[2.25, 3.25]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.4} />
        </mesh>

        {/* Card Body - Visible Slate-800 Surface */}
        <boxGeometry args={[2.2, 3.2, 0.1]} />
        <animated.meshStandardMaterial
          color={springs.color as any}
          roughness={0.4}
          metalness={0.3}
          emissive={isActive ? '#0891b2' : hovered ? '#06b6d4' : '#0f172a'} // Cyan 600 active, Cyan 500 hover
          transparent={true}
          opacity={0.95}
          depthWrite={true}
          side={THREE.FrontSide}
        />

        {/* Enhanced Border Glow - Using Brand Cyan */}
        <Edges
          scale={1.0}
          threshold={15}
          color={hovered || isActive ? "#22d3ee" : "#475569"} // Cyan 400 for pop
        >
          <meshBasicMaterial transparent opacity={isActive ? 1.0 : hovered ? 0.9 : 0.5} />
        </Edges>

        <group ref={contentRef}>
          <group>
            {/* Floating Title */}
            <Text
              position={[0, 1.2, 0.15]}
              fontSize={0.2}
              color={hovered || isActive ? '#67e8f9' : '#f8fafc'} // Cyan 200 hover
              anchorX="center"
              anchorY="middle"
              maxWidth={1.8}
              font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
            >
              {tool.name}
            </Text>

            {/* Floating Icon - Brand Signature Treatment */}
            <Html
              transform
              center
              position={[0, 0.1, 0.3]}
              style={{ pointerEvents: 'none' }}
              distanceFactor={6}
            >
              <div
                className={`transition-all duration-300 p-4 rounded-xl flex items-center justify-center ${hovered || isActive
                  ? 'bg-gradient-to-br from-cyan-950/80 to-blue-900/80 text-cyan-400 scale-110 border border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)]' // Signature Litas Glass Glow
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                  }`}
                style={{ width: '90px', height: '90px', backdropFilter: 'blur(8px)' }}
              >
                {tool.icon}
              </div>
            </Html>

            {/* Description */}
            {tool.description && (
              <Text
                position={[0, -0.9, 0.15]}
                fontSize={0.11}
                color="#cbd5e1"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.8}
                textAlign="center"
                lineHeight={1.4}
              >
                {tool.description}
              </Text>
            )}

            {/* CTA Button - Demoted to "Inspect" (Ghost/Outline style) */}
            <group position={[0, -1.35, 0.2]}>
              <mesh onClick={(e) => { e.stopPropagation(); onClick(); }}>
                <planeGeometry args={[1.2, 0.3]} />
                <meshBasicMaterial color={hovered ? "#1e293b" : "#0f172a"} transparent opacity={0.6} />
              </mesh>
              {/* Button Border - Fine line only */}
              <lineSegments>
                <edgesGeometry args={[new BoxGeometry(1.2, 0.3, 0)]} />
                <lineBasicMaterial color={hovered ? "#94a3b8" : "#334155"} />
              </lineSegments>
              <Text
                position={[0, 0, 0.01]}
                fontSize={0.10} // Smaller font
                color={hovered ? "#f8fafc" : "#64748b"} // Muted text color
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.05}
              >
                {isActive ? "ACTIVE" : "INSPECT"}
              </Text>
            </group>
          </group>
        </group>
      </animated.mesh>
    </group>
  );
}