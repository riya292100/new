import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SellerDashboard from '../SellerDashboard';
import { ToastProvider } from '../../context/ToastContext';

describe('SellerDashboard', () => {
  it('renders seller dashboard header and metrics', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <SellerDashboard />
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Verified Marketplace Merchant/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Listings/i)).toBeInTheDocument();
    expect(screen.getByText(/List New Product/i)).toBeInTheDocument();
  });
});
