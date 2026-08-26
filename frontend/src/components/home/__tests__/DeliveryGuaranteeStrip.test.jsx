import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DeliveryGuaranteeStrip from '../DeliveryGuaranteeStrip';

describe('DeliveryGuaranteeStrip Component', () => {
  it('renders all trust badges and guarantee statements', () => {
    render(<DeliveryGuaranteeStrip />);

    expect(screen.getByTestId('delivery-guarantee-strip')).toBeInTheDocument();
    expect(screen.getByText(/Instant Delivery in 10–30 Minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/Live GPS Tracking/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Quality Assured/i)).toBeInTheDocument();
    expect(screen.getByText(/Best Value Prices/i)).toBeInTheDocument();
  });
});
