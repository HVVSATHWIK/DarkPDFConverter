import React, { useEffect, useState } from 'react';
import { CompressOptions, CompressionLevel, CompressionEngine } from '@/hooks/useCompressPDF';
import {
  SparklesIcon,
  RocketLaunchIcon,
  ScaleIcon,
  AdjustmentsVerticalIcon,
  CheckCircleIcon,
  CheckBadgeIcon,
  ArrowsPointingInIcon,
  DocumentTextIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface OptimizePDFControlsProps {
  onSettingsChange: (options: CompressOptions) => void;
  currentOptions?: CompressOptions;
}

const presets: {
  id: CompressionLevel;
  name: string;
  engine: CompressionEngine;
  tagline: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'recommended',
    name: 'Recommended',
    engine: 'vector',
    tagline: '100% Crisp Vector Text',
    badge: 'Popular',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'Deflates object streams and strips metadata while preserving 100% sharp vector fonts & text.',
    icon: SparklesIcon,
  },
  {
    id: 'low',
    name: 'Lossless Vector',
    engine: 'vector',
    tagline: 'Lossless Quality',
    badge: '100% Sharp',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Pure structural optimization. Cleans cross-reference tables and metadata with zero visual loss.',
    icon: ScaleIcon,
  },
  {
    id: 'extreme',
    name: 'Scanned Extreme',
    engine: 'raster',
    tagline: 'High-DPI Downsample',
    badge: 'Smallest',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'For scanned paper documents & photos. Re-encodes pages at 120 DPI and 60% quality.',
    icon: RocketLaunchIcon,
  },
  {
    id: 'custom',
    name: 'Custom Mode',
    engine: 'vector',
    tagline: 'Manual Mode & Quality',
    badge: 'Advanced',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Select between Native Vector or Scanned High-DPI mode, custom DPI, and JPEG compression.',
    icon: AdjustmentsVerticalIcon,
  },
];

