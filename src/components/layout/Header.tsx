import { Link, useLocation } from 'react-router-dom';

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

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="text-sm font-semibold text-slate-200/90 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-colors"
          >
            Tools
          </Link>
          <Link
            to="/explore"
            className="text-sm font-semibold text-slate-200/90 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-colors"
          >
            Explore (3D)
          </Link>
        </nav>
      </div>
    </header>
  );
}
