import { useState, useRef, PointerEvent, WheelEvent } from 'react'; // Added PointerEvent, WheelEvent
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh } from 'three';
import { animated, useSpring } from '@react-spring/three';

/**
 * Props for the ToolCard component.
 */
interface ToolCardProps {
  position: [number, number, number]; // Initial position of the card in the 3D scene.
  rotation: [number, number, number]; // Initial rotation of the card.
  tool: { // Data for the tool this card represents.
    name: string;
    icon: string;
    description?: string;
    // subTools?: Tool[]; // Future: for nested tools, see src/types.ts
  };
  isActive: boolean; // True if this card is the globally active and centered tool.
                     // This affects hover behavior (e.g., prevents flipping).
  onClick: () => void; // Callback function when the card's main body or "Go" button is clicked.
}

/**
 * `ToolCard` is a 3D component representing a single interactive tool card.
 * It features hover effects (tilt, scale, color change), a flip animation to reveal
 * back content, and displays tool information.
 */
export default function ToolCard({ 
  position, 
  rotation: initialRotation, // Renamed for clarity as the group handles overall initial rotation
  tool, 
  isActive, // Is this card the main active tool, centered in the workspace?
  onClick 
}: ToolCardProps) {
  // Ref for the main mesh of the card, used for direct manipulation (e.g., wiggle animation).
  const meshRef = useRef<Mesh>(null);
  
  // STATE VARIABLES:
  // `hovered`: True if the mouse pointer is currently over the card.
  const [hovered, setHovered] = useState(false);
  // `flipped`: True if the card is showing its back face.
  const [flipped, setFlipped] = useState(false);
  // `flipTimeoutRef`: Ref for a timeout used to delay the flip animation on hover.
  // This prevents accidental flips when the pointer quickly passes over the card.
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // SPRING ANIMATIONS for card properties (scale, color, tilt, flip rotation).
  // These animations are driven by the `hovered`, `isActive`, and `flipped` states.
  const { scale, color, rotationX, rotationY } = useSpring({
    scale: hovered || isActive ? 1.1 : 1, // Scale up if hovered or globally active.
    color: hovered ? '#6200ea' : isActive ? '#3700b3' : '#333333', // Change color based on hover/active state.
    rotationX: hovered && !isActive ? 0.2 : 0, // Tilt forward on hover, but not if it's the active workspace card.
    rotationY: flipped ? Math.PI : 0, // Rotate 180 degrees around Y-axis when flipped.
    config: { mass: 1, tension: 170, friction: 26 } // Standard spring physics.
  });

  // WIGGLE ANIMATION using `useFrame` for a subtle hover/active effect.
  // This runs on every frame.
  useFrame((state) => {
    if (meshRef.current) {
      if (!flipped && (hovered || isActive)) {
        // Apply a gentle sinusoidal rotation on Z-axis if card is front-facing and hovered/active.
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      } else {
        // Reset wiggle if card is flipped or no longer hovered/active.
        meshRef.current.rotation.z = 0;
      }
    }
  });

  // EVENT HANDLERS for pointer interactions:

  /**
   * `handlePointerOver`: Triggered when the mouse pointer enters the card area.
   * Sets `hovered` state to true.
   * If the card is not `isActive` (i.e., not the main centered tool),
   * it initiates a timeout to flip the card, showing its back face.
   */
  const handlePointerOver = (event: PointerEvent) => {
    // Stop event propagation to prevent unintended interactions with parent elements in complex scenes.
    event.stopPropagation(); 
    setHovered(true);
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current); // Clear any existing flip timeout.
    // Only allow flip on hover if the card is not the main active (centered) card.
    if (!isActive) {
      flipTimeoutRef.current = setTimeout(() => {
        // Double-check `hovered` and `!isActive` inside timeout, in case state changed rapidly.
        if (hovered && !isActive) { 
          setFlipped(true);
        }
      }, 300); // 300ms delay before flipping.
    }
  };

  /**
   * `handlePointerOut`: Triggered when the mouse pointer leaves the card area.
   * Sets `hovered` state to false.
   * Clears any pending flip timeout.
   * If the card is not `isActive`, it flips the card back to its front face.
   */
  const handlePointerOut = (event: PointerEvent) => {
    event.stopPropagation();
    setHovered(false);
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    // Only flip back if not the main active (centered) card.
    if (!isActive) {
      setFlipped(false);
    }
  };
  
  /**
   * `handleWheel`: Prevents scroll events on the card from propagating to the window,
   * which could cause unintended page scrolling while interacting with the 3D scene.
   */
  const handleWheel = (event: WheelEvent) => {
    event.stopPropagation();
  };

  // The main card is wrapped in a `group` to apply initial position and rotation from props.
  // The `animated.mesh` then handles its own hover/flip animations relative to this group.
  return (
    <group position={position} rotation={initialRotation} onWheel={handleWheel}>
      <animated.mesh
        ref={meshRef}
        onClick={(event) => { // Handle main card click.
          event.stopPropagation();
          onClick(); // Propagate click to parent (e.g., to select tool).
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={scale} // Apply animated scale.
        rotation-x={rotationX} // Apply animated tilt (rotation around X-axis).
        rotation-y={rotationY} // Apply animated flip (rotation around Y-axis).
      >
        {/* Card geometry: a simple box. Args: [width, height, depth]. */}
        <boxGeometry args={[2, 3, 0.2]} />
        {/* Card material: standard material with animated color. */}
        <animated.meshStandardMaterial
          color={color}
          metalness={0.5} // Adjust for metallic appearance.
          roughness={0.5} // Adjust for surface roughness.
        />
        
        {/* Conditional rendering for FRONT FACE content (visible when !flipped). */}
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

            {/* Chevron placeholder for sub-tools - visible only on front, when not active/flipped */}
            {/* This assumes tool.subTools might exist in the future */}
            {/* {!isActive && !flipped && tool.subTools && tool.subTools.length > 0 && ( */}
            {!isActive && !flipped && ( // Simplified condition for placeholder visibility
              <Text
                position={[0.8, -1.3, 0.115]} // Bottom-right on the front face
                fontSize={0.25}
                color="#FFFFFF"
                anchorX="center"
                anchorY="middle"
                // onClick={(e) => {
                //   e.stopPropagation(); // Prevent card flip or main onClick
                //   // setHovered(false); // Potentially stop hover effects
                //   // clearTimeout(flipTimeoutRef.current); // Prevent flip
                //   // console.log('Chevron clicked, tool ID:', tool.id);
                //   // Signal to CarouselScene to show sub-tools for tool.id
                //   // This might involve calling a prop like onShowSubTools(tool.id)
                //   // Or, ToolCard might manage its own 'isSubmenuOpen' state if sub-tools are rendered by ToolCard itself.
                // }}
              >
                {'>'}
              </Text>
            )}
            {/* End Chevron placeholder */}
          </>
        )}
        {/* Back face content placeholder */}
        {flipped && (
          <>
            <Text
              position={[0, 0.8, -0.11]} // Positioned on the back, adjusted Y
              fontSize={0.25}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              rotation-y={Math.PI} // Rotate text to be readable from back
            >
              File Upload
            </Text>
            <Text
              position={[0, 0, -0.11]} // Positioned on the back
              fontSize={0.25}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              rotation-y={Math.PI} // Rotate text
            >
              Setting: Default
            </Text>
            {/* "Go" button - now a clickable mesh */}
            <mesh
              position={[0, -0.9, -0.105]} // Slightly in front of the card's back surface
              onClick={(event) => {
                event.stopPropagation(); // Prevent main card click
                onClick(); // Call the original onClick passed to ToolCard
              }}
              onPointerOver={(event) => { event.stopPropagation(); /* Maybe change color or scale on hover */ }}
              onPointerOut={(event) => { event.stopPropagation(); /* Reset hover effect */ }}
            >
              <planeGeometry args={[0.8, 0.4]} /> {/* width, height */}
              <meshStandardMaterial color="#00dd00" metalness={0.6} roughness={0.4} />
              <Text
                position={[0, 0, 0.01]} // Slightly in front of the button plane
                fontSize={0.25}
                color="#000000"
                anchorX="center"
                anchorY="middle"
                rotation-y={Math.PI} // Rotate text to be readable
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