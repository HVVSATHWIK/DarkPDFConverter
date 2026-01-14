/// <reference types="vitest/globals" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DarkModeControls from './DarkModeControls';
import { DarkModeOptions } from '@/hooks/useDarkMode';

describe('DarkModeControls', () => {
  const mockOnSettingsChange = vi.fn();
  const initialOptions: DarkModeOptions = { theme: 'dark', mode: 'preserve-images' };

  it('renders correctly with initial options and allows theme change', () => {
    // Mock THEME_CONFIGS if necessary, or rely on the real one imported
    render(
      <DarkModeControls
        onSettingsChange={mockOnSettingsChange}
        currentOptions={initialOptions}
      />
    );

    expect(screen.getByText('Dark Mode Settings')).toBeInTheDocument();

    // Check for mode buttons
    expect(screen.getByText('Preserve Images')).toBeInTheDocument();
    expect(screen.getByText('Full Invert')).toBeInTheDocument();

    // Check for theme buttons (e.g., 'Dark', 'Darker')
    expect(screen.getByText('Dark')).toBeInTheDocument(); // The active one
    expect(screen.getByText('Darker')).toBeInTheDocument();

    // Change theme by clicking the 'Darker' button
    const darkerButton = screen.getByText('Darker').closest('button');
    expect(darkerButton).toBeInTheDocument();
    fireEvent.click(darkerButton!);

    // Should trigger change with new theme, preserving other options
    expect(mockOnSettingsChange).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'darker',
      mode: 'preserve-images'
    }));
  });

  it('initializes with the theme from currentOptions', () => {
    render(
      <DarkModeControls
        onSettingsChange={mockOnSettingsChange}
        currentOptions={{ theme: 'sepia', mode: 'invert' }}
      />
    );

    // The Sepia button should indicate selection (checking class or just existence for now)
    // For this test, just ensuring the logic handles the prop is implied by the previous test, 
    // but we can check if the correct change is fired if we click something else.

    // Let's verify standard interactions
    fireEvent.click(screen.getByText('Preserve Images'));
    expect(mockOnSettingsChange).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'preserve-images',
      theme: 'sepia'
    }));
  });
});
