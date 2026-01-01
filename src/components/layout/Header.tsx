// import { Link } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import LogoutButton from '@/components/auth/LogoutButton';
// import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="absolute top-0 left-0 w-full z-20 p-6 pointer-events-none">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center text-xl font-bold text-white pointer-events-auto cursor-pointer">
          <img src="/logo.png" alt="Litas Logo" className="h-10 w-10 mr-3 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
          <span className="tracking-wide text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            LITAS
          </span>
        </div>
        {/* Navigation or other tools can go here */}
      </div>
    </header>
  );
}
