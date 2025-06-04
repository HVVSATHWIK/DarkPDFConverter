import React, { useState } from 'react';
import { DarkModeOptions, ThemeName } from '@/hooks/useDarkMode'; // Assuming ThemeName is exported

interface DarkModeControlsProps {
  onSettingsChange: (options: DarkModeOptions) => void;
  currentOptions: DarkModeOptions; // To initialize controls with current settings
  // isProcessing: boolean; // Will be used if we have a dedicated apply button here
}

const themes: ThemeName[] = ['dark', 'darker', 'darkest'];

const DarkModeControls: React.FC<DarkModeControlsProps> = ({ onSettingsChange, currentOptions }) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(currentOptions.theme || 'dark');
  // const [brightness, setBrightness] = useState(currentOptions.brightness || 1);
  // const [contrast, setContrast] = useState(currentOptions.contrast || 1);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = event.target.value as ThemeName;
    setSelectedTheme(newTheme);
    onSettingsChange({ theme: newTheme /*, brightness, contrast */ });
  };

  // Add handlers for brightness/contrast if/when sliders are implemented
  // const handleBrightnessChange = (event: React.ChangeEvent<HTMLInputElement>) => { ... };
  // const handleContrastChange = (event: React.ChangeEvent<HTMLInputElement>) => { ... };

  return (
    <div className="p-4 space-y-4 bg-gray-800 rounded-md shadow">
      <h3 className="text-lg font-semibold text-white">Dark Mode Settings</h3>

      <div>
        <label htmlFor="theme-select" className="block text-sm font-medium text-gray-300 mb-1">
          Theme
        </label>
        <select
          id="theme-select"
          name="theme"
          value={selectedTheme}
          onChange={handleThemeChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
       <p className="text-xs text-gray-400 mt-2">
        Select a theme. The changes will be applied when you process the PDF.
      </p>
    </div>
  );
};

export default DarkModeControls;
