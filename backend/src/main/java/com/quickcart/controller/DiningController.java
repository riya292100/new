package com.quickcart.controller;

import com.quickcart.dto.*;
import com.quickcart.entity.User;
import com.quickcart.security.UserDetailsImpl;
import com.quickcart.service.AuthService;
import com.quickcart.service.BookingService;
import com.quickcart.service.RestaurantFavoriteService;
import com.quickcart.service.RestaurantReviewService;
import com.quickcart.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dining")
@RequiredArgsConstructor
@Tag(name = "QuickCart Dining", description = "Global restaurant discovery, search, reservation booking, reviews, and favorites")
public class DiningController {

    private final RestaurantService restaurantService;
    private final BookingService bookingService;
    private final RestaurantReviewService reviewService;
    private final RestaurantFavoriteService favoriteService;
    private final AuthService authService;

    private Long getOptionalUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) auth.getPrincipal()).getId();
        }
        return null;
    }

    // ==========================================
    // RESTAURANT DISCOVERY & SEARCH
    // ==========================================

    @GetMapping("/restaurants")
    @Operation(summary = "Search and filter restaurants globally with multi-faceted criteria")
    public ResponseEntity<ApiResponse<List<RestaurantDto>>> searchRestaurants(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) String priceLevel,
            @RequestParam(required = false) Boolean vegetarian,
            @RequestParam(required = false) Boolean vegan,
            @RequestParam(required = false) Boolean dineIn
    ) {
        Long currentUserId = getOptionalUserId();
        List<RestaurantDto> results = restaurantService.searchRestaurants(
                query, city, country, cuisine, priceLevel, vegetarian, vegan, dineIn, currentUserId
        );
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/restaurants/{id}")
    @Operation(summary = "Get detailed restaurant profile, menu, and facilities")
    public ResponseEntity<ApiResponse<RestaurantDto>> getRestaurantById(@PathVariable Long id) {
        Long currentUserId = getOptionalUserId();
        RestaurantDto restaurant = restaurantService.getRestaurantById(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(restaurant));
    }

    @GetMapping("/cuisines")
    @Operation(summary = "Get list of all distinct cuisines available globally")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableCuisines() {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getAvailableCuisines()));
    }

    @GetMapping("/cities")
    @Operation(summary = "Get list of all distinct cities with dining partners")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableCities() {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getAvailableCities()));
    }

    // ==========================================
    // TABLE RESERVATIONS / BOOKING
    // ==========================================

    @PostMapping("/bookings")
    @Operation(summary = "Book a table reservation at a dining partner (Authenticated)")
    public ResponseEntity<ApiResponse<BookingResponseDto>> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        BookingResponseDto booking = bookingService.createBooking(request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Table reservation confirmed successfully", booking));
    }

    @GetMapping("/bookings/my-bookings")
    @Operation(summary = "Get all table reservations for the current authenticated user")
    public ResponseEntity<ApiResponse<List<BookingResponseDto>>> getMyBookings() {
        User user = authService.getCurrentAuthenticatedUser();
        List<BookingResponseDto> bookings = bookingService.getUserBookings(user.getId());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/bookings/ref/{reference}")
    @Operation(summary = "Get reservation details by booking reference code")
    public ResponseEntity<ApiResponse<BookingResponseDto>> getBookingByReference(@PathVariable String reference) {
        User user = authService.getCurrentAuthenticatedUser();
        BookingResponseDto booking = bookingService.getBookingByReference(reference, user.getId());
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @PutMapping("/bookings/{id}/cancel")
    @Operation(summary = "Cancel an existing table reservation (Authenticated)")
    public ResponseEntity<ApiResponse<BookingResponseDto>> cancelBooking(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        BookingResponseDto cancelled = bookingService.cancelBooking(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled successfully", cancelled));
    }

    // ==========================================
    // RESTAURANT REVIEWS
    // ==========================================

    @GetMapping("/restaurants/{restaurantId}/reviews")
    @Operation(summary = "Get reviews for a dining partner")
    public ResponseEntity<ApiResponse<List<RestaurantReviewDto>>> getRestaurantReviews(@PathVariable Long restaurantId) {
        List<RestaurantReviewDto> reviews = reviewService.getReviewsForRestaurant(restaurantId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PostMapping("/reviews")
    @Operation(summary = "Submit a verified review for a restaurant (Authenticated)")
    public ResponseEntity<ApiResponse<RestaurantReviewDto>> submitRestaurantReview(
            @Valid @RequestBody CreateRestaurantReviewRequest request
    ) {
        User user = authService.getCurrentAuthenticatedUser();
        RestaurantReviewDto review = reviewService.addReview(request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Review posted successfully", review));
    }

    // ==========================================
    // FAVORITE RESTAURANTS
    // ==========================================

    @GetMapping("/favorites")
    @Operation(summary = "Get user's favorite dining spots (Authenticated)")
    public ResponseEntity<ApiResponse<List<RestaurantDto>>> getFavoriteRestaurants() {
        User user = authService.getCurrentAuthenticatedUser();
        List<RestaurantDto> favorites = favoriteService.getUserFavorites(user.getId());
        return ResponseEntity.ok(ApiResponse.success(favorites));
    }

    @PostMapping("/favorites/{restaurantId}/toggle")
    @Operation(summary = "Toggle favorite status for a restaurant (Authenticated)")
    public ResponseEntity<ApiResponse<Boolean>> toggleFavorite(@PathVariable Long restaurantId) {
        User user = authService.getCurrentAuthenticatedUser();
        boolean isFav = favoriteService.toggleFavorite(restaurantId, user.getId());
        String msg = isFav ? "Added to favorite dining spots" : "Removed from favorites";
        return ResponseEntity.ok(ApiResponse.success(msg, isFav));
    }
}
