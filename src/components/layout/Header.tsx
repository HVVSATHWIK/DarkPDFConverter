// import { Link } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import LogoutButton from '@/components/auth/LogoutButton';
// import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="absolute top-0 left-0 w-full z-20 p-6 pointer-events-none">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/favicon.ico" alt="Litas Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
          <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(15,23,42,0.65)]">
            LITASDARK
          </span>
        </div>
        {/* Navigation or other tools can go here */}
      </div>
    </header>
  );
}