export const OptimizePDFControls: React.FC<OptimizePDFControlsProps> = ({
  onSettingsChange,
  currentOptions,
}) => {
  const [level, setLevel] = useState<CompressionLevel>(currentOptions?.level || 'recommended');
  const [engine, setEngine] = useState<CompressionEngine>(currentOptions?.engine || 'vector');
  const [jpegQuality, setJpegQuality] = useState<number>(currentOptions?.jpegQuality || 0.75);
  const [maxDpi, setMaxDpi] = useState<number>(currentOptions?.maxDpi || 150);

  useEffect(() => {
    if (currentOptions) {
      if (currentOptions.level) setLevel(currentOptions.level);
      if (currentOptions.engine) setEngine(currentOptions.engine);
      if (currentOptions.jpegQuality !== undefined) setJpegQuality(currentOptions.jpegQuality);
      if (currentOptions.maxDpi !== undefined) setMaxDpi(currentOptions.maxDpi);
    }
  }, [currentOptions]);

  const handleSelectLevel = (newLevel: CompressionLevel) => {
    setLevel(newLevel);
    let newEngine: CompressionEngine = 'vector';
    let newQuality = 0.75;
    let newDpi = 150;

    if (newLevel === 'recommended') {
      newEngine = 'vector';
      newQuality = 0.62;
      newDpi = 120;
    } else if (newLevel === 'low') {
      newEngine = 'vector';
      newQuality = 0.80;
      newDpi = 150;
    } else if (newLevel === 'extreme') {
      newEngine = 'raster';
      newQuality = 0.48;
      newDpi = 96;
    }

    setEngine(newEngine);
    setJpegQuality(newQuality);
    setMaxDpi(newDpi);

    onSettingsChange({
      level: newLevel,
      engine: newEngine,
      jpegQuality: newQuality,
      maxDpi: newDpi,
      stripMetadata: true,
    });
  };

  const handleEngineChange = (newEngine: CompressionEngine) => {
    setEngine(newEngine);
    setLevel('custom');
    onSettingsChange({
      level: 'custom',
      engine: newEngine,
      jpegQuality,
      maxDpi,
      stripMetadata: true,
    });
  };

  const handleQualitySlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setJpegQuality(val);
    setLevel('custom');
    onSettingsChange({
      level: 'custom',
      engine,
      jpegQuality: val,
      maxDpi,
      stripMetadata: true,
    });
  };

  const handleDpiChange = (newDpi: number) => {
    setMaxDpi(newDpi);
    setLevel('custom');
    onSettingsChange({
      level: 'custom',
      engine,
      jpegQuality,
      maxDpi: newDpi,
      stripMetadata: true,
    });
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-slate-200 shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col gap-1.5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <ArrowsPointingInIcon className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Optimization Settings</span>
          </h3>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <CheckBadgeIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>100% Sharp Text</span>
          </span>
        </div>
      </div>

      {/* Primary Engine Segmented Control */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Processing Engine
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleEngineChange('vector')}
            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
              engine === 'vector'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg shrink-0 ${engine === 'vector' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                <DocumentTextIcon className="w-4 h-4 shrink-0" />
              </div>
              <div className="text-left min-w-0">
                <div className="font-bold text-white text-xs sm:text-sm leading-tight">Vector Text Mode</div>
                <div className="text-[10px] text-slate-400 font-normal truncate">100% Crisp Vector Text</div>
              </div>
            </div>
            {engine === 'vector' && (
              <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleEngineChange('raster')}
            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
              engine === 'raster'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg shrink-0 ${engine === 'raster' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                <PhotoIcon className="w-4 h-4 shrink-0" />
              </div>
              <div className="text-left min-w-0">
                <div className="font-bold text-white text-xs sm:text-sm leading-tight">Scanned Document Mode</div>
                <div className="text-[10px] text-slate-400 font-normal truncate">High-DPI Image Compression</div>
              </div>
            </div>
            {engine === 'raster' && (
              <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Preset Cards Grid (Vertical Stacking Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {presets.map((preset) => {
          const Icon = preset.icon;
          const isSelected = level === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectLevel(preset.id)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-200 relative group cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30 text-white shadow-lg shadow-cyan-500/5'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div>
                {/* Row 1: Top Meta Row (Icon on Left, Badge & Checkmark on Right) */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${preset.badgeColor}`}
                    >
                      {preset.badge}
                    </span>
                    {isSelected && (
                      <CheckCircleIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </div>
                </div>

                {/* Row 2: Full Title (Dedicated row below metadata so name is NEVER truncated) */}
                <h4 className="font-bold text-xs sm:text-sm text-white leading-snug mb-1">
                  {preset.name}
                </h4>

                {/* Row 3: Tagline */}
                <div className="text-[10px] text-cyan-400 font-semibold mb-1.5">
                  {preset.tagline}
                </div>

                {/* Row 4: Description */}
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {preset.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Slider / DPI Controls */}
      {level === 'custom' && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 animate-fadeIn">
          {engine === 'raster' && (
            <>
              {/* Quality Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="custom-quality-slider" className="font-semibold text-slate-200">
                    Scanned JPEG Quality
                  </label>
                  <span className="font-mono font-bold text-cyan-400">
                    {Math.round(jpegQuality * 100)}%
                  </span>
                </div>
                <input
                  id="custom-quality-slider"
                  type="range"
                  min="0.40"
                  max="0.90"
                  step="0.05"
                  value={jpegQuality}
                  onChange={handleQualitySlider}
                  className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Higher Shrink (40%)</span>
                  <span>Higher Sharpness (90%)</span>
                </div>
              </div>

              {/* Max DPI Pills */}
              <div className="space-y-1.5">
                <label className="font-semibold text-xs text-slate-200 block">
                  Scanned Render Resolution (DPI)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[120, 150, 200, 300].map((dpiVal) => (
                    <button
                      key={dpiVal}
                      type="button"
                      onClick={() => handleDpiChange(dpiVal)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-center ${
                        maxDpi === dpiVal
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {dpiVal} DPI
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {engine === 'vector' && (
            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed">
              <strong>Vector Engine Active:</strong> Preserves 100% of native text glyphs, font shapes, and vector lines. All text remains sharp and selectable regardless of zoom level.
            </div>
          )}
        </div>
      )}

      {/* Quality Guarantee Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
          <CheckBadgeIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Vector text is preserved without raster pixelation</span>
        </span>
        <span className="text-[10px] text-slate-500 font-mono shrink-0">
          PDF 1.5 Object Stream Deflate
        </span>
      </div>
    </div>
  );
};

export default OptimizePDFControls;
