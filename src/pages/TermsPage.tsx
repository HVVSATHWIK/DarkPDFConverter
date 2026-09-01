import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

export default function TermsPage() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12 space-y-8 text-slate-300 text-sm leading-relaxed">
        <Breadcrumbs
          items={[
            { name: 'Legal', path: '/' },
            { name: 'Terms of Service' },
          ]}
        />

        <div className="space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-400">Last updated: August 31, 2026</p>
        </div>

        {/* Introduction */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using LitasDark (&quot;the Service&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), including selecting, dropping, or processing any document files, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        {/* Local Processing Architecture */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">2. Local Browser-Based Processing</h2>
          <p>
            LitasDark is a client-side software utility. All document parsing, color transformation, merging, splitting, and compression operations occur entirely within your local browser memory (RAM) via compiled WebAssembly and Web Workers. We do not transmit, upload, or store your document files or metadata on any remote servers.
          </p>
        </section>

        {/* Regulatory & Compliance Disclaimers */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">3. Regulatory &amp; Compliance Status</h2>
          <p>
            LitasDark operates strictly as an independent local software utility and does not act as a Data Processor, Data Controller, or Business Associate under HIPAA, GDPR, or similar regulatory frameworks. Users are solely responsible for ensuring that their utilization of local client-side software complies with their specific internal organizational policies, employer guidelines, private confidentiality agreements (NDAs), and applicable professional industry regulations.
          </p>
        </section>

        {/* UCC Warranty Disclaimer */}
        <section className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            4. &quot;As-Is&quot; Warranty Disclaimer
          </h2>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            THE SOFTWARE, UTILITIES, AND SERVICES ON THIS WEBSITE ARE PROVIDED ON AN &apos;AS-IS&apos; AND &apos;AS-AVAILABLE&apos; BASIS, WITHOUT WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE PROVIDERS OF THIS PLATFORM EXPRESSLY DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SOFTWARE WILL BE UNINTERRUPTED, ERROR-FREE, 100% SECURE, OR FREE FROM DATA LOSS. ALL FILE PROCESSING OCCURS LOCALLY IN YOUR BROWSER USING EXPERIMENTAL WEB TECHNOLOGIES; IT IS YOUR SOLE RESPONSIBILITY TO MAINTAIN BACKUPS OF YOUR ORIGINAL FILES PRIOR TO USE.
          </p>
        </section>

        {/* Limitation of Liability */}
        <section className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            5. Limitation of Liability
          </h2>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE OPERATORS, DEVELOPERS, OR AFFILIATES OF THIS PLATFORM BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS OPPORTUNITIES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, ARISING FROM YOUR USE OF OR INABILITY TO USE THE UTILITY, ANY SYSTEM CRASHES, BROWSER MEMORY FAILURES, INSUFFICIENT HARDWARE RESOURCES, OR LOCAL CYBERSECURITY BREACHES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL OUR AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE USE OF THIS PLATFORM EXCEED FIFTY US DOLLARS ($50.00).
          </p>
        </section>

        {/* Nominative Fair Use & Trademarks */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">6. Trademark &amp; Nominative Fair Use Notice</h2>
          <p>
            All product and company names, logos, and brands referenced on this website are trademarks™ or registered® trademarks of their respective holders. Use of them on this website is for identification and comparative purposes only under the doctrine of nominative fair use and does not imply any affiliation with, endorsement by, or sponsorship by them. iLovePDF, Smallpdf, and Sejda are trademarks of their respective owners. LitasDark is an independent, client-side utility software and is not associated with any traditional cloud-based PDF service providers.
          </p>
        </section>

        {/* Modifications */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">7. Modifications to the Service and Terms</h2>
          <p>
            We reserve the right to modify or discontinue, temporarily or permanently, the Service or any part thereof with or without notice. We may also revise these Terms of Service at any time by updating this page. Your continued use of the Service following any revisions constitutes your acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
