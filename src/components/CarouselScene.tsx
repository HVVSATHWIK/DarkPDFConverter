import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useSpring, animated, config as springConfig, SpringValue } from '@react-spring/three';
import ToolCard from './ToolCard';
import type { Tool } from '../types';

// Removed duplicate imports:
// import { useRef, useEffect, useMemo } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { Group } from 'three';
// import { useSpring, animated, config as springConfig } from '@react-spring/three';
// import ToolCard from './ToolCard';
// import type { Tool } from '../types';

/**
 * Props for the CarouselScene component.
 */
interface CarouselSceneProps {
  tools: Tool[]; // Array of tool objects to display in the carousel.
  activeTool: Tool | null; // The currently active tool object from App.tsx, or null.
  onToolSelect: (tool: Tool | null) => void; // Callback function when a tool card is selected (clicked).
  onCardReachedCenter: () => void; // Callback function triggered when a selected card finishes its animation to the center.
  onCardReturnedToRing: (returnedToolId: number) => void; // Callback function triggered when an active card finishes animating back to the carousel ring.
  isCardActuallyCentered: boolean; // Boolean flag from App.tsx indicating if the active card is considered to be in its centered state.
  isAnyToolProcessActive: boolean; // Boolean flag from App.tsx indicating if any tool is active or pending, used to pause carousel interactions.
}

/**
 * Props for the AnimatedToolCardWrapper component.
 * This wrapper handles the animation of individual tool cards.
 */
interface AnimatedToolCardWrapperProps {
  tool: Tool; // The tool data for this specific card.
  originalPosition: [number, number, number]; // The card's default position in the carousel ring.
  originalRotation: [number, number, number]; // The card's default rotation in the carousel ring.
  
  isWrapperActive: boolean; // True if this card corresponds to the `activeTool` in App.tsx.
  isActuallyCenteredInApp: boolean; // True if App.tsx considers the `activeTool` to be in its centered state.
                                   // This drives the target state for an active card (center or ring).
  isAnyToolProcessActiveInApp: boolean; // True if any tool is active or pending in App.tsx.
                                       // Used to hide non-active cards.

  onSelect: () => void; // Callback when this card is clicked by the user.
  onCenterComplete: () => void; // Callback when this card finishes animating to the center.
  onReturnComplete: (returnedToolId: number) => void; // Callback when this card finishes animating back to the ring.
}

/**
 * `AnimatedToolCardWrapper` is responsible for the animation of a single tool card.
 * It uses `useSpring` from `@react-spring/three` to animate properties like position,
 * scale, rotation, and opacity based on props passed down from `CarouselScene`.
 */
