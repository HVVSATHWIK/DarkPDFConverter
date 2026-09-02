import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { ToolGuideData, TOOL_GUIDES } from '@/config/toolGuides';
import { TOOL_DEFINITIONS } from '@/config/tools';

interface ToolContentSectionProps {
  guide: ToolGuideData;
}

export default function ToolContentSection({ guide }: ToolContentSectionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Find related tools objects
  const relatedTools = guide.relatedToolSlugs
    .map((slug) => {
      const g = TOOL_GUIDES[slug];
      const def = TOOL_DEFINITIONS.find((t) => t.id === g?.toolId);
      return g && def ? { guide: g, def } : null;
    })
    .filter(Boolean) as { guide: ToolGuideData; def: (typeof TOOL_DEFINITIONS)[0] }[];

  return (
    <article className="w-full max-w-5xl mx-auto px-4 py-12 md:py-16 space-y-14 text-slate-300">
      {/* 1. Header Overview & How It Works */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <SparklesIcon className="w-4 h-4" />
          <span>Complete User Guide &amp; Technical Reference</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          How the {guide.h1} Engine Works
        </h2>
        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          {guide.howItWorksOverview}
        </p>
      </section>

      {/* 2. Step-by-Step Instructions */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>How to Use the {guide.h1}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {guide.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col space-y-3 relative overflow-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                {step.stepNumber}
              </div>
              <h4 className="text-base font-semibold text-white">{step.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Core Features Grid */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-white tracking-tight">
          Core Features &amp; Capabilities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guide.features.map((feature, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2"
            >
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                <DocumentCheckIcon className="w-5 h-5 shrink-0" />
                <span>{feature.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Technical Architecture & Privacy Execution */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Specs */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <CpuChipIcon className="w-5 h-5" />
            <span>Technical Architecture</span>
          </div>
          <dl className="space-y-3 text-xs sm:text-sm">
            <div>
              <dt className="text-slate-400 font-medium">Processing Engine:</dt>
              <dd className="text-slate-200 mt-0.5">{guide.technicalDetails.engine}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Memory Lifecycle:</dt>
              <dd className="text-slate-200 mt-0.5">{guide.technicalDetails.memoryLifecycle}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Supported Input Types:</dt>
              <dd className="text-slate-200 mt-0.5">
                {guide.technicalDetails.supportedFormats.join(', ')}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Output Format:</dt>
              <dd className="text-slate-200 mt-0.5">{guide.technicalDetails.outputFormat}</dd>
            </div>
          </dl>
        </div>

        {/* Privacy & Limitations */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <ShieldCheckIcon className="w-5 h-5" />
            <span>Zero Server Transmission Guarantee</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            All document streams are processed exclusively in your device&apos;s local browser RAM.
            No document bytes, file names, or metadata records are ever sent across the network or
            stored on remote cloud storage.
          </p>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>Known Limitations &amp; Best Practices:</span>
            </div>
            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
              {guide.technicalDetails.limitations.map((limit, i) => (
                <li key={i}>{limit}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Real-World Use Cases */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-white tracking-tight">
          Practical Use Cases &amp; Scenarios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {guide.useCases.map((uc, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <h4 className="text-sm font-semibold text-white">{uc.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{uc.scenario}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Frequently Asked Questions (FAQ) with Accordion */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <QuestionMarkCircleIcon className="w-4 h-4" />
          <span>Frequently Asked Questions</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Questions About {guide.h1}
        </h3>
        <div className="space-y-3">
          {guide.faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 text-white hover:text-cyan-300 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-sm sm:text-base">{faq.q}</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Related Tools Navigation (Crawlable Semantic Links) */}
      <section className="space-y-6 pt-6 border-t border-slate-800/80">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Related Free Client-Side PDF Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedTools.map(({ guide: rGuide, def: rDef }) => (
            <Link
              key={rGuide.slug}
              to={`/${rGuide.slug}`}
              className="p-4.5 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/30 transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                  <span>{rDef.name}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {rDef.description}
                </p>
              </div>
              <span className="text-[11px] font-medium text-cyan-400/80 group-hover:text-cyan-300">
                Launch Tool &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. Jump to Top Action CTA */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-indigo-950/40 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-white">Ready to process your document?</h4>
          <p className="text-xs text-slate-300">
            Use the interactive workspace above with instant, zero-upload processing in your browser.
          </p>
        </div>
        <button
          onClick={scrollToTop}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 shrink-0"
        >
          <ArrowUpIcon className="w-4 h-4" />
          <span>Back to Top Tool</span>
        </button>
      </section>
    </article>
  );
}
