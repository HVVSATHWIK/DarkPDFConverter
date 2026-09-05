import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { CompetitorComparisonTable } from '@/components/seo/CompetitorComparisonTable';
import { SEO } from '@/components/common/SEO';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  ArrowRightIcon,
  ServerIcon,
  GlobeAltIcon,
  Square3Stack3DIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';

export default function PrivacyArchitecturePage() {
  const faqList = [
    {
      q: 'Does LitasDark upload any part of my PDF to a remote server?',
      a: 'No. All PDF processing operations execute locally in your web browser using WebAssembly and Web Workers. Your document bytes are never transmitted to or processed on a remote server.',
    },
    {
      q: 'Can I use LitasDark without an active internet connection?',
      a: 'After the application and required assets have loaded, PDF processing can occur locally without sending document data to a remote processing service.',
    },
    {
      q: 'How are temporary files cleaned up after processing?',
      a: 'Generated PDF files use temporary local blob object URLs (blob:). When processing completes or when you close or refresh the browser tab, URL.revokeObjectURL is called and in-memory references are released for browser garbage collection according to standard JavaScript runtime behavior.',
    },
    {
      q: 'Are my original PDF files modified on my hard drive?',
      a: 'No. LitasDark operates on a copy of the document bytes loaded into browser memory via the FileReader API. Your original file on disk remains completely untouched until you explicitly choose to save or overwrite it during download.',
    },
    {
      q: 'What underlying web technologies power the local PDF engine?',
      a: 'LitasDark uses standard browser APIs (FileReader, Web Workers, Canvas 2D/WebGL) alongside client-side JavaScript and compiled WebAssembly libraries (including PDF-lib and Rust WASM modules) to parse, transform, and render PDF structures.',
    },
  ];

  return (
    <div className="w-full">
      <SEO
        title="How LitasDark Processes Your PDFs Locally | Technical Architecture"
        description="LitasDark is designed so document processing happens in your browser rather than through a remote PDF processing service. Learn how WebAssembly and Web Workers keep document bytes in client memory."
        canonicalPath="/privacy-architecture"
        faqList={faqList}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12 space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { name: 'Security & Technical Architecture' },
            { name: 'Local Processing Specification' },
          ]}
        />

        {/* 1. Header Section */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              Technical Architecture Specification
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <CpuChipIcon className="w-3.5 h-3.5" />
              In-Browser WebAssembly Runtime
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-100 max-w-4xl">
            How LitasDark Processes Your PDFs Locally
          </h1>
          <p className="text-slate-300/90 max-w-3xl text-base md:text-lg leading-relaxed">
            LitasDark is designed so document processing happens in your browser rather than through a remote PDF processing service.
          </p>
        </section>

        {/* 2. Main Visual: Data Flow Diagram */}
        <section className="panel-surface p-6 md:p-8 rounded-2xl space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <Square3Stack3DIcon className="w-4 h-4" />
              <span>Data Flow Architecture</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">Local Document Execution Path</h2>
            <p className="text-xs md:text-sm text-slate-400">
              Document bytes flow exclusively through client-side browser APIs and volatile memory buffers.
            </p>
          </div>

          {/* Visual Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative pt-2">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 relative flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">01 / Input</span>
                <ComputerDesktopIcon className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Your Device</h3>
                <p className="text-xs text-slate-400 mt-1">User selects local PDF file from operating system storage.</p>
              </div>
              <div className="text-[10px] font-mono text-emerald-400/90 pt-1 border-t border-slate-800">Local File Handle</div>
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:flex items-center justify-center -mx-2 text-slate-600">
              <ArrowRightIcon className="w-5 h-5 text-cyan-500/60" />
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 relative flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">02 / Ingestion</span>
                <DocumentTextIcon className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Browser File API</h3>
                <p className="text-xs text-slate-400 mt-1">FileReader API reads binary array buffer directly into browser tab memory.</p>
              </div>
              <div className="text-[10px] font-mono text-emerald-400/90 pt-1 border-t border-slate-800">ArrayBuffer Object</div>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:flex items-center justify-center -mx-2 text-slate-600">
              <ArrowRightIcon className="w-5 h-5 text-cyan-500/60" />
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2 relative flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">03 / Execution</span>
                <CpuChipIcon className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Local Engine / WASM</h3>
                <p className="text-xs text-slate-300 mt-1">PDF-lib / compiled WebAssembly code processes bytes inside a Web Worker thread.</p>
              </div>
              <div className="text-[10px] font-mono text-cyan-300 pt-1 border-t border-cyan-500/20">Sandboxed Memory Thread</div>
            </div>

            {/* Arrow 3 */}
            <div className="hidden md:flex items-center justify-center -mx-2 text-slate-600">
              <ArrowRightIcon className="w-5 h-5 text-cyan-500/60" />
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 relative flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">04 / Buffer</span>
                <CircleStackIcon className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Browser Memory</h3>
                <p className="text-xs text-slate-400 mt-1">Transformed document structure is held in volatile Uint8Array RAM.</p>
              </div>
              <div className="text-[10px] font-mono text-indigo-400/90 pt-1 border-t border-slate-800">Volatile RAM Buffer</div>
            </div>

            {/* Arrow 4 */}
            <div className="hidden md:flex items-center justify-center -mx-2 text-slate-600">
              <ArrowRightIcon className="w-5 h-5 text-cyan-500/60" />
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 relative flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">05 / Export</span>
                <ArrowDownTrayIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Local Download</h3>
                <p className="text-xs text-slate-400 mt-1">Generated output is saved directly via a temporary browser Blob Object URL.</p>
              </div>
              <div className="text-[10px] font-mono text-emerald-400/90 pt-1 border-t border-slate-800">blob: Object URL</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Document bytes remain strictly isolated within local browser memory throughout this execution path.</span>
          </div>
        </section>

        {/* 3. Core Technical Properties (4 Cards) */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">Core Technical Properties</h2>
            <p className="text-xs md:text-sm text-slate-400">
              Factual system behavior verified by our client-side software architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="panel-surface p-5 rounded-xl space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <CpuChipIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Local Processing</h3>
              <p className="text-xs text-slate-300/80 leading-relaxed">
                PDF operations execute entirely inside the client-side web browser environment using WebAssembly and Web Workers.
              </p>
            </div>

            <div className="panel-surface p-5 rounded-xl space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <ServerIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-100">No Upload Endpoint</h3>
              <p className="text-xs text-slate-300/80 leading-relaxed">
                LitasDark does not maintain or use a server-side PDF processing endpoint for these document manipulation tools.
              </p>
            </div>

            <div className="panel-surface p-5 rounded-xl space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <ComputerDesktopIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Browser Memory</h3>
              <p className="text-xs text-slate-300/80 leading-relaxed">
                Document bytes are held in volatile browser memory (RAM) while the operation runs and during active workspace edits.
              </p>
            </div>

            <div className="panel-surface p-5 rounded-xl space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <ArrowDownTrayIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Local Download</h3>
              <p className="text-xs text-slate-300/80 leading-relaxed">
                The generated file is made available directly to the browser for saving via standard local object URLs.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Document Lifecycle */}
        <section className="panel-surface p-6 md:p-8 rounded-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">The Document Lifecycle in LitasDark</h2>
            <p className="text-xs md:text-sm text-slate-400">
              How memory allocation and handle cleanup function during each phase of execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="font-mono font-bold text-cyan-400">1. Select</div>
              <div className="font-semibold text-slate-200 text-sm">File Read</div>
              <p className="text-slate-400 leading-relaxed">File is read by the browser using the standard HTML5 File API upon user selection.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="font-mono font-bold text-cyan-400">2. Process</div>
              <div className="font-semibold text-slate-200 text-sm">WASM Worker</div>
              <p className="text-slate-400 leading-relaxed">PDF engine and WebAssembly modules operate on in-memory Uint8Array bytes inside a Web Worker.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="font-mono font-bold text-cyan-400">3. Generate</div>
              <div className="font-semibold text-slate-200 text-sm">Buffer Output</div>
              <p className="text-slate-400 leading-relaxed">Output PDF document structure is compiled locally inside client memory buffers.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="font-mono font-bold text-cyan-400">4. Save</div>
              <div className="font-semibold text-slate-200 text-sm">Local Object URL</div>
              <p className="text-slate-400 leading-relaxed">Browser receives a local object URL (blob:) to trigger standard browser file saving.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="font-mono font-bold text-emerald-400">5. Cleanup</div>
              <div className="font-semibold text-slate-200 text-sm">Garbage Collection</div>
              <p className="text-slate-400 leading-relaxed">Temporary object URLs are revoked and memory references are released according to browser GC schedules.</p>
            </div>
          </div>
        </section>

        {/* 5. What Leaves Your Device? (Table) */}
        <section className="panel-surface p-6 md:p-8 rounded-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">What Leaves Your Device?</h2>
            <p className="text-xs md:text-sm text-slate-400">
              A transparent breakdown of network activity when using LitasDark tools.
            </p>
          </div>

          {/* Explicit Summary Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
              <span className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                Document Data: Stays Local
              </span>
              <p className="text-slate-300/90 leading-relaxed">
                Your PDF bytes, file names, page text, and document metadata remain strictly in your browser RAM. They are never uploaded or transmitted to any server.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                <GlobeAltIcon className="w-4 h-4 text-cyan-400" />
                Website Resources: Downloaded Normally
              </span>
              <p className="text-slate-400 leading-relaxed">
                Standard application files (HTML, CSS, JS, and WebAssembly engine modules) are fetched from the hosting server/CDN when you load the page.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2 md:mx-0">
            <table className="w-full text-left text-xs md:text-sm border-collapse min-w-[580px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-3">Data Category</th>
                  <th className="py-3 px-3 w-48">Sent to LitasDark Servers?</th>
                  <th className="py-3 px-3">Technical Handling Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-3 font-semibold text-slate-200">PDF document bytes</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      No
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 text-xs leading-relaxed">
                    Read directly into browser RAM via FileReader API; never transmitted across any network interface.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-3 font-semibold text-slate-200">Generated PDF bytes</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      No
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 text-xs leading-relaxed">
                    Compiled directly in client memory and made available via local <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">blob:</code> URLs for direct download.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-3 font-semibold text-slate-200">Document filename</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      No
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 text-xs leading-relaxed">
                    Held in browser application React state during the active tab session; never logged remotely.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-3 font-semibold text-slate-200">Page contents &amp; text</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      No
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 text-xs leading-relaxed">
                    Maintained strictly inside browser memory buffers during Web Worker execution.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-3 font-semibold text-slate-200">Processed metadata fields</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      No
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 text-xs leading-relaxed">
                    Processed in-memory; fields stripped by the Metadata Cleaner tool are discarded locally.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-3 font-semibold text-slate-200">Website requests &amp; static assets</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      Yes (Standard Assets)
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 text-xs leading-relaxed">
                    Web application HTML, CSS, JavaScript, and WebAssembly worker modules are fetched from the hosting server/CDN when you load the page. No document content is included in asset requests.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Security Boundaries ("What local processing does not protect against") */}
        <section className="panel-surface p-6 md:p-8 rounded-2xl space-y-6 border-l-4 border-l-amber-500">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>Technical Scope &amp; Security Boundaries</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">What Local Processing Does Not Protect Against</h2>
            <p className="text-xs md:text-sm text-slate-400">
              Understanding the practical scope and environment limitations of client-side document utilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Visible Content in Documents
              </h3>
              <p className="text-slate-400 leading-relaxed">
                The local engine processes file structures and color matrices, but cannot automatically redact or obscure text or images visibly printed on PDF pages unless explicitly edited or removed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Metadata Cleaning Scope
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Metadata sanitization strips standard document property fields (such as author, title, creation date, software generator) targeted by the tool—it does not alter embedded visible text or custom third-party streams not recognized by the parser.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Browser &amp; Device Security
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Processing occurs inside your local browser environment. If the underlying operating system or web browser is infected with malware, keyloggers, or untrusted software, local processing cannot prevent unauthorized local access on your machine.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Browser Extension Environment
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Malicious or overly permissive third-party browser extensions installed in your browser may inspect DOM state, local storage, or application memory.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Security Architecture Comparison */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">Architecture Models: Client-Side vs. Server-Side</h2>
            <p className="text-xs md:text-sm text-slate-400">
              Comparing the operational mechanics of client-side WebAssembly tools with server-side cloud converters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client-Side Card */}
            <div className="panel-surface p-6 rounded-2xl space-y-4 border-t-2 border-t-emerald-400">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <CpuChipIcon className="w-5 h-5 text-emerald-400" />
                  Client-Side Model (LitasDark)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  In-Browser Execution
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Processing Location:</strong> Executed inside local browser WebAssembly &amp; Web Worker threads.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Network Transfer:</strong> Zero document bytes sent across the network.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Server Risk Vector:</strong> No remote server document storage or server retention.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Performance Driver:</strong> Bound by local device CPU and browser tab memory allocations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Offline Capability:</strong> Operates offline once web application assets are cached.</span>
                </li>
              </ul>
            </div>

            {/* Server-Side Card */}
            <div className="panel-surface p-6 rounded-2xl space-y-4 border-t-2 border-t-slate-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <GlobeAltIcon className="w-5 h-5 text-slate-400" />
                  Server-Side Model (Traditional Cloud)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  Remote Cloud Execution
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                  <span><strong>Processing Location:</strong> Executed on remote cloud server infrastructure over HTTP/HTTPS endpoints.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                  <span><strong>Network Transfer:</strong> Complete document binary uploaded over the internet for processing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                  <span><strong>Server Risk Vector:</strong> Files reside on remote cloud disk/RAM during processing window.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                  <span><strong>Performance Driver:</strong> Bound by internet upload/download speeds and remote server queues.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                  <span><strong>Offline Capability:</strong> Requires an active internet connection for every document operation.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Secondary Detailed Comparison Matrix */}
          <CompetitorComparisonTable
            title="Detailed Architectural Feature Matrix"
            subtitle="Comparing operational parameters across client-side and server-side platform models."
          />
        </section>

        {/* 8. Technical FAQ */}
        <section className="panel-surface p-6 md:p-8 rounded-2xl space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <QuestionMarkCircleIcon className="w-4 h-4" />
              <span>Technical Clarifications</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">Frequently Asked Technical Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqList.map((faq, idx) => (
              <div key={idx} className="space-y-2 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <h3 className="text-sm font-bold text-slate-200">{faq.q}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Non-Promotional CTA */}
        <section className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-100">Try a Local PDF Workflow</h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Process your documents locally in your browser memory without creating an account or sending files to a remote server.
          </p>
          <div className="pt-2">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
            >
              <span>Open PDF Tools →</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
