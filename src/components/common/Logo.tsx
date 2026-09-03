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
        className={`${iconSizes[size]} flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-700/80 group-hover:border-cyan-500/50 transition-colors overflow-hidden shadow-sm`}
      >
        <img
          src="/favicon.ico"
          alt="LitasDark Logo"
          className="w-full h-full object-contain p-1"
        />
      </div>
      <div className="flex flex-col">
        <span
          className={`${textSizes[size]} font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors leading-none`}
        >
          LitasDark
        </span>
        {showTagline && (
          <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5 uppercase">
            In-Browser PDF Suite
          </span>
        )}
      </div>
    </Link>
  );
}
