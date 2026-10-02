import { useState, MouseEvent } from 'react';
import {
  ChevronDownIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import {
  TOOL_OPERATION_DETAILS,
  type ToolOperationDetail,
} from '@/config/toolHelperData';

export interface ToolOperationHelperProps {
  toolId: number;
  initialExpanded?: boolean;
  className?: string;
  showDetailsToggle?: boolean;
}

export default function ToolOperationHelper({
  toolId,
  initialExpanded = false,
  className = '',
  showDetailsToggle = true,
}: ToolOperationHelperProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);

  const detail: ToolOperationDetail | undefined = TOOL_OPERATION_DETAILS[toolId];

  if (!detail) {
    return null;
  }

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className={`w-full mt-3 rounded-lg border border-blue-500/20 bg-gradient-to-b from-blue-950/30 via-slate-900/60 to-slate-950/80 text-left transition-all duration-200 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Primary Function & Value Header */}
      <div className="p-3.5 space-y-2.5">
        {/* Function Statement */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-blue-400 uppercase">
            <InformationCircleIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Operational Function</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {detail.functionSummary}
          </p>
        </div>

        {/* Core Benefits Quick Summary */}
        <div className="pt-2 border-t border-blue-900/30 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
            <span className="text-cyan-300">Key Benefits</span>
            <span className="text-[10px] text-blue-300/80 font-mono">100% In-Browser</span>
          </div>
          <ul className="space-y-1 text-[11px] text-slate-300">
            {detail.coreBenefits.slice(0, 2).map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                <CheckCircleIcon className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-slate-300">
                  <strong className="text-white font-medium">{benefit.title}:</strong>{' '}
                  <span className="text-slate-300">{benefit.description}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Expandable Toggle Button */}
        {showDetailsToggle && (
          <div className="pt-1.5">
            <button
              type="button"
              onClick={handleToggle}
              aria-expanded={isExpanded}
              aria-controls={`tool-helper-details-${toolId}`}
              className="w-full flex items-center justify-between py-1 px-2 rounded bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/20 text-cyan-300 hover:text-white transition-colors text-[11px] font-medium group cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400/50"
            >
              <span className="flex items-center gap-1.5">
                <CpuChipIcon className="w-3.5 h-3.5 text-blue-400 group-hover:text-cyan-300 transition-colors" />
                <span>{isExpanded ? 'Hide Technical Guide' : 'View Operation Guide & Benefits'}</span>
              </span>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 text-blue-400 group-hover:text-white transition-transform duration-200 ${
                  isExpanded ? 'rotate-180 text-cyan-300' : ''
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Expanded Depth Section */}
      {isExpanded && (
        <div
          id={`tool-helper-details-${toolId}`}
          className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-blue-800/40 bg-slate-950/70 rounded-b-lg text-xs leading-relaxed"
        >
          {/* Third Benefit if present */}
          {detail.coreBenefits.length > 2 && (
            <div className="pt-1 space-y-1">
              <div className="flex items-start gap-1.5 text-[11px] leading-snug">
                <CheckCircleIcon className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-slate-300">
                  <strong className="text-white font-medium">
                    {detail.coreBenefits[2].title}:
                  </strong>{' '}
                  <span className="text-slate-300">{detail.coreBenefits[2].description}</span>
                </span>
              </div>
            </div>
          )}

          {/* Technical Mechanism */}
          <div className="space-y-1 rounded bg-blue-950/30 p-2.5 border border-blue-500/15">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-300 flex items-center gap-1">
              <span>Technical Execution</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
              {detail.mechanism}
            </p>
          </div>

          {/* Practical Application / Ideal For */}
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              Recommended Use Cases
            </span>
            <p className="text-[11px] text-slate-200">{detail.idealFor}</p>
          </div>

          {/* Pro Tip */}
          <div className="flex items-start gap-1.5 p-2 rounded bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-400/20 text-slate-200">
            <LightBulbIcon className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold text-white">Pro Tip: </span>
              <span className="text-slate-200">{detail.proTip}</span>
            </div>
          </div>

          {/* Privacy Guarantee */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-300">Privacy Guarantee: </strong>
              {detail.privacyGuarantee}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
