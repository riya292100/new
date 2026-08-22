import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OfflineNotice from '../OfflineNotice';

describe('OfflineNotice Component', () => {
  it('does not render when online', () => {
    const { container } = render(<OfflineNotice />);
    expect(container.firstChild).toBeNull();
  });

  it('renders offline warning when network drops', () => {
    render(<OfflineNotice />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText(/You are currently offline/i)).toBeInTheDocument();
  });
});
