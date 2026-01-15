import { useRef, useState, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ToolDefinition } from '@/config/tools';

interface ToolGridCardProps {
    tool: ToolDefinition;
}

export default function ToolGridCard({ tool }: ToolGridCardProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
        if (!divRef.current) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };


    return (
        <Link
            to={tool.path}
            onMouseMove={handleMouseMove}
            className="group relative flex h-full items-center gap-3 overflow-hidden rounded-xl border border-white/5 bg-slate-900/50 p-5 hover:bg-slate-900/80 transition-colors"
        >
            <div
                ref={divRef}
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
                }}
            />
            {/* Spotlight Border */}
            <div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(14, 165, 233, 0.3), transparent 40%)`,
                    maskImage: 'linear-gradient(black, black), linear-gradient(black, black)',
                    maskClip: 'content-box, border-box',
                    maskComposite: 'exclude',
                    padding: '1px',
                    WebkitMaskImage: 'linear-gradient(black, black), linear-gradient(black, black)',
                    WebkitMaskClip: 'content-box, border-box',
                    WebkitMaskComposite: 'xor',
                } as any}
            />

            <span className="relative z-10 text-indigo-300/80 p-2 bg-slate-800/50 rounded-lg ring-1 ring-white/10 group-hover:text-cyan-300 group-hover:bg-cyan-950/30 group-hover:ring-cyan-500/30 transition-all duration-500">
                {tool.icon}
            </span>
            <div className="relative z-10 min-w-0">
                <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {tool.name}
                </div>
                <div className="text-sm text-slate-400/70 truncate group-hover:text-slate-400 transition-colors">
                    {tool.description}
                </div>
            </div>
        </Link>
    );
}
