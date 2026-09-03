import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

export default function PrivacyPage() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12 space-y-8 text-slate-300 text-sm leading-relaxed">
        <Breadcrumbs
          items={[
            { name: 'Legal', path: '/' },
            { name: 'Privacy Policy' },
          ]}
        />

        <div className="space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last updated: August 31, 2026</p>
        </div>

        {/* Core Privacy Principle */}
        <section className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-base font-semibold text-white">Zero Document Transmission Policy</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            LitasDark is built from the ground up on a zero-upload client-side architecture. When you use any tool on this website—such as the Dark Mode Inverter, PDF Merger, Splitter, Compressor, or Rotator—your files are processed exclusively in your device&apos;s local browser memory (RAM) via WebAssembly and Web Workers.
          </p>
        </section>

        {/* Information We Do Not Collect */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">1. Information We Do Not Collect</h2>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-xs sm:text-sm pl-1">
            <li>We do not upload, read, transmit, or store your document contents or file names on any server.</li>
            <li>We do not collect personal identifying information (PII) or protected health information (PHI).</li>
            <li>We do not require account registration, passwords, or credit card information.</li>
            <li>We do not maintain server-side document scratch disks or retention logs.</li>
          </ul>
        </section>

        {/* Data in Volatile Memory */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">2. Local Browser Memory Lifecycle</h2>
          <p>
            When a document is loaded into LitasDark, the browser creates a temporary local File Blob in volatile device RAM. Once processing completes and you download the converted file or close the browser tab, the local object URLs are revoked and the temporary memory buffers are released by your browser&apos;s garbage collector.
          </p>
        </section>

        {/* Website Hosting & Basic Logs */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">3. Website Hosting &amp; Technical Delivery</h2>
          <p>
            Like virtually all websites, when your browser requests the static HTML, JavaScript, and WebAssembly bundles from our hosting infrastructure or CDN, standard web server access logs (such as IP address, user agent, and timestamp) may be recorded by the hosting provider for security, DDoS mitigation, and content delivery purposes. These infrastructure logs do not contain any of your local document data.
          </p>
        </section>

        {/* Regulatory Disclaimers */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">4. Regulatory &amp; Compliance Disclaimers</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Disclaimer: LitasDark operates strictly as a local software utility and does not act as a Data Processor or Business Associate under HIPAA, GDPR, or similar data privacy frameworks. Users are solely responsible for ensuring their use of local software complies with their specific organizational policies, private confidentiality agreements, and applicable professional regulations.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">5. Contact</h2>
          <p>
            If you have questions regarding this Privacy Policy or our client-side architecture, please review our Technical Architecture Whitepaper or reach out through our support channels.
          </p>
        </section>
      </div>
    </div>
  );
}
