package com.quickcart.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OrderStatusTest {

    @Test
    @DisplayName("Valid forward lifecycle transitions succeed")
    void testValidForwardTransitions() {
        assertTrue(OrderStatus.CREATED.canTransitionTo(OrderStatus.CONFIRMED));
        assertTrue(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.PACKING));
        assertTrue(OrderStatus.PACKING.canTransitionTo(OrderStatus.READY_FOR_PICKUP));
        assertTrue(OrderStatus.READY_FOR_PICKUP.canTransitionTo(OrderStatus.OUT_FOR_DELIVERY));
        assertTrue(OrderStatus.OUT_FOR_DELIVERY.canTransitionTo(OrderStatus.DELIVERED));
    }

    @Test
    @DisplayName("Illegal reverse transitions are rejected")
    void testIllegalReverseTransitions() {
        assertFalse(OrderStatus.DELIVERED.canTransitionTo(OrderStatus.PACKING));
        assertFalse(OrderStatus.DELIVERED.canTransitionTo(OrderStatus.OUT_FOR_DELIVERY));
        assertFalse(OrderStatus.OUT_FOR_DELIVERY.canTransitionTo(OrderStatus.CREATED));
        assertFalse(OrderStatus.CANCELLED.canTransitionTo(OrderStatus.CONFIRMED));
    }

    @Test
    @DisplayName("Cancellation from valid states is permitted")
    void testValidCancellation() {
        assertTrue(OrderStatus.CREATED.canTransitionTo(OrderStatus.CANCELLED));
        assertTrue(OrderStatus.PAYMENT_PENDING.canTransitionTo(OrderStatus.CANCELLED));
        assertTrue(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.CANCELLED));
        assertTrue(OrderStatus.PACKING.canTransitionTo(OrderStatus.CANCELLED));
        assertFalse(OrderStatus.DELIVERED.canTransitionTo(OrderStatus.CANCELLED));
    }
}
