import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from '../ErrorBoundary';
import logger from '../../utils/logger';

const FaultyComponent = () => {
  throw new Error('Test crash in child component');
};

describe('ErrorBoundary Component', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe Content')).toBeInTheDocument();
  });

  it('catches render errors, displays fallback UI, and triggers logger and onError callback', () => {
    const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
    const onErrorMock = vi.fn();

    render(
      <ErrorBoundary onError={onErrorMock}>
        <FaultyComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Reload Page/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Store/i)).toBeInTheDocument();

    expect(loggerSpy).toHaveBeenCalledWith(
      'ErrorBoundary',
      'Uncaught component error in render tree',
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
    expect(onErrorMock).toHaveBeenCalled();

    loggerSpy.mockRestore();
  });

  it('supports custom fallback render prop and reset recovery', () => {
    const onResetMock = vi.fn();
    const customFallback = ({ error, resetError }) => (
      <div>
        <span>Custom error: {error.message}</span>
        <button onClick={resetError}>Try Again</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={customFallback} onReset={onResetMock}>
        <FaultyComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Custom error: Test crash in child component/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Try Again'));
    expect(onResetMock).toHaveBeenCalled();
  });
});
