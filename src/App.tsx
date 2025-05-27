import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from './AppRoutes';
import { Header } from '@/components/layout/Header'; // Added import
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background flex flex-col"> {/* Ensure flex-col for layout */}
          <Header /> {/* Added Header */}
          <main className="flex-grow"> {/* Ensure main content can grow */}
            <AppRoutes />
          </main>
          <p style={{ textAlign: 'center', padding: '10px', backgroundColor: 'lightblue' }}>Verification: v_final_check_01</p>
        </div>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;