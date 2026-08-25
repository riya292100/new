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
public class WalletRedeemRequest {

    @NotNull(message = "Order amount is required")
    private BigDecimal orderAmount;

    private BigDecimal amountToRedeem;
}
