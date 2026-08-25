package com.quickcart.dto;

import com.quickcart.entity.PaymentMethod;
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
public class CreateOrderRequest {

    @NotNull(message = "Address ID is required")
    private Long addressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String couponCode;

    private String deliveryInstructions;

    private BigDecimal tipAmount = BigDecimal.ZERO;

    private BigDecimal walletAmountToRedeem = BigDecimal.ZERO;
}
