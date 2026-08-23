package com.quickcart.service;

import com.quickcart.dto.CreateRestaurantReviewRequest;
import com.quickcart.dto.RestaurantReviewDto;
import com.quickcart.entity.Restaurant;
import com.quickcart.entity.RestaurantReview;
import com.quickcart.entity.User;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.RestaurantRepository;
import com.quickcart.repository.RestaurantReviewRepository;
import com.quickcart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestaurantReviewService {

    private final RestaurantReviewRepository reviewRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RestaurantReviewDto> getReviewsForRestaurant(Long restaurantId) {
        return reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RestaurantReviewDto addReview(CreateRestaurantReviewRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        if (reviewRepository.existsByUserIdAndRestaurantId(userId, request.getRestaurantId())) {
            throw new BadRequestException("You have already submitted a review for this dining establishment.");
        }

        RestaurantReview review = RestaurantReview.builder()
                .restaurant(restaurant)
                .user(user)
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .build();

        RestaurantReview saved = reviewRepository.save(review);

        // Update average rating and review count
        List<RestaurantReview> allReviews = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurant.getId());
        double avg = allReviews.stream().mapToInt(RestaurantReview::getRating).average().orElse(5.0);
        restaurant.setRating(Math.round(avg * 10.0) / 10.0);
        restaurant.setReviewCount(allReviews.size());
        restaurantRepository.save(restaurant);

        return mapToDto(saved);
    }

    private RestaurantReviewDto mapToDto(RestaurantReview r) {
        return RestaurantReviewDto.builder()
                .id(r.getId())
                .restaurantId(r.getRestaurant().getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getFullName() != null ? r.getUser().getFullName() : "Verified Diner")
                .rating(r.getRating())
                .title(r.getTitle())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
