import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckIcon,
  ArrowPathIcon,
  CommandLineIcon,
  ClockIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

interface PipelineProgressCardProps {
  progress: number; // 0 to 100
  progressMsg?: string;
  toolName?: string;
  startTime?: number;
}

export const PipelineProgressCard: React.FC<PipelineProgressCardProps> = ({
  progress,
  progressMsg = 'Processing document...',
  toolName = 'PDF Processing',
  startTime,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer for elapsed time calculation
  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.max(0, (Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(interval);
  }, [startTime]);

  // Extract page info if present in progressMsg (e.g. "Processing page 3 of 12...")
  const pageMatch = progressMsg.match(/page\s+(\d+)\s+of\s+(\d+)/i);
  const currentPage = pageMatch ? parseInt(pageMatch[1], 10) : null;
  const totalPages = pageMatch ? parseInt(pageMatch[2], 10) : null;

  // Calculate pages/sec rate if page info and elapsed time are available
  const pagesPerSec =
    currentPage && elapsedSeconds > 0.5
      ? (currentPage / elapsedSeconds).toFixed(1)
      : null;

  // Determine stage statuses based on overall progress (0 - 100)
  // Stage 1: File Analysis (0% - 25%)
  // Stage 2: Execution Pass (25% - 85%)
  // Stage 3: Document Rebuild (85% - 100%)
  const getStageStatus = (stageNum: number) => {
    if (stageNum === 1) {
      if (progress >= 25) return 'done';
      return 'active';
    }
    if (stageNum === 2) {
      if (progress >= 85) return 'done';
      if (progress >= 25) return 'active';
      return 'queued';
    }
    if (stageNum === 3) {
      if (progress >= 100) return 'done';
      if (progress >= 85) return 'active';
      return 'queued';
    }
    return 'queued';
  };

  const stage1 = getStageStatus(1);
  const stage2 = getStageStatus(2);
  const stage3 = getStageStatus(3);

  // Clean log ticker message
  const cleanMessage = progressMsg
    .replace(/^Processing\s+/i, '')
    .replace(/\.{3,}$/, '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-xl backdrop-blur-xl text-left space-y-4 font-sans relative overflow-hidden"
    >
      {/* Top Header & Overall Percentage */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {toolName}
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">Processing locally in browser</p>
          </div>
        </div>

        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-xl font-black text-cyan-400">{Math.round(progress)}</span>
          <span className="text-xs text-slate-500 font-bold">%</span>
        </div>
      </div>

      {/* 3-Stage Visual Pipeline */}
      <div className="space-y-3 relative py-1">
        {/* Connecting Vertical Guide Line */}
        <div className="absolute left-[15px] top-3 bottom-3 w-[2px] bg-slate-800 -z-0" />

        {/* Stage 1: File Analysis */}
        <div className="flex items-start gap-3 relative z-10">
          <StageBadge status={stage1} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${stage1 === 'active' ? 'text-cyan-300' : stage1 === 'done' ? 'text-slate-200' : 'text-slate-500'}`}>
                File Analysis
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-500">
                {stage1 === 'done' ? 'Done' : stage1 === 'active' ? 'Active' : 'Queued'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Structure parsing & resource validation</p>
          </div>
        </div>

        {/* Stage 2: Core Processing Pass */}
        <div className="flex items-start gap-3 relative z-10">
          <StageBadge status={stage2} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${stage2 === 'active' ? 'text-cyan-300' : stage2 === 'done' ? 'text-slate-200' : 'text-slate-500'}`}>
                Execution Pass
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-500">
                {stage2 === 'done' ? 'Done' : stage2 === 'active' ? 'Active' : 'Queued'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {stage2 === 'active' && currentPage && totalPages
                ? `Processing Page ${currentPage} of ${totalPages}`
                : 'Transformation & stream optimization'}
            </p>
          </div>
        </div>

        {/* Stage 3: Stream Rebuild */}
        <div className="flex items-start gap-3 relative z-10">
          <StageBadge status={stage3} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${stage3 === 'active' ? 'text-cyan-300' : stage3 === 'done' ? 'text-slate-200' : 'text-slate-500'}`}>
                Object Stream Rebuild
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-500">
                {stage3 === 'done' ? 'Done' : stage3 === 'active' ? 'Active' : 'Queued'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Stream deflation & XREF table assembly</p>
          </div>
        </div>
      </div>

      {/* Live Console Micro-Ticker */}
      <div className="px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800/80 font-mono text-[11px] text-slate-300 flex items-center gap-2 overflow-hidden">
        <CommandLineIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <AnimatePresence mode="wait">
          <motion.span
            key={cleanMessage}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            className="truncate text-slate-300"
          >
            › {cleanMessage}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Metrics Row: Pages, Rate, Elapsed */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1">
          <CpuChipIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {currentPage && totalPages ? `${currentPage} / ${totalPages} pages` : 'Local WASM'}
          </span>
        </div>

        {pagesPerSec && (
          <span className="text-slate-400 border-x border-slate-800 px-3">
            {pagesPerSec} p/s
          </span>
        )}

        <div className="flex items-center gap-1 text-slate-400">
          <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>{elapsedSeconds.toFixed(1)}s elapsed</span>
        </div>
      </div>

      {/* Monotonic Thin Progress Rail */}
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-teal-400"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
          transition={{ ease: 'easeOut', duration: 0.2 }}
        />
      </div>
    </motion.div>
  );
};

// Stage Indicator Badge Icon
const StageBadge: React.FC<{ status: 'done' | 'active' | 'queued' }> = ({ status }) => {
  if (status === 'done') {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0">
        <CheckIcon className="w-4 h-4 text-emerald-400" />
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center shrink-0 shadow-sm shadow-cyan-500/20">
        <ArrowPathIcon className="w-4 h-4 text-cyan-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-600 font-mono text-xs">
      ○
    </div>
  );
};
