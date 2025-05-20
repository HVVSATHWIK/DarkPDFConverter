import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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
}

export default function ToolCard({ position, rotation, tool, isActive, onClick }: ToolCardProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { scale, color } = useSpring({
    scale: hovered || isActive ? 1.1 : 1,
    color: hovered ? '#6200ea' : isActive ? '#3700b3' : '#333333',
    config: { mass: 1, tension: 170, friction: 26 }
  });

  useFrame((state) => {
    if (meshRef.current && (hovered || isActive)) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <animated.mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={scale}
      >
        <boxGeometry args={[2, 3, 0.2]} />
        <animated.meshStandardMaterial 
          color={color}
          metalness={0.5}
          roughness={0.5}
        />
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
      </animated.mesh>
    </group>
  );
}