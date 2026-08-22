import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TimelineStages, { TIMELINE_STAGES } from '../TimelineStages';

describe('TimelineStages Component', () => {
  it('renders all 6 timeline stages for active order', () => {
    render(<TimelineStages status="PREPARING" />);

    TIMELINE_STAGES.forEach((stage) => {
      expect(screen.getByText(new RegExp(stage.label, 'i'))).toBeInTheDocument();
    });

    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
  });

  it('renders cancellation notice when order is CANCELLED', () => {
    render(<TimelineStages status="CANCELLED" />);

    expect(screen.getByText(/Order was cancelled/i)).toBeInTheDocument();
    expect(screen.getByText(/Inventory restored/i)).toBeInTheDocument();
  });

  it('renders correctly for DELIVERED final stage', () => {
    render(<TimelineStages status="DELIVERED" />);

    const deliveredIndicator = screen.getByTestId('stage-indicator-DELIVERED');
    expect(deliveredIndicator).toBeInTheDocument();
  });
});
