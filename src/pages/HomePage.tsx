import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  LockClosedIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

const FAQS = [
  {
    q: 'How does in-browser processing work without uploading files?',
    a: 'LitasDark loads a compiled WebAssembly binary into your browser once. When you open a PDF, it is parsed directly in your device’s local memory (RAM) using client-side Web Workers. Your files are never sent across the network to any server.',
  },
  {
    q: 'How do dark mode themes work on text and images?',
    a: 'The engine reads the internal PDF vector layers and color palettes, calculating luminance and selectively inverting background and text color channels while preserving embedded image colors and chart readability.',
  },
  {
    q: 'Are there any hidden file size or daily usage limits?',
    a: 'No. Because all computation runs on your local machine rather than costly cloud servers, there are no subscriptions, no file size caps, no hourly wait queues, and no account requirements.',
  },
  {
    q: 'How does LitasDark support privacy-conscious workflows?',
    a: 'Because zero bytes of document content or metadata leave your local computer, there is no external cloud transmission, helping professionals handle confidential files without third-party exposure.',
  },
  {
    q: 'Can I scrub sensitive metadata and author traces from legal documents?',
    a: 'Yes. The Cleanse Metadata tool purges author names, company network paths, creation timestamps, and hidden layer metadata locally in device RAM before saving.',
  },
  {
    q: 'How does lossless image compilation work?',
    a: 'The Images to PDF compiler embeds high-resolution PNG and JPG images directly into standardized PDF streams at native resolution without aggressive server downsampling.',
  },
];

const CORE_TOOLS = [
  {
    title: 'Dark Mode Inverter',
    desc: 'Transform blinding white documents into OLED black, slate, or sepia reading themes with smart contrast preservation.',
    icon: MoonIcon,
    path: '/dark-mode-pdf',
    spec: 'Multi-Theme Color Engine',
  },
  {
    title: 'PDF Merger',
    desc: 'Combine multiple PDF documents and chapters into a single file with preserved bookmarks and vector fidelity.',
    icon: Square2StackIcon,
    path: '/merge-pdf',
    spec: 'High-Fidelity Memory Stream',
  },
  {
    title: 'PDF Splitter',
    desc: 'Extract discrete page ranges or split large documents into separate chapters in seconds.',
    icon: ScissorsIcon,
    path: '/split-pdf',
    spec: 'Instant Range Parser',
  },
  {
    title: 'Cleanse Metadata',
    desc: 'Purge author tags, company file paths, creation timestamps, and hidden metadata before sharing.',
    icon: ShieldCheckIcon,
    path: '/cleanse-metadata',
    spec: 'Forensic Metadata Scrubber',
  },
  {
    title: 'Images to PDF',
    desc: 'Compile high-res PNG and JPG images into clean, lossless PDF documents without server downsampling.',
    icon: PhotoIcon,
    path: '/images-to-pdf',
    spec: 'Lossless Image Compiler',
  },
  {
    title: 'Document Compressor',
    desc: 'Optimize internal streams, remove redundant objects, and decrease payload sizes without server queues.',
    icon: ArchiveBoxIcon,
    path: '/compress-pdf',
    spec: 'In-Memory Stream Deflation',
  },
  {
    title: 'Page Rotator',
    desc: 'Reorient individual pages or entire documents with permanent 90°, 180°, or 270° orientation fixes.',
    icon: ArrowPathIcon,
    path: '/rotate-pdf',
    spec: 'Metadata Angle Patching',
  },
  {
    title: 'Page Extractor',
    desc: 'Select and export individual target pages into standalone clean PDF documents without quality loss.',
    icon: DocumentDuplicateIcon,
    path: '/extract-pdf',
    spec: 'Direct Stream Extraction',
  },
];

