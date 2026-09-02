import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import { ToolsNav } from '@/components/layout/ToolsNav';
import { PrivacyBadges } from '@/components/seo/PrivacyBadges';
import { CompetitorComparisonTable } from '@/components/seo/CompetitorComparisonTable';
import {
  ChevronDownIcon,
  ScaleIcon,
  HeartIcon,
  AcademicCapIcon,
  CommandLineIcon,
  ArrowRightIcon,
  MoonIcon,
  Square2StackIcon,
  ScissorsIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  PhotoIcon,
  CpuChipIcon,
  BoltIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

const TECHNICAL_PIPELINE = [
  {
    step: '01',
    title: 'Local Buffer Ingestion',
    tech: 'FileReader / Blob API',
    desc: 'The browser reads the raw binary byte stream into volatile client RAM. No server socket or upload payload is created.',
  },
  {
    step: '02',
    title: 'Worker Thread Isolation',
    tech: 'Dedicated Web Workers',
    desc: 'Intensive vector parsing and color transformations are offloaded from the UI main thread into background sandboxes.',
  },
  {
    step: '03',
    title: 'WASM Stream Processing',
    tech: 'WebAssembly Core',
    desc: 'Direct cross-reference stream manipulation, matrix math for luminance calculation, and PDF object rewriting at near-native speed.',
  },
  {
    step: '04',
    title: 'Instant Local Serialization',
    tech: 'Memory Blob URL',
    desc: 'The resulting PDF is compiled into a local object URL for direct browser saving. The working buffer is discarded upon session end.',
  },
];

const CORE_TOOLS = [
  {
    title: 'Dark Mode Inverter',
    desc: 'Selectively inverts background canvas and text luminescence while preserving embedded imagery and charts for comfortable night reading.',
    icon: MoonIcon,
    path: '/dark-mode-pdf',
    category: 'Visual & Reading',
    format: 'PDF → Dark PDF',
    latency: '< 300ms',
  },
  {
    title: 'Cleanse Metadata',
    desc: 'Purges author identities, editing software signatures, local network paths, and creation timestamps directly in browser RAM.',
    icon: ShieldCheckIcon,
    path: '/cleanse-metadata',
    category: 'Privacy & Security',
    format: 'PDF → Sanitized PDF',
    latency: '< 100ms',
  },
  {
    title: 'Images to PDF',
    desc: 'Embeds high-resolution PNG, JPG, and WebP images into standardized PDF streams at native dimensions with no lossy server downsampling.',
    icon: PhotoIcon,
    path: '/images-to-pdf',
    category: 'Compilation',
    format: 'PNG / JPG → PDF',
    latency: '< 500ms',
  },
  {
    title: 'PDF Merger',
    desc: 'Combines multiple PDF files, chapters, and appendices into a single contiguous document with preserved internal bookmarks and fonts.',
    icon: Square2StackIcon,
    path: '/merge-pdf',
    category: 'Structure',
    format: 'Multi-PDF → Single PDF',
    latency: '< 400ms',
  },
  {
    title: 'PDF Splitter',
    desc: 'Extracts discrete page intervals or decomposes large documents into individual target chapters in a single memory pass.',
    icon: ScissorsIcon,
    path: '/split-pdf',
    category: 'Structure',
    format: 'PDF → Page Segments',
    latency: '< 200ms',
  },
  {
    title: 'Document Compressor',
    desc: 'Optimizes internal PDF streams, removes duplicate font definitions, and deflates object tables without external queue delays.',
    icon: ArchiveBoxIcon,
    path: '/compress-pdf',
    category: 'Optimization',
    format: 'PDF → Optimized PDF',
    latency: '< 600ms',
  },
  {
    title: 'Page Rotator',
    desc: 'Applies permanent orientation corrections (90°, 180°, 270°) across specific pages or the entire document via direct metadata patching.',
    icon: ArrowPathIcon,
    path: '/rotate-pdf',
    category: 'Layout',
    format: 'PDF → Reoriented PDF',
    latency: '< 150ms',
  },
  {
    title: 'Page Extractor',
    desc: 'Selects target pages from complex multi-page files and generates an independent, standalone PDF without cross-stream artifacts.',
    icon: DocumentDuplicateIcon,
    path: '/extract-pdf',
    category: 'Structure',
    format: 'PDF → Extracted Pages',
    latency: '< 200ms',
  },
];

const ARCHITECTURAL_METRICS = [
  {
    label: 'Outbound Network Payload',
    value: '0 KB',
    sub: 'Zero document data transmitted',
    icon: ServerIcon,
  },
  {
    label: 'Execution Environment',
    value: 'Client WASM',
    sub: 'Isolated within browser RAM',
    icon: CpuChipIcon,
  },
  {
    label: 'Processing Latency',
    value: 'Sub-Second',
    sub: 'Zero cloud queue or upload wait',
    icon: BoltIcon,
  },
  {
    label: 'Document Retention',
    value: '0 Seconds',
    sub: 'Wiped when tab is closed',
    icon: ShieldCheckIcon,
  },
];

const INDUSTRIES = [
  {
    id: 'legal-professionals',
    title: 'Legal Practice & Discovery',
    desc: 'Sanitize document metadata, scrub internal drafting traces, and combine litigation exhibits without cloud repository risks.',
    icon: ScaleIcon,
    badge: 'Confidentiality',
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Clinical Records',
    desc: 'Review patient records and diagnostics with dark mode eye comfort while maintaining complete client-side data isolation.',
    icon: HeartIcon,
    badge: 'Data Isolation',
  },
  {
    id: 'students-researchers',
    title: 'Academic Research & Literature',
    desc: 'Invert bright scientific journal papers for prolonged screen reading and merge multi-chapter research dissertations locally.',
    icon: AcademicCapIcon,
    badge: 'Visual Ergonomics',
  },
  {
    id: 'developers',
    title: 'Software & Systems Engineering',
    desc: 'High-throughput local document manipulation driven by WebAssembly workers without external API keys or vendor dependencies.',
    icon: CommandLineIcon,
    badge: 'Local WASM',
  },
];

const FAQS = [
  {
    q: 'How does client-side PDF processing differ from traditional online PDF tools?',
    a: 'Traditional services transmit your document over the internet to remote servers for processing, which introduces security risks, transfer delays, and potential server-side data retention. LitasDark executes compiled WebAssembly code directly within your web browser. Your document never leaves your device.',
  },
  {
    q: 'How does the Dark Mode Inverter preserve diagrams and images?',
    a: 'The engine parses the internal vector drawing instructions and page color palettes. It calculates perceptual luminance to invert bright backgrounds and text colors to high-contrast dark tones while leaving embedded bitmap photographs, figures, and charts unaffected.',
  },
  {
    q: 'Are there any limits on file size, page count, or daily usage?',
    a: 'No artificial caps or metered usage limits are enforced. Because operations utilize your local device processing power and RAM rather than remote server resources, you can process documents freely without subscriptions, wait queues, or account registration.',
  },
  {
    q: 'What specific metadata is removed during the Cleanse Metadata operation?',
    a: 'The sanitizer parses the PDF Info dictionary and XMP metadata stream, stripping author names, creator tools, producer software version signatures, creation and modification timestamps, and hidden file path traces.',
  },
  {
    q: 'Does LitasDark require an active internet connection after loading?',
    a: 'Once the application and its WebAssembly modules are loaded in your browser cache, document manipulation operations execute entirely locally within your browser sandbox.',
  },
  {
    q: 'How does the Images to PDF compiler maintain source image quality?',
    a: 'The tool reads binary image streams directly and encapsulates them within standard PDF XObject image dictionaries at their original resolution, avoiding lossy re-encoding or cloud-side downsampling.',
  },
];

export default function HomePage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="w-full bg-[#050505] text-slate-100 min-h-screen flex flex-col">
      <SEO faqList={FAQS} />
      {/* Physically Separated Quick Tools Sub-Navbar */}
      <ToolsNav className="border-b border-white/10" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 md:px-6 space-y-20 flex-1 w-full">
        {/* Editorial Text-First Hero Section */}
        <section className="max-w-4xl mx-auto text-center space-y-6 pt-4">
          {/* Engineering Indicator Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Client-Side WebAssembly Architecture</span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400">Zero Server Data Transit</span>
          </div>

          {/* Primary Typography Hierarchy */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              In-Browser PDF Suite with Zero Server Uploads.
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
              A private, client-side toolkit for document reading and transformation. Convert PDFs to dark mode, sanitize metadata, merge, split, compress, and compile images directly inside browser RAM.
            </p>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/tools"
              className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Explore All Tools</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>

            <Link
              to="/dark-mode-pdf"
              className="px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
            >
              <MoonIcon className="w-4 h-4 text-cyan-400" />
              <span>Dark Mode Inverter</span>
            </Link>

            <Link
              to="/cleanse-metadata"
              className="px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
              <span>Cleanse Metadata</span>
            </Link>
          </div>
        </section>

        {/* Technical Architecture Metric Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {ARCHITECTURAL_METRICS.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    {metric.label}
                  </span>
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                  {metric.value}
                </div>
                <div className="text-xs text-slate-400">
                  {metric.sub}
                </div>
              </div>
            );
          })}
        </section>

        {/* Core Tool Catalog */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Functional Suite
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Available Document Utilities
              </h2>
            </div>
            <Link
              to="/tools"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>View complete directory</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CORE_TOOLS.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={idx}
                  to={tool.path}
                  className="p-5 rounded-xl bg-slate-900/30 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 flex items-center justify-center group-hover:border-cyan-500/40 group-hover:text-cyan-300 transition-all">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {tool.latency}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
                        {tool.title}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{tool.format}</span>
                    <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                      &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Text-Based Architecture Schematic Pipeline */}
        <section className="p-6 sm:p-8 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-6">
          <div className="max-w-2xl space-y-1.5">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Execution Lifecycle
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              In-Memory WebAssembly Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every operation follows a strictly localized execution model inside the user agent sandbox.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TECHNICAL_PIPELINE.map((pipe, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold">{pipe.step}</span>
                    <span className="text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
                      {pipe.tech}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {pipe.title}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {pipe.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Document bytes are held exclusively in volatile RAM and freed on demand.</span>
            </div>
            <Link
              to="/privacy-architecture"
              className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 shrink-0"
            >
              <span>Read Architecture Whitepaper</span>
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
        </section>

        {/* Structured Technical Comparison Table */}
        <section className="space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Architecture Evaluation
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Client-Side WASM vs. Remote Cloud Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              A direct comparison of operational characteristics, data boundaries, and performance.
            </p>
          </div>

          <CompetitorComparisonTable />
        </section>

        {/* Industry Workflows */}
        <section className="space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Workflows &amp; Use Cases
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Engineered for Confidential Environments
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Tailored document processing configurations for regulated and data-sensitive sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon;
              return (
                <Link
                  key={ind.id}
                  to={`/tools-for/${ind.id}`}
                  className="p-5 rounded-xl bg-slate-900/30 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/60 flex items-center justify-center group-hover:text-cyan-300 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                        {ind.badge}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {ind.title}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {ind.desc}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-medium text-slate-400 group-hover:text-cyan-400 flex items-center gap-1">
                    <span>View industry suite</span>
                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Privacy & Security Guarantees */}
        <section>
          <PrivacyBadges />
        </section>

        {/* Systematic FAQ Section */}
        <section className="space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Technical Documentation
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Specifics regarding memory limits, WebAssembly execution, and metadata sanitization.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 text-slate-200 hover:text-white transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold">{faq.q}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-400 border-t border-slate-800/60 leading-relaxed bg-slate-950/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
