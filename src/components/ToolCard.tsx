import { useState, useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import { Mesh } from 'three';
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
  const [flipped, setFlipped] = useState(false);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { scale, color, rotationX, rotationY } = useSpring({
    scale: hovered || isActive ? 1.15 : 1,
    color: hovered ? '#3b82f6' : isActive ? '#2563eb' : '#1e293b', // Deep Electric Blue hover, Darker Blue active
    rotationX: hovered && !isActive ? 0.2 : 0,
    rotationY: flipped ? Math.PI : 0,
    config: { mass: 1, tension: 170, friction: 26 }
  });

  useFrame(() => {
    if (meshRef.current) {
      if (flipped) {
        meshRef.current.rotation.z = 0;
      } else {
        meshRef.current.rotation.z = 0;
      }
    }
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    if (!isActive) {
      flipTimeoutRef.current = setTimeout(() => {
        if (hovered && !isActive) {
          setFlipped(true);
        }
      }, 300);
    }
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(false);
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    if (!isActive) {
      setFlipped(false);
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
        scale={scale}
        rotation-x={rotationX}
        rotation-y={rotationY}
      >
        <boxGeometry args={[2, 3, 0.2]} />
        {/* Glassmorphic Material with Glow */}
        <animated.meshPhysicalMaterial
          color={color}
          metalness={0.2}
          roughness={0.2} // Increased roughness for less clear see-through
          transmission={0.2} // Reduced transmission to hide backside cards
          thickness={2.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={color}
          emissiveIntensity={hovered || isActive ? 2.0 : 0.6}
          opacity={opacity}
          transparent={true}
        />

        {!flipped && (
          <>
            <Text
              position={[0, 0.9, 0.11]} // Moved UP
              fontSize={0.28}
              color={hovered || isActive ? '#1e293b' : '#ffffff'}
              anchorX="center"
              anchorY="middle"
              maxWidth={1.8}
            >
              {tool.name}
            </Text>
            {/* Icon Rendered via HTML Overlay for SVG Support */}
            <Html transform center position={[0, -0.2, 0.11]} style={{ pointerEvents: 'none' }}>
              <div
                className={`transition-all duration-300 p-3 rounded-full flex items-center justify-center pointer-events-none ${hovered || isActive
                  ? 'bg-slate-900/10 text-slate-900 scale-110'
                  : 'bg-white/10 text-white'
                  }`}
              >
                {tool.icon}
              </div>
            </Html>
            {tool.description && (
              <Text
                position={[0, -1.2, 0.11]} // Moved DOWN
                fontSize={0.15}
                color={hovered || isActive ? '#334155' : '#cbd5e1'}
                anchorX="center"
                anchorY="middle"
                maxWidth={1.6}
                textAlign="center"
              >
                {tool.description}
              </Text>
            )}
            {!isActive && !flipped && (
              <Text
                position={[0.8, -1.3, 0.115]}
                fontSize={0.25}
                color={hovered ? '#1e293b' : '#FFFFFF'}
                anchorX="center"
                anchorY="middle"
              >
                {'>'}
              </Text>
            )}
          </>
        )}
        {flipped && (
          <>
            <Text
              position={[0, 0.8, -0.11]}
              fontSize={0.25}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              rotation-y={Math.PI}
            >
              File Upload
            </Text>
            <Text
              position={[0, 0, -0.11]}
              fontSize={0.25}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              rotation-y={Math.PI}
            >
              Setting: Default
            </Text>
            <mesh
              position={[0, -0.9, -0.105]}
              onClick={(event) => {
                event.stopPropagation();
                onClick();
              }}
              onPointerOver={(event) => { event.stopPropagation(); }}
              onPointerOut={(event) => { event.stopPropagation(); }}
            >
              <planeGeometry args={[0.8, 0.4]} />
              <meshStandardMaterial color="#00dd00" metalness={0.6} roughness={0.4} />
              <Text
                position={[0, 0, 0.01]}
                fontSize={0.25}
                color="#000000"
                anchorX="center"
                anchorY="middle"
                rotation-y={Math.PI}
              >
                Go
              </Text>
            </mesh>
          </>
        )}
      </animated.mesh>
    </group>
  );
}