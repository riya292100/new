package com.quickcart.service;

import com.quickcart.dto.ReviewRequestDto;
import com.quickcart.dto.ReviewResponseDto;
import com.quickcart.entity.Product;
import com.quickcart.entity.Review;
import com.quickcart.entity.User;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.ProductRepository;
import com.quickcart.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final AuthService authService;

    public List<ReviewResponseDto> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponseDto addReview(ReviewRequestDto dto) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));

        if (reviewRepository.existsByUserIdAndProductId(currentUser.getId(), product.getId())) {
            throw new BadRequestException("You have already reviewed this product.");
        }

        Review review = new Review();
        review.setUser(currentUser);
        review.setProduct(product);
        review.setOrderId(dto.getOrderId());
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        Review saved = reviewRepository.save(review);

        // Recalculate product rating
        List<Review> allReviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        double avg = allReviews.stream().mapToInt(Review::getRating).average().orElse(dto.getRating());
        product.setRating(BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP));
        product.setRatingCount(allReviews.size());
        productRepository.save(product);

        return mapToDto(saved);
    }

    private ReviewResponseDto mapToDto(Review review) {
        return new ReviewResponseDto(
                review.getId(),
                review.getProduct().getId(),
                review.getProduct().getName(),
                review.getUser().getId(),
                review.getUser().getFullName(),
                review.getUser().getAvatarUrl(),
                review.getOrderId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
