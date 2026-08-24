import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RegisterForm from '../RegisterForm';

describe('RegisterForm Component', () => {
  it('renders registration fields, role selector, and submit action', () => {
    const setFullName = vi.fn();
    const setEmail = vi.fn();
    const setPhone = vi.fn();
    const setPassword = vi.fn();
    const setSelectedRole = vi.fn();
    const onSubmit = vi.fn((e) => e.preventDefault());
    const onSwitchToLogin = vi.fn();

    render(
      <RegisterForm
        fullName="Jane Doe"
        setFullName={setFullName}
        email="jane@example.com"
        setEmail={setEmail}
        phone="9876543210"
        setPhone={setPhone}
        password="pass"
        setPassword={setPassword}
        selectedRole="customer"
        setSelectedRole={setSelectedRole}
        loading={false}
        onSubmit={onSubmit}
        onSwitchToLogin={onSwitchToLogin}
      />
    );

    expect(screen.getByLabelText(/Full Name/i)).toHaveValue('Jane Doe');
    expect(screen.getByLabelText(/Email Address/i)).toHaveValue('jane@example.com');
    expect(screen.getByLabelText(/10-Digit Mobile Number/i)).toHaveValue('9876543210');

    const driverRoleBtn = screen.getByRole('button', { name: /Delivery Partner/i });
    fireEvent.click(driverRoleBtn);
    expect(setSelectedRole).toHaveBeenCalledWith('driver');

    const signinBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(signinBtn);
    expect(onSwitchToLogin).toHaveBeenCalled();

    const submitBtn = screen.getByRole('button', { name: /Create My Account/i });
    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalled();
  });
});
