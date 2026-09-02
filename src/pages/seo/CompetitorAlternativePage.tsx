import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { PrivacyBadges } from '@/components/seo/PrivacyBadges';
import { CompetitorComparisonTable } from '@/components/seo/CompetitorComparisonTable';
import { TOOL_DEFINITIONS } from '@/config/tools';
import ToolGridCard from '@/components/tools/ToolGridCard';
import {
  ShieldCheckIcon,
  XCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

interface CompetitorData {
  name: string;
  slug: string;
  tagline: string;
  whySwitchHeader: string;
  highlightKey: 'ilovepdf' | 'smallpdf' | 'sejda';
  competitorShortcomings: { issue: string; litasFix: string }[];
  faqs: { q: string; a: string }[];
}

const COMPETITOR_MAP: Record<string, CompetitorData> = {
  'ilovepdf-alternative': {
    name: 'iLovePDF',
    slug: 'ilovepdf-alternative',
    tagline: 'A Privacy-First, In-Browser Alternative to iLovePDF with Zero Cloud Uploads',
    whySwitchHeader: 'Comparing Traditional Cloud Architecture with LitasDark',
    highlightKey: 'ilovepdf',
    competitorShortcomings: [
      {
        issue: 'Traditional cloud workflow requires uploading documents over the network to remote servers for processing.',
        litasFix: 'Client-Side WebAssembly: Your files are processed entirely in local browser memory.',
      },
      {
        issue: 'Daily frequency limits and cloud compute subscription models on advanced features.',
        litasFix: 'Unrestricted Local Access: Process documents directly on your device without subscription paywalls.',
      },
      {
        issue: 'No specialized PDF Dark Mode Inverter with high-contrast OLED & Sepia reading palettes.',
        litasFix: 'Built-in Dark Mode Inverter with multiple eye-friendly palettes for comfortable reading.',
      },
      {
        issue: 'Third-party tracking scripts and ad networks common on free cloud conversion tiers.',
        litasFix: 'Zero tracking cookies, zero external telemetry, and an ad-free interface.',
      },
    ],
    faqs: [
      {
        q: 'How does LitasDark differ architecturally from iLovePDF?',
        a: 'While traditional cloud converters transmit your documents over the internet to remote servers, LitasDark processes everything directly in your browser\'s local memory via WebAssembly.',
      },
      {
        q: 'Do I need to create an account to use LitasDark?',
        a: 'No account, email, or registration is required. You can use any PDF tool immediately in your browser.',
      },
    ],
  },
  'smallpdf-alternative': {
    name: 'Smallpdf',
    slug: 'smallpdf-alternative',
    tagline: 'Looking for a Client-Side Alternative to Smallpdf? Process PDFs Locally',
    whySwitchHeader: 'Comparing Smallpdf Cloud Tiers with LitasDark Local Execution',
    highlightKey: 'smallpdf',
    competitorShortcomings: [
      {
        issue: 'Cloud tiered model with daily task frequency limits on free web access.',
        litasFix: 'Direct local execution without daily task restrictions or cooldown timers.',
      },
      {
        issue: 'Network transfer latency when uploading and downloading multi-page documents.',
        litasFix: 'Near-instant local WebAssembly execution utilizing your device\'s hardware.',
      },
      {
        issue: 'Document data is transmitted across the internet to remote cloud infrastructure.',
        litasFix: 'Zero remote storage: Processing occurs in volatile RAM and is cleared when the tab is closed.',
      },
      {
        issue: 'Paid subscriptions required for unrestricted daily document operations.',
        litasFix: 'Free to use client-side utility with no subscription requirements.',
      },
    ],
    faqs: [
      {
        q: 'Why does LitasDark not require daily usage limits?',
        a: 'Because LitasDark utilizes your browser’s local computing power via WebAssembly rather than centralized cloud compute servers, there are no server compute bottlenecks to ration.',
      },
      {
        q: 'Can LitasDark handle large documents?',
        a: 'Yes. Processing capacity is bounded by your local computer memory rather than arbitrary cloud server upload limits.',
      },
    ],
  },
  'sejda-alternative': {
    name: 'Sejda PDF',
    slug: 'sejda-alternative',
    tagline: 'An In-Browser Alternative to Sejda PDF Without Cloud Upload Constraints',
    whySwitchHeader: 'Comparing Sejda PDF with LitasDark Local Architecture',
    highlightKey: 'sejda',
    competitorShortcomings: [
      {
        issue: 'Hourly task quotas and page/file size restrictions on cloud web processing.',
        litasFix: 'No arbitrary page caps or hourly quota countdowns.',
      },
      {
        issue: 'Web tier transmits document bytes to remote servers for processing.',
        litasFix: 'Zero server uploads: Complete privacy and local offline capability once cached.',
      },
      {
        issue: 'Requires separate desktop software installation for offline execution.',
        litasFix: 'Runs seamlessly right in modern web browsers via WebAssembly with zero installation.',
      },
      {
        issue: 'Limited reader inversion options for nighttime studying and reading.',
        litasFix: 'Built-in multi-theme Dark Mode Inverter with OLED Black, Sepia, and custom palettes.',
      },
    ],
    faqs: [
      {
        q: 'How does LitasDark handle document privacy compared to Sejda?',
        a: 'Because no document bytes are transmitted to any remote server, LitasDark avoids third-party cloud data transit and storage entirely.',
      },
      {
        q: 'Is there a desktop app required to run LitasDark locally?',
        a: 'No. LitasDark executes locally inside your existing web browser via WebAssembly standards.',
      },
    ],
  },
};

export default function CompetitorAlternativePage() {
  const { competitor } = useParams<{ competitor: string }>();
  // Match standard slug or shorthand
  const normalizedKey = competitor?.replace(/-free-alternative|-private-alternative|-no-upload-alternative/, '-alternative');
  const data = normalizedKey ? COMPETITOR_MAP[normalizedKey] : null;

  if (!data) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-full">
      <SEO title={`${data.name} Alternative - Privacy-First In-Browser PDF Suite`} description={data.tagline} faqList={data.faqs} />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { name: 'Alternatives', path: '/' },
            { name: `${data.name} Alternative` },
          ]}
        />

        {/* Hero Section */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <SparklesIcon className="w-3.5 h-3.5" />
              Architectural Comparison
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              In-Browser Local Processing
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-100 max-w-4xl">
            {data.tagline}
          </h1>
          <p className="text-slate-300/85 max-w-3xl text-base md:text-lg leading-relaxed">
            Looking for a privacy-first alternative to {data.name}? While traditional cloud converters transmit your documents over the internet to remote servers, LitasDark processes everything directly in your browser&apos;s local memory. No uploads, no waiting, and absolutely no external data transmission.
          </p>
        </section>

        {/* Privacy Trust Badges */}
        <PrivacyBadges />

        {/* Direct Comparison Matrix */}
        <CompetitorComparisonTable
          highlightCompetitor={data.highlightKey}
          title={`LitasDark vs. ${data.name}: Head-to-Head Comparison`}
          subtitle={`See why thousands of users are switching from ${data.name} to LitasDark's zero-upload WebAssembly engine.`}
        />

        {/* Shortcomings Breakdown */}
        <section className="panel-surface p-6 md:p-8 rounded-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">{data.whySwitchHeader}</h2>
            <p className="text-xs md:text-sm text-slate-400">
              Direct comparison of critical friction points between server-side platforms and LitasDark.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.competitorShortcomings.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <XCircleIcon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-rose-300">{data.name} Friction</span>
                    <p className="text-xs text-slate-300 mt-0.5">{item.issue}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2.5">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-emerald-300">The LitasDark Advantage</span>
                    <p className="text-xs text-cyan-200/90 mt-0.5">{item.litasFix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Start Using Tools Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-cyan-400" />
              Switch Today — Launch Any Tool Instantly
            </h2>
            <Link to="/" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              <span>View all tools</span>
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOL_DEFINITIONS.map((tool) => (
              <ToolGridCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="panel-surface p-6 md:p-8 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold text-slate-100">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {data.faqs.map((item, idx) => (
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
