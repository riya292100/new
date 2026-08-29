import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { ToastProvider } from '../ToastContext';
import { authApi } from '../../services/api';

const TestAuthConsumer = () => {
  const {
    user,
    loading,
    login,
    register,
    logout,
    switchDemoRole,
    authModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
  } = useAuth();

  return (
    <div>
      <div data-testid="user-info">{user ? user.fullName : 'Guest'}</div>
      <div data-testid="loading-state">{loading ? 'Loading' : 'Idle'}</div>
      <div data-testid="modal-state">
        {authModalOpen ? `Modal-${authModalMode}` : 'Modal-Closed'}
      </div>

      <button
        onClick={() => login('customer@quickcart.com', 'password123')}
        data-testid="login-btn"
      >
        Login
      </button>

      <button
        onClick={() =>
          register({
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            phone: '9876543210',
            password: 'secretPassword1',
          })
        }
        data-testid="register-btn"
      >
        Register
      </button>

      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>

      <button onClick={() => switchDemoRole('ADMIN')} data-testid="switch-admin-btn">
        Switch Admin
      </button>

      <button onClick={() => openAuthModal('register')} data-testid="open-modal-btn">
        Open Register Modal
      </button>

      <button onClick={closeAuthModal} data-testid="close-modal-btn">
        Close Modal
      </button>
    </div>
  );
};

describe('AuthContext Provider Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders initial guest state when not authenticated', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByTestId('user-info')).toHaveTextContent('Guest');
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Idle');
    expect(screen.getByTestId('modal-state')).toHaveTextContent('Modal-Closed');
  });

  it('successfully logs in a user and updates state and localStorage token', async () => {
    const mockUserResponse = {
      data: {
        id: 1,
        fullName: 'Demo Customer',
        email: 'customer@quickcart.com',
        token: 'test-jwt-token',
        roles: ['ROLE_CUSTOMER'],
      },
    };
    vi.spyOn(authApi, 'login').mockResolvedValue(mockUserResponse);

    render(
      <ToastProvider>
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      </ToastProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('login-btn'));
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('Demo Customer');
    expect(localStorage.getItem('quickcart_token')).toBe('test-jwt-token');
  });

  it('registers a new user and updates state', async () => {
    const mockRegResponse = {
      data: {
        id: 2,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        token: 'new-user-token',
        roles: ['ROLE_CUSTOMER'],
      },
    };
    vi.spyOn(authApi, 'register').mockResolvedValue(mockRegResponse);

    render(
      <ToastProvider>
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      </ToastProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('register-btn'));
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('Jane Doe');
  });

  it('clears user state and removes token on logout', async () => {
    localStorage.setItem('quickcart_token', 'sample-token');

    render(
      <ToastProvider>
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('logout-btn'));
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('Guest');
    expect(localStorage.getItem('quickcart_token')).toBeNull();
  });

  it('switches demo role to admin and updates state', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue({
      data: {
        id: 99,
        fullName: 'QuickCart Admin',
        email: 'admin@quickcart.com',
        token: 'admin-token',
        roles: ['ROLE_ADMIN'],
      },
    });

    render(
      <ToastProvider>
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      </ToastProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('switch-admin-btn'));
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('QuickCart Admin');
  });

  it('controls auth modal visibility and active mode', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      </ToastProvider>
    );

    expect(screen.getByTestId('modal-state')).toHaveTextContent('Modal-Closed');

    act(() => {
      fireEvent.click(screen.getByTestId('open-modal-btn'));
    });
    expect(screen.getByTestId('modal-state')).toHaveTextContent('Modal-register');

    act(() => {
      fireEvent.click(screen.getByTestId('close-modal-btn'));
    });
    expect(screen.getByTestId('modal-state')).toHaveTextContent('Modal-Closed');
  });
});
