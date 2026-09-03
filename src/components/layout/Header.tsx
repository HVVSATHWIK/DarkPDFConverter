import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { BeakerIcon } from '@heroicons/react/24/outline';

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
    <header className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" />

        {/* Primary Clean Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              onHome
                ? 'text-cyan-300 font-semibold bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Home
          </Link>

          <Link
            to="/tools"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              onTools
                ? 'text-cyan-300 font-semibold bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Tools
          </Link>

          <Link
            to="/privacy-architecture"
            className={`hidden sm:inline-flex px-3 py-1.5 rounded-lg transition-colors ${
              onPrivacy
                ? 'text-cyan-300 font-semibold bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Privacy
          </Link>

          <Link
            to="/explore"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              onExplore
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900/60 border border-slate-800'
            }`}
          >
            <BeakerIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D Labs</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
