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
  opacity?: any;
}

export default function ToolCard({
  position,
  rotation: initialRotation,
  tool,
  isActive,
  onClick,
  opacity
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
      mat.emissiveIntensity = 0.22 + Math.sin(state.clock.elapsedTime * 2.0) * 0.05;
    } else if (hovered) {
      mat.emissiveIntensity = 0.14;
    } else {
      mat.emissiveIntensity = 0.06;
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
        {/* Card Body - Visible Slate-800 Surface */}
        <boxGeometry args={[2.2, 3.2, 0.1]} />
        <animated.meshStandardMaterial
          color={springs.color as any}
          // Add depth without looking like a mirror
          roughness={0.55}
          metalness={0.22}
          emissive={isActive ? '#2563eb' : hovered ? '#3b82f6' : '#0f172a'}
          transparent={true}
          opacity={opacity ?? 1}
          depthWrite={false}
          depthTest={true}
          side={THREE.FrontSide} // Don't render the back face (prevents mirror/back-card artifacts)
        />

        {/* Subtle Border Glow (using slightly larger plane behind or just Edge) */}
        <Edges
          scale={1.0}
          threshold={15}
          color={hovered || isActive ? "#60a5fa" : "#334155"} // Blue glow or Slate border
        >
          <meshBasicMaterial transparent opacity={isActive ? 0.9 : hovered ? 0.7 : 0.35} />
        </Edges>

        <group ref={contentRef}>
          <group>
            {/* Floating Title */}
            <Text
              position={[0, 1.2, 0.15]}
              fontSize={0.2}
              color={hovered || isActive ? '#93c5fd' : '#f8fafc'}
              anchorX="center"
              anchorY="middle"
              maxWidth={1.8}
              font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
            >
              {tool.name}
            </Text>

            {/* Floating Icon - REMOVING WHITE BOX */}
            <Html
              transform
              center
              position={[0, 0.1, 0.3]} // Lower z, central position
              style={{ pointerEvents: 'none' }}
              distanceFactor={6}
            >
              <div
                className={`transition-all duration-300 p-4 rounded-xl flex items-center justify-center ${hovered || isActive
                  ? 'bg-blue-600/20 text-blue-400 scale-110 border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                  }`}
                style={{ width: '90px', height: '90px', backdropFilter: 'blur(4px)' }}
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

            {/* CTA Button */}
            <group position={[0, -1.35, 0.2]}>
              <mesh onClick={(e) => { e.stopPropagation(); onClick(); }}>
                <planeGeometry args={[1.2, 0.3]} />
                <meshBasicMaterial color={hovered ? "#3b82f6" : "#1e293b"} />
              </mesh>
              {/* Button Border */}
              <lineSegments>
                <edgesGeometry args={[new BoxGeometry(1.2, 0.3, 0)]} />
                <lineBasicMaterial color={hovered ? "#60a5fa" : "#334155"} />
              </lineSegments>
              <Text
                position={[0, 0, 0.01]}
                fontSize={0.12}
                color={hovered ? "white" : "#94a3b8"}
                anchorX="center"
                anchorY="middle"
              >
                {isActive ? "Active" : "Try Now →"}
              </Text>
            </group>
          </group>
        </group>
      </animated.mesh>
    </group>
  );
}