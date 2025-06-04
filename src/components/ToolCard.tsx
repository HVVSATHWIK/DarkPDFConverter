import { useState, useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh } from 'three';
import { animated, useSpring } from '@react-spring/three';

interface ToolCardProps {
  position: [number, number, number];
  rotation: [number, number, number];
  tool: {
    name: string;
    icon: string;
    description?: string;
  };
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
    scale: hovered || isActive ? 1.1 : 1,
    color: hovered ? '#6200ea' : isActive ? '#3700b3' : '#333333',
    rotationX: hovered && !isActive ? 0.2 : 0,
    rotationY: flipped ? Math.PI : 0,
    config: { mass: 1, tension: 170, friction: 26 }
  });

  useFrame((state) => {
    if (meshRef.current) {
      if (!flipped && (hovered || isActive)) {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
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
        <animated.meshStandardMaterial
          color={color}
          metalness={0.5}
          roughness={0.5}
          opacity={opacity}
          transparent={true}
        />
        
        {!flipped && (
          <>
            <Text
              position={[0, 0.5, 0.11]}
              fontSize={0.3}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {tool.name}
            </Text>
            <Text
              position={[0, -0.5, 0.11]}
              fontSize={0.5}
              anchorX="center"
              anchorY="middle"
            >
              {tool.icon}
            </Text>
            {tool.description && (
              <Text
                position={[0, -1, 0.11]}
                fontSize={0.2}
                color="#cccccc"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.8}
              >
                {tool.description}
              </Text>
            )}
            {!isActive && !flipped && (
              <Text
                position={[0.8, -1.3, 0.115]}
                fontSize={0.25}
                color="#FFFFFF"
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