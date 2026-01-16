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
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8 space-y-6">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-300/80">
              <Link to="/" className="hover:text-white transition-colors">
                Tools
              </Link>
              <span className="text-slate-500">/</span>
              <span className="text-slate-200">{activeTool.name}</span>
            </div>

            <Link
              to="/"
              className="group cursor-pointer flex items-center gap-2 text-sm font-semibold text-slate-200/90 hover:text-white transition-colors px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
              aria-label="Back to all tools"
            >
              <ArrowUturnLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-indigo-200 p-2 bg-white/5 rounded-xl ring-1 ring-white/10">
                {activeTool.icon}
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight truncate">
                  {activeTool.name}
                </h1>
                {activeTool.description && (
                  <p className="text-sm text-slate-300/80 mt-1">
                    {activeTool.description}
                  </p>
                )}
              </div>
            </div>

            <Link
              to="/#how-it-works"
              className="text-sm font-semibold text-slate-200/90 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-colors"
            >
              How it works
            </Link>
          </div>

          {showTrustLine && (
            <p className="text-sm text-slate-300/80">
              Local processing. Files never leave your device.
            </p>
          )}
        </header>

        <div className="panel-surface-strong p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-6 min-w-0 md:col-start-1 md:col-end-2">
              {renderToolSpecificUI()}
            </section>

            <section className="space-y-4 min-w-0 md:col-start-2 md:col-end-3">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                <h2 className="text-lg font-semibold text-slate-200">Preview / Output</h2>
                {processedData && selectedFilesForPreview.length > 0 && (
                  <div className="flex items-center gap-1 rounded-full bg-white/5 border border-white/10 p-1">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('output')}
                      className={
                        'px-3 py-1.5 text-xs font-semibold rounded-full transition ' +
                        (previewTab === 'output' ? 'bg-white/10 text-white' : 'text-slate-300/80 hover:text-white')
                      }
                    >
                      Output
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('input')}
                      className={
                        'px-3 py-1.5 text-xs font-semibold rounded-full transition ' +
                        (previewTab === 'input' ? 'bg-white/10 text-white' : 'text-slate-300/80 hover:text-white')
                      }
                    >
                      Original
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full min-w-0 min-h-[240px] md:min-h-[340px] h-[60vh] md:h-[70vh] max-h-[720px] bg-black/25 rounded-xl overflow-hidden text-slate-200/90 shadow-inner border border-white/10">
                {processedData ? (
                  <div className="w-full h-full min-h-0 flex flex-col gap-4 p-4">
                    {previewTab === 'output' && (processedData.processedPdf || processedData instanceof Uint8Array || processedData instanceof Blob) && (
                      <div className="flex-1 min-h-0">
                        <PDFPreview file={processedData.processedPdf || processedData} />
                      </div>
                    )}

                    {previewTab === 'input' && selectedFilesForPreview.length > 0 && (
                      <div className="flex-1 min-h-0">
                        <PDFPreview file={selectedFilesForPreview[0]} />
                      </div>
                    )}

                    <div className="text-sm text-left w-full overflow-y-auto">
                      {processedData.error && <p className="text-red-400">Error: {processedData.error}</p>}
                      {processedData.title && <p><strong>Title:</strong> {processedData.title}</p>}
                      {processedData.pageCount && <p><strong>Pages:</strong> {processedData.pageCount}</p>}
                      {processedData.isMerged && (
                        <p className="text-green-400">
                          Successfully merged {processedData.title?.match(/\((\d+) files\)/)?.[1] || 'multiple'} files.
                        </p>
                      )}
                      {processedData.message && !processedData.isMerged && <p>{processedData.message}</p>}
                      {!processedData.error && !processedData.title && !processedData.pageCount && !processedData.message && !processedData.processedPdf && (
                        <p>Processing completed. Details unavailable.</p>
                      )}
                    </div>
                  </div>
                ) : selectedFilesForPreview.length > 0 ? (
                  <div className="w-full h-full min-h-0 flex flex-col gap-3 p-4">
                    <div className="text-xs text-slate-300/80">
                      Previewing uploaded PDF{activeTool.name === 'Merge PDFs' && selectedFilesForPreview.length > 1 ? ' (first file)' : ''}.
                    </div>
                    <div className="flex-1 min-h-0">
                      <PDFPreview file={selectedFilesForPreview[0]} />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <p>PDF preview or processing results will appear here.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}