const INDUSTRIES = [
  {
    id: 'legal-professionals',
    title: 'Legal & Law Firms',
    desc: 'Confidential client document handling with strict zero-cloud exposure and metadata purging.',
    icon: ScaleIcon,
    badge: 'Confidential',
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Clinical',
    desc: 'Patient charts and clinical reports processed entirely in local browser memory.',
    icon: HeartIcon,
    badge: 'In-Browser Isolation',
  },
  {
    id: 'students-researchers',
    title: 'Academic Research',
    desc: 'Invert bright textbook PDFs for late-night study and assemble multi-part thesis files.',
    icon: AcademicCapIcon,
    badge: 'Eye Comfort',
  },
  {
    id: 'developers',
    title: 'Software Engineers',
    desc: 'Hardware-accelerated Rust/WASM toolkit running in decoupled Web Workers.',
    icon: CommandLineIcon,
    badge: 'WASM Speed',
  },
];

export default function HomePage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14 space-y-16">
        {/* Clean, Human-Crafted Hero Section */}
        <section className="max-w-4xl mx-auto text-center space-y-6 pt-2">
          {/* Engineering Metadata Banner */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs text-slate-300 bg-slate-900/80 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Client-Side In-Memory Processing</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Zero Server Uploads</span>
          </div>

          {/* Crisp, High-Contrast Typography */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Fast, private PDF tools that run entirely in your browser.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Invert colors for night reading, merge multi-part documents, scrub sensitive metadata, compile images, split, rotate, and optimize PDFs locally with zero telemetry and no server uploads.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/tools"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore All PDF Tools</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>

            <Link
              to="/dark-mode-pdf"
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <MoonIcon className="w-4 h-4 text-cyan-400" />
              <span>Dark Mode Inverter</span>
            </Link>

            <Link
              to="/cleanse-metadata"
              className="w-full sm:w-auto px-4 py-3 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
              <span>Cleanse Metadata</span>
            </Link>
          </div>
        </section>

        {/* Featured Tools Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Available Utilities</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Hardware-accelerated processing executed inside browser WebAssembly memory.
              </p>
            </div>
            <Link
              to="/tools"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>View full workspace</span>
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
                  className="p-5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 flex items-center justify-center group-hover:border-cyan-500/40 group-hover:text-cyan-300 transition-all">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {tool.spec}
                      </span>
                    </div>

                    <div>
                      <div className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors">
                        {tool.title}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-medium text-cyan-400 flex items-center gap-1 pt-2 border-t border-slate-800/60">
                    <span>Launch tool</span>
                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Technical Architecture Comparison */}
        <section className="p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
          <div className="max-w-2xl space-y-1.5">
            <span className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider">
              Local Execution Architecture
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Why In-Browser WASM is safer than cloud uploads
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Standard PDF websites upload your files to remote cloud storage. LitasDark executes locally via compiled WebAssembly with zero data transmission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Cloud Services */}
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                <LockClosedIcon className="w-4 h-4 text-rose-400" />
                <span>Traditional Cloud PDF Services</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Uploads raw document bytes to remote third-party cloud servers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Network latency, server queues, and bandwidth upload limits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Enforces daily task caps and recurring subscriptions</span>
                </li>
              </ul>
            </div>

            {/* LitasDark Architecture */}
            <div className="p-5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2 text-cyan-200 font-semibold text-sm">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                <span>LitasDark (Client-Side WASM Engine)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Computed locally in device memory using WebAssembly &amp; Web Workers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Zero network transit: confidential documents never leave your computer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Unmetered and free to use with no file size caps or subscriptions</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Industry Persona Cards */}
        <section className="space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Designed for Privacy-Sensitive Workflows
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Secure document operations aligned with confidential industry standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon;
              return (
                <Link
                  key={ind.id}
                  to={`/tools-for/${ind.id}`}
                  className="p-5 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
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

        {/* Competitor Comparison Matrix */}
        <section className="space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Feature &amp; Privacy Comparison
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              How client-side architecture compares to legacy cloud alternatives.
            </p>
          </div>
          <CompetitorComparisonTable />
        </section>

        {/* Privacy Badges */}
        <section>
          <PrivacyBadges />
        </section>

        {/* FAQ Section */}
        <section className="space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Technical specifics about our local WebAssembly engine and privacy architecture.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 text-slate-200 hover:text-white transition-colors"
                  >
                    <span className="text-sm font-semibold">{faq.q}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-400 border-t border-slate-800/60 leading-relaxed bg-slate-950/30">
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
