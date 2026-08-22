package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidationResponse {
    private Boolean isValid;
    private String code;
    private String description;
    private BigDecimal discountAmount;
    private String message;
}
