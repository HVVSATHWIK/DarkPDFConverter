import { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend, ReactThreeFiber } from '@react-three/fiber';
import { shaderMaterial, Plane, Points } from '@react-three/drei';
// import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// ===================== LIQUID SHADERS =====================

const liquidVertexShader = `
uniform float uTime;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uPulseSpeed; 

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vElevation;

// Sine wave overlay function for "Real Waves"
float wave(vec2 position, vec2 direction, float frequency, float speed, float time) {
    float x = dot(direction, position) * frequency + time * speed;
    return sin(x);
}

void main(){
  float time = uTime * uSpeed;
  vec3 pos = position;

  // WAVE GENERATION (Directional Superposition)
  float elevation = 0.0;
  
  // Wave 1: Large diagonal swell
  elevation += wave(pos.xy, vec2(1.0, 0.5), uFrequency, 1.0, time);
  
  // Wave 2: Smaller crossing chop
  elevation += wave(pos.xy, vec2(0.6, 1.0), uFrequency * 2.0, 0.8, time) * 0.5;
  
  // Wave 3: Subtle detail
  elevation += wave(pos.xy, vec2(-0.5, 0.8), uFrequency * 4.0, 1.2, time) * 0.2;

  elevation *= uAmplitude;

  vec3 displaced = pos + vec3(0.0, 0.0, elevation);

  // NORMALS RECALCULATION (Finite Difference)
  float eps = 0.01;
  
  // Calculate neighbor heights for normal computation
  float e1 = wave(pos.xy + vec2(eps, 0.0), vec2(1.0, 0.5), uFrequency, 1.0, time)
           + wave(pos.xy + vec2(eps, 0.0), vec2(0.6, 1.0), uFrequency * 2.0, 0.8, time) * 0.5
           + wave(pos.xy + vec2(eps, 0.0), vec2(-0.5, 0.8), uFrequency * 4.0, 1.2, time) * 0.2;
           
  float e2 = wave(pos.xy + vec2(0.0, eps), vec2(1.0, 0.5), uFrequency, 1.0, time)
           + wave(pos.xy + vec2(0.0, eps), vec2(0.6, 1.0), uFrequency * 2.0, 0.8, time) * 0.5
           + wave(pos.xy + vec2(0.0, eps), vec2(-0.5, 0.8), uFrequency * 4.0, 1.2, time) * 0.2;
           
  vec3 hdx = vec3(eps, 0.0, (e1 - elevation) * uAmplitude);
  vec3 hdy = vec3(0.0, eps, (e2 - elevation) * uAmplitude);

  vNormal = normalize(cross(hdx, hdy));
  vElevation = elevation;

  vec4 modelPos = modelMatrix * vec4(displaced, 1.0);
  vec4 viewPos = viewMatrix * modelPos;
  vViewPosition = viewPos.xyz;

  gl_Position = projectionMatrix * viewPos;
}
`;

const liquidFragmentShader = `
uniform vec3 uBaseColor;
uniform vec3 uHighlight1;
uniform vec3 uHighlight2;
uniform float uTime; // Added for pulse access
uniform float uPulseSpeed; // New uniform for pulse control

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vElevation;

void main(){
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(-vViewPosition);

  // RIM LIGHTING (Softer, less neon)
  float rim = 1.0 - clamp(dot(normal,viewDir),0.0,1.0);
  float rim1 = pow(rim, 4.0); // Tighter rim
  float rim2 = pow(rim, 6.0); // Even tighter for subtle highlights

  // PULSE EFFECT (Very subtle now)
  float pulse = (sin(uTime * uPulseSpeed) + 1.0) * 0.5; 
  float pulseFactor = 1.0 + pulse * 0.2; 

  // COLOR MIXING - More gradient-like, less harsh steps
  vec3 color = mix(uBaseColor, uHighlight1, rim1 * pulseFactor); // Base to highlight 1
  color = mix(color, uHighlight2, rim2 * pulseFactor);           // Add highlight 2 tips

  // SHADOWS (Less black crush)
  float shadow = smoothstep(0.4, -0.8, vElevation);
  color *= mix(1.0, 0.5, shadow); // Only darken by 50% in valleys

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// ===================== PARTICLE SHADERS =====================

const particleVertexShader = `
uniform float uTime;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uPulseSpeed;

