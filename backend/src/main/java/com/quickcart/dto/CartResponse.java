package com.quickcart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private Long id;
    private List<CartItemResponse> items = new ArrayList<>();
    private Integer totalItems = 0;
    private BigDecimal itemTotal = BigDecimal.ZERO;
    private BigDecimal mrpTotal = BigDecimal.ZERO;
    private BigDecimal savings = BigDecimal.ZERO;
    private BigDecimal deliveryFee = BigDecimal.ZERO;
    private BigDecimal platformFee = BigDecimal.valueOf(5.0);
    private BigDecimal taxAmount = BigDecimal.ZERO;
    private BigDecimal grandTotal = BigDecimal.ZERO;
    private Boolean freeDeliveryUnlocked = false;
    private BigDecimal amountNeededForFreeDelivery = BigDecimal.ZERO;
}
