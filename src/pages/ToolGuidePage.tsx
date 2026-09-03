import { useEffect } from 'react';
import { Link, useParams, useLocation, Navigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { getToolGuideBySlug } from '@/config/toolGuides';
import { getToolByPath } from '@/config/tools';
import ToolContentSection from '@/components/tools/ToolContentSection';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { SEO } from '@/components/common/SEO';

interface ToolGuidePageProps {
  toolSlug?: string;
}

export default function ToolGuidePage({ toolSlug: propSlug }: ToolGuidePageProps) {
  const params = useParams<{ toolSlug?: string }>();
  const location = useLocation();

  // Deduce slug from prop, param, or URL path
  let slug = propSlug || params.toolSlug;
  if (!slug) {
    // e.g. /merge-pdf/guide => merge-pdf
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[1] === 'guide') {
      slug = parts[0];
    }
  }

  const guide = slug ? getToolGuideBySlug(slug) : undefined;
  const tool = slug ? getToolByPath(`/${slug}`) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [slug, location.pathname]);

  if (!guide || !tool) {
    return <Navigate to="/tools" replace />;
  }

  const toolPath = tool.path;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col w-full">
      <SEO
        title={guide.title}
        description={guide.metaDescription}
        keywords={guide.metaKeywords}
      />

      {/* Guide Page Top Banner & Header */}
      <section className="w-full border-b border-slate-800/80 bg-slate-950/90 px-4 py-8 md:px-8 shrink-0">
        <div className="max-w-6xl mx-auto space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumbs
              items={[
                { name: 'Tools', path: '/tools' },
                { name: tool.name, path: toolPath },
                { name: 'Guide' },
              ]}
            />
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full font-semibold">
                <ShieldCheckIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero Server Uploads</span>
              </div>
              <Link
                to={toolPath}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
              >
                <ArrowLeftIcon className="w-4 h-4 shrink-0" />
                <span>Back to {tool.name}</span>
              </Link>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800/60">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <BookOpenIcon className="w-4 h-4" />
              <span>How {tool.name} Works</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {guide.h1}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              {guide.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Dedicated Documentation Body */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
        <ToolContentSection guide={guide} toolPath={toolPath} toolName={tool.name} />
      </main>
    </div>
  );
}
