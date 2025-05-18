import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CarouselScene from './components/CarouselScene';
import LoadingSpinner from './components/LoadingSpinner';
import WorkspacePanel from './components/WorkspacePanel';
import MiniCarousel from './components/MiniCarousel';
import type { Tool } from './types';

const tools: Tool[] = [
  { id: 1, name: 'Dark Mode', icon: '🌙', description: 'Convert PDFs to dark mode' },
  { id: 2, name: 'Merge PDFs', icon: '🔄', description: 'Combine multiple PDFs' },
  { id: 3, name: 'Split PDF', icon: '✂️', description: 'Split PDF into multiple files' },
  { id: 4, name: 'Rotate PDF', icon: '🔄', description: 'Rotate PDF pages' },
  { id: 5, name: 'Compress PDF', icon: '📦', description: 'Reduce PDF file size' },
  { id: 6, name: 'Extract Pages', icon: '📄', description: 'Extract specific pages' },
];

function App() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  return (
    <div className="min-h-screen bg-dark">
      <div className="fixed inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <Suspense fallback={null}>
            <CarouselScene 
              tools={tools}
              activeTool={activeTool}
              onToolSelect={setActiveTool}
            />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              enabled={!activeTool}
            />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
          </Suspense>
        </Canvas>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            LitasDark: PDF Tools Hub
          </h1>
          <p className="text-gray-300">
            Your all-in-one PDF manipulation toolkit
          </p>
        </header>
      </div>

      <WorkspacePanel 
        activeTool={activeTool}
        onClose={() => setActiveTool(null)}
      />

      <MiniCarousel
        tools={tools}
        activeTool={activeTool}
        onToolSelect={setActiveTool}
      />
      
      <LoadingSpinner />
    </div>
  );
}

export default App;