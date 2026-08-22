package com.quickcart.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class CouponValidationRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Order item total is required")
    @DecimalMin(value = "0.0", message = "Order total cannot be negative")
    private BigDecimal itemTotal;
}
