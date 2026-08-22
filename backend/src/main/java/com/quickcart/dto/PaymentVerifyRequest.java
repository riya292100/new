package com.quickcart.dto;

import com.quickcart.entity.PaymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotBlank(message = "Transaction ID is required")
    private String transactionId;

    private PaymentStatus status = PaymentStatus.COMPLETED;

    private String signature;
}
