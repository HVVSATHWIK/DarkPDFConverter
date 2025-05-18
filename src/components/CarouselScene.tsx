import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import ToolCard from './ToolCard';
import type { Tool } from '../types';

interface CarouselSceneProps {
  tools: Tool[];
  activeTool: Tool | null;
  onToolSelect: (tool: Tool) => void;
}

export default function CarouselScene({ tools, activeTool, onToolSelect }: CarouselSceneProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current && !activeTool) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const radius = 5;
  const angleStep = (2 * Math.PI) / tools.length;

  return (
    <group ref={groupRef}>
      {tools.map((tool, index) => {
        const angle = index * angleStep;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);

        return (
          <ToolCard
            key={tool.id}
            position={[x, 0, z]}
            rotation={[0, -angle, 0]}
            tool={tool}
            isActive={tool.id === activeTool?.id}
            onClick={() => onToolSelect(tool)}
          />
        );
      })}
    </group>
  );
}