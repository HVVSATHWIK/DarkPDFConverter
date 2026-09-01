import React, { useEffect, useRef, useState } from 'react';
import { DarkModeOptions, DarkModeRenderMode, ThemeName } from '@/hooks/useDarkMode';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface DarkModeControlsProps {
  onSettingsChange: (options: DarkModeOptions) => void;
  currentOptions: DarkModeOptions; // To initialize controls with current settings
  embedded?: boolean;
  // isProcessing: boolean; // Will be used if we have a dedicated apply button here
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
  dark: 'Classic dark slate theme with balanced contrast.',
  darker: 'Deep charcoal modern theme.',
  darkest: 'Pure OLED black for maximum contrast.',
  sepia: 'Warm amber & parchment tone for relaxed reading.',
  midnight: 'Deep navy blue with moonlight accents.',
  slate: 'Cool graphite gray theme with softer highlights.',
};
const modes: { value: DarkModeRenderMode; label: string; hint: string }[] = [
  {
    value: 'preserve-images',
    label: 'Preserve images (recommended)',
    hint: 'Keeps photos closer to original colors (less inversion).'
  },
  {
    value: 'invert',
    label: 'Invert everything (classic)',
    hint: 'Best for pure text PDFs, but photos may invert colors.'
  },
];

const DarkModeControls: React.FC<DarkModeControlsProps> = ({ onSettingsChange, currentOptions, embedded = false }) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(currentOptions.theme || 'dark');
  const [selectedMode, setSelectedMode] = useState<DarkModeRenderMode>(currentOptions.mode || 'preserve-images');
  const didEmitDefaultsRef = useRef(false);
  // const [brightness, setBrightness] = useState(currentOptions.brightness || 1);
  // const [contrast, setContrast] = useState(currentOptions.contrast || 1);

  // Keep local state in sync with parent updates (e.g., tool switching resets).
  useEffect(() => {
    const effectiveTheme: ThemeName = currentOptions.theme || 'dark';
    const effectiveMode: DarkModeRenderMode = currentOptions.mode || 'preserve-images';

    setSelectedTheme(effectiveTheme);
    setSelectedMode(effectiveMode);

    // If parent didn't provide keys, emit effective defaults once.
    // This prevents UI and processing options from drifting.
    if (!didEmitDefaultsRef.current && (!currentOptions.theme || !currentOptions.mode)) {
      didEmitDefaultsRef.current = true;
      onSettingsChange({ theme: effectiveTheme, mode: effectiveMode });
    }
  }, [currentOptions.mode, currentOptions.theme, onSettingsChange]);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = event.target.value as ThemeName;
    setSelectedTheme(newTheme);
    onSettingsChange({ theme: newTheme, mode: selectedMode /*, brightness, contrast */ });
  };

  const setTheme = (theme: ThemeName) => {
    setSelectedTheme(theme);
    onSettingsChange({ theme, mode: selectedMode });
  };

  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = event.target.value as DarkModeRenderMode;
    setSelectedMode(newMode);
    onSettingsChange({ theme: selectedTheme, mode: newMode });
  };

  // Add handlers for brightness/contrast if/when sliders are implemented
  // const handleBrightnessChange = (event: React.ChangeEvent<HTMLInputElement>) => { ... };
  // const handleContrastChange = (event: React.ChangeEvent<HTMLInputElement>) => { ... };

  return (
    <div className={embedded ? 'space-y-4' : 'p-4 space-y-4 panel-surface'}>
      {!embedded && <h3 className="text-lg font-semibold text-white">Dark Mode Settings</h3>}

      <div>
        <label htmlFor="mode-select" className="block text-sm font-medium text-slate-200 mb-1">
          Mode
        </label>
        <select
          id="mode-select"
          name="mode"
          value={selectedMode}
          onChange={handleModeChange}
          className="mt-1 block control-field"
        >
          {modes.map(m => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-300/80 mt-2">
          {modes.find(m => m.value === selectedMode)?.hint}
        </p>
      </div>

      <div>
        <label htmlFor="theme-select" className="block text-sm font-medium text-slate-200 mb-1">
          Theme
        </label>
        <div className="flex items-center gap-3">
          <div
            className={
              'h-9 w-9 rounded-xl border border-white/10 shadow-inner shadow-black/20 ' +
              themeSwatches[selectedTheme].className
            }
            aria-hidden="true"
          />
          <select
            id="theme-select"
            name="theme"
            value={selectedTheme}
            onChange={handleThemeChange}
            className="sr-only"
          >
            {themes.map(themeName => (
              <option key={themeName} value={themeName}>
                {themeSwatches[themeName].label}
              </option>
            ))}
          </select>
          <div className="text-sm font-semibold text-slate-100">
            {themeSwatches[selectedTheme].label}
          </div>
        </div>

        <p className="text-xs text-slate-300/80 mt-2">
          {themeDescriptions[selectedTheme]}
        </p>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {themes.map(themeName => {
            const isActive = themeName === selectedTheme;
            return (
              <button
                key={themeName}
                type="button"
                onClick={() => setTheme(themeName)}
                className={
                  'relative flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ' +
                  (isActive
                    ? 'border-indigo-400/70 bg-indigo-500/10 ring-2 ring-indigo-400/30'
                    : 'border-white/10 bg-white/5 hover:bg-white/10')
                }
                aria-pressed={isActive}
                aria-label={`Theme: ${themeSwatches[themeName].label}`}
              >
                <span
                  className={
                    'h-4 w-4 rounded-md border border-white/10 ' + themeSwatches[themeName].className
                  }
                  aria-hidden="true"
                />
                <span className="text-xs font-medium text-slate-100">{themeSwatches[themeName].label}</span>

                {isActive && (
                  <span className="absolute right-2 top-2 text-indigo-200" aria-hidden="true">
                    <CheckCircleIcon className="w-4 h-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Placeholder for Brightness and Contrast Sliders */}
      {/*
      <div>
        <label htmlFor="brightness-slider" className="block text-sm font-medium text-gray-300">Brightness: {brightness}</label>
        <input type="range" id="brightness-slider" name="brightness" min="0.5" max="1.5" step="0.1" value={brightness} onChange={handleBrightnessChange} className="w-full" />
      </div>
      <div>
        <label htmlFor="contrast-slider" className="block text-sm font-medium text-gray-300">Contrast: {contrast}</label>
        <input type="range" id="contrast-slider" name="contrast" min="0.5" max="1.5" step="0.1" value={contrast} onChange={handleContrastChange} className="w-full" />
      </div>
      */}

      {/* The main "Process" button is in PDFProcessor.tsx.
          This component now only manages settings.
      */}
      <p className="text-xs text-slate-300/80 mt-2">
        Tip: changes auto-apply after a moment; use Apply to refresh instantly.
      </p>
    </div>
  );
};

export default DarkModeControls;
