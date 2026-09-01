import { useParams, Link, Navigate } from 'react-router-dom';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { PrivacyBadges } from '@/components/seo/PrivacyBadges';
import { CompetitorComparisonTable } from '@/components/seo/CompetitorComparisonTable';
import { TOOL_DEFINITIONS } from '@/config/tools';
import ToolGridCard from '@/components/tools/ToolGridCard';
import {
  ShieldCheckIcon,
  DocumentCheckIcon,
  AcademicCapIcon,
  CommandLineIcon,
  HeartIcon,
  ScaleIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface IndustryData {
  title: string;
  badge: string;
  heading: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keyPainPoints: string[];
  recommendedToolIds: number[];
  complianceNotes: string;
  faq: { q: string; a: string }[];
}

const INDUSTRY_MAP: Record<string, IndustryData> = {
  'legal-professionals': {
    title: 'Privacy-First PDF Tools for Lawyers & Legal Teams',
    badge: 'Legal & Attorney Workflows',
    heading: 'Confidential PDF Processing with Zero Cloud Retention',
    description:
      'Handle sensitive case files, contracts, discovery documents, and privileged client communications without violating NDAs or data protection regulations. 100% browser-side execution.',
    icon: ScaleIcon,
    keyPainPoints: [
      'Strict client confidentiality prevents uploading unredacted contracts to third-party cloud servers.',
      'Court filing deadlines require instant document merging and page extraction without server queue delays.',
      'Bates stamping and large PDF exhibits crash under cloud-based file size restrictions.',
    ],
    recommendedToolIds: [2, 3, 6, 1], // Merge, Split, Extract, Dark Mode
    complianceNotes:
      'LitasDark operates entirely within the local web browser memory sandbox. No documents, metadata, or logs ever transit across the internet or reside on external hard drives.',
    faq: [
      {
        q: 'Is LitasDark safe for attorney-client privileged documents?',
        a: 'Yes. Because processing runs in client-side WebAssembly, the document never leaves your computer. This eliminates the risk of third-party server breaches or subpoena vulnerabilities.',
      },
      {
        q: 'Are there size limitations when combining massive discovery exhibits?',
        a: 'No. File processing is bounded solely by your machine’s RAM rather than arbitrary 50MB cloud upload limits.',
      },
    ],
  },
  healthcare: {
    title: 'In-Browser PDF Suite for Healthcare & Clinical Workflows',
    badge: 'Medical & Clinical Practice',
    heading: 'Privacy-First Architecture for Clinical Documentation',
    description:
      'Manage records, research reports, and medical documents locally. Zero external data transmission supports clinical workstations needing privacy-aligned document handling.',
    icon: HeartIcon,
    keyPainPoints: [
      'Sending sensitive patient documentation over external cloud networks introduces privacy risks.',
      'Large clinical research papers and documentation require fast multi-page splitting and organizing.',
      'Reading diagnostic PDFs during long night shifts causes visual fatigue.',
    ],
    recommendedToolIds: [1, 2, 3, 5], // Dark Mode, Merge, Split, Compress
    complianceNotes:
      'Because LitasDark transmits zero patient data over network connections, all operations remain local to your workstation. LitasDark operates strictly as client-side software and does not act as a Business Associate or Data Processor.',
    faq: [
      {
        q: 'Can I use LitasDark for patient medical charts and radiology reports?',
        a: 'All data transformation occurs locally on your clinical workstation without sending bytes to external servers. Always adhere to your organization\'s internal software and data handling policies.',
      },
      {
        q: 'How does the Dark Mode feature help clinical staff?',
        a: 'The Dark Mode PDF engine converts bright document backgrounds to high-contrast dark or sepia themes for more comfortable reading in low-light environments.',
      },
    ],
  },
  'students-researchers': {
    title: 'Free PDF Suite & Dark Mode Inverter for Students & Researchers',
    badge: 'Academic Research & Study',
    heading: 'Study Late Without Eye Strain & Assemble Research Papers Free',
    description:
      'Convert bright textbook PDFs to dark mode for comfortable late-night reading. Merge thesis chapters, split lecture slides, and extract research references with no paywalls or signups.',
    icon: AcademicCapIcon,
    keyPainPoints: [
      'Staring at bright white academic PDFs in dark dorm rooms causes severe eye strain and migraines.',
      'Commercial PDF sites block students with daily 2-task limits right during finals week.',
      'Complicated account sign-ups and spam newsletters interrupt focused research sessions.',
    ],
    recommendedToolIds: [1, 2, 3, 5, 6], // Dark Mode, Merge, Split, Optimize, Extract
    complianceNotes:
      '100% free and open to everyone. No credit card required, no student email verification, and unmetered operations 24/7.',
    faq: [
      {
        q: 'How do I turn a white scanned textbook PDF into Dark Mode?',
        a: 'Simply select our Dark Mode tool, drop in your textbook or lecture slides, and choose from high-contrast OLED Black or Sepia. You can read it directly or export the dark PDF.',
      },
      {
        q: 'Is there a limit on how many lecture notes I can combine?',
        a: 'None at all. You can merge as many slides and papers as you need without hitting paywalls.',
      },
    ],
  },
  developers: {
    title: 'Client-Side WebAssembly PDF Toolkit for Developers',
    badge: 'Engineers & Tech Teams',
    heading: 'High-Performance Rust/WASM Engine in Browser Web Workers',
    description:
      'Fast, offline-capable PDF manipulation powered by modern web standards. Zero tracking, zero telemetry, and pure hardware-accelerated processing.',
    icon: CommandLineIcon,
    keyPainPoints: [
      'Sending proprietary source code or system architecture diagrams to unknown third-party cloud converters.',
      'Clunky server round-trips causing high latency for simple document splits and merges.',
      'Ad-infested legacy PDF tools with intrusive trackers and bloated scripts.',
    ],
    recommendedToolIds: [1, 2, 3, 4, 5, 6],
    complianceNotes:
      'Compiled with Rust to WebAssembly (WASM). Operations run inside dedicated background Web Workers, keeping the main UI thread at 60 FPS.',
    faq: [
      {
        q: 'How does LitasDark achieve native processing speed in the browser?',
        a: 'We compile native Rust algorithms to WebAssembly and execute all byte transformations in decoupled Web Workers for near-instant execution.',
      },
      {
        q: 'Does LitasDark work offline without an internet connection?',
        a: 'Yes. Once the lightweight application assets are cached by your browser, all PDF conversions execute completely offline.',
      },
    ],
  },
};

export default function IndustryPage() {
  const { industry } = useParams<{ industry: string }>();
  const data = industry ? INDUSTRY_MAP[industry] : null;

  if (!data) {
    return <Navigate to="/" replace />;
  }

  const Icon = data.icon;
  const recommendedTools = data.recommendedToolIds
    .map((id) => TOOL_DEFINITIONS.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { name: 'Solutions', path: '/' },
            { name: data.badge },
          ]}
        />

        {/* Hero Section */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <Icon className="w-3.5 h-3.5" />
              {data.badge}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              100% Client-Side Private
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-100 max-w-4xl">
            {data.heading}
          </h1>
          <p className="text-slate-300/85 max-w-3xl text-base md:text-lg leading-relaxed">
            {data.description}
          </p>
        </section>

        {/* Privacy Trust Badges */}
        <PrivacyBadges />

        {/* Recommended Tools Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-cyan-400" />
              Recommended Tools for {data.badge}
            </h2>
            <Link to="/" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              <span>View all tools</span>
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedTools.map((tool) => (
              <ToolGridCard key={tool!.id} tool={tool!} />
            ))}
          </div>
        </section>

        {/* Industry Pain Points vs Solutions */}
        <section className="panel-surface p-6 md:p-8 rounded-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-100">Why Legacy Cloud Converters Fail Your Workflow</h2>
            <p className="text-xs md:text-sm text-slate-400">
              How our zero-upload WebAssembly architecture protects your productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.keyPainPoints.map((point, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
              >
                <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs font-bold border border-rose-500/20">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-3">
            <DocumentCheckIcon className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-cyan-200">Architecture &amp; Data Privacy Notice</span>
              <p className="text-xs text-slate-300/90 leading-relaxed">{data.complianceNotes}</p>
            </div>
          </div>
        </section>

        {/* Competitor Comparison Module */}
        <CompetitorComparisonTable />

        {/* FAQ Section */}
        <section className="panel-surface p-6 md:p-8 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold text-slate-100">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {data.faq.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-200">{item.q}</h3>
                <p className="text-xs text-slate-300/80 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
