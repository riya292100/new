import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RoleSwitcher from '../RoleSwitcher';
import * as AuthContextModule from '../../context/AuthContext';

describe('RoleSwitcher Component', () => {
  it('renders logged in user name and role switch buttons', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { fullName: 'Demo Admin' },
      switchDemoRole: vi.fn(),
      isAdmin: true,
      isDeliveryPartner: false,
    });

    render(
      <MemoryRouter>
        <RoleSwitcher />
      </MemoryRouter>
    );

    expect(screen.getByText(/INSTANT DEMO MODE/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Customer/i)).toBeInTheDocument();
    expect(screen.getByText(/Partner App/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Portal/i)).toBeInTheDocument();
  });
});
