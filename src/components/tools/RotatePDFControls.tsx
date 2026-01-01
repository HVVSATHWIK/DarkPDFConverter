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
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-4">
            <h3 className="text-gray-200 font-medium flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5 text-blue-400" />
                Rotation Settings
            </h3>

            <div className="grid grid-cols-3 gap-3">
                {[90, 180, 270].map((deg) => (
                    <button
                        key={deg}
                        onClick={() => handleRotationChange(deg as 90 | 180 | 270)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all
                    ${activeDegrees === deg
                                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        Rotate {deg}°
                    </button>
                ))}
            </div>
            <p className="text-xs text-gray-500">
                Choose how many degrees to rotate all pages clockwise.
            </p>
        </div>
    );
}
