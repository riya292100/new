import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ClothingHeroBanner from '../ClothingHeroBanner';

describe('ClothingHeroBanner Component', () => {
  it('renders fashion hero title, instant delivery badge, and trust guarantees', () => {
    render(<ClothingHeroBanner />);

    expect(screen.getByTestId('clothing-hero-banner')).toBeInTheDocument();
    expect(screen.getByTestId('clothing-instant-badge')).toHaveTextContent(
      /INSTANT 15-MINUTE FASHION/i
    );
    expect(screen.getByText(/7-Day Doorstep Returns/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Genuine Brands/i)).toBeInTheDocument();
  });
});
