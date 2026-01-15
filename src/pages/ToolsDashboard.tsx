import { useEffect, useMemo, useState } from 'react';

import { TOOL_DEFINITIONS, getToolById, type ToolDefinition } from '@/config/tools';
import ToolGridCard from '@/components/tools/ToolGridCard';

const RECENTS_KEY = 'litas.recentToolIds';

function readRecentToolIds(): number[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v) => typeof v === 'number');
  } catch {
    return [];
  }
}

export default function ToolsDashboard() {
  const [recentIds, setRecentIds] = useState<number[]>([]);

  useEffect(() => {
    setRecentIds(readRecentToolIds());
  }, []);

  const recentTools = useMemo(() => {
    const tools: ToolDefinition[] = [];
    for (const id of recentIds) {
      const tool = getToolById(id);
      if (tool) tools.push(tool);
    }
    return tools;
  }, [recentIds]);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-10">
        <section className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-100">
            PDF tools
          </h1>
          <p className="text-slate-300/80 max-w-2xl">
            Pick a tool and process locally in your browser.
          </p>
        </section>

        {recentTools.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">Recent tools</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTools.map((tool) => (
                <ToolGridCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">All tools</h2>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOL_DEFINITIONS.map((tool) => (
              <ToolGridCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        <section id="how-it-works" className="panel-surface p-6 space-y-2">
          <h2 className="text-lg font-semibold text-slate-200">How it works</h2>
          <p className="text-sm text-slate-300/80">
            Local processing: your PDF is handled in your browser using WebAssembly and worker threads.
            Files are not uploaded to a server; you only download the result.
          </p>
        </section>
      </div>
    </div>
  );
}
