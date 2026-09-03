import { ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface CompetitorComparisonTableProps {
  highlightCompetitor?: 'ilovepdf' | 'smallpdf' | 'sejda' | 'all';
  title?: string;
  subtitle?: string;
}

export function CompetitorComparisonTable({
  highlightCompetitor = 'all',
  title = 'Processing Architecture Comparison',
  subtitle = 'Comparing client-side WebAssembly execution with traditional server-side processing models.',
}: CompetitorComparisonTableProps) {
  return (
    <div className="panel-surface p-6 md:p-8 rounded-2xl space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-mono text-cyan-400 font-medium uppercase tracking-wider">
          Architectural Models
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-400">{subtitle}</p>
      </div>

      <div className="overflow-x-auto -mx-2 md:mx-0">
        <table className="w-full text-left text-xs md:text-sm border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="py-3.5 px-3">Architectural Feature</th>
              <th className="py-3.5 px-3 bg-cyan-500/10 text-cyan-300 font-bold rounded-t-lg border-x border-t border-cyan-500/30">
                <span className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-4 h-4 text-cyan-400" />
                  LitasDark (Client WASM)
                </span>
              </th>
              <th className={`py-3.5 px-3 ${highlightCompetitor === 'ilovepdf' ? 'text-amber-300 font-semibold' : ''}`}>
                iLovePDF
              </th>
              <th className={`py-3.5 px-3 ${highlightCompetitor === 'smallpdf' ? 'text-amber-300 font-semibold' : ''}`}>
                Smallpdf
              </th>
              <th className={`py-3.5 px-3 ${highlightCompetitor === 'sejda' ? 'text-amber-300 font-semibold' : ''}`}>
                Sejda
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {/* Row 1: Processing Location */}
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3.5 px-3 font-medium text-slate-200">
                <div>Processing Location</div>
                <div className="text-[11px] text-slate-500">Where file bytes are transformed</div>
              </td>
              <td className="py-3.5 px-3 bg-cyan-500/[0.06] border-x border-cyan-500/20 text-cyan-200 font-semibold">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircleIcon className="w-4 h-4 shrink-0" />
                  Client-Side Browser
                </div>
                <span className="text-[11px] text-cyan-300/80 font-normal">Executes in local memory</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <div className="font-medium text-slate-300">Server Infrastructure</div>
                <span className="text-[11px] text-slate-500">Remote web processing</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <div className="font-medium text-slate-300">Server Infrastructure</div>
                <span className="text-[11px] text-slate-500">Remote web processing</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <div className="font-medium text-slate-300">Server / Desktop</div>
                <span className="text-[11px] text-slate-500">Web tier processes on cloud</span>
              </td>
            </tr>

            {/* Row 2: Capacity Model */}
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3.5 px-3 font-medium text-slate-200">
                <div>Document Capacity Model</div>
                <div className="text-[11px] text-slate-500">Execution size boundary</div>
              </td>
              <td className="py-3.5 px-3 bg-cyan-500/[0.06] border-x border-cyan-500/20 text-cyan-200 font-semibold">
                <div className="text-emerald-400 font-bold">Local RAM Allocated</div>
                <span className="text-[11px] text-cyan-300/80 font-normal">Bounded by browser tab memory</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span className="font-medium text-slate-300">Server Tier Quotas</span>
                <div className="text-[11px] text-slate-500">Free tier upload caps</div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span className="font-medium text-slate-300">Server Tier Quotas</span>
                <div className="text-[11px] text-slate-500">Free tier file size caps</div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span className="font-medium text-slate-300">200 Pages / 50MB</span>
                <div className="text-[11px] text-slate-500">Web tier document limit</div>
              </td>
            </tr>

            {/* Row 3: Network Requirement */}
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3.5 px-3 font-medium text-slate-200">
                <div>Network Dependency</div>
                <div className="text-[11px] text-slate-500">Active connection requirement during processing</div>
              </td>
              <td className="py-3.5 px-3 bg-cyan-500/[0.06] border-x border-cyan-500/20 text-cyan-200 font-semibold">
                <div className="text-emerald-400 font-bold">Offline-Capable</div>
                <span className="text-[11px] text-cyan-300/80 font-normal">Runs offline after page load</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span>Active Connection</span>
                <div className="text-[11px] text-slate-500">Requires upload connection</div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span>Active Connection</span>
                <div className="text-[11px] text-slate-500">Requires upload connection</div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span>Active Connection</span>
                <div className="text-[11px] text-slate-500">Web tier requires connection</div>
              </td>
            </tr>

            {/* Row 4: Data Boundary */}
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3.5 px-3 font-medium text-slate-200">
                <div>Document Byte Isolation</div>
                <div className="text-[11px] text-slate-500">Where binary document data travels</div>
              </td>
              <td className="py-3.5 px-3 bg-cyan-500/[0.06] border-x border-b border-cyan-500/20 text-cyan-200 font-semibold rounded-b-lg">
                <div className="text-emerald-400 font-bold">In-Browser Isolation</div>
                <span className="text-[11px] text-cyan-300/80 font-normal">Document bytes stay in local RAM</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span>Server Endpoint Ingestion</span>
                <div className="text-[11px] text-slate-500">Processed on remote servers</div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span>Server Endpoint Ingestion</span>
                <div className="text-[11px] text-slate-500">Processed on remote servers</div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span>Server Endpoint Ingestion</span>
                <div className="text-[11px] text-slate-500">Web tier processes on server</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Fair Use Disclaimer */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 leading-relaxed">
        Notice: All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with, endorsement by, or sponsorship by them. Comparisons reflect public architectural models and execution tiers.
      </div>
    </div>
  );
}

