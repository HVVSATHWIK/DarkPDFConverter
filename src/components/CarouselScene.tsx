import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useSpring, animated, config as springConfig } from '@react-spring/three';
import ToolCard from './ToolCard';
import type { Tool } from '../types';

interface CarouselSceneProps {
  tools: Tool[];
  activeTool: Tool | null;
  onToolSelect: (tool: Tool | null) => void;
  onCardReachedCenter: () => void;
  onCardReturnedToRing: (returnedToolId: number) => void;
  isCardActuallyCentered: boolean;
  isAnyToolProcessActive: boolean;
}

function AnimatedToolCardWrapper({
  tool,
  originalPosition,
  originalRotation,
  isWrapperActive,
  isActuallyCenteredInApp,
  isAnyToolProcessActiveInApp,
  onSelect,
  onCenterComplete,
  onReturnComplete,
}: {
  tool: Tool;
  originalPosition: [number, number, number];
  originalRotation: [number, number, number];
  isWrapperActive: boolean;
  isActuallyCenteredInApp: boolean;
  isAnyToolProcessActiveInApp: boolean;
  onSelect: () => void;
  onCenterComplete: () => void;
  onReturnComplete: (returnedToolId: number) => void;
}) {
  const cardGroupRef = useRef<Group>(null);

  const [styles] = useSpring(() => ({
    to: async (next) => {
      if (isWrapperActive) {
        if (isActuallyCenteredInApp) {
          await next({
            position: [0, 0, 3.5],
            scale: [1.3, 1.3, 1.3],
            rotation: [0, Math.PI, 0],
            opacity: 1,
            config: springConfig.molasses,
            onRest: onCenterComplete,
          });
        } else {
          await next({
            position: originalPosition,
            scale: [1, 1, 1],
            rotation: originalRotation,
            opacity: 1,
            config: springConfig.gentle, // Faster, reliable completion
            onRest: () => onReturnComplete(tool.id),
          });
        }
      } else {
        if (isAnyToolProcessActiveInApp) {
          await next({
            position: originalPosition,
            scale: [0.3, 0.3, 0.3],
            opacity: 0,
            config: springConfig.stiff,
          });
        } else {
          await next({
            position: originalPosition,
            scale: [1, 1, 1],
            rotation: originalRotation,
            opacity: 1,
            config: springConfig.gentle,
            onRest: () => {
              // Ensure we notify the parent that the card has visually returned
              if (onReturnComplete) onReturnComplete(tool.id);
            }
          });
        }
      }
    },
    from: { position: originalPosition, scale: [1, 1, 1], rotation: originalRotation, opacity: 1 },
    reset: isWrapperActive || isActuallyCenteredInApp || isAnyToolProcessActiveInApp,
  }));

  return (
    <animated.group
      ref={cardGroupRef}
      position={styles.position.to((...p) => [p[0], p[1], p[2]] as [number, number, number])}
      scale={styles.scale.to((...s) => [s[0], s[1], s[2]] as [number, number, number])}
      rotation={styles.rotation.to((...r) => [r[0], r[1], r[2]]) as any}
    >
      <ToolCard
        tool={tool}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        isActive={isWrapperActive && isActuallyCenteredInApp}
        onClick={onSelect}
        opacity={styles.opacity}
      />
    </animated.group>
  );
}

export default function CarouselScene({
  tools,
  activeTool,
  onToolSelect,
  onCardReachedCenter,
  onCardReturnedToRing,
  isCardActuallyCentered,
  isAnyToolProcessActive,
}: CarouselSceneProps) {
  const groupRef = useRef<Group>(null);
  const isCarouselRotatingEnabled = useRef(true);
  const lastElapsedTime = useRef(0);

  /* Removed unused spring logic */

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isAnyToolProcessActive) {
        isCarouselRotatingEnabled.current = !isCarouselRotatingEnabled.current;
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isAnyToolProcessActive]);

  useFrame((state) => {
    const { clock } = state;
    if (groupRef.current) {
      if (!isAnyToolProcessActive) {
        if (isCarouselRotatingEnabled.current) {
          const elapsedTimeDelta = clock.elapsedTime - lastElapsedTime.current;
          // FLUID ROTATION: Continuous, non-springy but smooth base rotation
          // We add a sine wave to the speed to make it "breathe" or ebb and flow
          const baseSpeed = 0.2; // Slower, more majestic
          const speedVariation = Math.sin(clock.elapsedTime * 0.5) * 0.1;
          const rotationStep = (baseSpeed + speedVariation) * elapsedTimeDelta;

          groupRef.current.rotation.y += rotationStep;
        }

        // MESMERIZING FLOAT: Vertical sine wave for the whole ring
        const floatAmplitude = 0.1; // Gentle float
        const floatSpeed = 0.8;
        groupRef.current.position.y = Math.sin(clock.elapsedTime * floatSpeed) * floatAmplitude;


        const breathAmplitude = 0.05; // More subtle
        const breathSpeed = 0.5;
        const currentBreathScale = 1 + Math.sin(clock.elapsedTime * breathSpeed) * breathAmplitude;

        // Direct scale assignment
        groupRef.current.scale.setScalar(currentBreathScale);

      } else {
        // When tool is active, stop rotation and float
        groupRef.current.scale.setScalar(1);
        // Ideally we smoothly dampen rotation to stop, but for now strict stop is safer for layout
      }
    }
    lastElapsedTime.current = clock.elapsedTime;
  });

  const radius = 5;
  const angleStep = (2 * Math.PI) / tools.length;

  const cardTransforms = useMemo(() => {
    return tools.map((tool, index) => {
      const angle = index * angleStep;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      return {
        tool,
        originalPosition: [x, 0, z] as [number, number, number],
        originalRotation: [0, -angle + Math.PI / 2, 0] as [number, number, number],
      };
    });
  }, [tools, radius, angleStep]);

  if (!Array.isArray(tools) || tools.length === 0) {
    return null;
  }

  return (
    <animated.group ref={groupRef}>
      {cardTransforms.map(({ tool, originalPosition, originalRotation }) => {
        if (!tool?.id || !tool?.name || !tool?.icon) {
          return null;
        }
        const isCurrentCardTheAppActiveTool = tool.id === activeTool?.id;

        return (
          <AnimatedToolCardWrapper
            key={tool.id}
            tool={tool}
            originalPosition={originalPosition}
            originalRotation={originalRotation}
            isWrapperActive={isCurrentCardTheAppActiveTool}
            isActuallyCenteredInApp={isCardActuallyCentered}
            isAnyToolProcessActiveInApp={isAnyToolProcessActive}
            onSelect={() => onToolSelect(tool)}
            onCenterComplete={() => {
              if (isCurrentCardTheAppActiveTool) onCardReachedCenter();
            }}
            onReturnComplete={(returnedToolId) => {
              if (isCurrentCardTheAppActiveTool) onCardReturnedToRing(returnedToolId);
            }}
          />
        );
      })}
    </animated.group>
  );
}