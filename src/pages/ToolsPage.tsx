import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TOOL_DEFINITIONS, type ToolDefinition } from '@/config/tools';
import ToolGridCard from '@/components/tools/ToolGridCard';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { SEO } from '@/components/common/SEO';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type CategoryFilter = 'all' | 'convert' | 'organize' | 'edit' | 'security';

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'convert', label: 'Convert' },
  { id: 'organize', label: 'Organize' },
  { id: 'edit', label: 'Edit' },
  { id: 'security', label: 'Security & Privacy' },
];

export default function ToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const filteredTools = useMemo(() => {
    return TOOL_DEFINITIONS.filter((tool: ToolDefinition) => {
      // Category match
      if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
        return false;
      }

      // Search query match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        tool.name.toLowerCase().includes(q) ||
        (tool.description && tool.description.toLowerCase().includes(q)) ||
        tool.path.toLowerCase().includes(q) ||
        (tool.categoryLabel && tool.categoryLabel.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full min-h-screen bg-transparent text-slate-100 flex flex-col font-sans">
      <SEO
        title="PDF Tools Directory - Complete Suite | LitasDark"
        description="Browse all 8 browser-based, client-side PDF tools. Invert dark mode, merge, split, rotate, compress, extract pages, cleanse metadata, and convert images locally."
      />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8 space-y-6 sm:space-y-8 flex-1 w-full pb-12 md:pb-16">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: 'Tools', path: '/tools' }]} />

        {/* Page Introduction */}
        <div className="space-y-2 pt-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            All PDF Tools
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Free PDF utilities that run directly in your browser. Choose a tool to get started.
          </p>
        </div>

        {/* Search & Category Filtering Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-1">
          {/* Search Input */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by tool name or task..."
              className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-2 px-2 py-0.5 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 shrink-0">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool Directory Grid */}
        <section className="space-y-4 pt-1">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-xs font-medium text-slate-400">
              {searchQuery
                ? `Results for "${searchQuery}" (${filteredTools.length})`
                : selectedCategory !== 'all'
                ? `${CATEGORIES.find((c) => c.id === selectedCategory)?.label} tools (${filteredTools.length})`
                : `${filteredTools.length} tools available`}
            </span>
          </div>

          {filteredTools.length === 0 ? (
            <div className="py-12 px-6 text-center rounded-xl border border-dashed border-slate-800/80 bg-slate-900/20 space-y-3">
              <h3 className="text-base font-bold text-slate-200">No PDF tools found</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Try another search term or browse all tools.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSearchParams({}, { replace: true });
                }}
                className="mt-1 inline-flex items-center px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTools.map((tool) => (
                <ToolGridCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
