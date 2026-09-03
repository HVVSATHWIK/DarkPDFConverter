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

// The 4 Distinctive Featured Tools
const FEATURED_TOOLS = [
  {
    id: 'dark-mode',
    title: 'Dark Mode PDF',
    desc: 'Inverts bright white PDF pages into eye-friendly dark, OLED black, or sepia themes for comfortable night reading.',
    icon: MoonIcon,
    path: '/dark-mode-pdf',
    badge: 'Popular',
  },
  {
    id: 'merge',
    title: 'Merge PDFs',
    desc: 'Combines multiple PDF files into a single ordered document locally in browser memory.',
    icon: Square2StackIcon,
    path: '/merge-pdf',
    badge: 'Multi-File',
  },
  {
    id: 'cleanse',
    title: 'Cleanse Metadata',
    desc: 'Removes hidden author names, timestamps, software signatures, and local file paths from PDF properties.',
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
    q: 'Are my PDF files uploaded to a server?',
    a: 'No. PDF processing takes place locally in your browser using JavaScript and WebAssembly. The application does not send your PDF contents to a server or remote PDF-processing service.',
  },
  {
    q: 'What PDF tools are available on LitasDark?',
    a: 'LitasDark currently provides 8 browser-based PDF tools: Dark Mode PDF, Merge PDFs, Split PDF, Rotate PDF, Extract Pages, Optimize PDF, Images to PDF, and Cleanse Metadata.',
  },
  {
    q: 'Is LitasDark private when processing PDFs?',
    a: 'Yes. PDF processing happens locally in your browser, so your document contents do not need to be uploaded to a remote PDF-processing service.',
  },
  {
    q: 'Are there any file-size or usage limits?',
    a: 'LitasDark does not currently enforce a fixed file-size, page-count, or usage quota. However, very large or complex PDFs may require substantial memory and processing power from your device.',
  },
  {
    q: 'What does Cleanse Metadata remove?',
    a: 'Cleanse Metadata clears or resets standard PDF document information such as Title, Author, Subject, Keywords, Creation Date, and Modification Date. The resulting document also identifies LitasDark as the Creator and Producer. It does not claim to remove every possible type of embedded PDF data.',
  },
  {
    q: 'Can I use LitasDark without an internet connection?',
    a: 'After the website and required tool assets have loaded, PDF processing itself runs locally in your browser and does not require an internet connection. However, LitasDark currently does not use a service worker for offline caching, so you need an internet connection to initially open or reload the website.',
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
    <div className="w-full bg-transparent text-slate-100 min-h-screen flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <SEO faqList={FAQS} />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 space-y-10 sm:space-y-14 flex-1 w-full">
        
        {/* ==================================================================== */}
        {/* 1. HERO SECTION                                                     */}
        {/* ==================================================================== */}
        <section className="pt-2 sm:pt-4 space-y-5 max-w-3xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-slate-900/90 border border-slate-800 text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-300 font-semibold">Client-Side Browser Processing</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">Zero Server Uploads</span>
          </div>

          {/* Headline & Supporting Explanation */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Private PDF Tools That Run in Your Browser.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Invert PDFs to dark mode, cleanse metadata, merge, split, compress, and convert images locally in browser RAM with zero file transmission.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
            <Link
              to="/tools"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]"
            >
              <span>Explore All Tools</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <a
              href="#privacy-panel"
              className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium transition-colors flex items-center gap-2"
            >
              <LockClosedIcon className="w-4 h-4 text-cyan-400" />
              <span>How Privacy Works</span>
            </a>
          </div>

          {/* Supporting Discovery Search */}
          <div className="pt-2 max-w-lg mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search PDF tools (e.g. dark mode, merge, split)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2 rounded-xl bg-slate-900/70 border border-slate-800/80 text-slate-200 placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 2. FEATURED TOOLS (MAIN PRODUCT MOMENT)                               */}
        {/* ==================================================================== */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Featured Tools
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Core client-side PDF capabilities</p>
            </div>
            <Link
              to="/tools"
              className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors group"
            >
              <span>View all 8 tools</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 4 Distinctive Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
            {FEATURED_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 hover:from-slate-900 hover:to-slate-900/80 border border-slate-800/90 hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between space-y-5 group relative shadow-md hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] h-full"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-400 transition-all duration-200 shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                        {tool.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400 font-medium text-[11px]">In-Browser</span>
                    <span className="text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Launch</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Directory Callout */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-300">
            <span>Looking for Split PDF, Rotate, Compress, or Extract Pages?</span>
            <Link
              to="/tools"
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>View All 8 Tools →</span>
            </Link>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 3. WHY LITASDARK (HORIZONTAL VALUE PROPOSITION STRIP)                */}
        {/* ==================================================================== */}
        <section className="space-y-4 pt-2">
          <div className="border-b border-slate-800/80 pb-2.5">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Why LitasDark
            </h2>
          </div>

          {/* Horizontal 3-Part Value Strip - Distinct composition */}
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
            {WHY_LITASDARK.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`space-y-2 ${idx > 0 ? 'pt-4 md:pt-0 md:pl-6' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-10">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 4. HOW IT WORKS (SIMPLE PROCESS TIMELINE)                            */}
        {/* ==================================================================== */}
        <section id="how-it-works" className="p-6 sm:p-7 rounded-2xl bg-slate-900/20 border border-slate-800/80 space-y-6 scroll-mt-16">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                How It Works
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">3 simple steps executed locally</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
              WebAssembly Powered
            </span>
          </div>

          {/* Timeline Layout */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Connecting horizontal rail for desktop */}
            <div className="hidden md:block absolute top-5 left-16 right-16 h-0.5 bg-slate-800 z-0" />

            {SIMPLE_STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="relative z-10 space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 font-mono font-extrabold flex items-center justify-center text-xs shadow-sm">
                      {s.step}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 5. PRIVACY SECTION (PRIMARY TECHNICAL EXPLANATION)                   */}
        {/* ==================================================================== */}
        <section id="privacy-panel" className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-slate-950 border border-slate-800 space-y-4 scroll-mt-16 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <ShieldExclamationIcon className="w-6 h-6 text-emerald-400 shrink-0" />
                <h2 className="text-xl font-bold text-white">
                  Client-Side Privacy Architecture
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                LitasDark is built on a strict zero-upload privacy model. Your files are processed locally inside browser RAM via WebAssembly without remote transmission or cloud storage.
              </p>
            </div>

            <Link
              to="/privacy-architecture"
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-700/80 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shrink-0 shadow-sm"
            >
              <span>Read Privacy Architecture</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 6. TAILORED WORKFLOWS (COMPACT USE CASES)                            */}
        {/* ==================================================================== */}
        <section className="space-y-3 pt-2">
          <div className="border-b border-slate-800/80 pb-2">
            <h2 className="text-base font-bold text-slate-200 tracking-tight">
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
                  className="p-3.5 rounded-xl bg-slate-900/20 hover:bg-slate-900/60 border border-slate-800/60 transition-colors flex flex-col justify-between space-y-2 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center group-hover:text-cyan-300 transition-colors shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                        {ind.title}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                      {ind.desc}
                    </p>
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
        <section className="space-y-4 pt-2 border-t border-slate-800/80" aria-labelledby="faq-heading">
          <div className="border-b border-slate-800/80 pb-2.5">
            <h2 id="faq-heading" className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              const buttonId = `faq-button-${idx}`;
              const contentId = `faq-content-${idx}`;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/20 overflow-hidden transition-colors"
                >
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-4 text-slate-200 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-xl"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                  >
                    <span className="text-xs sm:text-sm font-semibold">{faq.q}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={contentId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="px-3.5 pb-3.5 pt-1 text-xs text-slate-400 border-t border-slate-800/60 leading-relaxed bg-slate-950/60"
                    >
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
