/// <reference types="vitest/globals" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DarkModeControls from './DarkModeControls';
import { DarkModeOptions } from '@/hooks/useDarkMode';

describe('DarkModeControls', () => {
  const mockOnSettingsChange = vi.fn();
  const initialOptions: DarkModeOptions = { theme: 'dark', mode: 'image-preserve' };

  it('renders correctly with initial options and allows theme change', () => {
    // Mock THEME_CONFIGS if necessary, or rely on the real one imported
    render(
      <DarkModeControls
        onSettingsChange={mockOnSettingsChange}
        currentOptions={initialOptions}
      />
    );

    expect(screen.getByText('Dark Mode Settings')).toBeInTheDocument();

    const modeSelect = screen.getByLabelText('Mode') as HTMLSelectElement;
    const themeSelect = screen.getByLabelText('Theme') as HTMLSelectElement;

    expect(modeSelect.value).toBe('image-preserve');
    expect(themeSelect.value).toBe('dark');

    // Change theme via select
    fireEvent.change(themeSelect, { target: { value: 'darker' } });

    // Should trigger change with new theme, preserving other options
    expect(mockOnSettingsChange).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'darker',
      mode: 'image-preserve'
    }));
  });

  it('initializes with the theme from currentOptions', () => {
    render(
      <DarkModeControls
        onSettingsChange={mockOnSettingsChange}
        currentOptions={{ theme: 'sepia', mode: 'invert' }}
      />
    );

    const modeSelect = screen.getByLabelText('Mode') as HTMLSelectElement;
    const themeSelect = screen.getByLabelText('Theme') as HTMLSelectElement;

    expect(themeSelect.value).toBe('sepia');
    expect(modeSelect.value).toBe('invert');

    // Switch mode back to image-preserve
    fireEvent.change(modeSelect, { target: { value: 'image-preserve' } });
    expect(mockOnSettingsChange).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'image-preserve',
      theme: 'sepia'
    }));
  });
});
