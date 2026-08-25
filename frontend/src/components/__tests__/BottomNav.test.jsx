import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BottomNav from '../BottomNav';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';

describe('BottomNav Component', () => {
  it('renders all primary mobile navigation tabs', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <BottomNav />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('QuickCash')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
  });
});
