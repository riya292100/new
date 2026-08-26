import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DriverStatsGrid from '../DriverStatsGrid';

describe('DriverStatsGrid Component', () => {
  it('renders total deliveries, driver rating and vehicle registration', () => {
    const profile = {
      totalDeliveries: 156,
      rating: 4.95,
      vehicleNumber: 'KA-01-QC-9900',
      vehicleType: 'ATHER_450X',
    };

    render(<DriverStatsGrid profile={profile} />);

    expect(screen.getByTestId('driver-stats-grid')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
    expect(screen.getByText(/4.95/i)).toBeInTheDocument();
    expect(screen.getByText('KA-01-QC-9900')).toBeInTheDocument();
  });
});
