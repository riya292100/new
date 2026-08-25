package com.quickcart.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

public final class InventoryEvents {

    @Value
    @Builder
    public static class InventoryReservedEvent implements DomainEvent {
        @Builder.Default
        String eventId = UUID.randomUUID().toString();
        @Builder.Default
        String eventType = "InventoryReserved";
        @Builder.Default
        Instant timestamp = Instant.now();

        Long storeId;
        Long productId;
        Integer quantity;
        Long orderId;
        Instant expiresAt;
    }

    @Value
    @Builder
    public static class InventoryReleasedEvent implements DomainEvent {
        @Builder.Default
        String eventId = UUID.randomUUID().toString();
        @Builder.Default
        String eventType = "InventoryReleased";
        @Builder.Default
        Instant timestamp = Instant.now();

        Long storeId;
        Long productId;
        Integer quantity;
        String reason;
    }

    @Value
    @Builder
    public static class LowStockDetectedEvent implements DomainEvent {
        @Builder.Default
        String eventId = UUID.randomUUID().toString();
        @Builder.Default
        String eventType = "LowStockDetected";
        @Builder.Default
        Instant timestamp = Instant.now();

        Long storeId;
        Long productId;
        String productName;
        Integer currentStock;
        Integer reorderThreshold;
    }
}
