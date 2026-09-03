import { Link } from 'react-router-dom';
import { BookOpenIcon } from '@heroicons/react/24/outline';

interface GuideInfoButtonProps {
  to?: string;
  onClick?: () => void;
  className?: string;
  label?: string;
}

export function GuideInfoButton({
  to,
  onClick,
  className = '',
  label = 'Guide & Info →',
}: GuideInfoButtonProps) {
  const content = (
    <>
      <BookOpenIcon className="w-4 h-4 text-cyan-400 shrink-0" />
      <span>{label}</span>
    </>
  );

  const baseClasses = `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 hover:border-cyan-400 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 active:scale-95 cursor-pointer shrink-0 ${className}`;

  if (to) {
    return (
      <Link to={to} className={baseClasses} aria-label="Open Tool Guide & Technical Information">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={baseClasses}
      aria-label="Open Tool Guide & Technical Information"
    >
      {content}
    </button>
  );
}

export default GuideInfoButton;
