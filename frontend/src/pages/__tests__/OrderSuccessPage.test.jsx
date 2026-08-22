import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderSuccessPage from '../OrderSuccessPage';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('OrderSuccessPage Component', () => {
  it('renders order confirmation and tracking CTA button', () => {
    render(
      <MemoryRouter initialEntries={['/order-success/QC-8912']}>
        <Routes>
          <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Order Placed Successfully!/i)).toBeInTheDocument();
    expect(screen.getByText(/#QC-8912/i)).toBeInTheDocument();
    expect(screen.getByText(/12–15 Mins/i)).toBeInTheDocument();
    expect(screen.getByText(/Track Live Delivery Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue Shopping/i)).toBeInTheDocument();
  });
});
