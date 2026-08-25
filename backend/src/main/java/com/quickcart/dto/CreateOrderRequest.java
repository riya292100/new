package com.quickcart.dto;

import com.quickcart.entity.PaymentMethod;
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
public class CreateOrderRequest {

    @NotNull(message = "Address ID is required")
    private Long addressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String couponCode;

    private String deliveryInstructions;

    private String idempotencyKey;

    @Builder.Default
    private BigDecimal tipAmount = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal walletAmountToRedeem = BigDecimal.ZERO;
}
