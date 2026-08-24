import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RestaurantInfoCards from '../RestaurantInfoCards';

describe('RestaurantInfoCards Component', () => {
  it('renders hours, phone and website link when available', () => {
    render(
      <RestaurantInfoCards
        openingHours="12:00 PM - 10:00 PM"
        phone="+1 555-0192"
        website="https://lapergola.it"
      />
    );

    expect(screen.getByText('12:00 PM - 10:00 PM')).toBeInTheDocument();
    expect(screen.getByText('+1 555-0192')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Visit Website/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://lapergola.it');
  });

  it('renders fallback values when optional props are absent', () => {
    render(<RestaurantInfoCards />);
    expect(screen.getByText(/11:00 AM - 11:00 PM Daily/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1 800-555-DINE/i)).toBeInTheDocument();
  });
});
