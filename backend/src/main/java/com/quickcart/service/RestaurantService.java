package com.quickcart.service;

import com.quickcart.dto.RestaurantDto;
import com.quickcart.entity.Restaurant;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.repository.RestaurantFavoriteRepository;
import com.quickcart.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantFavoriteRepository favoriteRepository;

    @Transactional(readOnly = true)
    public List<RestaurantDto> searchRestaurants(
            String query,
            String city,
            String country,
            String cuisine,
            String priceLevel,
            Boolean vegetarian,
            Boolean vegan,
            Boolean dineIn,
            Long currentUserId
    ) {
        log.info("Searching restaurants - query: '{}', city: '{}', cuisine: '{}'", query, city, cuisine);
        List<Restaurant> restaurants = restaurantRepository.searchRestaurants(
                query != null && query.trim().isEmpty() ? null : query,
                city != null && city.trim().isEmpty() ? null : city,
                country != null && country.trim().isEmpty() ? null : country,
                cuisine != null && cuisine.trim().isEmpty() ? null : cuisine,
                priceLevel != null && priceLevel.trim().isEmpty() ? null : priceLevel,
                vegetarian,
                vegan,
                dineIn
        );

        return restaurants.stream()
                .map(r -> mapToDto(r, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RestaurantDto getRestaurantById(Long id, Long currentUserId) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        return mapToDto(restaurant, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<String> getAvailableCuisines() {
        return restaurantRepository.findDistinctCuisines();
    }

    @Transactional(readOnly = true)
    public List<String> getAvailableCities() {
        return restaurantRepository.findDistinctCities();
    }

    public RestaurantDto mapToDto(Restaurant r, Long currentUserId) {
        boolean isFav = false;
        if (currentUserId != null) {
            isFav = favoriteRepository.existsByUserIdAndRestaurantId(currentUserId, r.getId());
        }

        List<String> gallery = Collections.emptyList();
        if (r.getGalleryImages() != null && !r.getGalleryImages().isBlank()) {
            gallery = Arrays.asList(r.getGalleryImages().split(","));
        }

        return RestaurantDto.builder()
                .id(r.getId())
                .name(r.getName())
                .slug(r.getSlug())
                .description(r.getDescription())
                .cuisine(r.getCuisine())
                .country(r.getCountry())
                .city(r.getCity())
                .address(r.getAddress())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .rating(r.getRating())
                .reviewCount(r.getReviewCount())
                .priceLevel(r.getPriceLevel())
                .imageUrl(r.getImageUrl())
                .galleryImages(gallery)
                .openingHours(r.getOpeningHours())
                .phone(r.getPhone())
                .website(r.getWebsite())
                .isVegetarianFriendly(r.getIsVegetarianFriendly())
                .isVeganFriendly(r.getIsVeganFriendly())
                .isDineInAvailable(r.getIsDineInAvailable())
                .isDeliveryAvailable(r.getIsDeliveryAvailable())
                .isTakeawayAvailable(r.getIsTakeawayAvailable())
                .isFavorite(isFav)
                .build();
    }
}
