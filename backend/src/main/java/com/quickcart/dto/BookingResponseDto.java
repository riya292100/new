package com.quickcart.dto;

import com.quickcart.entity.BookingStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDto {
    private Long id;
    private String bookingReference;
    private Long restaurantId;
    private String restaurantName;
    private String restaurantAddress;
    private String restaurantCity;
    private String restaurantCuisine;
    private String restaurantPhone;
    private String restaurantImageUrl;
    private LocalDate bookingDate;
    private String bookingTime;
    private Integer numberOfGuests;
    private String seatingPreference;
    private String specialRequest;
    private BookingStatus status;
    private LocalDateTime createdAt;
}
