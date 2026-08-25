package com.quickcart.entity;

public enum OrderStatus {
    // Production state machine lifecycle
    CREATED,
    PAYMENT_PENDING,
    CONFIRMED,
    PACKING,
    READY_FOR_PICKUP,
    OUT_FOR_DELIVERY,
    DELIVERED,

    // Alternative / Terminal States
    CANCELLED,
    PAYMENT_FAILED,
    REFUND_PENDING,
    REFUNDED,
    DELIVERY_FAILED,

    // Backwards compatibility aliases
    PLACED,
    ORDER_PLACED,
    PREPARING,
    PACKED;

    public boolean canTransitionTo(OrderStatus target) {
        if (this == target) return true;

        switch (this) {
            case CREATED:
                return target == PAYMENT_PENDING || target == CONFIRMED || target == CANCELLED || target == PAYMENT_FAILED;
            case PAYMENT_PENDING:
                return target == CONFIRMED || target == PAYMENT_FAILED || target == CANCELLED;
            case PLACED:
            case ORDER_PLACED:
            case CONFIRMED:
                return target == PACKING || target == PREPARING || target == PACKED || target == READY_FOR_PICKUP || target == CANCELLED;
            case PACKING:
            case PREPARING:
            case PACKED:
                return target == READY_FOR_PICKUP || target == OUT_FOR_DELIVERY || target == CANCELLED;
            case READY_FOR_PICKUP:
                return target == OUT_FOR_DELIVERY || target == CANCELLED;
            case OUT_FOR_DELIVERY:
                return target == DELIVERED || target == DELIVERY_FAILED;
            case DELIVERY_FAILED:
                return target == OUT_FOR_DELIVERY || target == CANCELLED || target == REFUND_PENDING;
            case CANCELLED:
                return target == REFUND_PENDING || target == REFUNDED;
            case REFUND_PENDING:
                return target == REFUNDED;
            case DELIVERED:
            case REFUNDED:
            case PAYMENT_FAILED:
                return false; // Terminal states
            default:
                return true;
        }
    }
}

