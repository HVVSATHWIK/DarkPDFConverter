import React, { useEffect, useRef, useState } from 'react';
import { DarkModeOptions, DarkModeRenderMode, ThemeName } from '@/hooks/useDarkMode';

interface DarkModeControlsProps {
  onSettingsChange: (options: DarkModeOptions) => void;
  currentOptions: DarkModeOptions; // To initialize controls with current settings
  // isProcessing: boolean; // Will be used if we have a dedicated apply button here
}

const themes: ThemeName[] = ['dark', 'darker', 'darkest'];
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

const DarkModeControls: React.FC<DarkModeControlsProps> = ({ onSettingsChange, currentOptions }) => {
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

  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = event.target.value as DarkModeRenderMode;
    setSelectedMode(newMode);
    onSettingsChange({ theme: selectedTheme, mode: newMode });
  };

  // Add handlers for brightness/contrast if/when sliders are implemented
  // const handleBrightnessChange = (event: React.ChangeEvent<HTMLInputElement>) => { ... };
  // const handleContrastChange = (event: React.ChangeEvent<HTMLInputElement>) => { ... };

  return (
    <div className="p-4 space-y-4 panel-surface">
      <h3 className="text-lg font-semibold text-white">Dark Mode Settings</h3>

      <div>
        <label htmlFor="mode-select" className="block text-sm font-medium text-gray-300 mb-1">
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
        <p className="text-xs text-slate-300/70 mt-2">
          {modes.find(m => m.value === selectedMode)?.hint}
        </p>
      </div>

      <div>
        <label htmlFor="theme-select" className="block text-sm font-medium text-gray-300 mb-1">
          Theme
        </label>
        <select
          id="theme-select"
          name="theme"
          value={selectedTheme}
          onChange={handleThemeChange}
          className="mt-1 block control-field"
        >
          {themes.map(themeName => (
            <option key={themeName} value={themeName}>
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </option>
          ))}
        </select>
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
       <p className="text-xs text-slate-300/70 mt-2">
        Select a theme. The changes will be applied when you process the PDF.
      </p>
    </div>
  );
};

export default DarkModeControls;
