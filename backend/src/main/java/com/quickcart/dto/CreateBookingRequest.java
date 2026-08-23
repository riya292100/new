package com.quickcart.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingRequest {

    @NotNull(message = "Restaurant ID is required")
    private Long restaurantId;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate bookingDate;

    @NotBlank(message = "Booking time is required")
    private String bookingTime;

    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "Guest count must be at least 1")
    @Max(value = 20, message = "Guest count cannot exceed 20 per reservation")
    private Integer numberOfGuests;

    private String seatingPreference; // e.g. "Indoor", "Outdoor / Patio", "Window", "Bar"

    @Size(max = 500, message = "Special request must be under 500 characters")
    private String specialRequest;
}
