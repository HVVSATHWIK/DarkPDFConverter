import { Link, useLocation } from 'react-router-dom';
import { TOOL_DEFINITIONS } from '@/config/tools';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface ToolsNavProps {
  className?: string;
  showCategory?: boolean;
}

export function ToolsNav({
  className = '',
  showCategory = false,
}: ToolsNavProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav
      className={`w-full bg-[#080808]/90 backdrop-blur-md border-y border-white/5 py-2.5 px-4 ${className}`}
      aria-label="PDF Tools Quick Navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Section Label / Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-400 shrink-0 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Quick Suite</span>
        </div>

        {/* Scrollable Tool Chips */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {TOOL_DEFINITIONS.map((tool) => {
            const isSelected =
              currentPath === tool.path ||
              (tool.name === 'Dark Mode' && currentPath.startsWith('/dark-mode')) ||
              (tool.name === 'Merge PDFs' && currentPath.startsWith('/merge')) ||
              (tool.name === 'Split PDF' && currentPath.startsWith('/split')) ||
              (tool.name === 'Rotate PDF' && currentPath.startsWith('/rotate')) ||
              (tool.name === 'Optimize PDF' && (currentPath.startsWith('/optimize') || currentPath.startsWith('/compress'))) ||
              (tool.name === 'Extract Pages' && currentPath.startsWith('/extract')) ||
              (tool.name === 'Cleanse Metadata' && currentPath.startsWith('/cleanse')) ||
              (tool.name === 'Images to PDF' && currentPath.startsWith('/images'));

            return (
              <Link
                key={tool.id}
                to={tool.path}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold'
                    : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 flex items-center justify-center transition-colors ${
                    isSelected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                  }`}
                >
                  {tool.icon}
                </span>
                <span>{tool.name}</span>
                {showCategory && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    {tool.id === 1 ? 'Visual' : tool.id === 7 ? 'Security' : 'Structure'}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Explore All link */}
        <Link
          to="/tools"
          className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors shrink-0 whitespace-nowrap"
        >
          <span>All 8 Tools</span>
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    </nav>
  );
}

export default ToolsNav;
