package com.quickcart.service;

import com.quickcart.dto.BookingResponseDto;
import com.quickcart.dto.CreateBookingRequest;
import com.quickcart.entity.BookingStatus;
import com.quickcart.entity.Restaurant;
import com.quickcart.entity.RestaurantBooking;
import com.quickcart.entity.User;
import com.quickcart.exception.BadRequestException;
import com.quickcart.exception.ResourceNotFoundException;
import com.quickcart.exception.UnauthorizedException;
import com.quickcart.repository.RestaurantBookingRepository;
import com.quickcart.repository.RestaurantRepository;
import com.quickcart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final RestaurantBookingRepository bookingRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponseDto createBooking(CreateBookingRequest request, Long userId) {
        log.info("Creating table reservation for user {} at restaurant {}", userId, request.getRestaurantId());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + request.getRestaurantId()));

        if (!Boolean.TRUE.equals(restaurant.getIsDineInAvailable())) {
            throw new BadRequestException("This restaurant does not currently accept dine-in table reservations.");
        }

        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Booking date cannot be in the past.");
        }

        if (request.getNumberOfGuests() < 1 || request.getNumberOfGuests() > 20) {
            throw new BadRequestException("Guest count must be between 1 and 20.");
        }

        // Prevent duplicate concurrent reservations for the same user at same slot
        boolean duplicate = bookingRepository.existsByUserIdAndRestaurantIdAndBookingDateAndBookingTimeAndStatus(
                userId,
                request.getRestaurantId(),
                request.getBookingDate(),
                request.getBookingTime(),
                BookingStatus.CONFIRMED
        );

        if (duplicate) {
            throw new BadRequestException("You already have an active table reservation for this restaurant at the selected time slot.");
        }

        String reference = "QC-DINE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        RestaurantBooking booking = RestaurantBooking.builder()
                .bookingReference(reference)
                .user(user)
                .restaurant(restaurant)
                .bookingDate(request.getBookingDate())
                .bookingTime(request.getBookingTime())
                .numberOfGuests(request.getNumberOfGuests())
                .seatingPreference(request.getSeatingPreference() != null ? request.getSeatingPreference() : "Indoor Dining")
                .specialRequest(request.getSpecialRequest())
                .status(BookingStatus.CONFIRMED)
                .build();

        RestaurantBooking saved = bookingRepository.save(booking);
        log.info("Successfully created table reservation {} for restaurant {}", saved.getBookingReference(), restaurant.getName());

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByBookingDateDescCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponseDto getBookingByReference(String reference, Long userId) {
        RestaurantBooking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with reference: " + reference));

        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to view this booking.");
        }

        return mapToDto(booking);
    }

    @Transactional
    public BookingResponseDto cancelBooking(Long bookingId, Long userId) {
        RestaurantBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + bookingId));

        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to cancel this booking.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("This reservation has already been cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        RestaurantBooking updated = bookingRepository.save(booking);
        log.info("Cancelled booking reference {}", updated.getBookingReference());
        return mapToDto(updated);
    }

    private BookingResponseDto mapToDto(RestaurantBooking b) {
        return BookingResponseDto.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .restaurantId(b.getRestaurant().getId())
                .restaurantName(b.getRestaurant().getName())
                .restaurantAddress(b.getRestaurant().getAddress())
                .restaurantCity(b.getRestaurant().getCity())
                .restaurantCuisine(b.getRestaurant().getCuisine())
                .restaurantPhone(b.getRestaurant().getPhone())
                .restaurantImageUrl(b.getRestaurant().getImageUrl())
                .bookingDate(b.getBookingDate())
                .bookingTime(b.getBookingTime())
                .numberOfGuests(b.getNumberOfGuests())
                .seatingPreference(b.getSeatingPreference())
                .specialRequest(b.getSpecialRequest())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
