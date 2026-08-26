import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmptyOrdersState from '../EmptyOrdersState';

describe('EmptyOrdersState Component', () => {
  it('renders empty delivery queue messaging', () => {
    render(<EmptyOrdersState />);

    expect(screen.getByTestId('empty-orders-state')).toBeInTheDocument();
    expect(screen.getByText(/No active deliveries assigned/i)).toBeInTheDocument();
    expect(screen.getByText(/New orders placed in your delivery radius/i)).toBeInTheDocument();
  });
});
