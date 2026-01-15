/// <reference types="vitest/globals" />
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
// import React from 'react'; // Removed duplicate import
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WorkspacePanel from '../components/WorkspacePanel';
import { Tool } from '@/types';
// import { SplitOptions } from '@/hooks/useSplitPDF'; // Removed unused import
import SplitPDFControls from '@/components/tools/SplitPDFControls';
import RotatePDFControls from '@/components/tools/RotatePDFControls';
import ExtractPagesControls from '@/components/tools/ExtractPagesControls';
import DarkModeControls from '@/components/tools/DarkModeControls';
import PDFPreview from './common/PDFPreview';

vi.mock('../components/PDFProcessor', () => ({ // Corrected path for PDFProcessor mock
  default: vi.fn((props: any) => {
    const {
      activeTool,
      toolId,
      allowMultipleFiles,
      processActionName,
      splitPdfOptions,
      rotateOptions,
      extractOptions,
      darkModePreviewOptions,
      onSelectionChange,
      onComplete,
      controls,
    } = props;

    const file1 = new File([new Uint8Array([1, 2, 3])], 'a.pdf', { type: 'application/pdf' });
    const file2 = new File([new Uint8Array([4, 5, 6])], 'b.pdf', { type: 'application/pdf' });

    return (
      <div data-testid="mock-pdf-processor">
        <div data-testid="processor-props">
          Tool: {activeTool?.name || 'No Tool'} (ID: {toolId}) | allowMultipleFiles: {String(!!allowMultipleFiles)} | action: {processActionName}
          {splitPdfOptions && <span> | Split: {splitPdfOptions.startPage}-{splitPdfOptions.endPage}</span>}
          {rotateOptions && <span> | Rotate: {rotateOptions.degrees}</span>}
          {extractOptions && <span> | Extract: {extractOptions.pageNumbers?.join(',')}</span>}
          {darkModePreviewOptions && <span> | DarkModeTheme: {darkModePreviewOptions.theme}</span>}
        </div>
        <button type="button" onClick={() => onSelectionChange?.(allowMultipleFiles ? [file1, file2] : [file1])}>
          Select Files
        </button>
        <button
          type="button"
          onClick={() =>
            onComplete?.({
              processedPdf: new Blob([new Uint8Array([9, 9, 9])], { type: 'application/pdf' }),
              title: `${activeTool?.name || 'Tool'} Result`,
              pageCount: 1,
              isMerged: activeTool?.name === 'Merge PDFs',
            })
          }
        >
          Complete
        </button>
        {controls}
      </div>
    );
  }),
}));

vi.mock('./common/PDFPreview', () => ({
  default: vi.fn(() => <div data-testid="mock-pdf-preview" />),
}));

vi.mock('@/components/tools/DarkModeControls', () => ({ // Corrected path for DarkModeControls mock
  default: vi.fn(() => <div data-testid="mock-dark-mode-controls">Mock Dark Mode Controls</div>),
}));

vi.mock('@/components/tools/SplitPDFControls', () => ({
  default: vi.fn(() => <div data-testid="mock-split-pdf-controls">Mock Split PDF Controls</div>),
}));

vi.mock('@/components/tools/RotatePDFControls', () => ({
  default: vi.fn(() => <div data-testid="mock-rotate-pdf-controls">Mock Rotate PDF Controls</div>),
}));

