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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs shadow-blue-500/5">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" />

        {/* Primary Clean Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-xl transition-all ${
              onHome
                ? 'text-blue-700 font-semibold bg-blue-50 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/50'
            }`}
          >
            Home
          </Link>

          <Link
            to="/tools"
            className={`px-3 py-1.5 rounded-xl transition-all ${
              onTools
                ? 'text-blue-700 font-semibold bg-blue-50 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/50'
            }`}
          >
            Tools
          </Link>

          <Link
            to="/privacy-architecture"
            className={`hidden sm:inline-flex px-3 py-1.5 rounded-xl transition-all ${
              onPrivacy
                ? 'text-blue-700 font-semibold bg-blue-50 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/50'
            }`}
          >
            Privacy
          </Link>

          <Link
            to="/explore"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              onExplore
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 border border-blue-600'
                : 'text-blue-700 hover:bg-blue-50 border border-blue-200/80 bg-white'
            }`}
          >
            <span>3D Labs</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
