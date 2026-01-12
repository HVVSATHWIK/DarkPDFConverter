/// <reference types="vitest/globals" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DarkModeControls from './DarkModeControls';
import { DarkModeOptions } from '@/hooks/useDarkMode';

describe('DarkModeControls', () => {
  const mockOnSettingsChange = vi.fn();
  const initialOptions: DarkModeOptions = { theme: 'dark', mode: 'preserve-images' };

  it('renders correctly with initial options and allows theme change', () => {
    render(
      <DarkModeControls
        onSettingsChange={mockOnSettingsChange}
        currentOptions={initialOptions}
      />
    );

    expect(screen.getByText('Dark Mode Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Theme')).toBeInTheDocument();

    const themeSelect = screen.getByRole('combobox', { name: /Theme/i });
    expect(themeSelect).toHaveValue('dark');

    const modeSelect = screen.getByRole('combobox', { name: /Mode/i });
    expect(modeSelect).toHaveValue('preserve-images');

    // Change theme
    fireEvent.change(themeSelect, { target: { value: 'darker' } });
    expect(mockOnSettingsChange).toHaveBeenCalledWith({ theme: 'darker', mode: 'preserve-images' });
  });

  it('initializes with the theme from currentOptions', () => {
    render(
      <DarkModeControls
        onSettingsChange={mockOnSettingsChange}
        currentOptions={{ theme: 'darkest', mode: 'invert' }}
      />
    );
    expect(screen.getByRole('combobox', { name: /Theme/i })).toHaveValue('darkest');
    expect(screen.getByRole('combobox', { name: /Mode/i })).toHaveValue('invert');
  });
});
