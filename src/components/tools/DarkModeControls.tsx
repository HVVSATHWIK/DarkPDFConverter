import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DarkModeOptions, DarkModeRenderMode, ThemeName } from '@/hooks/useDarkMode';
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

interface DarkModeControlsProps {
  onSettingsChange: (options: DarkModeOptions) => void;
  currentOptions: DarkModeOptions;
  embedded?: boolean;
}

const themes: ThemeName[] = ['dark', 'darker', 'darkest', 'sepia', 'midnight', 'slate'];

const themeSwatches: Record<ThemeName, { label: string; className: string }> = {
  dark: { label: 'Dark', className: 'bg-[#171c26] border border-slate-700' },
  darker: { label: 'Darker', className: 'bg-[#0f0f14] border border-zinc-800' },
  darkest: { label: 'Darkest', className: 'bg-black border border-neutral-800' },
  sepia: { label: 'Sepia', className: 'bg-[#2e1f12] border border-amber-800' },
  midnight: { label: 'Midnight', className: 'bg-[#0d172e] border border-indigo-800' },
  slate: { label: 'Slate', className: 'bg-[#242933] border border-slate-600' },
};

const themeDescriptions: Record<ThemeName, string> = {
  dark: 'Classic dark slate with balanced contrast.',
  darker: 'Deep charcoal modern dark style.',
  darkest: 'Pure OLED black for maximum contrast.',
  sepia: 'Warm amber & parchment tone for relaxed reading.',
  midnight: 'Deep navy blue with moonlight accents.',
  slate: 'Cool graphite gray with softer highlights.',
};

const modes: { value: DarkModeRenderMode; label: string; hint: string }[] = [
  {
    value: 'text-focused',
    label: 'Text Focused',
    hint: 'Best for text documents & contracts. High clarity.'
  },
  {
    value: 'image-preserve',
    label: 'Image Preserve',
    hint: 'Preserves colors in photos & diagrams.'
  },
  {
    value: 'invert',
    label: 'High Contrast Invert',
    hint: 'Maximum darkness invert. Fast.'
  },
];

const DarkModeControls: React.FC<DarkModeControlsProps> = ({ onSettingsChange, currentOptions, embedded = false }) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(currentOptions.theme || 'dark');
  const [selectedMode, setSelectedMode] = useState<DarkModeRenderMode>(currentOptions.mode || 'text-focused');
  const [showTip, setShowTip] = useState(false);
  const didEmitDefaultsRef = useRef(false);

  // Keep local state in sync with parent updates (e.g., tool switching resets).
  useEffect(() => {
    const effectiveTheme: ThemeName = currentOptions.theme || 'dark';
    const effectiveMode: DarkModeRenderMode = currentOptions.mode || 'text-focused';

    setSelectedTheme(effectiveTheme);
    setSelectedMode(effectiveMode);

    // If parent didn't provide keys, emit effective defaults once.
    if (!didEmitDefaultsRef.current && (!currentOptions.theme || !currentOptions.mode)) {
      didEmitDefaultsRef.current = true;
      onSettingsChange({ ...currentOptions, theme: effectiveTheme, mode: effectiveMode });
    }
  }, [currentOptions, onSettingsChange]);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = event.target.value as ThemeName;
    setSelectedTheme(newTheme);
    onSettingsChange({ ...currentOptions, theme: newTheme, mode: selectedMode });
  };

  const setTheme = (theme: ThemeName) => {
    setSelectedTheme(theme);
    onSettingsChange({ ...currentOptions, theme, mode: selectedMode });
  };

  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = event.target.value as DarkModeRenderMode;
    setSelectedMode(newMode);
    onSettingsChange({ ...currentOptions, theme: selectedTheme, mode: newMode });
  };

  return (
    <div className={embedded ? 'space-y-3' : 'p-3.5 space-y-3 panel-surface'}>
      {!embedded && <h3 className="text-base font-semibold text-white">Dark Mode Settings</h3>}

      {/* Combined Single Section: Mode & Theme with Info Tooltip */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        {/* Header row with Title and Tooltip Popover */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Theme & Mode
            </span>
          </div>

          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setShowTip((prev) => !prev)}
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              className="text-slate-400 hover:text-cyan-400 transition-colors p-0.5 rounded focus:outline-none"
              aria-label="Theme & Mode Information"
            >
              <InformationCircleIcon className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showTip && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  className="absolute z-50 right-0 top-6 w-60 p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-[11px] text-slate-300 leading-snug space-y-1"
                >
                  <p className="font-semibold text-white">Live Real-time Preview</p>
                  <p>
                    Changes auto-apply to the preview canvas immediately. Click &quot;Apply Dark Mode &amp; Generate PDF&quot; to build the downloadable file.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 1. Mode Selector */}
        <div className="space-y-1">
          <label htmlFor="mode-select" className="block text-[11px] font-semibold text-slate-300">
            Mode
          </label>
          <select
            id="mode-select"
            name="mode"
            value={selectedMode}
            onChange={handleModeChange}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/40 transition-colors"
          >
            {modes.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400">
            {modes.find((m) => m.value === selectedMode)?.hint}
          </p>
        </div>

        {/* 2. Theme Selector */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
          <div className="flex items-center justify-between">
            <label htmlFor="theme-select" className="block text-[11px] font-semibold text-slate-300">
              Theme
            </label>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-3 w-3 rounded-full border border-white/20 ${themeSwatches[selectedTheme].className}`}
                aria-hidden="true"
              />
              <span className="text-[11px] font-medium text-cyan-400">
                {themeSwatches[selectedTheme].label}
              </span>
            </div>
            {/* Hidden native select for standard accessibility / test suites */}
            <select
              id="theme-select"
              name="theme"
              value={selectedTheme}
              onChange={handleThemeChange}
              className="sr-only"
            >
              {themes.map((themeName) => (
                <option key={themeName} value={themeName}>
                  {themeSwatches[themeName].label}
                </option>
              ))}
            </select>
          </div>

          {/* 6-Theme Compact 3x2 Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {themes.map((themeName) => {
              const isActive = themeName === selectedTheme;
              return (
                <button
                  key={themeName}
                  type="button"
                  onClick={() => setTheme(themeName)}
                  className={`relative flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left transition cursor-pointer ${
                    isActive
                      ? 'border-cyan-400/80 bg-cyan-500/10 ring-1 ring-cyan-400/40 text-cyan-300 font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                  aria-pressed={isActive}
                  aria-label={`Theme: ${themeSwatches[themeName].label}`}
                >
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full border border-white/10 ${themeSwatches[themeName].className}`}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] truncate flex-1">{themeSwatches[themeName].label}</span>

                  {isActive && (
                    <CheckCircleIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 pt-0.5">
            {themeDescriptions[selectedTheme]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DarkModeControls;
