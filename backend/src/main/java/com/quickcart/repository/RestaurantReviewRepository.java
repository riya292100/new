package com.quickcart.repository;

import com.quickcart.entity.RestaurantReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantReviewRepository extends JpaRepository<RestaurantReview, Long> {

    List<RestaurantReview> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);

    boolean existsByUserIdAndRestaurantId(Long userId, Long restaurantId);
}
