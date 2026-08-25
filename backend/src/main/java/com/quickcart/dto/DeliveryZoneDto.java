package com.quickcart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryZoneDto {
    private Long id;

    @NotBlank(message = "Zone code is required")
    private String zoneCode;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "City is required")
    private String city;

    @NotNull(message = "Center latitude is required")
    private BigDecimal centerLatitude;

    @NotNull(message = "Center longitude is required")
    private BigDecimal centerLongitude;

    @Builder.Default
    private BigDecimal radiusKm = BigDecimal.valueOf(8.0);

    @Builder.Default
    private Boolean isActive = true;
}
