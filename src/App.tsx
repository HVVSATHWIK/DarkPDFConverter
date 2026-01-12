import { BrowserRouter } from 'react-router-dom';
// import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from './AppRoutes';
import { Header } from '@/components/layout/Header'; // Added import
import './index.css';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        {/* <p style={{ textAlign: 'center', padding: '10px', backgroundColor: 'lightblue' }}>Verification: v_final_check_01</p> */}
      </div>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;