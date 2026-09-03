import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import {
  ChevronDownIcon,
  ScaleIcon,
  HeartIcon,
  AcademicCapIcon,
  CommandLineIcon,
  ArrowRightIcon,
  MoonIcon,
  Square2StackIcon,
  ShieldCheckIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  BoltIcon,
  SparklesIcon,
  FolderOpenIcon,
  CpuChipIcon,
  ArrowDownTrayIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

// Curated 4 Featured Tools (NOT all 8)
const FEATURED_TOOLS = [
  {
    id: 'dark-mode',
    title: 'Dark Mode PDF',
    desc: 'Inverts bright PDF pages to a comfortable dark theme for eye-safe night reading.',
    icon: MoonIcon,
    path: '/dark-mode-pdf',
    badge: 'Popular',
  },
  {
    id: 'merge',
    title: 'Merge PDFs',
    desc: 'Combines multiple PDF files into a single ordered document without size caps.',
    icon: Square2StackIcon,
    path: '/merge-pdf',
    badge: 'Multi-File',
  },
  {
    id: 'cleanse',
    title: 'Cleanse Metadata',
    desc: 'Removes hidden author names, timestamps, software signatures, and local file paths.',
    icon: ShieldCheckIcon,
    path: '/cleanse-metadata',
    badge: 'Security',
  },
  {
    id: 'images-to-pdf',
    title: 'Images to PDF',
    desc: 'Compiles PNG, JPG, and WebP images into standardized PDF documents directly in your browser.',
    icon: PhotoIcon,
    path: '/images-to-pdf',
    badge: 'Conversion',
  },
];

const WHY_LITASDARK = [
  {
    title: 'Private',
    desc: 'Files stay in your browser. Documents are processed locally in volatile RAM and never uploaded to remote servers.',
    icon: LockClosedIcon,
  },
  {
    title: 'Fast',
    desc: 'Processing happens locally on your device hardware with zero network transmission or remote server wait queues.',
    icon: BoltIcon,
  },
  {
    title: 'Simple',
    desc: 'No account registration or subscription workflow required. Open any tool, choose your file, and process immediately.',
    icon: SparklesIcon,
  },
];

const SIMPLE_STEPS = [
  {
    step: '01',
    title: 'Select',
    desc: 'Choose or drop any PDF document directly from your local device.',
    icon: FolderOpenIcon,
  },
  {
    step: '02',
    title: 'Process',
    desc: 'In-browser engine transforms document bytes locally in volatile RAM.',
    icon: CpuChipIcon,
  },
  {
    step: '03',
    title: 'Download',
    desc: 'Save your transformed PDF immediately back to local disk storage.',
    icon: ArrowDownTrayIcon,
  },
];

const USE_CASES = [
  {
    id: 'legal-professionals',
    title: 'Legal Practice',
    desc: 'Cleanse metadata and combine litigation exhibits locally without cloud transmission security risks.',
    icon: ScaleIcon,
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Records',
    desc: 'Review medical documents in dark mode with local browser processing designed for privacy-sensitive workflows.',
    icon: HeartIcon,
  },
  {
    id: 'students-researchers',
    title: 'Academic Research',
    desc: 'Invert bright scientific papers for night reading and merge multi-chapter research dissertations.',
    icon: AcademicCapIcon,
  },
  {
    id: 'developers',
    title: 'Software Engineering',
    desc: 'High-speed local document manipulation powered by WebAssembly without API keys or cloud usage fees.',
    icon: CommandLineIcon,
  },
];

const FAQS = [
  {
    q: 'How does client-side PDF processing differ from traditional online PDF tools?',
    a: 'Traditional online tools upload your document over the internet to remote servers for processing, creating transfer delays and potential privacy risks. LitasDark executes compiled WebAssembly code directly inside your web browser. Your document never leaves your device memory.',
  },
  {
    q: 'Where are all 8 PDF tools located?',
    a: 'You can access the full suite of all 8 tools — including Split PDF, Rotate PDF, Optimize PDF, and Extract Pages — directly in our complete PDF Tools directory at /tools.',
  },
  {
    q: 'How does the Dark Mode PDF Inverter preserve diagrams and images?',
    a: 'The engine parses internal vector drawing instructions and page color palettes. It calculates perceptual luminance to invert bright backgrounds and text colors to dark tones while keeping embedded bitmap photos, figures, and charts clear.',
  },
  {
    q: 'Are there any file size or usage limits?',
    a: 'No artificial limits or metered quotas are enforced. Processing relies on your local device RAM and browser capabilities rather than remote server caps.',
  },
  {
    q: 'What metadata is removed during the Cleanse Metadata operation?',
    a: 'The sanitizer parses the PDF Info dictionary and XMP metadata stream, stripping author names, creator software signatures, creation and editing timestamps, and hidden local file paths.',
  },
  {
    q: 'Does LitasDark work without an active internet connection?',
    a: 'Yes. Once the web application and its WebAssembly modules are loaded in your browser cache, document manipulation operations execute completely offline.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tools?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/tools');
    }
  };

  return (
    <div className="w-full bg-[#050811] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <SEO faqList={FAQS} />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 space-y-12 sm:space-y-16 flex-1 w-full">
        
        {/* ==================================================================== */}
        {/* 1. HERO SECTION                                                     */}
        {/* ==================================================================== */}
        <section className="pt-4 sm:pt-6 space-y-5 max-w-3xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-300 font-semibold">Client-Side Browser Processing</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">Zero Server Uploads</span>
          </div>

          {/* Headline & Concise Subtitle */}
          <div className="space-y-2.5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Private PDF Tools That Run in Your Browser.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Invert PDFs to dark mode, cleanse metadata, merge, split, compress, and convert images locally in browser RAM with zero file transmission.
            </p>
          </div>

          {/* Search Box & Action CTAs */}
          <div className="pt-2 max-w-xl mx-auto space-y-3.5">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search PDF tools directory (e.g. dark mode, merge, split)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex items-center justify-center gap-3 text-xs sm:text-sm">
              <Link
                to="/tools"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <span>Explore All Tools</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium transition-colors flex items-center gap-1.5"
              >
                <LockClosedIcon className="w-4 h-4 text-cyan-400" />
                <span>How Privacy Works</span>
              </a>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 2. CURATED FEATURED TOOLS (4 DISTINCTIVE TOOLS ONLY)                 */}
        {/* ==================================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Featured Tools
            </h2>
            <Link
              to="/tools"
              className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>View all 8 tools</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Distinct Featured Tool Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="p-5 rounded-xl bg-slate-900/40 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] h-full"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/60 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-400 transition-colors shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {tool.badge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400 font-normal text-[11px]">In-Browser</span>
                    <span className="text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Launch</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Directory Navigation CTA */}
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-300">
            <span>Looking for Split PDF, Rotate, Compress, or Extract Pages?</span>
            <Link
              to="/tools"
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>View All 8 Tools →</span>
            </Link>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 3. WHY LITASDARK (CONCISE 3-COLUMN USER BENEFIT)                     */}
        {/* ==================================================================== */}
        <section className="space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Why LitasDark
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WHY_LITASDARK.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-slate-900/30 border border-slate-800 space-y-2.5"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700/60 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 4. HOW IT WORKS (SIMPLE 3-STEP VISUAL WORKFLOW)                      */}
        {/* ==================================================================== */}
        <section id="how-it-works" className="p-5 sm:p-6 rounded-xl bg-slate-900/30 border border-slate-800 space-y-4 scroll-mt-16">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              How It Works
            </h2>
            <span className="text-xs text-slate-400 font-mono">3 Simple Steps</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SIMPLE_STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold flex items-center justify-center text-xs">
                      {s.step}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 5. PRIVACY SECTION                                                   */}
        {/* ==================================================================== */}
        <section className="p-5 sm:p-6 rounded-xl bg-slate-900/20 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldExclamationIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                <h2 className="text-lg font-bold text-white">
                  Client-Side Privacy Architecture
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                LitasDark is built on a strict zero-upload privacy model. Your files are processed locally inside browser RAM via WebAssembly without remote transmission or cloud storage.
              </p>
            </div>

            <Link
              to="/privacy-architecture"
              className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800 font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Read Privacy Architecture</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 6. SUPPORTING USE CASES                                              */}
        {/* ==================================================================== */}
        <section className="space-y-3 pt-2">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Tailored Workflows
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {USE_CASES.map((ind) => {
              const Icon = ind.icon;
              return (
                <Link
                  key={ind.id}
                  to={`/tools-for/${ind.id}`}
                  className="p-3.5 rounded-xl bg-slate-900/20 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div className="space-y-1.5">
                    <div className="w-7 h-7 rounded bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center justify-center group-hover:text-cyan-300 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                        {ind.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-normal line-clamp-2">
                        {ind.desc}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] font-medium text-slate-400 group-hover:text-cyan-400 flex items-center gap-1">
                    <span>Explore workflows</span>
                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 7. FAQ ACCORDION                                                     */}
        {/* ==================================================================== */}
        <section className="space-y-4 pt-4 border-t border-slate-800">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-4 text-slate-200 hover:text-white transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs sm:text-sm font-semibold">{faq.q}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-400 border-t border-slate-800/60 leading-relaxed bg-slate-950/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
