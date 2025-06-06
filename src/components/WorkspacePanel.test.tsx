import React from 'react';
import { describe, it, expect, vi } from 'vitest';
// import React from 'react'; // Removed duplicate import
import { render, screen, waitFor } from '@testing-library/react';
import WorkspacePanel from '../components/WorkspacePanel';
import { Tool } from '@/types';
// import { SplitOptions } from '@/hooks/useSplitPDF'; // Removed unused import
import SplitPDFControls from '@/components/tools/SplitPDFControls';

vi.mock('../components/PDFProcessor', () => ({ // Corrected path for PDFProcessor mock
  default: vi.fn(({ activeTool, toolId, splitPdfOptions }) => (
    <div data-testid="mock-pdf-processor">
      Mock PDF Processor for {activeTool?.name || 'No Tool'} (ID: {toolId})
      {splitPdfOptions && <span>Split: {splitPdfOptions.startPage}-{splitPdfOptions.endPage}</span>}
    </div>
  )),
}));

vi.mock('@/components/tools/DarkModeControls', () => ({ // Corrected path for DarkModeControls mock
  default: vi.fn(() => <div data-testid="mock-dark-mode-controls">Mock Dark Mode Controls</div>),
}));

vi.mock('@/components/tools/SplitPDFControls', () => ({
  default: vi.fn(() => <div data-testid="mock-split-pdf-controls">Mock Split PDF Controls</div>),
}));


const mockToolDarkMode: Tool = {
  id: 1,
  name: 'Dark Mode',
  icon: '🌙',
  description: 'Convert to dark mode',
};

const mockToolMerge: Tool = {
  id: 2,
  name: 'Merge PDFs',
  icon: '🔄',
  description: 'Combine multiple PDFs',
};

const mockToolSplit: Tool = {
  id: 3,
  name: 'Split PDF',
  icon: '✂️',
  description: 'Extract a range of pages',
};

describe('WorkspacePanel', () => {
  it('renders title and description for the active tool', () => {
    render(
      <WorkspacePanel
        activeTool={mockToolDarkMode}
        isVisible={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByRole('heading', { name: /Dark Mode/i })).toBeInTheDocument();
    expect(screen.getByText('Convert to dark mode')).toBeInTheDocument();
  });

  it('renders DarkModeControls when Dark Mode tool is active and panel is visible', () => {
    render(
      <WorkspacePanel
        activeTool={mockToolDarkMode}
        isVisible={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByTestId('mock-dark-mode-controls')).toBeInTheDocument();
  });

  it('does not render DarkModeControls when another tool is active', () => {
    render(
      <WorkspacePanel
        activeTool={mockToolMerge}
        isVisible={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByTestId('mock-dark-mode-controls')).not.toBeInTheDocument();
  });

  it('renders SplitPDFControls when Split PDF tool is active', () => {
    render(
      <WorkspacePanel
        activeTool={mockToolSplit}
        isVisible={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByTestId('mock-split-pdf-controls')).toBeInTheDocument();
  });

  it('does not render SplitPDFControls when another tool is active', () => {
    render(
      <WorkspacePanel
        activeTool={mockToolDarkMode}
        isVisible={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByTestId('mock-split-pdf-controls')).not.toBeInTheDocument();
  });


  it('renders PDFProcessor with correct props for Dark Mode', () => {
    render(
      <WorkspacePanel
        activeTool={mockToolDarkMode}
        isVisible={true}
        onClose={vi.fn()}
      />
    );
    const pdfProcessor = screen.getByTestId('mock-pdf-processor');
    expect(pdfProcessor).toBeInTheDocument();
    expect(pdfProcessor.textContent).toContain('Mock PDF Processor for Dark Mode');
  });

  it('passes splitPdfOptions to PDFProcessor when Split PDF is active', async () => {
    vi.mocked(SplitPDFControls).mockImplementation(({ onSettingsChange }: any) => { // Use vi.mocked for typed mock
      React.useEffect(() => {
        onSettingsChange({ startPage: 1, endPage: 2 });
      }, [onSettingsChange]);
      return <div data-testid="mock-split-pdf-controls">Mock Split PDF Controls Called</div>;
    });

    render( <WorkspacePanel
        activeTool={mockToolSplit}
        isVisible={true}
        onClose={vi.fn()}
      />);

    const pdfProcessor = screen.getByTestId('mock-pdf-processor');
    await waitFor(() => {
      expect(pdfProcessor.textContent).toContain('Mock PDF Processor for Split PDF');
      expect(pdfProcessor.textContent).toContain('Split: 1-2');
    });
  });

  it('does not render if isVisible is false', () => {
    render(
      <WorkspacePanel
        activeTool={mockToolDarkMode}
        isVisible={false}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByText('Dark Mode')).not.toBeInTheDocument();
  });
});
