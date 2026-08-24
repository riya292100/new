import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RestaurantReviewList from '../RestaurantReviewList';

describe('RestaurantReviewList Component', () => {
  it('renders empty state when no reviews exist', () => {
    render(<RestaurantReviewList reviews={[]} />);
    expect(screen.getByText(/No reviews yet for this restaurant/i)).toBeInTheDocument();
  });

  it('renders list of reviews with user names and comments', () => {
    const reviews = [
      { id: 1, userName: 'John Doe', rating: 5, comment: 'Exceptional pasta and atmosphere!' },
      { id: 2, userName: 'Maria Rossi', rating: 4, comment: 'Lovely wine selection.' },
    ];

    render(<RestaurantReviewList reviews={reviews} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Exceptional pasta and atmosphere!')).toBeInTheDocument();
    expect(screen.getByText('Maria Rossi')).toBeInTheDocument();
    expect(screen.getByText('Lovely wine selection.')).toBeInTheDocument();
  });
});
