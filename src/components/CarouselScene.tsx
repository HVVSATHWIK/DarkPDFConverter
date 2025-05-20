import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useSpring, animated } from '@react-spring/three';
import ToolCard from './ToolCard';
import type { Tool } from '../types';

interface CarouselSceneProps {
  tools: Tool[];
  activeTool: Tool | null;
  onToolSelect: (tool: Tool) => void;
}

export default function CarouselScene({ tools, activeTool, onToolSelect }: CarouselSceneProps) {
  const groupRef = useRef<Group>(null);
  const isRotating = useRef(true);
  const rotationSpeed = useRef(0.2);

  const [spring, api] = useSpring(() => ({
    rotation: 0,
    config: { mass: 5, tension: 40, friction: 28 }
  }));

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isRotating.current = !isRotating.current;
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  useFrame((state) => {
    if (groupRef.current && !activeTool && isRotating.current) {
      api.start({
        rotation: state.clock.elapsedTime * rotationSpeed.current,
      });
      groupRef.current.rotation.y = spring.rotation.get();
    }
  });

  if (!Array.isArray(tools) || tools.length === 0) {
    return null;
  }

  const radius = 5;
  const angleStep = (2 * Math.PI) / tools.length;

  return (
    <animated.group ref={groupRef}>
      {tools.map((tool, index) => {
        if (!tool?.id || !tool?.name || !tool?.icon) {
          return null;
        }

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
    </animated.group>
  );
}