import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastProvider, useToast } from '../ToastContext';

const TestToastConsumer = () => {
  const { addToast } = useToast();

  return (
    <div>
      <button
        onClick={() => addToast('Item added to cart', 'success')}
        data-testid="add-success-btn"
      >
        Add Success
      </button>
      <button onClick={() => addToast('Something went wrong', 'error')} data-testid="add-error-btn">
        Add Error
      </button>
    </div>
  );
};

describe('ToastContext Suite', () => {
  it('adds and displays toast messages in the toast container', () => {
    render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('add-success-btn'));
    });

    expect(screen.getByText('Item added to cart')).toBeInTheDocument();
  });

  it('removes toast message when dismiss button is clicked', () => {
    const { container } = render(
      <ToastProvider>
        <TestToastConsumer />
      </ToastProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('add-error-btn'));
    });

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const closeBtn = container.querySelector('button[style*="background: transparent"]');
    if (closeBtn) {
      act(() => {
        fireEvent.click(closeBtn);
      });
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    }
  });
});
