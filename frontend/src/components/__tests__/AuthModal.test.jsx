import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthModal from '../AuthModal';
import * as AuthContextModule from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';

describe('AuthModal Component', () => {
  const mockAuthValues = {
    authModalOpen: true,
    authModalMode: 'login',
    closeAuthModal: vi.fn(),
    openAuthModal: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
  };

  beforeEach(() => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue(mockAuthValues);
  });

  it('renders login modal with inputs and demo account buttons', () => {
    render(
      <ToastProvider>
        <AuthModal />
      </ToastProvider>
    );

    expect(screen.getByText(/Welcome to QuickCart/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/customer@quickcart\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Customer/i)).toBeInTheDocument();
    expect(screen.getByText(/Driver/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In & Continue/i)).toBeInTheDocument();
  });

  it('switches to register mode when registration context is provided', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      ...mockAuthValues,
      authModalMode: 'register',
    });

    render(
      <ToastProvider>
        <AuthModal />
      </ToastProvider>
    );

    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Riya Gope/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/9876543210/i)).toBeInTheDocument();
    expect(screen.getByText(/Create My Account/i)).toBeInTheDocument();
  });

  it('renders nothing when authModalOpen is false', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      ...mockAuthValues,
      authModalOpen: false,
    });

    render(
      <ToastProvider>
        <AuthModal />
      </ToastProvider>
    );

    expect(screen.queryByText(/Welcome to QuickCart/i)).not.toBeInTheDocument();
  });
});
