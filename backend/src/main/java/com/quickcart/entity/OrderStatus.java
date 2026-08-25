package com.quickcart.entity;

public enum OrderStatus {
    PLACED,
    ORDER_PLACED, // Backwards compatibility
    CONFIRMED,
    PACKING,
    PREPARING,    // Backwards compatibility
    PACKED,       // Backwards compatibility
    READY_FOR_PICKUP,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}
