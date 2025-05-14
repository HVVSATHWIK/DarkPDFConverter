import React, { useCallback } from 'react';
import { usePdfSettings } from '../hooks/usePdfSettings';
import { debounce } from 'lodash';

const ThemeSettings: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    brightness, 
    setBrightness, 
    contrast, 
    setContrast 
  } = usePdfSettings();

  const debouncedSetBrightness = useCallback(
    debounce((value: number) => setBrightness(value), 300), 
    [setBrightness]
  );

  const debouncedSetContrast = useCallback(
    debounce((value: number) => setContrast(value), 300), 
    [setContrast]
  );

  return (
    <section className="theme-settings">
      <h2 className="section-title">Display Settings</h2>
      
      <div className="theme-selector">
        <label htmlFor="themeSelect">Color Theme:</label>
        <select
          id="themeSelect"
          value={theme}
          onChange={(e) => setTheme(e.target.value as typeof theme)}
          className="theme-dropdown"
        >
          <option value="dark">Dark</option>
          <option value="darker">Darker</option>
          <option value="darkest">Darkest</option>
        </select>
      </div>

      <div className="slider-group">
        <label htmlFor="brightness">Brightness: {brightness}%</label>
        <input
          type="range"
          id="brightness"
          min={50}
          max={150}
          value={brightness}
          onChange={(e) => debouncedSetBrightness(Number(e.target.value))}
          className="slider"
        />
      </div>

      <div className="slider-group">
        <label htmlFor="contrast">Contrast: {contrast}%</label>
        <input
          type="range"
          id="contrast"
          min={50}
          max={150}
          value={contrast}
          onChange={(e) => debouncedSetContrast(Number(e.target.value))}
          className="slider"
        />
      </div>
    </section>
  );
};

export default ThemeSettings;