import React, { useEffect, useState } from 'react';
import { CompressOptions, CompressionLevel, CompressionEngine } from '@/hooks/useCompressPDF';
import {
  SparklesIcon,
  AdjustmentsVerticalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface OptimizePDFControlsProps {
  onSettingsChange: (options: CompressOptions) => void;
  currentOptions?: CompressOptions;
}

export const OptimizePDFControls: React.FC<OptimizePDFControlsProps> = ({
  onSettingsChange,
  currentOptions,
}) => {
  const [level, setLevel] = useState<CompressionLevel>(currentOptions?.level || 'recommended');
  const [engine, setEngine] = useState<CompressionEngine>(currentOptions?.engine || 'vector');
  const [jpegQuality, setJpegQuality] = useState<number>(currentOptions?.jpegQuality || 0.72);
  const [maxDpi, setMaxDpi] = useState<number>(currentOptions?.maxDpi || 150);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

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
    let newQuality = 0.72;
    let newDpi = 150;

    if (newLevel === 'recommended') {
      newEngine = 'vector';
      newQuality = 0.72;
      newDpi = 120;
    } else if (newLevel === 'low') {
      newEngine = 'vector';
      newQuality = 0.82;
      newDpi = 150;
    } else if (newLevel === 'extreme') {
      newEngine = 'raster';
      newQuality = 0.58;
      newDpi = 96;
    } else if (newLevel === 'custom') {
      newEngine = engine;
      newQuality = jpegQuality;
      newDpi = maxDpi;
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
    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-slate-200 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Optimization
        </span>
      </div>

      {/* Default Collapsed Option: Smart Optimization */}
      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs">
            <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Smart Optimization</span>
          </div>
          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
            Default
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Automatically chooses the best strategy based on document content.
        </p>
      </div>

      {/* Advanced Settings Accordion */}
      <div>
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full py-1.5 px-2 flex items-center justify-between text-[11px] font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <AdjustmentsVerticalIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Advanced Settings</span>
          </span>
          {isAdvancedOpen ? (
            <ChevronUpIcon className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {isAdvancedOpen && (
          <div className="mt-2 p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2.5 text-xs animate-fadeIn">
            {/* Strategy Presets */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Optimization Strategy
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectLevel('recommended')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    level === 'recommended'
                      ? 'bg-cyan-950/60 text-white border-cyan-500/50 font-semibold'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold">Smart Auto</div>
                  <div className="text-[10px] text-slate-400 leading-tight">Auto content detection</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectLevel('low')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    level === 'low'
                      ? 'bg-cyan-950/60 text-white border-cyan-500/50 font-semibold'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold">Vector / Text Preserved</div>
                  <div className="text-[10px] text-slate-400 leading-tight">Lossless stream deflation</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectLevel('extreme')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    level === 'extreme'
                      ? 'bg-cyan-950/60 text-white border-cyan-500/50 font-semibold'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold">Scanned Document</div>
                  <div className="text-[10px] text-slate-400 leading-tight">High-DPI rasterization</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectLevel('custom')}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    level === 'custom'
                      ? 'bg-cyan-950/60 text-white border-cyan-500/50 font-semibold'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold">Custom Mode</div>
                  <div className="text-[10px] text-slate-400 leading-tight">Manual DPI & quality</div>
                </button>
              </div>
            </div>

            {/* Custom Mode Extra Settings */}
            {level === 'custom' && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Engine Selection
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEngineChange('vector')}
                      className={`p-1.5 rounded-lg border flex items-center justify-center gap-1.5 text-[11px] font-medium cursor-pointer ${
                        engine === 'vector'
                          ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      <DocumentTextIcon className="w-3.5 h-3.5" />
                      <span>Vector / Text</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEngineChange('raster')}
                      className={`p-1.5 rounded-lg border flex items-center justify-center gap-1.5 text-[11px] font-medium cursor-pointer ${
                        engine === 'raster'
                          ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      <PhotoIcon className="w-3.5 h-3.5" />
                      <span>Scanned Image</span>
                    </button>
                  </div>
                </div>

                {engine === 'raster' && (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <label htmlFor="custom-quality-slider" className="font-medium text-slate-300">
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
                        className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-[11px] text-slate-300 block">
                        Resolution (DPI)
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {[120, 150, 200, 300].map((dpiVal) => (
                          <button
                            key={dpiVal}
                            type="button"
                            onClick={() => handleDpiChange(dpiVal)}
                            className={`py-1 px-1.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer text-center ${
                              maxDpi === dpiVal
                                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {dpiVal}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizePDFControls;
