package com.quickcart.repository;

import com.quickcart.entity.BookingStatus;
import com.quickcart.entity.RestaurantBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantBookingRepository extends JpaRepository<RestaurantBooking, Long> {

    List<RestaurantBooking> findByUserIdOrderByBookingDateDescCreatedAtDesc(Long userId);

    Optional<RestaurantBooking> findByBookingReference(String bookingReference);

    Optional<RestaurantBooking> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndRestaurantIdAndBookingDateAndBookingTimeAndStatus(
            Long userId,
            Long restaurantId,
            LocalDate bookingDate,
            String bookingTime,
            BookingStatus status
    );

    List<RestaurantBooking> findByRestaurantIdAndBookingDateAndStatus(
            Long restaurantId,
            LocalDate bookingDate,
            BookingStatus status
    );
}
