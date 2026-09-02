import { Link, useLocation } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

export function Header() {
  const location = useLocation();
  const onExplore = location.pathname.startsWith('/explore');
  const onHome = location.pathname === '/';
  const onTools =
    location.pathname === '/tools' ||
    location.pathname === '/all-tools' ||
    location.pathname.startsWith('/merge') ||
    location.pathname.startsWith('/split') ||
    location.pathname.startsWith('/rotate') ||
    location.pathname.startsWith('/extract') ||
    location.pathname.startsWith('/optimize') ||
    location.pathname.startsWith('/compress') ||
    location.pathname.startsWith('/dark-mode') ||
    location.pathname.startsWith('/cleanse') ||
    location.pathname.startsWith('/images');
  const onPrivacy =
    location.pathname.startsWith('/privacy') ||
    location.pathname.startsWith('/security') ||
    location.pathname.startsWith('/compliance');

  return (
    <header className={`sticky top-0 z-50 w-full ${onExplore ? 'bg-transparent' : 'bg-slate-950/90'} backdrop-blur-md border-b border-white/10`}>
      <div className="mx-auto max-w-7xl px-4 py-3.5 md:px-6 flex items-center justify-between">
        {/* Brand Area */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="LitasDark Home">
          <img
            src="/favicon.ico"
            alt="Litas Logo"
            className="w-8 h-8 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              LitasDark
            </span>
          </div>
        </Link>

        {/* Primary Clean Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              onHome
                ? 'text-cyan-300 font-semibold bg-white/5'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>

          <Link
            to="/tools"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              onTools
                ? 'text-cyan-300 font-semibold bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Tools
          </Link>

          <Link
            to="/privacy-architecture"
            className={`hidden sm:inline-flex px-3 py-1.5 rounded-lg transition-colors ${
              onPrivacy
                ? 'text-cyan-300 font-semibold bg-white/5'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Privacy
          </Link>

          <Link
            to="/explore"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              onExplore
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'text-slate-300 hover:text-slate-100 hover:bg-white/5 border border-white/10'
            }`}
          >
            <FlaskConical size={13} className={onExplore ? 'text-cyan-400' : 'text-indigo-400'} />
            <span>3D Labs</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
