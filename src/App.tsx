import { BrowserRouter } from 'react-router-dom';
// import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from './AppRoutes';
import { Header } from '@/components/layout/Header'; // Added import
import './index.css';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <main className="flex-grow min-h-0 overflow-y-auto">
          <AppRoutes />
        </main>
        {/* <p style={{ textAlign: 'center', padding: '10px', backgroundColor: 'lightblue' }}>Verification: v_final_check_01</p> */}
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;