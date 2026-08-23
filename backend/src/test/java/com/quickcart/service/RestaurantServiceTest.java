package com.quickcart.service;

import com.quickcart.dto.RestaurantDto;
import com.quickcart.entity.Restaurant;
import com.quickcart.repository.RestaurantFavoriteRepository;
import com.quickcart.repository.RestaurantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RestaurantServiceTest {

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private RestaurantFavoriteRepository favoriteRepository;

    @InjectMocks
    private RestaurantService restaurantService;

    private Restaurant mockRestaurant;

    @BeforeEach
    void setUp() {
        mockRestaurant = Restaurant.builder()
                .id(1L)
                .name("Trattoria da Enzo al 29")
                .slug("trattoria-da-enzo-rome")
                .cuisine("Italian")
                .city("Rome")
                .country("Italy")
                .address("Via dei Vascellari, 29")
                .rating(4.9)
                .reviewCount(340)
                .priceLevel("$$")
                .isDineInAvailable(true)
                .isVegetarianFriendly(true)
                .active(true)
                .build();
    }

    @Test
    void searchRestaurants_ShouldReturnMatchingRestaurants() {
        when(restaurantRepository.searchRestaurants(any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(mockRestaurant));
        when(favoriteRepository.existsByUserIdAndRestaurantId(1L, 1L)).thenReturn(false);

        List<RestaurantDto> results = restaurantService.searchRestaurants(
                "Enzo", "Rome", "Italy", "Italian", "$$", true, null, true, 1L
        );

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Trattoria da Enzo al 29", results.get(0).getName());
        assertEquals("Rome", results.get(0).getCity());
    }

    @Test
    void getRestaurantById_ShouldReturnRestaurantWhenExists() {
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(mockRestaurant));

        RestaurantDto result = restaurantService.getRestaurantById(1L, null);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Italian", result.getCuisine());
    }
}
