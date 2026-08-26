import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HeroPromoBanner, { DEFAULT_PROMO_BANNERS } from '../HeroPromoBanner';

describe('HeroPromoBanner Component', () => {
  it('renders promo banner content and handles navigation cta', () => {
    render(
      <MemoryRouter>
        <HeroPromoBanner banners={DEFAULT_PROMO_BANNERS} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('hero-promo-banner')).toBeInTheDocument();
    expect(screen.getByTestId('promo-badge')).toHaveTextContent(/LIGHTNING FAST/i);
    expect(screen.getByRole('link', { name: /Shop Now/i })).toBeInTheDocument();
  });

  it('allows clicking indicator buttons to switch active banner', () => {
    render(
      <MemoryRouter>
        <HeroPromoBanner banners={DEFAULT_PROMO_BANNERS} />
      </MemoryRouter>
    );

    const indicators = screen.getAllByRole('button', { name: /Go to slide/i });
    expect(indicators.length).toBe(DEFAULT_PROMO_BANNERS.length);

    fireEvent.click(indicators[1]);
    expect(screen.getByTestId('promo-badge')).toHaveTextContent(/INSTANT APPAREL/i);
  });
});
