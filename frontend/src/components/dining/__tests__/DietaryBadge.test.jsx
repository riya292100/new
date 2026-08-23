import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DietaryBadge from '../DietaryBadge';

describe('DietaryBadge Component', () => {
  it('renders vegetarian badge correctly', () => {
    render(<DietaryBadge type="VEGETARIAN" />);
    expect(screen.getByText('Veg Friendly')).toBeInTheDocument();
  });

  it('renders vegan badge correctly', () => {
    render(<DietaryBadge type="VEGAN" />);
    expect(screen.getByText('100% Vegan')).toBeInTheDocument();
  });

  it('renders dine-in badge correctly', () => {
    render(<DietaryBadge type="DINE_IN" />);
    expect(screen.getByText('Dine-In & Booking')).toBeInTheDocument();
  });
});
