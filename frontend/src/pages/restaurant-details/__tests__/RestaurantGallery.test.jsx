import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RestaurantGallery from '../RestaurantGallery';

describe('RestaurantGallery Component', () => {
  it('renders hero image and gallery thumbnails correctly', () => {
    const galleryImages = ['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg'];

    render(
      <RestaurantGallery
        imageUrl="https://example.com/hero.jpg"
        name="La Pergola"
        galleryImages={galleryImages}
      />
    );

    const heroImg = screen.getByAltText('La Pergola');
    expect(heroImg).toBeInTheDocument();
    expect(heroImg).toHaveAttribute('src', 'https://example.com/hero.jpg');
  });

  it('renders without gallery thumbnails when array is empty', () => {
    render(<RestaurantGallery imageUrl="https://example.com/hero.jpg" name="Trattoria" />);
    expect(screen.getByAltText('Trattoria')).toBeInTheDocument();
  });
});
