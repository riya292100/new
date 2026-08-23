package com.quickcart.service;

import com.quickcart.dto.BookingResponseDto;
import com.quickcart.dto.CreateBookingRequest;
import com.quickcart.entity.BookingStatus;
import com.quickcart.entity.Restaurant;
import com.quickcart.entity.RestaurantBooking;
import com.quickcart.entity.User;
import com.quickcart.exception.BadRequestException;
import com.quickcart.repository.RestaurantBookingRepository;
import com.quickcart.repository.RestaurantRepository;
import com.quickcart.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private RestaurantBookingRepository bookingRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    private User mockUser;
    private Restaurant mockRestaurant;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .fullName("John Diner")
                .email("john@example.com")
                .build();

        mockRestaurant = Restaurant.builder()
                .id(10L)
                .name("Gramercy Tavern")
                .isDineInAvailable(true)
                .address("42 E 20th St, New York")
                .city("New York")
                .cuisine("American")
                .build();
    }

    @Test
    void createBooking_ShouldCreateReservationSuccessfully() {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .restaurantId(10L)
                .bookingDate(LocalDate.now().plusDays(2))
                .bookingTime("19:30")
                .numberOfGuests(4)
                .seatingPreference("Indoor")
                .specialRequest("Window table")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(restaurantRepository.findById(10L)).thenReturn(Optional.of(mockRestaurant));
        when(bookingRepository.existsByUserIdAndRestaurantIdAndBookingDateAndBookingTimeAndStatus(any(), any(), any(), any(), any()))
                .thenReturn(false);

        when(bookingRepository.save(any(RestaurantBooking.class))).thenAnswer(invocation -> {
            RestaurantBooking rb = invocation.getArgument(0);
            rb.setId(101L);
            return rb;
        });

        BookingResponseDto response = bookingService.createBooking(request, 1L);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
        assertEquals("Gramercy Tavern", response.getRestaurantName());
        assertTrue(response.getBookingReference().startsWith("QC-DINE-"));
    }

    @Test
    void createBooking_ShouldRejectPastBookingDate() {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .restaurantId(10L)
                .bookingDate(LocalDate.now().minusDays(1))
                .bookingTime("19:30")
                .numberOfGuests(2)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(restaurantRepository.findById(10L)).thenReturn(Optional.of(mockRestaurant));

        assertThrows(BadRequestException.class, () -> bookingService.createBooking(request, 1L));
    }
}
