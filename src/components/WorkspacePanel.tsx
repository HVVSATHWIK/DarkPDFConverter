import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUturnLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
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
import ImagesToPDFControls from './tools/ImagesToPDFControls';
import { ImageToPdfOptions } from '@/hooks/useImagesToPdf';
import OptimizePDFControls from './tools/OptimizePDFControls';
import { CompressOptions } from '@/hooks/useCompressPDF';
import PDFPreview from './common/PDFPreview';
import { getToolGuideById, getToolGuideBySlug } from '@/config/toolGuides';
import { SEO } from './common/SEO';
import { Breadcrumbs } from './seo/Breadcrumbs';
import { GuideInfoButton } from './tools/GuideInfoButton';
import { ContextualReportTrigger } from './common/ContextualReportTrigger';

interface ToolPageProps {
  activeTool: Tool;
}

const RECENTS_KEY = 'litas.recentToolIds';

function pushRecentToolId(id: number) {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const current = raw ? (JSON.parse(raw) as unknown) : [];
    const ids = Array.isArray(current) ? current.filter((v) => typeof v === 'number') : [];
    const next = [id, ...ids.filter((x) => x !== id)].slice(0, 8);
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
  const [imageToPdfSettings, setImageToPdfSettings] = useState<ImageToPdfOptions>({
    pageSize: 'fit',
    margin: 0,
  });
  const [compressSettings, setCompressSettings] = useState<CompressOptions>({
    level: 'recommended',
    jpegQuality: 0.60,
    maxDpi: 150,
  });

  const slug = location.pathname.replace(/^\//, '');
  const guide = getToolGuideBySlug(slug) || getToolGuideById(activeTool.id);
  const toolPath = activeTool.path || (guide ? `/${guide.slug}` : `/${slug}`);

  useEffect(() => {
    // Ensure route starts at scroll position 0, 0
    window.scrollTo(0, 0);
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }

    setProcessedData(null);
    setSelectedFilesForPreview([]);
    if (activeTool.name !== 'Dark Mode PDF' && activeTool.name !== 'Dark Mode') {
      setDarkModeSettings({ theme: 'dark' });
    }
    if (activeTool.name === 'Split PDF') {
      setSplitPdfSettings((prev) => prev ?? { startPage: 1, endPage: 1 });
    } else {
      setSplitPdfSettings(null);
    }
    if (activeTool.name === 'Rotate PDF') {
      setRotateSettings((prev) => prev ?? { degrees: 90, rotationType: 'all' });
    } else {
      setRotateSettings(null);
    }
    if (activeTool.name === 'Extract Pages') {
      setExtractSettings((prev) => prev ?? { pageNumbers: [1] });
    } else {
      setExtractSettings(null);
    }
  }, [activeTool.id, activeTool.name, location.pathname]);

  useEffect(() => {
    if (processedData) setPreviewTab('output');
  }, [processedData]);

  useEffect(() => {
    if (selectedFilesForPreview.length > 0 && !processedData) setPreviewTab('input');
  }, [processedData, selectedFilesForPreview.length]);

  useEffect(() => {
    pushRecentToolId(activeTool.id);
  }, [activeTool.id]);

  const handleComplete = (result: any) => {
    if (result?.processedPdf && !(result.processedPdf instanceof Blob)) {
      result.processedPdf = new Blob([result.processedPdf], { type: 'application/pdf' });
    }
    setProcessedData(result);
    setPreviewTab('output');
  };

  const handleError = (error: Error) => {
    console.error(`Error during processing for ${activeTool?.name}:`, error);
    setProcessedData({ error: error.message });
  };

  const renderToolSpecificUI = () => {
    switch (activeTool.name) {
      case 'Dark Mode PDF':
      case 'Dark Mode':
        return (
          <PDFProcessorWithErrorBoundary
            toolId={activeTool.id}
            activeTool={activeTool}
            allowMultipleFiles={false}
            onComplete={handleComplete}
            onError={handleError}
            onSelectionChange={setSelectedFilesForPreview}
            processActionName="Apply Dark Mode"
            darkModePreviewOptions={darkModeSettings}
            autoProcess
            autoProcessOnSelect
            autoProcessDeps={[darkModeSettings.theme, darkModeSettings.mode]}
            autoProcessDebounceMs={200}
            controls={
              <DarkModeControls
                onSettingsChange={setDarkModeSettings}
                currentOptions={darkModeSettings}
                embedded
              />
            }
            controlsLabel="Theme & Mode"
          />
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
            processActionName="Merge PDFs"
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

      case 'Optimize PDF':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id}
              activeTool={activeTool}
              allowMultipleFiles={false}
              onComplete={handleComplete}
              onError={handleError}
              onSelectionChange={setSelectedFilesForPreview}
              processActionName="Optimize PDF"
              compressOptions={compressSettings}
            />
            <OptimizePDFControls
              onSettingsChange={setCompressSettings}
              currentOptions={compressSettings}
            />
          </>
        );

      case 'Cleanse Metadata':
        return (
          <PDFProcessorWithErrorBoundary
            toolId={activeTool.id}
            activeTool={activeTool}
            allowMultipleFiles={false}
            onComplete={handleComplete}
            onError={handleError}
            onSelectionChange={setSelectedFilesForPreview}
            processActionName="Cleanse Metadata"
            autoProcess
            autoProcessOnSelect
          />
        );

      case 'Images to PDF':
        return (
          <>
            <PDFProcessorWithErrorBoundary
              toolId={activeTool.id}
              activeTool={activeTool}
              allowMultipleFiles={true}
              onComplete={handleComplete}
              onError={handleError}
              onSelectionChange={setSelectedFilesForPreview}
              processActionName="Convert to PDF"
              imageToPdfOptions={imageToPdfSettings}
            />
            <ImagesToPDFControls
              currentOptions={imageToPdfSettings}
              onSettingsChange={setImageToPdfSettings}
            />
          </>
        );

      default:
        return <p className="text-slate-400">Tool UI for '{activeTool.name}' not implemented yet.</p>;
    }
  };

  const isFromLabs =
    (location.state as { from?: string } | null)?.from === '/explore' ||
    (typeof window !== 'undefined' && sessionStorage.getItem('litas_last_page') === '/explore');
  const backUrl = isFromLabs ? '/explore' : '/tools';
  const backLabel = isFromLabs ? 'Labs 3D' : 'All Tools';

  return (
    <div className="w-full min-h-screen bg-[#050505] text-slate-100 flex flex-col">
      <SEO
        title={guide?.title}
        description={guide?.metaDescription}
        keywords={guide?.metaKeywords}
        canonicalPath={`/${guide?.slug || ''}`}
        faqList={guide?.faqs}
        steps={guide?.steps}
      />

      {/* 1. Header & Top Bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 px-4 py-4 sm:py-5 md:px-8">
        <div className="max-w-7xl mx-auto space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Link
                to={backUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm group shrink-0"
                aria-label={`Return to ${backLabel}`}
              >
                <ArrowUturnLeftIcon className="w-3.5 h-3.5 text-cyan-400 transition-transform group-hover:-translate-x-1" />
                <span>Return to {backLabel}</span>
              </Link>
              <div className="h-4 w-px bg-slate-800 shrink-0" />
              <Breadcrumbs
                items={[
                  { name: 'Tools', path: '/tools' },
                  { name: activeTool.name },
                ]}
              />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full font-medium">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="hidden sm:inline">Files are processed locally in your browser</span>
                <span className="sm:hidden">Local Processing</span>
              </div>
              {guide && <GuideInfoButton to={`${toolPath}/guide`} />}
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {activeTool.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {guide?.subtitle || activeTool.description}
            </p>
          </div>
        </div>
      </header>

      {/* 2. Primary Interactive Tool Workspace */}
      <section className="w-full bg-[#080808] flex-1">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-210px)] min-h-[580px] lg:max-h-[850px]">
          {/* Workspace Panel: Upload & Controls */}
          <aside className="w-full lg:w-[440px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col bg-[#050505] lg:h-full lg:overflow-y-auto litas-scrollbar">
            <div className="p-5 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {activeTool.name} Panel
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {activeTool.categoryLabel || 'PDF Utility'}
                  </span>
                </div>

                {/* Main Tool Processor UI */}
                <div className="space-y-4">{renderToolSpecificUI()}</div>
              </div>

              {/* Bottom Quick Guide Access */}
              {guide && (
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs mt-4">
                  <span className="text-slate-400 text-[11px]">Need step-by-step help or specs?</span>
                  <Link
                    to={`${toolPath}/guide`}
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <span>How It Works &rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* Main Workspace Area: Live Preview Canvas */}
          <div className="flex-1 bg-[#0A0A0A] relative flex flex-col min-w-0 h-full overflow-hidden">
            {/* Preview Toolbar */}
            <div className="h-12 border-b border-slate-800/80 flex items-center justify-between px-5 shrink-0 bg-black/40 backdrop-blur-sm z-10">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Document Preview
              </h2>

              {processedData && selectedFilesForPreview.length > 0 && (
                <div className="flex bg-black/60 rounded-lg p-0.5 border border-slate-800">
                  <button
                    onClick={() => setPreviewTab('input')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      previewTab === 'input'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setPreviewTab('output')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      previewTab === 'output'
                        ? 'bg-cyan-500/20 text-cyan-300 shadow-sm ring-1 ring-inset ring-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Result Output
                  </button>
                </div>
              )}
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 min-h-0 w-full p-3 sm:p-5 flex flex-col items-center justify-center relative bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden">
              {processedData ? (
                <div className="w-full h-full max-w-5xl flex flex-col min-h-0 relative shadow-2xl shadow-black/80 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/90 backdrop-blur-sm">
                  {previewTab === 'output' &&
                    (processedData.processedPdf ||
                      processedData instanceof Uint8Array ||
                      processedData instanceof Blob) && (
                      <PDFPreview file={processedData.processedPdf || processedData} />
                    )}
                  {previewTab === 'input' && selectedFilesForPreview[0] && (
                    <PDFPreview file={selectedFilesForPreview[0]} />
                  )}

                  {/* Error Overlay */}
                  {processedData.error && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm z-30">
                      <div className="bg-rose-950/60 border border-rose-500/40 p-4 rounded-xl text-rose-200 text-center max-w-md space-y-3">
                        <p className="font-semibold text-sm">Error Processing PDF</p>
                        <p className="text-xs opacity-80">{processedData.error}</p>
                        <ContextualReportTrigger
                          toolName={activeTool.name}
                          lastError={processedData.error}
                          operationStatus="failed"
                          variant="warning"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedFilesForPreview.length > 0 ? (
                <div className="w-full h-full max-w-5xl flex flex-col min-h-0 relative shadow-xl shadow-black/50 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/90 backdrop-blur-sm">
                  <div className="absolute top-3 left-3 z-30 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-cyan-300 border border-slate-800">
                    LOADED INPUT PREVIEW
                  </div>
                  <PDFPreview file={selectedFilesForPreview[0]} />
                </div>
              ) : (
                <div className="text-center space-y-3 opacity-40 select-none py-12">
                  <div className="w-20 h-28 mx-auto border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center bg-white/[0.02]">
                    <div className="w-8 h-0.5 bg-slate-600 rounded-full" />
                  </div>
                  <p className="text-xs font-medium text-slate-400">PDF Preview Canvas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
