import { lazy, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from './AppRoutes';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ReportBugProvider } from '@/context/ReportBugContext';
import { ReportBugModal } from '@/components/common/ReportBugModal';
import './index.css';

const LiquidBackground = lazy(() =>
  import('@/components/layout/LiquidBackground').then((module) => ({
    default: module.LiquidBackground,
  }))
);

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ReportBugProvider>
        <ScrollToTop />
        <div className="relative h-screen flex flex-col overflow-hidden">
          <Suspense fallback={null}>
            <LiquidBackground />
          </Suspense>
          <Header />
          <main className="flex-grow min-h-0 overflow-y-auto relative z-10 flex flex-col">
            <div className="flex-1">
              <AppRoutes />
            </div>
            <Footer />
          </main>
        </div>
        <Toaster />
        <ReportBugModal />
      </ReportBugProvider>
    </BrowserRouter>
  );
}

export default App;