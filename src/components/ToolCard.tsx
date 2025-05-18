import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh } from 'three';

interface ToolCardProps {
  position: [number, number, number];
  rotation: [number, number, number];
  tool: {
    name: string;
    icon: string;
  };
  isActive: boolean;
  onClick: () => void;
}

export default function ToolCard({ position, rotation, tool, isActive, onClick }: ToolCardProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial 
          color={hovered ? '#6200ea' : '#333333'}
          metalness={0.5}
          roughness={0.5}
        />
        <Text
          position={[0, 0.5, 0.11]}
          fontSize={0.3}
          color="#ffffff"
        >
          {tool.name}
        </Text>
        <Text
          position={[0, -0.5, 0.11]}
          fontSize={0.5}
        >
          {tool.icon}
        </Text>
      </mesh>
    </group>
  );
}