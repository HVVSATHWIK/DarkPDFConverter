import { ImageToPdfOptions } from '@/hooks/useImagesToPdf';

interface ImagesToPDFControlsProps {
  currentOptions?: ImageToPdfOptions;
  onSettingsChange: (options: ImageToPdfOptions) => void;
}

export default function ImagesToPDFControls({
  currentOptions = { pageSize: 'fit', margin: 0 },
  onSettingsChange,
}: ImagesToPDFControlsProps) {
  const pageSize = currentOptions.pageSize ?? 'fit';
  const margin = currentOptions.margin ?? 0;

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="text-xs font-semibold text-slate-200">Page Sizing &amp; Layout</div>

      {/* Page Size Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-slate-400 font-medium">Page Dimensions</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onSettingsChange({ ...currentOptions, pageSize: 'fit' })}
            className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
              pageSize === 'fit'
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Fit Image (Original)
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ ...currentOptions, pageSize: 'a4' })}
            className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
              pageSize === 'a4'
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            A4 Standard
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ ...currentOptions, pageSize: 'letter' })}
            className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
              pageSize === 'letter'
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            US Letter
          </button>
        </div>
      </div>

      {/* Margin Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-slate-400 font-medium">Page Margins</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onSettingsChange({ ...currentOptions, margin: 0 })}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
              margin === 0
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            No Margin (0)
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ ...currentOptions, margin: 18 })}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
              margin === 18
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Small (18pt)
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ ...currentOptions, margin: 36 })}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
              margin === 36
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Wide (36pt)
          </button>
        </div>
      </div>
    </div>
  );
}
