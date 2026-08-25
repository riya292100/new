package com.quickcart.event;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public final class OrderEvents {

    @Value
    @Builder
    public static class OrderCreatedEvent implements DomainEvent {
        @Builder.Default
        String eventId = UUID.randomUUID().toString();
        @Builder.Default
        String eventType = "OrderCreated";
        @Builder.Default
        Instant timestamp = Instant.now();

        Long orderId;
        String orderNumber;
        Long customerId;
        String customerEmail;
        BigDecimal totalAmount;
        String paymentMethod;
        Integer itemCount;
    }

    @Value
    @Builder
    public static class OrderConfirmedEvent implements DomainEvent {
        @Builder.Default
        String eventId = UUID.randomUUID().toString();
        @Builder.Default
        String eventType = "OrderConfirmed";
        @Builder.Default
        Instant timestamp = Instant.now();

        Long orderId;
        String orderNumber;
        Long customerId;
        BigDecimal finalAmount;
        Long storeId;
    }

    @Value
    @Builder
    public static class OrderPackedEvent implements DomainEvent {
        @Builder.Default
        String eventId = UUID.randomUUID().toString();
        @Builder.Default
        String eventType = "OrderPacked";
        @Builder.Default
        Instant timestamp = Instant.now();

        Long orderId;
        String orderNumber;
        Long storeId;
    }

    @Value
    @Builder
    public static class DeliveryAssignedEvent implements DomainEvent {
        @Builder.Default
        String eventId = UUID.randomUUID().toString();
        @Builder.Default
        String eventType = "DeliveryAssigned";
        @Builder.Default
        Instant timestamp = Instant.now();

        Long orderId;
        String orderNumber;
        Long partnerId;
        String partnerName;
        String partnerPhone;
    }

    @Value
    @Builder
    public static class OrderDeliveredEvent implements DomainEvent {
        @Builder.Default
        String eventId = UUID.randomUUID().toString();
        @Builder.Default
        String eventType = "OrderDelivered";
        @Builder.Default
        Instant timestamp = Instant.now();

        Long orderId;
        String orderNumber;
        Long customerId;
        Long partnerId;
    }
}
