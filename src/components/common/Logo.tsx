import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showTagline = false, className = '' }: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 group select-none ${className}`}
      aria-label="LitasDark Home"
    >
      <div
        className={`${iconSizes[size]} flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/30 group-hover:shadow-md group-hover:shadow-blue-500/25 transition-all overflow-hidden shadow-xs`}
      >
        <img
          src="/favicon.ico"
          alt="LitasDark Logo"
          className="w-full h-full object-contain p-1 invert brightness-200"
        />
      </div>
      <div className="flex flex-col">
        <span
          className={`${textSizes[size]} font-extrabold tracking-tight leading-none`}
        >
          <span className="text-slate-900 group-hover:text-blue-900 transition-colors">Litas</span>
          <span className="text-blue-600 group-hover:text-blue-500 transition-colors">Dark</span>
        </span>
        {showTagline && (
          <span className="text-[10px] text-slate-500 font-medium tracking-wider mt-0.5 uppercase">
            In-Browser PDF Suite
          </span>
        )}
      </div>
    </Link>
  );
}
