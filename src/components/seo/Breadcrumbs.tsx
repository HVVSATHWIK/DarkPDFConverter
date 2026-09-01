import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  name: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-400 space-x-1.5 overflow-x-auto py-1">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-slate-200 transition-colors shrink-0"
        title="LitasDark Home"
      >
        <HomeIcon className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center space-x-1.5 shrink-0">
            <ChevronRightIcon className="w-3 h-3 text-slate-600" />
            {isLast || !item.path ? (
              <span className="font-semibold text-cyan-400 truncate max-w-[200px]" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link to={item.path} className="hover:text-slate-200 transition-colors">
                {item.name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
