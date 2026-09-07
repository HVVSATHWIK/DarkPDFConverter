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
          <p className="text-xs text-slate-400">Last updated: September 7, 2026</p>
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

        {/* Advertising & Google AdSense */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">4. Advertising and Google AdSense</h2>
          <p>
            LitasDark may use Google AdSense and third-party advertising partners to display advertisements on the website.
          </p>
          <p>
            In connection with ad serving and measurement, third-party vendors, including Google, use cookies, web beacons, IP addresses, or other identifiers. Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to LitasDark or other websites on the Internet.
          </p>
          <p>
            Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to LitasDark and/or other websites across the Internet. As a result of ad serving on this website, third parties may place and read cookies on users&apos; browsers, or use web beacons or IP addresses to collect information.
          </p>
          <p>
            Users may opt out of personalized advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              Google Ads Settings
            </a>
            . Alternatively, users can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{' '}
            <a
              href="https://www.aboutads.info/choices"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              www.aboutads.info
            </a>
            .
          </p>
          <p>
            For information about how Google uses data when you use partner sites or applications, please visit{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              How Google uses information from sites or apps that use our services
            </a>
            .
          </p>
          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1">
            <p className="font-medium text-slate-300">Important Privacy Distinction Regarding Document Processing</p>
            <p>
              Your PDF documents and files are processed strictly locally in your web browser and are not uploaded to LitasDark&apos;s servers for PDF processing. This local processing guarantee applies specifically to your documents and files. This does not mean that advertising technologies used on the website collect no information: third-party advertising partners may place and read cookies, or use web beacons and IP addresses, for ad serving and measurement as described above. LitasDark does not receive, collect, or store Google&apos;s advertising data on its servers.
            </p>
          </div>
        </section>

        {/* Regulatory Disclaimers */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">5. Regulatory &amp; Compliance Disclaimers</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Disclaimer: LitasDark operates strictly as a local software utility and does not act as a Data Processor or Business Associate under HIPAA, GDPR, or similar data privacy frameworks. Users are solely responsible for ensuring their use of local software complies with their specific organizational policies, private confidentiality agreements, and applicable professional regulations.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">6. Contact</h2>
          <p>
            If you have questions regarding this Privacy Policy or our client-side architecture, please review our Technical Architecture Whitepaper or reach out through our support channels.
          </p>
        </section>
      </div>
    </div>
  );
}
