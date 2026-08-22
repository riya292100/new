import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PwaInstallPrompt from '../PwaInstallPrompt';

describe('PwaInstallPrompt Component', () => {
  it('displays install prompt when beforeinstallprompt event is fired', () => {
    sessionStorage.clear();
    render(<PwaInstallPrompt />);

    const promptEvent = new Event('beforeinstallprompt');
    promptEvent.prompt = vi.fn();
    promptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

    act(() => {
      window.dispatchEvent(promptEvent);
    });

    expect(screen.getByText(/QuickCart App/i)).toBeInTheDocument();
    expect(screen.getByText(/Install App/i)).toBeInTheDocument();
  });
});
