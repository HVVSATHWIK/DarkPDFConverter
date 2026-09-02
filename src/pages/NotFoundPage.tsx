import { Link } from 'react-router-dom';
import { HomeIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { SEO } from '@/components/common/SEO';

export default function NotFoundPage() {
  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center px-4 py-16">
      <SEO
        title="404 - Page Not Found | LitasDark"
        description="The requested page could not be found. Return to LitasDark free in-browser PDF suite."
        noindex={true}
      />
      <div className="max-w-md w-full mx-auto text-center space-y-6 bg-slate-900/60 border border-slate-800 p-8 rounded-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono text-xl font-bold">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The page you are looking for may have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/tools"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <WrenchScrewdriverIcon className="w-4 h-4" />
            <span>Browse All Tools</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
