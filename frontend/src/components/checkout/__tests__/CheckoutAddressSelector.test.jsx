import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutAddressSelector from '../CheckoutAddressSelector';

describe('CheckoutAddressSelector Component', () => {
  const mockSetSelectedAddressId = vi.fn();
  const mockSetShowNewAddressForm = vi.fn();
  const mockSetNewAddress = vi.fn();
  const mockOnCreateAddress = vi.fn((e) => e.preventDefault());

  const dummyAddresses = [
    {
      id: 1,
      label: 'Home',
      receiverName: 'John Doe',
      receiverPhone: '9876543210',
      streetAddress: '123 MG Road',
      apartmentUnit: 'Apt 4B',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      isDefault: true,
    },
  ];

  const dummyNewAddress = {
    label: 'Work',
    receiverName: 'John Doe',
    receiverPhone: '9876543210',
    streetAddress: '',
    apartmentUnit: '',
    landmark: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    isDefault: false,
  };

  it('renders existing addresses and toggles new address form', () => {
    render(
      <CheckoutAddressSelector
        addresses={dummyAddresses}
        selectedAddressId={1}
        setSelectedAddressId={mockSetSelectedAddressId}
        showNewAddressForm={false}
        setShowNewAddressForm={mockSetShowNewAddressForm}
        newAddress={dummyNewAddress}
        setNewAddress={mockSetNewAddress}
        onCreateAddress={mockOnCreateAddress}
      />
    );

    expect(screen.getByText('Select Delivery Location')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/123 MG Road/i)).toBeInTheDocument();

    const addBtn = screen.getByRole('button', { name: /Add New/i });
    fireEvent.click(addBtn);

    expect(mockSetShowNewAddressForm).toHaveBeenCalledWith(true);
  });
});
