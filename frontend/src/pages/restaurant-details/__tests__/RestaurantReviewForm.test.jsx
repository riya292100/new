import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RestaurantReviewForm from '../RestaurantReviewForm';

describe('RestaurantReviewForm Component', () => {
  it('renders sign in prompt when user is not authenticated', () => {
    const onOpenAuth = vi.fn();
    render(
      <RestaurantReviewForm
        user={null}
        newRating={5}
        setNewRating={vi.fn()}
        newComment=""
        setNewComment={vi.fn()}
        submittingReview={false}
        onSubmit={vi.fn()}
        onOpenAuth={onOpenAuth}
      />
    );

    expect(screen.getByText(/Sign in to leave a verified dining review/i)).toBeInTheDocument();
    const signInBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(signInBtn);
    expect(onOpenAuth).toHaveBeenCalledWith('LOGIN');
  });

  it('renders interactive review form for authenticated user', () => {
    const setNewRating = vi.fn();
    const setNewComment = vi.fn();
    const onSubmit = vi.fn((e) => e.preventDefault());

    render(
      <RestaurantReviewForm
        user={{ id: 1, name: 'Alice' }}
        newRating={4}
        setNewRating={setNewRating}
        newComment="Great food!"
        setNewComment={setNewComment}
        submittingReview={false}
        onSubmit={onSubmit}
        onOpenAuth={vi.fn()}
      />
    );

    expect(screen.getByText(/Your Rating:/i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/Share details of your dining experience/i);
    expect(input).toBeInTheDocument();

    const starBtn = screen.getByLabelText('Rate 5 stars');
    fireEvent.click(starBtn);
    expect(setNewRating).toHaveBeenCalledWith(5);

    const submitBtn = screen.getByRole('button', { name: /Post Review/i });
    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalled();
  });
});