attribute float size;
varying vec3 vColor;
varying float vOpacity;

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0,1.0/3.0);
  const vec4 D = vec4(0.0,0.5,1.0,2.0);

  vec3 i = floor(v + dot(v,C.yyy));
  vec3 x0 = v - i + dot(i,C.xxx);

  vec3 g = step(x0.yzx,x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz,l.zxy);
  vec3 i2 = max(g.xyz,l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod(i,289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0,i1.z,i2.z,1.0))
    + i.y + vec4(0.0,i1.y,i2.y,1.0))
    + i.x + vec4(0.0,i1.x,i2.x,1.0));

  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy,y.xy);
  vec4 b1 = vec4(x.zw,y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h,vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m = m * m;

  return 42.0 * dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

void main(){
  float time = uTime * uSpeed;
  vec3 pos = position;

  // NOISE GENERATION (same as liquid for integration)
  float n1 = snoise(vec3(pos.xy * uFrequency, time));
  float n2 = snoise(vec3(pos.xy * uFrequency * 2.0, time * 1.5)) * 0.5;
  float elevation = (n1 + n2) * uAmplitude;

  // Displace particles slightly above the liquid surface
  vec3 displaced = pos + vec3(0.0, 0.0, elevation + 0.05);

  // Pulse effect for size and opacity
  float pulse = (sin(uTime * uPulseSpeed + position.x * 0.5) + 1.0) * 0.5; // Per-particle offset for variety
  gl_PointSize = size * (1.0 + pulse * 0.5);

  vOpacity = 0.5 + pulse * 0.5; // Opacity pulses
  
  // Match LitasDark Palette (Darker/Desaturated for Utility focus)
  vec3 color1 = vec3(0.09, 0.15, 0.33); // Deep Muted Blue
  vec3 color2 = vec3(0.08, 0.45, 0.58); // Muted Teal/Cyan
  
  vColor = mix(color1, color2, pulse); // Blend between highlights

  vec4 modelPos = modelMatrix * vec4(displaced, 1.0);
  vec4 viewPos = viewMatrix * modelPos;
  gl_Position = projectionMatrix * viewPos;
}
`;

const particleFragmentShader = `
varying vec3 vColor;
varying float vOpacity;

void main(){
  // Simple circular point with fade for glow
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  float alpha = (1.0 - smoothstep(0.3, 0.5, dist)) * vOpacity * 0.6; // Reduced alpha opacity
  gl_FragColor = vec4(vColor, alpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// ===================== MATERIALS =====================

const LiquidMaterial = shaderMaterial(
    {
        uTime: 0,
        uFrequency: 0.5,
        uAmplitude: 0.3,  // Reduced from 0.4 for calmer waves
        uSpeed: 0.2,      // Slower speed
        uPulseSpeed: 0.5,
        uBaseColor: new THREE.Color('#010206'), // Almost Pure Black
        uHighlight1: new THREE.Color('#0f172a'), // Slate 900 (Very Subtle)
        uHighlight2: new THREE.Color('#0e7490')  // Cyan 700 (Much darker than previous Cyan 500)
    },
    liquidVertexShader,
    liquidFragmentShader
);

const ParticleMaterial = shaderMaterial(
    {
        uTime: 0,
        uFrequency: 1.5,
        uAmplitude: 0.4,
        uSpeed: 0.15,
        uPulseSpeed: 2.0,
    },
    particleVertexShader,
    particleFragmentShader
);

extend({ LiquidMaterial, ParticleMaterial });

declare global {
    // JSX intrinsic element augmentation requires a namespace.
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            liquidMaterial: ReactThreeFiber.Object3DNode<
                THREE.ShaderMaterial,
                typeof LiquidMaterial
            >;
            particleMaterial: ReactThreeFiber.Object3DNode<
                THREE.ShaderMaterial,
                typeof ParticleMaterial
            >;
        }
    }
}

// ===================== SCENE COMPONENTS =====================

function LiquidPlane() {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((_, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value += delta;
        }
    });

    return (
        <Plane
            args={[20, 20, 256, 256]}
            position={[0, -2, -5]}
            rotation={[-Math.PI / 3.5, 0, 0]} // Tilted for 3D depth
        >
            <liquidMaterial ref={materialRef} />
        </Plane>
    );
}

function ParticleSystem() {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const pointsRef = useRef<THREE.Points>(null);

    // Responsive particle count
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    const particleCount = isMobile ? 600 : 2000; // Drastic reduction for mobile performance & clarity

    // Memoize the buffers so they aren't recreated on every render
    const [positions, sizes] = useMemo(() => {
        const p = new Float32Array(particleCount * 3);
        const s = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            p[i * 3] = (Math.random() - 0.5) * 20;
            p[i * 3 + 1] = (Math.random() - 0.5) * 20;
            p[i * 3 + 2] = (Math.random() - 0.5) * 2;
            s[i] = Math.random() * 2 + 1;
        }
        return [p, s];
    }, [particleCount]);

    useFrame((_, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value += delta;
        }
    });

    return (
        <Points
            ref={pointsRef}
            position={[0, -2, -5]}
            rotation={[-Math.PI / 3.5, 0, 0]} // Match liquid rotation
        >
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={particleCount}
                    array={sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <particleMaterial
                ref={materialRef}
                transparent={true}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </Points>
    );
}

export function LiquidBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-black">
            <Canvas
                dpr={[1, 1.5]}
                camera={{ position: [0, 2, 6], fov: 45 }} // Moved camera up and back
                gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}
            >
                <color attach="background" args={['#010206']} />
                <fog attach="fog" args={['#010206', 5, 20]} /> {/* Darker fog to match base */}

                <LiquidPlane />
                <ParticleSystem />
            </Canvas>

            {/* UX Overlay: Darkens the background to ensure utility tool readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/60 to-slate-950/80 backdrop-blur-[1px]" />
        </div>
    );
}