import React, { useState, useEffect } from 'react';
import { SplitOptions } from '@/hooks/useSplitPDF';

interface SplitPDFControlsProps {
  onSettingsChange: (options: SplitOptions | null) => void; // Allow null if invalid
  currentOptions: SplitOptions | null;
  // totalPages: number | null; // Could be passed if known after PDF load
}

const SplitPDFControls: React.FC<SplitPDFControlsProps> = ({ onSettingsChange, currentOptions }) => {
  const [startPage, setStartPage] = useState<string>(currentOptions?.startPage.toString() || '1');
  const [endPage, setEndPage] = useState<string>(currentOptions?.endPage.toString() || '');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Initialize with currentOptions if provided
    setStartPage(currentOptions?.startPage.toString() || '1');
    setEndPage(currentOptions?.endPage.toString() || '');
  }, [currentOptions]);

  const handleInputChange = () => {
    const startNum = parseInt(startPage, 10);
    const endNum = parseInt(endPage, 10);
    let currentError = '';

    if (isNaN(startNum) || startNum < 1) {
      currentError = 'Start page must be a number greater than 0.';
    } else if (endPage !== '' && (isNaN(endNum) || endNum < startNum)) {
      currentError = 'End page must be a number greater than or equal to start page.';
    }
    // Additional validation if totalPages were known:
    // else if (totalPages && startNum > totalPages) currentError = `Start page exceeds total pages (${totalPages}).`;
    // else if (totalPages && endNum > totalPages) currentError = `End page exceeds total pages (${totalPages}).`;


    setError(currentError);

    if (!currentError && !isNaN(startNum) && !isNaN(endNum) && endPage !== '') {
      onSettingsChange({ startPage: startNum, endPage: endNum });
    } else if (!currentError && !isNaN(startNum) && endPage === '') { // Allow valid start page if end page is empty
      onSettingsChange(null); // Or some incomplete state
    }
     else {
      onSettingsChange(null); // Invalid settings
    }
  };

  // Call handleInputChange on mount and when startPage/endPage changes to validate and propagate
  useEffect(() => {
    handleInputChange();
  }, [startPage, endPage]);


  return (
    <div className="p-4 space-y-4 bg-gray-800 rounded-md shadow">
      <h3 className="text-lg font-semibold text-white">Split PDF Settings</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startPage" className="block text-sm font-medium text-gray-300">
            Start Page
          </label>
          <input
            type="number"
            name="startPage"
            id="startPage"
            min="1"
            value={startPage}
            onChange={(e) => setStartPage(e.target.value)}
            // onBlur={handleInputChange} // Validate on blur or instantly via useEffect
            className="mt-1 block w-full pl-3 pr-3 py-2 border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            placeholder="e.g., 1"
          />
        </div>
        <div>
          <label htmlFor="endPage" className="block text-sm font-medium text-gray-300">
            End Page
          </label>
          <input
            type="number"
            name="endPage"
            id="endPage"
            min={startPage || "1"}
            value={endPage}
            onChange={(e) => setEndPage(e.target.value)}
            // onBlur={handleInputChange}
            className="mt-1 block w-full pl-3 pr-3 py-2 border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            placeholder="e.g., 5"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <p className="text-xs text-gray-400 mt-2">
        Specify the page range (inclusive) to extract into a new PDF.
      </p>
    </div>
  );
};

export default SplitPDFControls;
