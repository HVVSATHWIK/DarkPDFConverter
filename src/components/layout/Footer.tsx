import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { useReportBug } from '@/context/ReportBugContext';

export function Footer() {
  const { openModal } = useReportBug();
  return (
    <footer className="w-full border-t border-blue-100 bg-white/95 backdrop-blur-md relative z-20 text-xs text-slate-500 mt-auto shadow-xs">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 space-y-3">
            <Logo size="sm" />
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Private, in-browser PDF suite powered by WebAssembly. No server uploads, zero remote data storage, and unmetered document tools.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                In-Browser Privacy
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Client-Side WASM
              </span>
            </div>
          </div>

          {/* Tools Col */}
          <div className="space-y-2.5">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Core Tools</div>
            <ul className="space-y-1.5">
              <li>
                <Link to="/tools" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  All PDF Tools Suite →
                </Link>
              </li>
              <li>
                <Link to="/dark-mode-pdf" className="hover:text-blue-600 transition-colors">
                  Dark Mode PDF
                </Link>
              </li>
              <li>
                <Link to="/cleanse-metadata" className="hover:text-blue-600 transition-colors">
                  Cleanse Metadata
                </Link>
              </li>
              <li>
                <Link to="/images-to-pdf" className="hover:text-blue-600 transition-colors">
                  Images to PDF
                </Link>
              </li>
              <li>
                <Link to="/merge-pdf" className="hover:text-blue-600 transition-colors">
                  Merge PDFs
                </Link>
              </li>
              <li>
                <Link to="/split-pdf" className="hover:text-blue-600 transition-colors">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link to="/rotate-pdf" className="hover:text-blue-600 transition-colors">
                  Rotate PDF
                </Link>
              </li>
              <li>
                <Link to="/compress-pdf" className="hover:text-blue-600 transition-colors">
                  Optimize PDF
                </Link>
              </li>
              <li>
                <Link to="/extract-pdf" className="hover:text-blue-600 transition-colors">
                  Extract Pages
                </Link>
              </li>
            </ul>
          </div>

          {/* Industry Solutions Col */}
          <div className="space-y-2.5">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Industry Solutions</div>
            <ul className="space-y-1.5">
              <li>
                <Link to="/tools-for/legal-professionals" className="hover:text-blue-600 transition-colors">
                  Legal &amp; Law Firms
                </Link>
              </li>
              <li>
                <Link to="/tools-for/healthcare" className="hover:text-blue-600 transition-colors">
                  Healthcare &amp; HIPAA
                </Link>
              </li>
              <li>
                <Link to="/tools-for/students-researchers" className="hover:text-blue-600 transition-colors">
                  Students &amp; Researchers
                </Link>
              </li>
              <li>
                <Link to="/tools-for/developers" className="hover:text-blue-600 transition-colors">
                  Developers &amp; WASM
                </Link>
              </li>
            </ul>
          </div>

          {/* Competitor Alternatives Col */}
          <div className="space-y-2.5">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Alternatives</div>
            <ul className="space-y-1.5">
              <li>
                <Link to="/alternatives/ilovepdf-alternative" className="hover:text-blue-600 transition-colors">
                  iLovePDF Alternative
                </Link>
              </li>
              <li>
                <Link to="/alternatives/smallpdf-alternative" className="hover:text-blue-600 transition-colors">
                  Smallpdf Alternative
                </Link>
              </li>
              <li>
                <Link to="/alternatives/sejda-alternative" className="hover:text-blue-600 transition-colors">
                  Sejda Alternative
                </Link>
              </li>
              <li>
                <Link to="/privacy-architecture" className="hover:text-blue-600 transition-colors">
                  Privacy Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Col */}
          <div className="space-y-2.5">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Legal &amp; Privacy</div>
            <ul className="space-y-1.5">
              <li>
                <Link to="/terms" className="hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-architecture" className="hover:text-blue-600 transition-colors">
                  Security Whitepaper
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={(e) => openModal(e.currentTarget)}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1 text-left"
                >
                  Help &amp; Feedback / Report a problem
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Nominative Fair Use & Trademark Disclaimer */}
        <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed space-y-2">
          <p>
            All product and company names, logos, and brands are trademarks™ or registered® trademarks of their respective holders. Use of them on this website is for identification and comparative purposes only under the doctrine of nominative fair use and does not imply any affiliation with, endorsement by, or sponsorship by them. iLovePDF, Smallpdf, and Sejda are trademarks of their respective owners. LitasDark is an independent, client-side utility software.
          </p>
          <p>
            Disclaimer: LitasDark operates strictly as a local software utility and does not act as a Data Processor or Business Associate. Users are solely responsible for ensuring their use of local software complies with their specific organizational policies and applicable regulations.
          </p>
        </div>

        {/* Bottom Bar with Language & Rights */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2024–2026 LitasDark. Client-side local browser processing utility.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:underline text-slate-600 hover:text-blue-600">Terms</Link>
            <Link to="/privacy" className="hover:underline text-slate-600 hover:text-blue-600">Privacy</Link>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">EN</span>
            <span className="text-slate-400">ES</span>
            <span className="text-slate-400">PT</span>
            <span className="text-slate-400">DE</span>
            <span className="text-slate-400">FR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
