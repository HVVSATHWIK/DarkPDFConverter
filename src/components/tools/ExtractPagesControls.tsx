import { ExtractOptions } from '@/hooks/useExtractPages';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface ExtractPagesControlsProps {
    onSettingsChange: (settings: ExtractOptions | null) => void;
    currentOptions: ExtractOptions | null;
}

export default function ExtractPagesControls({ onSettingsChange, currentOptions }: ExtractPagesControlsProps) {
    const [inputStr, setInputStr] = useState(currentOptions?.pageNumbers.join(", ") || "");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputStr(val);

        // Parse "1, 3-5, 8" into array
        try {
            const parts = val.split(',').map(s => s.trim()).filter(s => s !== "");
            const pages: number[] = [];

            parts.forEach(part => {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(Number);
                    if (!isNaN(start) && !isNaN(end) && start < end) {
                        for (let i = start; i <= end; i++) pages.push(i);
                    }
                } else {
                    const num = Number(part);
                    if (!isNaN(num)) pages.push(num);
                }
            });

            // Remove duplicates and sort
            const uniquePages = Array.from(new Set(pages)).sort((a, b) => a - b);

            if (uniquePages.length > 0) {
                onSettingsChange({ pageNumbers: uniquePages });
            } else {
                onSettingsChange(null);
            }
        } catch (err) {
            onSettingsChange(null);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-4">
            <h3 className="text-gray-200 font-medium flex items-center gap-2">
                <DocumentDuplicateIcon className="w-5 h-5 text-green-400" />
                Extract Pages
            </h3>

            <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider">Page Numbers</label>
                <input
                    type="text"
                    placeholder="e.g. 1, 3-5, 8"
                    value={inputStr}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-slate-500">
                    Enter exact page numbers separated by commas, or ranges with a hyphen.
                </p>
            </div>
        </div>
    );
}
