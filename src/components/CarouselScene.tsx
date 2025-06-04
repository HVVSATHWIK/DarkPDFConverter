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
            config: springConfig.gentle,
            onRest: onCenterComplete,
          });
        } else {
          await next({
            position: originalPosition,
            scale: [1, 1, 1],
            rotation: originalRotation,
            opacity: 1,
            config: springConfig.gentle,
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
          });
        }
      }
    },
    from: { position: originalPosition, scale: [1,1,1], rotation: originalRotation, opacity: 1 },
    reset: isWrapperActive || isActuallyCenteredInApp || isAnyToolProcessActiveInApp,
  }));

  return (
    <animated.group
      ref={cardGroupRef}
      position={styles.position}
      scale={styles.scale}
      rotation={styles.rotation as any}
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
  const carouselRotationSpeed = useRef(0.05);
  const lastElapsedTime = useRef(0);

  const [groupSpring, groupApi] = useSpring(() => ({
    rotationY: 0,
    scale: 1,
    config: springConfig.gentle
  }));

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
          const newRotationY = groupSpring.rotationY.get() + carouselRotationSpeed.current * elapsedTimeDelta * 60;
          groupApi.start({ rotationY: newRotationY, immediate: true });
        }
        
        const breathAmplitude = 0.02;
        const breathSpeed = 0.7;
        const currentBreathScale = 1 + Math.sin(clock.elapsedTime * breathSpeed) * breathAmplitude;
        groupApi.start({ scale: currentBreathScale });
      } else {
        groupApi.start({ scale: 1 });
      }
      groupRef.current.rotation.y = groupSpring.rotationY.get();
      groupRef.current.scale.set(groupSpring.scale.get(), groupSpring.scale.get(), groupSpring.scale.get());
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
    <animated.group ref={groupRef} rotation-y={groupSpring.rotationY} scale={groupSpring.scale}>
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