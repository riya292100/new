package com.quickcart.service;

import com.quickcart.dto.RestaurantDto;
import com.quickcart.entity.Restaurant;
import com.quickcart.entity.RestaurantFavorite;
import com.quickcart.entity.User;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.RestaurantFavoriteRepository;
import com.quickcart.repository.RestaurantRepository;
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
public class RestaurantFavoriteService {

    private final RestaurantFavoriteRepository favoriteRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final RestaurantService restaurantService;

    @Transactional(readOnly = true)
    public List<RestaurantDto> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(fav -> restaurantService.mapToDto(fav.getRestaurant(), userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean toggleFavorite(Long restaurantId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        boolean exists = favoriteRepository.existsByUserIdAndRestaurantId(userId, restaurantId);
        if (exists) {
            favoriteRepository.deleteByUserIdAndRestaurantId(userId, restaurantId);
            log.info("Removed restaurant {} from favorites for user {}", restaurantId, userId);
            return false;
        } else {
            RestaurantFavorite fav = RestaurantFavorite.builder()
                    .user(user)
                    .restaurant(restaurant)
                    .build();
            favoriteRepository.save(fav);
            log.info("Added restaurant {} to favorites for user {}", restaurantId, userId);
            return true;
        }
    }
}
