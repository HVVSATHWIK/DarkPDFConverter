import { useRef, useEffect, useMemo } from 'react';
import { Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useSpring, animated } from '@react-spring/three';
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
  pendingTool?: Tool | null;
}

// Helper to get parent rotation safely
function getParentRotationY(group: Group | null): number {
  return group?.parent?.rotation.y || 0;
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

  // We animate a "phase" value instead of direct transform properties for the active state
  // 0 = In Ring (Local Slot)
  // 1 = In Center (World Locked)
  const [{ phase }, api] = useSpring(() => ({
    phase: 0,
    config: { mass: 3.5, tension: 140, friction: 65 },
  }));

  // Track opacity separately as it's simple
  const [{ opacity }, opacityApi] = useSpring(() => ({ opacity: 1 }));

  useEffect(() => {
    if (isWrapperActive) {
      if (isActuallyCenteredInApp) {
        // Go to Center (Phase 1)
        api.start({ phase: 1, onRest: onCenterComplete });
        opacityApi.start({ opacity: 1 });
      } else {
        // Return to ring (Active tool but not centered, e.g. switching)
        // Fix: Animate 'phase' to 0 (Slot) instead of using legacy position props
        api.start({
          phase: 0,
          config: { mass: 3.5, tension: 140, friction: 65 },
          onRest: () => onReturnComplete(tool.id),
        });
        opacityApi.start({ opacity: 1 });
      }
    } else {
      // Inactive
      if (isAnyToolProcessActiveInApp) {
        // Hide
        api.start({ phase: 0 });
        opacityApi.start({ opacity: 0 });
      } else {
        // Return to Ring (Phase 0)
        api.start({
          phase: 0,
          onRest: () => onReturnComplete(tool.id)
        });
        opacityApi.start({ opacity: 1 });
      }
    }
  }, [isWrapperActive, isActuallyCenteredInApp, isAnyToolProcessActiveInApp, api, opacityApi, onCenterComplete, onReturnComplete, tool.id]);

  useFrame(() => {
    if (!cardGroupRef.current) return;

    const currentPhase = phase.get();
    const parentRotationY = getParentRotationY(cardGroupRef.current);
    const PI = Math.PI;

    // 1. Calculate "Slot" State (Local)
    // Position: originalPosition
    // Rotation: originalRotation
    // Scale: [1,1,1]

    // 2. Calculate "Center" State (World Locked -> Converted to Local)
    // Target World Pos: (0, 0, 3.5)
    // Target World Rot: (0, 0, 0) relative to camera (So just Y=0 world)
    // Local Pos = WorldPos rotated by -ParentRot
    // Local Rot = -ParentRot

    // Vector Math for Position
    const x_world = 0;
    const z_world = 3.5; // Target distance

    // Rotate (0, 0, 3.5) by -parentRotationY around Y axis
    // x' = x*cos(theta) - z*sin(theta)
    // z' = x*sin(theta) + z*cos(theta)
    const sinN = Math.sin(-parentRotationY);
    const cosN = Math.cos(-parentRotationY);

    const targetLocalX = x_world * cosN - z_world * sinN;
    const targetLocalZ = x_world * sinN + z_world * cosN;
    const targetLocalY = 0; // Center Y

    // 3. Interpolate (Lerp)
    // We lerp Position, Rotation, and Scale based on Phase

    // Position
    cardGroupRef.current.position.x = originalPosition[0] + (targetLocalX - originalPosition[0]) * currentPhase;
    // Y Position: Add float effect if phase is low, lock if phase is high
    cardGroupRef.current.position.y = originalPosition[1] + (targetLocalY - originalPosition[1]) * currentPhase;
    cardGroupRef.current.position.z = originalPosition[2] + (targetLocalZ - originalPosition[2]) * currentPhase;

    // Rotation
    // Slot Rot Y is originalRotation[1]
    // Target Rot Y is -parentRotationY (+ Math.PI? No, just face camera)
    // We need to be careful with angle wrapping for lerp, but for < 360 it's ok. 
    // Usually easier to slerp quaternions, but linear approximation is fine for short spring.
    const startRotY = originalRotation[1];
    const endRotY = -parentRotationY; // Should face camera (World 0)

    // Fix angle wrap (shortest path)
    let delta = endRotY - startRotY;
    while (delta > PI) delta -= 2 * PI;
    while (delta < -PI) delta += 2 * PI;

    cardGroupRef.current.rotation.y = startRotY + delta * currentPhase;

    // Scale
    const startScale = 1;
    let endScale = 1.3;
    if (isWrapperActive && !isActuallyCenteredInApp) endScale = 1.3; // Zoom in during flight

    // If hidden (another tool active), we handle via opacity, but phase 0 keeps it at scale 1.
    // Wait, inactive tools shrink? 
    // logic: if inactive && isAnyToolProcessActiveInApp -> scale 0.3.
    // Our 'phase' only handles Active <-> Slot. 
    // We need a separate 'shrink' factor? 
    // Let's rely on standard logic: 
    // If phase is close to 0, logic is "Slot".
    // If shrink is needed, we can multiply scale.

    let currentScale = startScale + (endScale - startScale) * currentPhase;

    // Shrink logic hack over top
    if (!isWrapperActive && isAnyToolProcessActiveInApp) {
      // We can't easily animate this inside useFrame without another spring value.
      // Let's assume opacity handles visibility enough? 
      // Or read explicit opacity to scale?
      const op = opacity.get();
      if (op < 1) currentScale *= 0.3 + (0.7 * op);
    }

    cardGroupRef.current.scale.setScalar(currentScale);

  });

  return (
    <animated.group
      ref={cardGroupRef}
    // Opacity is handled by spring directly as it's independent of transforms
    >
      <ToolCard
        tool={tool}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        isActive={isWrapperActive && isActuallyCenteredInApp}
        onClick={onSelect}
        opacity={opacity}
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
  pendingTool
}: CarouselSceneProps) {
  const groupRef = useRef<Group>(null);

  /* Removed unused spring logic */

  // Target rotation for snappy navigation
  const [rotationSpring, rotationApi] = useSpring(() => ({
    rotationY: Math.PI / 2, // Start rotated +90deg to bring Index 0 (Right) to Front (+Z)
    config: { mass: 1, tension: 200, friction: 30 } // Snappy but smooth
  }));

  const currentRotationIndex = useRef(0);

  // Sync rotation when activeTool OR pendingTool changes
  // We prioritize pendingTool to start visual rotation IMMEDIATELY upon selection
  useEffect(() => {
    const targetTool = pendingTool || activeTool;

    if (targetTool) {
      const targetIndex = tools.findIndex(t => t.id === targetTool.id);
      if (targetIndex !== -1) {
        // Calculate the target rotation index (negative because ArrowRight decrements)
        currentRotationIndex.current = -targetIndex;

        const angleStep = (2 * Math.PI) / tools.length;
        // Apply offset to center the card (move from X axis to Z axis)
        rotationApi.start({ rotationY: currentRotationIndex.current * angleStep + Math.PI / 2 });
      }
    }
  }, [activeTool, pendingTool, tools, rotationApi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnyToolProcessActive) return;

      if (e.key === 'ArrowRight') {
        currentRotationIndex.current -= 1; // Move right means rotate counter-clockwise effectively
        const angleStep = (2 * Math.PI) / tools.length;
        rotationApi.start({ rotationY: currentRotationIndex.current * angleStep + Math.PI / 2 });
      } else if (e.key === 'ArrowLeft') {
        currentRotationIndex.current += 1;
        const angleStep = (2 * Math.PI) / tools.length;
        rotationApi.start({ rotationY: currentRotationIndex.current * angleStep + Math.PI / 2 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tools.length, isAnyToolProcessActive, rotationApi]);

  useFrame((state) => {
    const { clock } = state;
    if (groupRef.current) {
      // Apply spring rotation
      const currentY = rotationSpring.rotationY.get();
      groupRef.current.rotation.y = currentY;

      if (!isAnyToolProcessActive) {
        // Mesmerizing Float
        const floatAmplitude = 0.1;
        const floatSpeed = 0.5;
        groupRef.current.position.y = Math.sin(clock.elapsedTime * floatSpeed) * floatAmplitude;

        // Breathing Scale
        const currentBreathScale = 1 + Math.sin(clock.elapsedTime * 0.5) * 0.02; // Reduced amplitude
        groupRef.current.scale.setScalar(currentBreathScale);
      } else {
        // Lock position when active
        groupRef.current.position.y = 0;
        groupRef.current.scale.setScalar(1);
      }
    }
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
      {/* Interaction Mesh Removed */}
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

      {/* Atmospheric Particles (Energy Motes) */}
      <Sparkles
        count={50} // Ultra-low count for iGPU
        scale={12}
        size={4}
        speed={0.4}
        opacity={0.5}
        color="#F0FF8E" // Electric Yellow/Green energy
      />

      {/* Handheld Camera Rig */}
      <CameraRig />
    </animated.group>

  );
}

function CameraRig() {
  useFrame((state) => {
    // Subtle breathing/sway
    const t = state.clock.elapsedTime;
    state.camera.position.y = Math.sin(t * 0.5) * 0.1; // Breathe Y
    state.camera.rotation.z = Math.sin(t * 0.2) * 0.01; // Tilt Z

    // Mouse parallax (very subtle)
    // We access pointer directly to avoid re-renders
    const { x, y } = state.pointer;
    state.camera.position.x += (x * 0.1 - state.camera.position.x) * 0.02; // Reduced from 0.5
    state.camera.position.y += (y * 0.1 - state.camera.position.y) * 0.02; // Reduced from 0.5

    state.camera.lookAt(0, 0, 0);
  })
  return null;
}