import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { PrivacyBadges } from '@/components/seo/PrivacyBadges';
import { CompetitorComparisonTable } from '@/components/seo/CompetitorComparisonTable';
import {
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function PrivacyArchitecturePage() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { name: 'Security & Compliance' },
            { name: 'Zero-Upload Architecture' },
          ]}
        />

        {/* Hero Section */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              Technical Architecture Whitepaper
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <CpuChipIcon className="w-3.5 h-3.5" />
              Rust + WebAssembly (WASM)
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-100 max-w-4xl">
            Why Zero-Upload Architecture is the Only Truly Secure Way to Process PDFs
          </h1>
          <p className="text-slate-300/85 max-w-3xl text-base md:text-lg leading-relaxed">
            Discover how LitasDark completely decouples PDF manipulation from remote cloud servers, ensuring zero external
            data transmission, fast local execution, and strict client-side document isolation.
          </p>
        </section>

        {/* Privacy Badges */}
        <PrivacyBadges />

        {/* Core Architectural Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="panel-surface p-6 rounded-2xl space-y-3 border-t-2 border-t-cyan-400">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <EyeSlashIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">1. Zero In-Transit &amp; At-Rest Cloud Data</h2>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              When you load a document into LitasDark, the binary byte array is read directly via the standard browser
              FileReader / Blob API into volatile device RAM. Not a single document byte or telemetry ping is sent across
              the network.
            </p>
          </div>

          <div className="panel-surface p-6 rounded-2xl space-y-3 border-t-2 border-t-emerald-400">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <CpuChipIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">2. Sandboxed WebAssembly Execution</h2>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              PDF parsing, byte manipulation, color matrix inversion, and cross-reference streams run within a strictly
              sandboxed WebAssembly environment. The code executes at near-native speed without browser security
              compromise.
            </p>
          </div>

          <div className="panel-surface p-6 rounded-2xl space-y-3 border-t-2 border-t-indigo-400">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <DocumentCheckIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">3. Zero Server Data Retention</h2>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Because LitasDark operates as local client-side software, we never receive, process, or retain your documents
              on remote infrastructure. This eliminates third-party data breach vectors and server storage retention risks.
            </p>
          </div>
        </section>

        {/* Detailed Comparison Table */}
        <CompetitorComparisonTable
          title="Security Architecture Comparison: LitasDark vs. Traditional Cloud PDF Converters"
          subtitle="A comprehensive breakdown of risk vectors, privacy protections, and data lifecycles."
        />

        {/* Technical Flow Diagram / Explanation */}
        <section className="panel-surface p-6 md:p-8 rounded-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">The Document Lifecycle in LitasDark</h2>
            <p className="text-xs md:text-sm text-slate-400">
              How memory allocation and data destruction work in your browser during each step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="font-bold text-cyan-400">Step 1: Ingestion</div>
              <div className="font-semibold text-slate-200">Local File Blob</div>
              <p className="text-slate-400">User selects or drops PDF. Browser opens a temporary local File Blob stream in volatile RAM.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="font-bold text-cyan-400">Step 2: Processing</div>
              <div className="font-semibold text-slate-200">WASM Worker Execution</div>
              <p className="text-slate-400">PDF-lib / WASM engine applies matrix transformations, merging, or splits in a background Web Worker.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="font-bold text-cyan-400">Step 3: Export</div>
              <div className="font-semibold text-slate-200">Direct Local Download</div>
              <p className="text-slate-400">Generated Uint8Array is downloaded directly to your disk via a local object URL.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400">Step 4: Destruction</div>
              <div className="font-semibold text-slate-200">Garbage Collection</div>
              <p className="text-slate-400">ObjectURLs are revoked and memory buffers are immediately purged by browser GC upon task completion.</p>
            </div>
          </div>
        </section>

        {/* CTA to test tools */}
        <section className="p-8 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-indigo-950/40 border border-cyan-500/30 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-100">Experience True Zero-Upload Privacy Today</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Test any tool with your most demanding or confidential documents. No login, no payments, no cloud uploads.
          </p>
          <div className="pt-2">
            <Link
              to="/dark-mode-pdf"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Launch Dark Mode Inverter</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
