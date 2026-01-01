import { Html } from '@react-three/drei';

export default function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
      </div>
    </Html>
  );
}