import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FreeDeliveryProgressBar from '../FreeDeliveryProgressBar';

describe('FreeDeliveryProgressBar Component', () => {
  it('renders remaining amount for free delivery when below threshold', () => {
    render(<FreeDeliveryProgressBar freeDeliveryUnlocked={false} itemTotal={149} />);
    expect(screen.getByText(/Add ₹50 more for FREE Delivery/i)).toBeInTheDocument();
  });

  it('renders congratulatory message when free delivery is unlocked', () => {
    render(<FreeDeliveryProgressBar freeDeliveryUnlocked={true} itemTotal={250} />);
    expect(screen.getByText(/FREE delivery unlocked/i)).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
