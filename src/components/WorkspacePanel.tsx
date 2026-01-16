import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { Tool } from '../types';
import PDFProcessorWithErrorBoundary from './PDFProcessor';
import DarkModeControls from './tools/DarkModeControls';
import { DarkModeOptions } from '@/hooks/useDarkMode';
import SplitPDFControls from './tools/SplitPDFControls';
import { SplitOptions } from '@/hooks/useSplitPDF';
import RotatePDFControls from './tools/RotatePDFControls';
import { RotateOptions } from '@/hooks/useRotatePDF';
import ExtractPagesControls from './tools/ExtractPagesControls';
import { ExtractOptions } from '@/hooks/useExtractPages';
import PDFPreview from './common/PDFPreview';
// ...

interface ToolPageProps {
  activeTool: Tool;
}

const RECENTS_KEY = 'litas.recentToolIds';

function pushRecentToolId(id: number) {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const current = raw ? (JSON.parse(raw) as unknown) : [];
    const ids = Array.isArray(current) ? current.filter((v) => typeof v === 'number') : [];
    const next = [id, ...ids.filter((x) => x !== id)].slice(0, 6);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function WorkspacePanel({ activeTool }: ToolPageProps) {
  const location = useLocation();
  const [processedData, setProcessedData] = useState<any>(null);
  const [selectedFilesForPreview, setSelectedFilesForPreview] = useState<File[]>([]);
  const [previewTab, setPreviewTab] = useState<'output' | 'input'>('input');
  const [darkModeSettings, setDarkModeSettings] = useState<DarkModeOptions>({ theme: 'dark' });
  const [splitPdfSettings, setSplitPdfSettings] = useState<SplitOptions | null>(null);
  const [rotateSettings, setRotateSettings] = useState<RotateOptions | null>(null);
  const [extractSettings, setExtractSettings] = useState<ExtractOptions | null>(null);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    setProcessedData(null);
    setSelectedFilesForPreview([]);
    if (activeTool.name !== 'Dark Mode') setDarkModeSettings({ theme: 'dark' });
    if (activeTool.name !== 'Split PDF') setSplitPdfSettings(null);
    if (activeTool.name !== 'Rotate PDF') setRotateSettings(null);
    if (activeTool.name !== 'Extract Pages') setExtractSettings(null);
  }, [activeTool.id, activeTool.name]);

  useEffect(() => {
    // Default to input when selecting files, output when processing completes.
    if (processedData) setPreviewTab('output');
  }, [processedData]);

  useEffect(() => {
    if (selectedFilesForPreview.length > 0 && !processedData) setPreviewTab('input');
  }, [processedData, selectedFilesForPreview.length]);

  useEffect(() => {
    pushRecentToolId(activeTool.id);
  }, [activeTool.id]);

  const handleComplete = (result: any) => {
    console.log(`Processing complete for ${activeTool?.name}:`, result);

    // Deep clone the buffer to prevent "ArrayBuffer detached" errors if 
    // downstream components (like react-pdf workers) transfer/consume it.
    // Use Blob Wrapper Pattern (Architecture Strategy A)
    // Convert ArrayBuffer/Uint8Array to Blob to prevent detachment errors and improve memory efficiency.
    // Blobs are immutable and act as stable file references for react-pdf.
    if (result.processedPdf && !(result.processedPdf instanceof Blob)) {
      result.processedPdf = new Blob([result.processedPdf], { type: 'application/pdf' });
    }

    setProcessedData(result);
  };

  const handleError = (error: Error) => {
    console.error(`Error during processing for ${activeTool?.name}:`, error);
    setProcessedData({ error: error.message });
  };

  const renderToolSpecificUI = () => {
    switch (activeTool.name) {
      case 'Dark Mode':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id}
              activeTool={activeTool}
              allowMultipleFiles={false}
              onComplete={handleComplete}
              onError={handleError}
              onSelectionChange={setSelectedFilesForPreview}
              processActionName="Apply Theme"
              darkModePreviewOptions={darkModeSettings}
              autoProcess
              autoProcessOnSelect
              autoProcessDeps={[darkModeSettings.theme, darkModeSettings.mode]}
              autoProcessDebounceMs={400}
              controls={
                <DarkModeControls
                  onSettingsChange={setDarkModeSettings}
                  currentOptions={darkModeSettings}
                  embedded
                />
              }
              controlsLabel="Theme & Mode"
              trustLabel="Processed locally in your browser — your files stay on your device."
            />
          </>
        );
      case 'Split PDF':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id}
              activeTool={activeTool}
              allowMultipleFiles={false}
              onComplete={handleComplete}
              onError={handleError}
              onSelectionChange={setSelectedFilesForPreview}
              processActionName="Split PDF"
              splitPdfOptions={splitPdfSettings || undefined}
              autoProcess
              autoProcessDeps={[splitPdfSettings?.startPage, splitPdfSettings?.endPage]}
              autoProcessDebounceMs={600}
            />
            <SplitPDFControls
              onSettingsChange={setSplitPdfSettings}
              currentOptions={splitPdfSettings}
            />
          </>
        );
      case 'Merge PDFs':
        return (
          <PDFProcessorWithErrorBoundary
            toolId={activeTool.id}
            activeTool={activeTool}
            allowMultipleFiles={true}
            onComplete={handleComplete}
            onError={handleError}
            onSelectionChange={setSelectedFilesForPreview}
            processActionName="Merge Selected PDFs"
          // Merge is manual to prevent accidental heavy processing
          />
        );
      case 'Rotate PDF':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id}
              activeTool={activeTool}
              allowMultipleFiles={false}
              onComplete={handleComplete}
              onError={handleError}
              onSelectionChange={setSelectedFilesForPreview}
              processActionName="Rotate PDF"
              rotateOptions={rotateSettings || undefined}
              autoProcess
              autoProcessOnSelect
              autoProcessDeps={[rotateSettings?.degrees, rotateSettings?.rotationType]}
            />
            <RotatePDFControls
              onSettingsChange={setRotateSettings}
              currentOptions={rotateSettings}
            />
          </>
        );
      case 'Extract Pages':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id}
              activeTool={activeTool}
              allowMultipleFiles={false}
              onComplete={handleComplete}
              onError={handleError}
              onSelectionChange={setSelectedFilesForPreview}
              processActionName="Extract Pages"
              extractOptions={extractSettings || undefined}
              autoProcess
              autoProcessDeps={[extractSettings?.pageNumbers]}
              autoProcessDebounceMs={600}
            />
            <ExtractPagesControls
              onSettingsChange={setExtractSettings}
              currentOptions={extractSettings}
            />
          </>
        );
      case 'Optimize PDF': // Phase 1: structural optimization (honest naming)
        return (
          <PDFProcessorWithErrorBoundary
            toolId={activeTool.id}
            activeTool={activeTool}
            allowMultipleFiles={false}
            onComplete={handleComplete}
            onError={handleError}
            onSelectionChange={setSelectedFilesForPreview}
            processActionName="Optimize PDF"
          />
        );
      default:
        return <p className="text-gray-400">Tool UI for '{activeTool.name}' not implemented yet.</p>;
    }
  };

  const showTrustLine = location.pathname !== '/';

  return (
    <div className="w-full h-[calc(100vh-64px)] overflow-hidden bg-black">
      {/* SaaS Dashboard Layout: Sidebar (Left) + Preview (Right) */}
      <div className="flex h-full">

        {/* Sidebar: Controls & Input */}
        <aside className="w-full md:w-[360px] shrink-0 border-r border-white/10 flex flex-col bg-[#050505] overflow-y-auto">
          <div className="p-5 space-y-6">

            {/* Header / Nav Back */}
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="group flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                <ArrowUturnLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Tools</span>
              </Link>
              <div className="text-xs font-semibold px-2 py-1 rounded bg-white/5 text-slate-400 border border-white/5">
                {activeTool.name}
              </div>
            </div>

            {/* Main Tool UI (PDFProcessor renders the controls) */}
            <div className="space-y-6">
              {renderToolSpecificUI()}
            </div>

            {/* Trust Footer */}
            {showTrustLine && (
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  Files processed locally in browser.<br />
                  No uploads to server.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Area: Preview */}
        <main className="flex-1 bg-[#0A0A0A] relative flex flex-col min-w-0">
          {/* Preview Toolbar */}
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/20 backdrop-blur-sm z-10">
            <h2 className="text-sm font-semibold text-slate-300">Preview</h2>

            {processedData && selectedFilesForPreview.length > 0 && (
              <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
                <button
                  onClick={() => setPreviewTab('input')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${previewTab === 'input'
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setPreviewTab('output')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${previewTab === 'output'
                      ? 'bg-indigo-500/20 text-indigo-200 shadow-sm ring-1 ring-inset ring-indigo-500/20'
                      : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  Output
                </button>
              </div>
            )}
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center relative bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:20px_20px]">
            {processedData ? (
              <div className="relative shadow-2xl shadow-black/50 rounded-lg overflow-hidden border border-white/10 max-w-full max-h-full">
                {previewTab === 'output' && (processedData.processedPdf || processedData instanceof Uint8Array || processedData instanceof Blob) && (
                  <PDFPreview file={processedData.processedPdf || processedData} />
                )}
                {previewTab === 'input' && selectedFilesForPreview[0] && (
                  <PDFPreview file={selectedFilesForPreview[0]} />
                )}

                {/* Error Overlay */}
                {processedData.error && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm">
                    <div className="bg-rose-950/30 border border-rose-500/30 p-4 rounded-xl text-rose-200">
                      <p className="font-semibold mb-1">Error Processing PDF</p>
                      <p className="text-sm opacity-80">{processedData.error}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : selectedFilesForPreview.length > 0 ? (
              <div className="relative shadow-xl shadow-black/30 rounded-lg overflow-hidden border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-slate-400 border border-white/5">
                  ORIGINAL
                </div>
                <PDFPreview file={selectedFilesForPreview[0]} />
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-30 select-none">
                <div className="w-24 h-32 mx-auto border-2 border-dashed border-slate-500 rounded-lg flex items-center justify-center">
                  <div className="w-16 h-1 bg-slate-700/50 rounded-full" />
                </div>
                <p className="text-sm font-medium text-slate-500">Preview area</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}