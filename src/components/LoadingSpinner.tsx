import { Html } from '@react-three/drei';

export default function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-400/90 shadow-[0_0_14px_rgba(99,102,241,0.25)]"></div>
      </div>
    </Html>
  );
}