vi.mock('@/components/tools/ExtractPagesControls', () => ({
  default: vi.fn(() => <div data-testid="mock-extract-pages-controls">Mock Extract Pages Controls</div>),
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

const mockToolRotate: Tool = {
  id: 4,
  name: 'Rotate PDF',
  icon: '🔁',
  description: 'Rotate PDF pages',
};

const mockToolOptimize: Tool = {
  id: 5,
  name: 'Optimize PDF',
  icon: '📦',
  description: 'Optimize a PDF',
};

const mockToolExtract: Tool = {
  id: 6,
  name: 'Extract Pages',
  icon: '📄',
  description: 'Extract specific pages',
};

describe('WorkspacePanel', () => {
  it('renders title and description for the active tool', () => {
    render(
      <MemoryRouter initialEntries={['/dark-mode']}>
        <WorkspacePanel activeTool={mockToolDarkMode} />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Dark Mode/i })).toBeInTheDocument();
    expect(screen.getByText('Convert to dark mode')).toBeInTheDocument();
  });

  it('renders DarkModeControls when Dark Mode tool is active and panel is visible', () => {
    render(
      <MemoryRouter initialEntries={['/dark-mode']}>
        <WorkspacePanel activeTool={mockToolDarkMode} />
      </MemoryRouter>
    );
    expect(screen.getByTestId('mock-dark-mode-controls')).toBeInTheDocument();
  });

  it('does not render DarkModeControls when another tool is active', () => {
    render(
      <MemoryRouter initialEntries={['/merge']}>
        <WorkspacePanel activeTool={mockToolMerge} />
      </MemoryRouter>
    );
    expect(screen.queryByTestId('mock-dark-mode-controls')).not.toBeInTheDocument();
  });

  it('renders SplitPDFControls when Split PDF tool is active', () => {
    render(
      <MemoryRouter initialEntries={['/split']}>
        <WorkspacePanel activeTool={mockToolSplit} />
      </MemoryRouter>
    );
    expect(screen.getByTestId('mock-split-pdf-controls')).toBeInTheDocument();
  });

  it('does not render SplitPDFControls when another tool is active', () => {
    render(
      <MemoryRouter initialEntries={['/dark-mode']}>
        <WorkspacePanel activeTool={mockToolDarkMode} />
      </MemoryRouter>
    );
    expect(screen.queryByTestId('mock-split-pdf-controls')).not.toBeInTheDocument();
  });


  it('renders PDFProcessor with correct props for Dark Mode', () => {
    render(
      <MemoryRouter initialEntries={['/dark-mode']}>
        <WorkspacePanel activeTool={mockToolDarkMode} />
      </MemoryRouter>
    );
    const pdfProcessor = screen.getByTestId('mock-pdf-processor');
    expect(pdfProcessor).toBeInTheDocument();
    expect(screen.getByTestId('processor-props').textContent).toContain('Tool: Dark Mode');
  });

  it('passes splitPdfOptions to PDFProcessor when Split PDF is active', async () => {
    vi.mocked(SplitPDFControls).mockImplementation(({ onSettingsChange }: any) => { // Use vi.mocked for typed mock
      React.useEffect(() => {
        onSettingsChange({ startPage: 1, endPage: 2 });
      }, [onSettingsChange]);
      return <div data-testid="mock-split-pdf-controls">Mock Split PDF Controls Called</div>;
    });

    render(
      <MemoryRouter initialEntries={['/split']}>
        <WorkspacePanel activeTool={mockToolSplit} />
      </MemoryRouter>
    );

    const pdfProcessor = screen.getByTestId('mock-pdf-processor');
    await waitFor(() => {
      expect(pdfProcessor.textContent).toContain('Tool: Split PDF');
      expect(pdfProcessor.textContent).toContain('Split: 1-2');
    });
  });

  it('renders the trust line on tool pages', () => {
    render(
      <MemoryRouter initialEntries={['/dark-mode']}>
        <WorkspacePanel activeTool={mockToolDarkMode} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Local processing\. Files never leave your device\./i)).toBeInTheDocument();
  });

  it('shows preview when a file is selected (before processing)', async () => {
    render(
      <MemoryRouter initialEntries={['/dark-mode']}>
        <WorkspacePanel activeTool={mockToolDarkMode} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select Files' }));

    await waitFor(() => {
      expect(screen.getByTestId('mock-pdf-preview')).toBeInTheDocument();
    });

    expect(vi.mocked(PDFPreview)).toHaveBeenCalled();
  });

  it('Dark Mode: selection previews and completion shows output', async () => {
    vi.mocked(DarkModeControls).mockImplementation(({ onSettingsChange }: any) => {
      React.useEffect(() => {
        onSettingsChange({ theme: 'sepia', mode: 'invert' });
      }, [onSettingsChange]);
      return <div data-testid="mock-dark-mode-controls">Mock Dark Mode Controls</div>;
    });

    render(
      <MemoryRouter initialEntries={['/dark-mode']}>
        <WorkspacePanel activeTool={mockToolDarkMode} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('processor-props').textContent).toContain('DarkModeTheme: sepia');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Select Files' }));
    await waitFor(() => {
      expect(screen.getByTestId('mock-pdf-preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    await waitFor(() => {
      expect(screen.getByText(/Title:/i)).toBeInTheDocument();
      expect(screen.getByText(/Dark Mode Result/i)).toBeInTheDocument();
    });
  });

  it('Merge PDFs: uses multi-file selection and completion shows output', async () => {
    render(
      <MemoryRouter initialEntries={['/merge']}>
        <WorkspacePanel activeTool={mockToolMerge} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('processor-props').textContent).toContain('allowMultipleFiles: true');
    expect(screen.getByTestId('processor-props').textContent).toContain('action: Merge Selected PDFs');

    fireEvent.click(screen.getByRole('button', { name: 'Select Files' }));
    await waitFor(() => {
      expect(screen.getByTestId('mock-pdf-preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    await waitFor(() => {
      expect(screen.getByText(/Merge PDFs Result/i)).toBeInTheDocument();
    });
  });

  it('Rotate PDF: passes rotate options and completion shows output', async () => {
    vi.mocked(RotatePDFControls).mockImplementation(({ onSettingsChange }: any) => {
      React.useEffect(() => {
        onSettingsChange({ degrees: 90, rotationType: 'all' });
      }, [onSettingsChange]);
      return <div data-testid="mock-rotate-pdf-controls">Mock Rotate PDF Controls</div>;
    });

    render(
      <MemoryRouter initialEntries={['/rotate']}>
        <WorkspacePanel activeTool={mockToolRotate} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('processor-props').textContent).toContain('Rotate: 90');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Select Files' }));
    await waitFor(() => {
      expect(screen.getByTestId('mock-pdf-preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    await waitFor(() => {
      expect(screen.getByText(/Rotate PDF Result/i)).toBeInTheDocument();
    });
  });

  it('Extract Pages: passes extract options and completion shows output', async () => {
    vi.mocked(ExtractPagesControls).mockImplementation(({ onSettingsChange }: any) => {
      React.useEffect(() => {
        onSettingsChange({ pageNumbers: [1, 3, 5] });
      }, [onSettingsChange]);
      return <div data-testid="mock-extract-pages-controls">Mock Extract Pages Controls</div>;
    });

    render(
      <MemoryRouter initialEntries={['/extract']}>
        <WorkspacePanel activeTool={mockToolExtract} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('processor-props').textContent).toContain('Extract: 1,3,5');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Select Files' }));
    await waitFor(() => {
      expect(screen.getByTestId('mock-pdf-preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    await waitFor(() => {
      expect(screen.getByText(/Extract Pages Result/i)).toBeInTheDocument();
    });
  });

  it('Optimize PDF: selection previews and completion shows output', async () => {
    render(
      <MemoryRouter initialEntries={['/optimize']}>
        <WorkspacePanel activeTool={mockToolOptimize} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select Files' }));
    await waitFor(() => {
      expect(screen.getByTestId('mock-pdf-preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    await waitFor(() => {
      expect(screen.getByText(/Optimize PDF Result/i)).toBeInTheDocument();
    });
  });
});
