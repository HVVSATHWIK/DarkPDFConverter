import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TOOL_DEFINITIONS, getToolById, type ToolDefinition } from '@/config/tools';
import ToolGridCard from '@/components/tools/ToolGridCard';
import { PrivacyBadges } from '@/components/seo/PrivacyBadges';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  BoltIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  MoonIcon,
  Square2StackIcon,
  ScissorsIcon,
} from '@heroicons/react/24/outline';

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

type ToolCategory = 'all' | 'dark-mode' | 'organize' | 'pages' | 'security' | 'convert' | 'optimize';

export default function ToolsPage() {
  const [recentIds, setRecentIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  useEffect(() => {
    setRecentIds(readRecentToolIds());
    try {
      sessionStorage.setItem('litas_last_page', '/tools');
    } catch {
      // ignore
    }
  }, []);

  const recentTools = useMemo(() => {
    const tools: ToolDefinition[] = [];
    for (const id of recentIds) {
      const tool = getToolById(id);
      if (tool) tools.push(tool);
    }
    return tools;
  }, [recentIds]);

  const filteredTools = useMemo(() => {
    return TOOL_DEFINITIONS.filter((t) => {
      // Category filter
      if (selectedCategory === 'dark-mode' && t.id !== 1) return false;
      if (selectedCategory === 'organize' && t.id !== 2 && t.id !== 3 && t.id !== 8) return false;
      if (selectedCategory === 'pages' && t.id !== 4 && t.id !== 6) return false;
      if (selectedCategory === 'security' && t.id !== 7) return false;
      if (selectedCategory === 'convert' && t.id !== 8) return false;
      if (selectedCategory === 'optimize' && t.id !== 5 && t.id !== 7) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.path.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-8">
        <Breadcrumbs
          items={[
            { name: 'Tools', path: '/tools' },
            ...(selectedCategory !== 'all'
              ? [{ name: selectedCategory.toUpperCase().replace('-', ' ') }]
              : []),
          ]}
        />

        {/* Page Header */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <WrenchScrewdriverIcon className="w-3.5 h-3.5" />
              Complete PDF Toolkit
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              100% Client-Side In-Memory
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-100">
                All <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">PDF Tools</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl mt-1">
                Fast, private document utilities powered by WebAssembly. No files are ever sent over the network.
              </p>
            </div>

            {/* Direct Quick Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link
                to="/dark-mode-pdf"
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
              >
                <MoonIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dark Mode</span>
              </Link>
              <Link
                to="/merge-pdf"
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
              >
                <Square2StackIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Merge</span>
              </Link>
              <Link
                to="/split-pdf"
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
              >
                <ScissorsIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Split</span>
              </Link>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g., dark mode, merge, split, rotate, compress)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm backdrop-blur-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                All ({TOOL_DEFINITIONS.length})
              </button>
              <button
                onClick={() => setSelectedCategory('dark-mode')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === 'dark-mode'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Dark Mode
              </button>
              <button
                onClick={() => setSelectedCategory('organize')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === 'organize'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Combine &amp; Split
              </button>
              <button
                onClick={() => setSelectedCategory('pages')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === 'pages'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Page Tools
              </button>
              <button
                onClick={() => setSelectedCategory('security')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === 'security'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Metadata &amp; Privacy
              </button>
              <button
                onClick={() => setSelectedCategory('convert')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === 'convert'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Images to PDF
              </button>
              <button
                onClick={() => setSelectedCategory('optimize')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === 'optimize'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Optimize
              </button>
            </div>
          </div>
        </section>

        {/* Recent Tools (if any and not actively searching or filtered) */}
        {!searchQuery && selectedCategory === 'all' && recentTools.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-cyan-400" />
                Recently used tools
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTools.map((tool) => (
                <ToolGridCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {/* Tools Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-200">
              {searchQuery
                ? `Results for "${searchQuery}" (${filteredTools.length})`
                : selectedCategory !== 'all'
                ? `Filtered Tools (${filteredTools.length})`
                : 'Available Tools'}
            </h2>
          </div>

          {filteredTools.length === 0 ? (
            <div className="p-10 text-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/40 space-y-2">
              <p className="text-slate-300 text-sm font-medium">No tools matched your criteria.</p>
              <p className="text-slate-400 text-xs">Try adjusting your search query or reset the filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/20"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => (
                <ToolGridCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </section>

        {/* Quick Capabilities Callouts */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/60">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <MoonIcon className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-slate-200">Smart Dark Inverter</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inverts high-contrast documents, textbooks, and code snippets into OLED Black, Slate, or Sepia without inverted image degradation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BoltIcon className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-slate-200">WASM Multi-Threading</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Processes 1,000+ page documents with multi-threaded Web Workers directly in local hardware memory with near-instant rendering.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-slate-200">Zero Cloud Transmission</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict client-side isolation ensuring compliance with GDPR, HIPAA, and corporate NDAs. No file is ever transmitted to any remote server.
            </p>
          </div>
        </section>

        {/* Privacy Badges */}
        <PrivacyBadges />
      </div>
    </div>
  );
}
