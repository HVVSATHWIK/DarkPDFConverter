import React from 'react';
import { ChatBubbleLeftRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useReportBug, OperationContext } from '@/context/ReportBugContext';

interface ContextualReportTriggerProps {
  toolName: string;
  pageCount?: number;
  fileSizeMb?: string;
  lastError?: string;
  operationStatus?: 'success' | 'failed' | 'user_disliked';
  settingsUsed?: Record<string, unknown>;
  className?: string;
  variant?: 'subtle' | 'warning' | 'button';
  customLabel?: string;
}

export const ContextualReportTrigger: React.FC<ContextualReportTriggerProps> = ({
  toolName,
  pageCount,
  fileSizeMb,
  lastError,
  operationStatus = 'success',
  settingsUsed,
  className = '',
  variant = 'subtle',
  customLabel,
}) => {
  const { openModal } = useReportBug();

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    const context: OperationContext = {
      toolName,
      pageCount,
      fileSizeMb,
      lastError,
      operationStatus,
      settingsUsed,
    };
    openModal({ triggerElement: e.currentTarget, operationContext: context });
  };

  if (variant === 'warning') {
    return (
      <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300 gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{customLabel || 'Something wrong with the output or unexpected formatting?'}</span>
        </div>
        <button
          type="button"
          onClick={handleOpen}
          className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors shrink-0 flex items-center gap-1 hover:underline"
        >
          <span>Report a problem</span>
          <span>→</span>
        </button>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-slate-100 transition-all ${className}`}
      >
        <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-cyan-400/80" />
        <span>{customLabel || 'Report a problem'}</span>
      </button>
    );
  }

  // Default 'subtle' text link
  return (
    <div className={`text-center pt-2 ${className}`}>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors group"
      >
        <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        <span>{customLabel || 'Something wrong with the output? Report a problem'}</span>
      </button>
    </div>
  );
};
