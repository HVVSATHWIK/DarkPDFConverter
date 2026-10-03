import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';

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
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 shadow-md shadow-black/20">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" />

        {/* Primary Clean Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-xl transition-all ${
              onHome
                ? 'text-cyan-300 font-semibold bg-cyan-950/60 border border-cyan-800/60 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Home
          </Link>

          <Link
            to="/tools"
            className={`px-3 py-1.5 rounded-xl transition-all ${
              onTools
                ? 'text-cyan-300 font-semibold bg-cyan-950/60 border border-cyan-800/60 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Tools
          </Link>

          <Link
            to="/privacy-architecture"
            className={`hidden sm:inline-flex px-3 py-1.5 rounded-xl transition-all ${
              onPrivacy
                ? 'text-cyan-300 font-semibold bg-cyan-950/60 border border-cyan-800/60 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Privacy
          </Link>

          <Link
            to="/explore"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              onExplore
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/25 border border-cyan-400 font-bold'
                : 'text-cyan-400 hover:text-white hover:bg-slate-900/80 border border-cyan-500/30 bg-slate-950/60'
            }`}
          >
            <span>3D Labs</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
