import React, { useEffect, useRef, useState } from 'react';
import { DarkModeOptions, DarkModeRenderMode, ThemeName, THEME_CONFIGS } from '@/hooks/useDarkMode';
import { MoonIcon, SunIcon, SparklesIcon, AdjustmentsHorizontalIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface DarkModeControlsProps {
  onSettingsChange: (options: DarkModeOptions) => void;
  currentOptions: DarkModeOptions;
}

const modes: { value: DarkModeRenderMode; label: string; hint: string; icon: React.ReactNode }[] = [
  {
    value: 'preserve-images',
    label: 'Preserve Images',
    hint: 'Keeps photos closer to original colors (recommended)',
    icon: <PhotoIcon className="w-5 h-5" />
  },
  {
    value: 'invert',
    label: 'Full Invert',
    hint: 'Best for pure text PDFs, but inverts all colors',
    icon: <MoonIcon className="w-5 h-5" />
  },
];

const DarkModeControls: React.FC<DarkModeControlsProps> = ({ onSettingsChange, currentOptions }) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(currentOptions.theme || 'dark');
  const [selectedMode, setSelectedMode] = useState<DarkModeRenderMode>(currentOptions.mode || 'preserve-images');
  const [brightness, setBrightness] = useState(currentOptions.brightness || 1.0);
  const [contrast, setContrast] = useState(currentOptions.contrast || 1.0);
  const didEmitDefaultsRef = useRef(false);

  useEffect(() => {
    const effectiveTheme: ThemeName = currentOptions.theme || 'dark';
    const effectiveMode: DarkModeRenderMode = currentOptions.mode || 'preserve-images';
    const effectiveBrightness = currentOptions.brightness ?? 1.0;
    const effectiveContrast = currentOptions.contrast ?? 1.0;

    setSelectedTheme(effectiveTheme);
    setSelectedMode(effectiveMode);
    setBrightness(effectiveBrightness);
    setContrast(effectiveContrast);

    if (!didEmitDefaultsRef.current) {
      didEmitDefaultsRef.current = true;
      onSettingsChange({
        theme: effectiveTheme,
        mode: effectiveMode,
        brightness: effectiveBrightness,
        contrast: effectiveContrast
      });
    }
  }, [currentOptions, onSettingsChange]);

  const handleThemeChange = (newTheme: ThemeName) => {
    setSelectedTheme(newTheme);
    onSettingsChange({ theme: newTheme, mode: selectedMode, brightness, contrast });
  };

  const handleModeChange = (newMode: DarkModeRenderMode) => {
    setSelectedMode(newMode);
    onSettingsChange({ theme: selectedTheme, mode: newMode, brightness, contrast });
  };

  const handleBrightnessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBrightness = parseFloat(event.target.value);
    setBrightness(newBrightness);
    onSettingsChange({ theme: selectedTheme, mode: selectedMode, brightness: newBrightness, contrast });
  };

  const handleContrastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newContrast = parseFloat(event.target.value);
    setContrast(newContrast);
    onSettingsChange({ theme: selectedTheme, mode: selectedMode, brightness, contrast: newContrast });
  };

  const getThemeColorPreview = (themeName: ThemeName) => {
    const config = THEME_CONFIGS[themeName];
    const bgColor = `rgb(${Math.round(config.backgroundColor.r * 255)}, ${Math.round(config.backgroundColor.g * 255)}, ${Math.round(config.backgroundColor.b * 255)})`;
    return bgColor;
  };

  return (
    <div className="p-4 space-y-6 panel-surface">
      <div className="flex items-center gap-2">
        <MoonIcon className="w-6 h-6 text-indigo-300" />
        <h3 className="text-lg font-semibold text-white">Dark Mode Settings</h3>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Processing Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modes.map(m => (
            <button
              key={m.value}
              onClick={() => handleModeChange(m.value)}
              className={`p-3 rounded-lg text-left transition-all border ${selectedMode === m.value
                  ? 'bg-indigo-500/25 border-indigo-400/50 text-white shadow-lg'
                  : 'bg-black/20 border-white/10 text-slate-200 hover:bg-white/10'
                }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {m.icon}
                <span className="font-medium text-sm">{m.label}</span>
              </div>
              <p className="text-xs text-slate-300/70">{m.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Color Theme
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(THEME_CONFIGS) as ThemeName[]).map(themeName => {
            const config = THEME_CONFIGS[themeName];
            return (
              <button
                key={themeName}
                onClick={() => handleThemeChange(themeName)}
                className={`p-3 rounded-lg transition-all border text-left ${selectedTheme === themeName
                    ? 'bg-white/10 border-white/20 shadow-lg ring-2 ring-indigo-400/50'
                    : 'bg-black/20 border-white/10 hover:bg-white/5'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-md border border-white/20 shadow-inner"
                    style={{ backgroundColor: getThemeColorPreview(themeName) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{config.name}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-300/70">{config.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2 text-slate-200">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-indigo-300" />
          <span className="text-sm font-medium">Fine Tuning</span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="brightness-slider" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <SunIcon className="w-4 h-4" />
                Brightness
              </label>
              <span className="text-sm font-mono text-slate-300 bg-black/30 px-2 py-0.5 rounded">
                {brightness.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              id="brightness-slider"
              name="brightness"
              min="0.5"
              max="1.5"
              step="0.05"
              value={brightness}
              onChange={handleBrightnessChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Darker</span>
              <span>Lighter</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="contrast-slider" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                Contrast
              </label>
              <span className="text-sm font-mono text-slate-300 bg-black/30 px-2 py-0.5 rounded">
                {contrast.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              id="contrast-slider"
              name="contrast"
              min="0.5"
              max="1.5"
              step="0.05"
              value={contrast}
              onChange={handleContrastChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Softer</span>
              <span>Sharper</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-white/10">
        <p className="text-xs text-slate-300/70 flex items-start gap-2">
          <SparklesIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-300" />
          <span>
            Upload your PDF above, adjust settings to your preference, then click the process button to apply dark mode.
          </span>
        </p>
      </div>
    </div>
  );
};

export default DarkModeControls;
