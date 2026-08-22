package com.quickcart.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryLocationUpdateDto {

    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;
}