function AnimatedToolCardWrapper({
  tool,
  originalPosition,
  originalRotation,
  isWrapperActive, // Is this card the current global activeTool?
  isActuallyCenteredInApp, // Should the global activeTool be at the center or in the ring?
  isAnyToolProcessActiveInApp, // Is any tool process (active or pending) ongoing in the app?
  onSelect,
  onCenterComplete,
  onReturnComplete,
}: AnimatedToolCardWrapperProps) {
  const cardGroupRef = useRef<Group>(null); // Ref to the animated group for potential direct manipulation (not currently used).

  // Spring animation for card properties.
  // The `to` function defines the target animation states based on the component's props.
  // The spring automatically animates from its current state to the new target state when props change.
  const { position, scale, rotation, opacity } = useSpring<{
    position: [number, number, number];
    scale: [number, number, number];
    rotation: [number, number, number];
    opacity: number;
  }>(() => ({
    // `to` is an async function allowing sequential animations or complex logic.
    // `next` is a function to update spring values.
    to: async (next) => {
      if (isWrapperActive) {
        // This card is the App's `activeTool`.
        if (isActuallyCenteredInApp) {
          // TARGET STATE: Active card, should be at the center of the scene.
          // Animate to a predefined center position, scale up, rotate to face front (Math.PI on Y), and fully opaque.
          await next({
            position: [0, 0, 3.5], // Target position for centered card
            scale: [1.3, 1.3, 1.3],    // Target scale for centered card
            rotation: [0, Math.PI, 0], // Target rotation (e.g., show back for interaction)
            opacity: 1,
            config: springConfig.gentle, // Animation physics
            onRest: onCenterComplete, // Callback when this animation sequence completes.
          });
        } else {
          // TARGET STATE: Active card, but should be in the carousel ring (e.g., animating back).
          // Animate to its original position and rotation in the ring, normal scale, fully opaque.
          await next({
            position: originalPosition,
            scale: [1, 1, 1],
            rotation: originalRotation,
            opacity: 1,
            config: springConfig.gentle,
            onRest: () => onReturnComplete(tool.id), // Callback when this animation sequence completes.
          });
        }
      } else {
        // This card is NOT the App's `activeTool`.
        if (isAnyToolProcessActiveInApp) {
          // TARGET STATE: Inactive card, and some other tool process is active/pending in the app.
          // Hide this card by scaling down and fading out.
          await next({
            position: originalPosition, // Maintain original position to avoid visual jump if it becomes active.
            scale: [0.3, 0.3, 0.3],    // Scale down significantly.
            opacity: 0,
            config: springConfig.stiff, // Use a stiffer animation for hiding.
          });
        } else {
          // TARGET STATE: Inactive card, and NO tool process is active/pending in the app.
          // Show this card in its normal state in the carousel ring.
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
    // `from` defines the initial state of the animation when the component mounts or when `reset` is triggered.
    from: { position: originalPosition, scale: [1,1,1], rotation: originalRotation, opacity: 1 },
    // `reset`: If true, the spring animation restarts from the `from` state.
    // This ensures the animation correctly transitions if critical state-determining props change.
    reset: isWrapperActive || isActuallyCenteredInApp || isAnyToolProcessActiveInApp,
    // `cancel`: Can be used to stop ongoing animations if certain props change.
    // Potentially useful for more complex interruption scenarios, but can also make behavior unpredictable if not managed carefully.
    // cancel: isWrapperActive || isActuallyCenteredInApp || isAnyToolProcessActiveInApp, 
  }));
  
  // Example of a commented-out subtle hover effect for individual cards in the ring.
  // This would be separate from ToolCard's internal hover logic.
  // const [isHovered, setIsHovered] = useState(false);
  // const hoverSpring = useSpring({
  //   transform: isHovered ? 'translateY(-5px)' : 'translateY(0px)',
  //   boxShadow: isHovered ? '0px 10px 20px rgba(0,0,0,0.2)' : '0px 5px 10px rgba(0,0,0,0.1)',
  // });

  return (
    <animated.group
      ref={cardGroupRef}
      position={position} // Apply animated position
      scale={scale}         // Apply animated scale
      rotation={rotation}   // Apply animated rotation
      visible={opacity.to(o => o > 0.05)} // Hide if mostly transparent to avoid ghost interactions
      opacity={opacity}     // Apply animated opacity
      // Example: Attach hover events if the above hoverSpring was used.
      // onPointerOver={() => !isWrapperActive && setIsHovered(true)} 
      // onPointerOut={() => setIsHovered(false)}
    >
      <ToolCard
        tool={tool}
        // ToolCard is positioned at the origin of this animated group.
        // Its own animations (tilt/flip) are relative to this group.
        position={[0,0,0]} 
        rotation={[0,0,0]}
        // `isActive` prop for ToolCard: controls its internal state (e.g., prevents hover flip, applies active styling).
        // A card is considered "active" in ToolCard's context if it's the globally active tool AND is centered.
        isActive={isWrapperActive && isActuallyCenteredInApp} 
        onClick={onSelect} // Pass down the onSelect callback for when the card is clicked.
      />
    </animated.group>
  );
}

/**
 * `CarouselScene` is the main 3D component that renders the carousel of tool cards.
 * It manages the overall carousel rotation, breathing animation, and the layout of tool cards.
 * It uses `AnimatedToolCardWrapper` to handle individual card animations and interactions.
 */
export default function CarouselScene({ 
  tools, 
  activeTool, 
  onToolSelect, 
  onCardReachedCenter,
  onCardReturnedToRing,
  isCardActuallyCentered, // Prop from App: Is the active tool considered centered by the App?
  isAnyToolProcessActive, // Prop from App: Is any tool active or pending transition?
}: CarouselSceneProps) {
  // Ref for the main group containing all cards; used for overall carousel rotation and breathing effect.
  const groupRef = useRef<Group>(null); 
  // Ref to control whether the automatic carousel rotation is enabled (toggled by Spacebar).
  const isCarouselRotatingEnabled = useRef(true); 
  // Ref for the speed of the automatic carousel rotation.
  const carouselRotationSpeed = useRef(0.05); 
  // Ref to store the last elapsed time from the clock, used for consistent rotation speed.
  const lastElapsedTime = useRef(0);

  // Spring for the entire carousel group's rotation (rotationY) and scale (for breathing).
  const [groupSpring, groupApi] = useSpring(() => ({
    rotationY: 0,
    scale: 1,
    config: springConfig.gentle // Default spring config for scale changes.
  }));

  // Effect for handling Spacebar key press to toggle carousel rotation.
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Rotation can only be toggled if no tool process is active (i.e., carousel is idle).
      if (e.code === 'Space' && !isAnyToolProcessActive) { 
        isCarouselRotatingEnabled.current = !isCarouselRotatingEnabled.current;
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isAnyToolProcessActive]); // Dependency: re-evaluate if rotation lock status changes.

  // `useFrame` hook for animations that update on every frame.
  useFrame((state) => {
    const { clock } = state; // Three.js clock object from render state.
    if (groupRef.current) {
      if (!isAnyToolProcessActive) {
        // STATE: Carousel is idle (no tool selected or transitioning).
        // Handle Carousel Rotation:
        if (isCarouselRotatingEnabled.current) {
          // Calculate rotation based on elapsed time delta to ensure consistent speed across varying frame rates.
          const elapsedTimeDelta = clock.elapsedTime - lastElapsedTime.current;
          // Normalize speed (multiply by 60 assuming target 60fps, adjust as needed).
          const newRotationY = groupSpring.rotationY.get() + carouselRotationSpeed.current * elapsedTimeDelta * 60; 
          // Update spring directly for rotation; `immediate: true` avoids spring physics lag for smoother visual rotation.
          groupApi.start({ rotationY: newRotationY, immediate: true }); 
        }
        
        // Handle Breathing Animation for the whole group:
        const breathAmplitude = 0.02; // How much the scale changes (e.g., 1.0 to 1.02 and back).
        const breathSpeed = 0.7;    // How fast the breathing cycle occurs.
        // Calculate current scale based on a sine wave over time.
        const currentBreathScale = 1 + Math.sin(clock.elapsedTime * breathSpeed) * breathAmplitude;
        // Update spring for scale; let the spring handle the smooth transition to `currentBreathScale`.
        groupApi.start({ scale: currentBreathScale }); 

      } else {
        // STATE: A tool is active or transitioning.
        // Ensure the carousel group's scale smoothly returns to 1 (no breathing).
        groupApi.start({ scale: 1 });
      }
      // Apply animated values to the actual group ref.
      groupRef.current.rotation.y = groupSpring.rotationY.get();
      groupRef.current.scale.set(groupSpring.scale.get(), groupSpring.scale.get(), groupSpring.scale.get());
    }
    lastElapsedTime.current = clock.elapsedTime; // Store current time for next frame's delta calculation.
  });
  
  // Carousel layout parameters.
  const radius = 5; // Radius of the carousel ring.
  const angleStep = (2 * Math.PI) / tools.length; // Angle between each card.

  // Memoize the calculation of card positions and rotations.
  // This avoids re-calculating on every render unless `tools`, `radius`, or `angleStep` changes.
  const cardTransforms = useMemo(() => {
    return tools.map((tool, index) => {
      const angle = index * angleStep;
      const x = radius * Math.cos(angle); // X position on the circle.
      const z = radius * Math.sin(angle); // Z position on the circle.
      return {
        tool,
        originalPosition: [x, 0, z] as [number, number, number],
        // Initial rotation: -angle rotates to position on circle, +PI/2 orients front face towards center.
        originalRotation: [0, -angle + Math.PI / 2, 0] as [number, number, number], 
      };
    });
  }, [tools, radius, angleStep]); // Dependencies for useMemo.


  // Do not render if there are no tools.
  if (!Array.isArray(tools) || tools.length === 0) {
    return null;
  }

  // Render the main animated group for the carousel.
  // Its rotation and scale are driven by `groupSpring`.
  return (
    <animated.group ref={groupRef} rotation-y={groupSpring.rotationY} scale={groupSpring.scale}>
      {/* 
        Future Sub-Tools/Nested Options Logic:
        (Existing detailed comments for sub-tools are preserved here)
        1. Data Structure: `Tool` interface in `src/types.ts` would have `subTools?: Tool[]`.
        2. State Management: 
           - `CarouselScene` might have a state like `expandedToolId: number | null` or `submenuForToolId: number | null`.
           - This state would be set when a ToolCard's chevron (placeholder added in ToolCard.tsx) is clicked.
             The ToolCard would call a prop like `onToggleSubmenu(toolId)`.
        3. Rendering Sub-Cards:
           - Inside this map, if `tool.id === expandedToolId` and `tool.subTools` exists:
             - Hide or de-emphasize other main tools.
             - The parent tool itself might animate to a specific position (e.g., slightly forward or to the side).
             - Map over `tool.subTools` and render them as `AnimatedToolCardWrapper` instances.
             - Their `originalPosition` and `originalRotation` would need to be calculated relative to the parent card,
               fanning out (e.g., in an arc or a row below/beside the parent).
             - Example positioning for sub-cards:
               const subCardAngleOffset = Math.PI / 6; // Angle between sub-cards
               const subCardRadius = 1.5; // Distance from parent card
               subTool.originalPosition = [
                 parentCardPosition.x + subCardRadius * Math.cos(subIndex * subCardAngleOffset - Math.PI/2),
                 parentCardPosition.y, // Or slightly offset
                 parentCardPosition.z + subCardRadius * Math.sin(subIndex * subCardAngleOffset - Math.PI/2)
               ];
           - These sub-cards would themselves be interactive (flippable, activatable).
           - Clicking a sub-card would call `onToolSelect(subTool)`, making it the active tool.
           - A "back" button or clicking the parent card again might close the submenu.
        4. Animation:
           - Parent card animates to its "submenu open" position/rotation.
           - Sub-cards animate into their fanned-out positions.
           - When closing, sub-cards animate out, and parent card returns to normal carousel position.
      */}
      {cardTransforms.map(({ tool, originalPosition, originalRotation }) => {
        if (!tool?.id || !tool?.name || !tool?.icon) {
          return null; // Skip rendering if essential tool data is missing.
        }
        // Determine if this specific card instance is the one currently active in the App.
        const isCurrentCardTheAppActiveTool = tool.id === activeTool?.id;
        
        // Future: If tool.id === expandedToolId, potentially render sub-tools instead or alongside
        // For now, just render the main tool card.

        return (
          <AnimatedToolCardWrapper
            key={tool.id} // React key for list items.
            tool={tool}   // Pass the tool data.
            originalPosition={originalPosition} // Its calculated default position in the ring.
            originalRotation={originalRotation} // Its calculated default rotation in the ring.
            
            // Props that determine this card's animation state:
            isWrapperActive={isCurrentCardTheAppActiveTool} // Is this THE active tool?
            isActuallyCenteredInApp={isCardActuallyCentered} // Should the active tool be at the center?
            isAnyToolProcessActiveInApp={isAnyToolProcessActive} // Is any tool interaction happening globally?
            
            // Callbacks for interaction and animation completion:
            onSelect={() => onToolSelect(tool)} // When the card is clicked by the user.
            onCenterComplete={() => {
              // Trigger App's callback only if this card is indeed the one that was supposed to reach center.
              if (isCurrentCardTheAppActiveTool) onCardReachedCenter();
            }}
            onReturnComplete={(returnedToolId) => {
              // Trigger App's callback only if this card is indeed the one that was supposed to return.
              if (isCurrentCardTheAppActiveTool) onCardReturnedToRing(returnedToolId);
            }}
          />
        );
      })}
    </animated.group>
  );
}