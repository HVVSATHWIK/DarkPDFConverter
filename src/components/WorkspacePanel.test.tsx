import React from 'react'; // Import React for JSX and stateful component in test
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react'; // Import waitFor
import WorkspacePanel from '../components/WorkspacePanel'; // Adjust path as necessary
import { Tool } from '@/types'; // Adjust path as necessary
import { SplitOptions } from '@/hooks/useSplitPDF'; // Import SplitOptions

// Mock PDFProcessor since it's complex and not the focus here
vi.mock('./PDFProcessor', () => ({
  // PDFProcessorWithErrorBoundary is the default export from PDFProcessor.tsx
  default: vi.fn(({ activeTool, toolId, splitPdfOptions }) => ( // Added splitPdfOptions for checking
    <div data-testid="mock-pdf-processor">
      Mock PDF Processor for {activeTool?.name || 'No Tool'} (ID: {toolId})
      {splitPdfOptions && <span>Split: {splitPdfOptions.startPage}-{splitPdfOptions.endPage}</span>}
    </div>
  )),
}));


// Mock DarkModeControls
vi.mock('./tools/DarkModeControls', () => ({
  default: vi.fn(() => <div data-testid="mock-dark-mode-controls">Mock Dark Mode Controls</div>),
}));

// Mock SplitPDFControls
vi.mock('./tools/SplitPDFControls', () => ({
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
    // Use getByRole for heading and a flexible text match for the description
    expect(screen.getByRole('heading', { name: /Dark Mode/i })).toBeInTheDocument();
    // Description might be truncated or only visible on certain screen sizes based on className "hidden md:block"
    // For this test, we'll assume it should be present in the document, even if not visible in all test environments.
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
    // Check that darkModePreviewOptions is passed (indirectly, by checking toolId or name if PDFProcessor mock exposed it)
    // For now, just checking name is enough given the mock structure.
  });

  it('passes splitPdfOptions to PDFProcessor when Split PDF is active', async () => {
    // This test relies on the mock PDFProcessor being able to display information about its props,
    // or by spying on PDFProcessor if it wasn't a default export being mocked.
    // The mock for PDFProcessor has been updated to render splitPdfOptions.

    // To test this properly, we need SplitPDFControls to call its onSettingsChange prop
    // which is connected to setSplitPdfSettings in WorkspacePanel.
    // Then WorkspacePanel passes that to PDFProcessor.

    // Let's mock SplitPDFControls to call onSettingsChange immediately
    const MockedSplitControls = require('./tools/SplitPDFControls').default as vi.Mock;
    MockedSplitControls.mockImplementation(({ onSettingsChange }: any) => {
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
    await waitFor(() => { // Wait for useEffect in mock to call onSettingsChange and then for re-render
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
    // Check if the main panel div (which has motion.div) is hidden or not present
    // This depends on how framer-motion handles visibility.
    // A simple check could be that one of the key elements is not present.
    expect(screen.queryByText('Dark Mode')).not.toBeInTheDocument();
  });
});
