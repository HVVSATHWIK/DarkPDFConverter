import { RotateOptions } from '@/hooks/useRotatePDF';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface RotatePDFControlsProps {
    onSettingsChange: (settings: RotateOptions) => void;
    currentOptions: RotateOptions | null;
}

export default function RotatePDFControls({ onSettingsChange, currentOptions }: RotatePDFControlsProps) {

    const handleRotationChange = (degrees: 90 | 180 | 270) => {
        onSettingsChange({
            degrees,
            rotationType: 'all' // Default strictly to 'all' for v1
        });
    };

    const activeDegrees = currentOptions?.degrees;

    return (
        <div className="p-4 panel-surface space-y-4">
            <h3 className="text-slate-200 font-semibold flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5 text-indigo-300" />
                Rotation Settings
            </h3>

            <div className="grid grid-cols-3 gap-3">
                {[90, 180, 270].map((deg) => (
                    <button
                        key={deg}
                        onClick={() => handleRotationChange(deg as 90 | 180 | 270)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all
                    ${activeDegrees === deg
                                ? 'bg-indigo-500/25 text-white shadow-lg ring-1 ring-white/15'
                                : 'bg-black/20 text-slate-200 hover:bg-white/10 border border-white/10'
                            }`}
                    >
                        Rotate {deg}°
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-300/70">
                Choose how many degrees to rotate all pages clockwise.
            </p>
        </div>
    );
}
