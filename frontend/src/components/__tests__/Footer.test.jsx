import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../Footer';

describe('Footer Component', () => {
  it('renders branding, categories, and company links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const brandings = screen.getAllByText(/QuickCart/i);
    expect(brandings.length).toBeGreaterThan(0);
    expect(screen.getByText(/10–15 Mins Delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/Fruits & Vegetables/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivery Partner App/i)).toBeInTheDocument();
  });
});
