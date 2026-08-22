package com.quickcart.dto;

import com.quickcart.entity.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CouponDto {
    private Long id;

    @NotBlank(message = "Coupon code is required")
    private String code;

    private String description;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    private BigDecimal discountValue;

    private BigDecimal minOrderValue = BigDecimal.ZERO;
    private BigDecimal maxDiscountAmount;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Integer usageLimit;
    private Integer timesUsed;
    private Boolean isActive = true;
}
