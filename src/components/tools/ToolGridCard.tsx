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

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col justify-between h-full rounded-2xl border border-blue-900/40 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 p-5 sm:p-6 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-200 shadow-sm"
    >
      {/* Dynamic Cursor Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 rounded-2xl overflow-hidden"
        style={{
          background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, rgba(56, 189, 248, 0.09), transparent 50%)`,
        }}
      />

      <div className="space-y-4 relative z-10 flex-1 flex flex-col">
        {/* Clickable Header Area */}
        <Link
          to={tool.path}
          className="flex items-start justify-between gap-3 group/link focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-950/80 border border-blue-500/30 text-cyan-400 flex items-center justify-center group-hover/link:bg-blue-600 group-hover/link:text-white group-hover/link:border-blue-400 transition-all duration-200 shadow-sm shrink-0">
            {tool.icon}
          </div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-300/80 bg-blue-950/50 px-2.5 py-0.5 rounded border border-blue-800/40">
            {tool.categoryLabel || 'Utility'}
          </span>
        </Link>

        {/* Title and Short Description */}
        <div className="space-y-1.5 flex-1">
          <Link
            to={tool.path}
            className="block font-bold text-white group-hover:text-blue-300 transition-colors text-lg tracking-tight focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded"
          >
            {tool.name}
          </Link>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Launch Action Footer */}
      <div className="pt-3.5 mt-4 border-t border-blue-900/30 flex items-center justify-between text-xs relative z-10">
        <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Zero-Upload Secure</span>
        </span>
        <Link
          to={tool.path}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-cyan-300 hover:text-white border border-blue-500/30 hover:border-blue-400 transition-all font-semibold text-xs shadow-sm active:scale-95"
        >
          <span>Launch Tool</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
