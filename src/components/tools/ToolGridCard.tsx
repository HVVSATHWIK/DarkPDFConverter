import { useRef, useState, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ToolDefinition } from '@/config/tools';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface ToolGridCardProps {
  tool: ToolDefinition;
}

export default function ToolGridCard({ tool }: ToolGridCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <Link
      to={tool.path}
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col justify-between h-full rounded-xl border border-slate-800/90 bg-slate-900/50 p-5 sm:p-6 hover:bg-slate-900/90 hover:border-slate-700/80 transition-all duration-200 space-y-4 shadow-sm"
    >
      <div
        ref={divRef}
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 rounded-xl overflow-hidden"
        style={{
          background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, rgba(6, 182, 212, 0.08), transparent 45%)`,
        }}
      />

      <div className="space-y-3 relative z-10">
        <div className="w-10 h-10 rounded-lg bg-slate-800/90 border border-slate-700/60 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-400 transition-colors shadow-sm shrink-0">
          {tool.icon}
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors text-base">
            {tool.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs relative z-10">
        <span className="text-slate-400 font-medium text-[11px]">
          {tool.categoryLabel || 'Utility'}
        </span>
        <span className="text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-semibold text-xs">
          <span>Launch</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
