package com.quickcart.repository;

import com.quickcart.entity.RestaurantFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantFavoriteRepository extends JpaRepository<RestaurantFavorite, Long> {

    List<RestaurantFavorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<RestaurantFavorite> findByUserIdAndRestaurantId(Long userId, Long restaurantId);

    boolean existsByUserIdAndRestaurantId(Long userId, Long restaurantId);

    void deleteByUserIdAndRestaurantId(Long userId, Long restaurantId);
}
