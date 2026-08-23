import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CuisinePills from '../CuisinePills';

describe('CuisinePills Component', () => {
  const mockSelect = vi.fn();
  const dummyCuisines = ['Italian', 'Japanese', 'Indian', 'French'];

  it('renders all cuisine pills and triggers selection callback', () => {
    render(
      <CuisinePills
        cuisines={dummyCuisines}
        selectedCuisine="Italian"
        onSelectCuisine={mockSelect}
      />
    );

    expect(screen.getByText('All Cuisines')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
    expect(screen.getByText('Japanese')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Japanese'));
    expect(mockSelect).toHaveBeenCalledWith('Japanese');
  });
});
