import { Link, useLocation } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

export function Header() {
  const location = useLocation();
  const onExplore = location.pathname.startsWith('/explore');

  return (
    <header className={`sticky top-0 z-50 w-full ${onExplore ? 'bg-transparent' : 'bg-slate-950/35'} backdrop-blur-md border-b border-white/10`}>
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="Go to tools dashboard">
          <img
            src="/favicon.ico"
            alt="Litas Logo"
            className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.25)]"
          />
          <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(15,23,42,0.65)]">
            LITASDARK
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Tools
          </Link>
          <Link
            to="/explore"
            className="hidden md:flex items-center gap-2 group text-xs font-medium text-slate-600 hover:text-slate-400 transition-colors"
          >
            <FlaskConical size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-1 group-hover:translate-x-0" />
            Labs
          </Link>

        </nav>
      </div>
    </header>
  );
}
