package com.quickcart.dto;

import com.quickcart.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    private String transactionId;
    private String gatewayOrderId;
    private String gatewayPaymentId;
    private String gatewaySignature;
    private String signature;
    @Builder.Default
    private PaymentStatus status = PaymentStatus.COMPLETED;

    public String getGatewaySignature() {
        return gatewaySignature != null ? gatewaySignature : signature;
    }
}
