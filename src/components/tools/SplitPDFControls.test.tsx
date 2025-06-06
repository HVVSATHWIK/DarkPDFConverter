/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SplitPDFControls from './SplitPDFControls'; // Adjust path as needed
import { SplitOptions } from '@/hooks/useSplitPDF';

describe('SplitPDFControls', () => {
  const mockOnSettingsChange = vi.fn();
  const initialNullOptions: SplitOptions | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial empty/default values', () => {
    render(<SplitPDFControls onSettingsChange={mockOnSettingsChange} currentOptions={initialNullOptions} />);
    expect(screen.getByLabelText(/Start Page/i)).toHaveValue(1); // Default start page
    expect(screen.getByLabelText(/End Page/i)).toHaveValue(null); // Default end page (empty string means null for number input)
    expect(mockOnSettingsChange).toHaveBeenCalledWith(null); // Initially invalid if end page is empty
  });

  it('updates start page and calls onSettingsChange', () => {
    render(<SplitPDFControls onSettingsChange={mockOnSettingsChange} currentOptions={initialNullOptions} />);
    const startPageInput = screen.getByLabelText(/Start Page/i);
    fireEvent.change(startPageInput, { target: { value: '3' } });
    expect(startPageInput).toHaveValue(3);
    // Still null because end page is empty
    expect(mockOnSettingsChange).toHaveBeenLastCalledWith(null);
  });

  it('updates end page and calls onSettingsChange with valid options', () => {
    render(<SplitPDFControls onSettingsChange={mockOnSettingsChange} currentOptions={initialNullOptions} />);
    const startPageInput = screen.getByLabelText(/Start Page/i);
    const endPageInput = screen.getByLabelText(/End Page/i);

    fireEvent.change(startPageInput, { target: { value: '2' } });
    fireEvent.change(endPageInput, { target: { value: '5' } });

    expect(endPageInput).toHaveValue(5);
    expect(mockOnSettingsChange).toHaveBeenLastCalledWith({ startPage: 2, endPage: 5 });
    expect(screen.queryByText(/must be a number/i)).not.toBeInTheDocument(); // No error
  });

  it('shows error if start page is invalid (e.g., 0 or less)', () => {
    render(<SplitPDFControls onSettingsChange={mockOnSettingsChange} currentOptions={initialNullOptions} />);
    const startPageInput = screen.getByLabelText(/Start Page/i);
    fireEvent.change(startPageInput, { target: { value: '0' } });
    expect(screen.getByText(/Start page must be a number greater than 0/i)).toBeInTheDocument();
    expect(mockOnSettingsChange).toHaveBeenLastCalledWith(null);
  });

  it('shows error if end page is less than start page', () => {
    render(<SplitPDFControls onSettingsChange={mockOnSettingsChange} currentOptions={initialNullOptions} />);
    const startPageInput = screen.getByLabelText(/Start Page/i);
    const endPageInput = screen.getByLabelText(/End Page/i);

    fireEvent.change(startPageInput, { target: { value: '5' } });
    fireEvent.change(endPageInput, { target: { value: '3' } });

    expect(screen.getByText(/End page must be a number greater than or equal to start page/i)).toBeInTheDocument();
    expect(mockOnSettingsChange).toHaveBeenLastCalledWith(null);
  });

  it('initializes with currentOptions', () => {
    const currentOpts: SplitOptions = { startPage: 10, endPage: 20 };
    render(<SplitPDFControls onSettingsChange={mockOnSettingsChange} currentOptions={currentOpts} />);
    expect(screen.getByLabelText(/Start Page/i)).toHaveValue(10);
    expect(screen.getByLabelText(/End Page/i)).toHaveValue(20);
    expect(mockOnSettingsChange).toHaveBeenLastCalledWith(currentOpts); // Should be valid initially
  });

  it('calls onSettingsChange with null if end page is cleared after being valid', () => {
    render(<SplitPDFControls onSettingsChange={mockOnSettingsChange} currentOptions={{startPage:1, endPage:5}} />);
    // Initial valid call
    expect(mockOnSettingsChange).toHaveBeenLastCalledWith({ startPage: 1, endPage: 5 });

    const endPageInput = screen.getByLabelText(/End Page/i);
    fireEvent.change(endPageInput, { target: { value: '' } });
    expect(mockOnSettingsChange).toHaveBeenLastCalledWith(null);
  });
});
