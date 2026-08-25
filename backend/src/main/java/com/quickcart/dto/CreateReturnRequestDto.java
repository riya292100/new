package com.quickcart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReturnRequestDto {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotBlank(message = "Return reason is required")
    private String reason;

    private BigDecimal requestedRefundAmount;
}
