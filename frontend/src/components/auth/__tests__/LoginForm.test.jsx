import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '../LoginForm';

describe('LoginForm Component', () => {
  it('renders login form inputs, submit button, and quick fill bar', () => {
    const setEmail = vi.fn();
    const setPassword = vi.fn();
    const onSubmit = vi.fn((e) => e.preventDefault());
    const onQuickFill = vi.fn();
    const onSwitchToRegister = vi.fn();

    render(
      <LoginForm
        email="test@example.com"
        setEmail={setEmail}
        password="secret"
        setPassword={setPassword}
        loading={false}
        onSubmit={onSubmit}
        onQuickFill={onQuickFill}
        onSwitchToRegister={onSwitchToRegister}
      />
    );

    expect(screen.getByLabelText(/Email Address/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/Password/i)).toHaveValue('secret');

    const customerBtn = screen.getByRole('button', { name: /Customer/i });
    fireEvent.click(customerBtn);
    expect(onQuickFill).toHaveBeenCalledWith('customer');

    const registerBtn = screen.getByRole('button', { name: /Create an Account/i });
    fireEvent.click(registerBtn);
    expect(onSwitchToRegister).toHaveBeenCalled();

    const submitBtn = screen.getByRole('button', { name: /Sign In & Continue/i });
    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalled();
  });
});
