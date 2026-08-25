package com.quickcart.event;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public final class PaymentEvents {

    @Value
    @Builder
    public static class PaymentCompletedEvent implements DomainEvent {
        @Builder.Default
        String eventId = UUID.randomUUID().toString();
        @Builder.Default
        String eventType = "PaymentCompleted";
        @Builder.Default
        Instant timestamp = Instant.now();

        Long paymentId;
        Long orderId;
        String transactionId;
        BigDecimal amount;
        String paymentGateway;
    }

    @Value
    @Builder
    public static class PaymentFailedEvent implements DomainEvent {
        @Builder.Default
        String eventId = UUID.randomUUID().toString();
        @Builder.Default
        String eventType = "PaymentFailed";
        @Builder.Default
        Instant timestamp = Instant.now();

        Long paymentId;
        Long orderId;
        String failureReason;
        BigDecimal amount;
    }

    @Value
    @Builder
    public static class RefundCreatedEvent implements DomainEvent {
        @Builder.Default
        String eventId = UUID.randomUUID().toString();
        @Builder.Default
        String eventType = "RefundCreated";
        @Builder.Default
        Instant timestamp = Instant.now();

        Long refundId;
        Long orderId;
        BigDecimal refundAmount;
        String reason;
        String refundMethod;
    }
}
