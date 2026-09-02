import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from './AppRoutes';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LiquidBackground } from '@/components/layout/LiquidBackground';
import './index.css';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="relative h-screen flex flex-col overflow-hidden">
        <LiquidBackground />
        <Header />
        <main className="flex-grow min-h-0 overflow-y-auto relative z-10 flex flex-col">
          <div className="flex-1">
            <AppRoutes />
          </div>
          <Footer />
        </main>
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;