import { useState, useRef, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, Html, Edges } from '@react-three/drei';
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
  const [flipped, setFlipped] = useState(false);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [springs, api] = useSpring(() => ({
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    color: '#1e293b',
    config: { mass: 1, tension: 170, friction: 26 }
  }));

  // Update springs based on state
  useEffect(() => {
    if (isActive) {
      api.start({
        scale: 1.15,
        color: '#2563eb',
        position: [0, 0, 0],
        rotation: [0, flipped ? Math.PI : 0, 0],
        config: { mass: 2, tension: 170, friction: 40 } // Lens extension feel
      });
    } else if (hovered) {
      // Hover state is handled by onPointerMove for dynamic tilt
      // We just set base properties here
      api.start({
        scale: 1.1,
        color: '#3b82f6',
        config: { mass: 1, tension: 350, friction: 35 } // Snappy magnetic feel
      });
    } else {
      // Idle return
      api.start({
        scale: 1,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        color: '#1e293b',
        config: { mass: 1, tension: 170, friction: 26 }
      });
    }
  }, [isActive, hovered, flipped, api]);

  useFrame(() => {
    // ... frame logic if needed
  });

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (isActive) return;
    event.stopPropagation();

    // Calculate normalized mouse position (-1 to 1) relative to card center
    // event.uv gives 0 to 1 mapping on the face
    if (event.uv) {
      const x = (event.uv.x - 0.5) * 2; // -1 to 1
      const y = (event.uv.y - 0.5) * 2; // -1 to 1

      // Magnetic Tilt & Lift
      api.start({
        rotation: [-y * 0.4, x * 0.4, 0], // Tilt towards cursor
        position: [0, 0, 0.2], // Lift towards camera
        config: { mass: 0.5, tension: 400, friction: 30 } // Very snappy tracking
      });
    }
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    if (!isActive) {
      flipTimeoutRef.current = setTimeout(() => {
        if (hovered && !isActive) {
          // We typically don't want to auto-flip in this premium mode, 
          // but keeping consistent with previous logic for now.
          // Maybe increase delay
          setFlipped(true);
        }
      }, 800); // Increased delay to enjoy the glass effect
    }
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(false);
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    if (!isActive) {
      setFlipped(false);
      // Reset tilt on exit
      api.start({
        rotation: [0, 0, 0],
        position: [0, 0, 0],
        config: { mass: 1, tension: 170, friction: 26 }
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
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        scale={springs.scale}
        position={springs.position as any}
        rotation={springs.rotation as any}
      >
        {/* Card Body - Visible Slate-800 Surface */}
        <boxGeometry args={[2.2, 3.2, 0.1]} />
        <meshStandardMaterial
          color="#1e293b" // Slate-800 - Visible against bg
          roughness={0.2}
          metalness={0.8}
          transparent={true}
          opacity={opacity}
        />

        {/* Subtle Border Glow (using slightly larger plane behind or just Edge) */}
        <Edges
          scale={1.0}
          threshold={15}
          color={hovered || isActive ? "#60a5fa" : "#334155"} // Blue glow or Slate border
        >
          <meshBasicMaterial transparent opacity={0.5} />
        </Edges>

        {!flipped && (
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
                <meshBasicMaterial color={hovered ? "#3b82f6" : "#0f172a"} />
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
        )}

        {flipped && (
          <group>
            {/* Backside content similarly lifted */}
            <Text position={[0, 0, 0.2]} fontSize={0.2} color="white">
              Settings
            </Text>
          </group>
        )}
      </animated.mesh>
    </group>
  );
}