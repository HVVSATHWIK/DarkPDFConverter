import { ShieldCheckIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CompetitorComparisonTableProps {
  highlightCompetitor?: 'ilovepdf' | 'smallpdf' | 'sejda' | 'all';
  title?: string;
  subtitle?: string;
}

export function CompetitorComparisonTable({
  highlightCompetitor = 'all',
  title = 'Why LitasDark Replaces Legacy Cloud PDF Tools',
  subtitle = 'Compare our zero-upload WebAssembly engine with traditional server-reliant PDF platforms.',
}: CompetitorComparisonTableProps) {
  return (
    <div className="panel-surface p-6 md:p-8 rounded-2xl space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-mono text-cyan-400 font-medium uppercase tracking-wider">
          Architecture Comparison
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
                  LitasDark (WASM)
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
                <div>Document Processing Location</div>
                <div className="text-[11px] text-slate-500">Where files are parsed and transformed</div>
              </td>
              <td className="py-3.5 px-3 bg-cyan-500/[0.06] border-x border-cyan-500/20 text-cyan-200 font-semibold">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircleIcon className="w-4 h-4 shrink-0" />
                  100% Local Browser
                </div>
                <span className="text-[11px] text-cyan-300/80 font-normal">Zero Server Uploads</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <div className="flex items-center gap-1 text-rose-400/90 font-medium">
                  <XMarkIcon className="w-4 h-4 shrink-0" />
                  Remote Cloud Servers
                </div>
                <span className="text-[11px] text-slate-500">Third-party server storage</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <div className="flex items-center gap-1 text-rose-400/90 font-medium">
                  <XMarkIcon className="w-4 h-4 shrink-0" />
                  Remote Cloud Servers
                </div>
                <span className="text-[11px] text-slate-500">Uploaded to cloud</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <div className="flex items-center gap-1 text-amber-400 font-medium">
                  Remote Cloud
                </div>
                <span className="text-[11px] text-slate-500">Desktop app requires install</span>
              </td>
            </tr>

            {/* Row 2: File Limits */}
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3.5 px-3 font-medium text-slate-200">
                <div>File Size &amp; Page Limits</div>
                <div className="text-[11px] text-slate-500">Maximum allowable document capacity</div>
              </td>
              <td className="py-3.5 px-3 bg-cyan-500/[0.06] border-x border-cyan-500/20 text-cyan-200 font-semibold">
                <div className="text-emerald-400 font-bold">Truly Unlimited</div>
                <span className="text-[11px] text-cyan-300/80 font-normal">Bounded only by device RAM</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span className="font-medium text-rose-300">Restricted</span>
                <div className="text-[11px] text-slate-500">Caps on free tier</div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span className="font-medium text-rose-300">Strict Cap</span>
                <div className="text-[11px] text-slate-500">File size locks</div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span className="font-medium text-rose-300">200 Pages / 50MB</span>
                <div className="text-[11px] text-slate-500">Hard lock per file</div>
              </td>
            </tr>

            {/* Row 3: Usage Caps */}
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3.5 px-3 font-medium text-slate-200">
                <div>Daily / Hourly Task Caps</div>
                <div className="text-[11px] text-slate-500">Frequency limits on operations</div>
              </td>
              <td className="py-3.5 px-3 bg-cyan-500/[0.06] border-x border-cyan-500/20 text-cyan-200 font-semibold">
                <div className="text-emerald-400 font-bold">Unmetered Forever</div>
                <span className="text-[11px] text-cyan-300/80 font-normal">No queues, no cooldowns</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span>Metered</span>
                <div className="text-[11px] text-slate-500">Daily action throttles</div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span className="text-rose-300 font-medium">2 Tasks / Day</span>
                <div className="text-[11px] text-slate-500">Immediate paywall prompt</div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span className="text-rose-300 font-medium">3 Tasks / Hour</span>
                <div className="text-[11px] text-slate-500">Strict hourly quota</div>
              </td>
            </tr>

            {/* Row 4: Compliance & Privacy */}
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3.5 px-3 font-medium text-slate-200">
                <div>Data Privacy Alignment</div>
                <div className="text-[11px] text-slate-500">Local isolation vs cloud server upload</div>
              </td>
              <td className="py-3.5 px-3 bg-cyan-500/[0.06] border-x border-cyan-500/20 text-cyan-200 font-semibold">
                <div className="text-emerald-400 font-bold">In-Browser Isolation</div>
                <span className="text-[11px] text-cyan-300/80 font-normal">Zero external data transmission</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span>Cloud Processing</span>
                <div className="text-[11px] text-slate-500">Transmits data to cloud servers</div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span>Cloud Processing</span>
                <div className="text-[11px] text-slate-500">Transmits data to cloud servers</div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <span>Cloud / Desktop</span>
                <div className="text-[11px] text-slate-500">Web tier processes on cloud</div>
              </td>
            </tr>

            {/* Row 5: Dark Mode PDF */}
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3.5 px-3 font-medium text-slate-200">
                <div>Smart Dark Mode Inverter</div>
                <div className="text-[11px] text-slate-500">OLED Black, Sepia &amp; eye-strain palettes</div>
              </td>
              <td className="py-3.5 px-3 bg-cyan-500/[0.06] border-x border-b border-cyan-500/20 text-cyan-200 font-semibold rounded-b-lg">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircleIcon className="w-4 h-4 shrink-0" />
                  Advanced Multi-Theme
                </div>
                <span className="text-[11px] text-cyan-300/80 font-normal">Instant export &amp; reading</span>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <div className="flex items-center gap-1 text-slate-400 font-medium">
                  <XMarkIcon className="w-4 h-4 shrink-0 text-slate-500" />
                  Not Available
                </div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <div className="flex items-center gap-1 text-slate-400 font-medium">
                  <XMarkIcon className="w-4 h-4 shrink-0 text-slate-500" />
                  Not Available
                </div>
              </td>
              <td className="py-3.5 px-3 text-slate-400">
                <div className="flex items-center gap-1 text-slate-400 font-medium">
                  Basic Grayscale only
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Nominative Fair Use Trademark Disclaimer */}
      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 leading-relaxed">
        Notice: All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with, endorsement by, or sponsorship by them. Comparisons are based on standard public feature tiers and architectural execution models.
      </div>
    </div>
  );
}
