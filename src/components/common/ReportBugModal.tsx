import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  BugAntIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  PhotoIcon,
  FolderOpenIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useReportBug } from '@/context/ReportBugContext';

type CategoryOption = 'bug' | 'feature' | 'performance' | 'other';

export const ReportBugModal: React.FC = () => {
  const { isOpen, closeModal, operationContext } = useReportBug();

  // Form State
  const [category, setCategory] = useState<CategoryOption>('bug');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [honeypot, setHoneypot] = useState('');

  // Screenshot State
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [screenshotSize, setScreenshotSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Status State: 'idle' | 'submitting' | 'success' | 'error'
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLSelectElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Resize & Compress Image to lightweight Base64
  const processImageFile = useCallback((file: File | Blob, defaultName = 'screenshot.png') => {
    const fileObj =
      file instanceof File
        ? file
        : new File([file], defaultName, { type: file.type || 'image/png' });

    if (!fileObj.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/png', 0.85);

          // Estimate size in KB
          const sizeInKb = Math.round((compressedDataUrl.length * 0.75) / 1024);

          setScreenshot(compressedDataUrl);
          setScreenshotName(fileObj.name || defaultName);
          setScreenshotSize(`${width}x${height} (${sizeInKb} KB)`);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(fileObj);
  }, []);

  // Shared paste event handler for images from clipboard
  const handleClipboardPaste = useCallback(
    (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      let hasImage = false;

      // 1. Check e.clipboardData.files first
      if (clipboardData.files && clipboardData.files.length > 0) {
        for (let i = 0; i < clipboardData.files.length; i++) {
          const file = clipboardData.files[i];
          if (file.type.startsWith('image/')) {
            processImageFile(file, file.name || 'pasted-screenshot.png');
            hasImage = true;
            break;
          }
        }
      }

      // 2. Check e.clipboardData.items
      if (!hasImage && clipboardData.items) {
        const items = clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith('image/')) {
            const blob = item.getAsFile();
            if (blob) {
              processImageFile(blob, 'pasted-screenshot.png');
              hasImage = true;
              break;
            }
          }
        }
      }

      // Only intercept if an image was actually found in the clipboard
      if (hasImage) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [processImageFile]
  );

  // Global window paste listener when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const onWindowPaste = (e: ClipboardEvent) => {
      handleClipboardPaste(e);
    };

    window.addEventListener('paste', onWindowPaste, true);
    return () => window.removeEventListener('paste', onWindowPaste, true);
  }, [isOpen, handleClipboardPaste]);

  // Drag & Drop handlers for dropzone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImageFile(file, file.name);
      }
    }
  };

  const triggerFileBrowser = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotName('');
    setScreenshotSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Collect Non-sensitive Diagnostic & Operation Metadata
  const getMetadata = () => {
    if (typeof window === 'undefined') return null;
    return {
      browser: `${navigator.userAgent}`,
      os: `${navigator.platform}`,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      route: window.location.pathname,
      language: navigator.language || 'en-US',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      operationContext: operationContext
        ? {
            toolName: operationContext.toolName || 'Unknown',
            pageCount: operationContext.pageCount,
            fileSizeMb: operationContext.fileSizeMb,
            lastError: operationContext.lastError,
            operationStatus: operationContext.operationStatus,
            settingsUsed: operationContext.settingsUsed,
          }
        : null,
    };
  };

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    if (status === 'success') {
      // Reset form states when closed or reused
      setDescription('');
      setContact('');
      setScreenshot(null);
    }

    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          lastEl.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          firstEl.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal, status]);

  const handleClose = () => {
    if (status === 'success') {
      setStatus('idle');
    }
    closeModal();
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setStatus('error');
      setErrorMessage('Please check your internet connection and try again.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/report-bug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          description,
          contact: contact.trim(),
          metadata: includeMetadata ? getMetadata() : null,
          screenshot: screenshot || undefined,
          website: honeypot, // Honeypot field
        }),
      });

      if (response.ok) {
        // Only set success after backend confirms delivery
        setStatus('success');
      } else {
        const data = await response.json().catch(() => ({}));
        setStatus('error');
        setErrorMessage(
          data?.error || 'Unable to send report. Please check your connection and try again.'
        );
      }
    } catch {
      setStatus('error');
      setErrorMessage('Unable to send report. Please check your connection and try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <div
          tabIndex={-1}
          aria-hidden="true"
          className="fixed inset-0 -z-10"
          onClick={handleClose}
        />

        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-bug-title"
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-slate-950/95 border border-slate-800/90 backdrop-blur-xl shadow-2xl shadow-cyan-950/30 rounded-2xl w-full max-w-2xl overflow-hidden relative text-left text-slate-100 font-sans my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <BugAntIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 id="report-bug-title" className="text-sm font-bold text-slate-100 leading-tight">
                  Report a problem
                </h3>
                <p className="text-[11px] text-slate-400">
                  Help us improve LitasDark by telling us what went wrong.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
              aria-label="Close dialog"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-5 sm:p-6">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="py-6 sm:py-8 flex flex-col items-center text-center space-y-4"
              >
                {/* Animated Circular Ring & Checkmark */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="relative w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/60"
                >
                  <motion.svg
                    className="w-7 h-7 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                </motion.div>

                {/* Text Wording */}
                <div className="space-y-2 max-w-md">
                  <h4 className="text-base font-bold text-slate-100">
                    Report submitted successfully
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Thank you for helping us improve LitasDark.
                  </p>
                  {contact.trim().length > 0 ? (
                    <p className="text-xs text-slate-400 leading-relaxed">
                      We'll get back to you at your email if we need more information.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your report has been received. Since no contact information was provided, we won't be able to follow up directly.
                    </p>
                  )}
                </div>

                {/* Done Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-2 px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Honeypot Input */}
                <div className="hidden opacity-0 pointer-events-none absolute -z-50" aria-hidden="true">
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                {/* Operation Context Banner if present */}
                {operationContext && (
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="font-semibold text-[11px] sm:text-xs">
                        Context attached: {operationContext.toolName || 'PDF Operation'}
                      </span>
                    </div>
                    {operationContext.pageCount && (
                      <span className="text-[10px] sm:text-[11px] text-cyan-300/80 font-mono">
                        {operationContext.pageCount} pages
                      </span>
                    )}
                  </div>
                )}

                {/* Error Banner */}
                {status === 'error' && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2.5">
                    <ExclamationCircleIcon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-200">Unable to send report</p>
                      <p className="text-[11px] text-rose-300/90">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Grid Row 1: Issue Type & Contact (Side-by-Side on Desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Issue Type Dropdown */}
                  <div className="space-y-1">
                    <label htmlFor="issue-category" className="block text-xs font-semibold text-slate-300">
                      Issue Type
                    </label>
                    <select
                      id="issue-category"
                      ref={firstInputRef}
                      value={category}
                      onChange={(e) => setCategory(e.target.value as CategoryOption)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-colors"
                    >
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="performance">Performance Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Optional Contact Input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="issue-contact" className="block text-xs font-semibold text-slate-300">
                        Email or handle <span className="text-slate-500 font-normal">(optional)</span>
                      </label>
                    </div>
                    <input
                      id="issue-contact"
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="e.g. alex@example.com or @alex"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-colors placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="issue-description" className="block text-xs font-semibold text-slate-300">
                      Description <span className="text-cyan-400">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        description.length >= 2000 ? 'text-rose-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {description.length} / 2000
                    </span>
                  </div>
                  <textarea
                    id="issue-description"
                    required
                    maxLength={2000}
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us what happened, what you expected, and how we can reproduce it..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-colors resize-none placeholder:text-slate-600"
                  />
                </div>

                {/* Screenshot / Image Attachment (Upload, Paste & Drag/Drop) */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Screenshot / Image <span className="text-slate-500 font-normal">(optional)</span>
                  </label>

                  {screenshot ? (
                    <div className="space-y-1.5">
                      <div className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={screenshot}
                            alt="Attached Screenshot"
                            className="w-10 h-10 object-cover rounded-lg border border-slate-800 bg-slate-950 shrink-0"
                          />
                          <div className="truncate text-xs">
                            <p className="font-medium text-slate-200 truncate">{screenshotName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{screenshotSize}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeScreenshot}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                          title="Remove attached screenshot"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
                        <span className="text-slate-500 text-[10px]">
                          Press <kbd className="px-1 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">Ctrl+V</kbd> to replace from clipboard
                        </span>
                        <button
                          type="button"
                          onClick={triggerFileBrowser}
                          className="flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition-colors text-xs"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                          <span>Add another image</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={triggerFileBrowser}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`p-2.5 px-3.5 rounded-xl border border-dashed transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isDragging
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                          <PhotoIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-200 text-xs">
                            <span>Click to browse</span>
                            <span className="text-slate-500 font-normal">·</span>
                            <span className="text-cyan-400 font-semibold">Ctrl+V to paste</span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            Select an image file or press <kbd className="px-1 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">Ctrl+V</kbd> anywhere
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-medium transition-colors shrink-0">
                        <FolderOpenIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Browse</span>
                      </div>
                    </div>
                  )}

                  {/* Native Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        processImageFile(file, file.name);
                      }
                      e.target.value = '';
                    }}
                  />
                </div>

                {/* Diagnostic Metadata Toggle & Privacy Safeguard */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-slate-950"
                    />
                    <div className="text-xs flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-300 group-hover:text-slate-200 transition-colors">
                        Include diagnostic information
                      </span>
                      <span className="text-[10px] text-slate-500">
                        (Browser, OS, screen size, & tool error state)
                      </span>
                    </div>
                  </label>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-[10px] text-cyan-300/90 font-mono">
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Uploaded PDF files and document content are NEVER attached.</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={status === 'submitting' || !description.trim()}
                    className="flex items-center gap-2 px-5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
                  >
                    {status === 'submitting' ? (
                      <>
                        <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-slate-950" />
                        <span>Sending report...</span>
                      </>
                    ) : (
                      <span>Send Report</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
